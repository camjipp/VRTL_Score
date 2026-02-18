"use client";

import Link from "next/link";
import { useState } from "react";

import { Footer } from "@/components/Footer";

/* ─────────────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────────────────*/
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-semibold text-text">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-text-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-text-2 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   AI MODEL ICONS (hero credibility strip)
───────────────────────────────────────────────────────────────*/
const AI_PROVIDERS = [
  { name: "OpenAI", icon: "/ai/icons8-chatgpt.svg" },
  { name: "Anthropic", icon: "/ai/icons8-claude.svg" },
  { name: "Google", icon: "/ai/gemini.png" },
  { name: "Perplexity", icon: "/ai/perplexity.png" },
];

/* ─────────────────────────────────────────────────────────────
   HOMEPAGE
───────────────────────────────────────────────────────────────*/
export default function HomePage() {
  return (
    <main className="bg-bg">
      {/* ═══════════════════════════════════════════════════════
          HERO — Linear-style dark + bottom fade
      ═══════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[70vh] flex-col overflow-visible bg-black sm:min-h-[90vh]">
        {/* Room depth layers — pointer-events-none, behind content */}
        <div className="pointer-events-none absolute inset-0">
          {/* Vignette — darken edges, defines the "room" boundary */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_45%,rgba(0,0,0,0.55)_100%)]" aria-hidden />
          {/* Floor plane — large blurred gradient, not a band */}
          <div className="absolute inset-x-0 bottom-0 h-[70vh] bg-gradient-to-t from-white/[0.10] via-white/[0.05] to-transparent blur-3xl" aria-hidden />
        </div>

        <div className="container-xl relative z-10 flex flex-1 flex-col justify-center pb-14 pt-16 sm:pb-20 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:mr-auto lg:text-left">
            {/* Headline — largest text, first thing eye hits */}
            <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:mx-0">
              Your clients are already being ranked by AI.
            </h1>

            {/* Subheadline — 2 lines, clean spacing */}
            <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl lg:mx-0">
              Answer engines are shaping brand perception in real time.
              <br />
              VRTL Score measures where your clients appear — and where they&apos;re invisible.
            </p>

            {/* Supporting line — shorter, stronger */}
            <p className="mt-5 text-sm text-white/50">Measured across the AI ecosystem.</p>

            {/* AI logos — grayscale, structural proof */}
            <div className="mx-auto mt-10 flex items-center justify-center gap-3 sm:gap-4 lg:mx-0 lg:justify-start">
              {AI_PROVIDERS.map((p) => (
                <span
                  key={p.name}
                  className="flex h-12 w-12 shrink-0 items-center justify-center opacity-75 grayscale invert sm:h-14 sm:w-14"
                  title={p.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" className="h-full w-full object-contain" src={p.icon} />
                </span>
              ))}
            </div>

            {/* CTAs — primary dominates */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5 lg:justify-start">
              <Link
                href="/signup"
                className="w-full rounded-2xl bg-accent px-10 py-4 text-center text-base font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-accent-2 sm:w-auto"
              >
                Start Free Trial
              </Link>
              <Link
                href="#platform"
                className="w-full rounded-2xl border border-white/20 bg-transparent px-10 py-4 text-center text-base font-medium text-white/90 transition hover:bg-white/10 sm:w-auto"
              >
                See Platform
              </Link>
            </div>

            {/* Platform preview card — sits on the floor, extends into next section */}
            <div className="relative z-10 mx-auto mt-8 w-full max-w-7xl translate-y-16 sm:translate-y-24">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_140px_rgba(0,0,0,0.65)]">
                {/* Top inner highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-3xl bg-gradient-to-b from-white/[0.12] to-transparent" aria-hidden />
                <div className="relative p-6 md:p-8">
                  {/* Pill label */}
                  <span className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                    Platform preview
                  </span>
                  {/* Dashboard skeleton — readable as UI */}
                  <div className="mt-6 flex flex-col gap-6 md:flex-row">
                    {/* Left: score ring */}
                    <div className="flex shrink-0 flex-col items-center md:w-48">
                      <div className="h-24 w-24 animate-pulse rounded-full border-4 border-white/15 bg-white/10" />
                      <div className="mt-3 text-xs font-medium text-white/60">AI Visibility Score</div>
                      <div className="mt-1 h-3 w-20 animate-pulse rounded bg-white/15" />
                    </div>
                    {/* Right: 3 metric tiles */}
                    <div className="flex flex-1 flex-wrap gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 min-w-[120px] rounded-xl border border-white/15 bg-white/10 p-4">
                          <div className="h-3 w-20 animate-pulse rounded bg-white/20" />
                          <div className="mt-3 h-8 w-14 animate-pulse rounded bg-white/25" />
                          <div className="mt-2 h-3 w-12 animate-pulse rounded bg-white/15" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Bottom: chart + competitor list */}
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                      <div className="h-3 w-24 animate-pulse rounded bg-white/20" />
                      <div className="mt-4 flex h-24 items-end gap-2">
                        {[40, 65, 45, 80, 55, 70].map((h, i) => (
                          <div key={i} className="flex-1 animate-pulse rounded-t bg-white/20" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                      <div className="h-3 w-28 animate-pulse rounded bg-white/20" />
                      <div className="mt-4 space-y-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-2 w-2 animate-pulse rounded-full bg-white/20" />
                            <div className="h-3 flex-1 animate-pulse rounded bg-white/20" />
                            <div className="h-3 w-8 animate-pulse rounded bg-white/15" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE SHIFT — narrative arc (Shift → Problem → Solution)
          Negative margin overlaps platform preview card
      ═══════════════════════════════════════════════════════ */}
      <section className="-mt-20 border-t border-white/5 bg-[#0A0A0A] py-20 md:-mt-40 md:py-28">
        <div className="container-xl">
          {/* Part 1: The Shift */}
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/50">The shift</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl">
              Search is becoming AI.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              Google, ChatGPT, Perplexity, and Claude are answering search queries directly—with recommendations, not blue links. SEO is no longer enough.
            </p>
          </div>

          {/* Part 2: AEO & GEO — education */}
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
              <h3 className="text-xl font-bold text-white">AEO — Answer Engine Optimization</h3>
              <p className="mt-4 leading-relaxed text-white/70">
                Optimizing for AI assistants (ChatGPT, Claude, Perplexity) that answer questions directly. If your client isn’t in those answers, they’re invisible to a growing share of discovery.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
              <h3 className="text-xl font-bold text-white">GEO — Generative Engine Optimization</h3>
              <p className="mt-4 leading-relaxed text-white/70">
                Optimizing for AI-generated search results. Google’s SGE, Perplexity’s search, and AI-powered product recommendations are where rankings happen now—and traditional tools can’t measure them.
              </p>
            </div>
          </div>

          {/* Part 3: The Problem */}
          <div className="mx-auto mt-16 max-w-3xl text-center">
            <h3 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Most agencies have no idea how their clients show up in AI.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/70">
              When a prospect asks ChatGPT for a recommendation, does your client appear? In what position? With what context? Today, most agencies are guessing—and losing clients to competitors who show up first.
            </p>
          </div>

          {/* Part 4: The Solution */}
          <div className="mx-auto mt-16 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">The solution</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              VRTL Score isn’t a gimmick—it’s the infrastructure agencies need to own AEO & GEO. Measure AI visibility across every major model, prove ROI, and defend your clients before it’s too late.
            </h3>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — what it actually does
      ═══════════════════════════════════════════════════════ */}
      <section id="features" className="border-t border-border bg-white py-20 md:py-28">
        <div className="container-xl">
          <div className="mb-14 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-3">The platform</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-text md:text-4xl">
              Everything agencies need to own the AI channel.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Competitive Benchmarking */}
            <div className="group rounded-3xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              <div className="mb-6 min-h-[200px] rounded-2xl bg-surface-2 p-6 ring-1 ring-border/60">
                <div className="space-y-3">
                  {[
                    { name: "Your Client", score: 85, rank: 1 },
                    { name: "Competitor A", score: 72, rank: 2 },
                    { name: "Competitor B", score: 68, rank: 3 },
                    { name: "Competitor C", score: 54, rank: 4 },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                          item.rank === 1 ? "bg-emerald-500" : "bg-text-3"
                        }`}
                      >
                        {item.rank}
                      </span>
                      <span className="w-24 truncate text-sm font-medium text-text">{item.name}</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-white shadow-inner ring-1 ring-border/50">
                        <div
                          className={`h-full rounded-full transition-all ${item.rank === 1 ? "bg-emerald-500" : "bg-text"}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm font-bold text-text">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">Competitive Benchmarking</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Your clients are being compared in AI responses right now. See exactly where they rank vs. competitors across ChatGPT, Claude, Gemini & Perplexity—with month-over-month proof you can show stakeholders.
              </p>
            </div>

            {/* Performance Dashboard */}
            <div className="group rounded-3xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              <div className="mb-6 min-h-[200px] rounded-2xl bg-surface-2 p-6 ring-1 ring-border/60">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-text-3">AI Visibility Score</div>
                    <div className="text-4xl font-bold text-text">78</div>
                  </div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-500 bg-white">
                    <span className="text-lg font-bold text-emerald-600">B+</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { model: "ChatGPT", score: 85, icon: "/ai/icons8-chatgpt.svg" },
                    { model: "Claude", score: 72, icon: "/ai/icons8-claude.svg" },
                    { model: "Gemini", score: 68, icon: "/ai/gemini.png" },
                  ].map((m) => (
                    <div key={m.model} className="rounded-xl bg-white p-3 text-center shadow-sm ring-1 ring-border/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.icon} alt={m.model} className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-lg font-bold text-text">{m.score}</div>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">AI Visibility Score</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                One score that captures mention rate, positioning, and citation quality across every AI model. Track trends and prove progress month over month.
              </p>
            </div>

            {/* Visibility Analysis */}
            <div className="group rounded-3xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              <div className="mb-6 min-h-[200px] rounded-2xl bg-surface-2 p-6 ring-1 ring-border/60">
                <div className="mb-3 text-xs uppercase tracking-wide text-text-3">AI Response Analysis</div>
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-border/40">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ai/icons8-chatgpt.svg" alt="ChatGPT" className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-text-2">
                        &quot;For digital marketing agencies, I&apos;d recommend{" "}
                        <span className="rounded bg-emerald-100 px-1 font-medium text-emerald-700">Your Client</span> as
                        they specialize in AI-driven strategies and have shown excellent results...&quot;
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Mentioned
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                    Top position
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                    Cited
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">Evidence Capture</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Every mention preserved with full context—position, citation, competitors named, and the actual AI response. Proof your clients can see and trust.
              </p>
            </div>

            {/* Actionable Recommendations */}
            <div className="group rounded-3xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              <div className="mb-6 min-h-[200px] rounded-2xl bg-surface-2 p-6 ring-1 ring-border/60">
                <div className="mb-3 text-xs uppercase tracking-wide text-text-3">Recommendations</div>
                <div className="space-y-2">
                  {[
                    { priority: "High", text: "Add structured data markup to service pages", impact: "+12 pts" },
                    { priority: "Med", text: "Improve expertise signals in About section", impact: "+8 pts" },
                    { priority: "Med", text: "Create FAQ content for common queries", impact: "+6 pts" },
                  ].map((rec, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-border/40">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {rec.priority}
                      </span>
                      <span className="flex-1 truncate text-sm text-text">{rec.text}</span>
                      <span className="shrink-0 text-sm font-bold text-emerald-600">{rec.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">Actionable Recommendations</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Prioritized actions with expected point impact. Know exactly what to fix, why it matters, and what happens if you don&apos;t.
              </p>
            </div>

            {/* Branded PDF Reports — full width */}
            <div className="group rounded-3xl border border-border bg-white p-8 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-xl md:col-span-2">
              <div className="flex flex-col items-center gap-8 md:flex-row">
                <div className="flex min-h-[200px] items-center justify-center rounded-2xl bg-surface-2 p-8 ring-1 ring-border/60 md:w-1/2">
                  <div className="relative">
                    <div className="w-36 bg-white rounded-lg shadow-xl p-4 transform -rotate-3">
                      <div className="h-3 w-16 bg-[#0A0A0A] rounded mb-3" />
                      <div className="h-2 w-full bg-[#E5E5E5] rounded mb-2" />
                      <div className="h-2 w-3/4 bg-[#E5E5E5] rounded mb-4" />
                      <div className="h-12 w-full bg-emerald-100 rounded mb-3" />
                      <div className="h-2 w-full bg-[#E5E5E5] rounded mb-2" />
                      <div className="h-2 w-2/3 bg-[#E5E5E5] rounded" />
                    </div>
                    <div className="absolute -right-4 -bottom-2 w-32 bg-white rounded-lg shadow-xl p-4 transform rotate-6">
                      <div className="h-3 w-12 bg-emerald-500 rounded mb-3" />
                      <div className="h-2 w-full bg-[#E5E5E5] rounded mb-2" />
                      <div className="h-8 w-full bg-[#F5F5F5] rounded mb-3" />
                      <div className="h-2 w-full bg-[#E5E5E5] rounded mb-2" />
                      <div className="h-2 w-1/2 bg-[#E5E5E5] rounded" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                      <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-2xl font-semibold text-text">Client-Ready PDF Reports</h3>
                  <p className="mt-3 leading-relaxed text-text-2">
                    Executive-grade AI visibility reports with your agency branding. Score context, strategic recommendations, competitive landscape, and preserved evidence—designed to support client renewals and upsells.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-text-2">
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      White-label with your logo
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Generated in under 5 minutes
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      Evidence-backed, not vibes
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          DASHBOARD PROOF — full-width, dark, dramatic
      ═══════════════════════════════════════════════════════ */}
      <section id="platform" className="bg-[#0A0A0A] py-20 md:py-28">
        <div className="container-xl">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/40">Inside the platform</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              This is serious software.
            </h2>
          </div>

          {/* Mock dashboard */}
          <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-[#111] p-6 shadow-2xl md:p-8">
            {/* Top bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-white/40">Client Overview</div>
                <div className="mt-1 text-xl font-bold text-white">Acme Digital Agency</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5">
                  <span className="text-xs font-medium text-emerald-400">Score trending up</span>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-1.5">
                  <span className="text-xs font-medium text-white/60">Last snapshot: 2 days ago</span>
                </div>
              </div>
            </div>

            {/* Score + metrics row */}
            <div className="mt-6 grid gap-6 md:grid-cols-4">
              {/* Big score */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-5xl font-bold text-white">78</div>
                <div className="mt-1 text-sm text-white/40">AI Visibility Score</div>
                <div className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-400">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  +6 vs last month
                </div>
              </div>

              {/* Mini metrics */}
              {[
                { label: "Mention Rate", value: "72%", delta: "+8%" },
                { label: "Top Position Rate", value: "45%", delta: "+12%" },
                { label: "Citation Rate", value: "38%", delta: "+5%" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="text-xs text-white/40">{m.label}</div>
                  <div className="mt-2 text-2xl font-bold text-white">{m.value}</div>
                  <div className="mt-1 text-xs font-medium text-emerald-400">{m.delta}</div>
                </div>
              ))}
            </div>

            {/* Model breakdown row */}
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {[
                { model: "ChatGPT", score: 85, icon: "/ai/icons8-chatgpt.svg" },
                { model: "Claude", score: 72, icon: "/ai/icons8-claude.svg" },
                { model: "Gemini", score: 68, icon: "/ai/gemini.png" },
              ].map((p) => (
                <div key={p.model} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.icon} alt={p.model} className="h-5 w-5" />
                    <span className="text-sm font-medium text-white">{p.model}</span>
                    <span className="ml-auto text-lg font-bold text-white">{p.score}</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Trend chart mock */}
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs uppercase tracking-wide text-white/40">Score Trend</div>
                <div className="text-xs text-white/30">Last 6 months</div>
              </div>
              <div className="flex items-end gap-2 h-24">
                {[45, 52, 58, 62, 72, 78].map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-emerald-500/80 transition-all"
                      style={{ height: `${(v / 100) * 96}px` }}
                    />
                    <span className="text-[10px] text-white/30">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST STRIP — defensible by design
      ═══════════════════════════════════════════════════════ */}
      <section id="methodology" className="border-t border-border bg-bg py-14">
        <div className="container-xl">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 rounded-3xl border border-border bg-surface p-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <p className="text-sm font-semibold uppercase tracking-widest text-text-3">Defensible by design</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text md:text-3xl">
                  Built to be client-proof.
                </h2>
                <p className="mt-3 text-base leading-relaxed text-text-2">
                  Standardized discovery scenarios, consistent scoring, and preserved evidence—so agencies can explain
                  the &quot;why&quot; behind every recommendation.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:col-span-7">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-border/50">
                  <div className="text-sm font-semibold text-text">Standardized snapshots</div>
                  <div className="mt-1 text-sm text-text-2">The same scenarios run each time to measure change—not vibes.</div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-border/50">
                  <div className="text-sm font-semibold text-text">Evidence preserved</div>
                  <div className="mt-1 text-sm text-text-2">Quotes, sources, and context saved for executive-ready proof.</div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-border/50">
                  <div className="text-sm font-semibold text-text">Actionable output</div>
                  <div className="mt-1 text-sm text-text-2">Recommendations prioritized with expected impact and consequences.</div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-border/50">
                  <div className="text-sm font-semibold text-text">Agency-ready reporting</div>
                  <div className="mt-1 text-sm text-text-2">Shareable, branded PDFs designed to support renewal conversations.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-border bg-bg">
        {/* Questions Marquee */}
        <div className="overflow-hidden py-6 md:py-10">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="mx-10 text-6xl font-black text-text md:text-7xl lg:text-8xl xl:text-9xl">
                Questions?
              </span>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="px-6 pb-20 pt-8 md:pb-28 md:pt-12">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
                We have the answers.
              </h2>
            </div>

            <div>
              <FAQItem
                question="What is AI visibility?"
                answer="AI visibility is how often—and how prominently—a brand appears when someone asks ChatGPT, Claude, Gemini, or other AI answer engines for a recommendation. It's the new version of 'do we rank on page one?'"
              />
              <FAQItem
                question="How does VRTL Score measure it?"
                answer="We run standardized discovery scenarios across multiple AI models, analyze where and how your client is mentioned, then produce a composite visibility score based on mention rate, positioning, and citation quality. Every data point is preserved as evidence."
              />
              <FAQItem
                question="What AI models do you track?"
                answer="Currently ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google)—with Perplexity and others being added. We expand coverage as new AI answer engines gain user share."
              />
              <FAQItem
                question="How is the score calculated?"
                answer="The score combines three dimensions: how often your client is mentioned (mention rate), where they appear in the response (top, middle, or bottom), and whether they're cited with sources. Results are normalized across models into a single executive-ready number."
              />
              <FAQItem
                question="Can I white-label the reports?"
                answer="Yes. PDF reports include your agency logo and branding. They're designed to be handed directly to clients as a professional deliverable—supporting renewals, upsells, and new business pitches."
              />
              <FAQItem
                question="Is there a free trial?"
                answer="Yes. Start with a 7-day free trial—run snapshots on real clients and see the platform in action before committing."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 md:py-24">
        <div className="container-xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
              Your clients are already being ranked.
              <br />
              <span className="text-emerald-600">Find out where they stand.</span>
            </h2>
            <div className="mt-8">
              <Link
                href="/onboarding"
                className="inline-flex h-12 items-center justify-center rounded-full bg-text px-10 text-base font-semibold text-white shadow-lg shadow-text/10 transition-all hover:bg-text/90 hover:scale-[1.02]"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
