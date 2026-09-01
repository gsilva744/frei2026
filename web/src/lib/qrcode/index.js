/*
 * Ponto de entrada do leitor de QR Code proprio.
 * Recebe um ImageData (ou uma matriz de modulos) e devolve o texto lido.
 */

import { binarizar } from "./binarizador";
import { detectarMatriz } from "./detector";
import { corrigirCodewords, extrairCodewords, lerFormato, versaoDaDimensao } from "./matriz";
import { decodificarDados } from "./dados";

/* Decodifica uma matriz de modulos ja detectada (true = escuro) */
export function decodificarMatriz(matriz) {
  const dimensao = matriz.length;
  const versao = versaoDaDimensao(dimensao);
  if (!Number.isInteger(versao) || versao < 1 || versao > 40) {
    throw new Error("Dimensao invalida para um QR Code");
  }

  const formato = lerFormato(matriz);
  if (!formato) throw new Error("Informacao de formato ilegivel");

  const codewords = extrairCodewords(matriz, formato.mascara);
  const dados = corrigirCodewords(codewords, versao, formato.nivel);
  const texto = decodificarDados(dados, versao);

  return { texto, versao, nivel: formato.nivel, mascara: formato.mascara };
}

function inverterCores(imageData) {
  const copia = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < copia.length; i += 4) {
    copia[i] = 255 - copia[i];
    copia[i + 1] = 255 - copia[i + 1];
    copia[i + 2] = 255 - copia[i + 2];
  }
  return { width: imageData.width, height: imageData.height, data: copia };
}

/* Tenta ler um QR Code de um ImageData; devolve null quando nao encontra */
export function lerQrCode(imageData) {
  const tentativas = [imageData, inverterCores(imageData)];
  for (const tentativa of tentativas) {
    try {
      const imagem = binarizar(tentativa);
      const matriz = detectarMatriz(imagem);
      if (!matriz) continue;
      return decodificarMatriz(matriz);
    } catch {
      /* segue para a proxima tentativa */
    }
  }
  return null;
}

export { binarizar, detectarMatriz };
