/*
 * Decodificacao do fluxo de bits em texto.
 * Modos suportados: numerico, alfanumerico, byte e kanji.
 */

import { ALFANUMERICO, bitsContagem } from "./tabelas";

class LeitorDeBits {
  constructor(bytes) {
    this.bytes = bytes;
    this.posicao = 0;
  }

  restantes() {
    return this.bytes.length * 8 - this.posicao;
  }

  ler(quantidade) {
    if (quantidade > this.restantes()) throw new Error("Fim inesperado dos dados do QR Code");
    let valor = 0;
    for (let i = 0; i < quantidade; i += 1) {
      const byte = this.bytes[Math.floor(this.posicao / 8)];
      const bit = (byte >> (7 - (this.posicao % 8))) & 1;
      valor = (valor << 1) | bit;
      this.posicao += 1;
    }
    return valor;
  }
}

function decodificarNumerico(leitor, quantidade) {
  let texto = "";
  let faltam = quantidade;
  while (faltam >= 3) {
    const valor = leitor.ler(10);
    texto += String(valor).padStart(3, "0");
    faltam -= 3;
  }
  if (faltam === 2) texto += String(leitor.ler(7)).padStart(2, "0");
  else if (faltam === 1) texto += String(leitor.ler(4));
  return texto;
}

function decodificarAlfanumerico(leitor, quantidade) {
  let texto = "";
  let faltam = quantidade;
  while (faltam >= 2) {
    const valor = leitor.ler(11);
    texto += ALFANUMERICO[Math.floor(valor / 45)] + ALFANUMERICO[valor % 45];
    faltam -= 2;
  }
  if (faltam === 1) texto += ALFANUMERICO[leitor.ler(6)];
  return texto;
}

function decodificarBytes(leitor, quantidade) {
  const bytes = new Uint8Array(quantidade);
  for (let i = 0; i < quantidade; i += 1) bytes[i] = leitor.ler(8);
  return new TextDecoder("utf-8").decode(bytes);
}

function decodificarKanji(leitor, quantidade) {
  /* Sem tabela Shift-JIS completa: devolve o ponto de codigo aproximado */
  let texto = "";
  for (let i = 0; i < quantidade; i += 1) {
    const valor = leitor.ler(13);
    let agrupado = Math.floor(valor / 0xc0) * 0x100 + (valor % 0xc0);
    agrupado += agrupado < 0x1f00 ? 0x8140 : 0xc140;
    texto += String.fromCharCode(agrupado);
  }
  return texto;
}

export function decodificarDados(bytes, versao) {
  const leitor = new LeitorDeBits(bytes);
  let texto = "";

  while (leitor.restantes() >= 4) {
    const modo = leitor.ler(4);
    if (modo === 0) break;

    if (modo === 7) {
      /* ECI: apenas consome o identificador e segue lendo */
      const primeiro = leitor.ler(8);
      if (primeiro >= 0xc0) leitor.ler(16);
      else if (primeiro >= 0x80) leitor.ler(8);
      continue;
    }

    const nomes = { 1: "numerico", 2: "alfanumerico", 4: "byte", 8: "kanji" };
    const nome = nomes[modo];
    if (!nome) throw new Error(`Modo de QR Code nao suportado: ${modo}`);

    const quantidade = leitor.ler(bitsContagem(versao, nome));
    if (nome === "numerico") texto += decodificarNumerico(leitor, quantidade);
    else if (nome === "alfanumerico") texto += decodificarAlfanumerico(leitor, quantidade);
    else if (nome === "byte") texto += decodificarBytes(leitor, quantidade);
    else texto += decodificarKanji(leitor, quantidade);
  }

  return texto;
}
