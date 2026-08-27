import QRCode from "qrcode";

/*
 * Ponto único de comunicação com o banco. Os componentes React não conhecem
 * URLs, SQL ou credenciais: eles chamam as funções abaixo.
 */
const BASE_API = "/api/feira";
const CHAVE_AUTORIZACAO = "feira2026-autorizacao";

function cabecalhos(extras = {}) {
  const autorizacao = window.sessionStorage.getItem(CHAVE_AUTORIZACAO);
  return {
    "content-type": "application/json",
    ...(autorizacao ? { authorization: `Basic ${autorizacao}` } : {}),
    ...extras,
  };
}

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_API}${caminho}`, {
    ...opcoes,
    headers: cabecalhos(opcoes.headers),
    cache: "no-store",
  });
  const corpo = await resposta.json().catch(() => ({}));
  if (!resposta.ok)
    throw new Error(corpo.erro || "Não foi possível comunicar com o banco de dados.");
  return corpo;
}

export function guardarAutorizacaoDoBanco(usuario, senha) {
  window.sessionStorage.setItem(CHAVE_AUTORIZACAO, window.btoa(`${usuario}:${senha}`));
  window.dispatchEvent(new Event("feira2026-autorizacao"));
}

export function removerAutorizacaoDoBanco() {
  window.sessionStorage.removeItem(CHAVE_AUTORIZACAO);
  window.dispatchEvent(new Event("feira2026-autorizacao"));
}

export function carregarDadosDaFeira() {
  // Envia: somente a autorização da área restrita. Retorna: visitantes e presenças.
  return requisitar("/dados");
}

export async function criarVisitanteNoBanco(visitante) {
  // A imagem é um SVG do QR Code. Ela fica na coluna qr_code_svg para permitir
  // reimpressão manual sem precisar gerar o código novamente.
  const qrCodeSvg = await QRCode.toString(visitante.codigoQr, {
    type: "svg",
    margin: 1,
    errorCorrectionLevel: "M",
  });
  return requisitar("/visitantes", {
    method: "POST",
    // Envia: os oito campos do formulário, código único, data e o SVG do QR Code.
    body: JSON.stringify({ ...visitante, qrCodeSvg }),
  });
}

export function atualizarVisitanteNoBanco(id, dados) {
  // Envia: somente os campos editáveis do visitante identificado por `id`.
  return requisitar(`/visitantes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(dados),
  });
}

export function removerVisitanteNoBanco(id) {
  // Remove o visitante e suas presenças relacionadas (chave estrangeira ON DELETE CASCADE).
  return requisitar(`/visitantes/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function registrarPresencaNoBanco(codigoQr, setor) {
  // Envia: código lido e setor. O banco grava a data e impede duplicidade por setor.
  return requisitar("/presencas", {
    method: "POST",
    body: JSON.stringify({ codigoQr, setor }),
  });
}
