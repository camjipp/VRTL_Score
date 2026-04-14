import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { isAdminEmail } from "@/lib/admin";
import {
  buildAgencyPatchFromSubscription,
  pickBestSubscription,
  subscriptionStatusEntitlesAccess,
} from "@/lib/stripe/agencySubscriptionSync";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = { agencyId?: string };

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

/**
 * Reconcile one agency row with Stripe (list subscriptions for stripe_customer_id, or retrieve
 * stripe_subscription_id). Use when webhooks failed or DB drifted. ADMIN_EMAILS only.
 *
 * Inspect in Supabase SQL (replace id):
 *   select id, is_active, stripe_customer_id, stripe_subscription_id, plan from agencies
 *   where id = '728ac694-19ae-4a1a-b41a-605f4baffc8a';
 */
export async function POST(req: Request) {
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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const agencyId = body.agencyId?.trim();
  if (!agencyId) return NextResponse.json({ error: "Missing agencyId" }, { status: 400 });

  const { data: agency, error: agencyErr } = await supabase
    .from("agencies")
    .select("id, stripe_customer_id, stripe_subscription_id, is_active, plan")
    .eq("id", agencyId)
    .maybeSingle();

  if (agencyErr) return NextResponse.json({ error: agencyErr.message }, { status: 500 });
  if (!agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 });

  const stripe = getStripe();
  let chosen: Stripe.Subscription | null = null;
  let source: string | null = null;

  if (agency.stripe_customer_id) {
    const list = await stripe.subscriptions.list({
      customer: agency.stripe_customer_id,
      status: "all",
      limit: 30,
    });
    chosen = pickBestSubscription(list.data);
    if (chosen) source = "subscriptions.list(customer)";
  }

  if (!chosen && agency.stripe_subscription_id) {
    try {
      chosen = await stripe.subscriptions.retrieve(agency.stripe_subscription_id);
      source = "subscriptions.retrieve(stripe_subscription_id)";
    } catch {
      chosen = null;
    }
  }

  if (!chosen) {
    return NextResponse.json({
      ok: false,
      agencyId,
      message:
        "No Stripe subscription found for this agency. Ensure stripe_customer_id matches the customer used at checkout, or stripe_subscription_id is valid.",
      agencyBefore: agency,
    });
  }

  const patch = buildAgencyPatchFromSubscription(chosen);
  const { error: updErr, data: updated } = await supabase
    .from("agencies")
    .update({
      is_active: patch.is_active,
      stripe_subscription_id: patch.stripe_subscription_id,
      plan: patch.plan,
      ...(patch.stripe_customer_id ? { stripe_customer_id: patch.stripe_customer_id } : {}),
    })
    .eq("id", agencyId)
    .select("id, is_active, stripe_customer_id, stripe_subscription_id, plan");

  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    agencyId,
    source,
    subscriptionId: chosen.id,
    subscriptionStatus: chosen.status,
    entitled: subscriptionStatusEntitlesAccess(chosen.status),
    agencyBefore: agency,
    agencyAfter: updated?.[0] ?? null,
  });
}
