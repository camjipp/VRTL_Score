import { NextResponse } from "next/server";

import {
  probeMinimalPdf,
  probeReportPagesOneAtATime,
} from "@/lib/reports/pdf/generatePdf";
import { summarizeReportDataShape } from "@/lib/reports/pdf/pdfDiagnostics";
import { stanleyData } from "@/lib/reports/pdf/stanleyData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Local / CI fixture probes without DB. Disabled unless PDF_REPORT_DEBUG=1 and
 * header X-PDF-Debug-Secret matches PDF_REPORT_DEBUG_SECRET.
 */
export async function GET(req: Request) {
  if (process.env.PDF_REPORT_DEBUG !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const expected = process.env.PDF_REPORT_DEBUG_SECRET;
  const secret = req.headers.get("x-pdf-debug-secret");
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextRuntime = process.env.NEXT_RUNTIME ?? null;
  if (nextRuntime === "edge") {
    return NextResponse.json({ error: "Requires nodejs runtime" }, { status: 500 });
  }

  try {
    const minimalProbe = await probeMinimalPdf();
    const pageProbes = await probeReportPagesOneAtATime(stanleyData);
    return NextResponse.json({
      fixture: "stanleyData",
      minimalProbe,
      pageProbes,
      reportDataSummary: summarizeReportDataShape(stanleyData),
      diagnostics: {
        nextRuntime,
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      hint: "Set PDF_SECTION_LOG=1 when running the dev server to log [pdf-trace] lines.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("pdf_debug_route_failed", { message, stack });
    return NextResponse.json(
      { error: "Debug probe failed", message, stack },
      { status: 500 }
    );
  }
}
