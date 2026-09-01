/*
 * Ponto único de comunicação com a API da feira (projeto `api/`, Node.js + Express).
 * Os componentes React não conhecem URLs, SQL ou credenciais: eles chamam as funções
 * abaixo. Autenticação é feita por JWT (access + refresh token), guardado no
 * localStorage do navegador — o access token expira rápido (padrão 15 min na API) e é
 * renovado automaticamente por esta camada quando uma chamada autenticada recebe 401.
 */
const BASE_API = `${import.meta.env.VITE_API_URL ?? ""}/api`;
const CHAVE_SESSAO = "feira2026-sessao";
const EVENTO_SESSAO = "feira2026-sessao";

function lerSessao() {
  try {
    const bruto = window.localStorage.getItem(CHAVE_SESSAO);
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

function gravarSessao(sessao) {
  window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  window.dispatchEvent(new Event(EVENTO_SESSAO));
}

function limparSessao() {
  window.localStorage.removeItem(CHAVE_SESSAO);
  window.dispatchEvent(new Event(EVENTO_SESSAO));
}

export function sessaoAtual() {
  return lerSessao();
}

export function administradorAtual() {
  return lerSessao()?.administrador ?? null;
}

/* Erro de conexão de verdade (servidor inalcançável, sem internet, CORS bloqueado) —
 * diferente de um erro de negócio (validação, duplicidade), que a API respondeu
 * normalmente só que com status de erro. Só o primeiro caso deve acionar a
 * contingência local; o segundo precisa aparecer para quem está preenchendo o
 * formulário, senão um dado inválido "desaparece" sem explicação nenhuma. */
export class ErroDeConexao extends Error {}

/* Requisição de baixo nível: monta a URL, envia o access token quando existir e
 * devolve o corpo já decodificado. Nunca loga token nem senha. */
async function requisitarBruto(caminho, opcoes = {}, semAutenticacao = false) {
  const sessao = lerSessao();
  const cabecalhos = { "content-type": "application/json", ...(opcoes.headers ?? {}) };

  if (!semAutenticacao && sessao?.accessToken) {
    cabecalhos.authorization = `Bearer ${sessao.accessToken}`;
  }

  let resposta;
  try {
    resposta = await fetch(`${BASE_API}${caminho}`, {
      ...opcoes,
      headers: cabecalhos,
      cache: "no-store",
    });
  } catch {
    throw new ErroDeConexao("Não foi possível conectar à API. Verifique sua internet.");
  }

  const corpo = await resposta.json().catch(() => ({}));
  return { resposta, corpo };
}

/* Tenta renovar o access token usando o refresh token guardado. Em caso de sucesso,
 * grava o novo par de tokens (rotacionado pela API) e devolve true. */
async function tentarRenovarSessao() {
  const sessao = lerSessao();
  if (!sessao?.refreshToken) return false;

  const { resposta, corpo } = await requisitarBruto(
    "/auth/refresh",
    { method: "POST", body: JSON.stringify({ refreshToken: sessao.refreshToken }) },
    true,
  );

  if (!resposta.ok) return false;

  gravarSessao(corpo.dados);
  return true;
}

/* Requisição autenticada com renovação automática: se o access token expirou (401),
 * tenta renovar uma única vez e repete a chamada original antes de desistir. */
async function requisitar(caminho, opcoes = {}) {
  let { resposta, corpo } = await requisitarBruto(caminho, opcoes);

  if (resposta.status === 401) {
    const renovou = await tentarRenovarSessao();
    if (renovou) {
      ({ resposta, corpo } = await requisitarBruto(caminho, opcoes));
    }
  }

  if (resposta.status === 401) {
    // Refresh também falhou (expirado/revogado): a sessão não é mais válida.
    limparSessao();
  }

  if (!resposta.ok) {
    throw new Error(corpo?.erro?.mensagem || "Não foi possível comunicar com a API.");
  }

  return corpo;
}

/* Requisição pública, sem tentativa de autenticação (ex.: inscrição, login). */
async function requisitarPublico(caminho, opcoes = {}) {
  const { resposta, corpo } = await requisitarBruto(caminho, opcoes, true);
  if (!resposta.ok) {
    throw new Error(corpo?.erro?.mensagem || "Não foi possível comunicar com a API.");
  }
  return corpo;
}

/* ===== Autenticação ===== */

export async function entrar(email, senha) {
  const corpo = await requisitarPublico("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
  gravarSessao(corpo.dados);
  return corpo.dados.administrador;
}

export async function sair() {
  const sessao = lerSessao();
  if (sessao?.refreshToken) {
    // Melhor esforço: revoga o refresh token no servidor. Se falhar (rede, token já
    // expirado), a sessão local é apagada de qualquer forma.
    try {
      await requisitarBruto("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: sessao.refreshToken }),
      });
    } catch {
      // Ignorado: o objetivo do logout é limpar a sessão local, o que sempre acontece abaixo.
    }
  }
  limparSessao();
}

/* ===== Setores/atrações ===== */

export async function carregarSetores() {
  const corpo = await requisitarPublico("/setores");
  return corpo.dados;
}

/* ===== Visitantes ===== */

export async function criarVisitanteNoBanco(visitante) {
  // O servidor gera id, código QR e o SVG do QR Code — nunca confiamos nesses valores
  // vindos do navegador.
  const corpo = await requisitarPublico("/visitantes", {
    method: "POST",
    body: JSON.stringify(visitante),
  });
  return corpo.dados;
}

/* Busca todos os visitantes cadastrados, percorrendo a API paginada até completar o
 * total informado pelo servidor (usado pelas telas administrativas, que precisam da
 * lista completa para busca e estatísticas locais). */
export async function carregarTodosVisitantes() {
  const porPagina = 200;
  let pagina = 1;
  let total = Infinity;
  const todos = [];

  while (todos.length < total) {
    const corpo = await requisitar(`/visitantes?pagina=${pagina}&porPagina=${porPagina}`);
    todos.push(...corpo.dados);
    total = corpo.paginacao.total;
    if (corpo.dados.length === 0) break;
    pagina += 1;
  }

  return todos;
}

export async function atualizarVisitanteNoBanco(id, dados) {
  const corpo = await requisitar(`/visitantes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
  return corpo.dados;
}

/* Vincula o código do QR Code (não gerado por este app) ao visitante e marca a
 * chegada — usado no check-in feito pela equipe de credenciamento. */
export async function checkinVisitanteNoBanco(id, codigoQr) {
  const corpo = await requisitar(`/visitantes/${encodeURIComponent(id)}/checkin`, {
    method: "PATCH",
    body: JSON.stringify({ codigoQr }),
  });
  return corpo.dados;
}

export async function removerVisitanteNoBanco(id) {
  await requisitar(`/visitantes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/* ===== Presenças ===== */

export async function carregarPresencas() {
  const corpo = await requisitar("/presencas");
  return corpo.dados;
}

export async function registrarPresencaNoBanco(codigoQr, setorId) {
  const corpo = await requisitar("/presencas", {
    method: "POST",
    body: JSON.stringify({ codigoQr, setorId }),
  });
  return corpo.dados;
}

/* ===== Painel administrativo ===== */

export async function carregarResumoDashboard() {
  const corpo = await requisitar("/dashboard/resumo");
  return corpo.dados;
}

export async function carregarDashboardPorSetor() {
  const corpo = await requisitar("/dashboard/setores");
  return corpo.dados;
}

export async function carregarRankingsDashboard() {
  const corpo = await requisitar("/dashboard/rankings");
  return corpo.dados;
}

/* Conjunto usado pela tela de credenciamento/admin ao entrar na área restrita: carrega
 * tudo que as duas telas precisam de uma vez. */
export async function carregarDadosDaFeira() {
  const [visitantes, presencas, setores] = await Promise.all([
    carregarTodosVisitantes(),
    carregarPresencas(),
    carregarSetores(),
  ]);
  return { visitantes, presencas, setores };
}
