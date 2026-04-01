import type { DocumentProps } from "@react-pdf/renderer";
import { Document, Page, pdf, renderToBuffer, Text } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ReportData } from "./types";
import { ReportDocument } from "./ReportDocument";
import { getPdfLastTrace, resetPdfTrace } from "./pdfDiagnostics";

export type GeneratePdfOptions = {
  /** 1-based page numbers to include; omit for full report. */
  pages?: number[];
};

function reportDoc(data: ReportData, pages?: number[]): ReactElement<DocumentProps> {
  return <ReportDocument data={data} pages={pages} />;
}

/** Minimal React-PDF sanity check (no theme, no custom fonts). */
export async function generatePdfMinimalBuffer(): Promise<Buffer> {
  const el = (
    <Document>
      <Page size="A4">
        <Text>test</Text>
      </Page>
    </Document>
  );
  return renderToBuffer(el);
}

export type MinimalProbeResult =
  | { ok: true; bytes: number }
  | { ok: false; message: string; stack?: string };

export async function probeMinimalPdf(): Promise<MinimalProbeResult> {
  try {
    const buf = await generatePdfMinimalBuffer();
    return { ok: true, bytes: buf.length };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    return { ok: false, message: e.message, stack: e.stack };
  }
}

export type PageProbeRow = {
  page: number;
  ok: boolean;
  message?: string;
  stack?: string;
  /** Present when ok is false — last PdfTraceMarker before the throw (best-effort). */
  lastTrace?: { page: number; section: string };
};

/** Renders each report page as its own one-page PDF to locate a failing page. */
export async function probeReportPagesOneAtATime(data: ReportData): Promise<PageProbeRow[]> {
  const rows: PageProbeRow[] = [];
  for (let p = 1; p <= 6; p++) {
    resetPdfTrace();
    try {
      const buf = await renderToBuffer(reportDoc(data, [p]));
      rows.push({ page: p, ok: true });
      void buf;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      rows.push({
        page: p,
        ok: false,
        message: e.message,
        stack: e.stack,
        lastTrace: getPdfLastTrace(),
      });
    }
  }
  return rows;
}

/** Server / Node: returns raw PDF bytes */
export async function generatePDF(data: ReportData, options?: GeneratePdfOptions): Promise<Buffer> {
  resetPdfTrace();
  try {
    return await renderToBuffer(reportDoc(data, options?.pages));
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

/** Browser: downloadable Blob (same visual as server export) */
export async function generatePdfBlob(data: ReportData, options?: GeneratePdfOptions): Promise<Blob> {
  resetPdfTrace();
  try {
    const instance = pdf(reportDoc(data, options?.pages));
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
