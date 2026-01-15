import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SettingsUpdateBody = {
  name?: string;
  brand_accent?: string | null;
};

type AgencySettings = {
  agency_id: string;
  name: string;
  brand_logo_url?: string | null;
  brand_accent?: string | null;
};

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function isMissingColumnError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const any = e as { code?: unknown; message?: unknown; details?: unknown };
  const code = typeof any.code === "string" ? any.code : "";
  const msg = typeof any.message === "string" ? any.message : "";
  const details = typeof any.details === "string" ? any.details : "";
  return code === "PGRST204" || msg.includes("schema cache") || details.includes("schema cache");
}

export async function GET(req: Request) {
  const token = bearerToken(req);
  if (!token) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  const userRes = await supabase.auth.getUser(token);
  const user = userRes.data.user;
  if (userRes.error || !user) {
    return NextResponse.json({ error: userRes.error?.message ?? "Unauthorized" }, { status: 401 });
  }

  const agencyUser = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (agencyUser.error || !agencyUser.data?.agency_id) {
    return NextResponse.json({ error: "User not onboarded" }, { status: 403 });
  }
  const agencyId = agencyUser.data.agency_id as string;

  // Try selecting branding fields; fall back to name-only if columns don't exist.
  const full = await supabase
    .from("agencies")
    .select("id,name,brand_logo_url,brand_accent")
    .eq("id", agencyId)
    .maybeSingle();

  if (full.error && isMissingColumnError(full.error)) {
    const basic = await supabase
      .from("agencies")
      .select("id,name")
      .eq("id", agencyId)
      .maybeSingle();
    if (basic.error || !basic.data) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }
    return NextResponse.json({
      agency_id: basic.data.id,
      name: basic.data.name
    } satisfies AgencySettings);
  }

  if (full.error || !full.data) {
    return NextResponse.json({ error: "Agency not found" }, { status: 404 });
  }

  const fullData = full.data as {
    id: string;
    name: string;
    brand_logo_url?: string | null;
    brand_accent?: string | null;
  };

  return NextResponse.json({
    agency_id: fullData.id,
    name: fullData.name,
    brand_logo_url: fullData.brand_logo_url ?? null,
    brand_accent: fullData.brand_accent ?? null
  } satisfies AgencySettings);
}

export async function POST(req: Request) {
  const token = bearerToken(req);
  if (!token) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

  const body = (await req.json()) as SettingsUpdateBody;
  const name = (body.name ?? "").trim();
  const brand_accent = body.brand_accent ?? null;

  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const userRes = await supabase.auth.getUser(token);
  const user = userRes.data.user;
  if (userRes.error || !user) {
    return NextResponse.json({ error: userRes.error?.message ?? "Unauthorized" }, { status: 401 });
  }

  const agencyUser = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (agencyUser.error || !agencyUser.data?.agency_id) {
    return NextResponse.json({ error: "User not onboarded" }, { status: 403 });
  }
  const agencyId = agencyUser.data.agency_id as string;

  // Try updating branding + name; if branding column doesn't exist, fall back to name-only.
  const upd = await supabase
    .from("agencies")
    .update({ name, brand_accent })
    .eq("id", agencyId)
    .select("id")
    .maybeSingle();

  if (upd.error && isMissingColumnError(upd.error)) {
    const upd2 = await supabase.from("agencies").update({ name }).eq("id", agencyId).select("id");
    if (upd2.error) return NextResponse.json({ error: upd2.error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}


