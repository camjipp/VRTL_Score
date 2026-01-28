import Link from "next/link";

import { CompactMetrics } from "@/components/CompactMetrics";
import { DomainSearchBar } from "@/components/DomainSearchBar";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Footer } from "@/components/Footer";
import { MiniChatBubbles } from "@/components/MiniChatBubbles";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function HomePage() {
  return (
    <main>
      {/* HERO (unchanged) */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-text/5 blur-3xl" />
          <div className="absolute bottom-[-240px] right-[-140px] h-[520px] w-[520px] rounded-full bg-text/3 blur-3xl" />
        </div>

        <div className="container-xl relative py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-end justify-center gap-0">
              <div className="h-[118px] w-[260px] overflow-hidden -mr-4 sm:h-[148px] sm:w-[320px] sm:-mr-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="VRTL"
                  className="h-full w-full scale-[1.6] object-cover object-left"
                  src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                />
              </div>
              <div className="text-[88px] font-semibold leading-[0.9] tracking-tight text-text sm:text-[112px]">
                Score
              </div>
            </div>

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              <div className="text-[26px] font-semibold leading-[1.06] tracking-tight text-text sm:text-[31px]">
                AI visibility, measured.
              </div>
              <div className="inline-flex items-center gap-2">
                <div className="inline-flex items-center -space-x-2">
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">ChatGPT</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/icons8-chatgpt.svg" />
                  </span>
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">Google</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/icons8-google-48.svg" />
                  </span>
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">Gemini</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/gemini.png" />
                  </span>
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">Claude</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/icons8-claude.svg" />
                  </span>
                </div>
                <span className="text-sm text-text-3">&amp; more</span>
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-3xl">
              <DomainSearchBar />
            </div>

            <p className="mt-8 text-sm text-text-2">
              Built for agencies who want to lead in AI search.
            </p>

            <div className="mt-5 flex items-center justify-center gap-3 text-sm">
              <Link className="text-text-2 hover:text-text" href="/pricing">
                See plans & pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE (moved up) */}
      <section className="bg-bg-2 py-16 md:py-20" id="features">
        <div className="container-xl">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-violet-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Features
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text md:text-4xl">
              Everything you need to prove AI visibility
            </h2>
            <p className="mt-3 max-w-2xl text-text-2">
              From snapshot scoring to PDF reports. A complete toolkit for measuring and demonstrating progress.
            </p>
          </div>
          <FeatureShowcase />
        </div>
      </section>

      {/* COMPACT METRICS + COMPETITOR BARS */}
      <section className="py-16 md:py-20">
        <div className="container-xl">
          <CompactMetrics />
        </div>
      </section>

      {/* MINI CHAT BUBBLES (subtle pain points) */}
      <section className="border-y border-border bg-bg-2 py-10">
        <div className="container-xl">
          <div className="mb-6 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-text-3">
              Sound familiar?
            </span>
          </div>
          <MiniChatBubbles />
        </div>
      </section>

      {/* HOW IT WORKS + WHY VRTL (combined) */}
      <section className="py-16 md:py-20">
        <div className="container-xl">
          {/* How it works */}
          <div className="mb-16">
            <div className="mb-10 text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Simple process
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-text md:text-3xl">
                How it works
              </h2>
            </div>

            {/* Steps with connecting line */}
            <div className="relative">
              {/* Connecting line (desktop) */}
              <div className="pointer-events-none absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-border to-transparent md:block" />

              <div className="grid gap-8 md:grid-cols-3 md:gap-6">
                {[
                  { 
                    step: "1", 
                    title: "Add your client", 
                    desc: "Enter their website and competitors. Takes 30 seconds.",
                    icon: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    ),
                  },
                  { 
                    step: "2", 
                    title: "Run the snapshot", 
                    desc: "We query ChatGPT, Claude, and Gemini with industry-specific prompts.",
                    icon: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    ),
                  },
                  { 
                    step: "3", 
                    title: "Share the report", 
                    desc: "Download a branded PDF with scores, evidence, and next steps.",
                    icon: (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                ].map((item, i) => (
                  <div key={item.step} className="relative text-center">
                    {/* Step circle */}
                    <div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
                      {/* Outer ring */}
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-500/30" />
                      {/* Inner circle */}
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
                        {item.icon}
                      </div>
                      {/* Step number badge */}
                      <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-text text-xs font-bold text-white">
                        {item.step}
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-text">{item.title}</h3>
                    <p className="mx-auto mt-2 max-w-[240px] text-sm text-text-2">{item.desc}</p>

                    {/* Arrow (mobile) */}
                    {i < 2 && (
                      <div className="my-4 flex justify-center md:hidden">
                        <svg className="h-6 w-6 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why VRTL - Enhanced cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                ),
                title: "Repeatable", 
                desc: "Run the same prompts every time. Compare month over month.",
                color: "emerald",
              },
              { 
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: "Evidence-backed", 
                desc: "Every score comes with actual AI responses. No black boxes.",
                color: "violet",
              },
              { 
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                title: "Client-ready fast", 
                desc: "One-click PDF export with your branding.",
                color: "amber",
              },
              { 
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ),
                title: "Track progress", 
                desc: "Compare snapshots to show improvement over time.",
                color: "cyan",
              },
            ].map((b) => (
              <div 
                key={b.title} 
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all hover:shadow-lg"
              >
                {/* Gradient glow on hover */}
                <div className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${
                  b.color === "emerald" ? "bg-gradient-to-br from-emerald-500/5 to-transparent" :
                  b.color === "violet" ? "bg-gradient-to-br from-violet-500/5 to-transparent" :
                  b.color === "amber" ? "bg-gradient-to-br from-amber-500/5 to-transparent" :
                  "bg-gradient-to-br from-cyan-500/5 to-transparent"
                }`} />

                <div className={`relative mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  b.color === "emerald" ? "bg-emerald-500/10 text-emerald-600" :
                  b.color === "violet" ? "bg-violet-500/10 text-violet-600" :
                  b.color === "amber" ? "bg-amber-500/10 text-amber-600" :
                  "bg-cyan-500/10 text-cyan-600"
                }`}>
                  {b.icon}
                </div>
                <h3 className="relative font-semibold text-text">{b.title}</h3>
                <p className="relative mt-1 text-sm text-text-2">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-bg py-16 md:py-24">
        <div className="container-xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Copy and CTA */}
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
                Your first report in
                <span className="block text-gradient">under 5 minutes</span>
              </h2>
              
              <p className="mt-4 text-lg text-text-2">
                Add a client, run the snapshot, download the PDF. No complexity, just proof.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <ButtonLink
                  className="rounded-xl bg-text px-8 py-4 text-base font-semibold text-white shadow-xl shadow-text/20 transition-all hover:bg-text/90"
                  href="/onboarding"
                  variant="primary"
                >
                  See your score
                </ButtonLink>
                <ButtonLink
                  className="rounded-xl border border-border bg-surface px-8 py-4 text-base font-semibold text-text transition-all hover:bg-surface-2"
                  href="/pricing"
                  variant="secondary"
                >
                  View pricing
                </ButtonLink>
              </div>

              <p className="mt-4 text-sm text-text-3">
                7-day free trial · Cancel anytime
              </p>
            </div>

            {/* Right: Preview card */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-violet-500/10 to-cyan-500/10 blur-2xl" />
              
              <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white">
                      A
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-text">acme-agency.com</div>
                      <div className="text-xs text-text-3">Snapshot · Just now</div>
                    </div>
                  </div>
                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Complete
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-text-3">Overall Score</div>
                    <div className="mt-1 text-4xl font-bold text-text">82</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-3">Confidence</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600">High</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { name: "ChatGPT", score: 84 },
                    { name: "Gemini", score: 79 },
                    { name: "Claude", score: 83 },
                  ].map((p) => (
                    <div key={p.name} className="rounded-lg bg-surface-2 p-3 text-center">
                      <div className="text-xs text-text-3">{p.name}</div>
                      <div className="mt-1 text-lg font-semibold text-text">{p.score}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-bg p-3">
                  <span className="text-xs text-text-3">Ready for export</span>
                  <button className="flex items-center gap-2 rounded-lg bg-text px-3 py-1.5 text-xs font-medium text-white">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="absolute -left-4 top-8 rounded-xl border border-border bg-surface px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <span className="text-xs font-medium text-text">7/10 prompts mentioned</span>
                </div>
              </div>
              <div className="absolute -right-4 bottom-16 rounded-xl border border-border bg-surface px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <span className="text-xs font-medium text-text">+12 vs last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
