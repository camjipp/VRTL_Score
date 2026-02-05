"use client";

import Link from "next/link";
import { useState } from "react";

import { DomainSearchBar } from "@/components/DomainSearchBar";
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
   AI MODELS LIST
───────────────────────────────────────────────────────────────*/
const AI_MODELS = [
  { name: "ChatGPT", icon: "/ai/icons8-chatgpt.svg" },
  { name: "Google", icon: "/ai/icons8-google-48.svg" },
  { name: "Gemini", icon: "/ai/gemini.png" },
  { name: "Claude", icon: "/ai/icons8-claude.svg" },
  { name: "Perplexity", icon: "/ai/perplexity.svg" },
  { name: "DeepSeek", icon: "/ai/deepseek.svg" },
];

/* ─────────────────────────────────────────────────────────────
   HOMEPAGE
───────────────────────────────────────────────────────────────*/
export default function HomePage() {
  return (
    <main className="bg-bg">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-bg">
        <div className="container-xl pb-8 pt-12 sm:pb-10 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo + wordmark */}
            <div className="flex items-end justify-center gap-0">
              <div className="h-[100px] w-[220px] overflow-hidden -mr-3 sm:h-[130px] sm:w-[280px] sm:-mr-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="VRTL"
                  className="h-full w-full scale-[1.6] object-cover object-left"
                  src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                />
              </div>
              <span className="text-[72px] font-semibold leading-[0.9] tracking-tight text-text sm:text-[96px]">
                Score
              </span>
            </div>

            {/* Tagline + AI icons */}
            <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span className="text-xl font-bold text-text sm:text-2xl">
                AI visibility, measured.
              </span>
              <div className="flex items-center">
                {AI_MODELS.slice(0, 4).map((model, i) => (
                  <span
                    key={model.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface -ml-2 first:ml-0"
                    style={{ zIndex: 4 - i }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={model.name} className="h-4 w-4" src={model.icon} />
                  </span>
                ))}
                <span className="ml-2 text-sm text-text-3">& more</span>
              </div>
            </div>

            {/* Value prop subtitle */}
            <p className="mx-auto mt-3 max-w-2xl text-base text-text-2 leading-relaxed sm:text-lg">
              Unlock AI search growth, own how LLMs talk about your clients, and capture demand on ChatGPT, Gemini, and more—reaching billions who use AI daily.
            </p>

            {/* Search bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <DomainSearchBar />
            </div>

            {/* CTAs */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="rounded-lg bg-text px-6 py-3 text-sm font-medium text-white shadow-lg shadow-text/10 transition-all hover:bg-text/90 hover:scale-[1.02]"
              >
                Start free trial
              </Link>
              <Link href="/pricing" className="text-sm text-text-2 hover:text-text transition-colors">
                View pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE FUTURE OF SEARCH + FEATURE CARDS (Goodie-style)
      ═══════════════════════════════════════════════════════ */}
      <section id="features" className="border-t border-border bg-surface py-20 md:py-28">
        <div className="container-xl">
          {/* Section Header - Future of Search */}
          <div className="mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-3">The Future of Search</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-text md:text-5xl lg:text-6xl">
              The New Frontier for
              <br />
              Agency Growth
            </h2>
            <p className="mt-8 max-w-3xl text-xl leading-relaxed text-text-2">
              LLM visibility is the new digital shelf where brands rush to get surfaced. AI Answer Engines are used by billions daily to shape perspectives, help make buying decisions, and answer questions about your clients&apos; brands and industries.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Competitive Benchmarking */}
            <div className="group rounded-3xl border border-border bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 min-h-[200px] rounded-2xl bg-surface-2 p-6 ring-1 ring-border/60">
                <div className="space-y-3">
                  {[
                    { name: "Your Client", score: 85, rank: 1, color: "bg-emerald-500" },
                    { name: "Competitor A", score: 72, rank: 2, color: "bg-text" },
                    { name: "Competitor B", score: 68, rank: 3, color: "bg-text" },
                    { name: "Competitor C", score: 54, rank: 4, color: "bg-text" },
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
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="w-8 text-sm font-bold text-text">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">Competitive Benchmarking</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Compare your client&apos;s performance against competitors and stay ahead with real-time analytics. See
                exactly where they rank across ChatGPT, Claude, Gemini, and emerging AI platforms.
              </p>
            </div>

            {/* Performance Dashboard */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
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
              <h3 className="text-2xl font-semibold text-text">Performance Dashboard</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Gain real-time insights into your client&apos;s visibility across AI Answer Engines like ChatGPT and
                Google Gemini. Track trends, monitor progress, and visualize growth over time.
              </p>
            </div>

            {/* Visibility Analysis */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
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
                    Recommended
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">Visibility Analysis</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Understand where your client stands in the AI ecosystem and enhance their presence on emerging
                platforms. Every mention captured with full context, citations, and evidence.
              </p>
            </div>

            {/* Sentiment Analysis */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 min-h-[200px] rounded-2xl bg-surface-2 p-6 ring-1 ring-border/60">
                <div className="mb-3 text-xs uppercase tracking-wide text-text-3">Sentiment Breakdown</div>
                <div className="space-y-3">
                  {[
                    { label: "Positive", value: 72, dot: "bg-emerald-500" },
                    { label: "Neutral", value: 23, dot: "bg-slate-400" },
                    { label: "Negative", value: 5, dot: "bg-red-500" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${row.dot}`} />
                      <div className="w-16 text-sm font-medium text-text">{row.label}</div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-border/50">
                        <div className="h-full rounded-full bg-text" style={{ width: `${row.value}%` }} />
                      </div>
                      <div className="w-10 text-right text-sm font-semibold text-text">{row.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">Sentiment Analysis</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Monitor and improve how your client is perceived in AI-generated responses. Track positive, neutral,
                and negative sentiment trends to protect and enhance brand reputation.
              </p>
                  </div>
                  
            {/* Optimization Hub */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
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
              <h3 className="text-2xl font-semibold text-text">Optimization Hub</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Identify opportunities and get actionable recommendations to take control of your client&apos;s AI
                narrative. Know exactly what to fix and why it matters—prioritized by impact.
              </p>
            </div>

            {/* Branded PDF Reports */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 flex min-h-[200px] items-center justify-center rounded-2xl bg-surface-2 p-6 ring-1 ring-border/60">
                <div className="relative">
                  {/* PDF document mockup */}
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
                  {/* Download badge */}
                  <div className="absolute -top-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-text">Branded PDF Reports</h3>
              <p className="mt-3 leading-relaxed text-text-2">
                Generate polished, client-ready reports in seconds. Professional deliverables with your agency branding
                that prove the value of your AI optimization work.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AI MODELS
      ═══════════════════════════════════════════════════════ */}
      <section id="models" className="border-t border-border bg-bg py-14 md:py-16">
        <div className="container-xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-3">Models supported</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text md:text-3xl">
              Measure visibility across leading AI platforms
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {AI_MODELS.map((m) => (
                <span
                  key={m.name}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-text-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={m.name} className="h-4 w-4" src={m.icon} />
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-bg py-20 md:py-24">
        <div className="container-xl">
          <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
            Ready to show your clients how AI sees them?
            </h2>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-text px-8 text-base font-medium text-white shadow-lg shadow-text/10 transition-all hover:bg-text/90 hover:scale-[1.02]"
              >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface px-8 text-base font-medium text-text transition-all hover:border-text/20 hover:bg-surface-2"
            >
              View pricing
            </Link>
          </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-text py-16 md:py-20">
        <div className="container-xl max-w-5xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { value: "3+", label: "AI Models", sublabel: "ChatGPT, Claude, Gemini, and more" },
              { value: "10", label: "Prompts", sublabel: "Industry-specific queries per snapshot" },
              { value: "<5min", label: "To Report", sublabel: "From client onboarding to PDF" },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center ${i < 2 ? 'md:border-r md:border-white/10' : ''}`}>
                <div className="text-5xl font-bold text-white md:text-6xl">{stat.value}</div>
                <div className="mt-2 text-lg font-medium text-white">{stat.label}</div>
                <div className="mt-1 text-sm text-white/60">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMPARISON (Without vs With)
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-bg py-20 md:py-28">
        <div className="container-xl max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-text md:text-4xl">
              No more manual searches.<br />Real, defensible data.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Without */}
            <div className="rounded-2xl border border-border bg-white p-6">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-3">
                Manual AI checks
              </div>
              <ul className="space-y-3 text-text-2">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Copy-paste queries into each AI
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Screenshots that look unprofessional
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No way to track changes over time
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hours building reports manually
                </li>
              </ul>
            </div>

            {/* With */}
            <div className="rounded-2xl border border-text bg-text p-6 text-white">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">
                VRTL Score
              </div>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Automated queries across all models
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Branded PDFs ready for clients
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Month-over-month tracking built in
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Reports generated in minutes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ (with Questions marquee)
      ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-border bg-surface">
        {/* Questions Marquee - Goodie style */}
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
              answer="AI visibility refers to how often and how prominently a brand appears in AI-generated responses. When someone asks ChatGPT, Claude, or Gemini for recommendations in your client's industry, are they mentioned? That's AI visibility."
            />
            <FAQItem
              question="How does VRTL Score work?"
              answer="We query ChatGPT, Claude, and Gemini with standardized, industry-specific prompts. We analyze the responses to see if and how your client is mentioned, then calculate a visibility score based on frequency, prominence, and sentiment."
            />
            <FAQItem
              question="What AI models do you support?"
              answer="Currently we support ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google). We're constantly adding new models as they become relevant for AI search."
            />
            <FAQItem
              question="How accurate are the scores?"
              answer="Scores are based on real AI responses at the time of the snapshot. AI outputs can vary, which is why we recommend running monthly snapshots to track trends over time rather than focusing on any single score."
            />
            <FAQItem
              question="Can I white-label the reports?"
              answer="Yes. PDF reports include your agency branding. You can add your logo and customize the look to match your brand."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes, we offer a 7-day free trial so you can test the platform with your own clients before committing."
            />
          </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          METHODOLOGY (lightweight)
      ═══════════════════════════════════════════════════════ */}
      <section id="methodology" className="border-t border-border bg-bg py-16">
        <div className="container-xl">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-3">Methodology</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text">Defensible by design</h2>
            <p className="mt-4 text-lg leading-relaxed text-text-2">
              VRTL Score runs standardized discovery scenarios across multiple AI models, then scores performance on
              presence, positioning, and authority. Evidence is preserved so agencies can confidently present findings
              to clients.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
