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
  "border border-[#dadada] bg-[#fafafa] text-[#111] shadow-[0_28px_70px_rgba(0,0,0,0.45),0_8px_24px_rgba(0,0,0,0.12)] rounded-[3px]";

function HeroReportStack() {
  return (
    <div className="group/stack relative z-10 flex w-full flex-col items-center lg:items-end lg:overflow-visible lg:pr-0">
      <p className="mb-4 font-marketing-mono text-[11px] tracking-[0.08em] text-[var(--text-secondary)] lg:mr-6 lg:text-right">
        What you send to clients
      </p>

      <div className="animate-hero-report-float relative w-[min(100%,320px)] origin-center scale-[0.92] pb-14 pt-2 sm:w-[min(100%,360px)] sm:scale-95 lg:ml-auto lg:mr-[-32px] lg:w-[420px] lg:origin-top-right lg:scale-[1.18]">
        {/* Page 3 — Model analysis (back) — desktop only */}
        <div
          className={`${paper} absolute left-0 top-2 hidden h-[400px] w-full max-w-[360px] origin-bottom-right p-5 opacity-95 lg:block lg:max-w-none`}
          style={{ transform: "translate(-6%, 8%) rotate(-3.5deg) scale(0.92)", zIndex: 0 }}
          aria-hidden
        >
          <p className="font-marketing-mono text-[9px] uppercase tracking-[0.16em] text-[#888]">Model analysis</p>
          <p className="mt-3 text-[11px] font-medium text-[#333]">Acme Corp · by engine</p>
          <div className="mt-4 space-y-2.5">
            {[
              { n: "ChatGPT", v: 88 },
              { n: "Gemini", v: 61 },
              { n: "Claude", v: 43 },
            ].map((row) => (
              <div key={row.n} className="flex items-center gap-2">
                <span className="w-16 shrink-0 font-marketing-mono text-[10px] text-[#666]">{row.n}</span>
                <div className="h-1 flex-1 bg-[#e8e8e8]">
                  <div className="h-full bg-[#1a1a1a]" style={{ width: `${row.v}%` }} />
                </div>
                <span className="w-7 shrink-0 text-right font-marketing-mono text-[10px] text-[#444]">{row.v}</span>
              </div>
            ))}
          </div>
          <p className="absolute bottom-4 right-4 font-marketing-mono text-[8px] text-[#bbb]">Page 3</p>
        </div>

        {/* Page 2 — Recommendations — desktop only */}
        <div
          className={`${paper} absolute left-0 top-1 hidden h-[400px] w-full max-w-[360px] p-5 lg:block lg:max-w-none`}
          style={{ transform: "translate(-2%, 4%) rotate(-1.8deg) scale(0.96)", zIndex: 1 }}
          aria-hidden
        >
          <p className="font-marketing-mono text-[9px] uppercase tracking-[0.16em] text-[#888]">Recommendations</p>
          <div className="mt-4 space-y-3">
            <div>
              <span className="font-marketing-mono text-[9px] font-medium text-[#c53030]">HIGH</span>
              <p className="mt-1 text-[11px] leading-snug text-[#333]">Earn citations on category queries competitors already own.</p>
            </div>
            <div>
              <span className="font-marketing-mono text-[9px] font-medium text-[#b7791f]">MED</span>
              <p className="mt-1 text-[11px] leading-snug text-[#333]">Add proof-rich comparison pages aligned to how models answer.</p>
            </div>
          </div>
          <p className="absolute bottom-4 right-4 font-marketing-mono text-[8px] text-[#bbb]">Page 2</p>
        </div>

        {/* Page 1 — Executive summary (front) */}
        <div
          className={`${paper} relative z-[2] mx-auto min-h-[380px] w-full max-w-[320px] p-6 transition-shadow duration-500 ease-out sm:max-w-[360px] group-hover/stack:shadow-[0_36px_90px_rgba(0,0,0,0.55),0_12px_32px_rgba(0,0,0,0.14)] lg:mx-0 lg:ml-auto lg:h-[400px] lg:max-w-none`}
          style={{ transform: "translate(4%, 0) rotate(2deg)" }}
        >
          <div className="flex items-start justify-between gap-2 border-b border-[#e5e5e5] pb-3">
            <div>
              <p className="font-marketing-mono text-[9px] uppercase tracking-[0.16em] text-[#888]">VRTL Score</p>
              <p className="mt-1.5 text-[14px] font-semibold text-[#111]">Executive summary</p>
            </div>
            <span className="shrink-0 border border-[#ddd] bg-white px-1.5 py-0.5 font-marketing-mono text-[8px] uppercase tracking-wider text-[#777]">
              PDF
            </span>
          </div>
          <p className="mt-3 text-[12px] text-[#555]">Acme Corp · Q2 2026</p>
          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="font-marketing-display text-[48px] font-normal leading-none tracking-tight text-[#111]">74</span>
            <div className="pb-1">
              <p className="text-[10px] uppercase tracking-wide text-[#888]">Visibility score</p>
              <p className="font-marketing-mono text-[11px] text-[#2d7a4d]">↑ 6 vs last run</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#ececec] pt-4">
            <div>
              <p className="font-marketing-mono text-[8px] uppercase tracking-wider text-[#aaa]">Mention rate</p>
              <p className="mt-0.5 text-[15px] font-medium tabular-nums text-[#111]">62%</p>
            </div>
            <div>
              <p className="font-marketing-mono text-[8px] uppercase tracking-wider text-[#aaa]">Top-3 answers</p>
              <p className="mt-0.5 text-[15px] font-medium tabular-nums text-[#111]">4 of 6</p>
            </div>
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-[#666]">
            Strong on ChatGPT; close the gap on Gemini and Claude before renewals.
          </p>
          <p className="absolute bottom-4 right-4 font-marketing-mono text-[8px] text-[#bbb]">
            Page 1<span className="hidden lg:inline"> of 3</span>
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
