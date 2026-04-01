import { NextResponse } from "next/server";

import { generatePDF } from "@/lib/reports/pdf/generatePdf";
import { stanleyData } from "@/lib/reports/pdf/stanleyData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function GET(req: Request) {
  const expected = process.env.PDF_HEALTH_TOKEN;
  const token = bearerToken(req);
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextRuntime = process.env.NEXT_RUNTIME ?? null;
  if (nextRuntime === "edge") {
    return NextResponse.json(
      { error: "PDF healthcheck must run in nodejs runtime", diagnostics: { nextRuntime } },
      { status: 500 }
    );
  }

  const startedAt = Date.now();

  try {
    const buf = await generatePDF(stanleyData);
    const ok = buf.length > 1000;

    return NextResponse.json({
      ok,
      engine: "@react-pdf/renderer",
      pdf_bytes: buf.length,
      duration_ms: Date.now() - startedAt,
      diagnostics: {
        nextRuntime,
        node: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: "React-PDF healthcheck failed",
        message,
        diagnostics: {
          nextRuntime,
          node: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      },
      { status: 500 }
    );
  }
}
