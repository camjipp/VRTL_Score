import Link from "next/link";

import { BigStats } from "@/components/BigStats";
import { DomainSearchBar } from "@/components/DomainSearchBar";
import { FeatureShowcase } from "@/components/FeatureShowcase";
import { RotatingQuestions } from "@/components/RotatingQuestions";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function HomePage() {
  return (
    <main>
      {/* ═══════════════════════════════════════════════════════════════════
          HERO — Keep this section as-is (user loves it)
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
            <div className="mt-5 flex items-center justify-center gap-3 text-sm">
              <Link className="text-text-2 hover:text-text" href="/pricing">
                See plans & pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CLIENT QUESTIONS — What clients are asking (social proof)
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-bg py-12 md:py-16">
        <div className="container-xl">
          <div className="mb-8 text-center">
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
              The scale to power your agency
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
          HOW IT WORKS — Clean 3-step process
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-20">
        <div className="container-xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
              Three steps to proof
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-text-2">
              Create a client, run a snapshot, send the report. That simple.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-16 hidden h-0.5 bg-gradient-to-r from-transparent via-border to-transparent md:block" />

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  title: "Add your client",
                  description: "Enter the website URL and define competitors. Takes 30 seconds.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                },
                {
                  step: "02",
                  title: "Run the snapshot",
                  description: "We query ChatGPT, Gemini, and Claude with standardized prompts.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  step: "03",
                  title: "Download the PDF",
                  description: "Scores, evidence, recommendations—ready for client delivery.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div key={item.step} className="relative text-center">
                  {/* Step number with icon */}
                  <div className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-text/5 to-text/10" />
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-surface shadow-xl">
                      <div className="text-text">{item.icon}</div>
                    </div>
                    <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-text text-xs font-bold text-white">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-text">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-2">{item.description}</p>
                </div>
              ))}
            </div>
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
          CTA — Bold gradient section
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24">
        {/* Gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#080808] via-[#0f0f0f] to-[#1a1a1a]" />
        
        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="container-xl relative">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              Start measuring
              <br />
              <span className="text-gradient">AI visibility</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/70">
              Create your first client, run a snapshot, and ship a report—all in under 5 minutes.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink
                className="rounded-full bg-white px-8 py-4 text-base font-semibold text-[#080808] shadow-2xl transition-all hover:bg-white/90 hover:scale-105"
                href="/login"
                variant="primary"
              >
                Get started free
              </ButtonLink>
              <ButtonLink
                className="rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                href="/pricing"
                variant="secondary"
              >
                View pricing
              </ButtonLink>
            </div>
            <p className="mt-6 text-sm text-white/50">
              No credit card required · 14-day free trial
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
