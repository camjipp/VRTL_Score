"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

type SubscriptionInfo = {
  plan: string | null;
  is_active: boolean;
  has_stripe: boolean;
};

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 149,
    annualPrice: 1490,
    description: "Perfect for small agencies getting started",
    features: [
      "Up to 5 clients",
      "50 snapshots/month",
      "All AI providers",
      "PDF exports",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPrice: 399,
    annualPrice: 3990,
    description: "For growing agencies with more clients",
    popular: true,
    features: [
      "Up to 25 clients",
      "250 snapshots/month",
      "All AI providers",
      "PDF exports",
      "White-label reports",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 799,
    annualPrice: 7990,
    description: "For established agencies at scale",
    features: [
      "Unlimited clients",
      "Unlimited snapshots",
      "All AI providers",
      "PDF exports",
      "White-label reports",
      "API access",
      "Dedicated support",
    ],
  },
];

export default function PlansPage() {
  const supabase = getSupabaseBrowserClient();
  
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: membership } = await supabase
          .from("agency_users")
          .select("agency_id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (membership?.agency_id) {
          const { data: agency } = await supabase
            .from("agencies")
            .select("plan, is_active, stripe_customer_id")
            .eq("id", membership.agency_id)
            .maybeSingle();
            
          if (agency) {
            setSubscription({
              plan: agency.plan || "starter",
              is_active: agency.is_active ?? true,
              has_stripe: !!agency.stripe_customer_id,
            });
          }
        }
      } catch (e: unknown) {
        const err = e as { message?: string };
        setError(err?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  async function handleSelectPlan(planId: string) {
    // If they already have this plan, open portal to manage
    if (subscription?.plan === planId && subscription?.has_stripe) {
      return openBillingPortal();
    }
    
    // If they have Stripe, send them to portal to change plan
    if (subscription?.has_stripe) {
      return openBillingPortal();
    }
    
    // Otherwise, create a new checkout
    setCheckoutLoading(planId);
    setError(null);
    
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          interval: isAnnual ? "annual" : "monthly",
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout");
      }
      
      const { url } = await res.json();
      window.location.href = url;
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
      setCheckoutLoading(null);
    }
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    setError(null);
    
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to open billing portal");
      }
      
      const { url } = await res.json();
      window.location.href = url;
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
      setPortalLoading(false);
    }
  }

  const currentPlanIndex = PLANS.findIndex(p => p.id === subscription?.plan);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-text-2 hover:text-text">Dashboard</Link>
        <span className="text-text-3">/</span>
        <Link href="/app/settings" className="text-text-2 hover:text-text">Settings</Link>
        <span className="text-text-3">/</span>
        <span className="text-text">Plans</span>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-text">Choose your plan</h1>
        <p className="mt-2 text-text-2">
          {subscription?.has_stripe 
            ? "Manage your subscription through the billing portal."
            : "Select a plan to get started. All plans include a 7-day free trial."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Billing toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-full border border-border bg-surface p-1">
          <button
            onClick={() => setIsAnnual(false)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              !isAnnual
                ? "bg-accent text-white"
                : "text-text-2 hover:text-text"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsAnnual(true)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isAnnual
                ? "bg-accent text-white"
                : "text-text-2 hover:text-text"
            )}
          >
            Annual
            <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600">
              Save 2 months
            </span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      )}

      {/* Plans */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan, index) => {
            const isCurrentPlan = subscription?.plan === plan.id;
            const isDowngrade = currentPlanIndex > index;
            const isUpgrade = currentPlanIndex < index && currentPlanIndex >= 0;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const monthlyEquivalent = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
            
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-surface p-6 transition-all",
                  plan.popular
                    ? "border-violet-500 shadow-lg shadow-violet-500/10"
                    : "border-border",
                  isCurrentPlan && "ring-2 ring-emerald-500"
                )}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white">
                      Most popular
                    </span>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 right-4">
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-medium text-white">
                      Current plan
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text">{plan.name}</h3>
                  <p className="mt-1 text-sm text-text-2">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text">
                      ${monthlyEquivalent}
                    </span>
                    <span className="text-text-2">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="mt-1 text-sm text-text-3">
                      ${price}/year billed annually
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-text-2">
                      <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={checkoutLoading === plan.id || portalLoading}
                  className={cn(
                    "w-full rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                    isCurrentPlan
                      ? "border border-border bg-surface-2 text-text hover:bg-surface"
                      : plan.popular
                        ? "bg-violet-600 text-white hover:bg-violet-700"
                        : "bg-accent text-white hover:bg-accent-2"
                  )}
                >
                  {checkoutLoading === plan.id || (isCurrentPlan && portalLoading) ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </span>
                  ) : isCurrentPlan ? (
                    "Manage plan"
                  ) : isDowngrade ? (
                    "Downgrade"
                  ) : isUpgrade ? (
                    "Upgrade"
                  ) : (
                    "Get started"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Help text */}
      <div className="text-center">
        <p className="text-sm text-text-2">
          Need help choosing?{" "}
          <a href="mailto:support@vrtlscore.com" className="text-accent hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}

