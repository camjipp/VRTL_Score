import type { Metadata } from "next";
import Link from "next/link";

import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import { stanleyData } from "@/lib/reports/pdf/stanleyData";
import type { ReportData } from "@/lib/reports/pdf/types";

export const metadata: Metadata = {
  title: "Sample Report — VRTL Score",
  description:
    "See what a VRTL Score AI visibility report looks like. Real data, real competitive analysis, client-ready PDF format.",
};

const mono = "font-marketing-mono";

/** Mirrors `src/lib/reports/pdf/theme.ts` for product-truth alignment */
const c = {
  ink: "#0F1117",
  ink2: "#374151",
  ink3: "#6B7280",
  ink4: "#9CA3AF",
  rule: "#E5E7EB",
  surface: "#F9FAFB",
  surface2: "#F3F4F6",
  cyan: "#00e87a",
  cyanLight: "#E8FAF0",
  greenLight: "#E8FAF0",
  orange: "#F59E0B",
  orangeLight: "#FEF3C7",
  red: "#EF4444",
  redLight: "#FEE2E2",
} as const;

const docShell =
  "border border-[#e5e7eb] bg-[#fafafa] text-[#0f1117] shadow-[0_22px_48px_rgba(0,0,0,0.38),0_2px_10px_rgba(0,0,0,0.06)] rounded-[2px]";

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
            stroke={c.cyan}
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
      <span className={`${mono} text-[7px] text-[#9ca3af]`}>Confidential: {data.clientName}</span>
      <span className={`${mono} text-[7px] text-[#6b7280]`}>Page {pageNum}</span>
    </footer>
  );
}

function ChapterHeading({ title }: { title: string }) {
  return (
    <h2 className="mb-3 font-marketing-body text-[15px] font-bold tracking-[0.02em] text-[#0f1117]">{title}</h2>
  );
}

function SignalPill({ status }: { status: ReportData["signalSummary"][0]["status"] }) {
  const bg =
    status === "positive"
      ? "bg-[#E8FAF0]"
      : status === "improvable"
        ? "bg-[#FEF3C7]"
        : status === "gap"
          ? "bg-[#FEE2E2]"
          : "bg-[#F3F4F6]";
  const label = status.toUpperCase();
  return (
    <span
      className={`inline-flex rounded px-2 py-1 ${mono} text-[6.5px] font-bold uppercase tracking-wide text-[#0f1117] ${bg}`}
    >
      {label}
    </span>
  );
}

export default function PreviewPage() {
  const data = stanleyData;
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

  return (
    <div className="min-h-screen bg-[#070707] font-marketing-body text-[#efefef]">
      <div className="mx-auto max-w-[720px] px-5 py-16 md:px-8 md:py-20">
        <Link
          className={`${mono} mb-12 inline-block text-[12px] text-[#6b7280] transition-colors hover:text-[#e5e7eb]`}
          href="/"
        >
          ← Back to home
        </Link>

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

          {/* Page 1 — Executive summary (matches PDF Page1Overview) */}
          <article
            className={`${docShell} relative z-[3] mx-auto w-full max-w-[600px] px-7 py-8 transition-transform duration-300 ease-out md:px-9 md:py-9 hover:-translate-y-0.5`}
            style={{ transform: "translate(1.5%, 0) rotate(0.6deg)" }}
          >
            <DocHeader data={data} />

            {/* Score + KPI hero */}
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

            {/* Status strip */}
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

            {/* Bottom line callout */}
            <div className="mb-4 flex overflow-hidden rounded border border-[#e5e7eb] bg-[#f9fafb]">
              <div className="w-[3px] shrink-0 bg-[#9ca3af]" aria-hidden />
              <div className="min-w-0 px-4 py-3">
                <p className={`${mono} mb-1.5 text-[6px] font-semibold uppercase tracking-[0.15em] text-[#9ca3af]`}>
                  Bottom line
                </p>
                <p className="text-[11px] font-normal leading-[1.74] text-[#0f1117]">{data.bottomLine}</p>
              </div>
            </div>

            {/* Competitive ranking */}
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

            {/* Win / Risk / Priority */}
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

        {/* Page 2 — Model Analysis */}
        <article
          className={`${docShell} mx-auto mb-10 w-full max-w-[600px] px-7 py-8 transition-transform duration-300 ease-out md:px-9 md:py-9 hover:-translate-y-0.5`}
        >
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
                <p className={`${mono} max-w-[148px] text-center text-[5px] font-bold uppercase leading-tight tracking-[0.05em] text-[#374151]`}>
                  Highest-leverage opportunity
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {data.modelScores.map((m, idx) => (
              <ModelCard key={`${m.name}-${idx}`} model={m} avg={avg} />
            ))}
          </div>

          <p className={`${mono} mb-2 mt-6 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]`}>
            Evidence preview
          </p>
          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {data.evidencePreview.map((ev, i) => (
              <div
                key={i}
                className="flex min-h-[128px] overflow-hidden rounded border border-[#e5e7eb] bg-white"
              >
                <div className="w-[3px] shrink-0 bg-[#6b7280]" aria-hidden />
                <div className="min-w-0 flex-1 px-2.5 py-2.5">
                  <p className={`${mono} mb-1 text-[6.5px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]`}>
                    {formatEvidenceLogPillLabel(ev.label)}
                  </p>
                  <div className="min-h-[74px] rounded border border-[#e5e7eb] bg-[#f9fafb] px-1.5 py-2">
                    <p className={`${mono} text-[6.5px] leading-snug text-[#374151]`}>{ev.snippet}</p>
                  </div>
                  {ev.note ? <p className="mt-2.5 text-[8px] leading-snug text-[#0f1117]">{ev.note}</p> : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex overflow-hidden rounded border border-[#e5e7eb] bg-[#f3f4f6]">
            <div className="w-[3px] shrink-0 bg-[#0f1117]" aria-hidden />
            <div className="min-w-0 px-3 py-4">
              <p className={`${mono} mb-1.5 text-[7px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]`}>
                Strategic takeaway
              </p>
              <p className="text-[9px] leading-relaxed text-[#0f1117]">{data.strategicTakeaway}</p>
            </div>
          </div>

          <DocFooter data={data} pageNum={2} />
        </article>

        {/* Page 3 — Recommendations */}
        <article
          className={`${docShell} mx-auto mb-10 w-full max-w-[600px] px-7 py-8 transition-transform duration-300 ease-out md:px-9 md:py-9 hover:-translate-y-0.5`}
        >
          <DocHeader data={data} />
          <ChapterHeading title="Recommendations" />
          <p className="mb-4 text-[8px] leading-relaxed text-[#374151]">
            Urgent first. Work the list in order when bandwidth is thin.
          </p>

          <div className="flex flex-col gap-1.5">
            {data.recommendations.map((r, i) => {
              const isHigh = r.priority === "HIGH";
              return (
                <div
                  key={`${r.title}-${i}`}
                  className={`flex flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white lg:flex-row ${isHigh ? "border-l-[3px] border-l-[#DC2626]" : ""}`}
                >
                  <div className="flex w-full shrink-0 items-center justify-center bg-[#374151] py-3 text-[20px] font-bold text-white lg:w-10 lg:py-0">
                    {i + 1}
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
                    <p className={`${mono} mt-2 text-[6px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]`}>
                      Recommended action
                    </p>
                    <p className="mt-1 text-[7.5px] leading-snug text-[#0f1117]">{r.action}</p>
                  </div>
                  <div className="hidden w-px shrink-0 bg-[#e5e7eb] lg:block" aria-hidden />
                  <div className="hidden w-full shrink-0 bg-[#f3f4f6] px-2.5 py-2.5 lg:block lg:w-[132px]">
                    <p className={`${mono} text-[5.5px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]`}>
                      Expected outcome
                    </p>
                    <div className="mb-1.5 mt-1.5 h-px w-14 bg-[#e5e7eb]" />
                    <p className="text-[8px] font-bold leading-snug text-[#0f1117]">{r.expectedOutcome}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <DocFooter data={data} pageNum={3} />
        </article>

        {/* Page 5 — Data summary (tables match PDF Page5) */}
        <article
          className={`${docShell} mx-auto mb-12 w-full max-w-[600px] px-7 py-8 transition-transform duration-300 ease-out md:px-9 md:py-9 hover:-translate-y-0.5`}
        >
          <DocHeader data={data} />
          <ChapterHeading title="Data Summary" />

          <p className={`${mono} mb-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]`}>Signals</p>
          <div className="mb-6 overflow-x-auto rounded border border-[#e5e7eb]">
            <div className="min-w-[540px]">
              <div className="grid grid-cols-[184px_44px_44px_100px_168px] bg-[#f3f4f6] px-2 py-2.5 text-[#6b7280]">
                <span className={`${mono} text-[6.5px] font-semibold uppercase tracking-wide`}>Signal</span>
                <span className={`${mono} text-center text-[6.5px] font-semibold uppercase tracking-wide`}>Count</span>
                <span className={`${mono} text-center text-[6.5px] font-semibold uppercase tracking-wide`}>Rate</span>
                <span className={`${mono} text-[6.5px] font-semibold uppercase tracking-wide`}>Status</span>
                <span className={`${mono} text-right text-[6.5px] font-semibold uppercase tracking-wide`}>Action</span>
              </div>
              {data.signalSummary.map((row, i) => (
                <div
                  key={row.signal}
                  className={`grid grid-cols-[184px_44px_44px_100px_168px] items-center border-t border-[#e5e7eb] px-2 py-3 text-[8.5px] text-[#0f1117] ${i % 2 === 1 ? "bg-[#f9fafb]" : "bg-white"}`}
                >
                  <span className="flex items-center gap-2 pr-2 font-bold">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e87a]" aria-hidden />
                    {row.signal}
                  </span>
                  <span className={`${mono} text-center tabular-nums`}>{row.count}</span>
                  <span className={`${mono} text-center`}>{row.rate}</span>
                  <div>
                    <SignalPill status={row.status} />
                  </div>
                  <span className={`text-right text-[8px] text-[#374151]`}>{row.actionNote}</span>
                </div>
              ))}
            </div>
          </div>

          <p className={`${mono} mb-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]`}>
            Competitive set
          </p>
          <div className="overflow-x-auto rounded border border-[#e5e7eb]">
            <div className="min-w-[540px]">
              <div className="grid grid-cols-[108px_176px_48px_48px_52px_108px] bg-[#f3f4f6] px-2 py-2.5">
                <span className={`${mono} text-[6.5px] font-semibold uppercase tracking-wide text-[#6b7280]`}>Brand</span>
                <span className={`${mono} text-[6.5px] font-semibold uppercase tracking-wide text-[#6b7280]`}>
                  Mentions
                </span>
                <span className={`${mono} text-right text-[6.5px] font-semibold uppercase tracking-wide text-[#6b7280]`}>
                  #
                </span>
                <span className={`${mono} text-right text-[6.5px] font-semibold uppercase tracking-wide text-[#6b7280]`}>
                  Rate
                </span>
                <span className={`${mono} text-right text-[6.5px] font-semibold uppercase tracking-wide text-[#6b7280]`}>
                  vs.
                </span>
                <span className={`${mono} text-[6.5px] font-semibold uppercase tracking-wide text-[#6b7280]`}>Status</span>
              </div>
              {(() => {
                const maxCmp = Math.max(...data.competitiveTable.map((r) => r.mentions), 1);
                return data.competitiveTable.map((row, i) => {
                  const wPct = Math.min(100, Math.max(0, Math.round((row.mentions / maxCmp) * 100)));
                  const isYou = row.status === "You";
                  const pill =
                    row.status === "You"
                      ? { bg: c.cyanLight, fg: c.ink }
                      : row.status === "Tied"
                        ? { bg: c.surface2, fg: c.ink }
                        : row.status === "Behind"
                          ? { bg: c.greenLight, fg: c.ink }
                          : row.status === "Ahead"
                            ? { bg: c.redLight, fg: c.ink }
                            : { bg: c.surface2, fg: c.ink };
                  const statusTxt =
                    row.status === "You"
                      ? "YOU"
                      : row.status === "Tied" || row.status === "Ahead" || row.status === "Behind"
                        ? row.status.toUpperCase()
                        : "—";
                  return (
                    <div
                      key={row.brand}
                      className={`grid grid-cols-[108px_176px_48px_48px_52px_108px] items-center border-t border-[#e5e7eb] px-2 py-3 text-[8.5px] ${isYou ? "border-l-[3px] border-l-[#00e87a] bg-[#f9fafb]" : i % 2 === 1 ? "bg-[#f9fafb]" : "bg-white"}`}
                    >
                      <span className={isYou ? "font-bold text-[#0f1117]" : "text-[#0f1117]"}>{row.brand}</span>
                      <div className="pr-2">
                        <div className="h-[6px] w-full overflow-hidden rounded bg-[#f3f4f6]">
                          <div
                            className={`h-full rounded ${isYou ? "bg-[#00e87a]" : "bg-[#9ca3af]"}`}
                            style={{ width: `${wPct}%`, opacity: isYou ? 1 : 0.4 }}
                          />
                        </div>
                      </div>
                      <span className={`${mono} text-right tabular-nums ${isYou ? "font-bold" : ""}`}>
                        {row.mentions}
                      </span>
                      <span className={`${mono} text-right ${isYou ? "font-bold" : ""}`}>{row.rate}</span>
                      <span className={`${mono} text-right font-bold text-[#374151]`}>{row.vsYou}</span>
                      <div>
                        <span
                          className={`inline-block rounded px-1.5 py-0.5 ${mono} text-[6px] font-bold tracking-wide`}
                          style={{ backgroundColor: pill.bg, color: pill.fg }}
                        >
                          {statusTxt}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          <DocFooter data={data} pageNum={5} />
        </article>

        {/* CTA — outside report (marketing chrome on dark canvas) */}
        <footer className="border-t border-white/10 pt-10 text-center">
          <p className="text-lg font-light text-[#e5e7eb]">Want a report like this for your client?</p>
          <p className="mt-2 text-sm text-[#9ca3af]">Run a free snapshot in minutes.</p>
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
  const posPill = model.deltaVsAvg >= 0;
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
          <span
            className={`inline-block rounded px-1.5 py-1 ${mono} text-[7px] font-bold text-[#374151] ${posPill ? "bg-[#f3f4f6]" : "bg-[#f3f4f6]"}`}
          >
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
          {model.insights.map((line, idx) => (
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
