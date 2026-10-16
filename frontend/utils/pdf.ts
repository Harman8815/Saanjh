/**
 * Client-side PDF generation for wedding cards and invitations.
 *
 * The DOM node is rasterised with html2canvas and embedded into a jsPDF
 * document, so the downloaded file matches what the user sees in the preview
 * without a server round-trip.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfOptions {
  /** Base filename without extension. */
  filename?: string;
  /** Page orientation. */
  orientation?: 'portrait' | 'landscape';
  /** Background colour used to fill the page outside the captured area. */
  background?: string;
}

export async function generatePdfFromElement(
  element: HTMLElement,
  options: PdfOptions = {}
): Promise<void> {
  const {
    filename = 'invitation',
    orientation = 'portrait',
  } = options;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const imageWidth = usableWidth;
  const imageHeight = (canvas.height * usableWidth) / canvas.width;

  const imageData = canvas.toDataURL('image/png');

  // A tall invitation may not fit on a single page, so slice it across pages.
  let renderedHeight = 0;
  let page = 0;
  while (renderedHeight < imageHeight) {
    if (page > 0) {
      pdf.addPage();
    }

    // Crop the source canvas to the slice that belongs on this page.
    const sourceY = (renderedHeight * canvas.height) / imageHeight;
    const sourceHeight = Math.min(
      (usableHeight * canvas.height) / imageHeight,
      canvas.height - sourceY
    );

    if (sourceHeight <= 0) break;

    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sourceHeight;
    const context = slice.getContext('2d');

    if (context) {
      context.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceHeight,
        0,
        0,
        canvas.width,
        sourceHeight
      );
    }

    const sliceHeight = (sourceHeight * usableWidth) / canvas.width;
    pdf.addImage(
      slice.toDataURL('image/png'),
      'PNG',
      margin,
      margin,
      usableWidth,
      sliceHeight
    );

    renderedHeight += usableHeight;
    page += 1;
  }

  pdf.save(`${filename}.pdf`);
}
