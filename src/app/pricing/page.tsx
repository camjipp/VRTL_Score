"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { SectionLabel } from "@/components/SectionLabel";
import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const shell = "mx-auto w-full max-w-[1200px] px-6 md:px-12";

/** Below sticky nav (60px); keeps intro + cards above the fold on desktop. */
const pricingTop = "pt-6 pb-10 md:pt-8 md:pb-12";

/** Tighter rhythm than generic marketing sections — conversion path. */
const sectionBelow = "border-b border-[color:var(--border-subtle)] py-12 md:py-16";

function Check({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-inset)] text-[var(--text-secondary)]",
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
    description:
      "For agencies validating AI visibility with a tight client list before productizing reporting.",
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
    description: "For agencies running client reporting and closing retainers with AI visibility.",
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
    description:
      "For firms managing a large book and packaging AI visibility as a core, billable line of business.",
    monthlyPrice: 799,
    yearlyPrice: 7990,
    clients: 50,
    highlights: [
      "50+ clients",
      "Everything in Agency",
      "Fastest runs + dedicated account manager",
      "8 competitors per client",
    ],
  },
];

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
      "Run a free snapshot during onboarding to see the product on real data. When you're ready to cover more clients and history, pick a plan that matches your book.",
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
    answer: "No. Monthly plans cancel anytime. Annual is billed upfront with two months included free.",
  },
];

const heroBullets = [
  "Catch client risk before churn",
  "Prove value in client calls",
  "Turn AI visibility into a billable service",
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
    "inline-flex w-full items-center justify-center gap-1 font-medium transition duration-150 disabled:opacity-50";
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
          "bg-[var(--accent-marketing)] text-black hover:scale-[1.02] hover:brightness-110",
        variant === "outline" &&
          "border border-[color:var(--border-mid)] bg-transparent font-normal text-[var(--text-secondary)] hover:border-[color:var(--border-strong)] hover:text-[var(--text-primary)]",
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
      <div className="relative inline-flex items-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
        <button
          type="button"
          onClick={() => setIsAnnual(false)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all md:px-5 md:py-2",
            !isAnnual ? "bg-[var(--text-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setIsAnnual(true)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all md:px-5 md:py-2",
            isAnnual ? "bg-[var(--text-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
        >
          Annual
        </button>
      </div>
      {isAnnual && (
        <span className="rounded-full border border-[color:var(--border-mid)] bg-[var(--bg-inset)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] md:text-sm">
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
    <div className="mt-8 grid gap-4 md:mt-10 md:grid-cols-3 md:items-stretch md:gap-5 lg:gap-6">
      {plans.map((plan) => {
        const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
        const monthlyEquivalent = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
        const isLoading = loadingPlan === plan.id;

        return (
          <div
            key={plan.name}
            className={cn(
              "flex h-full min-h-0 flex-col gap-4 rounded-xl border bg-[var(--bg-elevated)] p-5 md:gap-5 md:p-6",
              "border-[color:var(--border-subtle)]",
              plan.recommended && "border-[color:var(--accent-border)] bg-[var(--bg-surface)] shadow-[0_0_0_1px_rgba(0,232,122,0.12)]",
            )}
          >
            <div className="min-h-[1.375rem] shrink-0">
              {plan.recommended ? (
                <p className="font-marketing-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  Most agencies choose this
                </p>
              ) : null}
            </div>

            <div className="shrink-0">
              <h3 className="font-marketing-display text-xl font-normal text-[var(--text-primary)] md:text-2xl">{plan.name}</h3>
              <p className="mt-2 min-h-[4.25rem] text-[15px] font-light leading-snug text-[var(--text-secondary)] md:min-h-[4.5rem]">
                {plan.description}
              </p>
            </div>

            <div className="flex min-h-[6.75rem] shrink-0 flex-col gap-1.5">
              <div className="flex items-baseline gap-2">
                <span className="font-marketing-display text-4xl font-normal tabular-nums tracking-tight text-[var(--text-primary)] md:text-5xl">
                  ${monthlyEquivalent}
                </span>
                <span className="text-sm font-light text-[var(--text-secondary)]">/month</span>
              </div>
              <p className="text-sm font-light text-[var(--text-secondary)]">
                Typical ROI: 1 retained client pays for this 10–30x
              </p>
              {isAnnual ? (
                <p className="text-sm font-light text-[var(--text-muted)]">${price.toLocaleString()} billed annually</p>
              ) : (
                <p className="text-sm font-light text-[var(--text-muted)]">
                  Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString()}/year on annual
                </p>
              )}
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
                className="text-center text-sm font-normal text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                See example report
              </Link>
            </div>

            <div className="border-t border-[color:var(--border-subtle)] pt-4 md:pt-5">
              <ul className="flex flex-col gap-2.5">
                {plan.highlights.map((line) => (
                  <li key={line} className="flex items-start gap-3 text-[15px] font-light leading-snug text-[var(--text-secondary)]">
                    <Check className="mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
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
      <div className="page-marketing selection:bg-[var(--accent-bg)] selection:text-[var(--text-primary)]">
        <main>
          <section className={cn("border-b border-[color:var(--border-subtle)]", pricingTop)}>
            <div className={shell}>
              <SectionLabel noMargin className="mb-0">
                {`// CHOOSE PLAN`}
              </SectionLabel>
              <h1 className="mt-3 font-marketing-display text-[1.75rem] font-normal leading-[1.12] tracking-[-0.03em] text-[var(--text-primary)] md:text-4xl">
                Choose your plan
              </h1>
              <p className="mt-3 max-w-xl text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">
                Generate your first report on onboarding, then scale when you&apos;re ready.
              </p>

              <div className="mt-5">
                <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
              </div>

              <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-3 md:items-stretch md:gap-5">
                {plans.map((plan) => {
                  const monthlyEquivalent = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
                  const isSelected = selectedPlan === plan.id;
                  const isRecommended = plan.recommended && !selectedPlan;

                  return (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={cn(
                        "flex flex-col gap-4 rounded-xl border p-5 text-left transition-colors md:gap-5 md:p-6",
                        "border-[color:var(--border-subtle)] bg-[var(--bg-elevated)]",
                        isSelected && "border-[color:var(--accent-border)] bg-[var(--bg-surface)]",
                        !isSelected && isRecommended && "border-[color:var(--accent-border)] bg-[var(--bg-surface)]",
                        !isSelected && !isRecommended && "hover:border-[color:var(--border-mid)]",
                      )}
                    >
                      <div className="min-h-[1.375rem]">
                        {plan.recommended ? (
                          <p className="font-marketing-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                            Most agencies choose this
                          </p>
                        ) : null}
                      </div>
                      <div>
                        <h3 className="font-marketing-display text-lg font-normal text-[var(--text-primary)]">{plan.name}</h3>
                        <p className="mt-1 text-sm font-light text-[var(--text-muted)]">
                          {plan.clients === 50 ? "50+" : plan.clients} clients
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 text-left">
                        <div className="flex items-baseline gap-2">
                          <span className="font-marketing-display text-3xl font-normal tabular-nums text-[var(--text-primary)] md:text-4xl">
                            ${monthlyEquivalent}
                          </span>
                          <span className="text-sm text-[var(--text-secondary)]">/mo</span>
                        </div>
                        <p className="text-sm font-light text-[var(--text-secondary)]">
                          Typical ROI: 1 retained client pays for this 10–30x
                        </p>
                      </div>
                      <ul className="flex flex-1 flex-col gap-2 border-t border-[color:var(--border-subtle)] pt-4 text-left">
                        {plan.highlights.map((line) => (
                          <li key={line} className="flex items-start gap-2 text-sm font-light text-[var(--text-secondary)]">
                            <Check className="mt-0.5 h-4 w-4" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-col items-start gap-4 border-t border-[color:var(--border-subtle)] pt-8 md:flex-row md:items-center md:justify-between">
                <RunSnapshotButton
                  loading={!!loadingPlan}
                  onClick={() => handleCheckout((selectedPlan || "growth") as "starter" | "growth" | "pro")}
                  className="w-full max-w-xs sm:w-auto"
                />
                <Link
                  href="/preview"
                  className="text-sm font-normal text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
    <div className="page-marketing selection:bg-[var(--accent-bg)] selection:text-[var(--text-primary)]">
      <main>
        {/* 1–2: Compact intro + pricing cards (single section, above the fold) */}
        <section className={cn("border-b border-[color:var(--border-subtle)]", pricingTop)}>
          <div className={shell}>
            <SectionLabel noMargin className="mb-0">
              {`// PRICING`}
            </SectionLabel>

            <h1 className="mt-3 max-w-[760px] font-marketing-display text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-[var(--text-primary)] md:text-[2.75rem] lg:text-[3.25rem]">
              Pricing built for agencies that want to win AI search
            </h1>

            <p className="mt-4 max-w-[640px] text-lg font-light leading-relaxed text-[var(--text-secondary)]">
              Most agencies lose clients without even knowing why. VRTL Score shows you where you&apos;re being replaced — and
              how to fix it.
            </p>

            <ul className="mt-4 flex max-w-[720px] flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-1">
              {heroBullets.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-light text-[var(--text-secondary)]">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--text-muted)]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
            </div>

            <PlanCards isAnnual={isAnnual} loadingPlan={loadingPlan} onCheckout={handleCheckout} />
          </div>
        </section>

        {/* 3: Enterprise */}
        <section className={sectionBelow}>
          <div className={shell}>
            <div className="flex flex-col justify-between gap-6 rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-6 md:flex-row md:items-center md:px-8 md:py-7">
              <div className="min-w-0">
                <h2 className="font-marketing-display text-xl font-normal text-[var(--text-primary)] md:text-2xl">
                  More than 50 clients?
                </h2>
                <p className="mt-2 max-w-xl text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">
                  Custom pricing, rollout support, and terms that match how your agency sells.
                </p>
              </div>
              <a
                href="mailto:hello@vrtlscore.com"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[color:var(--border-mid)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[color:var(--border-strong)]"
              >
                Contact sales →
              </a>
            </div>
          </div>
        </section>

        {/* 4: Comparison */}
        <section className={sectionBelow}>
          <div className={shell}>
            <h2 className="max-w-[720px] font-marketing-display text-[1.75rem] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--text-primary)] md:text-[2.25rem]">
              What changes at each level
            </h2>
            <p className="mt-3 max-w-xl text-base font-light text-[var(--text-secondary)]">
              What actually changes as you scale reporting
            </p>

            <div className="mt-8 overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead>
                    <tr className="border-b border-[color:var(--border-subtle)] bg-[var(--bg-inset)]">
                      <th className="px-5 py-4 text-left font-marketing-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)] md:px-6 md:py-5">
                        &nbsp;
                      </th>
                      <th className="px-5 py-4 text-center text-sm font-medium text-[var(--text-secondary)] md:px-6 md:py-5">
                        Foundation
                      </th>
                      <th className="px-5 py-4 text-center text-sm font-medium text-[var(--text-primary)] bg-[var(--accent-bg)] md:px-6 md:py-5">
                        Agency
                      </th>
                      <th className="px-5 py-4 text-center text-sm font-medium text-[var(--text-secondary)] md:px-6 md:py-5">
                        Scale
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, i) => (
                      <tr
                        key={feature.name}
                        className={cn(
                          "border-b border-[color:var(--border-subtle)] last:border-b-0",
                          i % 2 === 1 && "bg-[var(--bg-surface)]/50",
                        )}
                      >
                        <td className="px-5 py-4 text-[15px] font-light text-[var(--text-secondary)] md:px-6 md:py-5">
                          {feature.name}
                        </td>
                        <td className="px-5 py-4 text-center text-[15px] font-light text-[var(--text-secondary)] md:px-6 md:py-5">
                          {feature.starter}
                        </td>
                        <td className="px-5 py-4 text-center text-[15px] font-medium text-[var(--text-primary)] bg-[var(--accent-bg)] md:px-6 md:py-5">
                          {feature.growth}
                        </td>
                        <td className="px-5 py-4 text-center text-[15px] font-light text-[var(--text-secondary)] md:px-6 md:py-5">
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

        {/* 5: FAQ */}
        <section className={sectionBelow}>
          <div className={shell}>
            <h2 className="font-marketing-display text-[1.75rem] font-normal leading-[1.15] text-[var(--text-primary)] md:text-[2.25rem]">
              Questions
            </h2>
            <p className="mt-3 max-w-xl text-base font-light text-[var(--text-secondary)]">
              Straight answers on plans and billing
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="flex h-full min-h-[11rem] flex-col rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)] p-6 md:min-h-[12rem] md:p-7"
                >
                  <h3 className="text-base font-medium text-[var(--text-primary)]">{faq.question}</h3>
                  <p className="mt-3 flex-1 text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6: Final CTA */}
        <section className="border-b border-[color:var(--border-subtle)] py-14 md:py-20">
          <div className={cn(shell, "text-center")}>
            <h2 className="mx-auto max-w-[640px] font-marketing-display text-[1.75rem] font-normal leading-[1.15] text-[var(--text-primary)] md:text-[2.5rem]">
              See where you&apos;re being replaced
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base font-light text-[var(--text-secondary)]">
              Run a snapshot, walk into your next client call with proof.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
              <RunSnapshotButton
                loading={loadingPlan === "growth"}
                onClick={() => handleCheckout("growth")}
                size="large"
                className="w-full sm:w-auto"
              />
              <Link
                href="/preview"
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-mid)] px-6 py-3.5 text-base font-normal text-[var(--text-secondary)] transition duration-150 hover:border-[color:var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                See example report
              </Link>
            </div>
            <Link
              href="/"
              className="mt-6 inline-block text-sm font-normal text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[color:var(--border-subtle)] border-t-[var(--accent-marketing)]" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
