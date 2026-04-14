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

function billingEnabled(): boolean {
  return String(process.env.BILLING_ENABLED ?? "").toLowerCase() === "true";
}

function entitlementsDebug(): boolean {
  return String(process.env.ENTITLEMENTS_DEBUG ?? "").trim() === "1";
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

  // Internal platform operators only (ADMIN_EMAILS env). Not a “customer admin” tier — bypasses billing for support/testing.
  if (isAdminEmail(user.email)) {
    if (entitlementsDebug()) {
      console.info("[entitlements] platform_admin_bypass", {
        userId: user.id,
        email: user.email,
      });
    }
    return NextResponse.json({
      entitled: true,
      agencyId: null,
      billingEnabled: billingEnabled(),
      admin: true,
      role: null,
    });
  }

  // Single workspace per user: one agency_users row; limit(1) avoids PGRST116 if duplicates exist in DB.
  const agencyUser = await supabase
    .from("agency_users")
    .select("agency_id,role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (agencyUser.error) {
    console.error("[entitlements] agency_users query failed", agencyUser.error);
    return NextResponse.json(
      { error: agencyUser.error.message ?? "Agency lookup failed", code: "AGENCY_LOOKUP_FAILED" },
      { status: 500 }
    );
  }
  if (!agencyUser.data?.agency_id) {
    if (entitlementsDebug()) {
      console.info("[entitlements] not_onboarded", { userId: user.id, email: user.email });
    }
    return NextResponse.json(
      { error: "User not onboarded", code: "NOT_ONBOARDED" },
      { status: 403 }
    );
  }

  const agencyId = agencyUser.data.agency_id as string;
  const membershipRole = (agencyUser.data as { role?: string | null }).role ?? null;

  // If billing is not enabled, treat all onboarded agencies as entitled (internal mode).
  if (!billingEnabled()) {
    if (entitlementsDebug()) {
      console.info("[entitlements] entitled_billing_off", {
        userId: user.id,
        email: user.email,
        agencyId,
        role: membershipRole,
      });
    }
    return NextResponse.json({ entitled: true, agencyId, billingEnabled: false, role: membershipRole });
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

  // Align with app UI (/app/plans, settings): null/undefined is_active means "active" (legacy rows).
  // Only an explicit false blocks access when billing is enabled.
  const rawActive = (agencyRes.data as { is_active?: unknown }).is_active;
  const explicitlyInactive = rawActive === false;
  if (explicitlyInactive) {
    if (entitlementsDebug()) {
      console.info("[entitlements] subscription_inactive", {
        userId: user.id,
        email: user.email,
        agencyId,
        role: membershipRole,
        is_active: rawActive,
      });
    }
    return NextResponse.json(
      {
        entitled: false,
        agencyId,
        billingEnabled: true,
        reason: "paywall",
        code: "SUBSCRIPTION_INACTIVE",
        role: membershipRole,
      },
      { status: 403 }
    );
  }

  if (entitlementsDebug()) {
    console.info("[entitlements] entitled", {
      userId: user.id,
      email: user.email,
      agencyId,
      role: membershipRole,
      is_active: rawActive,
    });
  }

  return NextResponse.json({
    entitled: true,
    agencyId,
    billingEnabled: true,
    role: membershipRole,
  });
}


