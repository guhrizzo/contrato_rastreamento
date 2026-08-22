/**
 * Utilitários compartilhados para exportar um elemento HTML (já convertido
 * em canvas pelo html2canvas) como um PDF multi-página via jsPDF.
 *
 * Problema que isso resolve: a versão antiga cortava o canvas em fatias de
 * altura fixa (uma "folha A4" por vez), sem olhar pro conteúdo — então uma
 * cláusula, parágrafo ou linha de tabela podia ficar com metade numa
 * página e metade na seguinte, saindo "cortado" no PDF final.
 *
 * Uma primeira tentativa de corrigir isso escaneava pixels do canvas
 * procurando uma linha "quase branca" perto do corte ideal. Não funcionou
 * de forma confiável: (1) o "quase branco" de uma folha inteira ainda tem
 * ruído de antialiasing que engana um limiar por pixel; e (2) mesmo com um
 * limiar por média, o espaço entre duas LINHAS dentro do mesmo parágrafo
 * também é "quase branco" — cortar ali ainda parte o parágrafo ao meio,
 * só que numa palavra diferente.
 *
 * A abordagem correta é olhar o DOM antes de rasterizar: o topo de cada
 * parágrafo, item de lista, linha de tabela ou título é, por definição, um
 * lugar seguro pra começar uma página nova (nunca corta o meio de um
 * bloco). `collectSafeBreakOffsets` coleta essas posições em px CSS;
 * `sliceCanvasToPdfPages` escolhe, pra cada corte "ideal", o offset seguro
 * mais próximo dentro de uma janela de busca.
 */

/**
 * Coleta, em px CSS relativos ao topo de `root`, o topo de cada bloco de
 * conteúdo (parágrafo, item de lista, linha de tabela, título, tabela,
 * separador) — candidatos seguros pra quebrar página sem cortar texto ao
 * meio. Precisa ser chamado enquanto `root` ainda está no DOM (mesmo que
 * fora da tela), com layout já calculado.
 */
export function collectSafeBreakOffsets(root: HTMLElement): number[] {
  const rootTop = root.getBoundingClientRect().top;
  const offsets = new Set<number>();
  offsets.add(0);

  const selector = "p, li, tr, h1, h2, h3, h4, h5, h6, table, hr";
  root.querySelectorAll(selector).forEach((el) => {
    const rect = el.getBoundingClientRect();
    const top = rect.top - rootTop;
    if (top > 0) offsets.add(top);
  });

  return Array.from(offsets).sort((a, b) => a - b);
}

/**
 * Fatia um canvas (resultado do html2canvas) em páginas A4 dentro de um
 * jsPDF já criado. Se `safeBreakOffsetsPx` for informado (offsets em
 * px do CANVAS, já multiplicados pela escala do html2canvas), cada corte é
 * ajustado pro offset seguro mais próximo do ideal — nunca cortando o meio
 * de um parágrafo, item de lista ou linha de tabela. Sem offsets, cai de
 * volta no corte de altura fixa (comportamento antigo).
 */
export function sliceCanvasToPdfPages(
  pdf: any,
  canvas: HTMLCanvasElement,
  pdfWidthMm: number,
  pdfHeightMm: number,
  safeBreakOffsetsPx: number[] = [],
  quality = 0.98
): void {
  const canvasWidthMm = pdfWidthMm;
  const canvasHeightMm = (canvas.height * canvasWidthMm) / canvas.width;

  if (canvasHeightMm <= pdfHeightMm) {
    const imgData = canvas.toDataURL("image/jpeg", quality);
    pdf.addImage(imgData, "JPEG", 0, 0, canvasWidthMm, canvasHeightMm);
    return;
  }

  const idealPageHeightPx = (pdfHeightMm * canvas.width) / canvasWidthMm;
  // IMPORTANTE: só procura um offset seguro pra TRÁS do corte ideal
  // (offset <= idealY), nunca pra frente. Uma página do PDF tem altura
  // fixa (uma folha A4); se o offset escolhido passasse do ideal, a fatia
  // recortada ficaria mais alta que a própria página, e `pdf.addImage`
  // simplesmente não desenha a parte que ultrapassa o limite — o
  // conteúdo que "sobra" desaparece, sem aparecer nem nesta página nem na
  // próxima (foi exatamente isso que causava trechos sumindo entre
  // páginas). Buscando só pra trás, a fatia nunca passa de
  // idealPageHeightPx, então nunca estoura a página.
  const maxSearchPx = idealPageHeightPx * 0.4;

  const offsets = safeBreakOffsetsPx
    .filter((o) => o > 0 && o < canvas.height)
    .sort((a, b) => a - b);

  function findNearestSafeOffset(idealY: number): number {
    if (offsets.length === 0) return Math.floor(idealY);
    let best: number | null = null;
    for (const o of offsets) {
      if (o > idealY) break;
      if (o < idealY - maxSearchPx) continue;
      best = o; // offsets estão ordenados crescentes; o último que passar é o mais próximo (por baixo) do ideal
    }
    return best !== null ? Math.floor(best) : Math.floor(idealY);
  }

  let currentPage = 1;
  let currentY = 0;

  while (currentY < canvas.height) {
    const idealEndY = currentY + idealPageHeightPx;
    let endY: number;

    if (idealEndY >= canvas.height) {
      endY = canvas.height;
    } else {
      endY = findNearestSafeOffset(idealEndY);
      // Garante progresso mesmo se a busca devolver algo <= currentY.
      if (endY <= currentY) {
        endY = Math.min(canvas.height, Math.ceil(idealEndY));
      }
    }

    const heightToCrop = endY - currentY;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = heightToCrop;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.drawImage(canvas, 0, currentY, canvas.width, heightToCrop, 0, 0, canvas.width, heightToCrop);
    }

    const croppedImgData = tempCanvas.toDataURL("image/jpeg", quality);
    if (currentPage > 1) pdf.addPage();

    const heightInMm = (heightToCrop * canvasWidthMm) / canvas.width;
    pdf.addImage(croppedImgData, "JPEG", 0, 0, canvasWidthMm, heightInMm);

    currentY = endY;
    currentPage++;
  }
}
