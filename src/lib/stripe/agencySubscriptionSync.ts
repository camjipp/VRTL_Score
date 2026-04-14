import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

/** Treat past_due as entitled so users are not locked out during Stripe retry / grace (webhook ordering). */
export function subscriptionStatusEntitlesAccess(
  status: Stripe.Subscription.Status
): boolean {
  return (
    status === "active" ||
    status === "trialing" ||
    status === "past_due"
  );
}

export function checkoutSessionSubscriptionId(
  session: Stripe.Checkout.Session
): string | null {
  const sub = session.subscription;
  if (typeof sub === "string" && sub.length > 0) return sub;
  if (sub && typeof sub === "object" && "id" in sub && typeof (sub as { id?: unknown }).id === "string") {
    return (sub as Stripe.Subscription).id;
  }
  return null;
}

function stripeCustomerIdFromSubscription(sub: Stripe.Subscription): string | null {
  const c = sub.customer;
  if (typeof c === "string" && c.length > 0) return c;
  if (c && typeof c === "object" && "id" in c && typeof (c as { id?: unknown }).id === "string") {
    return (c as Stripe.Customer).id;
  }
  return null;
}

function stripeCustomerIdFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  const c = session.customer;
  if (typeof c === "string" && c.length > 0) return c;
  if (c && typeof c === "object" && "id" in c && typeof (c as { id?: unknown }).id === "string") {
    return (c as Stripe.Customer).id;
  }
  return null;
}

/**
 * Resolve which agency row this subscription belongs to: metadata, then DB subscription id, then
 * unambiguous stripe_customer_id match (single agency).
 */
export async function resolveAgencyIdForSubscription(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription
): Promise<string | null> {
  const fromMeta = subscription.metadata?.agency_id?.trim();
  if (fromMeta) return fromMeta;

  const { data: bySub } = await supabase
    .from("agencies")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();
  if (bySub?.id) return bySub.id;

  const customerId = stripeCustomerIdFromSubscription(subscription);
  if (!customerId) return null;

  const { data: rows } = await supabase
    .from("agencies")
    .select("id")
    .eq("stripe_customer_id", customerId);

  if (rows?.length === 1) return rows[0].id;
  return null;
}

export function buildAgencyPatchFromSubscription(subscription: Stripe.Subscription): {
  is_active: boolean;
  stripe_subscription_id: string;
  plan: string;
  stripe_customer_id?: string;
} {
  const customerId = stripeCustomerIdFromSubscription(subscription);
  return {
    is_active: subscriptionStatusEntitlesAccess(subscription.status),
    stripe_subscription_id: subscription.id,
    plan: (subscription.metadata?.plan_id as string | undefined)?.trim() || "starter",
    ...(customerId ? { stripe_customer_id: customerId } : {}),
  };
}

function subscriptionPeriodEndKey(sub: Stripe.Subscription): number {
  const items = sub.items?.data ?? [];
  if (items.length) {
    return Math.max(...items.map((i) => i.current_period_end ?? 0));
  }
  return sub.created ?? 0;
}

/** Prefer strongest access, then longest current period (newest commitment). */
export function pickBestSubscription(subs: Stripe.Subscription[]): Stripe.Subscription | null {
  if (!subs.length) return null;
  const score = (s: Stripe.Subscription) => {
    if (subscriptionStatusEntitlesAccess(s.status)) return 3;
    if (s.status === "unpaid" || s.status === "paused") return 1;
    return 0;
  };
  return [...subs].sort((a, b) => {
    const ds = score(b) - score(a);
    if (ds !== 0) return ds;
    return subscriptionPeriodEndKey(b) - subscriptionPeriodEndKey(a);
  })[0];
}

export async function updateAgencyRowFromSubscription(
  supabase: SupabaseClient,
  subscription: Stripe.Subscription,
  agencyId: string
): Promise<{ error: string | null }> {
  const patch = buildAgencyPatchFromSubscription(subscription);
  const { error } = await supabase.from("agencies").update(patch).eq("id", agencyId);
  return { error: error?.message ?? null };
}

/**
 * checkout.session.completed: metadata agency_id is primary; if update misses, try the lone agency
 * for this Stripe customer (fixes orphan / wrong-id metadata when customer is correct).
 */
export async function activateAgencyFromCheckoutSession(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
  planIdFromSession: string | undefined
): Promise<{ ok: boolean; agencyId: string | null; error: string | null; rowCount: number }> {
  const subscriptionId = checkoutSessionSubscriptionId(session);
  const metaAgencyId = session.metadata?.agency_id?.trim();

  if (!subscriptionId) {
    return {
      ok: false,
      agencyId: null,
      error: "checkout.session.completed missing subscription id",
      rowCount: 0,
    };
  }

  const patch = {
    is_active: true,
    stripe_subscription_id: subscriptionId,
    plan: planIdFromSession || "starter",
  };

  if (metaAgencyId) {
    const { data, error } = await supabase
      .from("agencies")
      .update(patch)
      .eq("id", metaAgencyId)
      .select("id");

    if (error) {
      return { ok: false, agencyId: metaAgencyId, error: error.message, rowCount: 0 };
    }
    if (data?.length) {
      return { ok: true, agencyId: metaAgencyId, error: null, rowCount: data.length };
    }
  }

  const customerId = stripeCustomerIdFromCheckoutSession(session);
  if (!customerId) {
    return {
      ok: false,
      agencyId: metaAgencyId ?? null,
      error: metaAgencyId
        ? "update matched no rows and session has no customer for fallback"
        : "missing agency_id metadata and no customer for fallback",
      rowCount: 0,
    };
  }

  const { data: agencies, error: listErr } = await supabase
    .from("agencies")
    .select("id")
    .eq("stripe_customer_id", customerId);

  if (listErr) {
    return { ok: false, agencyId: null, error: listErr.message, rowCount: 0 };
  }
  if (agencies?.length !== 1) {
    return {
      ok: false,
      agencyId: metaAgencyId ?? null,
      error: `customer fallback: expected 1 agency for customer, got ${agencies?.length ?? 0}`,
      rowCount: 0,
    };
  }

  const fallbackId = agencies[0].id;
  const { data: updated, error: updErr } = await supabase
    .from("agencies")
    .update(patch)
    .eq("id", fallbackId)
    .select("id");

  if (updErr) {
    return { ok: false, agencyId: fallbackId, error: updErr.message, rowCount: 0 };
  }
  return {
    ok: !!updated?.length,
    agencyId: fallbackId,
    error: updated?.length ? null : "fallback update matched no rows",
    rowCount: updated?.length ?? 0,
  };
}
