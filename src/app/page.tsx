"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useState } from "react";

import { AnimateIn } from "@/components/AnimateIn";
import { Footer } from "@/components/Footer";

const SAMPLE_REPORT_HREF = "/preview";
const SIGNUP_HREF = "/signup";

const shell = "mx-auto w-full max-w-[1200px] px-6 md:px-12";

function Eyebrow({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return (
    <p
      className={`font-marketing-mono text-[11px] uppercase tracking-[0.12em] ${
        accent ? "text-[var(--accent-marketing)]" : "text-[var(--text-muted)]"
      }`}
    >
      {children}
    </p>
  );
}

function HeroReportStack() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[440px] lg:mx-0">
      <div
        className="absolute right-[-10px] top-5 h-[380px] w-full rounded-2xl border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)] opacity-50"
        style={{ transform: "rotate(2deg)" }}
        aria-hidden
      />
      <div className="absolute right-0 top-0 w-[96%] rounded-2xl bg-white p-7 text-[#111] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <p className="font-marketing-mono text-[10px] uppercase tracking-[0.14em] text-[#999]">VRTL SCORE</p>
          <span className="rounded bg-[#f4f4f4] px-2 py-0.5 font-marketing-mono text-[10px] text-[#666]">PDF</span>
        </div>
        <p className="mt-1 text-base font-medium text-[#111]">Executive snapshot</p>
        <div className="my-4 h-px bg-[#eee]" />
        <p className="font-marketing-mono text-[10px] uppercase tracking-[0.12em] text-[#aaa]">OVERALL</p>
        <p className="mt-1 font-marketing-display text-[52px] font-light leading-none text-[#111]">78</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#e8faf0] px-3 py-1 font-marketing-mono text-xs text-[#1a7a45]">Win · 3 models</span>
          <span className="rounded-full bg-[#fff8e8] px-3 py-1 font-marketing-mono text-xs text-[#92600a]">At risk · 2</span>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#eee] pt-4">
          {[
            { l: "PRESENCE", v: "Strong" },
            { l: "POSITION", v: "Mixed" },
            { l: "AUTHORITY", v: "Low" },
          ].map((row) => (
            <div key={row.l}>
              <p className="font-marketing-mono text-[10px] uppercase tracking-[0.12em] text-[#aaa]">{row.l}</p>
              <p className="mt-1 text-sm font-medium text-[#111]">{row.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-[#bbb]">Client-facing report · ready to send</p>
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
    <div className="flex flex-col">
      <AnimateIn delay={delay}>
        <div className="overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-mid)]">
          <p className="font-marketing-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{label}</p>
          {children}
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
    q: "Is there a free trial?",
    a: "Yes. Start with a 7-day free trial. Run snapshots on real clients and see the platform in action before committing.",
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
        <section className="min-h-screen border-b border-[color:var(--border-subtle)] pt-[120px]">
          <div className={`${shell} pb-24`}>
            <div className="grid items-center gap-16 lg:grid-cols-[55%_45%] lg:gap-12">
              <div>
                <AnimateIn delay={0}>
                  <Eyebrow>{`// AI VISIBILITY FOR AGENCIES`}</Eyebrow>
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
                    {["ChatGPT", "Gemini", "Claude", "Perplexity"].map((m) => (
                      <span
                        key={m}
                        className="rounded-full border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]"
                      >
                        {m}
                      </span>
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
              <Eyebrow accent>{`// THE PROBLEM`}</Eyebrow>
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
            <div className="mt-14 grid gap-4 md:grid-cols-3 md:gap-4">
              <ProductPreviewCard caption="Executive summary — one screen they understand" delay={0} label="PAGE 1">
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-marketing-display text-5xl text-[var(--text-primary)]">72</span>
                  <span className="text-[13px] text-[var(--text-muted)]">Visibility score</span>
                </div>
                <div className="mt-4 h-[3px] w-full rounded-full bg-[var(--bg-inset)]">
                  <div className="h-full w-[72%] rounded-full bg-[var(--accent-marketing)]" />
                </div>
              </ProductPreviewCard>
              <ProductPreviewCard caption="Model breakdown — where each engine puts them" delay={100} label="ANALYSIS">
                <div className="mt-5 space-y-3.5">
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
              </ProductPreviewCard>
              <ProductPreviewCard caption="Recommended actions — prioritized next steps" delay={200} label="NEXT STEPS">
                <div className="mt-5 space-y-3">
                  <div className="flex gap-2">
                    <span className="shrink-0 rounded bg-[rgba(255,64,64,0.12)] px-2 py-0.5 font-marketing-mono text-[10px] text-[var(--marketing-red)]">
                      HIGH
                    </span>
                    <span className="text-[13px] font-light text-[var(--text-secondary)]">Close the citation gap on key topics.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 rounded bg-[rgba(245,166,35,0.12)] px-2 py-0.5 font-marketing-mono text-[10px] text-[var(--marketing-amber)]">
                      MED
                    </span>
                    <span className="text-[13px] font-light text-[var(--text-secondary)]">
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
              <Eyebrow>{`// FOR AGENCIES`}</Eyebrow>
            </AnimateIn>
            <div className="mt-8 grid gap-16 lg:grid-cols-[45%_55%] lg:gap-16">
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
                    <p className="text-xl font-medium text-[var(--text-primary)]">$2K–$10K/mo service layer</p>
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
              <div className="flex flex-col gap-px overflow-hidden rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--border-subtle)]">
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
              <p className="text-center font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                {`// HOW IT'S MEASURED`}
              </p>
            </AnimateIn>
            <AnimateIn delay={100}>
              <h2 className="mx-auto mt-4 max-w-[600px] text-center font-marketing-display text-[44px] font-normal leading-[1.1] text-[var(--text-primary)]">
                Search ranked pages. AI ranks answers.
              </h2>
            </AnimateIn>
            <AnimateIn delay={150}>
              <p className="mx-auto mt-4 max-w-[500px] text-center text-base font-light leading-[1.7] text-[var(--text-secondary)]">
                Answer-engine visibility is simply: do models mention you, where, and as a source?
              </p>
            </AnimateIn>
            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                { l: "PRESENCE", q: "Are you mentioned at all?" },
                { l: "POSITION", q: "Are you near the top or missing from the answer?" },
                { l: "AUTHORITY", q: "Are you being cited as a trusted source?" },
              ].map((c, i) => (
                <AnimateIn key={c.l} delay={i * 100}>
                  <article className="rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-surface)] p-8">
                    <p className="font-marketing-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{c.l}</p>
                    <p className="mt-2 text-[17px] font-normal leading-snug text-[var(--text-primary)]">{c.q}</p>
                    <div className="mt-5 h-1.5 w-1.5 rounded-full bg-[var(--accent-marketing)]" />
                  </article>
                </AnimateIn>
              ))}
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
            <p className="text-center font-marketing-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">FAQ</p>
            <h2 className="mt-3 text-center font-marketing-display text-[44px] font-normal leading-[1.1] text-[var(--text-primary)]">
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
