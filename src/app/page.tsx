"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";

import { Footer } from "@/components/Footer";

const SAMPLE_REPORT_HREF = "/preview";
const SIGNUP_HREF = "/signup";

/** Unified homepage layout — max-w-6xl, horizontal padding only (vertical is py-24 on section). */
const container = "mx-auto w-full max-w-6xl px-6";

const heading = "font-display text-4xl font-semibold tracking-tight text-white md:text-5xl";

const subtext = "text-lg text-white/60 max-w-xl";

const label = "text-xs uppercase tracking-wide text-white/40";

/** Single card system — no variants. */
const card = "rounded-2xl border border-white/5 bg-[#0F1117] p-6";

const sectionBorder = "border-t border-white/5";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/5">
      <button
        className="flex w-full items-center justify-between py-5 text-left transition-colors duration-150 hover:bg-white/[0.03]"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="text-lg font-semibold tracking-tight text-white">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-white/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
          <p className="text-base leading-relaxed text-white/60">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function ModelRow() {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-8 ${label} font-semibold tracking-[0.2em]`}>
      <span>ChatGPT</span>
      <span className="text-white/25" aria-hidden>
        ·
      </span>
      <span>Gemini</span>
      <span className="text-white/25" aria-hidden>
        ·
      </span>
      <span>Claude</span>
    </div>
  );
}

function HeroReportMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-gradient-to-b from-emerald-500/[0.12] via-emerald-500/[0.04] to-transparent blur-3xl md:-inset-14"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(420px,85%)] w-[min(520px,120%)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.14)_0%,transparent_58%)]"
      />
      <div className="relative">
        <div className="absolute left-6 right-6 top-6 hidden h-[min(380px,52vw)] rounded-md border border-zinc-300/80 bg-zinc-100 shadow-lg md:block md:translate-y-3 md:rotate-[-2deg]" />
        <div className="absolute left-3 right-3 top-3 hidden h-[min(400px,54vw)] rounded-md border border-zinc-200 bg-white shadow-xl md:block md:translate-y-1 md:rotate-[1.2deg]" />

        <div className="relative rounded-lg border border-zinc-200/90 bg-white p-5 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.5)] sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">VRTL Score</p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">Executive snapshot</p>
            </div>
            <div className="rounded-md bg-zinc-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">PDF</div>
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Overall</p>
              <p className="mt-0.5 font-display text-4xl font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-5xl">78</p>
            </div>
            <div className="flex flex-1 flex-wrap gap-3 text-[11px] text-zinc-600">
              <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-1 font-medium text-zinc-800">Win · 3 models</span>
              <span className="rounded border border-amber-200/80 bg-amber-50 px-2 py-1 font-medium text-amber-900">At risk · 2</span>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-5">
            {[
              { l: "Presence", v: "Strong" },
              { l: "Position", v: "Mixed" },
              { l: "Authority", v: "Low" },
            ].map((k) => (
              <div key={k.l} className="rounded border border-zinc-100 bg-zinc-50/80 px-2 py-2">
                <p className="text-[9px] font-medium uppercase tracking-wide text-zinc-500">{k.l}</p>
                <p className="mt-0.5 text-xs font-semibold text-zinc-900">{k.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
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
      <div className={card}>
        <p className={label}>{title}</p>
        <div className="mt-4 rounded-lg border border-zinc-200/80 bg-white p-4 text-zinc-900 shadow-inner">{children}</div>
      </div>
      <p className={`text-center ${label}`}>{caption}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-emerald-500/25 selection:text-emerald-50">
      <main>
        <section className="relative overflow-hidden border-b border-white/5 bg-black">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
          <div className={`${container} relative py-24`}>
            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
              <div className="flex flex-col gap-8">
                <h1 className={heading}>
                  Your clients are already being ranked by AI.
                  <span className="mt-2 block text-white/60">You&apos;re not reporting on it.</span>
                </h1>
                <p className={subtext}>
                  VRTL Score shows how ChatGPT, Gemini, and Claude rank, mention, and recommend your clients — and gives you a report you can actually send.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition duration-200 hover:bg-emerald-400 hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.45)]"
                    href={SIGNUP_HREF}
                  >
                    Run a free snapshot
                  </Link>
                  <Link
                    className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 px-8 text-sm font-medium text-white/90 transition duration-200 hover:border-white/20 hover:bg-white/[0.04]"
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

        <section className={`${sectionBorder} bg-[#0B0D12]`}>
          <div className={`${container} flex flex-col gap-8 py-24`}>
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
            <div className="grid gap-8 md:grid-cols-3">
              {[
                "No clear AI visibility metric",
                "No report clients can understand",
                "No way to sell AI visibility as a service",
              ].map((t) => (
                <div key={t} className={`${card} text-sm font-medium leading-snug text-white/70`}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionBorder} bg-black`} id="product">
          <div className={`${container} flex flex-col gap-8 py-24`}>
            <h2 className={heading}>Show clients where they are winning, losing, and getting displaced.</h2>
            <p className={subtext}>
              VRTL Score turns AI visibility into a client-ready report with model breakdowns, competitor pressure, and prioritized actions.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              <ReportPageCard title="Page 1" caption="Send this to clients">
                <div className="flex items-end gap-4">
                  <span className="font-display text-3xl font-semibold tabular-nums text-zinc-900">72</span>
                  <span className="text-xs text-zinc-500">score · snapshot</span>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-zinc-100">
                  <div className="h-full w-[72%] rounded-full bg-zinc-800" />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-zinc-600">One screen your client can grasp in a meeting.</p>
              </ReportPageCard>
              <ReportPageCard title="Analysis" caption="Show where they&apos;re losing">
                <div className="space-y-2">
                  {["ChatGPT", "Gemini", "Claude"].map((m, i) => (
                    <div key={m} className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-zinc-800">{m}</span>
                      <div className="h-1.5 max-w-[120px] flex-1 rounded-full bg-zinc-100">
                        <div className="h-full rounded-full bg-zinc-700" style={{ width: `${[88, 62, 45][i]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-zinc-600">Where each model puts them — and who it prefers instead.</p>
              </ReportPageCard>
              <ReportPageCard title="Next steps" caption="Prove where competitors are winning">
                <ul className="space-y-2 text-xs text-zinc-700">
                  <li className="flex gap-2">
                    <span className="shrink-0 font-semibold text-emerald-700">HIGH</span>
                    <span>Close the citation gap on X.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 font-semibold text-amber-700">MED</span>
                    <span>Align on-page proof with what models quote.</span>
                  </li>
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-zinc-600">Prioritized so your team can execute, not debate.</p>
              </ReportPageCard>
            </div>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionBorder} bg-[#0B0D12]`} id="agencies">
          <div className={`${container} flex flex-col gap-8 py-24`}>
            <h2 className={heading}>Turn AI visibility into a new revenue stream.</h2>
            <p className={subtext}>
              Package AI visibility into a deliverable you price, repeat, and renew on—not another internal dashboard only your team sees.
            </p>
            <div className="grid gap-8 md:grid-cols-3">
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
                <div key={c.t} className={card}>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-white">{c.t}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-white/60">{c.b}</p>
                </div>
              ))}
            </div>
            <blockquote className={`${card} text-lg leading-relaxed text-white/60`}>
              We ran this for a client and immediately saw where they were losing visibility in AI answers.
            </blockquote>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionBorder} bg-black`} id="category">
          <div className={`${container} flex flex-col gap-8 py-24`}>
            <h2 className={heading}>Search ranked pages. AI ranks answers.</h2>
            <p className={subtext}>
              Answer-engine visibility (sometimes called AEO or GEO) is simply: do models mention you, where, and as a source?
            </p>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { t: "Presence", b: "Are you mentioned at all?" },
                { t: "Position", b: "Are you near the top or missing from the answer?" },
                { t: "Authority", b: "Are you being cited as a trusted source?" },
              ].map((c) => (
                <div key={c.t} className={card}>
                  <h3 className={`${label} font-semibold`}>{c.t}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-white/60">{c.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`relative overflow-hidden ${sectionBorder} bg-[#0B0D12]`}>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(255,255,255,0.06),transparent_70%)]" />
          <div className={`${container} relative z-[1] flex flex-col items-center gap-8 py-24 text-center`}>
            <p className="max-w-xl font-display text-4xl font-semibold tracking-tight text-white md:text-5xl">
              <span className="bg-gradient-to-b from-white via-white to-zinc-400 bg-clip-text text-transparent">
                If you can&apos;t measure AI visibility, you can&apos;t sell it.
              </span>
              <span className="mt-4 block text-lg text-white/60">If you can&apos;t sell it, you lose the client.</span>
            </p>
            <div className="flex w-full max-w-xl flex-col items-center gap-3">
              <Link
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition duration-200 hover:bg-emerald-400 hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.45)] sm:w-auto"
                href={SIGNUP_HREF}
              >
                Run a free snapshot
              </Link>
              <p className={subtext}>Generate a client-ready report in minutes.</p>
            </div>
          </div>
        </section>

        <section className={`scroll-mt-24 ${sectionBorder} bg-black`} id="faq">
          <div className={`${container} flex flex-col gap-8 py-24`}>
            <div className="flex flex-col items-center gap-8 text-center">
              <h2 className={heading}>Questions agencies ask before they run a snapshot</h2>
              <p className={subtext}>
                Straight answers on what VRTL Score measures, how reports work, and what you can charge for.
              </p>
            </div>
            <div className="overflow-hidden py-2">
              <div className="flex animate-marquee whitespace-nowrap">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="mx-8 text-5xl font-black text-white/10 md:text-6xl lg:text-7xl">
                    FAQ
                  </span>
                ))}
              </div>
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

        <section className={`${sectionBorder} bg-[#0B0D12]`}>
          <div className={`${container} flex flex-col items-center gap-8 py-24 text-center`}>
            <h2 className={`max-w-xl ${heading}`}>Start with one client. See what AI is already saying.</h2>
            <p className={subtext}>
              Run a free snapshot and generate a report your team can actually use.
            </p>
            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-emerald-500 px-8 text-sm font-semibold text-black transition duration-200 hover:bg-emerald-400 hover:shadow-[0_12px_40px_-8px_rgba(16,185,129,0.45)]"
                href={SIGNUP_HREF}
              >
                Run a free snapshot
              </Link>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 px-8 text-sm font-medium text-white/90 transition duration-200 hover:border-white/20 hover:bg-white/[0.04]"
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
