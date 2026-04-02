import type { DocumentProps } from "@react-pdf/renderer";
import { Document, Page, Text, renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import React from "react";

import { getPdfLastTrace, resetPdfTrace } from "./pdfDiagnostics";
import { ReportDocument } from "./ReportDocument";
import { sanitizeReportDataForPdf } from "./sanitizeReportData";
import type { ReportData } from "./types";

export type GeneratePdfOptions = {
  pages?: number[];
};

export type MinimalProbeResult =
  | { ok: true; bytes: number }
  | { ok: false; message: string; stack?: string };

export type PageProbeRow = {
  page: number;
  ok: boolean;
  message?: string;
  stack?: string;
  lastTrace?: { page: number; section: string };
};

function minimalPdfElement(): ReactElement<DocumentProps> {
  return React.createElement(
    Document,
    {},
    React.createElement(Page, { size: "A4" }, React.createElement(Text, {}, "test"))
  );
}

export async function generatePdfMinimalBuffer(): Promise<Buffer> {
  return renderToBuffer(minimalPdfElement());
}

export async function probeMinimalPdf(): Promise<MinimalProbeResult> {
  try {
    const buf = await renderToBuffer(minimalPdfElement());
    return { ok: true, bytes: buf.length };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    return { ok: false, message: e.message, stack: e.stack };
  }
}

export async function probeReportPagesOneAtATime(data: ReportData): Promise<PageProbeRow[]> {
  const safe = sanitizeReportDataForPdf(data);
  const rows: PageProbeRow[] = [];
  for (let p = 1; p <= 6; p++) {
    resetPdfTrace();
    try {
      const buf = await renderToBuffer(
        React.createElement(ReportDocument, {
          data: safe,
          pages: [p],
        }) as ReactElement<DocumentProps>
      );
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

export async function generatePDF(data: ReportData, options?: GeneratePdfOptions): Promise<Buffer> {
  resetPdfTrace();
  const safe = sanitizeReportDataForPdf(data);
  try {
    return await renderToBuffer(
      React.createElement(ReportDocument, {
        data: safe,
        pages: options?.pages,
      }) as ReactElement<DocumentProps>
    );
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
