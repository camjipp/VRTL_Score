"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const shell = "mx-auto w-full max-w-[1200px] px-6 md:px-12";

/** ~25% tighter top than prior pt-6/pt-8 — connects hero to page. */
const pricingTop = "pt-[18px] pb-8 md:pt-6 md:pb-10";

/** Vertical rhythm between major blocks (below hero). */
const sectionGap = "mt-28 md:mt-32";
const sectionBlock = "border-b border-white/10 pb-16 md:pb-20";

function PricingEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]">
      {children}
    </p>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65",
        className,
      )}
    >
      <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
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

const plans = [
  {
    id: "starter" as const,
    name: "Foundation",
    description: "Pilot model-level visibility on a focused client set before you standardize reporting.",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    clients: 5,
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
    description: "Ongoing snapshots and reporting for accounts you already support and renew.",
    monthlyPrice: 399,
    yearlyPrice: 3990,
    clients: 20,
    highlights: [
      "Up to 20 clients",
      "Full PDF branding (logo, colors, footer)",
      "Unlimited history + priority snapshot runs",
      "8 competitors per client",
    ],
    recommended: true,
  },
  {
    id: "pro" as const,
    name: "Scale",
    description: "Higher volume, faster runs, and a dedicated contact as AI visibility becomes core to your offer.",
    monthlyPrice: 666,
    yearlyPrice: 8028,
    clients: 50,
    highlights: [
      "50+ clients",
      "Everything in Agency",
      "Fastest runs + dedicated account manager",
      "8 competitors per client",
    ],
  },
];

const recommendedPillClass =
  "inline-flex rounded border border-emerald-500/10 bg-white/[0.02] px-1.5 py-0.5 font-marketing-mono text-[9px] font-medium tracking-[0.06em] text-emerald-400/45";

function planBillingFigures(plan: (typeof plans)[number], isAnnual: boolean) {
  const annualTotal = plan.yearlyPrice;
  const monthlyEquivalent = isAnnual ? Math.round(annualTotal / 12) : plan.monthlyPrice;
  const saveVsMonthlyYear = plan.monthlyPrice * 12 - annualTotal;
  return { annualTotal, monthlyEquivalent, saveVsMonthlyYear };
}

function PlanPriceSubline({ plan, isAnnual }: { plan: (typeof plans)[number]; isAnnual: boolean }) {
  const { annualTotal, saveVsMonthlyYear } = planBillingFigures(plan, isAnnual);
  if (isAnnual) {
    return (
      <p className="text-sm font-light text-white/50 transition-opacity duration-200 ease-out">
        ${annualTotal.toLocaleString()} billed annually
      </p>
    );
  }
  if (saveVsMonthlyYear > 0) {
    return (
      <p className="text-sm font-light text-white/50 transition-opacity duration-200 ease-out">
        Save ${saveVsMonthlyYear.toLocaleString()}/year on annual
      </p>
    );
  }
  return null;
}

const comparisonFeatures = [
  { name: "Active clients", starter: "5", growth: "20", pro: "50+" },
  { name: "Branding", starter: "Basic", growth: "Full (logo, colors, footer)", pro: "Full" },
  { name: "Reporting & history", starter: "30-day history", growth: "Unlimited + priority runs", pro: "Unlimited + fastest runs" },
  { name: "Competitors per client", starter: "4", growth: "8", pro: "8" },
  { name: "Support", starter: "Email", growth: "Priority", pro: "Dedicated" },
];

const faqs = [
  {
    question: "How do I get started?",
    answer:
      "Complete onboarding and run a snapshot on live data. When you need more clients, history, or seats, choose the tier that matches your book.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes. Upgrade or downgrade anytime. We'll prorate your billing automatically.",
  },
  {
    question: "What AI providers are included?",
    answer:
      "All plans include the leading models we track for visibility analysis. We add providers as the landscape shifts.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes. If you're not satisfied within the first 30 days, we'll refund your payment in full.",
  },
  {
    question: "What if I exceed my client limit?",
    answer: "You can add extra clients for $25–50/client/month, or move up a tier for better unit economics.",
  },
  {
    question: "Is there a long-term contract?",
    answer:
      "No. Monthly plans cancel anytime. Foundation and Agency annual plans are billed upfront and include two months versus paying monthly. Scale annual is priced separately.",
  },
];

const heroBullets = [
  "Displacement signals before renewals",
  "Evidence for QBRs and strategy reviews",
  "Package visibility as part of your stack",
];

function RunSnapshotButton({
  loading,
  onClick,
  className,
  variant = "primary",
  size = "default",
}: {
  loading?: boolean;
  onClick: () => void;
  className?: string;
  variant?: "primary" | "outline";
  size?: "default" | "large";
}) {
  const sizeCls = size === "large" ? "px-8 py-3.5 text-base" : "px-6 py-3 text-sm";
  const base =
    "inline-flex w-full items-center justify-center gap-1 font-medium transition-all duration-200 ease-out disabled:opacity-50 active:scale-[0.98]";
  const shape = "rounded-full";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        base,
        shape,
        sizeCls,
        variant === "primary" &&
          "bg-[var(--accent-marketing)] text-black hover:brightness-110 hover:scale-[1.02]",
        variant === "outline" &&
          "border border-white/15 bg-transparent font-normal text-white/70 hover:border-white/25 hover:text-white/90 hover:brightness-110",
        className,
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          Run a snapshot
          <span aria-hidden="true">→</span>
        </>
      )}
    </button>
  );
}

function BillingToggle({
  isAnnual,
  setIsAnnual,
}: {
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] p-1">
        <button
          type="button"
          onClick={() => setIsAnnual(false)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ease-out md:px-5 md:py-2",
            !isAnnual ? "bg-white text-black" : "text-white/55 hover:text-white/75",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setIsAnnual(true)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ease-out md:px-5 md:py-2",
            isAnnual ? "bg-white text-black" : "text-white/55 hover:text-white/75",
          )}
        >
          Annual
        </button>
      </div>
      {isAnnual && (
        <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/70 md:text-sm">
          2 months free on annual
        </span>
      )}
    </div>
  );
}

function PlanCards({
  isAnnual,
  loadingPlan,
  onCheckout,
}: {
  isAnnual: boolean;
  loadingPlan: string | null;
  onCheckout: (id: "starter" | "growth" | "pro") => void;
}) {
  return (
    <div className="mt-6 grid gap-6 overflow-visible md:mt-7 md:grid-cols-3 md:items-stretch md:gap-7 lg:gap-8">
      {plans.map((plan) => {
        const { monthlyEquivalent } = planBillingFigures(plan, isAnnual);
        const isLoading = loadingPlan === plan.id;

        const cardClass = cn(
          "flex h-full min-h-0 flex-col space-y-4 rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 transition-all duration-200 ease-out md:p-8",
          "hover:scale-[1.01]",
          plan.recommended
            ? "z-10 scale-[1.03] border-[rgba(0,232,122,0.3)] from-white/[0.06] to-white/[0.02] shadow-[0_0_40px_rgba(0,232,122,0.15)]"
            : "from-white/[0.03] to-white/[0.01]",
        );

        return (
          <div key={plan.name} className="flex min-h-0 flex-col">
            <div className="flex min-h-[2.25rem] items-end justify-center pb-2 md:min-h-[2.5rem]">
              {plan.recommended ? (
                <span className={recommendedPillClass}>Recommended</span>
              ) : null}
            </div>

            <div className={cardClass}>
              <div className="shrink-0">
                <h3 className="font-marketing-display text-xl font-normal text-white md:text-2xl">{plan.name}</h3>
                <p className="mt-2 min-h-[4.25rem] text-[15px] font-light leading-snug text-white/70 md:min-h-[4.5rem]">
                  {plan.description}
                </p>
              </div>

              <div className="flex min-h-[6.75rem] shrink-0 flex-col gap-1.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-marketing-display text-4xl font-normal tabular-nums tracking-tight text-white transition-all duration-300 ease-out md:text-5xl">
                    ${monthlyEquivalent}
                  </span>
                  <span className="text-sm font-light text-white/60">/month</span>
                </div>
                <p className="text-sm font-light text-white/55">
                  Often aligns with a single retained engagement on your book.
                </p>
                <PlanPriceSubline plan={plan} isAnnual={isAnnual} />
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <RunSnapshotButton
                  loading={isLoading}
                  onClick={() => onCheckout(plan.id)}
                  variant={plan.recommended ? "primary" : "outline"}
                  className={cn(!plan.recommended && "font-normal")}
                />
                <Link
                  href="/preview"
                  className="text-center text-sm font-normal text-white/65 transition-all duration-200 ease-out hover:text-white/90"
                >
                  See example report
                </Link>
              </div>

              <div className="border-t border-white/10 pt-4">
                <ul className="flex flex-col space-y-3">
                  {plan.highlights.map((line) => (
                    <li key={line} className="flex items-start gap-3 text-[15px] font-light leading-snug text-white/70">
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
  );
}

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const nextParam = searchParams.get("next");
  const isPaywall = !!nextParam && isLoggedIn;

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
    });
  }, []);

  async function handleCheckout(planId: "starter" | "growth" | "pro") {
    if (!isLoggedIn) {
      router.push(`/onboarding?plan=${planId}&interval=${isAnnual ? "annual" : "monthly"}`);
      return;
    }

    setLoadingPlan(planId);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        router.push("/onboarding");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          planId,
          interval: isAnnual ? "annual" : "monthly",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        if (error.code === "NO_AGENCY") {
          router.push("/onboarding");
          return;
        }
        alert(error.error || "Checkout failed");
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  if (isPaywall) {
    return (
      <div className="page-marketing selection:bg-[var(--accent-bg)] selection:text-white">
        <main>
          <section className={cn("border-b border-white/10", pricingTop)}>
            <div className={shell}>
              <PricingEyebrow>{`// CHOOSE PLAN`}</PricingEyebrow>
              <h1 className="mt-3 font-marketing-display text-[1.75rem] font-normal leading-[1.12] tracking-[-0.03em] text-white md:text-4xl">
                Choose your plan
              </h1>
              <p className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-white/80">
                Generate your first report on onboarding, then scale when you&apos;re ready.
              </p>

              <div className="mt-3">
                <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
              </div>

              <div className="mt-6 grid gap-6 overflow-visible md:mt-7 md:grid-cols-3 md:items-stretch md:gap-7">
                {plans.map((plan) => {
                  const { monthlyEquivalent } = planBillingFigures(plan, isAnnual);
                  const isSelected = selectedPlan === plan.id;
                  const isRecommended = plan.recommended && !selectedPlan;

                  const btnClass = cn(
                    "flex flex-col space-y-4 rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-7 text-left transition-all duration-200 ease-out md:p-8",
                    "hover:scale-[1.01]",
                    plan.recommended &&
                      "scale-[1.03] border-[rgba(0,232,122,0.3)] from-white/[0.06] to-white/[0.02] shadow-[0_0_40px_rgba(0,232,122,0.15)]",
                    !plan.recommended && "from-white/[0.03] to-white/[0.01]",
                    (isSelected || (!isSelected && isRecommended)) && "ring-1 ring-[rgba(0,232,122,0.35)]",
                  );

                  return (
                    <div key={plan.id} className="flex flex-col">
                      <div className="flex min-h-[2.25rem] items-end justify-center pb-2">
                        {plan.recommended ? <span className={recommendedPillClass}>Recommended</span> : null}
                      </div>
                      <button type="button" onClick={() => setSelectedPlan(plan.id)} className={btnClass}>
                        <div>
                          <h3 className="font-marketing-display text-lg font-normal text-white">{plan.name}</h3>
                          <p className="mt-1 text-sm font-light text-white/55">
                            {plan.clients === 50 ? "50+" : plan.clients} clients
                          </p>
                        </div>
                        <div className="flex flex-col gap-1.5 text-left">
                          <div className="flex items-baseline gap-2">
                            <span className="font-marketing-display text-3xl font-normal tabular-nums text-white transition-all duration-300 ease-out md:text-4xl">
                              ${monthlyEquivalent}
                            </span>
                            <span className="text-sm text-white/60">/mo</span>
                          </div>
                          <p className="text-sm font-light text-white/55">
                            Often aligns with a single retained engagement on your book.
                          </p>
                          <PlanPriceSubline plan={plan} isAnnual={isAnnual} />
                        </div>
                        <ul className="flex flex-1 flex-col space-y-2 border-t border-white/10 pt-4 text-left">
                          {plan.highlights.map((line) => (
                            <li key={line} className="flex items-start gap-2 text-sm font-light text-white/70">
                              <Check className="mt-0.5 h-4 w-4" />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col items-start gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
                <RunSnapshotButton
                  loading={!!loadingPlan}
                  onClick={() => handleCheckout((selectedPlan || "growth") as "starter" | "growth" | "pro")}
                  className="w-full max-w-xs sm:w-auto"
                />
                <Link
                  href="/preview"
                  className="text-sm font-normal text-white/70 transition-all duration-200 hover:text-white"
                >
                  See example report
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="page-marketing selection:bg-[var(--accent-bg)] selection:text-white">
      <main>
        <section className={cn("border-b border-white/10", pricingTop)}>
          <div className={shell}>
            <PricingEyebrow>{`// PRICING`}</PricingEyebrow>

            <h1 className="mt-3 max-w-[760px] font-marketing-display text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-white md:text-[2.75rem] lg:text-[3.25rem]">
              Plans for agencies standardizing AI visibility
            </h1>

            <p className="mt-5 max-w-[640px] text-lg font-light leading-relaxed text-white/80">
              Model-level answers, reporting, and displacement context—structured so your team can operationalize it across
              accounts.
            </p>

            <ul className="mt-4 flex max-w-[720px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-1">
              {heroBullets.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-light text-white/75">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-white/40" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-3">
              <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
            </div>

            <PlanCards isAnnual={isAnnual} loadingPlan={loadingPlan} onCheckout={handleCheckout} />
          </div>
        </section>

        <section className={cn(sectionGap, sectionBlock)}>
          <div className={shell}>
            <div className="flex flex-col justify-between gap-6 rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.05] to-white/[0.02] px-6 py-7 md:flex-row md:items-center md:px-8 md:py-8">
              <div className="min-w-0">
                <h2 className="font-marketing-display text-xl font-normal text-white md:text-2xl">More than 50 clients?</h2>
                <p className="mt-6 max-w-xl text-[15px] font-light leading-relaxed text-white/75">
                  Custom pricing, rollout support, and terms that match how your agency sells.
                </p>
              </div>
              <a
                href="mailto:hello@vrtlscore.com"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:border-white/25 hover:bg-white/[0.05] active:scale-[0.98]"
              >
                Contact sales →
              </a>
            </div>
          </div>
        </section>

        <section className={cn(sectionGap, sectionBlock)}>
          <div className={shell}>
            <h2 className="max-w-[720px] font-marketing-display text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-white md:text-[2.25rem]">
              What changes at each level
            </h2>
            <p className="mt-6 max-w-xl text-base font-light text-white/75">
              What actually changes as you scale reporting
            </p>

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] md:rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="px-6 py-5 text-left font-marketing-mono text-[10px] font-medium uppercase tracking-[0.12em] text-white/55 md:px-8 md:py-6">
                        &nbsp;
                      </th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-white/90 md:px-8 md:py-6">Foundation</th>
                      <th className="border-x border-[rgba(0,232,122,0.2)] bg-[rgba(0,232,122,0.08)] px-6 py-5 text-center text-sm font-semibold text-white md:px-8 md:py-6">
                        Agency
                      </th>
                      <th className="px-6 py-5 text-center text-sm font-semibold text-white/90 md:px-8 md:py-6">Scale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, i) => (
                      <tr
                        key={feature.name}
                        className={cn(
                          "border-b border-white/10 last:border-b-0",
                          i % 2 === 1 && "bg-white/[0.02]",
                        )}
                      >
                        <td className="px-6 py-5 text-[15px] font-light text-white/75 md:px-8 md:py-6">{feature.name}</td>
                        <td className="px-6 py-5 text-center text-[15px] font-light text-white/75 md:px-8 md:py-6">
                          {feature.starter}
                        </td>
                        <td className="border-x border-[rgba(0,232,122,0.2)] bg-[rgba(0,232,122,0.08)] px-6 py-5 text-center text-[15px] font-medium text-white md:px-8 md:py-6">
                          {feature.growth}
                        </td>
                        <td className="px-6 py-5 text-center text-[15px] font-light text-white/75 md:px-8 md:py-6">
                          {feature.pro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className={cn(sectionGap, sectionBlock)}>
          <div className={shell}>
            <h2 className="font-marketing-display text-[1.75rem] font-normal leading-[1.15] text-white md:text-[2.25rem]">
              Questions
            </h2>
            <p className="mt-6 max-w-xl text-base font-light text-white/75">Straight answers on plans and billing</p>

            <div className="mt-6 grid min-h-0 gap-8 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="flex h-full min-h-[12rem] flex-col rounded-xl border border-white/15 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 transition-all duration-200 ease-out hover:bg-white/[0.05] md:min-h-[13rem] md:p-7"
                >
                  <h3 className="text-base font-medium text-white">{faq.question}</h3>
                  <p className="mt-3 flex-1 text-[15px] font-light leading-relaxed text-white/70">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={cn(sectionGap, "border-b border-white/10 pb-20 md:pb-24")}>
          <div className={cn(shell, "text-center")}>
            <h2 className="mx-auto max-w-[720px] font-marketing-display text-[1.85rem] font-normal leading-[1.12] text-white md:text-[2.65rem] md:leading-[1.1]">
              Your clients are already being replaced in AI answers.
            </h2>
            <p className="mx-auto mt-6 max-w-md text-base font-light text-white/80">
              Run a snapshot. Walk into your next client call with proof.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
              <RunSnapshotButton
                loading={loadingPlan === "growth"}
                onClick={() => handleCheckout("growth")}
                size="large"
                className="w-full shadow-[0_0_30px_rgba(0,232,122,0.2)] sm:w-auto"
              />
              <Link
                href="/preview"
                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-base font-normal text-white/75 transition-all duration-200 ease-out hover:border-white/25 hover:text-white active:scale-[0.98]"
              >
                See example report
              </Link>
            </div>
            <Link
              href="/"
              className="mt-8 inline-block text-sm font-normal text-white/50 transition-all duration-200 hover:text-white/75"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="page-marketing flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[var(--accent-marketing)]" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
