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
    <div className="border-b border-[#E5E5E5]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-semibold text-[#0A0A0A]">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-[#999] transition-transform ${isOpen ? "rotate-180" : ""}`}
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
          <p className="text-[#666] leading-relaxed">{answer}</p>
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
   FEATURE CARDS DATA
───────────────────────────────────────────────────────────────*/
const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Competitive Benchmarking",
    description: "Compare your client's AI visibility against competitors with real-time rankings. See exactly where they stand across every major model.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Performance Dashboard",
    description: "Real-time insights into AI visibility scores across ChatGPT, Claude, Gemini and more. Track progress over time with visual analytics.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Visibility Analysis",
    description: "Understand exactly how and where your client appears in AI responses. Every mention captured with full context and evidence.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    title: "Sentiment Analysis",
    description: "Monitor how AI models talk about your client. Is the sentiment positive, neutral, or negative? Know before your clients ask.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Optimization Insights",
    description: "Actionable recommendations to improve AI visibility. Know what to fix and why it matters—delivered in every report.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: "Branded PDF Reports",
    description: "Generate polished, client-ready reports in seconds. Professional deliverables that prove the value of your AI optimization work.",
  },
];

/* ─────────────────────────────────────────────────────────────
   HOMEPAGE
───────────────────────────────────────────────────────────────*/
export default function HomePage() {
  return (
    <main className="bg-[#FAFAF8]">
      {/* ═══════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#FAFAF8]">
        <div className="mx-auto max-w-6xl px-6 pb-8 pt-12 sm:pb-10 sm:pt-16">
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
              <span className="text-[72px] font-semibold leading-[0.9] tracking-tight text-[#0A0A0A] sm:text-[96px]">
                Score
              </span>
            </div>

            {/* Tagline + AI icons */}
            <div className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
              <span className="text-xl font-medium text-[#0A0A0A] sm:text-2xl">
                AI visibility, measured.
              </span>
              <div className="flex items-center">
                {AI_MODELS.slice(0, 4).map((model, i) => (
                  <span
                    key={model.name}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E5E5] bg-white -ml-2 first:ml-0"
                    style={{ zIndex: 4 - i }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={model.name} className="h-4 w-4" src={model.icon} />
                  </span>
                ))}
                <span className="ml-2 text-sm text-[#999]">& more</span>
              </div>
            </div>

            {/* Search bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <DomainSearchBar />
            </div>

            {/* CTAs */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="rounded-lg bg-[#0A0A0A] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a] hover:scale-[1.02]"
              >
                Start free trial
              </Link>
              <Link href="/pricing" className="text-sm text-[#666] hover:text-[#0A0A0A] transition-colors">
                View pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT US / VALUE PROP
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#FAFAF8] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            About VRTL Score
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl lg:text-5xl leading-tight">
            Prove AI visibility to your clients.<br className="hidden sm:block" />
            Win more business. Retain accounts longer.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#666] leading-relaxed">
            AI search is reshaping how brands get discovered. Your clients need to know how they appear in ChatGPT, Claude, and Gemini. VRTL Score gives you the data to show them—and the reports to prove your value.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE FUTURE OF SEARCH
      ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Left - Content */}
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#999]">
                The Future of Search
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl leading-tight">
                The New Frontier for<br />Agency Growth
              </h2>
              <p className="mt-6 text-lg text-[#666] leading-relaxed">
                Billions of people use AI daily to make buying decisions, research brands, and find recommendations. LLM visibility is the new digital shelf where brands compete to be surfaced.
              </p>
              <p className="mt-4 text-lg text-[#666] leading-relaxed">
                Agencies that can measure and optimize AI visibility will win the next decade. VRTL Score gives you the tools to lead this transformation for your clients.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/onboarding"
                  className="rounded-lg bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#1a1a1a]"
                >
                  Get started
                </Link>
                <Link href="/pricing" className="text-sm font-medium text-[#0A0A0A] hover:text-[#666] transition-colors">
                  Learn more →
                </Link>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="relative">
              <div className="rounded-2xl border border-[#E5E5E5] bg-[#FAFAF8] p-6">
                {/* Mock dashboard preview */}
                <div className="space-y-4">
                  {/* Score header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#999]">AI Visibility Score</div>
                      <div className="text-4xl font-bold text-[#0A0A0A]">78</div>
                    </div>
                    <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-600">B+</span>
                    </div>
                  </div>
                  
                  {/* Model breakdown */}
                  <div className="space-y-2">
                    {[
                      { name: "ChatGPT", score: 85, color: "bg-emerald-500" },
                      { name: "Claude", score: 72, color: "bg-blue-500" },
                      { name: "Gemini", score: 68, color: "bg-purple-500" },
                    ].map((model) => (
                      <div key={model.name} className="flex items-center gap-3">
                        <span className="w-16 text-sm text-[#666]">{model.name}</span>
                        <div className="flex-1 h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${model.color} rounded-full transition-all`}
                            style={{ width: `${model.score}%` }}
                          />
                        </div>
                        <span className="w-8 text-sm font-medium text-[#0A0A0A]">{model.score}</span>
                      </div>
                    ))}
                  </div>

                  {/* Competitive position */}
                  <div className="pt-4 border-t border-[#E5E5E5]">
                    <div className="text-sm text-[#999] mb-2">Competitive Ranking</div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-bold text-white">2</span>
                      <span className="text-sm font-medium text-[#0A0A0A]">of 5 competitors</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURE CARDS (Goodie-style)
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#FAFAF8] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              Platform Features
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              Everything you need to prove AI visibility
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#666]">
              Built for agencies who want to lead in AI search optimization.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all hover:border-[#0A0A0A]/20 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAFAF8] text-[#0A0A0A] group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#0A0A0A]">{feature.title}</h3>
                <p className="mt-2 text-[#666] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          AI MODELS STRIP
      ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-[#999] mb-8">
            VRTL Score works across leading AI models
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {AI_MODELS.map((model) => (
              <div key={model.name} className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={model.name} src={model.icon} className="h-full w-full object-contain" />
                </div>
                <span className="text-sm font-medium text-[#666]">{model.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS (3 Steps)
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#FAFAF8] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              How It Works
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              Client-ready reports in 3 steps
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#666]">
              The fastest way to prove AI visibility to your clients.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Add your client",
                description: "Enter their website and up to 4 competitors. Takes less than a minute.",
              },
              {
                step: "2",
                title: "Run a snapshot",
                description: "We query ChatGPT, Claude, and Gemini with industry-specific prompts.",
              },
              {
                step: "3",
                title: "Get your report",
                description: "Download a branded PDF with scores, evidence, and recommendations.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A] text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#0A0A0A]">{item.title}</h3>
                <p className="mt-2 text-[#666]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMPARISON (Without vs With)
      ═══════════════════════════════════════════════════════ */}
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              No more manual searches.<br />Real, defensible data.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Without */}
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#999]">
                Manual AI checks
              </div>
              <ul className="space-y-3 text-[#666]">
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
            <div className="rounded-2xl border border-[#0A0A0A] bg-[#0A0A0A] p-6 text-white">
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
          STATS
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#FAFAF8] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { value: "3+", label: "AI Models", sublabel: "ChatGPT, Claude, Gemini, and more" },
              { value: "10", label: "Prompts", sublabel: "Industry-specific queries per snapshot" },
              { value: "<5min", label: "To Report", sublabel: "From client onboarding to PDF" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl font-bold text-[#0A0A0A]">{stat.value}</div>
                <div className="mt-2 text-lg font-medium text-[#0A0A0A]">{stat.label}</div>
                <div className="mt-1 text-sm text-[#999]">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          QUESTIONS MARQUEE
      ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-[#E5E5E5] bg-[#FAFAF8] py-8 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="mx-6 text-4xl font-bold text-[#0A0A0A]/10 md:text-5xl">
              Questions?
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
              FAQ
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
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
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0A0A] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Ready to prove AI visibility?
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Join agencies using VRTL Score to win more business.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-8 text-base font-medium text-[#0A0A0A] transition-all hover:bg-[#F5F5F5] hover:scale-[1.02]"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-transparent px-8 text-base font-medium text-white transition-all hover:bg-white/10"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
