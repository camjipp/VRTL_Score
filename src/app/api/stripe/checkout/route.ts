import { NextRequest, NextResponse } from "next/server";

import { getStripe, PLANS, PlanId, BillingInterval } from "@/lib/stripe";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    // Get auth token
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // Verify user
    const supabase = getSupabaseAdminClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get agency
    const { data: membership } = await supabase
      .from("agency_users")
      .select("agency_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "No agency found", code: "NO_AGENCY" }, { status: 400 });
    }

    // Get agency details
    const { data: agency } = await supabase
      .from("agencies")
      .select("id, name, stripe_customer_id")
      .eq("id", membership.agency_id)
      .single();

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 400 });
    }

    // Parse request
    const body = await req.json();
    const planId = body.planId as PlanId;
    const interval = (body.interval as BillingInterval) || "monthly";

    if (!PLANS[planId]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = PLANS[planId];
    const price = interval === "annual" ? plan.annualPrice : plan.monthlyPrice;

    // Get or create Stripe customer
    const stripe = getStripe();
    let customerId = agency.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: agency.name,
        metadata: {
          agency_id: agency.id,
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to agency
      await supabase
        .from("agencies")
        .update({ stripe_customer_id: customerId })
        .eq("id", agency.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `VRTL Score ${plan.name}`,
              description: `${interval === "annual" ? "Annual" : "Monthly"} subscription`,
            },
            unit_amount: price,
            recurring: {
              interval: interval === "annual" ? "year" : "month",
            },
          },
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          agency_id: agency.id,
          plan_id: planId,
        },
      },
      success_url: `${req.nextUrl.origin}/app?checkout=success`,
      cancel_url: `${req.nextUrl.origin}/pricing?checkout=cancelled`,
      metadata: {
        agency_id: agency.id,
        plan_id: planId,
        interval,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}

