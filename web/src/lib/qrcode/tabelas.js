/*
 * Tabelas oficiais da especificacao QR (ISO/IEC 18004).
 * Cobrem versoes 1 a 40, os quatro niveis de correcao de erro,
 * as posicoes dos padroes de alinhamento e a informacao de formato.
 */

export const NIVEIS = ["L", "M", "Q", "H"];

/* Codewords de correcao de erro por bloco (versoes 1..40) */
const EC_POR_BLOCO = {
  L: [
    7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30,
    26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  M: [
    10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28,
    28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  ],
  Q: [
    13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30,
    30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
  H: [
    17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
  ],
};

/* Quantidade de blocos de correcao de erro (versoes 1..40) */
const BLOCOS_EC = {
  L: [
    1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15,
    16, 17, 18, 19, 19, 20, 21, 22, 24, 25,
  ],
  M: [
    1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25,
    26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
  ],
  Q: [
    1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34,
    35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68,
  ],
  H: [
    1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37,
    40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81,
  ],
};

export function ecPorBloco(versao, nivel) {
  return EC_POR_BLOCO[nivel][versao - 1];
}

export function quantidadeBlocos(versao, nivel) {
  return BLOCOS_EC[nivel][versao - 1];
}

/* Numero de modulos de dados crus (sem padroes de funcao) */
function modulosDeDados(versao) {
  let total = (16 * versao + 128) * versao + 64;
  if (versao >= 2) {
    const alinhamentos = Math.floor(versao / 7) + 2;
    total -= (25 * alinhamentos - 10) * alinhamentos - 55;
    if (versao >= 7) total -= 36;
  }
  return total;
}

/* Total de codewords (dados + correcao) da versao */
export function totalCodewords(versao) {
  return Math.floor(modulosDeDados(versao) / 8);
}

/* Codewords de dados disponiveis para a versao e nivel */
export function totalCodewordsDados(versao, nivel) {
  return totalCodewords(versao) - ecPorBloco(versao, nivel) * quantidadeBlocos(versao, nivel);
}

/*
 * Divisao dos codewords em blocos.
 * Os primeiros blocos sao curtos e os ultimos possuem um codeword extra.
 */
export function blocosDaVersao(versao, nivel) {
  const blocos = quantidadeBlocos(versao, nivel);
  const ec = ecPorBloco(versao, nivel);
  const dados = totalCodewordsDados(versao, nivel);
  const curtos = blocos - (dados % blocos);
  const tamanhoCurto = Math.floor(dados / blocos);
  const lista = [];
  for (let i = 0; i < blocos; i += 1) {
    const dadosDoBloco = i < curtos ? tamanhoCurto : tamanhoCurto + 1;
    lista.push({ dados: dadosDoBloco, ec });
  }
  return lista;
}

/* Centros dos padroes de alinhamento da versao */
export function posicoesAlinhamento(versao) {
  if (versao === 1) return [];
  const quantidade = Math.floor(versao / 7) + 2;
  const tamanho = versao * 4 + 17;
  const passo = versao === 32 ? 26 : Math.ceil((versao * 4 + 4) / (quantidade * 2 - 2)) * 2;
  const posicoes = [6];
  for (let pos = tamanho - 7; posicoes.length < quantidade; pos -= passo) {
    posicoes.unshift(pos);
  }
  posicoes.sort((a, b) => a - b);
  return posicoes;
}

/* Bits de contagem de caracteres por modo e versao */
export function bitsContagem(versao, modo) {
  const faixa = versao <= 9 ? 0 : versao <= 26 ? 1 : 2;
  const tabela = {
    numerico: [10, 12, 14],
    alfanumerico: [9, 11, 13],
    byte: [8, 16, 16],
    kanji: [8, 10, 12],
  };
  return tabela[modo][faixa];
}

/* Codificacao BCH(15,5) usada na informacao de formato */
function bchFormato(dados) {
  let valor = dados << 10;
  for (let i = 4; i >= 0; i -= 1) {
    if (valor & (1 << (i + 10))) valor ^= 0x537 << i;
  }
  return ((dados << 10) | valor) ^ 0x5412;
}

/* Os 32 valores validos de informacao de formato: nivel + mascara */
export const FORMATOS = (() => {
  const bitsNivel = { L: 1, M: 0, Q: 3, H: 2 };
  const lista = [];
  NIVEIS.forEach((nivel) => {
    for (let mascara = 0; mascara < 8; mascara += 1) {
      const dados = (bitsNivel[nivel] << 3) | mascara;
      lista.push({ nivel, mascara, bits: bchFormato(dados) });
    }
  });
  return lista;
})();

/* Alfabeto do modo alfanumerico */
export const ALFANUMERICO = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
