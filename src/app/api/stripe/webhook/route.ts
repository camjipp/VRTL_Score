import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
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
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const agencyId = session.metadata?.agency_id;
        const planId = session.metadata?.plan_id;

        if (agencyId) {
          // Activate the agency
          await supabase
            .from("agencies")
            .update({
              is_active: true,
              stripe_subscription_id: session.subscription as string,
              plan: planId || "starter",
            })
            .eq("id", agencyId);

          console.log(`Agency ${agencyId} activated with plan ${planId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;

        if (agencyId) {
          const isActive = subscription.status === "active" || subscription.status === "trialing";
          
          await supabase
            .from("agencies")
            .update({
              is_active: isActive,
              plan: subscription.metadata?.plan_id || "starter",
            })
            .eq("id", agencyId);

          console.log(`Agency ${agencyId} subscription updated: ${subscription.status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const agencyId = subscription.metadata?.agency_id;

        if (agencyId) {
          // Deactivate the agency
          await supabase
            .from("agencies")
            .update({
              is_active: false,
              stripe_subscription_id: null,
            })
            .eq("id", agencyId);

          console.log(`Agency ${agencyId} subscription cancelled`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Payment failed for invoice ${invoice.id}`);
        // Could send email notification here
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

