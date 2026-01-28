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
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-text md:text-3xl">
                How it works
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { step: "1", title: "Add your client", desc: "Enter their website and competitors. Takes 30 seconds." },
                { step: "2", title: "Run the snapshot", desc: "We query ChatGPT, Claude, and Gemini with real prompts." },
                { step: "3", title: "Share the report", desc: "Download a branded PDF with scores and evidence." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-lg font-bold text-emerald-600">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{item.title}</h3>
                    <p className="mt-1 text-sm text-text-2">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why VRTL */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🎯", title: "Repeatable measurement", desc: "Run the same prompts every time. Compare month over month." },
              { icon: "📋", title: "Evidence-backed", desc: "Every score comes with actual AI responses. No black boxes." },
              { icon: "⚡", title: "Client-ready fast", desc: "One-click PDF export with your branding." },
              { icon: "📈", title: "Track progress", desc: "Compare snapshots to show improvement over time." },
            ].map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-surface p-5">
                <span className="text-2xl">{b.icon}</span>
                <h3 className="mt-3 font-semibold text-text">{b.title}</h3>
                <p className="mt-1 text-sm text-text-2">{b.desc}</p>
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
