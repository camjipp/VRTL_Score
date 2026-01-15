import { Buffer } from "node:buffer";

import { NextResponse } from "next/server";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

import { renderReportHtml } from "@/lib/reports/renderReportHtml";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

export async function GET(req: Request) {
  const nextRuntime = process.env.NEXT_RUNTIME ?? null;
  if (nextRuntime === "edge") {
    return NextResponse.json(
      { error: "PDF generation requires nodejs runtime (not edge)", diagnostics: { nextRuntime } },
      { status: 500 }
    );
  }

  const url = new URL(req.url);
  const snapshotId = url.searchParams.get("snapshotId");

  // Track diagnostics even if we fail early.
  const headlessMode = "shell" as const;
  let executablePath: string | null = null;
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    if (!snapshotId) {
      return NextResponse.json({ error: "Missing snapshotId" }, { status: 400 });
    }

    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
    }

    const supabase = getSupabaseAdminClient();

    // Auth user
    const userRes = await supabase.auth.getUser(token);
    const user = userRes.data.user;
    if (userRes.error || !user) {
      return NextResponse.json(
        { error: userRes.error?.message ?? "Unauthorized" },
        { status: 401 }
      );
    }

    // Snapshot (authoritative agency_id)
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

    // Resolve agency membership for user (no auto-create here)
    const agencyUser = await supabase
      .from("agency_users")
      .select("agency_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (agencyUser.error || !agencyUser.data?.agency_id) {
      return NextResponse.json({ error: "User not onboarded" }, { status: 403 });
    }
    const userAgencyId = agencyUser.data.agency_id as string;

    // Enforce snapshot belongs to user's agency
    if (snapshotAgencyId !== userAgencyId) {
      return NextResponse.json(
        { error: "Snapshot not in your agency", snapshotId, snapshotAgencyId, userAgencyId },
        { status: 403 }
      );
    }

    const agencyId = snapshotAgencyId;
    const clientId = snapshotRes.data.client_id as string;

    // Agency
    const agencyCols = await getColumnSet(supabase, "agencies");
    const selectCols = ["name"];
    if (agencyCols.has("brand_logo_url")) selectCols.push("brand_logo_url");
    if (agencyCols.has("brand_accent")) selectCols.push("brand_accent");

    const agencyRes = await supabase
      .from("agencies")
      .select(selectCols.join(","))
      .eq("id", agencyId)
      .maybeSingle();
    let agency = agencyRes.data;
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
      agency = agencyInsert.data;
    }

    // Client
    const clientRes = await supabase
      .from("clients")
      .select("id,name,website")
      .eq("id", clientId)
      .maybeSingle();
    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Competitors
    const competitorsRes = await supabase
      .from("competitors")
      .select("name,website")
      .eq("client_id", clientId);
    const competitors = competitorsRes.data ?? [];

    // Responses
    const responsesRes = await supabase
      .from("responses")
      .select("prompt_ordinal,prompt_text,parsed_json,raw_text")
      .eq("snapshot_id", snapshotId)
      .order("prompt_ordinal", { ascending: true });
    const responses = responsesRes.data ?? [];

    const html = renderReportHtml({
      agency,
      client: clientRes.data,
      snapshot: snapshotRes.data,
      competitors,
      responses
    });

    // Hard: always use Sparticuz-provided executablePath (it extracts to /tmp on Lambda/Vercel).
    executablePath = await chromium.executablePath();
    console.log("[pdf] runtime", {
      nextRuntime,
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      executablePath,
      argsLength: chromium.args.length
    });

    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: headlessMode
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30_000);
    // Avoid "networkidle0" hanging on external assets (e.g., logos).
    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" }
    });
    const filename = `VRTLScore_${clientRes.data.name.replace(/\s+/g, "_")}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    const body = Buffer.from(pdfBuffer);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("pdf_generation_failed", { snapshotId, message, executablePath });
    return NextResponse.json(
      {
        error: "PDF generation failed",
        message,
        snapshotId,
        diagnostics: {
          nextRuntime,
          awsLambdaJsRuntime: process.env.AWS_LAMBDA_JS_RUNTIME ?? null,
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          executablePath,
          argsLength: chromium.args.length,
          headless: headlessMode
        }
      },
      { status: 500 }
    );
  } finally {
    if (browser) await browser.close();
  }
}


