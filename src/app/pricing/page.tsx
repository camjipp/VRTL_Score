"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { SectionLabel } from "@/components/SectionLabel";
import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/** Same horizontal grid as landing (`src/app/page.tsx`). */
const shell = "mx-auto w-full max-w-[1200px] px-6 md:px-12";

const sectionY = "py-16 md:py-24";

const cardBase =
  "flex h-full min-h-0 flex-col gap-5 rounded-xl border border-zinc-800 bg-zinc-900 p-6 md:p-8";
const cardFeatured =
  "relative z-10 scale-[1.02] border-emerald-500/40 bg-zinc-900/80";

function Check({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 text-zinc-300",
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
    description: "For agencies validating AI visibility with a tight client list before you productize reporting.",
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
    description: "For firms managing a large book and packaging AI visibility as a core, billable line of business.",
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
      "Run a free snapshot during onboarding to see the product on real data. When you’re ready to cover more clients and history, pick a plan that matches your book.",
  },
  {
    question: "Can I change plans later?",
    answer: "Yes. Upgrade or downgrade anytime. We’ll prorate your billing automatically.",
  },
  {
    question: "What AI providers are included?",
    answer:
      "All plans include the leading models we track for visibility analysis. We add providers as the landscape shifts.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes. If you’re not satisfied within the first 30 days, we’ll refund your payment in full.",
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

const howAgenciesBullets = [
  "Spot which clients are losing AI visibility",
  "See which competitors are replacing them",
  "Ship a report clients actually understand",
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
  compact,
}: {
  isAnnual: boolean;
  setIsAnnual: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", compact ? "gap-2" : "gap-4")}>
      <div className="relative inline-flex items-center rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)] p-1">
        <button
          type="button"
          onClick={() => setIsAnnual(false)}
          className={cn(
            "relative rounded-full font-medium transition-all",
            compact ? "px-4 py-1.5 text-sm" : "px-5 py-2 text-sm",
            !isAnnual ? "bg-[var(--text-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setIsAnnual(true)}
          className={cn(
            "relative rounded-full font-medium transition-all",
            compact ? "px-4 py-1.5 text-sm" : "px-5 py-2 text-sm",
            isAnnual ? "bg-[var(--text-primary)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
          )}
        >
          Annual
        </button>
      </div>
      {isAnnual && (
        <span className="rounded-full border border-[color:var(--border-mid)] bg-[var(--bg-inset)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] md:text-sm">
          2 months free on annual
        </span>
      )}
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
        <main className="min-h-screen">
          <section className={cn("border-b border-[color:var(--border-subtle)]", sectionY)}>
            <div className={shell}>
              <div className="text-center">
                <SectionLabel noMargin>{`// CHOOSE PLAN`}</SectionLabel>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
                  Choose your plan
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-base font-light text-[var(--text-secondary)]">
                  Generate your first report on onboarding, then scale when you&apos;re ready.
                </p>
              </div>

              <div className="mt-10">
                <BillingToggle compact isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3 md:gap-8 md:items-stretch">
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
                        "flex h-full flex-col gap-5 rounded-xl border p-6 text-left transition-colors",
                        "border-zinc-800 bg-zinc-900",
                        isSelected && "border-emerald-500/40 bg-zinc-900/80",
                        !isSelected && isRecommended && cardFeatured,
                        !isSelected && !isRecommended && "hover:border-zinc-700",
                      )}
                    >
                      <div className="min-h-[2.25rem]">
                        {plan.recommended ? (
                          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                            Most agencies choose this
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-[var(--text-primary)]">{plan.name}</h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {plan.clients === 50 ? "50+" : plan.clients} clients
                        </p>
                      </div>

                      <div className="flex min-h-[5.5rem] flex-col gap-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
                            ${monthlyEquivalent}
                          </span>
                          <span className="text-sm text-[var(--text-secondary)]">/mo</span>
                        </div>
                        <p className="text-sm text-zinc-400">Typical ROI: 1 retained client pays for this 10–30x</p>
                      </div>

                      <ul className="flex flex-1 flex-col gap-3 text-left">
                        {plan.highlights.map((line) => (
                          <li key={line} className="flex items-start gap-3 text-sm text-zinc-400">
                            <Check className="mt-0.5" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-col items-center gap-6">
                <RunSnapshotButton
                  loading={!!loadingPlan}
                  onClick={() => handleCheckout((selectedPlan || "growth") as "starter" | "growth" | "pro")}
                  className="w-full max-w-md sm:w-auto"
                />
                <Link
                  href="/preview"
                  className="text-sm font-normal text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
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
        <section className={cn("border-b border-[color:var(--border-subtle)]", sectionY)}>
          <div className={shell}>
            <div className="text-center">
              <SectionLabel noMargin>{`// PRICING`}</SectionLabel>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl md:leading-[1.1]">
                Pricing built for agencies that want to win AI search
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg font-light leading-relaxed text-zinc-400">
                Most agencies lose clients without even knowing why. VRTL Score shows you where you&apos;re being replaced —
                and how to fix it.
              </p>

              <ul className="mx-auto mt-10 max-w-xl space-y-3 text-left text-base font-light text-[var(--text-secondary)]">
                {heroBullets.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--text-muted)]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <BillingToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
              </div>
            </div>
          </div>
        </section>

        <section className={cn("border-b border-[color:var(--border-subtle)]", sectionY)}>
          <div className={shell}>
            <div className="grid gap-6 overflow-visible py-1 lg:grid-cols-3 lg:items-stretch lg:gap-8 lg:py-2">
              {plans.map((plan) => {
                const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
                const monthlyEquivalent = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
                const isLoading = loadingPlan === plan.id;

                return (
                  <div
                    key={plan.name}
                    className={cn(cardBase, plan.recommended && cardFeatured)}
                  >
                    <div className="min-h-[2.25rem] shrink-0">
                      {plan.recommended ? (
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                          Most agencies choose this
                        </p>
                      ) : null}
                    </div>

                    <div className="shrink-0">
                      <h3 className="text-lg font-medium text-[var(--text-primary)]">{plan.name}</h3>
                      <p className="mt-2 min-h-[4.5rem] text-sm font-light leading-relaxed text-[var(--text-secondary)]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex min-h-[7.5rem] shrink-0 flex-col gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
                          ${monthlyEquivalent}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)]">/month</span>
                      </div>
                      <p className="text-sm text-zinc-400">Typical ROI: 1 retained client pays for this 10–30x</p>
                      {isAnnual && (
                        <p className="text-sm text-[var(--text-secondary)]">${price.toLocaleString()} billed annually</p>
                      )}
                      {!isAnnual && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString()}/year on annual
                        </p>
                      )}
                    </div>

                    <div className="flex min-h-[5.25rem] shrink-0 flex-col gap-2">
                      <RunSnapshotButton
                        loading={isLoading}
                        onClick={() => handleCheckout(plan.id)}
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

                    <ul className="flex flex-1 flex-col gap-3">
                      {plan.highlights.map((line) => (
                        <li key={line} className="flex items-start gap-3 text-sm text-zinc-400">
                          <Check className="mt-0.5" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-6 md:mt-12 md:p-8">
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">More than 50 clients?</h3>
                  <p className="mt-2 max-w-xl text-sm font-light text-[var(--text-secondary)]">
                    Custom pricing, rollout support, and terms that match how your agency sells.
                  </p>
                </div>
                <a
                  href="mailto:hello@vrtlscore.com"
                  className="shrink-0 rounded-full border border-[color:var(--border-mid)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[color:var(--border-strong)]"
                >
                  Contact sales →
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={cn("border-b border-[color:var(--border-subtle)] bg-[var(--bg-surface)]", sectionY)}>
          <div className={shell}>
            <h2 className="text-center text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
              How agencies use VRTL Score
            </h2>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {howAgenciesBullets.map((item) => (
                <li
                  key={item}
                  className="flex h-full min-h-[8rem] flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm font-light leading-relaxed text-zinc-400"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={cn("border-b border-[color:var(--border-subtle)]", sectionY)}>
          <div className={shell}>
            <h2 className="text-center text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
              At a glance
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base font-light text-zinc-400">
              What actually moves the needle for your book
            </p>

            <div className="mt-10 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950">
                      <th className="px-6 py-5 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                        &nbsp;
                      </th>
                      <th className="px-6 py-5 text-center text-sm font-medium text-zinc-300">Foundation</th>
                      <th className="px-6 py-5 text-center text-sm font-medium text-[var(--text-primary)] bg-emerald-500/5">
                        Agency
                      </th>
                      <th className="px-6 py-5 text-center text-sm font-medium text-zinc-300">Scale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {comparisonFeatures.map((feature) => (
                      <tr key={feature.name} className="bg-zinc-900">
                        <td className="px-6 py-5 text-sm text-zinc-400">{feature.name}</td>
                        <td className="px-6 py-5 text-center text-sm text-zinc-300">{feature.starter}</td>
                        <td className="px-6 py-5 text-center text-sm font-medium text-[var(--text-primary)] bg-emerald-500/5">
                          {feature.growth}
                        </td>
                        <td className="px-6 py-5 text-center text-sm text-zinc-300">{feature.pro}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className={cn("border-b border-[color:var(--border-subtle)]", sectionY)}>
          <div className={shell}>
            <h2 className="text-center text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
              Questions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base font-light text-zinc-400">
              Straight answers on plans and billing
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <h3 className="text-base font-medium text-[var(--text-primary)]">{faq.question}</h3>
                  <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-zinc-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={sectionY}>
          <div className={cn(shell, "text-center")}>
            <h2 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
              See where you&apos;re being replaced
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base font-light text-zinc-400">
              Run a snapshot, walk into your next client call with proof.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-6">
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
              <Link
                href="/"
                className="text-sm font-normal text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
              >
                ← Back to home
              </Link>
            </div>
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
