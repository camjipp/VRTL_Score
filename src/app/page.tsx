"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";

import { Footer } from "@/components/Footer";

const SAMPLE_REPORT_HREF = "/preview";
const SIGNUP_HREF = "/signup";

const pageBg = "bg-[#080808]";
const surface = "bg-[#0c0c0c]";
const surfaceCard = "bg-[#111111]";
const borderSubtle = "border-white/[0.06]";
const container = "mx-auto w-full max-w-6xl px-6";

/** Editorial display — large, light weight */
const displayHero =
  "font-display text-[2.5rem] font-light leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl md:text-[3.25rem] lg:text-[3.5rem]";
const displaySection =
  "font-display text-[2rem] font-light leading-[1.12] tracking-[-0.025em] text-white sm:text-4xl md:text-[2.75rem]";
const subhead = "text-lg leading-relaxed text-white/50 md:text-xl";
const kicker = "text-[11px] font-medium uppercase tracking-[0.18em] text-white/40";
const labelMuted = "text-[11px] font-medium tracking-wide text-white/45";

const sectionDivider = `border-t ${borderSubtle}`;

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border-b ${borderSubtle}`}>
      <button
        className="flex w-full items-center justify-between gap-4 py-6 text-left transition-colors hover:bg-white/[0.02]"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="text-base font-medium tracking-tight text-white md:text-[17px]">{question}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-white/35 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="max-w-2xl text-[15px] leading-relaxed text-white/50">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function ModelRow() {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-t ${borderSubtle} pt-10 ${kicker}`}>
      <span>ChatGPT</span>
      <span className="text-white/15">·</span>
      <span>Gemini</span>
      <span className="text-white/15">·</span>
      <span>Claude</span>
    </div>
  );
}

/** Hero: stacked report pages — primary proof asset, no app chrome */
function HeroReportStack() {
  return (
    <div className="relative mx-auto w-full max-w-[380px] lg:mx-0 lg:max-w-[420px]">
      <div className="absolute -right-2 top-6 z-0 hidden h-[min(340px,70vh)] w-[88%] rounded-xl border border-zinc-300/50 bg-zinc-100 md:block" aria-hidden />
      <div className="relative z-10 rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-3 border-b border-zinc-200 pb-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">VRTL Score</p>
            <p className="mt-1.5 text-[15px] font-semibold text-zinc-900">Executive snapshot</p>
          </div>
          <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-zinc-600">
            PDF
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">Overall</p>
            <p className="mt-1 font-display text-5xl font-light tabular-nums tracking-tight text-zinc-900 sm:text-6xl">78</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-800">
              Win · 3 models
            </span>
            <span className="rounded border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-900">
              At risk · 2
            </span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-5">
          {[
            { l: "Presence", v: "Strong" },
            { l: "Position", v: "Mixed" },
            { l: "Authority", v: "Low" },
          ].map((k) => (
            <div key={k.l} className="rounded-md border border-zinc-100 bg-zinc-50/90 px-2 py-2.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-zinc-500">{k.l}</p>
              <p className="mt-1 text-xs font-semibold text-zinc-900">{k.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-[10px] text-zinc-400">Client-facing report · ready to send</p>
      </div>
    </div>
  );
}

function ProblemCard({
  kickerText,
  title,
  children,
}: {
  kickerText: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <article className={`flex flex-col rounded-lg border ${borderSubtle} ${surfaceCard} p-6 md:p-7`}>
      <p className={kicker}>{kickerText}</p>
      <h3 className="mt-3 font-display text-lg font-medium tracking-tight text-white">{title}</h3>
      <div className="mt-5 flex-1">{children}</div>
    </article>
  );
}

function ProofInclusion() {
  return (
    <ProblemCard kickerText="Inclusion" title="Named in the answer">
      <div className={`rounded-md ${surface} p-4`}>
        <p className="text-[13px] leading-relaxed text-white/70">
          For payroll at 50–500 employees, teams compare{" "}
          <mark className="rounded bg-emerald-500/20 px-1 py-0.5 font-medium text-emerald-200 [text-decoration:none]">
            Acme Payroll
          </mark>{" "}
          with Gusto and Rippling.
        </p>
        <span className="mt-3 inline-flex rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
          Mentioned
        </span>
      </div>
    </ProblemCard>
  );
}

function ProofRecommendation() {
  const rows: Array<{
    rank: number;
    name: string;
    on: boolean;
    dim?: boolean;
    pill?: string;
  }> = [
    { rank: 1, name: "Sterling Health", on: true, pill: "Recommended" },
    { rank: 2, name: "Vantage Care", on: false, dim: false },
    { rank: 3, name: "Your client", on: false, dim: true },
  ];

  return (
    <ProblemCard kickerText="Recommendation" title="Who AI puts first">
      <div className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div
            key={row.rank}
            className={
              row.on
                ? "flex items-center justify-between gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-2.5"
                : row.dim === true
                  ? "flex items-center justify-between gap-2 rounded-md px-3 py-2 opacity-50"
                  : `flex items-center justify-between gap-2 rounded-md border ${borderSubtle} bg-white/[0.03] px-3 py-2`
            }
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-semibold tabular-nums text-white/80">
                {row.rank}
              </span>
              <span className={`truncate text-[13px] ${row.dim === true ? "text-white/40" : "text-white/85"}`}>{row.name}</span>
            </div>
            {row.pill ? (
              <span className="shrink-0 rounded bg-emerald-500 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-black">
                {row.pill}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </ProblemCard>
  );
}

function ProofReportMini() {
  return (
    <ProblemCard kickerText="Reporting" title="What you invoice for">
      <div className="overflow-hidden rounded-md border border-zinc-200/90 bg-white p-4 text-zinc-900">
        <div className="flex justify-between border-b border-zinc-100 pb-3">
          <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">VRTL Score</span>
          <span className="text-[8px] font-semibold uppercase text-zinc-500">PDF</span>
        </div>
        <p className="mt-3 font-display text-2xl font-light tabular-nums">72</p>
        <div className="mt-2 h-1 w-full rounded-full bg-zinc-100">
          <div className="h-full w-[72%] rounded-full bg-zinc-800" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 text-center">
          {[
            { k: "Mention", v: "68%" },
            { k: "Top 3", v: "41%" },
            { k: "Models", v: "3" },
          ].map((x) => (
            <div key={x.k} className="rounded border border-zinc-100 bg-zinc-50 py-1.5">
              <p className="text-[7px] font-medium uppercase tracking-wide text-zinc-500">{x.k}</p>
              <p className="text-[11px] font-semibold tabular-nums">{x.v}</p>
            </div>
          ))}
        </div>
      </div>
    </ProblemCard>
  );
}

function ReportArtifact({
  pageLabel,
  caption,
  children,
}: {
  pageLabel: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border border-zinc-200/90 bg-white shadow-xl">
        <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">{pageLabel}</p>
        </div>
        <div className="p-5 text-zinc-900">{children}</div>
      </div>
      <p className="text-center text-[12px] text-white/40">{caption}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className={`min-h-screen ${pageBg} text-zinc-100 selection:bg-emerald-500/20 selection:text-emerald-50`}>
      <main>
        {/* 1 — Hero */}
        <section className={`border-b ${borderSubtle}`}>
          <div className={`${container} py-24 md:py-32`}>
            <div className="flex flex-col gap-16 lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
              <div className="flex max-w-xl flex-col gap-8">
                <h1 className={displayHero}>
                  Your clients are already being ranked by AI.
                  <span className="mt-3 block text-white/50">You&apos;re not reporting on it.</span>
                </h1>
                <p className={subhead}>
                  VRTL Score shows how ChatGPT, Gemini, and Claude rank, mention, and recommend your clients — and gives you
                  a report you can actually send.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition hover:bg-emerald-400"
                    href={SIGNUP_HREF}
                  >
                    Run a free snapshot
                  </Link>
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.1] px-8 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.04]"
                    href={SAMPLE_REPORT_HREF}
                  >
                    View sample report
                  </Link>
                </div>
                <ModelRow />
              </div>
              <HeroReportStack />
            </div>
          </div>
        </section>

        {/* 2 — Problem */}
        <section className={`${sectionDivider} ${surface}`}>
          <div className={`${container} flex flex-col gap-12 py-24 md:py-28`}>
            <div className="max-w-2xl">
              <h2 className={displaySection}>Your clients are already losing visibility inside AI answers.</h2>
              <p className={`mt-6 ${subhead} max-w-xl !text-base md:!text-lg`}>
                Clients are starting to ask why ChatGPT recommends a competitor. Most agencies do not have a metric, a report,
                or a defensible answer. Search used to rank pages — AI now chooses answers.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              <ProofInclusion />
              <ProofRecommendation />
              <ProofReportMini />
            </div>
          </div>
        </section>

        {/* 3 — Product proof */}
        <section className={`scroll-mt-20 ${sectionDivider} ${pageBg}`} id="product">
          <div className={`${container} flex flex-col gap-12 py-24 md:py-28`}>
            <div className="max-w-2xl">
              <h2 className={displaySection}>Show clients where they are winning, losing, and getting displaced.</h2>
              <p className={`mt-6 ${subhead} max-w-xl`}>
                VRTL Score turns AI visibility into a client-ready report with model breakdowns, competitor pressure, and
                prioritized actions.
              </p>
            </div>
            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              <ReportArtifact caption="Executive summary — one screen they understand" pageLabel="Page 1">
                <div className="flex items-end gap-3">
                  <span className="font-display text-4xl font-light tabular-nums">72</span>
                  <span className="text-sm text-zinc-500">Visibility score</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-zinc-100">
                  <div className="h-full w-[72%] rounded-full bg-zinc-800" />
                </div>
              </ReportArtifact>
              <ReportArtifact caption="Model breakdown — where each engine puts them" pageLabel="Analysis">
                <div className="space-y-3">
                  {["ChatGPT", "Gemini", "Claude"].map((m, i) => (
                    <div key={m} className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-medium text-zinc-800">{m}</span>
                      <div className="h-1.5 max-w-[120px] flex-1 rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-zinc-700" style={{ width: `${[88, 62, 45][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </ReportArtifact>
              <ReportArtifact caption="Recommended actions — prioritized next steps" pageLabel="Next steps">
                <ul className="space-y-3 text-sm text-zinc-700">
                  <li className="flex gap-2">
                    <span className="shrink-0 font-semibold text-emerald-600">High</span>
                    <span>Close the citation gap on key topics.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 font-medium text-zinc-500">Med</span>
                    <span>Align on-page proof with what models quote.</span>
                  </li>
                </ul>
              </ReportArtifact>
            </div>
          </div>
        </section>

        {/* 4 — Billable / revenue */}
        <section className={`scroll-mt-20 ${sectionDivider} ${surface}`} id="agencies">
          <div className={`${container} py-24 md:py-28`}>
            <div className="flex flex-col gap-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-20">
              <div className="flex max-w-lg flex-col gap-8">
                <p className={kicker}>For agencies</p>
                <h2 className={displaySection}>Turn AI visibility into a new revenue stream.</h2>
                <p className={`${subhead} !text-base`}>
                  Package AI visibility into a deliverable you price, repeat, and renew on — not another internal dashboard
                  only your team sees.
                </p>
                <div>
                  <p className="font-display text-2xl font-light text-white md:text-3xl">$2K–$10K/mo service layer</p>
                  <p className="mt-2 text-sm text-white/40">Agencies are already packaging this into retainers.</p>
                </div>
                <figure className={`mt-6 flex flex-col gap-5 border-t ${borderSubtle} pt-10`}>
                  <blockquote className="text-xl font-light leading-snug text-white/90 md:text-2xl">
                    We ran this for a client and immediately saw where they were losing visibility in AI answers.
                  </blockquote>
                  <figcaption className="text-sm text-white/40">Principal, search-focused agency</figcaption>
                </figure>
              </div>
              <div className="flex flex-col divide-y divide-white/[0.06]">
                <div className="pb-8">
                  <h3 className="font-display text-xl font-medium text-white md:text-2xl">Add a new line item</h3>
                </div>
                <div className="py-8">
                  <h3 className="font-display text-lg font-medium text-white">Increase retainers</h3>
                </div>
                <div className="pt-8">
                  <h3 className="font-display text-lg font-medium text-white">Defend client relationships</h3>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 — Framework */}
        <section className={`scroll-mt-20 ${sectionDivider} ${pageBg}`} id="category">
          <div className={`${container} flex flex-col gap-12 py-24 md:py-28`}>
            <div className="max-w-2xl">
              <h2 className={displaySection}>Search ranked pages. AI ranks answers.</h2>
              <p className={`mt-6 ${subhead} max-w-xl`}>
                Answer-engine visibility (sometimes called AEO or GEO) is simply: do models mention you, where, and as a source?
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.06] md:grid-cols-3">
              {[
                { t: "Presence", b: "Are you mentioned at all?" },
                { t: "Position", b: "Are you near the top or missing from the answer?" },
                { t: "Authority", b: "Are you being cited as a trusted source?" },
              ].map((c) => (
                <div key={c.t} className={`${surfaceCard} p-8`}>
                  <p className={kicker}>{c.t}</p>
                  <p className="mt-4 text-base leading-relaxed text-white/55">{c.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 — Breakout */}
        <section className={`${sectionDivider} ${surface}`}>
          <div className={`${container} flex flex-col items-center gap-10 py-24 text-center md:py-32`}>
            <blockquote className="max-w-3xl font-display text-3xl font-light leading-[1.2] tracking-[-0.02em] text-white md:text-4xl lg:text-[2.75rem]">
              If you can&apos;t measure AI visibility, you can&apos;t sell it.
              <span className="mt-5 block text-white/45">If you can&apos;t sell it, you lose the client.</span>
            </blockquote>
            <div className="flex flex-col items-center gap-4">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-10 text-sm font-semibold text-black transition hover:bg-emerald-400"
                href={SIGNUP_HREF}
              >
                Run a free snapshot
              </Link>
              <p className={labelMuted}>Generate a client-ready report in minutes.</p>
            </div>
          </div>
        </section>

        {/* 7 — FAQ */}
        <section className={`scroll-mt-20 ${sectionDivider} ${pageBg}`} id="faq">
          <div className={`${container} flex flex-col gap-12 py-24 md:py-28`}>
            <div className="mx-auto max-w-2xl text-center">
              <p className={kicker}>FAQ</p>
              <h2 className={`mt-4 ${displaySection}`}>Questions agencies ask before they run a snapshot</h2>
              <p className={`mt-5 ${subhead} mx-auto max-w-lg !text-base`}>
                Straight answers on what VRTL Score measures, how reports work, and what you can charge for.
              </p>
            </div>
            <div className={`mx-auto w-full max-w-2xl border-t ${borderSubtle}`}>
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

        {/* 8 — Final CTA */}
        <section className={`${sectionDivider} ${surface}`}>
          <div className={`${container} flex flex-col items-center gap-8 py-24 text-center md:py-28`}>
            <h2 className={`max-w-xl ${displaySection}`}>Start with one client. See what AI is already saying.</h2>
            <p className={`${subhead} max-w-md !text-base`}>Run a free snapshot and generate a report your team can actually use.</p>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition hover:bg-emerald-400"
                href={SIGNUP_HREF}
              >
                Run a free snapshot
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/[0.1] px-8 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/[0.04]"
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
