import type { DocumentProps } from "@react-pdf/renderer";
import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "./types";
import { ReportDocument } from "./ReportDocument";
import { getPdfLastTrace, resetPdfTrace } from "./pdfDiagnostics";
import { sanitizeReportDataForPdf } from "./sanitizeReportData";

export type { GeneratePdfOptions } from "./generatePdfServer";

/** Browser: downloadable Blob (client preview / download). */
export async function generatePdfBlob(data: ReportData, options?: { pages?: number[] }): Promise<Blob> {
  resetPdfTrace();
  const safe = sanitizeReportDataForPdf(data);
  const doc = (pages?: number[]): ReactElement<DocumentProps> => (
    <ReportDocument data={safe} pages={pages} />
  );
  try {
    const instance = pdf(doc(options?.pages));
    return await instance.toBlob();
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    const wrapped = new Error(e.message) as Error & {
      pdfContext?: { lastTrace: ReturnType<typeof getPdfLastTrace>; requestedPages: number[] | "all" };
    };
    wrapped.stack = e.stack;
    wrapped.pdfContext = {
      lastTrace: getPdfLastTrace(),
      requestedPages: options?.pages?.length ? options.pages : "all",
    };
    throw wrapped;
  }
}

/** Alias of `generatePDF` from `./generatePdfServer` (same in-process path as the API). */
export { generatePDF as generatePDFInProcess } from "./generatePdfServer";
