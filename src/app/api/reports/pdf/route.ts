import { Buffer } from "node:buffer";

import { NextResponse } from "next/server";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

import { renderReportHtml } from "@/lib/reports/renderReportHtml";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const snapshotId = url.searchParams.get("snapshotId");
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

  // Resolve agency_id for user (self-heal if missing)
  let agencyId: string | null = null;
  const agencyUser = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (agencyUser.data?.agency_id) {
    agencyId = agencyUser.data.agency_id as string;
  } else {
    // Self-heal: create agency + upsert mapping
    const agencyInsert = await supabase
      .from("agencies")
      .insert({ name: "New Agency" })
      .select("id")
      .single();
    if (agencyInsert.error || !agencyInsert.data?.id) {
      return NextResponse.json(
        { error: agencyInsert.error?.message ?? "Failed to create agency" },
        { status: 500 }
      );
    }
    agencyId = agencyInsert.data.id as string;

    const mapping = await supabase
      .from("agency_users")
      .upsert({ user_id: user.id, agency_id: agencyId, role: "owner" }, { onConflict: "user_id" })
      .select("agency_id")
      .single();
    if (mapping.error || !mapping.data?.agency_id) {
      return NextResponse.json(
        { error: mapping.error?.message ?? "Failed to map user to agency" },
        { status: 500 }
      );
    }
    agencyId = mapping.data.agency_id as string;
  }

  // Snapshot (get agency_id directly)
  const snapshotRes = await supabase
    .from("snapshots")
    .select(
      "id,status,vrtl_score,score_by_provider,created_at,completed_at,error,prompt_pack_version,client_id,agency_id"
    )
    .eq("id", snapshotId)
    .maybeSingle();
  if (snapshotRes.error || !snapshotRes.data) {
    return NextResponse.json({ error: "Snapshot not found", snapshotId }, { status: 404 });
  }
  const snapshotAgencyId = snapshotRes.data.agency_id as string;

  // Enforce snapshot belongs to user's agency
  if (snapshotAgencyId !== agencyId) {
    return NextResponse.json(
      { error: "Snapshot not in your agency", snapshotId, snapshotAgencyId, userAgencyId: agencyId },
      { status: 403 }
    );
  }

  const clientId = snapshotRes.data.client_id as string;

  // Agency
  const agencyRes = await supabase
    .from("agencies")
    .select("name,brand_logo_url,brand_accent")
    .eq("id", agencyId)
    .maybeSingle();
  const agency = agencyRes.data;
  if (!agency) {
    return NextResponse.json({ error: "Agency record not found", agencyId }, { status: 404 });
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

  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
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
  } finally {
    await browser.close();
  }
}


