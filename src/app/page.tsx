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

const HERO_TRACK_LOGOS = [
  { src: "/ai/icons8-chatgpt.svg", alt: "ChatGPT" },
  { src: "/ai/gemini.png", alt: "Gemini" },
  { src: "/ai/icons8-claude.svg", alt: "Claude" },
  { src: "/ai/perplexity.png", alt: "Perplexity" },
] as const;

function HeroTracksAcross() {
  return (
    <div
      className="flex items-center gap-3"
      style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "40px" }}
    >
      <span
        className="font-marketing-mono text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        Tracks across
      </span>
      <div className="flex items-center" style={{ display: "flex", alignItems: "center" }}>
        {HERO_TRACK_LOGOS.map((logo, i) => (
          <div
            key={logo.alt}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#2a2a2a",
              border: "2px solid #070707",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: i === 0 ? "0" : "-10px",
              zIndex: 4 - i,
              position: "relative",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local /ai assets; hero model marks */}
            <img
              alt={logo.alt}
              src={logo.src}
              style={{
                width: "16px",
                height: "16px",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
                opacity: 1,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroPdfPreviewCard() {
  return (
    <div className="relative w-full max-w-[400px]">
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "14px",
          left: "8px",
          right: "-14px",
          bottom: "-14px",
          background: "#e2e2e2",
          borderRadius: "2px",
          transform: "rotate(3.5deg)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "7px",
          left: "4px",
          right: "-7px",
          bottom: "-7px",
          background: "#eeeeee",
          borderRadius: "2px",
          transform: "rotate(1.8deg)",
        }}
      />
      <div
        className="font-marketing-body"
        style={{
          position: "relative",
          background: "#ffffff",
          borderRadius: "2px",
          padding: "24px",
          color: "#111",
          boxShadow: "0 2px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              className="font-marketing-mono"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "#aaa",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              AI Authority Report
            </div>
            <div style={{ fontSize: "15px", fontWeight: 500, color: "#111", marginTop: "2px" }}>Executive summary</div>
            <div
              className="font-marketing-mono"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                color: "#bbb",
                marginTop: "2px",
              }}
            >
              Your Client · April 1, 2026
            </div>
          </div>
          <div
            className="font-marketing-mono"
            style={{
              background: "#111",
              color: "#fff",
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              padding: "3px 8px",
              borderRadius: "2px",
              letterSpacing: "0.08em",
            }}
          >
            PDF
          </div>
        </div>

        <div style={{ height: "1px", background: "#f0f0f0", margin: "14px 0" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative", width: "72px", height: "72px", flexShrink: 0 }}>
            <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden shapeRendering="geometricPrecision">
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="5"
                strokeDasharray="131 176"
                strokeDashoffset="-22"
                strokeLinecap="round"
                transform="rotate(135 36 36)"
              />
              <circle
                cx="36"
                cy="36"
                r="28"
                fill="none"
                stroke="#00e87a"
                strokeWidth="5"
                strokeDasharray="89 218"
                strokeDashoffset="-22"
                strokeLinecap="round"
                transform="rotate(135 36 36)"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "20px", fontWeight: 300, color: "#111", lineHeight: 1 }}>68</span>
              <span
                className="font-marketing-mono"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: "#aaa",
                  marginTop: "1px",
                }}
              >
                /100
              </span>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "6px",
              flex: 1,
              minWidth: 0,
            }}
          >
            {(
              [
                { label: "Mention rate", value: "62%", color: "#111" },
                { label: "Top position", value: "60%", color: "#111" },
                { label: "Authority", value: "0%", color: "#e53e3e" },
              ] as const
            ).map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: "#fafafa",
                  border: "1px solid #f0f0f0",
                  borderRadius: "2px",
                  padding: "8px 6px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 500, color: stat.color }}>{stat.value}</div>
                <div
                  className="font-marketing-mono"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "8px",
                    color: "#aaa",
                    marginTop: "2px",
                    lineHeight: 1.3,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "14px" }}>
          <div
            className="font-marketing-mono"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "#aaa",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Competitive ranking
          </div>
          {(
            [
              { rank: "#1", name: "Your client", bar: 100, color: "#00e87a", you: true },
              { rank: "#2", name: "Competitor A", bar: 75, color: "#e0e0e0", you: false },
              { rank: "#3", name: "Competitor B", bar: 65, color: "#e0e0e0", you: false },
            ] as const
          ).map((row) => (
            <div
              key={row.rank}
              style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}
            >
              <span
                className="font-marketing-mono"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: row.you ? "#00e87a" : "#bbb",
                  width: "20px",
                }}
              >
                {row.rank}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: row.you ? "#111" : "#888",
                  flex: 1,
                  fontWeight: row.you ? 500 : 400,
                }}
              >
                {row.name}
              </span>
              <div
                style={{
                  width: "80px",
                  height: "3px",
                  background: "#f0f0f0",
                  borderRadius: "999px",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: `${row.bar}%`,
                    height: "100%",
                    background: row.color,
                    borderRadius: "999px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: "12px",
            padding: "8px 10px",
            background: "#fffbf0",
            border: "1px solid #fde68a",
            borderRadius: "2px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            className="font-marketing-mono"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "8px",
              fontWeight: 600,
              color: "#92600a",
              background: "#fef3c7",
              padding: "2px 6px",
              borderRadius: "2px",
              letterSpacing: "0.05em",
            }}
          >
            RISK
          </div>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 500, color: "#92600a" }}>Fragile lead</div>
            <div style={{ fontSize: "10px", color: "#b45309", marginTop: "1px" }}>Competitors within range</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroReportStack() {
  return (
    <div className="relative z-10 flex w-full flex-col items-center lg:items-end lg:justify-center lg:overflow-visible lg:pr-0">
      <div className="relative flex w-full max-w-[min(100%,400px)] flex-col items-center justify-center lg:ml-auto lg:mr-[-12px] lg:items-end lg:-translate-y-[5.5rem] xl:-translate-y-[6rem]">
        <div className="relative w-full max-w-[400px] pb-6 pt-0">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[118%] w-[118%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.12),transparent_70%)]"
          />
          <div className="group/pdf relative z-[1] mx-auto origin-center transition-transform duration-300 ease-out group-hover/pdf:-translate-y-1.5 group-hover/pdf:scale-[1.02] lg:ml-auto">
            <HeroPdfPreviewCard />
          </div>
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
    <div className="flex h-full min-h-0 flex-col">
      <AnimateIn className="flex min-h-0 flex-1 flex-col" delay={delay}>
        <div className="flex h-full min-h-[300px] flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-[var(--bg-elevated)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-200 ease-out hover:border-white/[0.14] md:min-h-[320px] md:p-6">
          <header className="shrink-0 border-b border-white/[0.08] pb-3">
            <p className="font-marketing-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              {label}
            </p>
          </header>
          <div className="mt-4 flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </AnimateIn>
      <p className="mt-2 max-w-[18rem] self-center text-center font-marketing-mono text-[10px] uppercase leading-snug tracking-[0.1em] text-[var(--text-muted)]">
        {caption}
      </p>
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
    a: "The score combines three dimensions: how often your client is mentioned (mention rate), where they appear in the response (top, middle, or bottom), and whether they're cited with sources. Results are normalized across models into one number executives can use.",
  },
  {
    q: "How is this different from SEO rank tracking?",
    a: "SEO tracks where pages rank in search results. VRTL Score tracks whether AI models mention, recommend, or ignore your client entirely when someone asks a direct question. Different signal, different tool, different conversation with your client.",
  },
  {
    q: "What do agencies charge clients for this?",
    a: "Most agencies position this as an AI visibility audit at $500 to $1,500 per report, or a monthly monitoring retainer of $800 to $2,500. VRTL Score gives you the product to deliver it and the PDF to justify the fee.",
  },
  {
    q: "Can I white label the reports?",
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
        {/* 1: Hero */}
        <section className="overflow-visible border-b border-[color:var(--border-subtle)] pt-[120px] pb-20">
          <div className={`${shell} overflow-visible pb-0`}>
            <div className="grid items-start gap-16 overflow-visible lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-10">
              <div className="self-start">
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
                  <p className="mt-6 max-w-[560px] text-lg font-light leading-relaxed text-[var(--text-secondary)]">
                    VRTL Score shows how your clients are ranked, mentioned, and recommended across top AI models so you can
                    deliver reports that actually prove value.
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
                  <HeroTracksAcross />
                </AnimateIn>
              </div>
              <AnimateIn delay={150} className="self-center pt-10">
                <HeroReportStack />
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* 2: Problem */}
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
                  body="Among agency services, AI visibility is growing fastest. Without a product to deliver, you're watching others charge for it."
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

        {/* 3: Product */}
        <section className="scroll-mt-24 border-b border-[color:var(--border-subtle)] py-[120px]" id="product">
          <div className={shell}>
            <AnimateIn delay={0}>
              <h2 className="max-w-[600px] font-marketing-display text-[52px] font-normal leading-[1.1] text-[var(--text-primary)]">
                Show clients where they are winning, losing, and getting displaced.
              </h2>
            </AnimateIn>
            <AnimateIn delay={100}>
              <p className="mt-4 max-w-[500px] text-lg font-light text-[var(--text-secondary)]">
                VRTL Score turns AI visibility into a report ready for clients, with model breakdowns, competitor pressure, and
                prioritized actions.
              </p>
            </AnimateIn>
            <div className="mt-12 grid gap-6 md:grid-cols-3 md:items-stretch md:gap-6">
              <ProductPreviewCard caption="Executive summary: one screen they understand" delay={0} label="Executive summary">
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
                    <span className="font-marketing-mono text-[52px] font-light leading-[0.95] tracking-tight text-[var(--text-primary)] tabular-nums md:text-[56px]">
                      72
                    </span>
                    <span className="pb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Visibility score
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 font-marketing-mono text-[9px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      Mention rate 62%
                    </span>
                    <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-1 font-marketing-mono text-[9px] font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                      vs. prior +4 pts
                    </span>
                  </div>
                  <p className="mt-auto pt-5 text-[12px] font-light leading-relaxed text-[var(--text-secondary)]">
                    One composite number across engines, built to trend on every client call.
                  </p>
                  <div className="mt-4 shrink-0">
                    <div className="flex justify-between font-marketing-mono text-[8px] uppercase tracking-wider text-[var(--text-muted)]">
                      <span>0</span>
                      <span>100</span>
                    </div>
                    <div className="mt-1.5 h-1 w-full rounded-full bg-[var(--bg-inset)]">
                      <div className="h-full w-[72%] rounded-full bg-[var(--accent-marketing)]" />
                    </div>
                  </div>
                </div>
              </ProductPreviewCard>
              <ProductPreviewCard caption="Model breakdown: where each engine puts them" delay={100} label="Model analysis">
                <div className="flex min-h-0 flex-1 flex-col">
                  <div>
                    <p className="text-[12px] font-medium text-[var(--text-primary)]">Visibility by engine</p>
                    <p className="mt-0.5 text-[10px] font-light text-[var(--text-muted)]">Same prompts · normalized scores</p>
                  </div>
                  <div className="mt-5 flex flex-1 flex-col justify-center space-y-2.5">
                    {[
                      { n: "ChatGPT", w: 85, c: "var(--accent-marketing)" },
                      { n: "Gemini", w: 60, c: "rgba(0,232,122,0.45)" },
                      { n: "Claude", w: 45, c: "rgba(0,232,122,0.22)" },
                    ].map((row) => (
                      <div key={row.n} className="flex items-center gap-2.5">
                        <span className="w-[4.5rem] shrink-0 font-marketing-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                          {row.n}
                        </span>
                        <div className="h-1 flex-1 rounded-full bg-[var(--bg-inset)]">
                          <div className="h-full rounded-full" style={{ width: `${row.w}%`, background: row.c }} />
                        </div>
                        <span className="w-7 shrink-0 text-right font-marketing-mono text-[10px] tabular-nums text-[var(--text-muted)]">
                          {row.w}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-auto border-t border-white/[0.08] pt-3 text-[11px] font-light leading-snug text-[var(--text-secondary)]">
                    About 40 points from best to worst engine. Lead the recap with the weakest surface first.
                  </p>
                </div>
              </ProductPreviewCard>
              <ProductPreviewCard caption="Recommended actions: prioritized next steps" delay={200} label="Recommended actions">
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="shrink-0">
                    <p className="text-[12px] font-semibold text-[var(--text-primary)]">Next steps</p>
                    <p className="mt-0.5 text-[10px] font-light text-[var(--text-muted)]">Prioritized for this client</p>
                  </div>
                  <ul className="mt-4 flex flex-1 flex-col justify-center space-y-3">
                    <li className="flex gap-2.5">
                      <span
                        className={`${actionPillClass} mt-0.5 bg-[rgba(255,64,64,0.14)] text-[var(--marketing-red)]`}
                      >
                        HIGH
                      </span>
                      <span className="min-w-0 text-[12px] font-light leading-snug text-[var(--text-secondary)]">
                        Close the citation gap on head term prompts your client should own.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        className={`${actionPillClass} mt-0.5 bg-[rgba(245,166,35,0.14)] text-[var(--marketing-amber)]`}
                      >
                        MED
                      </span>
                      <span className="min-w-0 text-[12px] font-light leading-snug text-[var(--text-secondary)]">
                        Align on page proof with passages models are already quoting.
                      </span>
                    </li>
                    <li className="flex gap-2.5">
                      <span
                        className={`${actionPillClass} mt-0.5 bg-[rgba(255,64,64,0.14)] text-[var(--marketing-red)]`}
                      >
                        HIGH
                      </span>
                      <span className="min-w-0 text-[12px] font-light leading-snug text-[var(--text-secondary)]">
                        Counter competitor mentions before they harden into default answers.
                      </span>
                    </li>
                  </ul>
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

        {/* 4: Agencies */}
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
                    Package AI visibility into a deliverable you price, repeat, and renew on. Not another internal dashboard
                    only your team sees.
                  </p>
                </AnimateIn>
                <AnimateIn delay={150}>
                  <div className="mt-8 rounded-xl border border-[color:var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-5">
                    <p className="text-xl font-medium">
                      <span style={{ color: "#00e87a" }}>$2K to $10K</span>
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
                      Principal, agency focused on search
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

        {/* 5: Framework */}
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
                Visibility in answer engines is simple: do models mention you, where, and as a source?
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

        {/* 6: Breakout */}
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
              <p className="mt-3 text-xs text-[var(--text-muted)]">Generate a report ready for clients in minutes.</p>
            </div>
          </AnimateIn>
        </section>

        {/* 7: FAQ */}
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

        {/* 8: Closing */}
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
