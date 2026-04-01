import { getPdfLastTrace, resetPdfTrace } from "./pdfDiagnostics";
import { renderPdfViaWorker, type WorkerPayload } from "./renderPdfWorkerSpawn";
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

export async function generatePdfMinimalBuffer(): Promise<Buffer> {
  return renderPdfViaWorker({ mode: "minimal" });
}

export async function probeMinimalPdf(): Promise<MinimalProbeResult> {
  try {
    const buf = await renderPdfViaWorker({ mode: "minimal" });
    return { ok: true, bytes: buf.length };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    return { ok: false, message: e.message, stack: e.stack };
  }
}

export async function probeReportPagesOneAtATime(data: ReportData): Promise<PageProbeRow[]> {
  const rows: PageProbeRow[] = [];
  for (let p = 1; p <= 6; p++) {
    resetPdfTrace();
    try {
      const buf = await renderPdfViaWorker({
        mode: "full",
        data,
        pages: [p],
      } satisfies WorkerPayload);
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
  try {
    return await renderPdfViaWorker({
      mode: "full",
      data,
      pages: options?.pages,
    });
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
