import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

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
  const token = bearerToken(req);
  if (!token) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

  const supabase = getSupabaseAdminClient();
  const userRes = await supabase.auth.getUser(token);
  const user = userRes.data.user;
  if (userRes.error || !user) {
    return NextResponse.json({ error: userRes.error?.message ?? "Unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const agenciesRes = await supabase
    .from("agencies")
    .select("id,name,is_active,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (agenciesRes.error) {
    return NextResponse.json({ error: agenciesRes.error.message }, { status: 500 });
  }

  return NextResponse.json({ agencies: agenciesRes.data ?? [] });
}


