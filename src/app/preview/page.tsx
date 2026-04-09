import type { Metadata } from "next";
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

const SIGNUP_HREF = "/signup";

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
    dataSummaryInterpretation:
      "You lead this anonymized sample, but the rates below show where answers still omit the brand or lack citations—treat those rows as unstable recommendation share until proof and comparisons close the gaps.",
    recommendedNextSteps:
      "What happens next: we run this as an ongoing program—monthly or agreed snapshots, sequencing the fixes above, and re-measurement by assistant family. Your team approves positioning and risk; we execute audits, page and schema work, citation outreach, and iteration against the weakest surfaces first. Typical shape: 90-day sprints with snapshot checkpoints.",
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
    <footer className="mt-6 flex flex-col gap-1 border-t border-[#e5e7eb] pt-2 sm:flex-row sm:items-center sm:justify-between">
      <span className={`${mono} text-[7px] text-[#9ca3af]`}>Sample · {data.clientName}</span>
      <span className={`${mono} text-[7px] text-[#6b7280]`}>Page {pageNum}</span>
    </footer>
  );
}

/** Pages 2+ as a deck behind page 1: stepped offset, scale, progressive blur/opacity, per-layer shadow. */
function ReportDeckBehind({ clientName }: { clientName: string }) {
  const sheet =
    "absolute inset-0 origin-top rounded-[2px] border border-[#e5e7eb] bg-[#fafafa] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.14)]";
  return (
    <>
      <div
        className={`${sheet} z-0 blur-md opacity-[0.72]`}
        style={{ transform: "translate(12px, 14px) scale(0.94)" }}
        aria-hidden
      >
        <p className={`${mono} text-[7px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]`}>AI Authority Report</p>
        <p className="mt-1 text-[10px] font-bold text-[#0f1117]">Data Summary</p>
        <p className={`${mono} mt-2 text-[7px] text-[#6b7280]`}>{clientName}</p>
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 rounded bg-[#e5e7eb]" />
          <div className="h-1.5 w-[82%] rounded bg-[#e5e7eb]" />
        </div>
      </div>
      <div
        className={`${sheet} z-[1] blur-md opacity-[0.78]`}
        style={{ transform: "translate(8px, 9px) scale(0.96)" }}
        aria-hidden
      >
        <p className={`${mono} text-[7px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]`}>AI Authority Report</p>
        <p className="mt-1 text-[10px] font-bold text-[#0f1117]">Recommendations</p>
        <p className={`${mono} mt-2 text-[7px] text-[#6b7280]`}>{clientName}</p>
        <div className="mt-3 h-9 rounded bg-[#f3f4f6]" />
      </div>
      <div
        className={`${sheet} z-[2] blur-sm opacity-90`}
        style={{ transform: "translate(4px, 5px) scale(0.98)" }}
        aria-hidden
      >
        <p className={`${mono} text-[7px] font-semibold uppercase tracking-[0.12em] text-[#9ca3af]`}>AI Authority Report</p>
        <p className="mt-1 text-[10px] font-bold text-[#0f1117]">Model Analysis</p>
        <p className={`${mono} mt-2 text-[7px] text-[#6b7280]`}>{clientName}</p>
        <div className="mt-3 flex gap-1.5">
          <div className="h-10 flex-1 rounded border border-[#e5e7eb] bg-white" />
          <div className="h-10 flex-1 rounded border border-[#e5e7eb] bg-white" />
          <div className="h-10 flex-1 rounded border border-[#e5e7eb] bg-white" />
        </div>
      </div>
    </>
  );
}

function LockIcon({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}

export default function PreviewPage() {
  const data = buildPublicPreviewData(stanleyData);
  const maxM = Math.max(...data.competitors.map((x) => x.mentions), 1);
  const clientM = data.competitors.find((x) => x.isClient)?.mentions ?? 0;
  const statusUpper = String(data.status).toUpperCase();
  const rankLine = `RANK #${data.rank} OF ${data.rankTotal}`;
  const leadingPill = data.rank === 1 ? "LEADING" : "CHALLENGER";
  const authEmpty = data.authorityScore === 0;
  const previewCompetitors = data.competitors.filter((r) => r.rank <= 3);

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

        {/* Gated preview: sharp page 1 + deck behind + centered lock card (whole stack → signup) */}
        <div className="relative mx-auto mb-16 w-full max-w-[600px] overflow-visible pb-6 pr-2 pt-1 md:pb-8 md:pr-3">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-2 left-1/2 z-0 w-[92%] max-w-[540px] -translate-x-1/2"
          >
            <div className="mx-auto h-12 bg-[radial-gradient(ellipse_72%_90%_at_50%_100%,rgba(15,23,42,0.22),rgba(15,23,42,0.05)_48%,transparent_72%)] blur-[12px] md:h-14" />
          </div>

          <Link
            href={SIGNUP_HREF}
            className="group/stack block w-full rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-[#00e87a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#070707]"
            aria-label="Unlock the full AI visibility report — run a free snapshot"
          >
            <div className="relative w-full overflow-visible transition duration-500 ease-out will-change-transform [transform:translateZ(0)] group-hover/stack:scale-[1.018] group-hover/stack:brightness-[1.05]">
              <div className="pointer-events-none absolute inset-0 z-0 overflow-visible" aria-hidden>
                <ReportDeckBehind clientName={data.clientName} />
              </div>

              <article className={`${docShell} relative z-[2] w-full overflow-hidden`}>
            <div className="relative bg-[#fafafa] px-7 pb-5 pt-7 md:px-9 md:pb-6 md:pt-8">
            <DocHeader data={data} />

            <div className="mb-2.5 flex flex-col items-stretch gap-0 overflow-hidden rounded-md border border-[#e5e7eb] bg-[#f9fafb] p-3.5 sm:flex-row sm:items-center">
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

            <div className="mb-3 flex overflow-hidden rounded border border-[#e5e7eb] bg-[#f9fafb]">
              <div className="w-[3px] shrink-0 bg-[#9ca3af]" aria-hidden />
              <div className="min-w-0 px-3 py-2.5">
                <p className={`${mono} mb-1 text-[6px] font-semibold uppercase tracking-[0.15em] text-[#9ca3af]`}>
                  Bottom line
                </p>
                <p className="line-clamp-4 text-[10.5px] font-normal leading-[1.68] text-[#0f1117]">{data.bottomLine}</p>
              </div>
            </div>

            <p className={`${mono} mb-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]`}>
              Competitive ranking
            </p>
            <div className="overflow-x-auto overflow-y-hidden rounded border border-[#e5e7eb] bg-white">
              <div className="min-w-[320px]">
                {previewCompetitors.map((row) => {
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

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
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
            </div>
              </article>

              <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center p-4 sm:p-8">
                <div className="w-full max-w-[360px] rounded-xl border border-white/10 bg-black/40 px-6 py-7 text-center text-white shadow-2xl shadow-black/40 backdrop-blur-md transition-all duration-500 ease-out opacity-[0.92] group-hover/stack:opacity-100 group-hover/stack:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.55)] sm:px-8 sm:py-8">
                  <LockIcon className="mx-auto h-10 w-10 text-white" strokeWidth={1.75} />
                  <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">
                    Unlock the full briefing
                  </h2>
                  <ul className="mt-5 space-y-2.5 text-left text-[13px] font-normal leading-snug text-white/90">
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00e87a]" aria-hidden />
                      <span>Per-model scores, evidence excerpts, and strategic takeaway</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00e87a]" aria-hidden />
                      <span>Competitor displacement signals and full ranking context</span>
                    </li>
                    <li className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#00e87a]" aria-hidden />
                      <span>Prioritized actions and client-ready PDF export</span>
                    </li>
                  </ul>
                  <span className="mt-7 inline-flex w-full max-w-[280px] items-center justify-center rounded-full bg-[#00e87a] px-5 py-2.5 text-sm font-medium text-black transition group-hover/stack:brightness-110">
                    Run a free snapshot →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <footer className="border-t border-white/10 pt-10 text-center">
          <p className="text-lg font-light text-[#e5e7eb]">Run a free snapshot</p>
          <p className="mt-2 text-sm text-[#9ca3af]">Generate a report like this for one of your clients.</p>
          <Link
            className="mt-6 inline-flex items-center justify-center rounded-full bg-[#00e87a] px-6 py-3 text-sm font-medium text-black transition hover:brightness-110"
            href={SIGNUP_HREF}
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
    <div className={`min-h-[84px] rounded border border-[#e5e7eb] border-t-2 ${top} ${bg} px-2.5 py-2.5`}>
      <span
        className={`mb-1.5 inline-block rounded border bg-white px-1.5 py-0.5 ${mono} text-[6px] font-bold uppercase tracking-wide ${pillBorder} ${pillText}`}
      >
        {label}
      </span>
      <p className="text-[9px] font-bold leading-snug text-[#0f1117]">{title}</p>
      <p className="mt-1 line-clamp-3 text-[7.5px] leading-relaxed text-[#0f1117]">{detail}</p>
    </div>
  );
}
