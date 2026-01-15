import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  agencyId?: string;
  is_active?: boolean;
};

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function POST(req: Request) {
  const token = bearerToken(req);
  if (!token) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

  const body = (await req.json()) as Body;
  if (!body.agencyId) return NextResponse.json({ error: "Missing agencyId" }, { status: 400 });
  if (typeof body.is_active !== "boolean") {
    return NextResponse.json({ error: "Missing is_active boolean" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const userRes = await supabase.auth.getUser(token);
  const user = userRes.data.user;
  if (userRes.error || !user) {
    return NextResponse.json({ error: userRes.error?.message ?? "Unauthorized" }, { status: 401 });
  }
  if (!isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const upd = await supabase
    .from("agencies")
    .update({ is_active: body.is_active })
    .eq("id", body.agencyId)
    .select("id,is_active")
    .maybeSingle();
  if (upd.error) return NextResponse.json({ error: upd.error.message }, { status: 500 });

  return NextResponse.json({ ok: true, agencyId: body.agencyId, is_active: body.is_active });
}


