/*
 * API do banco de dados da Feira.
 *
 * O binding `DB` Ã© um Cloudflare D1. Todos os dados enviados pelo navegador
 * estÃ£o documentados junto Ã  rota correspondente. Nenhuma instruÃ§Ã£o SQL fica
 * nos componentes visuais, o que deixa a manutenÃ§Ã£o concentrada neste arquivo.
 */
type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  run: () => Promise<{ meta: { changes?: number } }>;
  all: <T>() => Promise<{ results: T[] }>;
  first: <T>() => Promise<T | null>;
};

type D1Database = { prepare: (query: string) => D1Statement };
type AmbienteComBanco = { DB?: D1Database };

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

function json(dados: unknown, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

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
    // A imagem SVG Ã© retornada para uma futura tela de exportaÃ§Ã£o/reimpressÃ£o;
    // a interface atual continua renderizando o QR pelo cÃ³digo Ãºnico.
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

function idNovo(prefixo: string) {
  return `${prefixo}-${crypto.randomUUID()}`;
}

function texto(valor: unknown, limite: number) {
  return typeof valor === "string" ? valor.trim().slice(0, limite) : "";
}

async function corpoJson(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function dadosValidos(dados: Record<string, unknown>) {
  const cpf = texto(dados.cpf, 20).replace(/\D/g, "");
  if (texto(dados.nome, 100).length < 3) return "Nome invÃ¡lido.";
  if (cpf.length !== 11) return "CPF deve ter 11 dÃ­gitos.";
  if (texto(dados.email, 255).length < 3) return "E-mail invÃ¡lido.";
  if (texto(dados.telefone, 30).replace(/\D/g, "").length < 10) return "Telefone invÃ¡lido.";
  return null;
}

export async function responderApiFeira(
  request: Request,
  env: unknown,
  autorizado: boolean,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/feira")) return null;

  const db = getMySqlDatabase(env);
  if (!db) {
    return json({ erro: "Banco nÃ£o configurado. Crie o binding D1 chamado DB." }, 503);
  }

  const rota = url.pathname.slice("/api/feira".length);
  const agora = new Date().toISOString();

  // GET /dados (restrita): retorna todos os visitantes e presenÃ§as para painel e leitor QR.
  if (request.method === "GET" && rota === "/dados") {
    if (!autorizado) return json({ erro: "AutenticaÃ§Ã£o necessÃ¡ria." }, 401);
    const [visitantes, presencas] = await Promise.all([
      db.prepare("SELECT * FROM visitantes ORDER BY criado_em DESC").all<VisitanteLinha>(),
      db.prepare("SELECT * FROM presencas ORDER BY registrado_em DESC").all<PresencaLinha>(),
    ]);
    return json({
      visitantes: visitantes.results.map(visitanteParaCliente),
      presencas: presencas.results.map(presencaParaCliente),
    });
  }

  // POST /visitantes (pÃºblica): recebe os dados do formulÃ¡rio e a imagem SVG do QR Code.
  if (request.method === "POST" && rota === "/visitantes") {
    const dados = await corpoJson(request);
    if (!dados) return json({ erro: "JSON invÃ¡lido." }, 400);
    const erro = dadosValidos(dados);
    if (erro) return json({ erro }, 400);
    const visitante = {
      id: texto(dados.id, 80) || idNovo("vis"),
      nome: texto(dados.nome, 100),
      email: texto(dados.email, 255),
      cpf: texto(dados.cpf, 20),
      telefone: texto(dados.telefone, 30),
      vinculo: texto(dados.vinculo, 80),
      comoSoube: texto(dados.comoSoube, 100),
      genero: texto(dados.genero, 50),
      cursoInteresse: texto(dados.cursoInteresse, 150),
      codigoQr: texto(dados.codigoQr, 120),
      qrCodeSvg: texto(dados.qrCodeSvg, 30000),
      criadoEm: texto(dados.criadoEm, 40) || agora,
    };
    if (!visitante.codigoQr) return json({ erro: "CÃ³digo QR ausente." }, 400);
    try {
      await db
        .prepare(
          `INSERT INTO visitantes (id, nome, email, cpf, telefone, vinculo, como_soube, genero, curso_interesse, codigo_qr, qr_code_svg, criado_em, atualizado_em)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          visitante.id,
          visitante.nome,
          visitante.email,
          visitante.cpf,
          visitante.telefone,
          visitante.vinculo,
          visitante.comoSoube,
          visitante.genero,
          visitante.cursoInteresse,
          visitante.codigoQr,
          visitante.qrCodeSvg || null,
          visitante.criadoEm,
          agora,
        )
        .run();
      const salvo = await db
        .prepare("SELECT * FROM visitantes WHERE id = ?")
        .bind(visitante.id)
        .first<VisitanteLinha>();
      return json({ visitante: salvo && visitanteParaCliente(salvo) }, 201);
    } catch {
      return json({ erro: "JÃ¡ existe um visitante com este CPF ou cÃ³digo QR." }, 409);
    }
  }

  const idVisitante = rota.match(/^\/visitantes\/([^/]+)$/)?.[1];
  // PATCH /visitantes/:id (restrita): recebe somente os campos editÃ¡veis mostrados na tela.
  if (request.method === "PATCH" && idVisitante) {
    if (!autorizado) return json({ erro: "AutenticaÃ§Ã£o necessÃ¡ria." }, 401);
    const dados = await corpoJson(request);
    if (!dados) return json({ erro: "JSON invÃ¡lido." }, 400);
    const pares = CAMPOS_EDITAVEIS.filter((campo) => campo in dados);
    if (!pares.length) return json({ erro: "Nenhum campo para atualizar." }, 400);
    const colunas: Record<(typeof CAMPOS_EDITAVEIS)[number], string> = {
      nome: "nome",
      email: "email",
      cpf: "cpf",
      telefone: "telefone",
      vinculo: "vinculo",
      comoSoube: "como_soube",
      genero: "genero",
      cursoInteresse: "curso_interesse",
    };
    const valores = pares.map((campo) => texto(dados[campo], campo === "email" ? 255 : 150));
    await db
      .prepare(
        `UPDATE visitantes SET ${pares.map((campo) => `${colunas[campo]} = ?`).join(", ")}, atualizado_em = ? WHERE id = ?`,
      )
      .bind(...valores, agora, decodeURIComponent(idVisitante))
      .run();
    const salvo = await db
      .prepare("SELECT * FROM visitantes WHERE id = ?")
      .bind(decodeURIComponent(idVisitante))
      .first<VisitanteLinha>();
    return salvo
      ? json({ visitante: visitanteParaCliente(salvo) })
      : json({ erro: "Visitante nÃ£o encontrado." }, 404);
  }

  // DELETE /visitantes/:id (restrita): remove visitante; o SQL remove presenÃ§as em cascata.
  if (request.method === "DELETE" && idVisitante) {
    if (!autorizado) return json({ erro: "AutenticaÃ§Ã£o necessÃ¡ria." }, 401);
    const resultado = await db
      .prepare("DELETE FROM visitantes WHERE id = ?")
      .bind(decodeURIComponent(idVisitante))
      .run();
    return resultado.meta.changes
      ? json({ removido: true })
      : json({ erro: "Visitante nÃ£o encontrado." }, 404);
  }

  // POST /presencas (restrita): recebe cÃ³digo QR + setor; data e identificador sÃ£o gerados no servidor.
  if (request.method === "POST" && rota === "/presencas") {
    if (!autorizado) return json({ erro: "AutenticaÃ§Ã£o necessÃ¡ria." }, 401);
    const dados = await corpoJson(request);
    const codigoQr = texto(dados?.codigoQr, 120);
    const setor = texto(dados?.setor, 50);
    const visitante = codigoQr
      ? await db
          .prepare("SELECT * FROM visitantes WHERE codigo_qr = ?")
          .bind(codigoQr)
          .first<VisitanteLinha>()
      : null;
    if (!visitante) return json({ status: "desconhecido", visitante: null });
    const id = idNovo("pre");
    const insercao = await db
      .prepare(
        "INSERT IGNORE INTO presencas (id, visitante_id, codigo_qr, setor, registrado_em) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(id, visitante.id, codigoQr, setor, agora)
      .run();
    if (!insercao.meta.changes)
      return json({ status: "repetido", visitante: visitanteParaCliente(visitante) });
    const presenca = await db
      .prepare("SELECT * FROM presencas WHERE id = ?")
      .bind(id)
      .first<PresencaLinha>();
    return json(
      {
        status: "registrado",
        visitante: visitanteParaCliente(visitante),
        presenca: presenca && presencaParaCliente(presenca),
      },
      201,
    );
  }

  return json({ erro: "Rota da API nÃ£o encontrada." }, 404);
}
