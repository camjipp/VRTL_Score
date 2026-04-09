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
] as const;

/** Matches landing `--accent-marketing` / product accent */
const ACCENT = "#22c55e";
const ACCENT_RGB = "34, 197, 94";

const PAYWALL = {
  pageBg: "#070707",
  cardBg: "rgba(255,255,255,0.02)",
  border: "rgba(255,255,255,0.08)",
  text: "#f4f4f5",
  textMuted: "rgba(255,255,255,0.45)",
  toggleTrack: "rgba(255,255,255,0.06)",
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
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: membership } = await supabase.from("agency_users").select("agency_id").eq("user_id", user.id).maybeSingle();

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
  const isPostPurchase = Boolean(subscription?.has_stripe);

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16"
      style={{ backgroundColor: PAYWALL.pageBg }}
    >
      <Link href="/app" className="mb-10 flex shrink-0 sm:mb-12">
        <Image
          src="/brand/VRTL_Solo.png"
          alt="VRTL Score"
          width={140}
          height={40}
          className="h-9 w-auto opacity-95 sm:h-10"
          priority
        />
      </Link>

      <div className="mb-10 max-w-2xl text-center sm:mb-12">
        <h1 className="font-app-display text-3xl font-normal leading-[1.15] tracking-tight text-white sm:text-4xl md:text-[2.5rem] md:leading-tight">
          Choose your plan
        </h1>
      </div>

      {error && (
        <div className="mt-2 w-full max-w-5xl">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Billing toggle — active: green + black text; inactive: muted */}
      <div className="flex justify-center">
        <div
          className="inline-flex items-center gap-0.5 rounded-full p-1"
          style={{ backgroundColor: PAYWALL.toggleTrack }}
        >
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={cn(
              "rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 md:px-7 md:py-3",
              !isAnnual ? "text-black shadow-sm" : "text-white/40 hover:bg-white/[0.04] hover:text-white/55"
            )}
            style={!isAnnual ? { backgroundColor: ACCENT } : undefined}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-200 md:px-7 md:py-3",
              isAnnual ? "text-black shadow-sm" : "text-white/40 hover:bg-white/[0.04] hover:text-white/55"
            )}
            style={isAnnual ? { backgroundColor: ACCENT } : undefined}
          >
            Annual
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                isAnnual ? "bg-black/15 text-black/80" : "border border-white/10 bg-white/[0.06] text-white/50"
              )}
            >
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="mt-14 grid w-full max-w-6xl gap-8 md:mt-16 md:grid-cols-3 md:gap-10">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[28rem] animate-pulse rounded-2xl border border-white/[0.06]"
              style={{ backgroundColor: PAYWALL.cardBg }}
            />
          ))}
        </div>
      )}

      {!loading && (
        <div className="mt-14 grid w-full max-w-6xl gap-8 md:mt-16 md:grid-cols-3 md:items-start md:gap-10">
          {PLANS.map((plan) => {
            const planIndex = PLANS.findIndex((p) => p.id === plan.id);
            const isCurrentPlan = isPostPurchase && subscription?.plan === plan.id;
            const isDowngrade = isPostPurchase && currentPlanIndex > planIndex;
            const isUpgrade = isPostPurchase && currentPlanIndex < planIndex && currentPlanIndex >= 0;
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

            const isGrowth = plan.id === "growth";

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 transition-all duration-300 sm:p-8",
                  isGrowth && "z-[1] md:scale-[1.02]"
                )}
                style={{
                  backgroundColor: PAYWALL.cardBg,
                  borderColor: isGrowth ? `rgba(${ACCENT_RGB}, 0.45)` : PAYWALL.border,
                  boxShadow: isGrowth
                    ? `0 0 0 1px rgba(${ACCENT_RGB}, 0.2), 0 8px 32px rgba(${ACCENT_RGB}, 0.14), 0 24px 48px rgba(0,0,0,0.35)`
                    : "0 12px 40px rgba(0,0,0,0.25)",
                }}
              >
                {isGrowth && (
                  <div className="absolute -top-3 left-1/2 z-[2] -translate-x-1/2 whitespace-nowrap">
                    <span
                      className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]"
                      style={{
                        backgroundColor: `rgba(${ACCENT_RGB}, 0.18)`,
                        borderColor: `rgba(${ACCENT_RGB}, 0.35)`,
                        color: ACCENT,
                      }}
                    >
                      Most agencies choose this
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-semibold tracking-tight text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">${monthlyEquivalent}</span>
                    <span className="text-base font-medium text-white/45">/month</span>
                  </div>
                  {isAnnual && <p className="mt-2 text-sm text-white/45">${price}/year billed annually</p>}
                </div>

                <ul className="mb-10 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-snug text-white/70">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0"
                        style={{ color: `rgba(${ACCENT_RGB}, 0.75)` }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={checkoutLoading === plan.id || portalLoading}
                  className={cn(
                    "flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50",
                    plan.id === "growth" &&
                      "bg-[#22c55e] text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-[#16a34a]",
                    plan.id === "pro" && "border-2 border-[#22c55e] bg-transparent text-[#22c55e] hover:bg-[rgba(34,197,94,0.1)]",
                    plan.id === "starter" &&
                      "border border-white/[0.1] bg-white/[0.03] text-white/50 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white/65"
                  )}
                >
                  {checkoutLoading === plan.id || (isCurrentPlan && portalLoading) ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading…
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

      <p className="mt-12 max-w-md text-center text-sm text-white/45 sm:mt-16">
        Need help choosing?{" "}
        <a href="mailto:support@vrtlscore.com" className="font-medium text-[#22c55e] transition-colors hover:text-[#4ade80]">
          Contact us
        </a>
      </p>
    </div>
  );
}
