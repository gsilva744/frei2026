/*
 * Deteccao do QR Code na imagem binarizada:
 * 1. localiza os tres padroes de canto (finder patterns) pela razao 1:1:3:1:1;
 * 2. identifica qual e o canto superior esquerdo, superior direito e inferior esquerdo;
 * 3. estima o tamanho da grade e amostra os modulos com uma homografia.
 */

import { escuro } from "./binarizador";

/* Confere se as cinco faixas seguem a proporcao 1:1:3:1:1 */
function razaoValida(faixas) {
  const total = faixas.reduce((soma, valor) => soma + valor, 0);
  if (total < 7) return false;
  const modulo = total / 7;
  const tolerancia = modulo / 2;
  return (
    Math.abs(modulo - faixas[0]) < tolerancia &&
    Math.abs(modulo - faixas[1]) < tolerancia &&
    Math.abs(3 * modulo - faixas[2]) < 3 * tolerancia &&
    Math.abs(modulo - faixas[3]) < tolerancia &&
    Math.abs(modulo - faixas[4]) < tolerancia
  );
}

function centroDaFaixa(faixas, fim) {
  return fim - faixas[4] - faixas[3] - faixas[2] / 2;
}

/* Verifica o padrao na vertical e devolve o centro em Y */
function centroVertical(imagem, centroX, inicioY, maximoFaixa) {
  const faixas = [0, 0, 0, 0, 0];
  let y = inicioY;
  while (y >= 0 && escuro(imagem, centroX, y)) {
    faixas[2] += 1;
    y -= 1;
  }
  while (y >= 0 && !escuro(imagem, centroX, y) && faixas[1] <= maximoFaixa) {
    faixas[1] += 1;
    y -= 1;
  }
  while (y >= 0 && escuro(imagem, centroX, y) && faixas[0] <= maximoFaixa) {
    faixas[0] += 1;
    y -= 1;
  }

  y = inicioY + 1;
  while (y < imagem.altura && escuro(imagem, centroX, y)) {
    faixas[2] += 1;
    y += 1;
  }
  while (y < imagem.altura && !escuro(imagem, centroX, y) && faixas[3] <= maximoFaixa) {
    faixas[3] += 1;
    y += 1;
  }
  while (y < imagem.altura && escuro(imagem, centroX, y) && faixas[4] <= maximoFaixa) {
    faixas[4] += 1;
    y += 1;
  }

  if (!razaoValida(faixas)) return null;
  return { centro: centroDaFaixa(faixas, y), total: faixas.reduce((a, b) => a + b, 0) };
}

/* Verifica o padrao na horizontal e devolve o centro em X */
function centroHorizontal(imagem, centroY, inicioX, maximoFaixa) {
  const faixas = [0, 0, 0, 0, 0];
  let x = inicioX;
  while (x >= 0 && escuro(imagem, x, centroY)) {
    faixas[2] += 1;
    x -= 1;
  }
  while (x >= 0 && !escuro(imagem, x, centroY) && faixas[1] <= maximoFaixa) {
    faixas[1] += 1;
    x -= 1;
  }
  while (x >= 0 && escuro(imagem, x, centroY) && faixas[0] <= maximoFaixa) {
    faixas[0] += 1;
    x -= 1;
  }

  x = inicioX + 1;
  while (x < imagem.largura && escuro(imagem, x, centroY)) {
    faixas[2] += 1;
    x += 1;
  }
  while (x < imagem.largura && !escuro(imagem, x, centroY) && faixas[3] <= maximoFaixa) {
    faixas[3] += 1;
    x += 1;
  }
  while (x < imagem.largura && escuro(imagem, x, centroY) && faixas[4] <= maximoFaixa) {
    faixas[4] += 1;
    x += 1;
  }

  if (!razaoValida(faixas)) return null;
  return { centro: centroDaFaixa(faixas, x), total: faixas.reduce((a, b) => a + b, 0) };
}

/* Localiza os candidatos a padrao de canto */
export function localizarPadroes(imagem) {
  const encontrados = [];

  for (let y = 0; y < imagem.altura; y += 1) {
    const faixas = [0, 0, 0, 0, 0];
    let estado = 0;

    for (let x = 0; x < imagem.largura; x += 1) {
      const pixelEscuro = escuro(imagem, x, y) === 1;
      if (estado % 2 === (pixelEscuro ? 0 : 1)) {
        faixas[estado] += 1;
        continue;
      }

      if (estado === 4) {
        if (razaoValida(faixas)) {
          const total = faixas.reduce((a, b) => a + b, 0);
          const maximoFaixa = total / 7 + 1;
          const candidatoX = centroDaFaixa(faixas, x);
          const vertical = centroVertical(imagem, Math.round(candidatoX), y, maximoFaixa * 3);
          if (vertical) {
            const horizontal = centroHorizontal(
              imagem,
              Math.round(vertical.centro),
              Math.round(candidatoX),
              maximoFaixa * 3,
            );
            if (horizontal) {
              const tamanhoModulo = (vertical.total / 7 + horizontal.total / 7) / 2;
              adicionarPadrao(encontrados, horizontal.centro, vertical.centro, tamanhoModulo);
            }
          }
        }
        faixas[0] = faixas[2];
        faixas[1] = faixas[3];
        faixas[2] = faixas[4];
        faixas[3] = 1;
        faixas[4] = 0;
        estado = 3;
      } else {
        estado += 1;
        faixas[estado] = 1;
      }
    }
  }

  return encontrados.sort((a, b) => b.confirmacoes - a.confirmacoes);
}

function adicionarPadrao(lista, x, y, tamanhoModulo) {
  for (const padrao of lista) {
    if (
      Math.abs(padrao.x - x) <= tamanhoModulo &&
      Math.abs(padrao.y - y) <= tamanhoModulo &&
      Math.abs(padrao.tamanhoModulo - tamanhoModulo) <= Math.max(1, tamanhoModulo / 2)
    ) {
      const peso = padrao.confirmacoes;
      padrao.x = (padrao.x * peso + x) / (peso + 1);
      padrao.y = (padrao.y * peso + y) / (peso + 1);
      padrao.tamanhoModulo = (padrao.tamanhoModulo * peso + tamanhoModulo) / (peso + 1);
      padrao.confirmacoes = peso + 1;
      return;
    }
  }
  lista.push({ x, y, tamanhoModulo, confirmacoes: 1 });
}

function distancia(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/* Descobre quem e o canto superior esquerdo, superior direito e inferior esquerdo */
export function organizarCantos(padroes) {
  const [a, b, c] = padroes;
  const lados = [
    { valor: distancia(b, c), oposto: a, pontas: [b, c] },
    { valor: distancia(a, c), oposto: b, pontas: [a, c] },
    { valor: distancia(a, b), oposto: c, pontas: [a, b] },
  ].sort((x, y) => y.valor - x.valor);

  const superiorEsquerdo = lados[0].oposto;
  let [primeiro, segundo] = lados[0].pontas;

  /* Produto vetorial define a orientacao: sentido horario => primeiro e o topo direito */
  const cruzado =
    (primeiro.x - superiorEsquerdo.x) * (segundo.y - superiorEsquerdo.y) -
    (primeiro.y - superiorEsquerdo.y) * (segundo.x - superiorEsquerdo.x);
  if (cruzado < 0) {
    const troca = primeiro;
    primeiro = segundo;
    segundo = troca;
  }

  return { superiorEsquerdo, superiorDireito: primeiro, inferiorEsquerdo: segundo };
}

/* Homografia de quatro pontos: origem (modulos) -> destino (pixels) */
function homografia(origem, destino) {
  const matriz = [];
  const vetor = [];
  for (let i = 0; i < 4; i += 1) {
    const [x, y] = origem[i];
    const [u, v] = destino[i];
    matriz.push([x, y, 1, 0, 0, 0, -x * u, -y * u]);
    vetor.push(u);
    matriz.push([0, 0, 0, x, y, 1, -x * v, -y * v]);
    vetor.push(v);
  }

  for (let coluna = 0; coluna < 8; coluna += 1) {
    let pivo = coluna;
    for (let linha = coluna + 1; linha < 8; linha += 1) {
      if (Math.abs(matriz[linha][coluna]) > Math.abs(matriz[pivo][coluna])) pivo = linha;
    }
    [matriz[coluna], matriz[pivo]] = [matriz[pivo], matriz[coluna]];
    [vetor[coluna], vetor[pivo]] = [vetor[pivo], vetor[coluna]];

    const divisor = matriz[coluna][coluna];
    if (Math.abs(divisor) < 1e-10) return null;
    for (let c = coluna; c < 8; c += 1) matriz[coluna][c] /= divisor;
    vetor[coluna] /= divisor;

    for (let linha = 0; linha < 8; linha += 1) {
      if (linha === coluna) continue;
      const fator = matriz[linha][coluna];
      if (fator === 0) continue;
      for (let c = coluna; c < 8; c += 1) matriz[linha][c] -= fator * matriz[coluna][c];
      vetor[linha] -= fator * vetor[coluna];
    }
  }

  const p = vetor;
  return (x, y) => {
    const divisor = p[6] * x + p[7] * y + 1;
    return [(p[0] * x + p[1] * y + p[2]) / divisor, (p[3] * x + p[4] * y + p[5]) / divisor];
  };
}

/*
 * Detecta o QR Code e devolve a matriz de modulos (true = escuro).
 */
export function detectarMatriz(imagem) {
  const padroes = localizarPadroes(imagem);
  if (padroes.length < 3) return null;

  const cantos = organizarCantos(padroes.slice(0, 3));
  const { superiorEsquerdo, superiorDireito, inferiorEsquerdo } = cantos;

  const tamanhoModulo =
    (superiorEsquerdo.tamanhoModulo + superiorDireito.tamanhoModulo + inferiorEsquerdo.tamanhoModulo) /
    3;
  if (tamanhoModulo < 1) return null;

  const larguraModulos = distancia(superiorEsquerdo, superiorDireito) / tamanhoModulo;
  const alturaModulos = distancia(superiorEsquerdo, inferiorEsquerdo) / tamanhoModulo;
  let dimensao = Math.round((larguraModulos + alturaModulos) / 2) + 7;
  /* O tamanho valido sempre satisfaz dimensao % 4 === 1 */
  dimensao += ((4 - ((dimensao - 1) % 4)) % 4 + 4) % 4;
  if (dimensao < 21 || dimensao > 177) return null;

  /* Quarto canto estimado pelo paralelogramo formado pelos outros tres */
  const inferiorDireito = {
    x: superiorDireito.x + inferiorEsquerdo.x - superiorEsquerdo.x,
    y: superiorDireito.y + inferiorEsquerdo.y - superiorEsquerdo.y,
  };

  const limite = dimensao - 3.5;
  const transformar = homografia(
    [
      [3.5, 3.5],
      [limite, 3.5],
      [3.5, limite],
      [limite, limite],
    ],
    [
      [superiorEsquerdo.x, superiorEsquerdo.y],
      [superiorDireito.x, superiorDireito.y],
      [inferiorEsquerdo.x, inferiorEsquerdo.y],
      [inferiorDireito.x, inferiorDireito.y],
    ],
  );
  if (!transformar) return null;

  const matriz = [];
  for (let y = 0; y < dimensao; y += 1) {
    const linha = [];
    for (let x = 0; x < dimensao; x += 1) {
      const [px, py] = transformar(x + 0.5, y + 0.5);
      linha.push(escuro(imagem, Math.round(px), Math.round(py)) === 1);
    }
    matriz.push(linha);
  }

  return matriz;
}
