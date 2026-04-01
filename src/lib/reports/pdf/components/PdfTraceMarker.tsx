import { View } from "@react-pdf/renderer";
import { markPdfTrace } from "../pdfDiagnostics";

/** Marks the last-rendered section for crash diagnostics (see PDF_SECTION_LOG=1). */
export function PdfTraceMarker({ page, section }: { page: number; section: string }) {
  markPdfTrace(page, section);
  return <View style={{ height: 0, width: 0, minHeight: 0, minWidth: 0 }} />;
}
