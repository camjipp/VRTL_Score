"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";

import { Footer } from "@/components/Footer";

const SAMPLE_REPORT_HREF = "/preview";
const SIGNUP_HREF = "/signup";

/** Minimal DS: near-black page, #111 surfaces, soft border, emerald only for meaning + CTAs */
const pageBg = "bg-[#080808]";
const sectionAlt = "bg-[#0a0a0a]";

const container = "mx-auto w-full max-w-6xl px-6";

const heading = "font-display text-4xl font-semibold tracking-tight text-white md:text-5xl";

const subtext = "text-lg text-white/55 max-w-xl";

const label = "text-[11px] font-medium tracking-wide text-white/45";

/** Outer shell for proof + content cards */
const cardShell = "rounded-xl border border-white/[0.08] bg-[#111111] p-5";

const sectionRule = "border-t border-white/[0.06]";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/[0.06]">
      <button
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-150 hover:bg-white/[0.02]"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="text-lg font-semibold tracking-tight text-white">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-white/40 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="text-base leading-relaxed text-white/55">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function ModelRow() {
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.06] pt-8 ${label}`}>
      <span>ChatGPT</span>
      <span className="text-white/20" aria-hidden>
        ·
      </span>
      <span>Gemini</span>
      <span className="text-white/20" aria-hidden>
        ·
      </span>
      <span>Claude</span>
    </div>
  );
}

/** Hero: client-facing PDF preview — white page, no decorative glows */
function HeroReportMockup() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-md">
      <div className="relative hidden md:block" aria-hidden>
        <div className="absolute inset-0 translate-x-2 translate-y-3 scale-[0.98] rounded-2xl border border-zinc-300/60 bg-zinc-100" />
      </div>
      <div className="relative rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">VRTL Score</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">Executive snapshot</p>
          </div>
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-700">
            PDF
          </span>
        </div>
        <div className="mt-5 flex flex-wrap items-end gap-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Overall</p>
            <p className="mt-0.5 font-display text-4xl font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-5xl">78</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-medium text-zinc-800">Win · 3 models</span>
            <span className="rounded-md border border-amber-200/90 bg-amber-50 px-2 py-1 font-medium text-amber-900">At risk · 2</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
          {[
            { l: "Presence", v: "Strong" },
            { l: "Position", v: "Mixed" },
            { l: "Authority", v: "Low" },
          ].map((k) => (
            <div key={k.l} className="rounded-md border border-zinc-100 bg-zinc-50 px-2 py-2">
              <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">{k.l}</p>
              <p className="mt-0.5 text-xs font-semibold text-zinc-900">{k.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** CARD 1 — AI answer: assistant message, highlighted brand, Mentioned */
function ProofCardInclusion() {
  return (
    <div className={`${cardShell} flex flex-col`}>
      <div className="flex flex-1 flex-col rounded-lg border border-white/[0.06] bg-[#0c0c0c] p-4">
        <div className="mb-3 flex items-center gap-2 border-b border-white/[0.06] pb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-[11px] font-semibold text-white/80">
            AI
          </span>
          <div>
            <p className="text-[12px] font-medium text-white/90">Assistant</p>
            <p className="text-[10px] text-white/40">Answer</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-[#141414] px-3 py-3">
          <p className="text-[13px] leading-relaxed text-white/80">
            For payroll at 50–500 employees, teams often compare{" "}
            <mark className="rounded bg-emerald-500/25 px-1 py-0.5 font-medium text-emerald-200 [text-decoration:none]">
              Acme Payroll
            </mark>{" "}
            with Gusto and Rippling.
          </p>
        </div>
        <div className="mt-3">
          <span className="inline-flex rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">
            Mentioned
          </span>
        </div>
      </div>
      <p className={`${label} mt-4`}>Inclusion in the answer</p>
    </div>
  );
}

/** CARD 2 — Ranked recommendations */
function ProofCardRecommendation() {
  const rows: Array<{
    rank: number;
    name: string;
    highlight: boolean;
    dim?: boolean;
    pill?: string;
  }> = [
    { rank: 1, name: "Sterling Health", highlight: true, pill: "Recommended" },
    { rank: 2, name: "Vantage Care", highlight: false, dim: false },
    { rank: 3, name: "Your client", highlight: false, dim: true },
  ];

  return (
    <div className={`${cardShell} flex flex-col`}>
      <div className="flex flex-1 flex-col rounded-lg border border-white/[0.06] bg-[#0c0c0c] p-3">
        <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wide text-white/35">Model ranking</p>
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <div
              key={row.rank}
              className={
                row.highlight
                  ? "flex items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.12] px-3 py-2.5"
                  : row.dim === true
                    ? "flex items-center justify-between gap-2 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 opacity-65"
                    : "flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2"
              }
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-black/40 text-[12px] font-bold tabular-nums text-white/90">
                  {row.rank}
                </span>
                <span className={`truncate text-[13px] font-medium ${row.dim === true ? "text-white/45" : "text-white/90"}`}>
                  {row.name}
                </span>
              </div>
              {row.pill ? (
                <span className="shrink-0 rounded-md bg-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-black">
                  {row.pill}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <p className={`${label} mt-4`}>Who gets recommended</p>
    </div>
  );
}

/** CARD 3 — PDF-style report snapshot (matches deliverable, not a dark dashboard) */
function ProofCardReporting() {
  return (
    <div className={`${cardShell} flex flex-col`}>
      <div className="overflow-hidden rounded-lg border border-zinc-200/80 bg-white p-4 text-zinc-900 shadow-sm">
        <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">VRTL Score</p>
            <p className="text-[11px] font-semibold text-zinc-900">Snapshot</p>
          </div>
          <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[8px] font-bold uppercase text-zinc-600">PDF</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">Score</p>
            <p className="font-display text-2xl font-semibold tabular-nums text-zinc-900">72</p>
          </div>
          <svg className="h-10 w-24 shrink-0" viewBox="0 0 96 40" fill="none" aria-hidden>
            <path d="M4 32 L20 24 L36 28 L52 14 L68 18 L84 8" stroke="rgb(16 185 129)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            <path
              d="M4 32 L20 24 L36 28 L52 14 L68 18 L84 8 V36 H4 Z"
              fill="url(#proofTrend)"
              opacity="0.12"
            />
            <defs>
              <linearGradient id="proofTrend" x1="48" x2="48" y1="8" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="rgb(16 185 129)" />
                <stop offset="1" stopColor="rgb(16 185 129)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100">
          <div className="h-full w-[72%] rounded-full bg-zinc-800" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            { k: "Mention", v: "68%" },
            { k: "Top 3", v: "41%" },
            { k: "Models", v: "3" },
          ].map((m) => (
            <div key={m.k} className="rounded border border-zinc-100 bg-zinc-50 px-1.5 py-1.5 text-center">
              <p className="text-[8px] font-medium uppercase tracking-wide text-zinc-500">{m.k}</p>
              <p className="text-[11px] font-semibold tabular-nums text-zinc-900">{m.v}</p>
            </div>
          ))}
        </div>
      </div>
      <p className={`${label} mt-4`}>What you send clients</p>
    </div>
  );
}

function ReportPageCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className={cardShell}>
        <p className={label}>{title}</p>
        <div className="mt-3 rounded-lg border border-zinc-200/80 bg-white p-4 text-zinc-900">{children}</div>
      </div>
      <p className={`text-center ${label}`}>{caption}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={`min-h-screen ${pageBg} text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-50`}>
      <main>
        <section className={`border-b border-white/[0.06] ${pageBg}`}>
          <div className={`${container} py-24`}>
            <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
              <div className="flex flex-col gap-8">
                <h1 className={heading}>
                  Your clients are already being ranked by AI.
                  <span className="mt-2 block text-white/55">You&apos;re not reporting on it.</span>
                </h1>
                <p className={subtext}>
                  VRTL Score shows how ChatGPT, Gemini, and Claude rank, mention, and recommend your clients — and gives you a report you can actually send.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition hover:bg-emerald-400"
                    href={SIGNUP_HREF}
                  >
                    Run a free snapshot
                  </Link>
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.12] px-8 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.04]"
                    href={SAMPLE_REPORT_HREF}
                  >
                    View sample report
                  </Link>
                </div>
                <ModelRow />
              </div>
              <HeroReportMockup />
            </div>
          </div>
        </section>

        <section className={`${sectionRule} ${sectionAlt}`}>
          <div className={`${container} flex flex-col gap-10 py-24`}>
            <h2 className={heading}>Your clients are already losing visibility inside AI answers.</h2>
            <div className={`${subtext} flex max-w-xl flex-col gap-4`}>
              <p>Clients are starting to ask why ChatGPT recommends a competitor.</p>
              <p>Most agencies do not have a metric, a report, or a defensible answer.</p>
              <p>
                Search used to rank pages.
                <br />
                AI now chooses answers.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <ProofCardInclusion />
              <ProofCardRecommendation />
              <ProofCardReporting />
            </div>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionRule} ${pageBg}`} id="product">
          <div className={`${container} flex flex-col gap-10 py-24`}>
            <h2 className={heading}>Show clients where they are winning, losing, and getting displaced.</h2>
            <p className={subtext}>
              VRTL Score turns AI visibility into a client-ready report with model breakdowns, competitor pressure, and prioritized actions.
            </p>
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <ReportPageCard title="Page 1" caption="Send this to clients">
                <div className="flex items-end gap-3">
                  <span className="font-display text-3xl font-semibold tabular-nums">72</span>
                  <span className="text-xs text-zinc-500">Score</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-zinc-100">
                  <div className="h-full w-[72%] rounded-full bg-zinc-800" />
                </div>
              </ReportPageCard>
              <ReportPageCard title="Analysis" caption="Show where they&apos;re losing">
                <div className="space-y-2">
                  {["ChatGPT", "Gemini", "Claude"].map((m, i) => (
                    <div key={m} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium">{m}</span>
                      <div className="h-1.5 max-w-[100px] flex-1 rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-zinc-700" style={{ width: `${[88, 62, 45][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </ReportPageCard>
              <ReportPageCard title="Next steps" caption="Prove where competitors are winning">
                <ul className="space-y-2 text-xs text-zinc-700">
                  <li className="flex gap-2">
                    <span className="shrink-0 font-semibold text-emerald-600">High</span>
                    <span>Close the citation gap.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 font-semibold text-zinc-600">Med</span>
                    <span>Align proof with what models quote.</span>
                  </li>
                </ul>
              </ReportPageCard>
            </div>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionRule} ${sectionAlt}`} id="agencies">
          <div className={`${container} flex flex-col gap-10 py-24`}>
            <h2 className={heading}>Turn AI visibility into a new revenue stream.</h2>
            <p className={subtext}>
              Package AI visibility into a deliverable you price, repeat, and renew on—not another internal dashboard only your team sees.
            </p>
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {[
                {
                  t: "Add a new line item",
                  b: "Give clients a clear AI visibility report they understand and expect.",
                },
                {
                  t: "Increase retainers",
                  b: "Expand scope with measurable AI performance and reporting.",
                },
                {
                  t: "Defend client relationships",
                  b: "Answer the question clients are already asking: “Why is AI recommending someone else?”",
                },
              ].map((c) => (
                <div key={c.t} className={cardShell}>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-white">{c.t}</h3>
                  <p className="mt-4 text-base leading-relaxed text-white/55">{c.b}</p>
                </div>
              ))}
            </div>
            <blockquote className={`${cardShell} border-l-2 border-l-emerald-500/50 text-base leading-relaxed text-white/55`}>
              We ran this for a client and immediately saw where they were losing visibility in AI answers.
            </blockquote>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionRule} ${pageBg}`} id="category">
          <div className={`${container} flex flex-col gap-10 py-24`}>
            <h2 className={heading}>Search ranked pages. AI ranks answers.</h2>
            <p className={subtext}>
              Answer-engine visibility (sometimes called AEO or GEO) is simply: do models mention you, where, and as a source?
            </p>
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {[
                { t: "Presence", b: "Are you mentioned at all?" },
                { t: "Position", b: "Are you near the top or missing from the answer?" },
                { t: "Authority", b: "Are you being cited as a trusted source?" },
              ].map((c) => (
                <div key={c.t} className={cardShell}>
                  <h3 className={label}>{c.t}</h3>
                  <p className="mt-4 text-base leading-relaxed text-white/55">{c.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${sectionRule} ${sectionAlt}`}>
          <div className={`${container} flex flex-col items-center gap-8 py-24 text-center`}>
            <p className="max-w-2xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              If you can&apos;t measure AI visibility, you can&apos;t sell it.
              <span className="mt-4 block text-lg font-normal text-white/45">If you can&apos;t sell it, you lose the client.</span>
            </p>
            <div className="flex w-full max-w-md flex-col items-center gap-3">
              <Link
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition hover:bg-emerald-400 sm:w-auto"
                href={SIGNUP_HREF}
              >
                Run a free snapshot
              </Link>
              <p className={subtext}>Generate a client-ready report in minutes.</p>
            </div>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionRule} ${pageBg}`} id="faq">
          <div className={`${container} flex flex-col gap-10 py-24`}>
            <div className="flex flex-col items-center gap-6 text-center">
              <h2 className={heading}>Questions agencies ask before they run a snapshot</h2>
              <p className={subtext}>
                Straight answers on what VRTL Score measures, how reports work, and what you can charge for.
              </p>
            </div>
            <div className="mx-auto w-full max-w-2xl">
              <FAQItem
                answer="AI visibility is how often and how prominently a brand appears when someone asks ChatGPT, Claude, Gemini, or other AI answer engines for a recommendation. It's the new version of 'do we rank on page one?'"
                question="What is AI visibility?"
              />
              <FAQItem
                answer="We run standardized discovery scenarios across multiple AI models, analyze where and how your client is mentioned, then produce a composite visibility score based on mention rate, positioning, and citation quality. Every data point is preserved as evidence."
                question="How does VRTL Score measure it?"
              />
              <FAQItem
                answer="Currently ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google), with Perplexity and others being added. We expand coverage as new AI answer engines gain user share."
                question="What AI models do you track?"
              />
              <FAQItem
                answer="The score combines three dimensions: how often your client is mentioned (mention rate), where they appear in the response (top, middle, or bottom), and whether they're cited with sources. Results are normalized across models into a single executive-ready number."
                question="How is the score calculated?"
              />
              <FAQItem
                answer="Yes. PDF reports include your agency logo and branding. They're designed to be handed directly to clients as a professional deliverable, supporting renewals, upsells, and new business pitches."
                question="Can I white-label the reports?"
              />
              <FAQItem
                answer="Yes. Start with a 7-day free trial. Run snapshots on real clients and see the platform in action before committing."
                question="Is there a free trial?"
              />
            </div>
          </div>
        </section>

        <section className={`${sectionRule} ${sectionAlt}`}>
          <div className={`${container} flex flex-col items-center gap-8 py-24 text-center`}>
            <h2 className={`max-w-xl ${heading}`}>Start with one client. See what AI is already saying.</h2>
            <p className={subtext}>Run a free snapshot and generate a report your team can actually use.</p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition hover:bg-emerald-400"
                href={SIGNUP_HREF}
              >
                Run a free snapshot
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.12] px-8 text-sm font-medium text-white/90 transition hover:border-white/20 hover:bg-white/[0.04]"
                href={SAMPLE_REPORT_HREF}
              >
                View sample report
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
