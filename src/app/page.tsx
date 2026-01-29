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
          FEATURE CARDS (Goodie-style - Large with Visuals)
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Competitive Benchmarking */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#F0F0EC] p-6 min-h-[200px]">
                <div className="space-y-3">
                  {[
                    { name: "Your Client", score: 85, rank: 1, color: "bg-emerald-500" },
                    { name: "Competitor A", score: 72, rank: 2, color: "bg-[#0A0A0A]" },
                    { name: "Competitor B", score: 68, rank: 3, color: "bg-[#0A0A0A]" },
                    { name: "Competitor C", score: 54, rank: 4, color: "bg-[#0A0A0A]" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${item.rank === 1 ? 'bg-emerald-500' : 'bg-[#999]'}`}>
                        {item.rank}
                      </span>
                      <span className="w-24 text-sm font-medium text-[#0A0A0A] truncate">{item.name}</span>
                      <div className="flex-1 h-3 bg-white rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="w-8 text-sm font-bold text-[#0A0A0A]">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#0A0A0A]">Competitive Benchmarking</h3>
              <p className="mt-3 text-[#666] leading-relaxed">Compare your client&apos;s performance against competitors and stay ahead with real-time analytics. See exactly where they rank across ChatGPT, Claude, Gemini, and emerging AI platforms.</p>
            </div>

            {/* Performance Dashboard */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#F0F0EC] p-6 min-h-[200px]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-[#999] uppercase tracking-wide">AI Visibility Score</div>
                    <div className="text-4xl font-bold text-[#0A0A0A]">78</div>
                  </div>
                  <div className="h-16 w-16 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-white">
                    <span className="text-lg font-bold text-emerald-600">B+</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { model: "ChatGPT", score: 85, icon: "/ai/icons8-chatgpt.svg" },
                    { model: "Claude", score: 72, icon: "/ai/icons8-claude.svg" },
                    { model: "Gemini", score: 68, icon: "/ai/gemini.png" },
                  ].map((m) => (
                    <div key={m.model} className="bg-white rounded-xl p-3 text-center shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.icon} alt={m.model} className="h-6 w-6 mx-auto mb-1" />
                      <div className="text-lg font-bold text-[#0A0A0A]">{m.score}</div>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#0A0A0A]">Performance Dashboard</h3>
              <p className="mt-3 text-[#666] leading-relaxed">Gain real-time insights into your client&apos;s visibility across AI Answer Engines like ChatGPT and Google Gemini. Track trends, monitor progress, and visualize growth over time.</p>
            </div>

            {/* Visibility Analysis */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#F0F0EC] p-6 min-h-[200px]">
                <div className="text-xs text-[#999] uppercase tracking-wide mb-3">AI Response Analysis</div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ai/icons8-chatgpt.svg" alt="ChatGPT" className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-[#666] leading-relaxed">
                        &quot;For digital marketing agencies, I&apos;d recommend <span className="bg-emerald-100 text-emerald-700 px-1 rounded font-medium">Your Client</span> as they specialize in AI-driven strategies and have shown excellent results...&quot;
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
              <h3 className="text-2xl font-semibold text-[#0A0A0A]">Visibility Analysis</h3>
              <p className="mt-3 text-[#666] leading-relaxed">Understand where your client stands in the AI ecosystem and enhance their presence on emerging platforms. Every mention captured with full context, citations, and evidence.</p>
            </div>

            {/* Sentiment Analysis */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#F0F0EC] p-6 min-h-[200px]">
                <div className="text-xs text-[#999] uppercase tracking-wide mb-3">Sentiment Breakdown</div>
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                      <span className="text-3xl">😊</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">72%</div>
                    <div className="text-xs text-[#999]">Positive</div>
                  </div>
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-2">
                      <span className="text-2xl">😐</span>
                    </div>
                    <div className="text-xl font-bold text-[#666]">23%</div>
                    <div className="text-xs text-[#999]">Neutral</div>
                  </div>
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-2">
                      <span className="text-xl">😟</span>
                    </div>
                    <div className="text-lg font-bold text-red-500">5%</div>
                    <div className="text-xs text-[#999]">Negative</div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#0A0A0A]">Sentiment Analysis</h3>
              <p className="mt-3 text-[#666] leading-relaxed">Monitor and improve how your client is perceived in AI-generated responses. Track positive, neutral, and negative sentiment trends to protect and enhance brand reputation.</p>
            </div>

            {/* Optimization Hub */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#F0F0EC] p-6 min-h-[200px]">
                <div className="text-xs text-[#999] uppercase tracking-wide mb-3">Recommendations</div>
                <div className="space-y-2">
                  {[
                    { priority: "High", text: "Add structured data markup to service pages", impact: "+12 pts" },
                    { priority: "Med", text: "Improve expertise signals in About section", impact: "+8 pts" },
                    { priority: "Med", text: "Create FAQ content for common queries", impact: "+6 pts" },
                  ].map((rec, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${rec.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {rec.priority}
                      </span>
                      <span className="flex-1 text-sm text-[#0A0A0A] truncate">{rec.text}</span>
                      <span className="shrink-0 text-sm font-bold text-emerald-600">{rec.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-[#0A0A0A]">Optimization Hub</h3>
              <p className="mt-3 text-[#666] leading-relaxed">Identify opportunities and get actionable recommendations to take control of your client&apos;s AI narrative. Know exactly what to fix and why it matters—prioritized by impact.</p>
            </div>

            {/* Branded PDF Reports */}
            <div className="group rounded-3xl border border-[#E5E5E5] bg-white p-8 transition-all duration-300 hover:border-emerald-200 hover:shadow-xl">
              {/* Visual */}
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#F8F8F6] to-[#F0F0EC] p-6 min-h-[200px] flex items-center justify-center">
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
              <h3 className="text-2xl font-semibold text-[#0A0A0A]">Branded PDF Reports</h3>
              <p className="mt-3 text-[#666] leading-relaxed">Generate polished, client-ready reports in seconds. Professional deliverables with your agency branding that prove the value of your AI optimization work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#0A0A0A] px-6 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
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
      <section className="bg-[#FAFAF8] px-6 py-20 md:py-28">
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
