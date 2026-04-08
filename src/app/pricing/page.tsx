"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function Check({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-zinc-200",
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
  "Identify which clients are losing AI visibility",
  "Show exactly which competitors are replacing them",
  "Deliver a report clients actually understand",
];

function RunSnapshotButton({
  loading,
  onClick,
  className,
}: {
  loading?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-xl px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50",
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

  const cardBase =
    "relative flex flex-col rounded-2xl border border-white/[0.08] bg-[#060606] p-8 transition-colors";
  const cardRecommended = "border-white/[0.14] bg-[#0a0a0a] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]";

  if (isPaywall) {
    return (
      <main className="min-h-screen bg-[#030303]">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Choose your plan</h1>
            <p className="mt-3 text-sm text-zinc-500">
              Generate your first report on onboarding, then scale when you&apos;re ready.
            </p>
          </div>

          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="relative inline-flex items-center rounded-full border border-white/[0.08] bg-[#0a0a0a] p-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  !isAnnual ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  isAnnual ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Annual
              </button>
            </div>
            {isAnnual && (
              <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-zinc-400">
                2 months free on annual
              </span>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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
                    "relative flex flex-col rounded-2xl border p-5 text-left transition-all",
                    isSelected
                      ? "border-white/20 bg-[#0c0c0c]"
                      : isRecommended
                        ? cn("border-white/[0.14] bg-[#0a0a0a] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]")
                        : "border-white/[0.08] bg-[#060606] hover:border-white/[0.12]",
                  )}
                >
                  {(isSelected || isRecommended) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-zinc-300",
                          isSelected ? "bg-white/10" : "bg-white/[0.06]",
                        )}
                      >
                        {isSelected ? "Selected" : "Best fit for most"}
                      </span>
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="font-semibold text-white">{plan.name}</h3>
                    <p className="mt-1 text-xs text-zinc-500">{plan.clients === 50 ? "50+" : plan.clients} clients</p>
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl font-bold tracking-tight text-white">${monthlyEquivalent}</span>
                    <span className="text-sm text-zinc-500">/mo</span>
                  </div>
                  <p className="mb-4 text-xs text-zinc-400">Typical ROI: 1 retained client pays for this 10–30x</p>

                  <ul className="flex-1 space-y-2 text-left">
                    {plan.highlights.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-xs text-zinc-400">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <RunSnapshotButton
              loading={!!loadingPlan}
              onClick={() => handleCheckout((selectedPlan || "growth") as "starter" | "growth" | "pro")}
              className="w-full max-w-md bg-white text-black hover:bg-zinc-200 sm:w-auto"
            />
            <Link href="/preview" className="text-sm font-medium text-zinc-500 hover:text-zinc-300">
              See example report
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#030303]">
      <section className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">Pricing</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
            Pricing built for agencies that want to win AI search
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Most agencies lose clients without even knowing why. VRTL Score shows you where you&apos;re being replaced —
            and how to fix it.
          </p>

          <ul className="mx-auto mt-10 max-w-xl space-y-3 text-left text-sm text-zinc-300">
            {heroBullets.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-500" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="relative inline-flex items-center rounded-full border border-white/[0.08] bg-[#0a0a0a] p-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
                  !isAnnual ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
                  isAnnual ? "bg-white text-black" : "text-zinc-500 hover:text-zinc-300",
                )}
              >
                Annual
              </button>
            </div>
            {isAnnual && (
              <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-sm font-medium text-zinc-400">
                2 months free on annual
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-5">
            {plans.map((plan) => {
              const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
              const monthlyEquivalent = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
              const isLoading = loadingPlan === plan.id;

              return (
                <div
                  key={plan.name}
                  className={cn(cardBase, plan.recommended && cn("lg:-mt-1 lg:mb-1", cardRecommended))}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-medium text-zinc-200">
                        Where most agencies land
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">{plan.description}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-semibold tracking-tight text-white">${monthlyEquivalent}</span>
                      <span className="text-zinc-500">/month</span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">Typical ROI: 1 retained client pays for this 10–30x</p>
                    {isAnnual && <p className="mt-2 text-sm text-zinc-500">${price.toLocaleString()} billed annually</p>}
                    {!isAnnual && (
                      <p className="mt-2 text-sm text-zinc-500">
                        Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString()}/year on annual
                      </p>
                    )}
                  </div>

                  <RunSnapshotButton
                    loading={isLoading}
                    onClick={() => handleCheckout(plan.id)}
                    className={cn(
                      "w-full",
                      plan.recommended
                        ? "bg-white text-black hover:bg-zinc-200"
                        : "border border-white/[0.12] bg-transparent text-white hover:bg-white/[0.06]",
                    )}
                  />

                  <Link
                    href="/preview"
                    className="mt-3 block text-center text-xs font-medium text-zinc-500 hover:text-zinc-400"
                  >
                    See example report
                  </Link>

                  <div className="my-6 h-px bg-white/[0.06]" />

                  <div className="mb-4 flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-300">
                      Up to {plan.clients === 50 ? "50+" : plan.clients} clients
                    </span>
                  </div>

                  <ul className="flex-1 space-y-3">
                    {plan.highlights.map((line) => (
                      <li key={line} className="flex items-start gap-3 text-sm text-zinc-400">
                        <Check className="mt-0.5 shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#060606] p-8 lg:p-10">
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">More than 50 clients?</h3>
                <p className="mt-2 max-w-xl text-sm text-zinc-500">
                  Custom pricing, rollout support, and terms that match how your agency sells.
                </p>
              </div>
              <a
                href="mailto:hello@vrtlscore.com"
                className="shrink-0 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"
              >
                Contact sales →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-[#050505]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">How agencies use VRTL Score</h2>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-1 md:grid-cols-3 md:gap-8">
            {howAgenciesBullets.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-white/[0.06] bg-[#080808] px-5 py-4 text-sm leading-relaxed text-zinc-400"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">At a glance</h2>
          <p className="mt-2 text-center text-sm text-zinc-500">What actually moves the needle for your book</p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#0a0a0a]">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      &nbsp;
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-300">Foundation</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white bg-white/[0.04]">Agency</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-300">Scale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] bg-[#060606]">
                  {comparisonFeatures.map((feature) => (
                    <tr key={feature.name} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-zinc-400">{feature.name}</td>
                      <td className="px-6 py-4 text-center text-sm text-zinc-300">{feature.starter}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-white bg-white/[0.03]">
                        {feature.growth}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-zinc-300">{feature.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center text-xl font-semibold text-white sm:text-2xl">Questions</h2>
          <p className="mt-2 text-center text-sm text-zinc-500">Straight answers on plans and billing</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-white/[0.08] bg-[#060606] p-6">
                <h3 className="text-sm font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-white">See where you&apos;re being replaced</h2>
          <p className="mt-3 text-sm text-zinc-500">
            Run a snapshot, walk into the next QBR with proof—not guesswork.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <RunSnapshotButton
              loading={loadingPlan === "growth"}
              onClick={() => handleCheckout("growth")}
              className="bg-white text-black hover:bg-zinc-200"
            />
            <Link href="/preview" className="text-sm font-medium text-zinc-500 hover:text-zinc-300">
              See example report
            </Link>
            <Link href="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-400 sm:ml-2">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#030303]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-zinc-400" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
