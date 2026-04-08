"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";

import { AnimateIn } from "@/components/AnimateIn";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/SectionLabel";

const SAMPLE_REPORT_HREF = "/preview";
const SIGNUP_HREF = "/signup";

const shell = "mx-auto w-full max-w-[1200px] px-6 md:px-12";

const MODEL_PILLS: Array<{ name: string; iconSrc: string }> = [
  {
    name: "ChatGPT",
    iconSrc: "https://cdn.brandfetch.io/idR3duQxYl/w/400/h/400/theme/dark/icon.png",
  },
  {
    name: "Gemini",
    iconSrc: "https://cdn.brandfetch.io/id9IRGFoS-/theme/dark/icon.png",
  },
  {
    name: "Claude",
    iconSrc: "https://cdn.brandfetch.io/anthropic.com/w/400/h/400/theme/dark/icon.png",
  },
  { name: "Perplexity", iconSrc: "/ai/perplexity.svg" },
];

function ModelPill({ name, iconSrc }: { name: string; iconSrc: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1">
      {/* eslint-disable-next-line @next/next/no-img-element -- Brandfetch / SVG favicons; avoids optimizer referer issues */}
      <img alt="" className="h-4 w-4 shrink-0 object-contain" height={16} src={iconSrc} width={16} />
      <span className="font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">{name}</span>
    </span>
  );
}

const paper =
  "border border-[#d4d4d4] bg-[#fafafa] text-[#111] shadow-[0_24px_56px_rgba(0,0,0,0.42),0_4px_14px_rgba(0,0,0,0.1)] rounded-[2px]";

function HeroReportStack() {
  return (
    <div className="group/stack relative z-10 flex w-full flex-col items-center lg:items-end lg:overflow-visible lg:pr-0">
      <p className="mb-3 font-marketing-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] lg:mr-6 lg:text-right">
        What you send to clients
      </p>

      <div className="animate-hero-report-float relative w-[min(100%,300px)] origin-center scale-[0.9] pb-16 pt-1 sm:w-[min(100%,340px)] sm:scale-[0.94] lg:ml-auto lg:mr-[-28px] lg:w-[440px] lg:origin-top-right lg:scale-[1.14]">
        {/* Page 3 — Recommendations (furthest back) — desktop only */}
        <div
          className={`${paper} absolute left-0 top-1 hidden min-h-[420px] w-full max-w-[380px] p-3.5 opacity-[0.97] lg:block lg:max-w-none`}
          style={{ transform: "translate(-7%, 9%) rotate(-3.8deg) scale(0.91)", zIndex: 0 }}
          aria-hidden
        >
          <p className="font-marketing-mono text-[8px] uppercase tracking-[0.18em] text-[#737373]">Recommendations</p>
          <p className="mt-1 font-marketing-mono text-[7px] uppercase tracking-wider text-[#a3a3a3]">Acme Corp · priority actions</p>
          <div className="mt-3 space-y-2 border-t border-[#e5e5e5] pt-2.5">
            <div className="border-b border-[#eee] pb-2">
              <span className="font-marketing-mono text-[8px] font-medium text-[#c53030]">HIGH</span>
              <p className="mt-0.5 text-[10px] font-medium leading-snug text-[#262626]">Close authority gap</p>
              <p className="mt-0.5 text-[9px] leading-[1.45] text-[#525252]">
                Citations at 0%. Publish proof-backed pages models can quote.
              </p>
            </div>
            <div className="border-b border-[#eee] pb-2">
              <span className="font-marketing-mono text-[8px] font-medium text-[#c53030]">HIGH</span>
              <p className="mt-0.5 text-[10px] font-medium leading-snug text-[#262626]">Counter competitor mentions</p>
              <p className="mt-0.5 text-[9px] leading-[1.45] text-[#525252]">
                Owala tied on mentions. Differentiate on category proof and comparisons.
              </p>
            </div>
            <div>
              <span className="font-marketing-mono text-[8px] font-medium text-[#b45309]">MED</span>
              <p className="mt-0.5 text-[10px] font-medium leading-snug text-[#262626]">Increase citations</p>
              <p className="mt-0.5 text-[9px] leading-[1.45] text-[#525252]">Trade press, reviews, and third-party references.</p>
            </div>
          </div>
          <p className="absolute bottom-3 right-3 font-marketing-mono text-[7px] text-[#bdbdbd]">3</p>
        </div>

        {/* Page 2 — Model breakdown (middle) — desktop only */}
        <div
          className={`${paper} absolute left-0 top-0.5 hidden min-h-[420px] w-full max-w-[380px] p-3.5 lg:block lg:max-w-none`}
          style={{ transform: "translate(-3%, 5%) rotate(-2deg) scale(0.95)", zIndex: 1 }}
          aria-hidden
        >
          <p className="font-marketing-mono text-[8px] uppercase tracking-[0.18em] text-[#737373]">Model analysis</p>
          <p className="mt-1 font-marketing-mono text-[7px] uppercase tracking-wider text-[#a3a3a3]">Scores by engine · vs portfolio avg</p>
          <div className="mt-3 space-y-2.5 border-t border-[#e5e5e5] pt-2.5">
            {[
              { label: "OPENAI", pct: 90, vs: "+38 vs avg", tone: "high" as const },
              { label: "GEMINI", pct: 39, vs: "-13 vs avg", tone: "mid" as const },
              { label: "ANTHROPIC", pct: 26, vs: "-26 vs avg", tone: "low" as const },
            ].map((row) => (
              <div key={row.label} className="border-b border-[#eee] pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-marketing-mono text-[8px] uppercase tracking-[0.12em] text-[#525252]">{row.label}</span>
                  <span
                    className={`font-marketing-mono text-[8px] ${
                      row.tone === "high" ? "text-[#00e87a]" : row.tone === "mid" ? "text-[#737373]" : "text-[#a3a3a3]"
                    }`}
                  >
                    {row.vs}
                  </span>
                </div>
                <div className="mt-1.5 h-[3px] w-full bg-[#e5e5e5]">
                  <div
                    className="h-full bg-[#171717]"
                    style={{
                      width: `${row.pct}%`,
                      opacity: row.tone === "high" ? 1 : row.tone === "mid" ? 0.75 : 0.5,
                    }}
                  />
                </div>
                <p className="mt-1 font-marketing-mono text-[9px] tabular-nums text-[#404040]">{row.pct}/100</p>
              </div>
            ))}
          </div>
          <p className="absolute bottom-3 right-3 font-marketing-mono text-[7px] text-[#bdbdbd]">2</p>
        </div>

        {/* Page 1 — Executive summary (front) */}
        <div
          className={`${paper} relative z-[2] mx-auto min-h-[400px] w-full max-w-[300px] p-3.5 transition-shadow duration-500 ease-out sm:max-w-[340px] group-hover/stack:shadow-[0_32px_80px_rgba(0,0,0,0.5),0_10px_28px_rgba(0,0,0,0.12)] lg:mx-0 lg:ml-auto lg:min-h-[420px] lg:max-w-none`}
          style={{ transform: "translate(5%, 0) rotate(1.8deg)" }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-[#e0e0e0] pb-2">
            <div className="min-w-0">
              <p className="font-marketing-mono text-[8px] uppercase tracking-[0.16em] text-[#737373]">AI Authority Report</p>
              <p className="mt-1 text-[13px] font-semibold leading-tight text-[#0a0a0a]">Executive summary</p>
            </div>
            <span className="shrink-0 border border-[#d4d4d4] bg-white px-1 py-0.5 font-marketing-mono text-[7px] uppercase tracking-wider text-[#737373]">
              PDF
            </span>
          </div>
          <p className="mt-2 text-[11px] font-medium text-[#404040]">Acme Corp</p>
          <p className="font-marketing-mono text-[8px] text-[#a3a3a3]">April 1, 2026</p>

          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-[#eee] pt-2.5">
            <span className="font-marketing-display text-[44px] font-normal leading-[0.95] tracking-tight text-[#0a0a0a] sm:text-[48px]">
              68
            </span>
            <div className="pb-0.5">
              <p className="font-marketing-mono text-[7px] uppercase tracking-[0.14em] text-[#a3a3a3]">AI Authority Score</p>
              <p className="font-marketing-mono text-[8px] text-[#737373]">/100</p>
            </div>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-1.5 border border-[#e8e8e8] bg-white p-2">
            {[
              { lab: "Mention rate", val: "62%" },
              { lab: "Top position", val: "60%" },
              { lab: "Authority", val: "0%" },
            ].map((m) => (
              <div key={m.lab} className="min-w-0 border-r border-[#f0f0f0] pr-1.5 last:border-r-0 last:pr-0">
                <p className="font-marketing-mono text-[6.5px] uppercase leading-tight tracking-[0.08em] text-[#a3a3a3]">
                  {m.lab}
                </p>
                <p
                  className={`mt-0.5 font-marketing-mono text-[14px] font-medium tabular-nums leading-none ${
                    m.lab === "Authority" ? "text-[#dc2626]" : "text-[#171717]"
                  }`}
                >
                  {m.val}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-2.5 font-marketing-mono text-[7px] uppercase tracking-[0.14em] text-[#a3a3a3]">
            Competitive ranking
          </p>
          <div className="mt-1 space-y-0.5 border border-[#e8e8e8] bg-white p-2 font-marketing-mono text-[9px]">
            <div className="flex justify-between gap-2 text-[#171717]">
              <span className="text-[#737373]">#1</span>
              <span className="min-w-0 flex-1 truncate font-medium">Client</span>
              <span className="shrink-0 text-[#00e87a]">You</span>
            </div>
            <div className="flex justify-between gap-2 text-[#404040]">
              <span className="text-[#a3a3a3]">#2</span>
              <span className="min-w-0 flex-1 truncate">Competitor A</span>
              <span className="shrink-0 text-[#737373]">18/30</span>
            </div>
            <div className="flex justify-between gap-2 text-[#525252]">
              <span className="text-[#a3a3a3]">#3</span>
              <span className="min-w-0 flex-1 truncate">Competitor B</span>
              <span className="shrink-0 text-[#737373]">17/30</span>
            </div>
          </div>

          <p className="mt-2 border-l-2 border-[#d4d4d4] pl-2 text-[9px] font-medium leading-snug text-[#525252]">
            Lead is thin. Competitors within range.
          </p>

          <p className="absolute bottom-2.5 right-3 font-marketing-mono text-[7px] text-[#bdbdbd]">
            1<span className="hidden lg:inline"> / 3</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function PresenceDotRow({ green, label }: { label: string; green: number }) {
  const total = 5;
  return (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-[10px] text-[#555]">{label}</span>
      <div className="flex gap-[3px]">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${i < green ? "bg-[#00e87a]" : "bg-[#333]"}`}
          />
        ))}
      </div>
    </div>
  );
}

function ProblemCard({
  index,
  title,
  body,
  delay,
}: {
  index: string;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <AnimateIn delay={delay}>
      <article className="group bg-[var(--bg-elevated)] px-7 py-8 md:px-8">
        <p className="font-marketing-mono text-[11px] text-[var(--text-muted)]">{index}</p>
        <h3 className="mt-2 text-lg font-medium text-[var(--text-primary)]">{title}</h3>
        <p className="mt-3 text-sm font-light leading-[1.7] text-[var(--text-secondary)]">{body}</p>
        <div className="mt-6 h-0.5 w-0 bg-[var(--accent-marketing)] transition-all duration-300 group-hover:w-6" />
      </article>
    </AnimateIn>
  );
}

const actionPillClass =
  "inline-flex h-5 shrink-0 items-center whitespace-nowrap rounded-full px-2 font-marketing-mono text-[10px] leading-none";

function ProductPreviewCard({
  label,
  caption,
  delay,
  children,
}: {
  label: string;
  caption: string;
  delay: number;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <AnimateIn className="flex min-h-0 flex-1 flex-col" delay={delay}>
        <div className="flex h-full min-h-[260px] flex-1 flex-col overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-mid)]">
          <p className="font-marketing-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
          <div className="mt-0 flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </AnimateIn>
      <p className="mt-3 text-center text-xs text-[var(--text-muted)]">{caption}</p>
    </div>
  );
}

const faqItems: Array<{ q: string; a: string }> = [
  {
    q: "What is AI visibility?",
    a: "AI visibility is how often and how prominently a brand appears when someone asks ChatGPT, Claude, Gemini, or other AI answer engines for a recommendation. It's the new version of 'do we rank on page one?'",
  },
  {
    q: "How does VRTL Score measure it?",
    a: "We run standardized discovery scenarios across multiple AI models, analyze where and how your client is mentioned, then produce a composite visibility score based on mention rate, positioning, and citation quality. Every data point is preserved as evidence.",
  },
  {
    q: "What AI models do you track?",
    a: "Currently ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), and Perplexity, with additional engines added as they gain user share.",
  },
  {
    q: "How is the score calculated?",
    a: "The score combines three dimensions: how often your client is mentioned (mention rate), where they appear in the response (top, middle, or bottom), and whether they're cited with sources. Results are normalized across models into a single executive-ready number.",
  },
  {
    q: "How is this different from SEO rank tracking?",
    a: "SEO tracks where pages rank in search results. VRTL Score tracks whether AI models mention, recommend, or ignore your client entirely when someone asks a direct question. Different signal, different tool, different conversation with your client.",
  },
  {
    q: "What do agencies charge clients for this?",
    a: "Most agencies position this as an AI visibility audit at $500–$1,500 per report, or a monthly monitoring retainer of $800–$2,500. VRTL Score gives you the product to deliver it and the PDF to justify the fee.",
  },
  {
    q: "Can I white-label the reports?",
    a: "Yes. PDF reports include your agency logo and branding. They're designed to be handed directly to clients as a professional deliverable, supporting renewals, upsells, and new business pitches.",
  },
  {
    q: "How do I get started?",
    a: "Run your first snapshot directly from the dashboard. Enter a client name and category, select the AI models to test, and your report is ready in minutes. No setup, no dev work, no credit card required to start.",
  },
];

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mt-14">
      {faqItems.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-[color:var(--border-subtle)] py-5 first:pt-0">
            <button
              className="flex w-full cursor-pointer items-center justify-between gap-4 text-left"
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="text-base font-normal text-[var(--text-primary)]">{item.q}</span>
              <span
                className="font-marketing-mono text-lg text-[var(--text-muted)] transition-transform duration-200"
                aria-hidden
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-out"
              style={{ maxHeight: isOpen ? 480 : 0 }}
            >
              <p className="max-w-none pt-3 text-[15px] font-light leading-[1.7] text-[var(--text-secondary)]">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="page-marketing selection:bg-[var(--accent-bg)] selection:text-[var(--text-primary)]">
      <main>
        {/* 1 — Hero */}
        <section className="min-h-screen overflow-visible border-b border-[color:var(--border-subtle)] pt-[120px]">
          <div className={`${shell} overflow-visible pb-24`}>
            <div className="grid items-center gap-16 overflow-visible lg:grid-cols-[55%_45%] lg:gap-8">
              <div>
                <AnimateIn delay={0}>
                  <SectionLabel>{`// AI VISIBILITY FOR AGENCIES`}</SectionLabel>
                </AnimateIn>
                <h1 className="mt-6 font-marketing-display font-normal leading-none tracking-[-0.03em] text-[var(--text-primary)]">
                  <AnimateIn delay={0}>
                    <span className="block text-[68px]">Your clients are</span>
                  </AnimateIn>
                  <AnimateIn delay={100}>
                    <span className="mt-1 block text-[68px]">invisible to AI.</span>
                  </AnimateIn>
                  <AnimateIn delay={200}>
                    <span className="mt-2 block text-[56px] italic leading-none text-[var(--text-muted)]">
                      You&apos;re not reporting on it.
                    </span>
                  </AnimateIn>
                </h1>
                <AnimateIn delay={200}>
                  <p className="mt-6 max-w-[440px] text-lg font-light leading-relaxed text-[var(--text-secondary)]">
                    VRTL Score shows how ChatGPT, Gemini, and Claude rank, mention, and recommend your clients — and gives you
                    a report you can actually send.
                  </p>
                </AnimateIn>
                <AnimateIn delay={300}>
                  <div className="mt-10 flex flex-wrap gap-3">
                    <Link
                      className="inline-flex items-center justify-center rounded-full bg-[var(--accent-marketing)] px-6 py-3 text-sm font-medium text-black transition duration-150 hover:scale-[1.02] hover:brightness-110"
                      href={SIGNUP_HREF}
                    >
                      Run a free snapshot
                    </Link>
                    <Link
                      className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-mid)] px-6 py-3 text-sm font-normal text-[var(--text-secondary)] transition duration-150 hover:border-[color:var(--border-strong)] hover:text-[var(--text-primary)]"
                      href={SAMPLE_REPORT_HREF}
                    >
                      View sample report →
                    </Link>
                  </div>
                </AnimateIn>
                <AnimateIn delay={400}>
                  <div className="mt-12 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-[var(--text-muted)]">Tracks:</span>
                    {MODEL_PILLS.map((m) => (
                      <ModelPill key={m.name} iconSrc={m.iconSrc} name={m.name} />
                    ))}
                  </div>
                </AnimateIn>
              </div>
              <AnimateIn delay={150}>
                <HeroReportStack />
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* 2 — Problem */}
        <section className="border-b border-[color:var(--border-subtle)] bg-[var(--bg-surface)] py-[120px]">
          <div className={shell}>
            <AnimateIn delay={0}>
              <SectionLabel>{`// THE PROBLEM`}</SectionLabel>
            </AnimateIn>
            <AnimateIn delay={100}>
              <h2 className="mt-6 max-w-[680px] font-marketing-display text-[52px] font-normal italic leading-[1.1] text-[var(--text-primary)]">
                Clients are starting to ask why ChatGPT recommends a competitor.
              </h2>
            </AnimateIn>
            <AnimateIn delay={150}>
              <p className="mt-5 max-w-[640px] text-xl font-light text-[var(--text-muted)]">
                Most agencies don&apos;t have a metric, a report, or a defensible answer.
              </p>
            </AnimateIn>
            <div className="my-12 border-t border-[color:var(--border-subtle)]" />
            <div className="overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--border-subtle)]">
              <div className="grid md:grid-cols-3 md:gap-px">
                <ProblemCard
                  delay={0}
                  index="01 / METRIC"
                  title="No AI visibility score"
                  body="You can't tell a client where they stand if you have no way to measure it. Competitors who do will take the conversation."
                />
                <ProblemCard
                  delay={150}
                  index="02 / REPORTING"
                  title="No report clients understand"
                  body="Rankings data doesn't answer 'why is ChatGPT recommending our competitor?' A VRTL Score report does."
                />
                <ProblemCard
                  delay={300}
                  index="03 / REVENUE"
                  title="No way to sell it as a service"
                  body="AI visibility is the fastest-growing agency service. Without a product to deliver, you're watching others charge for it."
                />
              </div>
            </div>
            <AnimateIn delay={0}>
              <p className="mx-auto mt-20 max-w-[720px] text-center font-marketing-display text-[28px] italic text-[var(--text-muted)]">
                Search used to rank pages. AI now chooses answers.
              </p>
            </AnimateIn>
          </div>
        </section>

        {/* 3 — Product */}
        <section className="scroll-mt-24 border-b border-[color:var(--border-subtle)] py-[120px]" id="product">
          <div className={shell}>
            <AnimateIn delay={0}>
              <h2 className="max-w-[600px] font-marketing-display text-[52px] font-normal leading-[1.1] text-[var(--text-primary)]">
                Show clients where they are winning, losing, and getting displaced.
              </h2>
            </AnimateIn>
            <AnimateIn delay={100}>
              <p className="mt-4 max-w-[500px] text-lg font-light text-[var(--text-secondary)]">
                VRTL Score turns AI visibility into a client-ready report with model breakdowns, competitor pressure, and
                prioritized actions.
              </p>
            </AnimateIn>
            <div className="mt-14 grid gap-4 md:grid-cols-3 md:items-stretch md:gap-4">
              <ProductPreviewCard caption="Executive summary — one screen they understand" delay={0} label="PAGE 1">
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-marketing-mono text-5xl font-light tabular-nums text-[var(--text-primary)]">72</span>
                  <span className="text-[13px] text-[var(--text-muted)]">Visibility score</span>
                </div>
                <div className="mt-auto pt-4">
                  <div className="h-[3px] w-full rounded-full bg-[var(--bg-inset)]">
                    <div className="h-full w-[72%] rounded-full bg-[var(--accent-marketing)]" />
                  </div>
                </div>
              </ProductPreviewCard>
              <ProductPreviewCard caption="Model breakdown — where each engine puts them" delay={100} label="ANALYSIS">
                <div className="mt-5 flex min-h-0 flex-1 flex-col">
                  <div className="mt-auto space-y-3.5">
                    {[
                      { n: "ChatGPT", w: 85, c: "var(--accent-marketing)" },
                      { n: "Gemini", w: 60, c: "rgba(0,232,122,0.4)" },
                      { n: "Claude", w: 45, c: "rgba(0,232,122,0.2)" },
                    ].map((row) => (
                      <div key={row.n} className="flex items-center gap-3">
                        <span className="w-[72px] shrink-0 text-[13px] text-[var(--text-secondary)]">{row.n}</span>
                        <div className="h-[3px] flex-1 rounded-full bg-[var(--bg-inset)]">
                          <div className="h-full rounded-full" style={{ width: `${row.w}%`, background: row.c }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ProductPreviewCard>
              <ProductPreviewCard caption="Recommended actions — prioritized next steps" delay={200} label="NEXT STEPS">
                <div className="mt-5 flex flex-1 flex-col space-y-3">
                  <div className="flex items-start gap-2">
                    <span
                      className={`${actionPillClass} bg-[rgba(255,64,64,0.12)] text-[var(--marketing-red)]`}
                    >
                      HIGH
                    </span>
                    <span className="text-[13px] font-light leading-snug text-[var(--text-secondary)]">
                      Close the citation gap on key topics.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span
                      className={`${actionPillClass} bg-[rgba(245,166,35,0.12)] text-[var(--marketing-amber)]`}
                    >
                      MED
                    </span>
                    <span className="text-[13px] font-light leading-snug text-[var(--text-secondary)]">
                      Align on-page proof with what models quote.
                    </span>
                  </div>
                </div>
              </ProductPreviewCard>
            </div>
            <div className="mt-8 text-center">
              <Link
                className="text-sm text-[var(--accent-marketing)] transition-opacity hover:opacity-80"
                href={SAMPLE_REPORT_HREF}
              >
                View full sample report →
              </Link>
            </div>
          </div>
        </section>

        {/* 4 — Agencies */}
        <section className="border-b border-[color:var(--border-subtle)] bg-[var(--bg-surface)] py-[120px]">
          <div className={shell}>
            <AnimateIn delay={0}>
              <SectionLabel>{`// FOR AGENCIES`}</SectionLabel>
            </AnimateIn>
            <div className="mt-8 grid gap-16 lg:grid-cols-[45%_55%] lg:items-start lg:gap-16">
              <div>
                <AnimateIn delay={50}>
                  <h2 className="font-marketing-display text-5xl font-normal leading-[1.1] text-[var(--text-primary)]">
                    Turn AI visibility into a billable service.
                  </h2>
                </AnimateIn>
                <AnimateIn delay={100}>
                  <p className="mt-4 max-w-[380px] text-base font-light leading-[1.7] text-[var(--text-secondary)]">
                    Package AI visibility into a deliverable you price, repeat, and renew on — not another internal dashboard
                    only your team sees.
                  </p>
                </AnimateIn>
                <AnimateIn delay={150}>
                  <div className="mt-8 rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-5">
                    <p className="text-xl font-medium">
                      <span style={{ color: "#00e87a" }}>$2K–$10K</span>
                      <span className="text-[var(--text-primary)]"> /mo service layer</span>
                    </p>
                    <p className="mt-1 text-[13px] font-light text-[var(--text-secondary)]">
                      Agencies are already packaging this into retainers.
                    </p>
                  </div>
                </AnimateIn>
                <AnimateIn delay={200}>
                  <figure className="mt-8 border-l-2 border-[color:var(--border-mid)] pl-4">
                    <blockquote className="font-marketing-display text-base font-light italic leading-relaxed text-[var(--text-secondary)]">
                      We ran this for a client and immediately saw where they were losing visibility in AI answers.
                    </blockquote>
                    <figcaption className="mt-2 font-marketing-mono text-xs text-[var(--text-muted)]">
                      — Principal, search-focused agency
                    </figcaption>
                  </figure>
                </AnimateIn>
              </div>
              <div className="flex h-fit w-full flex-col gap-px self-start overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--border-subtle)]">
                {[
                  {
                    t: "Add a new line item",
                    b: "Give clients a clear view of how AI models rank and recommend them.",
                  },
                  {
                    t: "Increase retainers",
                    b: "Answer the question clients are starting to ask: why is AI recommending someone else?",
                  },
                  {
                    t: "Defend client relationships",
                    b: "Turn AI visibility gaps into concrete strategic recommendations.",
                  },
                ].map((card, i) => (
                  <AnimateIn key={card.t} delay={i * 100}>
                    <article className="group bg-[var(--bg-elevated)] px-7 py-6 transition-colors hover:bg-[var(--bg-inset)] md:px-8">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-base font-medium text-[var(--text-primary)]">{card.t}</h3>
                          <p className="mt-1.5 text-sm font-light leading-[1.7] text-[var(--text-secondary)]">{card.b}</p>
                        </div>
                        <span className="shrink-0 text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-primary)]">
                          →
                        </span>
                      </div>
                    </article>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5 — Framework */}
        <section className="border-b border-[color:var(--border-subtle)] py-20 md:py-[80px]">
          <div className={shell}>
            <AnimateIn delay={0}>
              <SectionLabel className="mb-3 text-center" noMargin>{`// HOW IT'S MEASURED`}</SectionLabel>
            </AnimateIn>
            <AnimateIn delay={100}>
              <h2 className="mx-auto max-w-[600px] text-center font-marketing-display text-[44px] font-normal leading-[1.1] text-[var(--text-primary)]">
                Search ranked pages. AI ranks answers.
              </h2>
            </AnimateIn>
            <AnimateIn delay={150}>
              <p className="mx-auto mt-4 max-w-[500px] text-center text-base font-light leading-[1.7] text-[var(--text-secondary)]">
                Answer-engine visibility is simply: do models mention you, where, and as a source?
              </p>
            </AnimateIn>
            <div className="mt-12 grid gap-4 md:grid-cols-3 md:items-stretch">
              <AnimateIn delay={0}>
                <article className="flex h-full min-h-[200px] flex-col rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-8">
                  <p className="font-marketing-mono text-[11px] uppercase tracking-[0.14em] text-[#555]">PRESENCE</p>
                  <p className="mt-2 text-[17px] font-normal leading-[1.4] text-[#efefef]">Are you mentioned at all?</p>
                  <div className="mt-auto flex flex-col gap-2 pt-4">
                    <PresenceDotRow green={4} label="ChatGPT" />
                    <PresenceDotRow green={3} label="Gemini" />
                    <PresenceDotRow green={2} label="Claude" />
                  </div>
                </article>
              </AnimateIn>
              <AnimateIn delay={100}>
                <article className="flex h-full min-h-[200px] flex-col rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-8">
                  <p className="font-marketing-mono text-[11px] uppercase tracking-[0.14em] text-[#555]">POSITION</p>
                  <p className="mt-2 text-[17px] font-normal leading-[1.4] text-[#efefef]">
                    Are you near the top or missing from the answer?
                  </p>
                  <div className="mt-auto space-y-1 pt-4 text-[10px] leading-relaxed">
                    <p className="text-[#00e87a]">#1 Your client</p>
                    <p className="text-[#555]">#2 Competitor A</p>
                    <p className="text-[#444]">#3 Competitor B</p>
                  </div>
                </article>
              </AnimateIn>
              <AnimateIn delay={200}>
                <article className="flex h-full min-h-[200px] flex-col rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-8">
                  <p className="font-marketing-mono text-[11px] uppercase tracking-[0.14em] text-[#555]">AUTHORITY</p>
                  <p className="mt-2 text-[17px] font-normal leading-[1.4] text-[#efefef]">Are you being cited as a trusted source?</p>
                  <div className="mt-auto pt-4">
                    <p className="text-[10px] text-[#555]">Citations: 0%</p>
                    <div className="mt-1 h-[3px] w-full rounded-full bg-[#1a1a1a]">
                      <div className="h-full w-0 rounded-full bg-[#00e87a]" />
                    </div>
                    <p className="mt-1 text-[10px] text-[#555]">Target: 15%+</p>
                    <p className="mt-1 text-[10px] text-[#444]">Improve with press + backlinks</p>
                  </div>
                </article>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* 6 — Breakout */}
        <section className="border-b border-[color:var(--border-subtle)] px-6 py-[140px] md:px-12">
          <AnimateIn delay={0}>
            <p className="mx-auto max-w-[800px] text-center font-marketing-display text-[56px] font-normal leading-[1.1] text-[var(--text-primary)]">
              If you can&apos;t measure AI visibility, you can&apos;t sell it.
            </p>
          </AnimateIn>
          <AnimateIn delay={100}>
            <p className="mx-auto mt-2 max-w-[800px] text-center font-marketing-display text-[56px] italic leading-[1.1] text-[var(--text-muted)]">
              If you can&apos;t sell it, you lose the client.
            </p>
          </AnimateIn>
          <AnimateIn delay={200}>
            <div className="mt-12 text-center">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent-marketing)] px-8 py-4 text-[15px] font-medium text-black transition duration-150 hover:scale-[1.02] hover:brightness-[1.08]"
                href={SIGNUP_HREF}
              >
                Run a free snapshot →
              </Link>
              <p className="mt-3 text-xs text-[var(--text-muted)]">Generate a client-ready report in minutes.</p>
            </div>
          </AnimateIn>
        </section>

        {/* 7 — FAQ */}
        <section className="scroll-mt-24 border-b border-[color:var(--border-subtle)] bg-[var(--bg-surface)] py-[120px]" id="faq">
          <div className="mx-auto max-w-[720px] px-6 md:px-12">
            <SectionLabel className="mb-3 text-center" noMargin>
              FAQ
            </SectionLabel>
            <h2 className="text-center font-marketing-display text-[44px] font-normal leading-[1.1] text-[var(--text-primary)]">
              Questions agencies ask before they run a snapshot
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] text-center text-base font-light text-[var(--text-secondary)]">
              Straight answers on what VRTL Score measures, how reports work, and what you can charge for.
            </p>
            <FaqAccordion />
          </div>
        </section>

        {/* 8 — Closing */}
        <section className="px-6 py-[140px] md:px-12">
          <AnimateIn delay={0}>
            <h2 className="mx-auto max-w-[700px] text-center font-marketing-display text-[52px] font-normal leading-none text-[var(--text-primary)]">
              The agencies winning AI visibility are running snapshots right now.
            </h2>
          </AnimateIn>
          <AnimateIn delay={100}>
            <p className="mx-auto mt-5 max-w-[480px] text-center text-lg font-light text-[var(--text-secondary)]">
              First snapshot is free. Report ready in minutes. No dev work required.
            </p>
          </AnimateIn>
          <AnimateIn delay={200}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent-marketing)] px-6 py-3 text-sm font-medium text-black transition duration-150 hover:scale-[1.02] hover:brightness-110"
                href={SIGNUP_HREF}
              >
                Run a free snapshot
              </Link>
              <Link
                className="inline-flex items-center justify-center rounded-full border border-[color:var(--border-mid)] px-6 py-3 text-sm font-normal text-[var(--text-secondary)] transition duration-150 hover:border-[color:var(--border-strong)] hover:text-[var(--text-primary)]"
                href={SAMPLE_REPORT_HREF}
              >
                View sample report →
              </Link>
            </div>
          </AnimateIn>
          <AnimateIn delay={250}>
            <div className="mt-5 flex flex-wrap justify-center gap-6 font-marketing-mono text-[11px] text-[var(--text-muted)]">
              <span>Free to start</span>
              <span className="text-[var(--border-mid)]">·</span>
              <span>No credit card</span>
              <span className="text-[var(--border-mid)]">·</span>
              <span>PDF in minutes</span>
            </div>
          </AnimateIn>
        </section>
      </main>

      <Footer />
    </div>
  );
}
