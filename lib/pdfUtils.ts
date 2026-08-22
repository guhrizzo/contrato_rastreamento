/**
 * Utilitários compartilhados para exportar um elemento HTML (já convertido
 * em canvas pelo html2canvas) como um PDF multi-página via jsPDF.
 *
 * Problema que isso resolve: a versão antiga cortava o canvas em fatias de
 * altura fixa (uma "folha A4" por vez), sem olhar pro conteúdo — então uma
 * cláusula, parágrafo ou linha de tabela podia ficar com metade numa
 * página e metade na seguinte, saindo "cortado" no PDF final.
 *
 * A função abaixo escaneia pixels perto do corte "ideal" procurando uma
 * linha quase toda branca (um espaço em branco entre blocos de conteúdo) e
 * ajusta o corte pra cair ali, evitando cortar o meio de um texto/linha.
 */

/**
 * Procura, a partir de idealY subindo até no máximo maxSearchPx, a linha
 * mais próxima que seja "quase toda branca" (fundo da página), para servir
 * de corte de página seguro. Se não achar nenhuma no intervalo, retorna o
 * próprio idealY (comportamento antigo, sem regressão).
 */
function findSafeBreakRow(canvas: HTMLCanvasElement, idealY: number, maxSearchPx: number): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return Math.floor(idealY);

  const width = canvas.width;
  const targetY = Math.min(Math.floor(idealY), canvas.height - 1);
  const minY = Math.max(1, Math.floor(idealY - maxSearchPx));

  for (let y = targetY; y > minY; y--) {
    let row: Uint8ClampedArray;
    try {
      row = ctx.getImageData(0, y, width, 1).data;
    } catch {
      // getImageData pode falhar por tainted canvas (imagem de outra origem
      // sem CORS); nesse caso desiste da busca e usa o corte original.
      return targetY;
    }
    let isBlank = true;
    // Amostra a cada ~6 pixels (24 bytes) para não escanear cada pixel — é
    // rápido o bastante mesmo em canvases grandes e ainda pega o essencial.
    for (let x = 0; x < row.length; x += 4 * 6) {
      if (row[x] < 248 || row[x + 1] < 248 || row[x + 2] < 248) {
        isBlank = false;
        break;
      }
    }
    if (isBlank) return y;
  }

  return targetY;
}

/**
 * Fatia um canvas (resultado do html2canvas) em páginas A4 dentro de um
 * jsPDF já criado, ajustando cada corte para a linha em branco mais
 * próxima do ideal — evitando cortar texto/tabelas ao meio.
 */
export function sliceCanvasToPdfPages(
  pdf: any,
  canvas: HTMLCanvasElement,
  pdfWidthMm: number,
  pdfHeightMm: number,
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
  // Não procura mais que ~20% da altura da página (ou 320px) por uma quebra
  // segura, senão o texto ficaria empurrado demais para a página seguinte.
  const maxSearchPx = Math.min(idealPageHeightPx * 0.2, 320);

  let currentPage = 1;
  let currentY = 0;

  while (currentY < canvas.height) {
    const idealEndY = currentY + idealPageHeightPx;
    let endY: number;

    if (idealEndY >= canvas.height) {
      endY = canvas.height;
    } else {
      endY = findSafeBreakRow(canvas, idealEndY, maxSearchPx);
      // Garante progresso mesmo se a busca não encontrar nada útil.
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
