import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

export async function POST(req: Request) {
  const token = bearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();

  const userRes = await supabase.auth.getUser(token);
  const user = userRes.data.user;
  if (userRes.error || !user) {
    return NextResponse.json(
      { error: userRes.error?.message ?? "Unauthorized" },
      { status: 401 }
    );
  }

  // Check if already onboarded
  const existing = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing.data?.agency_id) {
    return NextResponse.json({ agency_id: existing.data.agency_id });
  }

  // Create agency + agency_user with best-effort idempotency.
  // Strategy:
  // 1) Create agency.
  // 2) Upsert agency_user on user_id to avoid duplicate rows.
  // 3) If the upsert conflicts, read the existing agency_user and delete the orphan agency we just created.
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

  const agencyId = agencyInsert.data.id;

  const agencyUserInsert = await supabase
    .from("agency_users")
    .upsert({ agency_id: agencyId, user_id: user.id, role: "owner" }, { onConflict: "user_id" })
    .select("agency_id")
    .single();

  if (agencyUserInsert.data?.agency_id) {
    return NextResponse.json({ agency_id: agencyUserInsert.data.agency_id });
  }

  // If upsert failed (e.g., unique violation), re-read existing agency_user.
  const retry = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (retry.data?.agency_id) {
    // Clean up the orphan agency we just created (best effort; ignore errors).
    await supabase.from("agencies").delete().eq("id", agencyId);
    return NextResponse.json({ agency_id: retry.data.agency_id });
  }

  return NextResponse.json(
    { error: agencyUserInsert.error?.message ?? "Failed to create agency user" },
    { status: 500 }
  );
}


