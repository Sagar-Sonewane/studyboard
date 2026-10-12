import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
}

export interface RenderedPdfPage {
  pageNumber: number;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Renders each page of a PDF document into an image blob using pdf.js.
 * @param file The PDF File object
 * @param onProgress Optional callback for reporting render progress per page
 */
export async function renderPdfToPages(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<RenderedPdfPage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const renderedPages: RenderedPdfPage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    // 1.5x scale for sharp text and crisp canvas rendering
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to acquire 2D canvas context for PDF rasterization');
    }

    // White background for transparent pages
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvas,
      canvasContext: ctx,
      viewport,
    }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to convert PDF page ${pageNum} to PNG blob`));
      }, 'image/png');
    });

    renderedPages.push({
      pageNumber: pageNum,
      blob,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
    });

    onProgress?.(pageNum, numPages);
  }

  return renderedPages;
}
