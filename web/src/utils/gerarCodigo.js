/* Gera um codigo unico usado como conteudo do QR Code de cada visitante */
export function gerarCodigoUnico() {
  const aleatorio = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FEIRA2026-${Date.now()}-${aleatorio}`;
}
