/*
 * Aritmetica no corpo finito GF(256) e decodificador Reed-Solomon.
 * Usado para corrigir codewords danificados de um QR Code.
 * Polinomio primitivo do QR: 0x11D.
 */

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(function montarTabelas() {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
})();

export function somar(a, b) {
  return a ^ b;
}

export function multiplicar(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

export function dividir(a, b) {
  if (b === 0) throw new Error("Divisao por zero em GF(256)");
  if (a === 0) return 0;
  return EXP[(LOG[a] + 255 - LOG[b]) % 255];
}

export function potencia(expoente) {
  const e = ((expoente % 255) + 255) % 255;
  return EXP[e];
}

export function inverso(a) {
  return EXP[255 - LOG[a]];
}

/* Avalia um polinomio com coeficientes em ordem crescente de grau */
function avaliarCrescente(coeficientes, x) {
  let resultado = 0;
  let potenciaX = 1;
  for (let i = 0; i < coeficientes.length; i += 1) {
    resultado ^= multiplicar(coeficientes[i], potenciaX);
    potenciaX = multiplicar(potenciaX, x);
  }
  return resultado;
}

/* Sindromes: avaliam a mensagem recebida nas raizes alpha^0..alpha^(ec-1) */
function calcularSindromes(mensagem, ec) {
  const sindromes = new Array(ec).fill(0);
  for (let j = 0; j < ec; j += 1) {
    const x = potencia(j);
    let valor = 0;
    for (let i = 0; i < mensagem.length; i += 1) {
      valor = multiplicar(valor, x) ^ mensagem[i];
    }
    sindromes[j] = valor;
  }
  return sindromes;
}

/* Berlekamp-Massey: encontra o polinomio localizador de erros */
function localizadorDeErros(sindromes) {
  let atual = [1];
  let anterior = [1];
  let comprimento = 0;
  let deslocamento = 1;
  let ultimoDelta = 1;

  for (let n = 0; n < sindromes.length; n += 1) {
    let delta = sindromes[n];
    for (let i = 1; i <= comprimento; i += 1) {
      delta ^= multiplicar(atual[i] || 0, sindromes[n - i]);
    }

    if (delta === 0) {
      deslocamento += 1;
      continue;
    }

    const fator = dividir(delta, ultimoDelta);
    const ajustado = atual.slice();
    for (let i = 0; i < anterior.length; i += 1) {
      const posicao = i + deslocamento;
      ajustado[posicao] = (ajustado[posicao] || 0) ^ multiplicar(fator, anterior[i]);
    }

    if (2 * comprimento <= n) {
      const copia = atual.slice();
      atual = ajustado;
      anterior = copia;
      comprimento = n + 1 - comprimento;
      ultimoDelta = delta;
      deslocamento = 1;
    } else {
      atual = ajustado;
      deslocamento += 1;
    }
  }

  return atual;
}

/* Busca de Chien: raizes do localizador indicam as posicoes com erro */
function posicoesDeErro(localizador, tamanhoMensagem) {
  const posicoes = [];
  for (let i = 0; i < tamanhoMensagem; i += 1) {
    if (avaliarCrescente(localizador, potencia(-i)) === 0) posicoes.push(i);
  }
  return posicoes;
}

/*
 * Forney: resolve as magnitudes dos erros a partir das sindromes.
 * Como a quantidade de erros e pequena, usamos eliminacao de Gauss em GF(256).
 */
function magnitudesDeErro(sindromes, posicoes) {
  const total = posicoes.length;
  const matriz = [];
  for (let linha = 0; linha < total; linha += 1) {
    const valores = posicoes.map((expoente) => potencia(expoente * linha));
    valores.push(sindromes[linha]);
    matriz.push(valores);
  }

  for (let coluna = 0; coluna < total; coluna += 1) {
    let pivo = -1;
    for (let linha = coluna; linha < total; linha += 1) {
      if (matriz[linha][coluna] !== 0) {
        pivo = linha;
        break;
      }
    }
    if (pivo === -1) return null;
    const troca = matriz[coluna];
    matriz[coluna] = matriz[pivo];
    matriz[pivo] = troca;

    const fatorPivo = inverso(matriz[coluna][coluna]);
    for (let c = coluna; c <= total; c += 1) {
      matriz[coluna][c] = multiplicar(matriz[coluna][c], fatorPivo);
    }
    for (let linha = 0; linha < total; linha += 1) {
      if (linha === coluna || matriz[linha][coluna] === 0) continue;
      const fator = matriz[linha][coluna];
      for (let c = coluna; c <= total; c += 1) {
        matriz[linha][c] ^= multiplicar(fator, matriz[coluna][c]);
      }
    }
  }

  return matriz.map((linha) => linha[total]);
}

/*
 * Corrige um bloco (dados + codewords de correcao).
 * Retorna um novo array corrigido ou lanca erro se nao for possivel corrigir.
 */
export function corrigirBloco(bloco, quantidadeEc) {
  const mensagem = Array.from(bloco);
  const sindromes = calcularSindromes(mensagem, quantidadeEc);
  if (sindromes.every((valor) => valor === 0)) return mensagem;

  const localizador = localizadorDeErros(sindromes);
  const posicoes = posicoesDeErro(localizador, mensagem.length);
  const maximo = Math.floor(quantidadeEc / 2);

  if (posicoes.length === 0 || posicoes.length > maximo) {
    throw new Error("Nao foi possivel corrigir os dados do QR Code");
  }

  const magnitudes = magnitudesDeErro(sindromes, posicoes);
  if (!magnitudes) throw new Error("Nao foi possivel corrigir os dados do QR Code");

  posicoes.forEach((expoente, indice) => {
    const posicao = mensagem.length - 1 - expoente;
    mensagem[posicao] ^= magnitudes[indice];
  });

  const conferencia = calcularSindromes(mensagem, quantidadeEc);
  if (!conferencia.every((valor) => valor === 0)) {
    throw new Error("Nao foi possivel corrigir os dados do QR Code");
  }

  return mensagem;
}
