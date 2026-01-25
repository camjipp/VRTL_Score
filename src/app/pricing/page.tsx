"use client";

import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/cn";

function Check({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600", className)}>
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
    name: "Starter",
    description: "For small agencies getting started with AI visibility.",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    clients: 5,
    features: [
      "Up to 5 active clients",
      "Unlimited snapshots",
      "PDF report export",
      "All AI providers (GPT, Claude, Gemini)",
      "Basic branding",
      "Email support",
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
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
    cta: "Start free trial",
    popular: true,
  },
  {
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
    cta: "Start free trial",
    popular: false,
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
    answer: "All plans include a 14-day free trial with full access to features. No credit card required to start.",
  },
  {
    question: "Can I change plans later?",
    answer: "Absolutely. Upgrade or downgrade anytime. We'll prorate your billing automatically.",
  },
  {
    question: "What AI providers are included?",
    answer: "All plans include access to OpenAI GPT-4, Anthropic Claude, and Google Gemini for comprehensive AI visibility analysis.",
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

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <main className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            14-day free trial on all plans
          </div>
          
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-text sm:text-5xl">
            Pricing built for agencies
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-2">
            Become the go-to expert for AI visibility. Track, report, and improve how your clients show up in ChatGPT, Claude, and Gemini.
          </p>

          {/* Billing toggle */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="relative inline-flex items-center rounded-full bg-surface-2 p-1">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
                  !isAnnual ? "bg-white text-text shadow-sm" : "text-text-2 hover:text-text"
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={cn(
                  "relative rounded-full px-5 py-2 text-sm font-medium transition-all",
                  isAnnual ? "bg-white text-text shadow-sm" : "text-text-2 hover:text-text"
                )}
              >
                Annual
              </button>
            </div>
            {isAnnual && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
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

              return (
                <div
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col rounded-3xl border bg-surface p-8 transition-all",
                    plan.popular
                      ? "border-accent ring-2 ring-accent/20 shadow-xl scale-[1.02]"
                      : "border-border hover:border-text/20 hover:shadow-lg"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-text">{plan.name}</h3>
                    <p className="mt-2 text-sm text-text-2">{plan.description}</p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-text">
                        ${monthlyEquivalent}
                      </span>
                      <span className="text-text-3">/month</span>
                    </div>
                    {isAnnual && (
                      <p className="mt-2 text-sm text-text-3">
                        ${price.toLocaleString()} billed annually
                      </p>
                    )}
                    {!isAnnual && (
                      <p className="mt-2 text-sm text-emerald-600">
                        Save ${(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString()}/year with annual
                      </p>
                    )}
                  </div>

                  <Link
                    href="/onboarding"
                    className={cn(
                      "flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all",
                      plan.popular
                        ? "bg-accent text-white shadow-lg shadow-accent/25 hover:bg-accent-2 hover:shadow-xl"
                        : "bg-surface-2 text-text hover:bg-border"
                    )}
                  >
                    {plan.cta}
                  </Link>

                  <div className="my-6 h-px bg-border" />

                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-text">
                      Up to {plan.clients === 50 ? "50+" : plan.clients} clients
                    </span>
                  </div>

                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-text-2">
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
          <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white lg:p-12">
            <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
              <div>
                <h3 className="text-2xl font-bold">Need more than 50 clients?</h3>
                <p className="mt-2 text-slate-300">
                  Get custom pricing, dedicated support, and enterprise features tailored to your agency.
                </p>
              </div>
              <a
                href="mailto:hello@vrtlscore.com"
                className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-100"
              >
                Contact sales →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="border-t border-border bg-surface-2/50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-text">Compare plans</h2>
          <p className="mt-2 text-center text-text-2">See what&apos;s included in each plan</p>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface-2">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-accent">Growth</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-text">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonFeatures.map((feature) => (
                    <tr key={feature.name} className="hover:bg-surface-2/50">
                      <td className="px-6 py-4 text-sm text-text-2">{feature.name}</td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.starter === "boolean" ? (
                          feature.starter ? <Check className="mx-auto" /> : <span className="text-text-3">—</span>
                        ) : (
                          <span className="text-sm text-text">{feature.starter}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center bg-accent/5">
                        {typeof feature.growth === "boolean" ? (
                          feature.growth ? <Check className="mx-auto" /> : <span className="text-text-3">—</span>
                        ) : (
                          <span className="text-sm font-medium text-text">{feature.growth}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {typeof feature.pro === "boolean" ? (
                          feature.pro ? <Check className="mx-auto" /> : <span className="text-text-3">—</span>
                        ) : (
                          <span className="text-sm text-text">{feature.pro}</span>
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
      <section className="border-t border-border">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center text-2xl font-bold text-text">Frequently asked questions</h2>
          <p className="mt-2 text-center text-text-2">Everything you need to know about pricing</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="font-semibold text-text">{faq.question}</h3>
                <p className="mt-2 text-sm text-text-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface-2">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-text">Ready to dominate AI search?</h2>
          <p className="mt-2 text-text-2">Start your 14-day free trial. No credit card required.</p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-2 hover:shadow-xl"
            >
              Start free trial
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-text-2 hover:text-text"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
