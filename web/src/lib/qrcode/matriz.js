/*
 * Leitura da matriz de modulos:
 * informacao de formato, remocao da mascara e extracao dos codewords.
 */

import { FORMATOS, blocosDaVersao, totalCodewords } from "./tabelas";
import { corrigirBloco } from "./gf256";
import { posicoesAlinhamento } from "./tabelas";

/* As oito mascaras previstas na especificacao */
const MASCARAS = [
  (i, j) => (i + j) % 2 === 0,
  (i) => i % 2 === 0,
  (i, j) => j % 3 === 0,
  (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0,
  (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0,
  (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0,
  (i, j) => (((i + j) % 2) + ((i * j) % 3)) % 2 === 0,
];

export function versaoDaDimensao(dimensao) {
  return (dimensao - 17) / 4;
}

function contarBitsDiferentes(a, b) {
  let valor = a ^ b;
  let total = 0;
  while (valor !== 0) {
    total += valor & 1;
    valor >>= 1;
  }
  return total;
}

/* Le os 15 bits de formato (duas copias) e escolhe o valor valido mais proximo */
export function lerFormato(matriz) {
  const dimensao = matriz.length;
  const bit = (linha, coluna) => (matriz[linha][coluna] ? 1 : 0);

  let copia1 = 0;
  for (let i = 0; i <= 5; i += 1) copia1 = (copia1 << 1) | bit(8, i);
  copia1 = (copia1 << 1) | bit(8, 7);
  copia1 = (copia1 << 1) | bit(8, 8);
  copia1 = (copia1 << 1) | bit(7, 8);
  for (let i = 5; i >= 0; i -= 1) copia1 = (copia1 << 1) | bit(i, 8);

  let copia2 = 0;
  for (let i = 0; i < 8; i += 1) copia2 = (copia2 << 1) | bit(dimensao - 1 - i, 8);
  for (let i = 0; i < 7; i += 1) copia2 = (copia2 << 1) | bit(8, dimensao - 7 + i);

  let melhor = null;
  let menorDistancia = 99;
  FORMATOS.forEach((formato) => {
    const distancia = Math.min(
      contarBitsDiferentes(copia1, formato.bits),
      contarBitsDiferentes(copia2, formato.bits),
    );
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      melhor = formato;
    }
  });

  if (!melhor || menorDistancia > 3) return null;
  return { nivel: melhor.nivel, mascara: melhor.mascara };
}

/* Marca todos os modulos que nao carregam dados */
export function mapaDeFuncao(dimensao) {
  const versao = versaoDaDimensao(dimensao);
  const mapa = Array.from({ length: dimensao }, () => new Array(dimensao).fill(false));
  const marcar = (linha, coluna, largura, altura) => {
    for (let y = linha; y < linha + altura; y += 1) {
      for (let x = coluna; x < coluna + largura; x += 1) {
        if (y >= 0 && x >= 0 && y < dimensao && x < dimensao) mapa[y][x] = true;
      }
    }
  };

  /* Padroes de canto com separadores e areas de formato */
  marcar(0, 0, 9, 9);
  marcar(0, dimensao - 8, 8, 9);
  marcar(dimensao - 8, 0, 9, 8);

  /* Linhas de temporizacao */
  for (let i = 0; i < dimensao; i += 1) {
    mapa[6][i] = true;
    mapa[i][6] = true;
  }

  /* Padroes de alinhamento */
  const posicoes = posicoesAlinhamento(versao);
  posicoes.forEach((linha) => {
    posicoes.forEach((coluna) => {
      const cantoFinder =
        (linha === 6 && coluna === 6) ||
        (linha === 6 && coluna === dimensao - 7) ||
        (linha === dimensao - 7 && coluna === 6);
      if (cantoFinder) return;
      marcar(linha - 2, coluna - 2, 5, 5);
    });
  });

  /* Informacao de versao (a partir da versao 7) */
  if (versao >= 7) {
    marcar(dimensao - 11, 0, 6, 3);
    marcar(0, dimensao - 11, 3, 6);
  }

  return mapa;
}

/* Percorre a matriz em zigue-zague e devolve os codewords ja sem a mascara */
export function extrairCodewords(matriz, mascara) {
  const dimensao = matriz.length;
  const funcao = mapaDeFuncao(dimensao);
  const aplicarMascara = MASCARAS[mascara];
  const codewords = [];
  let byteAtual = 0;
  let bitsLidos = 0;

  for (let colunaBase = dimensao - 1; colunaBase >= 1; colunaBase -= 2) {
    const coluna = colunaBase <= 6 ? colunaBase - 1 : colunaBase;
    for (let passo = 0; passo < dimensao; passo += 1) {
      const subindo = ((dimensao - 1 - colunaBase) / 2) % 2 === 0;
      const linha = subindo ? dimensao - 1 - passo : passo;
      for (let deslocamento = 0; deslocamento < 2; deslocamento += 1) {
        const c = coluna - deslocamento;
        if (c < 0 || funcao[linha][c]) continue;
        let valor = matriz[linha][c] ? 1 : 0;
        if (aplicarMascara(linha, c)) valor ^= 1;
        byteAtual = (byteAtual << 1) | valor;
        bitsLidos += 1;
        if (bitsLidos === 8) {
          codewords.push(byteAtual);
          byteAtual = 0;
          bitsLidos = 0;
        }
      }
    }
  }

  return codewords;
}

/*
 * Separa os codewords intercalados em blocos, corrige cada bloco
 * e devolve apenas os codewords de dados.
 */
export function corrigirCodewords(codewords, versao, nivel) {
  const total = totalCodewords(versao);
  const brutos = codewords.slice(0, total);
  const blocos = blocosDaVersao(versao, nivel);
  const maiorDados = Math.max(...blocos.map((bloco) => bloco.dados));

  const dadosPorBloco = blocos.map(() => []);
  let indice = 0;
  for (let posicao = 0; posicao < maiorDados; posicao += 1) {
    blocos.forEach((bloco, b) => {
      if (posicao < bloco.dados) {
        dadosPorBloco[b].push(brutos[indice]);
        indice += 1;
      }
    });
  }

  const ecPorBlocoLista = blocos.map(() => []);
  for (let posicao = 0; posicao < blocos[0].ec; posicao += 1) {
    blocos.forEach((bloco, b) => {
      ecPorBlocoLista[b].push(brutos[indice]);
      indice += 1;
    });
  }

  const resultado = [];
  blocos.forEach((bloco, b) => {
    const completo = dadosPorBloco[b].concat(ecPorBlocoLista[b]);
    const corrigido = corrigirBloco(completo, bloco.ec);
    resultado.push(...corrigido.slice(0, bloco.dados));
  });

  return resultado;
}
