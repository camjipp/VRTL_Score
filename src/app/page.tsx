"use client";

import Link from "next/link";
import { useState } from "react";

import { Footer } from "@/components/Footer";

/* ─────────────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────────────────*/
function FAQItem({
  question,
  answer,
  dark = false,
}: {
  question: string;
  answer: string;
  dark?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={dark ? "border-b border-white/10" : "border-b border-border"}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span
          className={
            dark
              ? "text-lg font-semibold text-white"
              : "text-lg font-semibold text-text"
          }
        >
          {question}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 transition-transform ${
            dark ? "text-white/50" : "text-text-3"
          } ${isOpen ? "rotate-180" : ""}`}
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
          <p
            className={
              dark
                ? "text-white/70 leading-relaxed"
                : "text-text-2 leading-relaxed"
            }
          >
            {answer}
          </p>
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
      <section className="heroFrame container-xl relative flex min-h-[90vh] flex-1 flex-col justify-start px-6 pb-28 pt-24 sm:min-h-[95vh] sm:px-10 sm:pt-28 md:px-14">
        <div className="heroFrameBg" aria-hidden />

        <div className="heroContent max-w-3xl">
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
      </section>

      {/* ═══════════════════════════════════════════════════════
          THE SHIFT — diagram-style feature blocks, flat black
      ═══════════════════════════════════════════════════════ */}
      <section
        id="shift"
        className="-mt-6 border-t border-white/10 bg-black pt-20 pb-24 md:-mt-20 md:pt-28 md:pb-32"
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
          PROOF — Make AI visibility reportable
      ═══════════════════════════════════════════════════════ */}
      <section id="platform" className="border-t border-white/10 bg-black py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Make AI visibility reportable.
          </h2>
          <p className="mt-3 text-lg text-white/50">
            Snapshots, competitors, and exports your clients understand.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* 1) Snapshots */}
            <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Snapshots</p>
              <h3 className="mt-2 text-lg font-semibold text-white">Standardized snapshots.</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Run repeatable scenarios and capture results across models.
              </p>
              <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
                <div className="rounded border border-white/15 bg-white/5 p-2.5">
                  <div className="h-1.5 w-full rounded-sm bg-white/20" />
                  <div className="mt-1.5 h-1 w-4/5 rounded-sm bg-white/10" />
                </div>
                <div className="rounded border border-white/15 bg-white/5 p-2.5">
                  <div className="h-1.5 w-full rounded-sm bg-white/15" />
                  <div className="mt-1.5 h-1 w-3/4 rounded-sm bg-emerald-500/50" />
                </div>
              </div>
            </div>

            {/* 2) Competitive replacement */}
            <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Competitive replacement</p>
              <h3 className="mt-2 text-lg font-semibold text-white">See who replaces you.</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Identify the primary displacer when your client is not included.
              </p>
              <div className="mt-5 flex flex-1 items-center justify-center gap-2">
                <div className="rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/70">Client</div>
                <svg className="h-3.5 w-3.5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white/70">Competitor</div>
              </div>
            </div>

            {/* 3) PDF exports */}
            <div className="flex flex-col rounded-lg border border-white/10 bg-white/[0.02] p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">PDF exports</p>
              <h3 className="mt-2 text-lg font-semibold text-white">White-labeled PDF exports.</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                Deliver client-ready reports with evidence and competitive context.
              </p>
              <div className="mt-5 flex flex-1 flex-col justify-end">
                <div className="w-full max-w-[160px] rounded border border-white/15 bg-white/[0.04] p-3">
                  <div className="h-4 w-12 rounded bg-white/20" />
                  <div className="mt-3 text-xl font-bold text-white">78</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/40">Score</div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-4/5 rounded-full bg-white/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FAQ
      ═══════════════════════════════════════════════════════ */}
      <section id="faq" className="border-t border-white/10 bg-black">
        {/* Questions Marquee */}
        <div className="overflow-hidden py-6 md:py-10">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="mx-10 text-6xl font-black text-white/90 md:text-7xl lg:text-8xl xl:text-9xl">
                Questions?
              </span>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="px-6 pb-20 pt-8 md:pb-28 md:pt-12">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                We have the answers.
              </h2>
            </div>

            <div>
              <FAQItem
                dark
                question="What is AI visibility?"
                answer="AI visibility is how often—and how prominently—a brand appears when someone asks ChatGPT, Claude, Gemini, or other AI answer engines for a recommendation. It's the new version of 'do we rank on page one?'"
              />
              <FAQItem
                dark
                question="How does VRTL Score measure it?"
                answer="We run standardized discovery scenarios across multiple AI models, analyze where and how your client is mentioned, then produce a composite visibility score based on mention rate, positioning, and citation quality. Every data point is preserved as evidence."
              />
              <FAQItem
                dark
                question="What AI models do you track?"
                answer="Currently ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google)—with Perplexity and others being added. We expand coverage as new AI answer engines gain user share."
              />
              <FAQItem
                dark
                question="How is the score calculated?"
                answer="The score combines three dimensions: how often your client is mentioned (mention rate), where they appear in the response (top, middle, or bottom), and whether they're cited with sources. Results are normalized across models into a single executive-ready number."
              />
              <FAQItem
                dark
                question="Can I white-label the reports?"
                answer="Yes. PDF reports include your agency logo and branding. They're designed to be handed directly to clients as a professional deliverable—supporting renewals, upsells, and new business pitches."
              />
              <FAQItem
                dark
                question="Is there a free trial?"
                answer="Yes. Start with a 7-day free trial—run snapshots on real clients and see the platform in action before committing."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA — dark, minimal (Linear-style)
      ═══════════════════════════════════════════════════════ */}
      <section className="border-t border-white/10 bg-black py-24 md:py-32">
        <div className="mx-auto max-w-2xl px-6 text-center sm:px-10">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Start measuring AI visibility.
          </h2>
          <p className="mt-4 text-base text-white/50 sm:text-lg">
            Give clients proof. Keep the narrative. Defend renewals.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <Link
              href="/signup"
              className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-lg bg-emerald-500 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Start free trial
            </Link>
            <Link
              href="/sample-report"
              className="text-sm text-white/60 underline-offset-4 transition-colors hover:text-white/80"
            >
              View sample PDF →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
