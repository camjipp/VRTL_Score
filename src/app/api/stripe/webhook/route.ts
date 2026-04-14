import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import {
  activateAgencyFromCheckoutSession,
  resolveAgencyIdForSubscription,
  updateAgencyRowFromSubscription,
} from "@/lib/stripe/agencySubscriptionSync";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

// Disable body parsing - Stripe needs raw body for webhook verification
export const runtime = "nodejs";

async function getRawBody(req: NextRequest): Promise<Buffer> {
  const reader = req.body?.getReader();
  if (!reader) throw new Error("No body");

  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const stripe = getStripe();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const planId = session.metadata?.plan_id;

        const result = await activateAgencyFromCheckoutSession(supabase, session, planId);
        if (!result.ok) {
          console.error("[stripe webhook] checkout.session.completed failed", result);
          return NextResponse.json({ error: result.error ?? "checkout activation failed" }, { status: 500 });
        }
        console.log(
          `[stripe webhook] Agency ${result.agencyId} activated via checkout (rows=${result.rowCount})`
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = await resolveAgencyIdForSubscription(supabase, subscription);
        if (!agencyId) {
          console.warn(
            "[stripe webhook] customer.subscription.updated: could not resolve agency",
            subscription.id
          );
          break;
        }
        const { error } = await updateAgencyRowFromSubscription(supabase, subscription, agencyId);
        if (error) {
          console.error("[stripe webhook] subscription.updated DB error", error);
          return NextResponse.json({ error }, { status: 500 });
        }
        console.log(`[stripe webhook] Agency ${agencyId} subscription updated: ${subscription.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = await resolveAgencyIdForSubscription(supabase, subscription);
        if (!agencyId) {
          console.warn(
            "[stripe webhook] customer.subscription.deleted: could not resolve agency",
            subscription.id
          );
          break;
        }
        const { error } = await supabase
          .from("agencies")
          .update({
            is_active: false,
            stripe_subscription_id: null,
          })
          .eq("id", agencyId);
        if (error) {
          console.error("[stripe webhook] subscription.deleted DB error", error.message);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        console.log(`[stripe webhook] Agency ${agencyId} subscription cancelled`);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const parent = invoice.parent;
        const subRef =
          parent?.type === "subscription_details" && parent.subscription_details?.subscription
            ? parent.subscription_details.subscription
            : null;
        const subId =
          typeof subRef === "string"
            ? subRef
            : subRef && typeof subRef === "object" && "id" in subRef
              ? (subRef as Stripe.Subscription).id
              : null;
        if (!subId) break;

        const subscription = await stripe.subscriptions.retrieve(subId);
        const agencyId = await resolveAgencyIdForSubscription(supabase, subscription);
        if (!agencyId) {
          console.warn("[stripe webhook] invoice.paid: could not resolve agency", subId);
          break;
        }
        const { error } = await updateAgencyRowFromSubscription(supabase, subscription, agencyId);
        if (error) {
          console.error("[stripe webhook] invoice.paid DB error", error);
          return NextResponse.json({ error }, { status: 500 });
        }
        console.log(`[stripe webhook] Agency ${agencyId} refreshed from invoice.paid`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[stripe webhook] Payment failed for invoice ${invoice.id}`);
        break;
      }

      default:
        console.log(`[stripe webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
