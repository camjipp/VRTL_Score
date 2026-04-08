import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { stanleyData } from "@/lib/reports/pdf/stanleyData";
import type { ReportData } from "@/lib/reports/pdf/types";

export const metadata: Metadata = {
  title: "Sample Report — VRTL Score",
  description:
    "Preview a client-ready AI visibility briefing: structure and tone of the VRTL Score PDF, without exposing full report content.",
};

const mono = "font-marketing-mono";

const accentGreen = "#00e87a";

const docShell =
  "border border-[#e5e7eb] bg-[#fafafa] text-[#0f1117] shadow-[0_22px_48px_rgba(0,0,0,0.38),0_2px_10px_rgba(0,0,0,0.06)] rounded-[2px]";

/** Public preview only: numeric structure from fixture, no real client / competitor brands. */
function buildPublicPreviewData(base: ReportData): ReportData {
  const clientLabel = "Client Name";

  const brandForTable = (row: ReportData["competitiveTable"][0], idx: number) =>
    row.status === "You" ? clientLabel : `Competitor ${String.fromCharCode(64 + idx)}`;

  return {
    ...base,
    clientName: clientLabel,
    domain: "clientdomain.com",
    date: "Sample snapshot",
    agencyName: "Your Agency",
    meta: { ...base.meta, generated: "Sample snapshot" },
    bottomLine:
      "Your brand appears in a majority of AI answers for this category, often first or second. The field is still contested. Without consistent top-position answers and third-party authority, the lead stays negotiable.",
    competitors: base.competitors.map((row) => ({
      ...row,
      name: row.isClient ? clientLabel : `Competitor ${String.fromCharCode(64 + (row.rank - 1))}`,
    })),
    competitiveTable: base.competitiveTable.map((row, idx) => ({
      ...row,
      brand: brandForTable(row, idx),
    })),
    alerts: {
      win: {
        title: "Strongest model surface",
        detail: "One engine scores well ahead of the rest. Mirror what works there onto weaker surfaces.",
      },
      risk: {
        title: "Contested set",
        detail: "A competitor matches your mention count. Differentiate with proof or risk splitting the default answer.",
      },
      priority: {
        title: "Authority depth",
        detail: "Citation-backed mentions are thin. Add third-party proof so assistants have something concrete to cite.",
      },
    },
    evidencePreview: [
      {
        label: "STRENGTH",
        snippet:
          "Representative answers in this snapshot cite your category and compare named players when recommending options…",
        note: "Maintain proof density where you already win.",
      },
      {
        label: "VULNERABLE",
        snippet:
          "Some responses resolve competitor names inconsistently, which can split how models aggregate entity signals…",
        note: "Tighten canonical naming and structured product context.",
      },
    ],
    strategicTakeaway:
      "You lead the rank table, but a wide spread across models is the risk: assistants can recommend different winners. Standardize facts, citations, and comparison narratives before a competitor locks the default answer.",
    recommendations: base.recommendations.map((r, i) => ({
      ...r,
      title:
        i === 0
          ? "Close the model spread"
          : i === 1
            ? "Win first-position answers"
            : i === 2
              ? "Defend parity at the top"
              : `Follow-on initiative ${i + 1}`,
      insight:
        i === 0
          ? "A large gap separates your strongest and weakest model scores."
          : i === 1
            ? "Mention rate and top-position share both have room to move."
            : i === 2
              ? "A peer matches your visibility on head-to-head queries."
              : "Patterns in this snapshot point to a focused next step.",
      explanation:
        "The full PDF walks through rationale, evidence, and sequencing—omitted here to keep this preview high-level.",
      action: "See the complete export for step-by-step guidance tailored to this snapshot.",
      expectedOutcome: "Detailed outcomes and checkpoints are included in the full briefing.",
    })),
  };
}

function avgOf(models: ReportData["modelScores"]) {
  return models.length ? Math.round(models.reduce((s, m) => s + m.score, 0) / models.length) : 0;
}

/** Semi-circular score arc — same geometry as PDF `ScoreRing`, scaled for web */
function PreviewScoreRing({ score }: { score: number | null }) {
  const W = 140;
  const H = 100;
  const CX = 70;
  const CY = 50;
  const R = 44;
  const sw = 9;
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const arcLen = (270 / 360) * (2 * Math.PI * R);
  const filled = pct * arcLen;
  const rest = Math.max(0.001, arcLen - filled);
  const rad = (d: number) => (d * Math.PI) / 180;
  const pt = (angleDeg: number) => ({
    x: CX + R * Math.cos(rad(angleDeg)),
    y: CY + R * Math.sin(rad(angleDeg)),
  });
  const p0 = pt(135);
  const p1 = pt(45);
  const d = `M ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A ${R} ${R} 0 1 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  const display = score == null ? "—" : String(score);

  return (
    <div className="relative mx-auto flex w-[156px] shrink-0 flex-col items-center">
      <div className="relative" style={{ width: W, height: H }}>
        <svg className="absolute left-0 top-0" height={H} viewBox={`0 0 ${W} ${H}`} width={W} aria-hidden>
          <path d={d} fill="none" stroke="#D1D5DB" strokeLinecap="butt" strokeWidth={sw} />
          <path
            d={d}
            fill="none"
            stroke={accentGreen}
            strokeDasharray={`${filled} ${rest + arcLen}`}
            strokeLinecap="butt"
            strokeWidth={sw}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-4 pt-0">
          <span className="font-marketing-body text-[34px] font-bold leading-none tracking-tight text-[#0f1117]">{display}</span>
          <span className={`${mono} mt-0.5 text-[8px] text-[#9ca3af]`}>/100</span>
        </div>
        <p
          className={`absolute bottom-1 left-0 right-0 text-center ${mono} text-[6px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]`}
        >
          Overall score
        </p>
      </div>
    </div>
  );
}

function DocHeader({ data }: { data: ReportData }) {
  return (
    <header className="mb-3 flex flex-col justify-between gap-3 border-b border-[#e5e7eb] pb-3 sm:flex-row sm:items-start">
      <div className="min-w-0 max-w-[280px]">
        <p className="font-marketing-body text-[11px] font-bold leading-snug text-[#0f1117]">AI Authority Report</p>
        {data.agencyName ? (
          <p className="mt-1 font-marketing-body text-[9px] font-bold text-[#0f1117]">{data.agencyName}</p>
        ) : null}
      </div>
      <div className="text-left sm:text-right">
        <p className="font-marketing-body text-xl font-bold leading-tight tracking-tight text-[#0f1117]">{data.clientName}</p>
        <p className={`${mono} mt-1 text-[9px] text-[#6b7280]`}>{data.domain}</p>
        <p className={`${mono} mt-1 text-[9px] text-[#6b7280]`}>{data.date}</p>
      </div>
    </header>
  );
}

function DocFooter({ data, pageNum }: { data: ReportData; pageNum: number }) {
  return (
    <footer className="mt-10 flex flex-col gap-1 border-t border-[#e5e7eb] pt-2 sm:flex-row sm:items-center sm:justify-between">
      <span className={`${mono} text-[7px] text-[#9ca3af]`}>Sample · {data.clientName}</span>
      <span className={`${mono} text-[7px] text-[#6b7280]`}>Page {pageNum}</span>
    </footer>
  );
}

function ChapterHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-3 font-marketing-body text-[15px] font-bold tracking-[0.02em] text-[#0f1117]">{title}</h2>
  );
}

/** Fade + light blur at bottom of truncated “pages” */
function PreviewObscurity({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%] bg-gradient-to-b from-transparent via-[#fafafa]/75 to-[#fafafa]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] backdrop-blur-[2px] [mask-image:linear-gradient(to_top,black,transparent)]"
        aria-hidden
      />
    </div>
  );
}

export default function PreviewPage() {
  const data = buildPublicPreviewData(stanleyData);
  const maxM = Math.max(...data.competitors.map((x) => x.mentions), 1);
  const clientM = data.competitors.find((x) => x.isClient)?.mentions ?? 0;
  const avg = avgOf(data.modelScores);
  const scores = data.modelScores.map((m) => m.score);
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;
  const spreadLine = `${spread}-POINT SPREAD`;
  const descLine =
    spread === 0
      ? "No spread across models. Scores align."
      : `${spread} points separate best and worst model. Assistant answers diverge sharply.`;
  const statusUpper = String(data.status).toUpperCase();
  const rankLine = `RANK #${data.rank} OF ${data.rankTotal}`;
  const leadingPill = data.rank === 1 ? "LEADING" : "CHALLENGER";
  const authEmpty = data.authorityScore === 0;

  const firstModel = data.modelScores[0]!;

  return (
    <div className="min-h-screen bg-[#070707] font-marketing-body text-[#efefef]">
      <div className="mx-auto max-w-[720px] px-5 py-16 md:px-8 md:py-20">
        <Link
          className={`${mono} mb-8 inline-block text-[12px] text-[#6b7280] transition-colors hover:text-[#e5e7eb]`}
          href="/"
        >
          ← Back to home
        </Link>

        <p className="mb-10 max-w-[520px] text-[15px] font-light leading-relaxed text-[#a8b0bc]">
          This is a sample AI visibility briefing agencies can brand and send.
        </p>

        {/* Report stack: document pages on dark canvas */}
        <div className="relative mx-auto mb-16 max-w-[640px]">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-6 left-1/2 z-0 w-[92%] -translate-x-1/2"
          >
            <div className="mx-auto h-16 bg-[radial-gradient(ellipse_70%_90%_at_50%_100%,rgba(15,23,42,0.2),rgba(15,23,42,0.06)_45%,transparent_70%)] blur-[14px]" />
          </div>

          {/* Rear — Recommendations (peek) */}
          <div
            className={`${docShell} pointer-events-none absolute left-[3%] top-0 z-0 hidden w-[94%] p-5 opacity-[0.92] md:block`}
            style={{ transform: "translate(-4%, 10%) rotate(-2deg) scale(0.94)" }}
            aria-hidden
          >
            <p className={`${mono} text-[7px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]`}>AI Authority Report</p>
            <p className="mt-1 text-[11px] font-bold text-[#0f1117]">Recommendations</p>
            <p className={`${mono} mt-3 text-[8px] text-[#6b7280]`}>{data.clientName}</p>
            <div className="mt-4 space-y-2">
              <div className="h-2 rounded bg-[#f3f4f6]" />
              <div className="h-2 w-4/5 rounded bg-[#f3f4f6]" />
            </div>
          </div>

          {/* Middle — Model Analysis (peek) */}
          <div
            className={`${docShell} pointer-events-none absolute left-[2%] top-0 z-[1] hidden w-[96%] p-5 md:block`}
            style={{ transform: "translate(-2%, 5%) rotate(-1deg) scale(0.97)" }}
            aria-hidden
          >
            <p className={`${mono} text-[7px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af]`}>AI Authority Report</p>
            <p className="mt-1 text-[11px] font-bold text-[#0f1117]">Model Analysis</p>
            <p className={`${mono} mt-3 text-[8px] text-[#6b7280]`}>{data.clientName}</p>
            <div className="mt-4 flex gap-2">
              <div className="h-12 flex-1 rounded border border-[#e5e7eb] bg-white" />
              <div className="h-12 flex-1 rounded border border-[#e5e7eb] bg-white" />
              <div className="h-12 flex-1 rounded border border-[#e5e7eb] bg-white" />
            </div>
          </div>

          {/* Page 1 — Executive summary (full) */}
          <article
            className={`${docShell} relative z-[3] mx-auto w-full max-w-[600px] px-7 py-8 transition-transform duration-300 ease-out md:px-9 md:py-9 hover:-translate-y-0.5`}
            style={{ transform: "translate(1.5%, 0) rotate(0.6deg)" }}
          >
            <DocHeader data={data} />

            <div className="mb-3 flex flex-col items-stretch gap-0 overflow-hidden rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-4 sm:flex-row sm:items-center">
              <PreviewScoreRing score={data.overallScore} />
              <div className="mx-0 my-3 hidden w-px shrink-0 self-stretch bg-[#e5e7eb] sm:mx-3 sm:my-0 sm:block" aria-hidden />
              <div className="grid min-h-[100px] min-w-0 flex-1 grid-cols-3 gap-2">
                <div className="flex flex-col justify-center rounded border border-[#e5e7eb] bg-white px-2 py-3 text-center">
                  <p className="text-[22px] font-bold tabular-nums leading-none text-[#0f1117]">{data.mentionRate}%</p>
                  <p className={`${mono} mt-2 text-[6px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]`}>
                    Mention rate
                  </p>
                </div>
                <div className="flex flex-col justify-center rounded border border-[#e5e7eb] bg-white px-2 py-3 text-center">
                  <p className="text-[22px] font-bold tabular-nums leading-none text-[#0f1117]">{data.topPosition}%</p>
                  <p className={`${mono} mt-2 text-[6px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]`}>
                    Top position
                  </p>
                </div>
                <div
                  className={`flex flex-col justify-center rounded border border-[#e5e7eb] bg-white px-2 py-3 text-center ${authEmpty ? "opacity-[0.88]" : ""}`}
                >
                  <p
                    className={`text-[22px] font-bold tabular-nums leading-none ${authEmpty ? "text-[#9ca3af]" : "text-[#0f1117]"}`}
                  >
                    {data.authorityScore}%
                  </p>
                  <p
                    className={`${mono} mt-2 text-[6px] font-semibold uppercase tracking-[0.08em] ${authEmpty ? "text-[#9ca3af]" : "text-[#6b7280]"}`}
                  >
                    Authority (citations)
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-3 flex overflow-hidden rounded border border-[#e5e7eb] bg-white">
              <div className="flex flex-1 items-center justify-center border-r border-[#e5e7eb] px-2 py-2.5">
                <p className={`${mono} text-center text-[7.5px] font-bold text-[#374151]`}>{statusUpper}</p>
              </div>
              <div className="flex flex-1 items-center justify-center border-r border-[#e5e7eb] px-2 py-2.5">
                <p className={`${mono} text-center text-[7.5px] font-bold text-[#374151]`}>{rankLine}</p>
              </div>
              <div className="flex flex-1 items-center justify-center px-2 py-2.5">
                <p className={`${mono} text-center text-[7.5px] font-bold text-[#374151]`}>{leadingPill}</p>
              </div>
            </div>

            <div className="mb-4 flex overflow-hidden rounded border border-[#e5e7eb] bg-[#f9fafb]">
              <div className="w-[3px] shrink-0 bg-[#9ca3af]" aria-hidden />
              <div className="min-w-0 px-4 py-3">
                <p className={`${mono} mb-1.5 text-[6px] font-semibold uppercase tracking-[0.15em] text-[#9ca3af]`}>
                  Bottom line
                </p>
                <p className="text-[11px] font-normal leading-[1.74] text-[#0f1117]">{data.bottomLine}</p>
              </div>
            </div>

            <p className={`${mono} mb-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]`}>
              Competitive ranking
            </p>
            <div className="overflow-x-auto overflow-y-hidden rounded border border-[#e5e7eb] bg-white">
              <div className="min-w-[320px]">
                {data.competitors.map((row) => {
                  const widthPct = Math.min(100, Math.max(0, Math.round((row.mentions / maxM) * 100)));
                  const delta = row.isClient ? null : row.mentions - clientM;
                  const deltaStr =
                    delta === null ? "" : delta === 0 ? "0" : delta > 0 ? `+${delta}` : String(delta);
                  const isClient = !!row.isClient;
                  return (
                    <div key={row.rank} className="flex border-b border-[#f3f4f6] last:border-b-0">
                      <div className={`w-[3px] shrink-0 ${isClient ? "bg-[#00e87a]" : "bg-transparent"}`} aria-hidden />
                      <div
                        className={`grid min-w-0 flex-1 grid-cols-[28px_minmax(0,1fr)_minmax(100px,1fr)_3.25rem_3rem] items-center gap-x-2 py-2 pl-2 pr-2 text-[#0f1117] sm:gap-x-3 ${isClient ? "bg-[#E8FAF0]/90" : ""}`}
                      >
                        <span
                          className={`${mono} text-[8.5px] tabular-nums ${isClient ? "font-bold text-[#0f1117]" : "font-medium text-[#9ca3af]"}`}
                        >
                          #{row.rank}
                        </span>
                        <span
                          className={`min-w-0 truncate text-[9px] ${isClient ? "font-bold" : "font-normal text-[#374151]"}`}
                        >
                          {row.name}
                        </span>
                        <div className="h-[7px] min-w-0 rounded bg-[#f3f4f6]">
                          <div
                            className={`h-full rounded ${isClient ? "bg-[#00e87a]" : "bg-[#9ca3af]"}`}
                            style={{ width: `${widthPct}%`, opacity: isClient ? 1 : 0.35 }}
                          />
                        </div>
                        <span className={`${mono} text-right text-[8px] tabular-nums text-[#9ca3af]`}>
                          {row.mentions}/{data.meta.responses}
                        </span>
                        <div className="flex justify-end">
                          {deltaStr !== "" ? (
                            <span
                              className={`rounded px-1.5 py-0.5 ${mono} text-[6.5px] font-bold text-[#6b7280] bg-[#f3f4f6]`}
                            >
                              {deltaStr}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <InsightCard
                variant="win"
                label="WIN"
                title={data.alerts.win.title}
                detail={data.alerts.win.detail}
              />
              <InsightCard
                variant="risk"
                label="RISK"
                title={data.alerts.risk.title}
                detail={data.alerts.risk.detail}
              />
              <InsightCard
                variant="priority"
                label="PRIORITY"
                title={data.alerts.priority.title}
                detail={data.alerts.priority.detail}
              />
            </div>

            <DocFooter data={data} pageNum={1} />
          </article>
        </div>

        <p className={`${mono} mb-3 text-center text-[10px] uppercase tracking-[0.12em] text-[#6b7280]`}>
          Following pages · preview only
        </p>

        {/* Page 2 — partial Model Analysis */}
        <div className="relative mx-auto mb-10 max-w-[600px]">
          <div className="max-h-[min(380px,52vh)] overflow-hidden rounded-[2px] shadow-[0_22px_48px_rgba(0,0,0,0.38),0_2px_10px_rgba(0,0,0,0.06)]">
            <PreviewObscurity>
              <article className={`${docShell} border-0 shadow-none mb-0 px-7 py-8 md:px-9 md:py-9`}>
                <DocHeader data={data} />
                <ChapterHeading title="Model Analysis" />
                <div className="mb-3 flex overflow-hidden rounded border border-[#e5e7eb] bg-[#f9fafb]">
                  <div className="w-[3px] shrink-0 bg-[#6b7280]" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div>
                      <p className="text-[12px] font-bold tracking-wide text-[#0f1117]">{spreadLine}</p>
                      <p className="mt-0.5 text-[8px] leading-snug text-[#374151]">{descLine}</p>
                    </div>
                    <div className="shrink-0 rounded border border-[#e5e7eb] bg-white px-2 py-1.5">
                      <p
                        className={`${mono} max-w-[148px] text-center text-[5px] font-bold uppercase leading-tight tracking-[0.05em] text-[#374151]`}
                      >
                        Highest-leverage opportunity
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
                  <ModelCard model={firstModel} avg={avg} />
                  {data.modelScores.slice(1).map((m, idx) => (
                    <ModelCard key={`${m.name}-${idx}`} model={m} avg={avg} />
                  ))}
                </div>
              </article>
            </PreviewObscurity>
          </div>
          <p className={`${mono} mt-3 text-center text-[9px] text-[#9ca3af]`}>
            Model breakdown, evidence, and takeaway continue in the export.
          </p>
        </div>

        {/* Page 3 — partial Recommendations */}
        <div className="relative mx-auto mb-10 max-w-[600px]">
          <div className="max-h-[min(260px,38vh)] overflow-hidden rounded-[2px] shadow-[0_22px_48px_rgba(0,0,0,0.38),0_2px_10px_rgba(0,0,0,0.06)]">
            <PreviewObscurity>
              <article className={`${docShell} border-0 shadow-none mb-0 px-7 py-8 md:px-9 md:py-9`}>
                <DocHeader data={data} />
                <ChapterHeading title="Recommendations" />
                <p className="mb-4 text-[8px] leading-relaxed text-[#374151]">
                  Urgent first. Work the list in order when bandwidth is thin.
                </p>
                <div className="flex flex-col gap-1.5">
                  {(() => {
                    const r = data.recommendations[0]!;
                    const isHigh = r.priority === "HIGH";
                    return (
                      <div
                        className={`flex flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white lg:flex-row ${isHigh ? "border-l-[3px] border-l-[#DC2626]" : ""}`}
                      >
                        <div className="flex w-full shrink-0 items-center justify-center bg-[#374151] py-3 text-[20px] font-bold text-white lg:w-10 lg:py-0">
                          1
                        </div>
                        <div className="hidden w-px shrink-0 bg-[#e5e7eb] lg:block" aria-hidden />
                        <div className="min-w-0 flex-1 px-3 py-2.5">
                          <span
                            className={`inline-block rounded border border-[#e5e7eb] bg-white px-1.5 py-0.5 ${mono} text-[5.5px] font-bold uppercase tracking-wide text-[#374151]`}
                          >
                            {r.priority} priority
                          </span>
                          <p className="mt-2 text-[10px] font-bold text-[#0f1117]">{r.title}</p>
                          <p className="mt-1 text-[8px] font-bold leading-snug text-[#374151]">{r.insight}</p>
                          <p className={`${mono} mt-2 text-[6px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]`}>
                            Why it matters
                          </p>
                          <p className="mt-1 text-[7.5px] leading-snug text-[#0f1117]">{r.explanation}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </article>
            </PreviewObscurity>
          </div>
          <p className={`${mono} mt-3 text-center text-[9px] text-[#9ca3af]`}>
            Prioritized actions and expected outcomes continue in the export.
          </p>
        </div>

        {/* Data summary — structure only, not readable */}
        <div className="relative mx-auto mb-12 max-w-[600px]">
          <article
            className={`${docShell} relative overflow-hidden px-7 py-8 md:px-9 md:py-9 transition-transform duration-300 ease-out hover:-translate-y-0.5`}
          >
            <DocHeader data={data} />
            <ChapterHeading title="Data Summary" />
            <div className="relative mt-2 space-y-3 opacity-50 blur-[3px] select-none" aria-hidden>
              <div className="h-8 rounded bg-[#f3f4f6]" />
              <div className="h-20 rounded border border-[#e5e7eb] bg-white" />
              <div className="h-20 rounded border border-[#e5e7eb] bg-[#f9fafb]" />
              <div className="h-20 rounded border border-[#e5e7eb] bg-white" />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[32%] bg-gradient-to-b from-transparent to-[#fafafa]" />
            <p className={`${mono} relative z-[1] mt-6 text-center text-[8px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]`}>
              Full signal tables & competitive set in PDF
            </p>
          </article>
        </div>

        <footer className="border-t border-white/10 pt-10 text-center">
          <p className="text-lg font-light text-[#e5e7eb]">Run a free snapshot</p>
          <p className="mt-2 text-sm text-[#9ca3af]">Generate a report like this for one of your clients.</p>
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

function InsightCard({
  variant,
  label,
  title,
  detail,
}: {
  variant: "win" | "risk" | "priority";
  label: string;
  title: string;
  detail: string;
}) {
  const top =
    variant === "win" ? "border-t-[#00e87a]" : variant === "risk" ? "border-t-[#F59E0B]" : "border-t-[#EF4444]";
  const bg =
    variant === "win" ? "bg-[#E8FAF0]" : variant === "risk" ? "bg-[#FEF3C7]" : "bg-[#FEE2E2]";
  const pillBorder =
    variant === "win" ? "border-[#00e87a]" : variant === "risk" ? "border-[#F59E0B]" : "border-[#EF4444]";
  const pillText =
    variant === "win" ? "text-[#0f1117]" : variant === "risk" ? "text-[#0f1117]" : "text-[#0f1117]";

  return (
    <div className={`min-h-[96px] rounded border border-[#e5e7eb] border-t-2 ${top} ${bg} px-3 py-3`}>
      <span
        className={`mb-2 inline-block rounded border bg-white px-1.5 py-0.5 ${mono} text-[6.5px] font-bold uppercase tracking-wide ${pillBorder} ${pillText}`}
      >
        {label}
      </span>
      <p className="text-[9.5px] font-bold leading-snug text-[#0f1117]">{title}</p>
      <p className="mt-2 text-[8px] leading-relaxed text-[#0f1117]">{detail}</p>
    </div>
  );
}

function ModelCard({ model, avg }: { model: ReportData["modelScores"][0]; avg: number }) {
  const scorePct = Math.min(100, Math.max(0, Math.round(model.score)));
  const avgPos = Math.min(100, Math.max(0, Math.round(avg)));
  const innerW = 100;
  const tickLeft = Math.min(Math.max(0, (innerW * avgPos) / 100 - 1), innerW - 2);
  const deltaSign = model.deltaVsAvg >= 0 ? "+" : "−";
  const deltaAbs = Math.abs(model.deltaVsAvg);

  return (
    <div className="min-h-[136px] overflow-hidden rounded-lg border border-[#e5e7eb] bg-white">
      <div className="h-[3px] w-full bg-[#f3f4f6]" />
      <div className="p-2.5">
        <p className={`${mono} mb-1.5 text-[8px] font-bold uppercase tracking-wide text-[#0f1117]`}>
          {model.name}
        </p>
        <p className="text-[28px] font-bold leading-none tracking-tight text-[#0f1117]">{model.score}</p>
        <div className="mt-1.5">
          <span className={`inline-block rounded bg-[#f3f4f6] px-1.5 py-1 ${mono} text-[7px] font-bold text-[#374151]`}>
            {deltaSign}
            {deltaAbs} vs avg
          </span>
        </div>
        <div className="mb-1 mt-1.5 h-px w-full max-w-[100px] bg-[#e5e7eb]" />
        <div className="relative mb-0.5 w-full max-w-[100px]">
          <div className="h-1.5 w-full overflow-hidden rounded bg-[#f3f4f6]">
            <div className="h-full rounded-l bg-[#00e87a]" style={{ width: `${scorePct}%` }} />
          </div>
          <div
            className="absolute top-[-2px] h-[9px] w-0.5 bg-[#9ca3af]"
            style={{ left: `${tickLeft}px` }}
            aria-hidden
          />
        </div>
        <p className={`${mono} mb-2 text-[6px] text-[#9ca3af]`}>avg {avg}</p>
        <ul className="space-y-1">
          {model.insights.slice(0, 1).map((line, idx) => (
            <li key={idx} className="flex gap-1.5 text-[6.5px] leading-snug text-[#0f1117]">
              <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#9ca3af]" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
