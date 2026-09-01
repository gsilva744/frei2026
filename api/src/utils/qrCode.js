import { randomUUID } from "node:crypto";
import QRCode from "qrcode";

/* Gera o código único usado como conteúdo do QR Code de cada visitante.
 * Mesmo padrão do front-end (web/src/utils/gerarCodigo.js), mas gerado no servidor:
 * a API nunca confia em codigoQr vindo do cliente. */
export function gerarCodigoUnico() {
  const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FEIRA2026-${Date.now()}-${aleatorio}`;
}

/* SVG do QR Code, salvo junto do visitante para permitir reimpressão sem regerar. */
export function gerarQrCodeSvg(codigo) {
  return QRCode.toString(codigo, { type: "svg", margin: 1, errorCorrectionLevel: "M" });
}

export function idNovo(prefixo) {
  return `${prefixo}-${randomUUID()}`;
}
