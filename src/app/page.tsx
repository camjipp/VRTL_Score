import Link from "next/link";

import { ClientChatBubbles } from "@/components/ClientChatBubbles";
import { CompetitorBenchmark } from "@/components/CompetitorBenchmark";
import { DomainSearchBar } from "@/components/DomainSearchBar";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Footer } from "@/components/Footer";
import { IndustryMarquee } from "@/components/IndustryMarquee";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-text/5 blur-3xl" />
        </div>

        <div className="container-xl relative py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Copy */}
            <div>
              <div className="flex items-end gap-0">
                <div className="h-[90px] w-[200px] overflow-hidden -mr-3 md:h-[118px] md:w-[260px] md:-mr-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="VRTL"
                    className="h-full w-full scale-[1.6] object-cover object-left"
                    src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                  />
                </div>
                <div className="text-[68px] font-semibold leading-[0.9] tracking-tight text-text md:text-[88px]">
                  Score
                </div>
              </div>

              <p className="mt-6 text-xl text-text-2 md:text-2xl">
                Know exactly how AI recommends your clients.
              </p>

              <div className="mt-8 max-w-md">
                <DomainSearchBar />
              </div>

              <div className="mt-6 flex items-center gap-4">
                <div className="inline-flex items-center -space-x-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="ChatGPT" className="h-4 w-4" src="/ai/icons8-chatgpt.svg" />
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="Claude" className="h-4 w-4" src="/ai/icons8-claude.svg" />
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="Gemini" className="h-4 w-4" src="/ai/gemini.png" />
                  </span>
                </div>
                <span className="text-sm text-text-3">ChatGPT, Claude, Gemini & more</span>
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10 blur-2xl" />
              
              <div className="relative rounded-2xl border border-border bg-surface p-5 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text">acme-dental.com</div>
                      <div className="text-xs text-text-3">Latest snapshot</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                    Live
                  </span>
                </div>

                {/* Score */}
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10">
                    <span className="text-3xl font-bold text-text">82</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-text-3">AI Visibility Score</div>
                    <div className="mt-1 text-sm text-emerald-600">+12 from last month</div>
                  </div>
                </div>

                {/* Mini benchmark */}
                <div className="mt-4 space-y-2">
                  {[
                    { name: "Your client", score: 82, color: "bg-emerald-500" },
                    { name: "Competitor", score: 54, color: "bg-text/20" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className="w-20 text-xs text-text-3">{item.name}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-medium text-text-2">{item.score}</span>
                    </div>
                  ))}
                </div>

                {/* Action */}
                <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-bg p-3">
                  <span className="text-xs text-text-3">Report ready</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-text">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INDUSTRY MARQUEE */}
      <section className="border-b border-border bg-bg py-6">
        <div className="mb-3 text-center">
          <span className="text-xs font-medium uppercase tracking-widest text-text-3">
            Trusted across industries
          </span>
        </div>
        <IndustryMarquee />
      </section>

      {/* THE PROBLEM: Client Messages */}
      <section className="py-20 md:py-28">
        <div className="container-xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Copy */}
            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-red-500">
                The problem
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text md:text-4xl">
                Your clients are asking questions you can&apos;t answer yet
              </h2>
              <p className="mt-4 text-lg text-text-2">
                AI search is changing how customers find businesses. Your clients want to know where they stand. Do you have the data?
              </p>
              
              <div className="mt-8">
                <ButtonLink
                  className="rounded-xl bg-text px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-text/90"
                  href="/onboarding"
                  variant="primary"
                >
                  Run a free audit
                </ButtonLink>
              </div>
            </div>

            {/* Right: Chat bubbles */}
            <div>
              <ClientChatBubbles />
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION: 3-Step Process */}
      <section className="bg-bg-2 py-20 md:py-28">
        <div className="container-xl">
          <div className="mb-16 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-600">
              How it works
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text md:text-4xl">
              From question to proof in three steps
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add your client",
                description: "Enter their website and competitors. Takes 30 seconds.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Run the snapshot",
                description: "We query ChatGPT, Claude, and Gemini with real prompts.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Share the report",
                description: "Download a branded PDF with scores, evidence, and next steps.",
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="rounded-2xl border border-border bg-surface p-8">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                      {item.icon}
                    </div>
                    <span className="text-4xl font-bold text-text/10">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-text">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-2">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPETITOR BENCHMARK */}
      <section className="py-20 md:py-28">
        <div className="container-xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Benchmark visualization */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border border-border bg-surface p-8">
                <div className="mb-6">
                  <div className="text-xs font-medium uppercase tracking-wide text-text-3">AI Visibility Ranking</div>
                  <div className="mt-1 text-sm text-text-2">How your client compares</div>
                </div>
                <CompetitorBenchmark />
              </div>
            </div>

            {/* Right: Copy */}
            <div className="order-1 lg:order-2">
              <span className="text-xs font-medium uppercase tracking-widest text-violet-600">
                Competitive analysis
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text md:text-4xl">
                Show clients exactly where they rank
              </h2>
              <p className="mt-4 text-lg text-text-2">
                No more guesswork. See how your client stacks up against competitors in AI search results, with real data from real queries.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Side-by-side competitor comparison",
                  "Track ranking changes over time",
                  "Evidence from actual AI responses",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-text-2">
                    <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-bg-2 py-20 md:py-28" id="features">
        <div className="container-xl">
          <div className="mb-16">
            <span className="text-xs font-medium uppercase tracking-widest text-violet-600">
              Features
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text md:text-4xl">
              Everything you need to prove AI visibility
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-text-2">
              From snapshot scoring to PDF reports. Built for agencies who need to show results.
            </p>
          </div>
          <FeatureShowcase />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container-xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
              Ready to answer your clients?
            </h2>
            <p className="mt-4 text-lg text-text-2">
              Get your first AI visibility report in under 5 minutes. No credit card required to start.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink
                className="rounded-xl bg-text px-8 py-4 text-base font-semibold text-white shadow-xl shadow-text/20 transition-all hover:bg-text/90"
                href="/onboarding"
                variant="primary"
              >
                Run a free audit
              </ButtonLink>
              <ButtonLink
                className="rounded-xl border border-border bg-surface px-8 py-4 text-base font-semibold text-text transition-all hover:bg-surface-2"
                href="/pricing"
                variant="secondary"
              >
                See pricing
              </ButtonLink>
            </div>

            <p className="mt-6 text-sm text-text-3">
              7-day free trial · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
