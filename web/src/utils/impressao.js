/* Utilitários de impressão e compartilhamento (crachás e credenciais) */

const estilosImpressao = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #2b2b2b;
    padding: 10mm;
    background: #ffffff;
  }
  .folha-titulo {
    text-align: center;
    color: #17356f;
    font-size: 14px;
    margin-bottom: 6mm;
  }
  .folha-grade {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 4mm;
  }
  .cracha {
    border: 2px solid #17356f;
    border-radius: 10px;
    padding: 6px;
    text-align: center;
    break-inside: avoid;
    page-break-inside: avoid;
    height: 52mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    overflow: hidden;
  }
  .cracha-topo {
    background: #17356f;
    color: #ffffff;
    border-radius: 6px;
    padding: 4px 6px;
    width: 100%;
  }
  .cracha-topo strong { font-size: 11px; display: block; }
  .cracha-topo span { font-size: 8px; color: #f5c435; }
  .cracha svg { width: 78px !important; height: 78px !important; }
  .cracha-nome { font-size: 12px; font-weight: bold; color: #17356f; }
  .cracha-linha { font-size: 9px; color: #5c5c5c; }
  .cracha-codigo { font-size: 7px; color: #8a8a8a; word-break: break-all; }
  .cracha-setor { font-size: 9px; color: #17356f; font-weight: bold; }
  .nao-imprimir { display: none; }
  @page { size: A4 portrait; margin: 8mm; }
`;

/* Abre uma nova aba com o conteudo pronto para virar PDF pela caixa de impressao */
export function abrirJanelaImpressao({ titulo, conteudo }) {
  const janela = window.open("", "_blank", "width=900,height=1000");
  if (!janela) return false;

  janela.document.open();
  janela.document.write(
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />` +
      `<title>${titulo}</title><style>${estilosImpressao}</style></head><body>` +
      `<h1 class="folha-titulo">${titulo}</h1>${conteudo}</body></html>`,
  );
  janela.document.close();
  janela.focus();
  setTimeout(() => janela.print(), 350);
  return true;
}

/* Compartilha os dados da credencial; se o navegador nao suportar, copia o texto */
export async function compartilharCredencial({ titulo, texto }) {
  try {
    if (navigator.share) {
      await navigator.share({ title: titulo, text: texto });
      return "compartilhado";
    }
    await navigator.clipboard.writeText(texto);
    return "copiado";
  } catch {
    return "cancelado";
  }
}
