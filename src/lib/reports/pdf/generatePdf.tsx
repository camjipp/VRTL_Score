import type { DocumentProps } from "@react-pdf/renderer";
import { pdf, renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "./types";
import { ReportDocument } from "./ReportDocument";
import { registerPdfFonts } from "./registerFonts";

const doc = (data: ReportData): ReactElement<DocumentProps> => <ReportDocument data={data} />;

/** Server / Node: returns raw PDF bytes */
export async function generatePDF(data: ReportData): Promise<Buffer> {
  registerPdfFonts();
  return renderToBuffer(doc(data));
}

/** Browser: downloadable Blob (same visual as server export) */
export async function generatePdfBlob(data: ReportData): Promise<Blob> {
  registerPdfFonts();
  const instance = pdf(doc(data));
  return instance.toBlob();
}
