import { NextRequest, NextResponse } from "next/server";

import { getStripe } from "@/lib/stripe";
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
      return NextResponse.json({ error: "No agency found" }, { status: 400 });
    }

    // Get agency's Stripe customer ID
    const { data: agency } = await supabase
      .from("agencies")
      .select("stripe_customer_id")
      .eq("id", membership.agency_id)
      .single();

    if (!agency?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const stripe = getStripe();

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: agency.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/app/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Portal failed" },
      { status: 500 }
    );
  }
}

