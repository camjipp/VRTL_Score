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

/** Canonical copy + limits from /pricing — ids unchanged for Stripe/API. */
const PLANS = [
  {
    id: "starter" as const,
    name: "Foundation",
    clients: 5 as const,
    description:
      "For agencies validating AI visibility with a tight client list before productizing reporting.",
    monthlyPrice: 149,
    annualPrice: 1490,
    recommended: false,
    highlights: [
      "Up to 5 clients",
      "Basic report branding",
      "30-day snapshot history",
      "4 competitors tracked per client",
    ],
  },
  {
    id: "growth" as const,
    name: "Agency",
    clients: 20 as const,
    description: "For agencies running client reporting and closing retainers with AI visibility.",
    monthlyPrice: 399,
    annualPrice: 3990,
    recommended: true,
    highlights: [
      "Up to 20 clients",
      "Full PDF branding (logo, colors, footer)",
      "Unlimited history + priority snapshot runs",
      "8 competitors per client",
    ],
  },
  {
    id: "pro" as const,
    name: "Scale",
    clients: 50 as const,
    description:
      "For firms managing a large book and packaging AI visibility as a core, billable line of business.",
    monthlyPrice: 799,
    annualPrice: 7990,
    recommended: false,
    highlights: [
      "50+ clients",
      "Everything in Agency",
      "Fastest runs + dedicated account manager",
      "8 competitors per client",
    ],
  },
];

const shell = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

function Check({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 md:h-5 md:w-5",
        className,
      )}
    >
      <svg aria-hidden="true" fill="none" height="10" viewBox="0 0 24 24" width="10" className="md:h-3 md:w-3">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      </svg>
    </span>
  );
}

function BillingToggle({ isAnnual, setIsAnnual }: { isAnnual: boolean; setIsAnnual: (v: boolean) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      <div className="relative inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] p-0.5">
        <button
          type="button"
          onClick={() => setIsAnnual(false)}
          className={cn(
            "relative rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ease-out md:px-5 md:py-1.5 md:text-sm",
            !isAnnual ? "bg-white text-black" : "text-white/55 hover:text-white/75",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setIsAnnual(true)}
          className={cn(
            "relative rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ease-out md:px-5 md:py-1.5 md:text-sm",
            isAnnual ? "bg-white text-black" : "text-white/55 hover:text-white/75",
          )}
        >
          Annual
        </button>
      </div>
      {isAnnual ? (
        <span className="rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/70 md:px-2.5 md:py-1 md:text-xs">
          2 months free on annual
        </span>
      ) : null}
    </div>
  );
}

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
    <div className="page-marketing selection:bg-[var(--accent-bg)] selection:text-white flex min-h-screen flex-col text-[var(--text-primary)]">
      <div className={cn(shell, "flex flex-1 flex-col pt-3 pb-4 sm:pt-4 sm:pb-5")}>
        <Link href="/app" className="mb-3 flex shrink-0 justify-center sm:mb-4">
          <Image
            src="/brand/VRTL_Solo.png"
            alt="VRTL Score"
            width={120}
            height={34}
            className="h-7 w-auto opacity-95 sm:h-8"
            priority
          />
        </Link>

        <div className="mb-3 text-center sm:mb-4">
          <p className="font-marketing-mono text-[10px] uppercase tracking-[0.12em] text-[var(--accent-marketing)] sm:text-[11px]">
            {`// CHOOSE PLAN`}
          </p>
          <h1 className="mt-1.5 font-marketing-display text-[1.35rem] font-normal leading-[1.12] tracking-[-0.03em] text-white sm:text-[1.65rem] md:text-3xl">
            Choose your plan
          </h1>
        </div>

        {error ? (
          <div className="mb-3 w-full">
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <div className="mb-3 flex justify-center sm:mb-4">
          <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
        </div>

        {loading ? (
          <div className="mt-1 grid flex-1 grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch md:gap-5 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[22rem] animate-pulse rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] md:h-[20rem]"
              />
            ))}
          </div>
        ) : (
          <div className="mt-1 grid flex-1 grid-cols-1 gap-4 overflow-visible md:grid-cols-3 md:items-stretch md:gap-5 lg:gap-6">
            {PLANS.map((plan) => {
              const planIndex = PLANS.findIndex((p) => p.id === plan.id);
              const isCurrentPlan = isPostPurchase && subscription?.plan === plan.id;
              const isDowngrade = isPostPurchase && currentPlanIndex > planIndex;
              const isUpgrade = isPostPurchase && currentPlanIndex < planIndex && currentPlanIndex >= 0;
              const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const monthlyEquivalent = isAnnual ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;
              const annualSavings = plan.monthlyPrice * 12 - plan.annualPrice;

              const ctaLabel = (() => {
                if (checkoutLoading === plan.id || (isCurrentPlan && portalLoading)) return null;
                if (isPostPurchase) {
                  if (isCurrentPlan) return "Manage plan";
                  if (isDowngrade) return "Downgrade";
                  if (isUpgrade) return "Upgrade";
                }
                return `Get ${plan.name}`;
              })();

              const showPrimaryCta = plan.recommended && !isDowngrade;

              const cardClass = cn(
                "flex h-full min-h-0 flex-col rounded-xl border bg-gradient-to-b p-4 transition-all duration-200 ease-out md:p-5",
                "hover:scale-[1.01]",
                plan.recommended
                  ? "z-10 scale-[1.02] border-[rgba(0,232,122,0.3)] from-white/[0.06] to-white/[0.02] shadow-[0_0_32px_rgba(0,232,122,0.12)] md:scale-[1.03]"
                  : "border-white/15 from-white/[0.03] to-white/[0.01]",
              );

              return (
                <div key={plan.id} className="flex min-h-0 flex-col">
                  <div className="flex min-h-[1.5rem] items-end justify-center pb-1 md:min-h-[1.75rem] md:pb-1.5">
                    {plan.recommended ? (
                      <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--accent-marketing)] md:px-3 md:text-xs">
                        Most agencies choose this
                      </span>
                    ) : null}
                  </div>

                  <div className={cardClass}>
                    <div className="shrink-0 space-y-1">
                      <h3 className="font-marketing-display text-lg font-normal text-white md:text-xl">{plan.name}</h3>
                      <p className="text-[13px] font-light leading-snug text-white/70 md:text-[14px]">{plan.description}</p>
                    </div>

                    <div className="mt-3 shrink-0 space-y-0.5 md:mt-3.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-marketing-display text-3xl font-normal tabular-nums tracking-tight text-white md:text-4xl">
                          ${monthlyEquivalent}
                        </span>
                        <span className="text-xs font-light text-white/60 md:text-sm">/month</span>
                      </div>
                      <p className="text-xs font-light leading-snug text-white/65 md:text-[13px]">
                        Typical ROI: 1 retained client pays for this 10–30x
                      </p>
                      {isAnnual ? (
                        <p className="text-xs font-light text-white/50 md:text-sm">${price.toLocaleString()} billed annually</p>
                      ) : (
                        <p className="text-xs font-light text-white/50 md:text-sm">
                          Save ${annualSavings.toLocaleString()}/year on annual
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex shrink-0 flex-col gap-1.5 md:mt-3.5">
                      <button
                        type="button"
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={checkoutLoading === plan.id || portalLoading}
                        className={cn(
                          "inline-flex w-full items-center justify-center gap-1 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ease-out disabled:opacity-50 active:scale-[0.98] md:px-5 md:py-2.5 md:text-sm",
                          showPrimaryCta
                            ? "bg-[var(--accent-marketing)] text-black hover:brightness-110"
                            : "border border-white/15 bg-transparent font-normal text-white/70 hover:border-white/25 hover:text-white/90",
                        )}
                      >
                        {checkoutLoading === plan.id || (isCurrentPlan && portalLoading) ? (
                          <span className="flex items-center gap-2">
                            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Processing…
                          </span>
                        ) : (
                          <>
                            {ctaLabel}
                            <span aria-hidden="true">→</span>
                          </>
                        )}
                      </button>
                      <Link
                        href="/preview"
                        className="text-center text-[11px] font-normal text-white/60 transition-all duration-200 ease-out hover:text-white/85 md:text-sm"
                      >
                        See example report
                      </Link>
                    </div>

                    <div className="mt-3 border-t border-white/10 pt-2.5 md:mt-3.5 md:pt-3">
                      <ul className="flex flex-col space-y-1.5 md:space-y-2">
                        {plan.highlights.map((line) => (
                          <li key={line} className="flex items-start gap-2 text-[12px] font-light leading-snug text-white/70 md:text-[13px]">
                            <Check className="mt-0.5" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-3 text-center text-[11px] text-white/45 md:mt-4 md:text-xs">
          Need help choosing?{" "}
          <a
            href="mailto:support@vrtlscore.com"
            className="font-medium text-[var(--accent-marketing)] transition-colors hover:brightness-110"
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}
