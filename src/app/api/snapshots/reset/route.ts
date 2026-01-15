import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ResetBody = {
  clientId?: string;
};

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function POST(req: Request) {
  try {
    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
    }

    const body = (await req.json()) as ResetBody;
    if (!body.clientId) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Auth
    const userRes = await supabase.auth.getUser(token);
    const user = userRes.data.user;
    if (userRes.error || !user) {
      return NextResponse.json(
        { error: userRes.error?.message ?? "Unauthorized" },
        { status: 401 }
      );
    }

    // Map user -> agency
    const agencyUser = await supabase
      .from("agency_users")
      .select("agency_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (agencyUser.error || !agencyUser.data?.agency_id) {
      return NextResponse.json({ error: "Agency not found for user" }, { status: 403 });
    }
    const agencyId = agencyUser.data.agency_id as string;

    // Verify client belongs to agency
    const clientRes = await supabase
      .from("clients")
      .select("id,agency_id")
      .eq("id", body.clientId)
      .maybeSingle();
    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    if (clientRes.data.agency_id !== agencyId) {
      return NextResponse.json({ error: "Client not in your agency" }, { status: 403 });
    }

    const runningRes = await supabase
      .from("snapshots")
      .select("id")
      .eq("client_id", body.clientId)
      .eq("status", "running");

    if (runningRes.error) {
      return NextResponse.json({ error: runningRes.error.message }, { status: 500 });
    }
    const ids = (runningRes.data ?? []).map((r) => r.id).filter(Boolean) as string[];

    if (ids.length === 0) {
      return NextResponse.json({ ok: true, reset: 0, ids: [] });
    }

    const nowIso = new Date().toISOString();
    const upd = await supabase
      .from("snapshots")
      .update({
        status: "failed",
        error: `manual reset (${user.id})`,
        completed_at: nowIso
      })
      .in("id", ids)
      .eq("status", "running")
      .select("id");

    if (upd.error) {
      return NextResponse.json({ error: upd.error.message }, { status: 500 });
    }

    const updatedIds = (upd.data ?? []).map((r) => r.id).filter(Boolean) as string[];
    return NextResponse.json({ ok: true, reset: updatedIds.length, ids: updatedIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


