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
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Competitive Benchmarking",
    description: "Compare your client's performance against competitors and stay ahead with real-time analytics. See exactly where they rank across ChatGPT, Claude, Gemini, and emerging AI platforms.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    title: "Performance Dashboard",
    description: "Gain real-time insights into your client's visibility across AI Answer Engines like ChatGPT and Google Gemini. Track trends, monitor progress, and visualize growth over time.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    title: "Global Monitoring",
    description: "Maximize your client's presence in AI search around the world. Our proprietary tools monitor mentions and recommendations across every major language model and market.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Visibility Analysis",
    description: "Understand where your client stands in the AI ecosystem and enhance their presence on emerging platforms. Every mention captured with full context, citations, and evidence.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
    title: "Sentiment Analysis",
    description: "Monitor and improve how your client is perceived in AI-generated responses. Track positive, neutral, and negative sentiment trends to protect and enhance brand reputation.",
  },
  {
    icon: (
      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Optimization Hub",
    description: "Identify opportunities and get actionable recommendations to take control of your client's AI narrative. Know exactly what to fix and why it matters—prioritized by impact.",
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
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl lg:text-5xl">
              Everything you need to prove AI visibility
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[#666] leading-relaxed">
              Built for agencies who want to lead in AI search optimization. Monitor, analyze, and optimize your clients&apos; presence across every major AI platform.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-[#E5E5E5] bg-white p-7 transition-all duration-300 hover:border-transparent hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FAFAF8] to-[#F0F0EC] text-[#0A0A0A] group-hover:from-emerald-50 group-hover:to-emerald-100 group-hover:text-emerald-600 transition-all duration-300 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#0A0A0A] group-hover:text-emerald-700 transition-colors">{feature.title}</h3>
                <p className="mt-3 text-[#666] leading-relaxed">{feature.description}</p>
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
          FAQ (with Questions marquee)
      ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-[#E5E5E5] bg-white">
        {/* Questions Marquee - Goodie style */}
        <div className="overflow-hidden py-6 md:py-10">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="mx-10 text-6xl font-black text-[#0A0A0A] md:text-7xl lg:text-8xl xl:text-9xl">
                Questions?
              </span>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="px-6 pb-20 pt-8 md:pb-28 md:pt-12">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
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

      <Footer />
    </main>
  );
}
