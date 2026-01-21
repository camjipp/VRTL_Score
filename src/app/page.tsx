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

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <Footer />
    </main>
  );
}
