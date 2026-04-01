import { NextResponse } from "next/server";

import type { Extraction } from "@/lib/extraction/schema";
import { mapSnapshotToReactPdfData } from "@/lib/reports/mapSnapshotToReactPdfData";
import {
  generatePDF,
  generatePdfMinimalBuffer,
  probeMinimalPdf,
  probeReportPagesOneAtATime,
} from "@/lib/reports/pdf/generatePdf";
import { isPdfDiagnosticsEnabled, summarizeReportDataShape } from "@/lib/reports/pdf/pdfDiagnostics";
import type { ReportData } from "@/lib/reports/pdf/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Query (diagnostics when NODE_ENV=development or PDF_DIAGNOSTICS=1):
 * - pdfDebug=minimal — smoke-test React-PDF (Document/Page/Text); same Bearer auth, no snapshot payload.
 * - pdfDebug=probe — JSON: minimalProbe, pageProbes (pages 1–6 solo), reportDataSummary; needs snapshotId + access.
 * - pageOnly=3 or pageOnly=1,2 — render only listed 1-based pages (PDF download).
 * Server logs: PDF_SECTION_LOG=1 prints [pdf-trace] for PdfTraceMarker sections.
 */

type AgencyForReport = {
  name: string;
  brand_logo_url?: string | null;
  brand_accent?: string | null;
};

function parseAgencyForReport(value: unknown): AgencyForReport | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.name !== "string" || v.name.length === 0) return null;
  const brand_logo_url =
    typeof v.brand_logo_url === "string" ? v.brand_logo_url : (v.brand_logo_url ?? null);
  const brand_accent =
    typeof v.brand_accent === "string" ? v.brand_accent : (v.brand_accent ?? null);
  return {
    name: v.name,
    brand_logo_url: brand_logo_url as string | null,
    brand_accent: brand_accent as string | null,
  };
}

async function getColumnSet(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  tableName: string
): Promise<Set<string>> {
  try {
    const res = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_schema", "public")
      .eq("table_name", tableName);
    if (res.error || !res.data) return new Set();
    return new Set(
      (res.data as Array<{ column_name: string | null }>)
        .map((r) => r.column_name)
        .filter((c): c is string => typeof c === "string" && c.length > 0)
    );
  } catch {
    return new Set();
  }
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function safePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]+/g, "")
    .trim()
    .replace(/[\s_-]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeScoreByProvider(raw: unknown): Record<string, number> | null {
  let obj: unknown = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj)) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) out[k] = n;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function normalizeParsedJson(pj: unknown): Extraction | null {
  if (pj == null) return null;
  if (typeof pj === "string") {
    try {
      const o = JSON.parse(pj) as unknown;
      if (!o || typeof o !== "object" || Array.isArray(o)) return null;
      return o as Extraction;
    } catch {
      return null;
    }
  }
  if (typeof pj === "object" && !Array.isArray(pj)) return pj as Extraction;
  return null;
}

/** Dev/diagnostics: `pageOnly=3` or `pageOnly=1,2` (1-based). */
function parsePageOnlyParam(raw: string | null): number[] | undefined {
  if (!raw?.trim()) return undefined;
  const parts = raw.split(",").map((s) => parseInt(s.trim(), 10));
  if (parts.some((n) => !Number.isFinite(n) || n < 1 || n > 6)) return undefined;
  return parts;
}

export async function GET(req: Request) {
  const nextRuntime = process.env.NEXT_RUNTIME ?? null;
  if (nextRuntime === "edge") {
    return NextResponse.json(
      { error: "PDF generation requires nodejs runtime (not edge)", diagnostics: { nextRuntime } },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const pdfDebug = url.searchParams.get("pdfDebug");
  const pageOnlyRaw = url.searchParams.get("pageOnly");
  const snapshotId = url.searchParams.get("snapshotId");

  const supabase = getSupabaseAdminClient();

  if (pdfDebug === "minimal" && isPdfDiagnosticsEnabled()) {
    try {
      const token = bearerToken(req);
      if (!token) {
        return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
      }
      const userRes = await supabase.auth.getUser(token);
      if (userRes.error || !userRes.data.user) {
        return NextResponse.json(
          { error: userRes.error?.message ?? "Unauthorized" },
          { status: 401 }
        );
      }
      const minimalProbe = await probeMinimalPdf();
      if (!minimalProbe.ok) {
        return NextResponse.json(
          {
            error: "Minimal PDF probe failed",
            message: minimalProbe.message,
            stack: minimalProbe.stack,
            diagnostics: { nextRuntime, node: process.version, platform: process.platform, arch: process.arch },
          },
          { status: 500 }
        );
      }
      const buffer = await generatePdfMinimalBuffer();
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="pdf_minimal_probe.pdf"',
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      console.error("pdf_minimal_probe_failed", { message, stack });
      return NextResponse.json(
        {
          error: "Minimal PDF generation failed",
          message,
          stack,
          diagnostics: { nextRuntime, node: process.version, platform: process.platform, arch: process.arch },
        },
        { status: 500 }
      );
    }
  }

  let pdfData: ReportData | null = null;

  try {
    if (!snapshotId) {
      return NextResponse.json({ error: "Missing snapshotId" }, { status: 400 });
    }

    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
    }

    const userRes = await supabase.auth.getUser(token);
    const user = userRes.data.user;
    if (userRes.error || !user) {
      return NextResponse.json(
        { error: userRes.error?.message ?? "Unauthorized" },
        { status: 401 }
      );
    }

    const snapshotRes = await supabase
      .from("snapshots")
      .select(
        "id,status,vrtl_score,score_by_provider,created_at,completed_at,error,prompt_pack_version,client_id,agency_id"
      )
      .eq("id", snapshotId)
      .single();
    if (snapshotRes.error || !snapshotRes.data) {
      return NextResponse.json({ error: "Snapshot not found", snapshotId }, { status: 404 });
    }
    const snapshotAgencyId = snapshotRes.data.agency_id as string;

    const agencyUser = await supabase
      .from("agency_users")
      .select("agency_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (agencyUser.error || !agencyUser.data?.agency_id) {
      return NextResponse.json({ error: "User not onboarded" }, { status: 403 });
    }
    const userAgencyId = agencyUser.data.agency_id as string;

    if (snapshotAgencyId !== userAgencyId) {
      return NextResponse.json(
        { error: "Snapshot not in your agency", snapshotId, snapshotAgencyId, userAgencyId },
        { status: 403 }
      );
    }

    const agencyId = snapshotAgencyId;
    const clientId = snapshotRes.data.client_id as string;

    const agencyCols = await getColumnSet(supabase, "agencies");
    const selectCols = ["name"];
    if (agencyCols.has("brand_logo_url")) selectCols.push("brand_logo_url");
    if (agencyCols.has("brand_accent")) selectCols.push("brand_accent");

    const agencyRes = await supabase
      .from("agencies")
      .select(selectCols.join(","))
      .eq("id", agencyId)
      .maybeSingle();
    let agency: AgencyForReport | null = parseAgencyForReport(agencyRes.data);
    if (!agency) {
      const agencyInsert = await supabase
        .from("agencies")
        .insert({ id: agencyId, name: "New Agency" })
        .select(selectCols.join(","))
        .single();
      if (agencyInsert.error || !agencyInsert.data) {
        return NextResponse.json(
          { error: agencyInsert.error?.message ?? "Failed to create agency", agencyId },
          { status: 500 }
        );
      }
      agency = parseAgencyForReport(agencyInsert.data);
    }
    if (!agency?.name) {
      return NextResponse.json({ error: "Agency not found" }, { status: 500 });
    }

    const clientRes = await supabase
      .from("clients")
      .select("id,name,website")
      .eq("id", clientId)
      .maybeSingle();
    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const competitorsRes = await supabase
      .from("competitors")
      .select("name,website")
      .eq("client_id", clientId);
    const competitors = competitorsRes.data ?? [];

    const responsesRes = await supabase
      .from("responses")
      .select("prompt_ordinal,prompt_text,parsed_json,raw_text")
      .eq("snapshot_id", snapshotId)
      .order("prompt_ordinal", { ascending: true });
    const responses = responsesRes.data ?? [];

    const snap = snapshotRes.data;
    const snapshotInput = {
      agency,
      client: {
        ...clientRes.data,
        name: clientRes.data.name?.trim() || "Client",
      },
      snapshot: {
        ...snap,
        score_by_provider: normalizeScoreByProvider(snap.score_by_provider),
      },
      competitors: competitors.map((c) => ({
        ...c,
        name: c.name?.trim() || "Unknown",
      })),
      responses: responses.map((r) => ({
        ...r,
        parsed_json: normalizeParsedJson(r.parsed_json),
      })),
    };

    pdfData = mapSnapshotToReactPdfData(snapshotInput, {
      name: agency.name,
      brand_logo_url: agency.brand_logo_url ?? null,
    });

    console.log("[pdf] react-pdf", {
      nextRuntime,
      node: process.version,
      snapshotId,
      client: clientRes.data.name,
    });

    if (pdfDebug === "probe" && isPdfDiagnosticsEnabled()) {
      const minimalProbe = await probeMinimalPdf();
      const pageProbes = await probeReportPagesOneAtATime(pdfData);
      return NextResponse.json({
        snapshotId,
        minimalProbe,
        pageProbes,
        reportDataSummary: summarizeReportDataShape(pdfData),
        hint: "Server: set PDF_SECTION_LOG=1 to log [pdf-trace] section markers to stderr.",
      });
    }

    const pageOnlyFilter = isPdfDiagnosticsEnabled() ? parsePageOnlyParam(pageOnlyRaw) : undefined;
    const buffer = await generatePDF(
      pdfData,
      pageOnlyFilter?.length ? { pages: pageOnlyFilter } : undefined
    );

    const clientPart = safePart(clientRes.data.name || "Client").slice(0, 48) || "Client";
    const datePart = new Date(snapshotRes.data.created_at as string).toISOString().slice(0, 10);
    const snapPart = String(snapshotRes.data.id).slice(0, 8);
    const filename = `AI_Visibility_Report_${clientPart}_${datePart}_Snap-${snapPart}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    const pdfContext =
      err && typeof err === "object" && "pdfContext" in err
        ? (err as { pdfContext?: unknown }).pdfContext
        : undefined;

    if (stack) {
      console.error("pdf_generation_failed", { snapshotId, message, stack });
    } else {
      console.error("pdf_generation_failed", { snapshotId, message });
    }

    const diagEnabled = isPdfDiagnosticsEnabled();
    let minimalProbe: Awaited<ReturnType<typeof probeMinimalPdf>> | undefined;
    let pageProbes: Awaited<ReturnType<typeof probeReportPagesOneAtATime>> | undefined;
    let reportDataSummary: ReturnType<typeof summarizeReportDataShape> | undefined;

    if (diagEnabled) {
      minimalProbe = await probeMinimalPdf();
      if (pdfData) {
        reportDataSummary = summarizeReportDataShape(pdfData);
        pageProbes = await probeReportPagesOneAtATime(pdfData);
      }
    }

    return NextResponse.json(
      {
        error: "PDF generation failed",
        message,
        snapshotId,
        ...(diagEnabled
          ? {
              stack,
              pdfContext,
              reportDataSummary,
              minimalProbe,
              pageProbes,
            }
          : {}),
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
