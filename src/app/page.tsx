import Link from "next/link";

import { BigStats } from "@/components/BigStats";
import { DomainSearchBar } from "@/components/DomainSearchBar";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { Footer } from "@/components/Footer";
import { RotatingQuestions } from "@/components/RotatingQuestions";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function HomePage() {
  return (
    <main>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — VRTL Score + Search bar
      ═══════════════════════════════════════════════════════════════════ */}
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

            {/* Social proof */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["S", "M", "J", "A"].map((letter, i) => (
                    <div
                      key={letter}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-bg bg-gradient-to-br from-violet-500 to-emerald-500 text-xs font-bold text-white"
                      style={{ zIndex: 4 - i }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-text-2">
                  <span className="font-semibold text-text">200+</span> agencies measuring AI visibility
                </span>
              </div>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="flex items-center gap-2 text-sm text-text-2">
                <svg className="h-4 w-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span><span className="font-semibold text-text">5,000+</span> reports generated</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-3 text-sm">
              <Link className="text-text-2 hover:text-text" href="/pricing">
                See plans & pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          BIG STATS — Impressive numbers with color and animation
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20">
        {/* Gradient mesh background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        <div className="container-xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
              Proof at scale
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-text-2">
              Real-time AI visibility measurement across the models that matter.
            </p>
          </div>
          <BigStats />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURE SHOWCASE — Interactive tabs with colorful panels
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-bg-2 py-20" id="features">
        <div className="container-xl">
          <div className="mb-12">
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
              From snapshot scoring to PDF reports—a complete toolkit for measuring and demonstrating progress.
            </p>
          </div>
          <FeatureShowcase />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CLIENT QUESTIONS — What clients are asking (pain points)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-bg py-16 md:py-20">
        <div className="container-xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-medium uppercase tracking-widest text-text-3">
              Sound familiar?
            </span>
          </div>
          <div className="mx-auto max-w-4xl">
            <RotatingQuestions />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TESTIMONIALS — Dynamic carousel with dark theme
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20" id="testimonials">
        <div className="container-xl">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Testimonials
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text md:text-4xl">
              Trusted by agency teams
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-text-2">
              Hear from teams using VRTL Score to measure and prove AI visibility.
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA — Split layout with preview
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-bg py-20 md:py-28">
        <div className="container-xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Copy and CTA */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Get started
              </div>
              
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-text md:text-5xl">
                Your first report in
                <span className="block text-gradient">under 5 minutes</span>
              </h2>
              
              <p className="mt-6 text-lg text-text-2">
                Add a client, run the snapshot, download the PDF. No setup complexity—just proof.
              </p>

              {/* Quick benefits */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: "⚡", text: "30-second client setup" },
                  { icon: "🤖", text: "3 LLM providers queried" },
                  { icon: "📊", text: "Instant scoring & evidence" },
                  { icon: "📄", text: "One-click PDF export" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-lg">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-text">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <ButtonLink
                  className="rounded-xl bg-text px-8 py-4 text-base font-semibold text-white shadow-xl shadow-text/20 transition-all hover:bg-text/90 hover:shadow-2xl hover:shadow-text/30"
                  href="/onboarding"
                  variant="primary"
                >
                  Start free trial
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

            {/* Right: Visual preview */}
            <div className="relative">
              {/* Decorative background */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-violet-500/10 to-cyan-500/10 blur-2xl" />
              
              {/* Preview card */}
              <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-2xl">
                {/* Header */}
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

                {/* Score display */}
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

                {/* Provider breakdown */}
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

                {/* Action bar */}
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

              {/* Floating badges */}
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

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <Footer />
    </main>
  );
}
