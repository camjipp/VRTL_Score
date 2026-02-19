"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function Check({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400", className)}>
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
    name: "Starter",
    description: "For small agencies getting started with AI visibility.",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    clients: 5,
    features: [
      "Up to 5 active clients",
      "Unlimited snapshots",
      "PDF report export",
      "All leading AI providers included",
      "Basic branding",
      "Email support",
    ],
  },
  {
    id: "growth" as const,
    name: "Growth",
    description: "For real agencies running weekly reporting.",
    monthlyPrice: 399,
    yearlyPrice: 3990,
    clients: 20,
    features: [
      "Up to 20 active clients",
      "Unlimited snapshots",
      "Full PDF branding (logo, colors, footer)",
      "Priority snapshot processing",
      "Complete snapshot history",
      "Competitor tracking (up to 8 per client)",
      "Priority support",
    ],
    recommended: true,
  },
  {
    id: "pro" as const,
    name: "Pro",
    description: "For larger agencies and power users.",
    monthlyPrice: 799,
    yearlyPrice: 7990,
    clients: 50,
    features: [
      "50+ active clients",
      "Unlimited snapshots",
      "Everything in Growth",
      "Faster snapshot runs",
      "White-label domain (coming soon)",
      "API access (coming soon)",
      "Team seats (coming soon)",
      "Dedicated account manager",
    ],
  },
];

const comparisonFeatures = [
  { name: "Active clients", starter: "5", growth: "20", pro: "50+" },
  { name: "Snapshots per month", starter: "Unlimited", growth: "Unlimited", pro: "Unlimited" },
  { name: "AI providers", starter: true, growth: true, pro: true },
  { name: "PDF exports", starter: true, growth: true, pro: true },
  { name: "Full branding (logo + colors)", starter: false, growth: true, pro: true },
  { name: "Priority processing", starter: false, growth: true, pro: true },
  { name: "Snapshot history", starter: "30 days", growth: "Unlimited", pro: "Unlimited" },
  { name: "Competitor tracking", starter: "4 per client", growth: "8 per client", pro: "8 per client" },
  { name: "White-label domain", starter: false, growth: false, pro: "Coming soon" },
  { name: "API access", starter: false, growth: false, pro: "Coming soon" },
  { name: "Team seats", starter: "1", growth: "3", pro: "Unlimited" },
  { name: "Support", starter: "Email", growth: "Priority", pro: "Dedicated" },
];

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "All plans include a 7-day free trial with full access to features. You'll enter your card at signup, but won't be charged until the trial ends. Cancel anytime.",
  },
  {
    question: "Can I change plans later?",
    answer: "Absolutely. Upgrade or downgrade anytime. We'll prorate your billing automatically.",
  },
  {
    question: "What AI providers are included?",
    answer: "All plans include access to the leading AI models for comprehensive visibility analysis. We continuously add new providers as they emerge.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes. If you're not satisfied within the first 30 days, we'll refund your payment in full.",
  },
  {
    question: "What happens if I exceed my client limit?",
    answer: "You can add extra clients for $25-50/client/month, or upgrade to a higher tier for better value.",
  },
  {
    question: "Is there a contract or commitment?",
    answer: "No long-term contracts. Monthly plans can be cancelled anytime. Annual plans are billed upfront with 2 months free.",
  },
];

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Check if this is a paywall context (user came from onboarding)
  const nextParam = searchParams.get("next");
  const isPaywall = !!nextParam && isLoggedIn;

  // Check if user is logged in
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
        // If no agency, redirect to complete onboarding
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

  // Paywall mode - clean, focused plan selection
  if (isPaywall) {
    return (
      <main className="min-h-screen bg-black">
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-20">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl">
              🎉
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Choose your plan
            </h1>
            <p className="mt-2 text-white/60">
              Start your 7-day free trial. Cancel anytime.
            </p>
          </div>

          {/* Billing toggle */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="relative inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  !isAnnual ? "bg-white text-black" : "text-white/50 hover:text-white/80"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  isAnnual ? "bg-white text-black" : "text-white/50 hover:text-white/80"
                )}
              >
                Annual
              </button>
            </div>
            {isAnnual && (
              <span className="rounded-full border border-emerald-500/50 bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Save 2 months
              </span>
            )}
          </div>

          {/* Plan cards - compact */}
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
                    "relative flex flex-col rounded-2xl border-2 p-5 text-left transition-all",
                    isSelected
                      ? "border-emerald-500 bg-white/5 ring-2 ring-emerald-500/20"
                      : isRecommended
                        ? "border-emerald-500/50 bg-white/[0.02]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  {/* Badge */}
                  {(isSelected || isRecommended) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white",
                        isSelected ? "bg-emerald-500" : "bg-emerald-500/80"
                      )}>
                        {isSelected ? (
                          <>
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Selected
                          </>
                        ) : "Recommended"}
                      </span>
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="font-semibold text-white">{plan.name}</h3>
                    <p className="mt-1 text-xs text-white/40">{plan.clients === 50 ? "50+" : plan.clients} clients</p>
                  </div>

                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">${monthlyEquivalent}</span>
                    <span className="text-sm text-white/40">/mo</span>
                  </div>

                  <ul className="flex-1 space-y-2">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs text-white/70">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-xs text-white/40">
                        +{plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => handleCheckout((selectedPlan || "growth") as "starter" | "growth" | "pro")}
              disabled={!!loadingPlan}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-500 px-8 text-base font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
            >
              {loadingPlan ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
                  Processing...
    </span>
              ) : (
                `Start free trial with ${plans.find(p => p.id === (selectedPlan || "growth"))?.name}`
              )}
            </button>
            <p className="mt-4 text-sm text-white/40">
              7-day free trial · Cancel anytime · No charge until trial ends
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Regular pricing page
  return (
    <main className="min-h-screen bg-black">
      {/* Hero */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            7-day free trial on all plans
          </div>
          
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Pricing built for agencies
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Become the go-to expert for AI visibility. Track, report, and improve how your clients rank across the leading AI models.
          </p>

          {/* Billing toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="relative inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
                  !isAnnual ? "bg-white text-black" : "text-white/50 hover:text-white/80"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
                  isAnnual ? "bg-white text-black" : "text-white/50 hover:text-white/80"
                )}
              >
                Annual
              </button>
            </div>
            {isAnnual && (
              <span className="rounded-full border border-emerald-500/50 bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400">
                Save 2 months
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
              const monthlyEquivalent = isAnnual ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
              const isLoading = loadingPlan === plan.id;

              return (
                <div
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col rounded-3xl border p-8 transition-all",
                    plan.recommended
                      ? "border-emerald-500/50 bg-white/[0.02] ring-2 ring-emerald-500/20 scale-[1.02]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  {plan.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="mt-2 text-sm text-white/60">{plan.description}</p>
              </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-white">
                        ${monthlyEquivalent}
                      </span>
                      <span className="text-white/40">/month</span>
              </div>
                    {isAnnual && (
                      <p className="mt-2 text-sm text-white/40">
                        ${price.toLocaleString()} billed annually
                      </p>
                    )}
                    {!isAnnual && (
                      <p className="mt-2 text-sm text-emerald-400">
                        Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString()}/year with annual
                      </p>
                    )}
              </div>

                  <button
                    type="button"
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isLoading}
                    className={cn(
                      "flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all disabled:opacity-50",
                      plan.recommended
                        ? "bg-emerald-500 text-white hover:bg-emerald-600"
                        : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                    )}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      "Start free trial"
                    )}
                  </button>

                  <div className="my-6 h-px bg-white/10" />

                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/80">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      Up to {plan.clients === 50 ? "50+" : plan.clients} clients
                    </span>
              </div>

                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                        <Check className="mt-0.5 shrink-0" />
                        <span>{feature}</span>
                </li>
                    ))}
              </ul>
                </div>
              );
            })}
          </div>

          {/* Enterprise callout */}
          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 lg:p-12">
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <div>
                <h3 className="text-2xl font-bold text-white">Need more than 50 clients?</h3>
                <p className="mt-2 text-white/60">
                  Get custom pricing, dedicated support, and enterprise features tailored to your agency.
                </p>
              </div>
              <a
                href="mailto:hello@vrtlscore.com"
                className="shrink-0 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
              >
                Contact sales →
              </a>
            </div>
          </div>
            </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-white">Compare plans</h2>
          <p className="mt-2 text-center text-white/60">See what&apos;s included in each plan</p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-400">Growth</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {comparisonFeatures.map((feature) => (
                    <tr key={feature.name} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-white/70">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.starter === "boolean" ? (
                          feature.starter ? <Check className="mx-auto" /> : <span className="text-white/30">—</span>
                        ) : (
                          <span className="text-sm text-white">{feature.starter}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center bg-emerald-500/10">
                        {typeof feature.growth === "boolean" ? (
                          feature.growth ? <Check className="mx-auto" /> : <span className="text-white/30">—</span>
                        ) : (
                          <span className="text-sm font-medium text-white">{feature.growth}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? <Check className="mx-auto" /> : <span className="text-white/30">—</span>
                        ) : (
                          <span className="text-sm text-white">{feature.pro}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                </div>
                </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-white">Frequently asked questions</h2>
          <p className="mt-2 text-center text-white/60">Everything you need to know about pricing</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <h3 className="font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm text-white/60">{faq.answer}</p>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to dominate AI search?</h2>
          <p className="mt-2 text-white/60">Start your 7-day free trial. Cancel anytime before it ends.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => handleCheckout("growth")}
              disabled={loadingPlan === "growth"}
              className="rounded-xl bg-emerald-500 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
            >
              {loadingPlan === "growth" ? "Loading..." : "Start free trial"}
            </button>
            <Link
              href="/"
              className="text-sm font-medium text-white/60 hover:text-white/90"
            >
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
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
