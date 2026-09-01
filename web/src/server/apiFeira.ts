/*
 * API da Feira de Profissões.
 *
 * Banco utilizado: MySQL.
 * O acesso ao banco é feito pelo adaptador getMySqlDatabase(),
 * mantendo uma interface semelhante à API anterior baseada em D1.
 */

import { getMySqlDatabase } from "./mysql";

type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  run: () => Promise<{ meta: { changes?: number } }>;
  all: <T>() => Promise<{ results: T[] }>;
  first: <T>() => Promise<T | null>;
};

type D1Database = {
  prepare: (query: string) => D1Statement;
};

type VisitanteLinha = {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  vinculo: string;
  como_soube: string;
  genero: string;
  curso_interesse: string;
  codigo_qr: string;
  qr_code_svg: string | null;
  criado_em: string;
  atualizado_em: string;
};

type PresencaLinha = {
  id: string;
  visitante_id: string;
  codigo_qr: string;
  setor: string;
  registrado_em: string;
};

const CAMPOS_EDITAVEIS = [
  "nome",
  "email",
  "cpf",
  "telefone",
  "vinculo",
  "comoSoube",
  "genero",
  "cursoInteresse",
] as const;

const COLUNAS_EDITAVEIS: Record<(typeof CAMPOS_EDITAVEIS)[number], string> = {
  nome: "nome",
  email: "email",
  cpf: "cpf",
  telefone: "telefone",
  vinculo: "vinculo",
  comoSoube: "como_soube",
  genero: "genero",
  cursoInteresse: "curso_interesse",
};

const LIMITE_QR_SVG = 30000;

/* =========================
   RESPOSTAS HTTP
========================= */

function json(dados: unknown, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function erro(mensagem: string, status: number) {
  return json({ erro: mensagem }, status);
}

/* =========================
   UTILITÁRIOS
========================= */

function idNovo(prefixo: string) {
  return `${prefixo}-${crypto.randomUUID()}`;
}

function texto(valor: unknown, limite: number) {
  if (typeof valor !== "string") return "";
  return valor.trim().slice(0, limite);
}

function somenteDigitos(valor: unknown, limite: number) {
  return texto(valor, limite).replace(/\D/g, "");
}

function normalizarEmail(valor: unknown) {
  return texto(valor, 255).toLowerCase();
}

function normalizarCpf(valor: unknown) {
  return somenteDigitos(valor, 20);
}

function normalizarTelefone(valor: unknown) {
  return somenteDigitos(valor, 30);
}

function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/*
 * Validação básica de CPF.
 * Não aceita apenas 11 números repetidos.
 */
function cpfValido(cpf: string) {
  if (cpf.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  if (resto !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  resto = (soma * 10) % 11;

  if (resto === 10) resto = 0;

  return resto === Number(cpf[10]);
}

function telefoneValido(telefone: string) {
  return telefone.length >= 10 && telefone.length <= 11;
}

function codigoQrValido(codigoQr: string) {
  return codigoQr.length >= 5 && codigoQr.length <= 120;
}

async function corpoJson(
  request: Request,
): Promise<Record<string, unknown> | null> {
  try {
    const dados = await request.json();

    if (
      !dados ||
      typeof dados !== "object" ||
      Array.isArray(dados)
    ) {
      return null;
    }

    return dados as Record<string, unknown>;
  } catch {
    return null;
  }
}

/* =========================
   CONVERSÃO BANCO -> CLIENTE
========================= */

function visitanteParaCliente(linha: VisitanteLinha) {
  return {
    id: linha.id,
    nome: linha.nome,
    email: linha.email,
    cpf: linha.cpf,
    telefone: linha.telefone,
    vinculo: linha.vinculo,
    comoSoube: linha.como_soube,
    genero: linha.genero,
    cursoInteresse: linha.curso_interesse,
    codigoQr: linha.codigo_qr,
    qrCodeSvg: linha.qr_code_svg,
    criadoEm: linha.criado_em,
    atualizadoEm: linha.atualizado_em,
  };
}

function presencaParaCliente(linha: PresencaLinha) {
  return {
    id: linha.id,
    visitanteId: linha.visitante_id,
    codigoQr: linha.codigo_qr,
    setor: linha.setor,
    registradoEm: linha.registrado_em,
  };
}

/* =========================
   CAMPOS DE VISITANTE
========================= */

function validarVisitante(
  dados: Record<string, unknown>,
  exigirQr = true,
) {
  const nome = texto(dados.nome, 100);
  const email = normalizarEmail(dados.email);
  const cpf = normalizarCpf(dados.cpf);
  const telefone = normalizarTelefone(dados.telefone);
  const vinculo = texto(dados.vinculo, 80);
  const comoSoube = texto(dados.comoSoube, 100);
  const genero = texto(dados.genero, 50);
  const cursoInteresse = texto(dados.cursoInteresse, 150);
  const codigoQr = texto(dados.codigoQr, 120);
  const qrCodeSvg = texto(dados.qrCodeSvg, LIMITE_QR_SVG);

  if (nome.length < 3) {
    return {
      erro: "Nome inválido.",
      dados: null,
    };
  }

  if (!emailValido(email)) {
    return {
      erro: "E-mail inválido.",
      dados: null,
    };
  }

  if (!cpfValido(cpf)) {
    return {
      erro: "CPF inválido.",
      dados: null,
    };
  }

  if (!telefoneValido(telefone)) {
    return {
      erro: "Telefone inválido.",
      dados: null,
    };
  }

  if (exigirQr && !codigoQrValido(codigoQr)) {
    return {
      erro: "Código QR inválido.",
      dados: null,
    };
  }

  return {
    erro: null,
    dados: {
      nome,
      email,
      cpf,
      telefone,
      vinculo,
      comoSoube,
      genero,
      cursoInteresse,
      codigoQr,
      qrCodeSvg: qrCodeSvg || null,
    },
  };
}

/* =========================
   TRATAMENTO DE ERROS MYSQL
========================= */

function mensagemErroBanco(error: unknown) {
  const codigo =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (codigo === "ER_DUP_ENTRY") {
    return {
      mensagem: "CPF ou código QR já cadastrado.",
      status: 409,
    };
  }

  if (codigo === "ER_NO_SUCH_TABLE") {
    return {
      mensagem: "As tabelas do banco de dados não foram encontradas.",
      status: 500,
    };
  }

  return {
    mensagem: "Erro interno ao acessar o banco de dados.",
    status: 500,
  };
}

/* =========================
   API PRINCIPAL
========================= */

export async function responderApiFeira(
  request: Request,
  env: unknown,
  autorizado: boolean,
): Promise<Response | null> {
  const url = new URL(request.url);

  if (!url.pathname.startsWith("/api/feira")) {
    return null;
  }

  const db = getMySqlDatabase(env);

  if (!db) {
    return erro(
      "Banco MySQL não configurado. Verifique as variáveis de ambiente.",
      503,
    );
  }

  const rota = url.pathname.slice("/api/feira".length);
  const agora = new Date().toISOString();

  /* =========================
     GET /dados
     ========================= */

  if (request.method === "GET" && rota === "/dados") {
    if (!autorizado) {
      return erro("Autenticação necessária.", 401);
    }

    try {
      const [visitantes, presencas] = await Promise.all([
        db
          .prepare(
            `
            SELECT
              id,
              nome,
              email,
              cpf,
              telefone,
              vinculo,
              como_soube,
              genero,
              curso_interesse,
              codigo_qr,
              qr_code_svg,
              criado_em,
              atualizado_em
            FROM visitantes
            ORDER BY criado_em DESC
            `,
          )
          .all<VisitanteLinha>(),

        db
          .prepare(
            `
            SELECT
              id,
              visitante_id,
              codigo_qr,
              setor,
              registrado_em
            FROM presencas
            ORDER BY registrado_em DESC
            `,
          )
          .all<PresencaLinha>(),
      ]);

      return json({
        visitantes: visitantes.results.map(visitanteParaCliente),
        presencas: presencas.results.map(presencaParaCliente),
      });
    } catch (error) {
      console.error("Erro em GET /dados:", error);

      return erro(
        "Não foi possível carregar os dados da feira.",
        500,
      );
    }
  }

  /* =========================
     POST /visitantes
     ========================= */

  if (request.method === "POST" && rota === "/visitantes") {
    const dados = await corpoJson(request);

    if (!dados) {
      return erro("JSON inválido.", 400);
    }

    /*
     * O servidor gera o ID e o código QR.
     * Não confiamos nesses valores vindos do navegador.
     */
    const validacao = validarVisitante({
      ...dados,
      codigoQr: "",
    }, false);

    if (validacao.erro || !validacao.dados) {
      return erro(validacao.erro ?? "Dados inválidos.", 400);
    }

    const id = idNovo("vis");

    /*
     * O QR pode ser gerado pelo frontend.
     * Caso seu onCadastrar já envie um código QR,
     * ele pode continuar sendo usado.
     */
    const codigoQrRecebido = texto(dados.codigoQr, 120);

    const codigoQr = codigoQrValido(codigoQrRecebido)
      ? codigoQrRecebido
      : `QR-${crypto.randomUUID()}`;

    try {
      await db
        .prepare(
          `
          INSERT INTO visitantes (
            id,
            nome,
            email,
            cpf,
            telefone,
            vinculo,
            como_soube,
            genero,
            curso_interesse,
            codigo_qr,
            qr_code_svg,
            criado_em,
            atualizado_em
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
        )
        .bind(
          id,
          validacao.dados.nome,
          validacao.dados.email,
          validacao.dados.cpf,
          validacao.dados.telefone,
          validacao.dados.vinculo,
          validacao.dados.comoSoube,
          validacao.dados.genero,
          validacao.dados.cursoInteresse,
          codigoQr,
          validacao.dados.qrCodeSvg,
          agora,
          agora,
        )
        .run();

      const salvo = await db
        .prepare(
          `
          SELECT
            id,
            nome,
            email,
            cpf,
            telefone,
            vinculo,
            como_soube,
            genero,
            curso_interesse,
            codigo_qr,
            qr_code_svg,
            criado_em,
            atualizado_em
          FROM visitantes
          WHERE id = ?
          `,
        )
        .bind(id)
        .first<VisitanteLinha>();

      if (!salvo) {
        return erro(
          "Visitante cadastrado, mas não foi possível recuperar os dados.",
          500,
        );
      }

      return json(
        {
          visitante: visitanteParaCliente(salvo),
        },
        201,
      );
    } catch (error) {
      console.error("Erro em POST /visitantes:", error);

      const tratamento = mensagemErroBanco(error);

      return erro(
        tratamento.mensagem,
        tratamento.status,
      );
    }
  }

  /* =========================
     IDENTIFICAR /visitantes/:id
     ========================= */

  const idVisitante =
    rota.match(/^\/visitantes\/([^/]+)$/)?.[1] ?? null;

  /* =========================
     PATCH /visitantes/:id
     ========================= */

  if (request.method === "PATCH" && idVisitante) {
    if (!autorizado) {
      return erro("Autenticação necessária.", 401);
    }

    const idDecodificado = decodeURIComponent(idVisitante);

    const dados = await corpoJson(request);

    if (!dados) {
      return erro("JSON inválido.", 400);
    }

    const pares = CAMPOS_EDITAVEIS.filter(
      (campo) => campo in dados,
    );

    if (!pares.length) {
      return erro(
        "Nenhum campo válido para atualizar.",
        400,
      );
    }

    const valores: unknown[] = [];

    for (const campo of pares) {
      const valor = dados[campo];

      if (campo === "cpf") {
        const cpf = normalizarCpf(valor);

        if (!cpfValido(cpf)) {
          return erro("CPF inválido.", 400);
        }

        valores.push(cpf);
        continue;
      }

      if (campo === "email") {
        const email = normalizarEmail(valor);

        if (!emailValido(email)) {
          return erro("E-mail inválido.", 400);
        }

        valores.push(email);
        continue;
      }

      if (campo === "telefone") {
        const telefone = normalizarTelefone(valor);

        if (!telefoneValido(telefone)) {
          return erro("Telefone inválido.", 400);
        }

        valores.push(telefone);
        continue;
      }

      const limite =
        campo === "nome"
          ? 100
          : campo === "cursoInteresse"
            ? 150
            : 100;

      valores.push(texto(valor, limite));
    }

    const sql = `
      UPDATE visitantes
      SET
        ${pares
          .map(
            (campo) =>
              `${COLUNAS_EDITAVEIS[campo]} = ?`,
          )
          .join(", ")},
        atualizado_em = ?
      WHERE id = ?
    `;

    try {
      const resultado = await db
        .prepare(sql)
        .bind(...valores, agora, idDecodificado)
        .run();

      if (!resultado.meta.changes) {
        return erro(
          "Visitante não encontrado.",
          404,
        );
      }

      const salvo = await db
        .prepare(
          `
          SELECT
            id,
            nome,
            email,
            cpf,
            telefone,
            vinculo,
            como_soube,
            genero,
            curso_interesse,
            codigo_qr,
            qr_code_svg,
            criado_em,
            atualizado_em
          FROM visitantes
          WHERE id = ?
          `,
        )
        .bind(idDecodificado)
        .first<VisitanteLinha>();

      if (!salvo) {
        return erro(
          "Não foi possível recuperar o visitante atualizado.",
          500,
        );
      }

      return json({
        visitante: visitanteParaCliente(salvo),
      });
    } catch (error) {
      console.error("Erro em PATCH /visitantes/:id:", error);

      const tratamento = mensagemErroBanco(error);

      return erro(
        tratamento.mensagem,
        tratamento.status,
      );
    }
  }

  /* =========================
     DELETE /visitantes/:id
     ========================= */

  if (request.method === "DELETE" && idVisitante) {
    if (!autorizado) {
      return erro("Autenticação necessária.", 401);
    }

    const idDecodificado = decodeURIComponent(idVisitante);

    try {
      const resultado = await db
        .prepare(
          "DELETE FROM visitantes WHERE id = ?",
        )
        .bind(idDecodificado)
        .run();

      if (!resultado.meta.changes) {
        return erro(
          "Visitante não encontrado.",
          404,
        );
      }

      return json({
        removido: true,
        id: idDecodificado,
      });
    } catch (error) {
      console.error("Erro em DELETE /visitantes/:id:", error);

      return erro(
        "Não foi possível remover o visitante.",
        500,
      );
    }
  }

  /* =========================
     POST /presencas
     ========================= */

  if (
    request.method === "POST" &&
    rota === "/presencas"
  ) {
    if (!autorizado) {
      return erro("Autenticação necessária.", 401);
    }

    const dados = await corpoJson(request);

    if (!dados) {
      return erro("JSON inválido.", 400);
    }

    const codigoQr = texto(dados.codigoQr, 120);
    const setor = texto(dados.setor, 50);

    if (!codigoQrValido(codigoQr)) {
      return erro(
        "Código QR inválido.",
        400,
      );
    }

    if (!setor) {
      return erro(
        "Setor não informado.",
        400,
      );
    }

    try {
      const visitante = await db
        .prepare(
          `
          SELECT
            id,
            nome,
            email,
            cpf,
            telefone,
            vinculo,
            como_soube,
            genero,
            curso_interesse,
            codigo_qr,
            qr_code_svg,
            criado_em,
            atualizado_em
          FROM visitantes
          WHERE codigo_qr = ?
          LIMIT 1
          `,
        )
        .bind(codigoQr)
        .first<VisitanteLinha>();

      if (!visitante) {
        return json({
          status: "desconhecido",
          visitante: null,
        });
      }

      /*
       * A restrição UNIQUE no banco deve impedir
       * uma segunda presença do mesmo visitante
       * no mesmo setor.
       */
      const id = idNovo("pre");

      const insercao = await db
        .prepare(
          `
          INSERT IGNORE INTO presencas (
            id,
            visitante_id,
            codigo_qr,
            setor,
            registrado_em
          )
          VALUES (?, ?, ?, ?, ?)
          `,
        )
        .bind(
          id,
          visitante.id,
          codigoQr,
          setor,
          agora,
        )
        .run();

      if (!insercao.meta.changes) {
        return json({
          status: "repetido",
          visitante:
            visitanteParaCliente(visitante),
        });
      }

      const presenca = await db
        .prepare(
          `
          SELECT
            id,
            visitante_id,
            codigo_qr,
            setor,
            registrado_em
          FROM presencas
          WHERE id = ?
          LIMIT 1
          `,
        )
        .bind(id)
        .first<PresencaLinha>();

      return json(
        {
          status: "registrado",
          visitante:
            visitanteParaCliente(visitante),
          presenca:
            presenca &&
            presencaParaCliente(presenca),
        },
        201,
      );
    } catch (error) {
      console.error("Erro em POST /presencas:", error);

      return erro(
        "Não foi possível registrar a presença.",
        500,
      );
    }
  }

  /* =========================
     ROTA NÃO ENCONTRADA
  ========================= */

  return erro(
    "Rota da API não encontrada.",
    404,
  );
}
