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
   HOMEPAGE
───────────────────────────────────────────────────────────────*/
export default function HomePage() {
  return (
    <main className="bg-black">
      {/* ═══════════════════════════════════════════════════════
          HERO — Linear-style frame (room + floor in one bg layer)
      ═══════════════════════════════════════════════════════ */}
      <section className="heroFrame relative flex min-h-[90vh] flex-col sm:min-h-[95vh]">
        <div className="heroFrameBg" aria-hidden />

        <div className="heroContent container-xl flex flex-1 flex-col justify-start px-6 pb-28 pt-24 sm:px-10 sm:pt-28 md:px-14">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
              Your clients are already being ranked by AI.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg">
              Answer engines are shaping brand perception in real time.
              VRTL Score measures where your clients appear — and where they&apos;re invisible.
            </p>
          </div>

          <div className="panelWrap mx-auto mt-10 w-full max-w-7xl translate-y-6 sm:translate-y-10 md:translate-y-12">
            <div className="floatingPanel w-full max-w-7xl">
              <div className="relative">
                {/* App chrome — sidebar + main content */}
                <div className="flex min-h-[420px] md:min-h-[500px]">
                  {/* Sidebar */}
                  <div className="hidden w-52 shrink-0 border-r border-white/[0.08] bg-white/[0.04] p-4 md:block">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-accent/30" />
                      <div className="h-3 w-20 rounded bg-white/20" />
                    </div>
                    <div className="mt-6 space-y-1">
                      {["Dashboard", "Clients", "Snapshots", "Reports", "Settings"].map((label) => (
                        <div
                          key={label}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${label === "Dashboard" ? "bg-white/10 text-white/90" : "text-white/40"}`}
                        >
                          <div className={`h-3.5 w-3.5 rounded ${label === "Dashboard" ? "bg-white/30" : "bg-white/10"}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 border-t border-white/[0.06] pt-4">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-white/25">Recent Clients</div>
                      <div className="mt-3 space-y-2">
                        {["Acme Corp", "BluePeak Digital", "Nexus AI"].map((c) => (
                          <div key={c} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-accent/40" />
                            <span className="text-xs text-white/40">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Main content */}
                  <div className="flex-1 p-5 md:p-6">
                    {/* Top bar */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-white/30">Client Overview</div>
                        <div className="mt-1 text-sm font-semibold text-white/90">Acme Digital Agency</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-accent/20 px-2 py-1 text-[10px] font-medium text-accent">Score ↑</span>
                        <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-white/40">2 days ago</span>
                      </div>
                    </div>
                    {/* Metrics row */}
                    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="flex flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.05] p-4">
                        <div className="text-3xl font-bold text-white">78</div>
                        <div className="mt-1 text-[10px] text-white/40">Visibility Score</div>
                      </div>
                      {[
                        { label: "Mention Rate", value: "72%" },
                        { label: "Top Position", value: "45%" },
                        { label: "Citation Rate", value: "38%" },
                      ].map((m) => (
                        <div key={m.label} className="rounded-xl border border-white/[0.08] bg-white/[0.05] p-3">
                          <div className="text-[10px] text-white/30">{m.label}</div>
                          <div className="mt-1 text-lg font-bold text-white/90">{m.value}</div>
                          <div className="mt-0.5 text-[10px] font-medium text-accent">+5%</div>
                        </div>
                      ))}
                    </div>
                    {/* Chart + competitor list */}
                    <div className="mt-4 grid gap-3 md:grid-cols-5">
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.05] p-4 md:col-span-3">
                        <div className="text-[10px] uppercase tracking-wider text-white/30">Score Over Time</div>
                        <div className="mt-3 flex h-28 items-end gap-1.5">
                          {[35, 42, 38, 55, 52, 60, 58, 72, 68, 75, 78].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t bg-accent/40" style={{ height: `${h}%` }} />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/[0.08] bg-white/[0.05] p-4 md:col-span-2">
                        <div className="text-[10px] uppercase tracking-wider text-white/30">Competitors</div>
                        <div className="mt-3 space-y-2.5">
                          {[
                            { name: "Your Client", score: 78, top: true },
                            { name: "Competitor A", score: 65, top: false },
                            { name: "Competitor B", score: 52, top: false },
                            { name: "Competitor C", score: 41, top: false },
                          ].map((c) => (
                            <div key={c.name} className="flex items-center gap-2">
                              <div className={`h-1.5 w-1.5 rounded-full ${c.top ? "bg-accent" : "bg-white/20"}`} />
                              <span className={`flex-1 text-xs ${c.top ? "text-white/80" : "text-white/40"}`}>{c.name}</span>
                              <span className={`text-xs font-medium tabular-nums ${c.top ? "text-white/90" : "text-white/40"}`}>{c.score}</span>
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
        </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE SHIFT — diagram-style feature blocks, flat black
      ═══════════════════════════════════════════════════════ */}
      <section
        id="shift"
        className="-mt-6 border-t border-white/5 bg-[#000] pt-20 pb-24 md:-mt-20 md:pt-28 md:pb-32"
      >
        <div className="container-xl px-6 sm:px-10 md:px-14">
          <div className="max-w-3xl">
            <p className="text-3xl font-semibold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">
              SEO is reporting the past. AI answers are deciding the present. VRTL Score measures what actually matters.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-7xl md:mt-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {/* AEO / Inclusion */}
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-white/[0.14] md:p-7">
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">AEO</div>
                <h3 className="mt-1.5 text-lg font-semibold text-white">Win inclusion in answers.</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  AI models generate direct responses.
                  <br />
                  If your client is not named inside them, they do not exist.
                </p>
                {/* Diagram: answer card, 2 line blocks, mention pill, sources row */}
                <div className="mt-5 flex flex-1 flex-col justify-end">
                  <div className="rounded-lg border border-white/[0.12] p-3.5">
                    <div className="space-y-2.5">
                      <div className="h-1 w-full rounded-sm border border-white/[0.15]" />
                      <div className="h-1 w-[95%] rounded-sm border border-white/[0.15]" />
                    </div>
                    <span className="mt-2.5 inline-block rounded-full border border-accent/50 bg-accent/20 px-2 py-0.5 text-[9px] font-medium text-accent">
                      Mentioned
                    </span>
                    <div className="mt-2.5 flex gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full border border-white/[0.2]" />
                      <div className="h-1.5 w-1.5 rounded-full border border-white/[0.2]" />
                      <div className="h-1.5 w-1.5 rounded-full border border-white/[0.2]" />
                      <div className="h-1.5 w-1.5 rounded-full border border-white/[0.2]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* GEO / Recommendations */}
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-white/[0.14] md:p-7">
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">GEO</div>
                <h3 className="mt-1.5 text-lg font-semibold text-white">Win recommendations in generation.</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  When users ask for the best agency, product, or tool, models decide who appears first.
                  <br />
                  That decision is not random.
                </p>
                {/* Diagram: ranked list with 1/2/3, row #1 fill + emerald bar + Recommended */}
                <div className="mt-5 flex flex-1 flex-col justify-end">
                  <div className="overflow-hidden rounded-lg border border-white/[0.12]">
                    <div className="flex items-center border-b border-white/[0.08] bg-white/[0.04] px-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-[9px] font-bold text-white/90">1</span>
                      <div className="ml-2 h-1 flex-1 rounded-sm border border-white/[0.12]" />
                      <span className="ml-2 rounded border border-accent/50 bg-accent/20 px-1.5 py-0.5 text-[9px] font-medium text-accent">
                        Recommended
                      </span>
                    </div>
                    <div className="flex items-center border-b border-white/[0.05] px-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white/40">2</span>
                      <div className="ml-2 h-1 w-12 rounded-sm border border-white/[0.12]" />
                    </div>
                    <div className="flex items-center px-3 py-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white/40">3</span>
                      <div className="ml-2 h-1 w-10 rounded-sm border border-white/[0.12]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* MEASURE / Reportable */}
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] transition-all duration-200 hover:border-white/[0.14] md:p-7">
                <div className="text-[10px] font-medium uppercase tracking-wider text-white/40">MEASURE</div>
                <h3 className="mt-1.5 text-lg font-semibold text-white">Make it reportable.</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  Most agencies cannot report AI visibility.
                  <br />
                  They can report rankings. Not inclusion. Not replacement.
                </p>
                {/* Diagram: score ring (~20% larger), Visibility label, trend line, metric chips */}
                <div className="mt-5 flex flex-1 flex-col justify-end">
                  <div className="flex flex-col gap-3 rounded-lg border border-white/[0.12] p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                            <circle cx="28" cy="28" r="23" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                            <circle cx="28" cy="28" r="23" fill="none" stroke="rgb(var(--accent))" strokeWidth="2" strokeDasharray={`${0.78 * 144.5} ${0.22 * 144.5}`} strokeLinecap="round" />
                          </svg>
                          <span className="absolute text-base font-bold text-white">78</span>
                        </div>
                        <span className="mt-1 text-[8px] font-medium text-white/40">Visibility</span>
                      </div>
                      <svg className="h-9 flex-1" viewBox="0 0 80 32" preserveAspectRatio="none">
                        <polyline points="0,24 20,20 40,16 60,10 80,4" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded border border-white/[0.12] px-2 py-0.5 text-[9px] text-white/50">Mention Rate</span>
                      <span className="rounded border border-white/[0.12] px-2 py-0.5 text-[9px] text-white/50">Primary Displacer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
