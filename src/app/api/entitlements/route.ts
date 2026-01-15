import { NextResponse } from "next/server";

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

function billingEnabled(): boolean {
  return String(process.env.BILLING_ENABLED ?? "").toLowerCase() === "true";
}

function isMissingColumnError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const any = e as { code?: unknown; message?: unknown; details?: unknown };
  const code = typeof any.code === "string" ? any.code : "";
  const msg = typeof any.message === "string" ? any.message : "";
  const details = typeof any.details === "string" ? any.details : "";
  // PostgREST: PGRST204 "Could not find the '<col>' column ... in the schema cache"
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

  // If billing is not enabled, treat all onboarded agencies as entitled (internal mode).
  if (!billingEnabled()) {
    return NextResponse.json({ entitled: true, agencyId, billingEnabled: false });
  }

  // v1 entitlement model (pre-Stripe): agencies.is_active must be true.
  const agencyRes = await supabase.from("agencies").select("id,is_active").eq("id", agencyId).single();
  if (agencyRes.error) {
    if (isMissingColumnError(agencyRes.error)) {
      return NextResponse.json(
        {
          error: "Billing enabled but agencies.is_active is missing",
          hint: "Add boolean column public.agencies.is_active and set it true for entitled agencies.",
          agencyId
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: agencyRes.error.message }, { status: 500 });
  }

  const isActive = Boolean((agencyRes.data as { is_active?: unknown }).is_active);
  if (!isActive) {
    return NextResponse.json(
      { entitled: false, agencyId, billingEnabled: true, reason: "paywall" },
      { status: 403 }
    );
  }

  return NextResponse.json({ entitled: true, agencyId, billingEnabled: true });
}


