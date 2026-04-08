import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sample Report — VRTL Score",
  description:
    "See what a VRTL Score AI visibility report looks like. Real data, real competitive analysis, client-ready PDF format.",
};

const mono = "font-marketing-mono";
const surface = "rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0f0f0f]";

function StatusPill({ children, variant }: { children: ReactNode; variant: "green" | "amber" | "red" }) {
  const styles = {
    green: "bg-[rgba(0,232,122,0.12)] text-[#00e87a]",
    amber: "bg-[rgba(245,166,35,0.12)] text-[#f5a623]",
    red: "bg-[rgba(255,64,64,0.12)] text-[#e53e3e]",
  }[variant];
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${mono} ${styles}`}>
      {children}
    </span>
  );
}

const competitiveRows = [
  { rank: 1, brand: "Stanley", mentions: 18, total: 30, delta: "you" as const, barPct: (18 / 30) * 100 },
  { rank: 2, brand: "Owala", mentions: 18, total: 30, delta: "0" as const, barPct: (18 / 30) * 100 },
  { rank: 3, brand: "Thermo Flask", mentions: 17, total: 30, delta: -1, barPct: (17 / 30) * 100 },
  { rank: 4, brand: "Hydro Flask", mentions: 16, total: 30, delta: -2, barPct: (16 / 30) * 100 },
  { rank: 5, brand: "Hydro Flask (variant)", mentions: 2, total: 30, delta: -16, barPct: (2 / 30) * 100 },
];

export default function PreviewPage() {
  return (
    <div className="min-h-screen bg-[#070707] font-marketing-body text-[#efefef]">
      <div className="mx-auto max-w-[900px] px-6 py-20 md:px-6 md:py-[80px]">
        <Link
          className={`${mono} mb-10 inline-block text-[13px] text-[#555] transition-colors hover:text-[#efefef]`}
          href="/"
        >
          ← Back to home
        </Link>

        {/* Report header */}
        <div className="flex flex-col gap-8 border-b border-[rgba(255,255,255,0.08)] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className={`${mono} text-[11px] uppercase tracking-[0.14em] text-[#00e87a]`}>AI Authority Report</p>
            <p className="mt-1 text-lg font-medium text-[#efefef]">Stanley — www.stanley1913.com</p>
            <p className={`${mono} mt-1 text-[13px] text-[#555]`}>April 1, 2026</p>
          </div>
          <div className="flex flex-col items-center sm:items-end">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#00e87a]">
              <span className="flex items-baseline gap-0.5">
                <span className="text-[28px] font-light leading-none text-[#efefef]">52</span>
                <span className={`${mono} text-[13px] text-[#555]`}>/100</span>
              </span>
            </div>
            <p className={`${mono} mt-2 text-center text-[11px] text-[#555]`}>Overall score</p>
          </div>
        </div>

        {/* Bottom line */}
        <div className={`${surface} mt-4 px-5 py-4`}>
          <p className={`${mono} text-[10px] uppercase tracking-[0.14em] text-[#555]`}>BOTTOM LINE</p>
          <p className="mt-1 text-sm font-light leading-relaxed text-[#efefef]">
            Stanley appears in 60% of AI answers, ranking first or second in most. You rank #1, but the lead is thin.
          </p>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className={`${surface} px-5 py-4`}>
            <p className="text-[28px] font-light text-[#efefef]">60%</p>
            <p className={`${mono} mt-1 text-[10px] uppercase tracking-[0.12em] text-[#555]`}>MENTION RATE</p>
          </div>
          <div className={`${surface} px-5 py-4`}>
            <p className="text-[28px] font-light text-[#efefef]">60%</p>
            <p className={`${mono} mt-1 text-[10px] uppercase tracking-[0.12em] text-[#555]`}>TOP POSITION</p>
          </div>
          <div className={`${surface} px-5 py-4`}>
            <p className="text-[28px] font-light text-[#e53e3e]">0%</p>
            <p className={`${mono} mt-1 text-[10px] uppercase tracking-[0.12em] text-[#555]`}>AUTHORITY (CITATIONS)</p>
          </div>
        </div>

        {/* Competitive ranking */}
        <section className="mt-8">
          <p className={`${mono} text-[11px] uppercase tracking-[0.14em] text-[#00e87a]`}>COMPETITIVE RANKING</p>
          <div className="mt-4 flex flex-col gap-2">
            {competitiveRows.map((row) => (
              <div
                key={row.rank}
                className={`flex flex-wrap items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0f0f0f] px-4 py-3 sm:gap-3`}
              >
                <span className={`${mono} w-6 shrink-0 text-[13px] text-[#555]`}>#{row.rank}</span>
                <span className="min-w-0 flex-1 text-sm font-medium text-[#efefef]">{row.brand}</span>
                <span className={`${mono} shrink-0 text-[13px] text-[#efefef]`}>
                  {row.mentions}/{row.total}
                </span>
                {row.delta === "you" ? (
                  <span
                    className={`${mono} shrink-0 rounded-full bg-[rgba(0,232,122,0.1)] px-2 py-0.5 text-[10px] text-[#00e87a]`}
                  >
                    YOU
                  </span>
                ) : row.delta === "0" ? (
                  <span className={`${mono} w-10 shrink-0 text-center text-[12px] text-[#555]`}>+0</span>
                ) : (
                  <span className={`${mono} w-10 shrink-0 text-center text-[12px] text-[#e53e3e]`}>{row.delta}</span>
                )}
                <div className="h-1 min-w-[120px] flex-1 basis-full rounded-full bg-[#1a1a1a] sm:basis-auto">
                  <div className="h-full rounded-full bg-[#00e87a]/50" style={{ width: `${row.barPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Model analysis */}
        <section className="mt-10">
          <p className={`${mono} text-[11px] uppercase tracking-[0.14em] text-[#00e87a]`}>MODEL ANALYSIS</p>
          <p className="mt-2 text-sm font-light text-[#777]">
            64 points separate best and worst model. Assistant answers diverge sharply.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[rgba(0,232,122,0.3)] bg-[#0f0f0f] p-5">
              <p className={`${mono} text-[10px] uppercase tracking-[0.14em] text-[#00e87a]`}>OPENAI</p>
              <p className="mt-1 text-4xl font-light text-[#00e87a]">90</p>
              <p className={`${mono} mt-1 text-xs text-[#00e87a]`}>+38 vs avg</p>
              <p className="mt-2 text-[13px] text-[#777]">Strongest surface.</p>
              <span
                className={`${mono} mt-3 inline-block rounded-full bg-[rgba(0,232,122,0.1)] px-2 py-0.5 text-[10px] text-[#00e87a]`}
              >
                WIN
              </span>
            </div>
            <div className={`${surface} p-5`}>
              <p className={`${mono} text-[10px] uppercase tracking-[0.14em] text-[#555]`}>GEMINI</p>
              <p className="mt-1 text-4xl font-light text-[#efefef]">39</p>
              <p className={`${mono} mt-1 text-xs text-[#e53e3e]`}>-13 vs avg</p>
              <p className="mt-2 text-[13px] text-[#777]">Gemini visibility is low.</p>
              <span
                className={`${mono} mt-3 inline-block rounded-full bg-[rgba(245,166,35,0.1)] px-2 py-0.5 text-[10px] text-[#f5a623]`}
              >
                OPPORTUNITY
              </span>
            </div>
            <div className={`${surface} p-5`}>
              <p className={`${mono} text-[10px] uppercase tracking-[0.14em] text-[#555]`}>ANTHROPIC</p>
              <p className="mt-1 text-4xl font-light text-[#efefef]">26</p>
              <p className={`${mono} mt-1 text-xs text-[#e53e3e]`}>-26 vs avg</p>
              <p className="mt-2 text-[13px] text-[#777]">Anthropic visibility is weak.</p>
              <span
                className={`${mono} mt-3 inline-block rounded-full bg-[rgba(255,64,64,0.1)] px-2 py-0.5 text-[10px] text-[#e53e3e]`}
              >
                HIGH PRIORITY
              </span>
            </div>
          </div>
        </section>

        {/* Recommendations */}
        <section className="mt-10">
          <p className={`${mono} text-[11px] uppercase tracking-[0.14em] text-[#00e87a]`}>RECOMMENDATIONS</p>
          <div className="mt-4 flex flex-col gap-2">
            {[
              {
                pri: "HIGH" as const,
                title: "Anthropic Authority Gap",
                body: "Anthropic scores 26, 26 points below your average. Publish comparison and citation-backed pages tuned to Anthropic.",
              },
              {
                pri: "HIGH" as const,
                title: "Competitive Authority Threat",
                body: "Owala is mentioned 18 times vs. your 18. Audit their proof points and counter with differentiated claims.",
              },
              {
                pri: "HIGH" as const,
                title: "Fragile Leadership Position",
                body: "You're #1, but 3 competitors are within striking distance. Raise velocity: proof, citations, and comparison assets.",
              },
              {
                pri: "MED" as const,
                title: "Authority Gap",
                body: "Only 0% of mentions include citations. Earn mentions from trade press, reviews, and trusted third parties.",
              },
            ].map((rec) => (
              <div
                key={rec.title}
                className={`flex flex-col gap-4 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0f0f0f] px-5 py-4 sm:flex-row sm:items-start sm:gap-4`}
              >
                <span
                  className={`${mono} mt-0.5 inline-flex shrink-0 items-center whitespace-nowrap rounded px-2 py-1 text-[10px] ${
                    rec.pri === "HIGH"
                      ? "bg-[rgba(255,64,64,0.1)] text-[#e53e3e]"
                      : "bg-[rgba(245,166,35,0.1)] text-[#f5a623]"
                  }`}
                >
                  {rec.pri}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#efefef]">{rec.title}</p>
                  <p className="mt-1 text-[13px] font-light leading-[1.6] text-[#777]">{rec.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data summary */}
        <section className="mt-10">
          <p className={`${mono} text-[11px] uppercase tracking-[0.14em] text-[#00e87a]`}>DATA SUMMARY</p>
          <div className="mt-4 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)]">
            <div
              className={`grid grid-cols-1 gap-0 border-b border-[rgba(255,255,255,0.06)] bg-[#0f0f0f] px-4 py-2.5 sm:grid-cols-[1.2fr_0.5fr_0.5fr_0.7fr_0.9fr]`}
            >
              <span className={`${mono} text-[10px] uppercase tracking-[0.12em] text-[#555]`}>SIGNAL</span>
              <span className={`${mono} hidden text-[10px] uppercase tracking-[0.12em] text-[#555] sm:block`}>COUNT</span>
              <span className={`${mono} hidden text-[10px] uppercase tracking-[0.12em] text-[#555] sm:block`}>RATE</span>
              <span className={`${mono} hidden text-[10px] uppercase tracking-[0.12em] text-[#555] sm:block`}>STATUS</span>
              <span className={`${mono} hidden text-[10px] uppercase tracking-[0.12em] text-[#555] sm:block`}>ACTION</span>
            </div>
            {[
              {
                signal: "Strength (top + strong rec.)",
                count: "18",
                rate: "60%",
                status: <StatusPill variant="green">POSITIVE</StatusPill>,
                action: "Hold position",
              },
              {
                signal: "Mentioned (not top)",
                count: "0",
                rate: "0%",
                status: <StatusPill variant="amber">IMPROVABLE</StatusPill>,
                action: "Win top slot",
              },
              {
                signal: "Vulnerable (not mentioned)",
                count: "12",
                rate: "40%",
                status: <StatusPill variant="red">GAP</StatusPill>,
                action: "Build presence",
              },
              {
                signal: "Authority (citations)",
                count: "0",
                rate: "0%",
                status: <StatusPill variant="amber">IMPROVABLE</StatusPill>,
                action: "Earn citations",
              },
            ].map((r) => (
              <div
                key={r.signal}
                className="grid grid-cols-1 gap-2 border-t border-[rgba(255,255,255,0.06)] px-4 py-3 text-sm text-[#efefef] sm:grid-cols-[1.2fr_0.5fr_0.5fr_0.7fr_0.9fr] sm:items-center"
              >
                <span>{r.signal}</span>
                <span className={`${mono} text-[#efefef]`}>{r.count}</span>
                <span className={`${mono} text-[#efefef]`}>{r.rate}</span>
                <div>{r.status}</div>
                <span className="text-[#777]">{r.action}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <footer className="mt-12 border-t border-[rgba(255,255,255,0.08)] pt-8 text-center">
          <p className="text-xl font-light text-[#efefef]">Want a report like this for your client?</p>
          <p className="mt-2 text-sm text-[#777]">Run a free snapshot in minutes.</p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#00e87a] px-6 py-3 text-sm font-medium text-black transition hover:brightness-110"
            href="/signup"
          >
            Run a free snapshot →
          </Link>
        </footer>
      </div>
    </div>
  );
}
