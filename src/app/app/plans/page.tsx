"use client";

import Image from "next/image";
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

const PAYWALL = {
  pageBg: "#05070A",
  cardBg: "#0B0F14",
  border: "#1A212B",
  text: "#E6EDF3",
  textMuted: "#8B98A5",
  accent: "#10A37F",
  accentHover: "#0e8f6f",
  cardShadow: "0 10px 30px rgba(0,0,0,0.35)",
  buttonShadow: "0 6px 20px rgba(16,163,127,0.25)",
} as const;

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
    if (subscription?.plan === planId && subscription?.has_stripe) {
      return openBillingPortal();
    }
    if (subscription?.has_stripe) {
      return openBillingPortal();
    }

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

  const currentPlanIndex = PLANS.findIndex((p) => p.id === subscription?.plan);

  /** Pre-purchase: no Stripe customer yet → show only purchase CTAs. Post-purchase: has Stripe → show Manage/Upgrade/Downgrade. */
  const isPostPurchase = Boolean(subscription?.has_stripe);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start py-10 px-4 sm:px-6"
      style={{ backgroundColor: PAYWALL.pageBg }}
    >
      {/* Logo */}
      <Link href="/app" className="mb-8 flex shrink-0">
        <Image
          src="/brand/VRTL_Solo.png"
          alt="VRTL Score"
          width={140}
          height={40}
          className="h-8 w-auto opacity-95"
          priority
        />
      </Link>

      {/* Headline — no subtitle on paywall */}
      <div className="text-center mb-2">
        <h1
          className="font-app-display text-2xl font-normal tracking-tight sm:text-3xl"
          style={{ color: PAYWALL.text }}
        >
          Choose your plan
        </h1>
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-4xl mt-4">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Billing toggle — segmented control; savings badge readable in both states */}
      <div className="flex justify-center mt-6">
        <div
          className="inline-flex items-center gap-0 rounded-[10px] p-0.5"
          style={{ backgroundColor: PAYWALL.border }}
        >
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
              !isAnnual ? "text-white" : "hover:bg-white/5"
            )}
            style={
              !isAnnual
                ? { backgroundColor: PAYWALL.accent, boxShadow: PAYWALL.buttonShadow }
                : { color: PAYWALL.textMuted }
            }
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-2",
              isAnnual ? "text-white" : "hover:bg-white/5"
            )}
            style={
              isAnnual
                ? { backgroundColor: PAYWALL.accent, boxShadow: PAYWALL.buttonShadow }
                : { color: PAYWALL.textMuted }
            }
          >
            Annual
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium border border-current"
              style={
                isAnnual
                  ? { backgroundColor: "rgba(0,0,0,0.2)", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }
                  : { backgroundColor: "rgba(16,163,127,0.2)", color: PAYWALL.accent }
              }
            >
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl mt-10">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-96 rounded-[12px] animate-pulse"
              style={{ backgroundColor: PAYWALL.cardBg, border: `1px solid ${PAYWALL.border}` }}
            />
          ))}
        </div>
      )}

      {/* Plans */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl mt-10">
          {PLANS.map((plan) => {
            const isCurrentPlan = isPostPurchase && subscription?.plan === plan.id;
            const isDowngrade = isPostPurchase && currentPlanIndex > PLANS.indexOf(plan);
            const isUpgrade = isPostPurchase && currentPlanIndex < PLANS.indexOf(plan) && currentPlanIndex >= 0;
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            const monthlyEquivalent = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

            const ctaLabel = (() => {
              if (checkoutLoading === plan.id || (isCurrentPlan && portalLoading)) return null;
              if (isPostPurchase) {
                if (isCurrentPlan) return "Manage plan";
                if (isDowngrade) return "Downgrade";
                if (isUpgrade) return "Upgrade";
              }
              return `Start ${plan.name}`;
            })();

            return (
              <div
                key={plan.id}
                className="relative flex flex-col rounded-[12px] border p-6 transition-all"
                style={{
                  backgroundColor: PAYWALL.cardBg,
                  border: `1px solid ${plan.popular ? PAYWALL.accent : PAYWALL.border}`,
                  boxShadow: PAYWALL.cardShadow,
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: PAYWALL.accent }}
                    >
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: PAYWALL.text }}>
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm" style={{ color: PAYWALL.textMuted }}>
                    {plan.description}
                  </p>
                </div>

                {/* Price — number dominant */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span
                      className="text-4xl font-bold tracking-tight sm:text-5xl"
                      style={{ color: PAYWALL.text }}
                    >
                      ${monthlyEquivalent}
                    </span>
                    <span className="text-base font-medium" style={{ color: PAYWALL.textMuted }}>
                      /month
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="mt-1 text-sm" style={{ color: PAYWALL.textMuted }}>
                      ${price}/year billed annually
                    </p>
                  )}
                </div>

                <ul className="mb-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm"
                      style={{ color: PAYWALL.textMuted }}
                    >
                      <svg
                        className="h-5 w-5 shrink-0"
                        style={{ color: PAYWALL.accent }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA: pre-purchase = Start [Plan]; post-purchase = Manage / Upgrade / Downgrade */}
                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={checkoutLoading === plan.id || portalLoading}
                  className={cn(
                    "w-full rounded-[10px] h-12 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50",
                    plan.popular && "bg-[#10A37F] text-white border-0 hover:bg-[#0e8f6f]",
                    plan.id === "pro" && "bg-transparent border-2 border-[#10A37F] text-[#10A37F] hover:bg-[#10A37F]/10",
                    plan.id === "starter" && "bg-transparent border border-[#1A212B] text-[#E6EDF3] hover:border-[#8B98A5]"
                  )}
                  style={plan.popular ? { boxShadow: PAYWALL.buttonShadow } : undefined}
                >
                  {checkoutLoading === plan.id || (isCurrentPlan && portalLoading) ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Loading...
                    </>
                  ) : (
                    ctaLabel
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Help text */}
      <p className="mt-8 text-center text-sm" style={{ color: PAYWALL.textMuted }}>
        Need help choosing?{" "}
        <a
          href="mailto:support@vrtlscore.com"
          className="font-medium hover:underline"
          style={{ color: PAYWALL.accent }}
        >
          Contact us
        </a>
      </p>
    </div>
  );
}
