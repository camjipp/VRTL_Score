/**
 * Temporary audit: set ENTITLEMENTS_AUDIT_LOG=1 (e.g. Vercel env), redeploy, refresh /app as admin vs paid user.
 * Grep runtime logs for `[entitlements-audit]` or check response header `X-VRTL-Entitlements-Audit-Outcome`.
 * Disable when finished.
 */
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

/** Temporary production audit: set ENTITLEMENTS_AUDIT_LOG=1 in Vercel, refresh /app, grep logs for [entitlements-audit]. Remove when done. */
function entitlementsAuditLog(): boolean {
  return String(process.env.ENTITLEMENTS_AUDIT_LOG ?? "").trim() === "1";
}

function auditHeaders(outcome: string): HeadersInit {
  if (!entitlementsAuditLog()) return {};
  return { "X-VRTL-Entitlements-Audit-Outcome": outcome };
}

function logEntitlementsAudit(payload: Record<string, unknown>) {
  if (!entitlementsAuditLog()) return;
  console.info("[entitlements-audit]", JSON.stringify(payload));
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
  if (!token) {
    logEntitlementsAudit({
      outcome: "missing_bearer_token",
      httpStatus: 401,
      platformAdminBypass: false,
    });
    return NextResponse.json({ error: "Missing Authorization" }, { status: 401, headers: auditHeaders("missing_bearer_token") });
  }

  const supabase = getSupabaseAdminClient();

  const userRes = await supabase.auth.getUser(token);
  const user = userRes.data.user;
  if (userRes.error || !user) {
    logEntitlementsAudit({
      outcome: "invalid_session",
      httpStatus: 401,
      platformAdminBypass: false,
      error: userRes.error?.message ?? "no user",
    });
    return NextResponse.json(
      { error: userRes.error?.message ?? "Unauthorized" },
      { status: 401, headers: auditHeaders("invalid_session") }
    );
  }

  // Internal platform operators only (ADMIN_EMAILS env). Not a “customer admin” tier — bypasses billing for support/testing.
  if (isAdminEmail(user.email)) {
    if (entitlementsDebug()) {
      console.info("[entitlements] platform_admin_bypass", {
        userId: user.id,
        email: user.email,
      });
    }
    logEntitlementsAudit({
      outcome: "platform_admin_bypass",
      httpStatus: 200,
      userId: user.id,
      email: user.email,
      platformAdminBypass: true,
      agencyId: null,
      role: null,
      agenciesIsActive: null,
      stripeSubscriptionId: null,
      billingEnabled: billingEnabled(),
    });
    return NextResponse.json(
      {
        entitled: true,
        agencyId: null,
        billingEnabled: billingEnabled(),
        admin: true,
        role: null,
      },
      { headers: auditHeaders("platform_admin_bypass") }
    );
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
    logEntitlementsAudit({
      outcome: "AGENCY_LOOKUP_FAILED",
      httpStatus: 500,
      userId: user.id,
      email: user.email,
      platformAdminBypass: false,
      error: agencyUser.error.message,
    });
    return NextResponse.json(
      { error: agencyUser.error.message ?? "Agency lookup failed", code: "AGENCY_LOOKUP_FAILED" },
      { status: 500, headers: auditHeaders("AGENCY_LOOKUP_FAILED") }
    );
  }
  if (!agencyUser.data?.agency_id) {
    if (entitlementsDebug()) {
      console.info("[entitlements] not_onboarded", { userId: user.id, email: user.email });
    }
    logEntitlementsAudit({
      outcome: "NOT_ONBOARDED",
      httpStatus: 403,
      userId: user.id,
      email: user.email,
      platformAdminBypass: false,
      agencyId: null,
      role: null,
      agenciesIsActive: null,
      stripeSubscriptionId: null,
    });
    return NextResponse.json(
      { error: "User not onboarded", code: "NOT_ONBOARDED" },
      { status: 403, headers: auditHeaders("NOT_ONBOARDED") }
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
    logEntitlementsAudit({
      outcome: "entitled_billing_off",
      httpStatus: 200,
      userId: user.id,
      email: user.email,
      platformAdminBypass: false,
      agencyId,
      role: membershipRole,
      billingEnabled: false,
      note: "BILLING_ENABLED is false — subscription flag not used for gating",
    });
    return NextResponse.json(
      { entitled: true, agencyId, billingEnabled: false, role: membershipRole },
      { headers: auditHeaders("entitled_billing_off") }
    );
  }

  // v1 entitlement model (pre-Stripe): agencies.is_active must be true.
  const agencyRes = await supabase
    .from("agencies")
    .select("id,is_active,stripe_subscription_id")
    .eq("id", agencyId)
    .single();
  if (agencyRes.error) {
    if (isMissingColumnError(agencyRes.error)) {
      logEntitlementsAudit({
        outcome: "schema_error_is_active_column",
        httpStatus: 500,
        userId: user.id,
        email: user.email,
        agencyId,
        platformAdminBypass: false,
      });
      return NextResponse.json(
        {
          error: "Billing enabled but agencies.is_active is missing",
          hint: "Add boolean column public.agencies.is_active and set it true for entitled agencies.",
          agencyId
        },
        { status: 500, headers: auditHeaders("schema_error_is_active_column") }
      );
    }
    logEntitlementsAudit({
      outcome: "agency_row_fetch_failed",
      httpStatus: 500,
      userId: user.id,
      email: user.email,
      agencyId,
      platformAdminBypass: false,
      error: agencyRes.error.message,
    });
    return NextResponse.json({ error: agencyRes.error.message }, { status: 500, headers: auditHeaders("agency_row_fetch_failed") });
  }

  const agencyRow = agencyRes.data as {
    id?: string;
    is_active?: unknown;
    stripe_subscription_id?: string | null;
  };
  const rawActive = agencyRow.is_active;
  const stripeSubscriptionId = agencyRow.stripe_subscription_id ?? null;

  // Align with app UI (/app/plans, settings): null/undefined is_active means "active" (legacy rows).
  // Only an explicit false blocks access when billing is enabled.
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
    logEntitlementsAudit({
      outcome: "SUBSCRIPTION_INACTIVE",
      httpStatus: 403,
      userId: user.id,
      email: user.email,
      platformAdminBypass: false,
      agencyId,
      role: membershipRole,
      agenciesIsActive: rawActive,
      stripeSubscriptionId,
      billingEnabled: true,
      note: "agencies.is_active is explicitly false — check Stripe webhooks / DB row",
    });
    return NextResponse.json(
      {
        entitled: false,
        agencyId,
        billingEnabled: true,
        reason: "paywall",
        code: "SUBSCRIPTION_INACTIVE",
        role: membershipRole,
      },
      { status: 403, headers: auditHeaders("SUBSCRIPTION_INACTIVE") }
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

  logEntitlementsAudit({
    outcome: "entitled_via_agency",
    httpStatus: 200,
    userId: user.id,
    email: user.email,
    platformAdminBypass: false,
    agencyId,
    role: membershipRole,
    agenciesIsActive: rawActive === undefined || rawActive === null ? "null_or_undefined_counts_as_active" : rawActive,
    stripeSubscriptionId,
    billingEnabled: true,
  });

  return NextResponse.json(
    {
      entitled: true,
      agencyId,
      billingEnabled: true,
      role: membershipRole,
    },
    { headers: auditHeaders("entitled_via_agency") }
  );
}


