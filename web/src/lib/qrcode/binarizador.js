/*
 * Binarizacao adaptativa: converte a imagem em uma matriz de bits
 * onde 1 significa modulo escuro.
 * Usa media local por blocos de 8x8 para tolerar iluminacao irregular.
 */

const BLOCO = 8;

function escalaDeCinza(imageData) {
  const { width, height, data } = imageData;
  const cinza = new Uint8ClampedArray(width * height);
  for (let i = 0; i < cinza.length; i += 1) {
    const p = i * 4;
    cinza[i] = (data[p] * 77 + data[p + 1] * 151 + data[p + 2] * 28) >> 8;
  }
  return cinza;
}

export function binarizar(imageData) {
  const largura = imageData.width;
  const altura = imageData.height;
  const cinza = escalaDeCinza(imageData);
  const bits = new Uint8Array(largura * altura);

  const blocosX = Math.max(1, Math.ceil(largura / BLOCO));
  const blocosY = Math.max(1, Math.ceil(altura / BLOCO));
  const medias = new Float32Array(blocosX * blocosY);

  let somaGeral = 0;
  for (let by = 0; by < blocosY; by += 1) {
    for (let bx = 0; bx < blocosX; bx += 1) {
      let soma = 0;
      let quantidade = 0;
      let minimo = 255;
      let maximo = 0;
      for (let y = by * BLOCO; y < Math.min(altura, (by + 1) * BLOCO); y += 1) {
        for (let x = bx * BLOCO; x < Math.min(largura, (bx + 1) * BLOCO); x += 1) {
          const valor = cinza[y * largura + x];
          soma += valor;
          quantidade += 1;
          if (valor < minimo) minimo = valor;
          if (valor > maximo) maximo = valor;
        }
      }
      let media = soma / Math.max(1, quantidade);
      /* Bloco quase uniforme: provavelmente e apenas fundo claro */
      if (maximo - minimo <= 24) media = minimo / 2 + 1;
      medias[by * blocosX + bx] = media;
      somaGeral += media;
    }
  }

  const mediaGeral = somaGeral / medias.length;

  for (let by = 0; by < blocosY; by += 1) {
    for (let bx = 0; bx < blocosX; bx += 1) {
      /* Limiar suavizado com a vizinhanca 5x5 de blocos */
      let soma = 0;
      let quantidade = 0;
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          const y = by + dy;
          const x = bx + dx;
          if (y < 0 || x < 0 || y >= blocosY || x >= blocosX) continue;
          soma += medias[y * blocosX + x];
          quantidade += 1;
        }
      }
      const limiar = quantidade > 0 ? soma / quantidade : mediaGeral;

      for (let y = by * BLOCO; y < Math.min(altura, (by + 1) * BLOCO); y += 1) {
        for (let x = bx * BLOCO; x < Math.min(largura, (bx + 1) * BLOCO); x += 1) {
          bits[y * largura + x] = cinza[y * largura + x] < limiar ? 1 : 0;
        }
      }
    }
  }

  return { largura, altura, bits };
}

export function escuro(imagem, x, y) {
  if (x < 0 || y < 0 || x >= imagem.largura || y >= imagem.altura) return 0;
  return imagem.bits[y * imagem.largura + x];
}
