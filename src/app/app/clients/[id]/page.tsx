"use client";

import { useParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useState, useCallback, useRef, type ReactNode } from "react";
import Link from "next/link";

import { BackLink } from "@/components/BackLink";
import { DownloadPdfButton } from "@/components/DownloadPdfButton";
import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════════════════ */
type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
};

type CompetitorRow = {
  id: string;
  name: string;
  website: string | null;
  created_at: string;
};

type SnapshotRow = {
  id: string;
  status: string;
  vrtl_score: number | null;
  score_by_provider: Record<string, number> | null;
  started_at?: string | null;
  completed_at: string | null;
  created_at: string;
  error?: string | null;
};

type SnapshotDetailResponse = {
  snapshot: SnapshotRow & { prompt_pack_version: string | null; client_id: string };
  client: ClientRow;
  competitors: Array<{ id: string; name: string; website: string | null }>;
  summary: {
    responses_count: number;
    client_mentioned_count: number;
    sources_count: number;
    specific_features_count: number;
    top_competitors: Array<{ name: string; count: number }>;
  };
  responses: Array<{
    id: string;
    prompt_ordinal: number | null;
    created_at: string;
    parse_ok: boolean;
    client_mentioned: boolean;
    client_position: string | null;
    recommendation_strength: string | null;
    competitors_mentioned: string[];
    has_sources_or_citations: boolean;
    has_specific_features: boolean;
    evidence_snippet: string | null;
    prompt_text?: string | null;
    raw_text?: string | null;
  }>;
};

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY FUNCTIONS
═══════════════════════════════════════════════════════════════════════════ */
function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    const maybe = e as Record<string, unknown>;
    const msg = typeof maybe.message === "string" ? maybe.message : null;
    const details = typeof maybe.details === "string" ? maybe.details : null;
    const hint = typeof maybe.hint === "string" ? maybe.hint : null;
    const code = typeof maybe.code === "string" ? maybe.code : null;
    const parts = [msg, details, hint].filter(Boolean);
    const base = parts.length ? parts.join(" · ") : "Unknown error";
    return code ? `${base} (code: ${code})` : base;
  }
  return "Unknown error";
}

function getScoreLabel(score: number | null): { label: string; description: string } {
  if (score === null) return { label: "Watchlist", description: "Run a snapshot to diagnose your AI authority architecture" };
  if (score >= 80) return { label: "Dominant", description: "High authority signal density — consistently surfaced and cited across AI models" };
  if (score >= 60) return { label: "Stable", description: "Present across models, but not yet the default authority" };
  if (score >= 40) return { label: "Watchlist", description: "Authority is inconsistent and vulnerable to competitor displacement" };
  return { label: "Losing Ground", description: "Critical authority weakness — rarely surfaced or cited in AI-generated responses" };
}

function getAuthorityStatusTone(score: number | null): string {
  if (score === null) return "border-white/15 bg-white/[0.06] text-text-2";
  if (score >= 80) return "border-authority-dominant/35 bg-authority-dominant/12 text-authority-dominant";
  if (score >= 60) return "border-sky-400/35 bg-sky-400/10 text-sky-200";
  if (score >= 40) return "border-authority-watchlist/35 bg-authority-watchlist/12 text-authority-watchlist";
  return "border-authority-losing/35 bg-authority-losing/12 text-authority-losing";
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-text-3";
  if (score >= 80) return "text-authority-dominant";
  if (score >= 50) return "text-authority-watchlist";
  return "text-authority-losing";
}

function getConfidenceLabel(competitors: number): { label: string; variant: BadgeVariant } {
  if (competitors >= 3) return { label: "High confidence", variant: "success" };
  if (competitors > 0) return { label: "Medium confidence", variant: "warning" };
  return { label: "Low confidence", variant: "danger" };
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function statusVariant(status: string | null | undefined): BadgeVariant {
  const s = String(status ?? "").toLowerCase();
  if (!s) return "neutral";
  if (s.includes("complete") || s.includes("success")) return "success";
  if (s.includes("fail") || s.includes("error") || s.includes("cancel")) return "danger";
  if (s.includes("running") || s.includes("queued") || s.includes("pending")) return "warning";
  return "neutral";
}

function pct(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SNAPSHOT SELECTOR
═══════════════════════════════════════════════════════════════════════════ */
function SnapshotSelector({
  snapshots,
  selectedId,
  onSelect,
}: {
  snapshots: SnapshotRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (snapshots.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-text-2">Snapshot:</label>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-app border border-white/10 bg-surface px-3 py-1.5 text-sm text-text focus:border-white/20 focus:outline-none"
      >
        {snapshots.map((s, idx) => (
          <option key={s.id} value={s.id}>
            {idx === 0 ? "Latest" : new Date(s.created_at).toLocaleDateString()} — {s.vrtl_score ?? "—"}
          </option>
        ))}
      </select>
    </div>
  );
}

function faviconDomain(website: string | null): string | null {
  if (!website) return null;
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/* Build one strong diagnosis sentence for the verdict. */
function getVerdictSentence(
  score: number | null,
  providers: [string, number][],
  detail: SnapshotDetailResponse | null
): string {
  if (score === null || providers.length === 0) {
    return "Run a snapshot to diagnose your AI authority.";
  }
  const sorted = [...providers].sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0];
  const weakestName = getProviderDisplayName(weakest[0]);
  const weakestScore = weakest[1];
  const mentionRate = detail ? pct(detail.summary.client_mentioned_count, detail.summary.responses_count || 1) : null;
  if (weakestScore < 40) {
    return `${weakestName} authority is critically underperforming, creating displacement risk.`;
  }
  if (weakestScore < 60) {
    return `${weakestName} authority is underperforming; monitor for displacement.`;
  }
  if (mentionRate !== null && mentionRate < 50) {
    return "Citation coverage is below threshold; authority is vulnerable across models.";
  }
  return "Authority is stable across models; maintain and monitor weakest channel.";
}

/* Compact AI Authority trend line (single meaningful chart under index). */
function AuthorityTrendLine({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;
  const height = 28;
  const width = 160;
  const points = scores.map((val, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  const color = scores[scores.length - 1]! >= 60 ? CHART_COLORS.dominant : scores[scores.length - 1]! >= 40 ? CHART_COLORS.watchlist : CHART_COLORS.losing;
  return (
    <div className="mt-2">
      <span className="text-[10px] uppercase tracking-wider text-text-3 mr-2">AI Authority trend</span>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-7 inline-block w-40" aria-hidden>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {scores.length > 0 && (
          <circle
            cx={(scores.length - 1) / (scores.length - 1) * width}
            cy={height - ((scores[scores.length - 1]! - min) / range) * (height - 4) - 2}
            r="2.5"
            fill={color}
          />
        )}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VERDICT + COMMAND CENTER — briefing top section (PDF dominant, trend line)
═══════════════════════════════════════════════════════════════════════════ */
function VerdictCommandCenter({
  clientName,
  website,
  score,
  previousScore,
  providers,
  detail,
  confidence,
  historicalScores,
  snapshotId,
  snapshots,
  selectedSnapshotId,
  onSelectSnapshotId,
  runSnapshot,
  running,
  snapshotStatus,
}: {
  clientName: string;
  website: string | null;
  score: number | null;
  previousScore: number | null;
  providers: [string, number][];
  detail: SnapshotDetailResponse | null;
  confidence: { label: string; variant: BadgeVariant };
  historicalScores: number[];
  snapshotId: string | null;
  snapshots: SnapshotRow[];
  selectedSnapshotId: string | null;
  onSelectSnapshotId: (id: string) => void;
  runSnapshot: () => void;
  running: boolean;
  snapshotStatus: string | null;
}) {
  const { label } = getScoreLabel(score);
  const delta = score !== null && previousScore !== null ? score - previousScore : null;
  const gapToLeader = score != null ? 100 - score : null;
  const sorted = [...providers].sort((a, b) => b[1] - a[1]);
  const weakestModel = sorted.length > 0 ? getProviderDisplayName(sorted[sorted.length - 1][0]) : "—";
  const domain = faviconDomain(website);
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=48` : null;
  const verdict = getVerdictSentence(score, providers, detail);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
      {/* Left: identity, index, diagnosis, trend */}
      <div className="flex items-start gap-4">
        {faviconUrl && (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
            <img src={faviconUrl} alt="" className="h-9 w-9 object-contain" width={36} height={36} />
          </span>
        )}
        <div>
          <h1 className="text-xl font-semibold text-text">{clientName}</h1>
          {website && (
            <a href={website} target="_blank" rel="noreferrer" className="text-sm text-text-2 hover:text-text mt-0.5 block truncate max-w-[280px]">
              {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          )}
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-text">{score ?? "—"}</span>
            <span className="text-sm text-text-3">AI Authority Index</span>
            {delta !== null && delta !== 0 && (
              <span className={cn("text-sm tabular-nums", delta > 0 ? "text-authority-dominant" : "text-authority-losing")}>
                {delta > 0 ? "+" : ""}{delta} vs last
              </span>
            )}
            <Badge variant={label === "Dominant" ? "success" : label === "Losing Ground" ? "danger" : "warning"}>
              {label}
            </Badge>
          </div>
          <p className="mt-2 text-sm font-medium text-text-2">{verdict}</p>
          <AuthorityTrendLine scores={historicalScores} />
        </div>
      </div>

      {/* Right: PDF primary, Run Snapshot, dropdown, compact metrics */}
      <div className="flex flex-col gap-4 lg:min-w-[240px]">
        {snapshotId && (snapshotStatus?.toLowerCase().includes("complete") || snapshotStatus?.toLowerCase().includes("success")) ? (
          <DownloadPdfButton
            snapshotId={snapshotId}
            variant="default"
            label="Download AI Authority Report (PDF)"
            className="[&_button]:!py-5 [&_button]:!text-lg [&_button]:rounded-xl"
          />
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center text-sm text-text-2">
            Report available after snapshot completes
          </div>
        )}
        <RunSnapshotButton running={running} snapshotStatus={snapshotStatus} onRunSnapshot={runSnapshot} />
        <SnapshotSelector snapshots={snapshots} selectedId={selectedSnapshotId} onSelect={onSelectSnapshotId} />
        <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-center">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-3">Gap to leader</div>
            <div className="mt-0.5 text-sm font-medium tabular-nums text-text">{gapToLeader != null ? `${gapToLeader}` : "—"}</div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-3">Weakest model</div>
            <div className="mt-0.5 text-sm font-medium text-text truncate">{weakestModel}</div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-text-3">Confidence</div>
            <div className="mt-0.5 text-sm font-medium text-text">{confidence.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE SPARKLINE (retained for Advanced Intelligence only)
═══════════════════════════════════════════════════════════════════════════ */
const CHART_COLORS = { dominant: "#22c55e", watchlist: "#f59e0b", losing: "#7f1d1d" } as const;
function ScoreSparkline({ scores, color = CHART_COLORS.dominant }: { scores: number[]; color?: string }) {
  if (scores.length < 2) return null;

  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;
  const height = 40;
  const width = 120;

  const points = scores.map((val, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-30">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dot on latest */}
      {scores.length > 0 && (
        <circle
          cx={width}
          cy={height - ((scores[scores.length - 1] - min) / range) * (height - 8) - 4}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   KEY INSIGHTS (4 punchy cards) — used in Advanced Intelligence
═══════════════════════════════════════════════════════════════════════════ */
function KeyInsightsCards({
  score,
  providers,
  detail,
  competitors,
  confidence,
}: {
  score: number | null;
  providers: [string, number][];
  detail: SnapshotDetailResponse | null;
  competitors: CompetitorRow[];
  confidence: { label: string; variant: BadgeVariant };
}) {
  if (score === null && providers.length === 0) return null;

  const sorted = [...providers].sort((a, b) => b[1] - a[1]);
  const modelGap = sorted.length > 1 ? sorted[0][1] - sorted[sorted.length - 1][1] : 0;
  const topModel = sorted[0];
  const weakModel = sorted[sorted.length - 1];

  const clientMentions = detail?.summary.client_mentioned_count ?? 0;
  const topCompetitors = detail?.summary.top_competitors ?? [];
  const allEntities = [
    { name: "You", count: clientMentions, isClient: true },
    ...topCompetitors.slice(0, 4).map(c => ({ name: c.name, count: c.count, isClient: false })),
  ].sort((a, b) => b.count - a.count);
  const clientRank = allEntities.findIndex(e => e.isClient) + 1;
  const totalEntities = allEntities.length;

  const mentionRate = detail ? pct(detail.summary.client_mentioned_count, detail.summary.responses_count || 1) : null;
  const citationRate = detail ? pct(detail.summary.sources_count, detail.summary.responses_count || 1) : null;

  let topWeakness = "Run snapshot";
  if (mentionRate !== null && mentionRate < 50) {
    topWeakness = `Low visibility — ${mentionRate}% of responses`;
  } else if (citationRate !== null && citationRate < 20) {
    topWeakness = `Citations: ${citationRate}% — authority gap`;
  } else if (modelGap > 40 && weakModel) {
    topWeakness = `${weakModel[0]}: ${weakModel[1]} — ${modelGap}pt behind best`;
  } else if (score !== null && score >= 70) {
    topWeakness = "Strong — maintain";
  }

  const hasCompetitiveData = totalEntities > 1;
  const competitiveValue = hasCompetitiveData ? `#${clientRank} of ${totalEntities}` : "Add competitors";

  return (
    <div className="space-y-3">
      <div className="rounded-app-lg border border-white/5 bg-surface p-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs text-text-3">Cross-Model Alignment</span>
          <span className="text-sm font-medium text-text">{modelGap > 0 ? `${modelGap}pt gap` : "—"}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-app border border-white/5 bg-surface p-3">
          <div className="text-[10px] uppercase tracking-wider text-text-3">Weakest</div>
          <div className="mt-0.5 text-sm font-medium text-text">{weakModel ? `${weakModel[0]} ${weakModel[1]}` : "—"}</div>
        </div>
        <div className="rounded-app border border-white/5 bg-surface p-3">
          <div className="text-[10px] uppercase tracking-wider text-text-3">Standing</div>
          <div className="mt-0.5 text-sm font-medium text-text">{competitiveValue}</div>
          {!hasCompetitiveData && <a href="#competitors" className="mt-1 block text-[10px] text-text-2 hover:text-text">Add →</a>}
        </div>
        <div className="rounded-app border border-white/5 bg-surface p-3">
          <div className="text-[10px] uppercase tracking-wider text-text-3">Confidence</div>
          <div className="mt-0.5 text-sm font-medium text-text">{confidence.label}</div>
        </div>
      </div>
      <div className="rounded-app border border-white/5 bg-surface p-3">
        <div className="text-[10px] uppercase tracking-wider text-text-3">Top Weakness</div>
        <div className="mt-0.5 text-sm font-medium text-text">{topWeakness}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT PERFORMANCE
═══════════════════════════════════════════════════════════════════════════ */
function PromptPerformance({ detail }: { detail: SnapshotDetailResponse | null }) {
  if (!detail) {
    return (
      <div className="rounded-app-lg border border-white/5 bg-surface p-5">
        <h3 className="text-sm font-semibold text-text">Retrieval Performance</h3>
        <p className="mt-2 text-sm text-text-2">Run a snapshot to measure retrieval metrics</p>
      </div>
    );
  }

  const { summary, responses } = detail;
  const total = summary.responses_count || 1;
  
  // Position distribution
  const positions = {
    top: responses.filter(r => r.client_mentioned && r.client_position === "top").length,
    middle: responses.filter(r => r.client_mentioned && r.client_position === "middle").length,
    bottom: responses.filter(r => r.client_mentioned && r.client_position === "bottom").length,
    none: responses.filter(r => !r.client_mentioned).length,
  };

  // Strength distribution
  const strengths = {
    strong: responses.filter(r => r.recommendation_strength === "strong").length,
    moderate: responses.filter(r => r.recommendation_strength === "moderate" || r.recommendation_strength === "weak").length,
    none: responses.filter(r => !r.recommendation_strength || r.recommendation_strength === "none").length,
  };

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-5">
      <h3 className="text-sm font-semibold text-text">Retrieval Performance</h3>
      <p className="text-xs text-text-3 mt-0.5">How AI models surface and position your brand</p>
      
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Mention rate */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-text-3">Mention Rate</span>
            <span className={cn(
              "text-lg font-bold",
              pct(summary.client_mentioned_count, total) >= 70 ? "text-authority-dominant" :
              pct(summary.client_mentioned_count, total) >= 40 ? "text-authority-watchlist" : "text-authority-losing"
            )}>
              {pct(summary.client_mentioned_count, total)}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                pct(summary.client_mentioned_count, total) >= 70 ? "bg-authority-dominant" :
                pct(summary.client_mentioned_count, total) >= 40 ? "bg-authority-watchlist" : "bg-authority-losing"
              )}
              style={{ width: `${pct(summary.client_mentioned_count, total)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-text-3">
            {summary.client_mentioned_count}/{total} prompts
          </div>
        </div>

        {/* Citation rate */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-text-3">Citation Rate</span>
            <span className={cn(
              "text-lg font-bold",
              pct(summary.sources_count, total) >= 50 ? "text-authority-dominant" :
              pct(summary.sources_count, total) >= 20 ? "text-authority-watchlist" : "text-text-2"
            )}>
              {pct(summary.sources_count, total)}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                pct(summary.sources_count, total) >= 50 ? "bg-authority-dominant" :
                pct(summary.sources_count, total) >= 20 ? "bg-authority-watchlist/80" : "bg-white/20"
              )}
              style={{ width: `${pct(summary.sources_count, total)}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-text-3">
            {summary.sources_count}/{total} with sources
          </div>
        </div>
      </div>

      {/* Position breakdown */}
      <div className="mt-5 border-t border-white/5 pt-4">
        <div className="text-xs text-text-3 mb-2">Position when mentioned</div>
        <div className="flex gap-1">
          {positions.top > 0 && (
            <div 
              className="h-6 bg-authority-dominant/80 rounded-l transition-all flex items-center justify-center text-[10px] font-medium text-white"
              style={{ width: `${pct(positions.top, summary.client_mentioned_count || 1)}%`, minWidth: positions.top > 0 ? '24px' : 0 }}
              title={`Top position: ${positions.top}`}
            >
              {positions.top}
            </div>
          )}
          {positions.middle > 0 && (
            <div 
              className="h-6 bg-authority-watchlist/80 transition-all flex items-center justify-center text-[10px] font-medium text-white"
              style={{ width: `${pct(positions.middle, summary.client_mentioned_count || 1)}%`, minWidth: positions.middle > 0 ? '24px' : 0 }}
              title={`Middle position: ${positions.middle}`}
            >
              {positions.middle}
            </div>
          )}
          {positions.bottom > 0 && (
            <div 
              className="h-6 bg-authority-losing/80 rounded-r transition-all flex items-center justify-center text-[10px] font-medium text-white"
              style={{ width: `${pct(positions.bottom, summary.client_mentioned_count || 1)}%`, minWidth: positions.bottom > 0 ? '24px' : 0 }}
              title={`Bottom position: ${positions.bottom}`}
            >
              {positions.bottom}
            </div>
          )}
          {summary.client_mentioned_count === 0 && (
            <div className="h-6 flex-1 rounded bg-surface-2" />
          )}
        </div>
        <div className="mt-2 flex gap-3 text-[10px] text-text-3">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-authority-dominant" /> Top</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-authority-watchlist" /> Middle</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-authority-losing" /> Bottom</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER BREAKDOWN
═══════════════════════════════════════════════════════════════════════════ */
function ProviderBreakdown({ providers }: { providers: [string, number][] }) {
  if (providers.length === 0) {
    return (
      <div className="rounded-app-lg border border-white/5 bg-surface p-4">
        <h3 className="text-sm font-semibold text-text">Model-Specific Signals</h3>
        <p className="mt-1 text-xs text-text-2">Run a snapshot to analyze retrieval alignment</p>
      </div>
    );
  }

  const sorted = [...providers].sort((a, b) => b[1] - a[1]);
  const avg = Math.round(sorted.reduce((sum, [, s]) => sum + s, 0) / sorted.length);

  function getStateBar(score: number): string {
    if (score >= 80) return "border-l-authority-dominant";
    if (score >= 50) return "border-l-authority-watchlist";
    return "border-l-authority-losing";
  }

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text">Model-Specific Signals</h3>
        <span className="text-xs text-text-2">Avg {avg}</span>
      </div>
      <div className="space-y-1">
        {sorted.map(([provider, score]) => {
          const gapFromAvg = score - avg;
          return (
            <div
              key={provider}
              className={cn("flex items-center gap-2 border-l-[3px] py-1.5 px-2 rounded-app", getStateBar(score), "bg-surface-2/20")}
            >
              <span className="w-24 shrink-0 text-xs font-medium text-text truncate">{getProviderDisplayName(provider)}</span>
              <span className={cn("tabular-nums text-sm font-semibold w-8", getScoreColor(score))}>{score}</span>
              {gapFromAvg !== 0 && (
                <span className={cn("text-[10px] tabular-nums", gapFromAvg > 0 ? "text-authority-dominant" : "text-authority-losing")}>
                  {gapFromAvg > 0 ? "+" : ""}{gapFromAvg}
                </span>
              )}
              <div className="flex-1 h-0.5 max-w-20 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-current opacity-40" style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STRATEGIC INSIGHTS & RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════════ */
type StrategicInsight = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  insight: string;
  whyItMatters: string;
  action: string;
  expectedImpact: string;
  consequence: string;
};

function generateStrategicInsights(
  score: number | null,
  providers: [string, number][],
  competitors: CompetitorRow[],
  detail: SnapshotDetailResponse | null
): StrategicInsight[] {
  const insights: StrategicInsight[] = [];
  
  if (score === null) return insights;
  
  const weakProviders = providers.filter(([, s]) => s < 50);
  const strongProviders = providers.filter(([, s]) => s >= 80);
  const avgScore = providers.length > 0 
    ? Math.round(providers.reduce((sum, [, s]) => sum + s, 0) / providers.length) 
    : score;
  
  const mentionRate = detail 
    ? pct(detail.summary.client_mentioned_count, detail.summary.responses_count || 1) 
    : 0;
  const citationRate = detail 
    ? pct(detail.summary.sources_count, detail.summary.responses_count || 1) 
    : 0;
  const topPositionRate = detail?.responses
    ? pct(
        detail.responses.filter(r => r.client_mentioned && r.client_position === "top").length,
        detail.summary.responses_count || 1
      )
    : 0;

  // Check for weak models — HIGH priority
  if (weakProviders.length > 0) {
    const worstModel = weakProviders.sort((a, b) => a[1] - b[1])[0];
    const gap = avgScore - worstModel[1];
    const wName = getProviderDisplayName(worstModel[0]);
    insights.push({
      priority: "HIGH",
      title: `Fix ${wName} retrieval`,
      insight: `${wName} at ${worstModel[1]} — ${gap} pts below your average.`,
      whyItMatters: `${wName} is where you're bleeding authority in model answers.`,
      action: `Add structured schema for key entities. Align content to retrieval-heavy queries for ${wName}.`,
      expectedImpact: `+8–14 pts on ${wName} signal within 60 days.`,
      consequence: `Competitors keep winning that channel until this is fixed.`,
    });
  }
  
  // Competitor threat — HIGH priority
  if (detail?.summary.top_competitors && detail.summary.top_competitors.length > 0) {
    const topCompetitor = detail.summary.top_competitors[0];
    const clientMentions = detail.summary.client_mentioned_count;
    if (topCompetitor.count >= clientMentions) {
      insights.push({
        priority: "HIGH",
        title: `${topCompetitor.name} is beating you in mentions`,
        insight: `${topCompetitor.count} vs your ${clientMentions} in this snapshot.`,
        whyItMatters: "Models surface them first in your category.",
        action: "Publish comparison content vs that brand. Strengthen entity + citation signals they own.",
        expectedImpact: "+4–10 pts mention share when executed.",
        consequence: "They compound default recommendations until you counter.",
      });
    }
  }
  
  // Low mention rate — HIGH priority
  if (mentionRate < 50) {
    insights.push({
      priority: "HIGH",
      title: `Only ${mentionRate}% mention rate`,
      insight: "Below threshold for category consideration.",
      whyItMatters: "Half of category queries never surface you.",
      action: "Ship PR + backlinks + structured data. Target queries models actually retrieve on.",
      expectedImpact: "Aim 70%+ mentions to enter the set.",
      consequence: "Absence compounds across models.",
    });
  }
  
  // Low positioning — MEDIUM priority
  if (topPositionRate < 30 && mentionRate >= 50) {
    insights.push({
      priority: "MEDIUM",
      title: `Top slot only ${topPositionRate}% of mentions`,
      insight: "You're in answers but not first.",
      whyItMatters: "First recommendation wins most clicks.",
      action: "Publish comparison pages and proof (reviews, specs) that models can cite first.",
      expectedImpact: "+4–8 pts top-position share.",
      consequence: "Second place is invisible to many buyers.",
    });
  }
  
  // Low citations — MEDIUM priority
  if (citationRate < 20) {
    insights.push({
      priority: "MEDIUM",
      title: `Citations on ${citationRate}% of mentions`,
      insight: "Below trust threshold for models.",
      whyItMatters: "Uncited brands get deprioritized in retrieval.",
      action: "Place quotable facts on trusted domains. Add schema and source-friendly copy.",
      expectedImpact: "+4–8 pts as citation density rises.",
      consequence: "Competitors with denser citations win retrieval.",
    });
  }
  
  // Competitor tracking — MEDIUM priority
  if (competitors.length < 3) {
    insights.push({
      priority: "MEDIUM",
      title: `Track ${3 - competitors.length} more competitor${3 - competitors.length === 1 ? "" : "s"}`,
      insight: `You have ${competitors.length}/3 minimum for solid benchmarks.`,
      whyItMatters: "Gap analysis stays fuzzy without enough peers.",
      action: "Add named competitors you actually lose deals to.",
      expectedImpact: "Sharper share + gap reads.",
      consequence: "Blind spots on who models prefer.",
    });
  }
  
  // Strong model to replicate — LOW priority
  if (strongProviders.length > 0 && strongProviders.length < providers.length) {
    const bestModel = strongProviders.sort((a, b) => b[1] - a[1])[0];
    const bestName = getProviderDisplayName(bestModel[0]);
    insights.push({
      priority: "LOW",
      title: `${bestName} is healthy — mirror it`,
      insight: `${bestName} at ${bestModel[1]} — your best channel.`,
      whyItMatters: "Same entity patterns can lift weak models.",
      action: "Copy structure, entities, and citation style from winning pages into weak channels.",
      expectedImpact: "+2–5 pts by pattern transfer.",
      consequence: "Leaving the playbook unused wastes lift.",
    });
  }
  
  // Good score with no issues — LOW priority maintenance
  if (score >= 70 && insights.length === 0) {
    insights.push({
      priority: "LOW",
      title: "Hold position",
      insight: "No critical gaps flagged.",
      whyItMatters: "Competitors still ship while you pause.",
      action: "Keep publishing velocity; watch score deltas week to week.",
      expectedImpact: "Avoid silent erosion.",
      consequence: "Complacency loses share slowly then suddenly.",
    });
  }
  
  return insights.slice(0, 12);
}

function Recommendations({
  score,
  providers,
  competitors,
  detail,
}: {
  score: number | null;
  providers: [string, number][];
  competitors: CompetitorRow[];
  detail: SnapshotDetailResponse | null;
}) {
  const insights = generateStrategicInsights(score, providers, competitors, detail);

  if (score === null) {
    return (
      <div className="rounded-app-lg border border-white/5 bg-surface p-4">
        <h3 className="text-sm font-semibold text-text">Strategic Action Plan</h3>
        <p className="mt-1 text-xs text-text-2">Run a snapshot to generate your action plan</p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-app-lg border border-white/5 border-l-authority-dominant bg-surface p-4">
        <h3 className="text-sm font-semibold text-text">No Critical Actions</h3>
        <p className="mt-1 text-xs text-text-2">Authority is performing well. Continue monitoring.</p>
      </div>
    );
  }

  const priorityBar: Record<string, string> = {
    HIGH: "border-l-authority-losing",
    MEDIUM: "border-l-authority-watchlist",
    LOW: "border-l-authority-dominant",
  };

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-4">
      <h3 className="text-sm font-semibold text-text">Strategic Action Plan</h3>
      <p className="mt-0.5 text-[10px] text-text-2">{insights.length} advisory item{insights.length !== 1 ? "s" : ""}</p>
      <div className="mt-3 space-y-1">
        {insights.map((insight, idx) => (
          <details key={idx} className={cn("group rounded-app border-l-[3px] border border-white/5 overflow-hidden", priorityBar[insight.priority])}>
            <summary className="flex cursor-pointer items-center justify-between gap-2 px-3 py-2 hover:bg-surface-2/40">
              <span className="text-sm font-medium text-text">{insight.title}</span>
              <svg className="h-3.5 w-3.5 text-text-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </summary>
            <div className="border-t border-white/5 bg-surface-2/20 px-3 py-2 space-y-2">
              <p className="text-xs text-text-2">{insight.insight}</p>
              <p className="text-[11px] text-text-3">{insight.whyItMatters}</p>
              <p className="text-xs text-text"><span className="text-text-3">Action:</span> {insight.action}</p>
              <p className="text-[11px] text-authority-dominant">{insight.expectedImpact}</p>
              <p className="text-[11px] text-authority-losing italic">{insight.consequence}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   QUICK ACTIONS
═══════════════════════════════════════════════════════════════════════════ */
function SnapshotProgress({ startedAt }: { startedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const progress = Math.min(95, Math.floor((elapsed / 180) * 100));
  
  return (
    <div className="rounded-app-lg border border-white/5 border-l-authority-watchlist bg-surface p-4">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 shrink-0 animate-spin rounded-full border-2 border-white/10 border-t-authority-watchlist" />
        <div className="flex-1">
          <div className="text-sm font-medium text-text">Analyzing AI responses</div>
          <div className="text-xs text-text-2">{minutes}:{seconds.toString().padStart(2, "0")} elapsed · typically 2–3 min</div>
        </div>
      </div>
      <div className="mt-3 h-0.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-authority-watchlist/60 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function RunSnapshotButton({
  running,
  snapshotStatus,
  onRunSnapshot,
  className,
}: {
  running: boolean;
  snapshotStatus: string | null;
  onRunSnapshot: () => void;
  className?: string;
}) {
  if (snapshotStatus === "running") {
    return (
      <span className={cn("inline-flex h-9 w-auto items-center gap-1.5 rounded-md border border-white/10 bg-authority-watchlist/15 px-4 text-xs font-semibold text-authority-watchlist", className)}>
        <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Analyzing...
      </span>
    );
  }

  return (
    <button
      onClick={onRunSnapshot}
      disabled={running}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-white/25 hover:bg-white/10 disabled:opacity-50",
        className
      )}
    >
      {running ? (
        <>
          <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Starting...
        </>
      ) : (
        <>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          Run snapshot
        </>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE TREND CHART
═══════════════════════════════════════════════════════════════════════════ */
function ScoreTrendChart({ scores, dates }: { scores: number[]; dates: string[] }) {
  if (scores.length < 2) {
    return (
      <div className="rounded-app-lg border border-white/5 bg-surface p-5">
        <h3 className="text-sm font-semibold text-text">Score Trend</h3>
        <div className="mt-4 flex h-32 items-center justify-center text-sm text-text-3">
          Run more snapshots to see trends
        </div>
      </div>
    );
  }

  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;
  const height = 120;
  const width = 400;
  const padding = { top: 10, right: 10, bottom: 24, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate points
  const points = scores.map((val, i) => {
    const x = padding.left + (i / (scores.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((val - min) / range) * chartHeight;
    return { x, y, val };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaData = `M ${padding.left} ${padding.top + chartHeight} ${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} Z`;

  // Color based on trend
  const trend = scores[scores.length - 1] - scores[0];
  const color = trend >= 0 ? CHART_COLORS.dominant : CHART_COLORS.losing;

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-5">
      <h3 className="text-sm font-semibold text-text">Score Trend</h3>
      <div className="mt-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '140px' }}>
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(val => {
            const y = padding.top + chartHeight - ((val - min) / range) * chartHeight;
            return (
              <g key={val}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <text x={padding.left - 4} y={y + 3} textAnchor="end" className="text-[9px] fill-text-3">{val}</text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaData} fill="url(#trendGradient)" />
          
          {/* Line */}
          <path d={pathData} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Points */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke={color} strokeWidth="2" />
          ))}

          {/* X-axis labels */}
          {dates.slice(-scores.length).map((date, i) => {
            const x = padding.left + (i / (scores.length - 1)) * chartWidth;
            return (
              <text key={i} x={x} y={height - 4} textAnchor="middle" className="text-[8px] fill-text-3">
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITOR COMPARISON CHART
═══════════════════════════════════════════════════════════════════════════ */
function CompetitorComparisonChart({ 
  clientName, 
  clientMentions, 
  topCompetitors 
}: { 
  clientName: string;
  clientMentions: number;
  topCompetitors: Array<{ name: string; count: number }>;
}) {
  const allEntities = [
    { name: clientName, count: clientMentions, isClient: true },
    ...topCompetitors.slice(0, 4).map(c => ({ ...c, isClient: false }))
  ].sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...allEntities.map(e => e.count), 1);

  const hasData = !(allEntities.length <= 1 && clientMentions === 0);

  // Placeholder competitors for empty state
  const placeholderEntities = [
    { name: "Your Brand", count: 55, isClient: true },
    { name: "Competitor A", count: 72, isClient: false },
    { name: "Competitor B", count: 61, isClient: false },
    { name: "Competitor C", count: 48, isClient: false },
  ].sort((a, b) => b.count - a.count);

  const displayEntities = hasData ? allEntities : placeholderEntities;
  const displayMax = hasData ? maxCount : 72;

  // Find client's rank
  const clientRank = hasData
    ? displayEntities.findIndex(e => e.isClient) + 1
    : null;
  const totalEntities = displayEntities.length;

  return (
    <div className="relative rounded-app-lg border border-white/5 bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text">Competitive Visibility Intelligence</h3>
          <p className="text-xs text-text-3 mt-0.5">AI citation frequency across models</p>
        </div>
        {hasData && clientRank && (
          <div className={cn(
            "rounded-app px-2 py-0.5 text-[10px] font-medium",
            clientRank === 1 ? "bg-authority-dominant/15 text-authority-dominant" : clientRank <= 2 ? "bg-authority-watchlist/15 text-authority-watchlist" : "bg-authority-losing/15 text-authority-losing"
          )}>
            Rank #{clientRank} of {totalEntities}
          </div>
        )}
      </div>

      {/* Blur overlay for empty state */}
      {!hasData && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center rounded-app-lg bg-surface/80 backdrop-blur-[2px]">
          <div className="pointer-events-auto text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
              <svg className="h-5 w-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <p className="mt-2 text-sm font-medium text-text">Add competitors to unlock this</p>
            <p className="mt-1 text-xs text-text-3">Track how you rank against the competition in AI results</p>
          </div>
        </div>
      )}

      <div className={cn("mt-4 space-y-3", !hasData && "select-none")}>
        {displayEntities.map((entity, idx) => (
          <div key={entity.name} className="flex items-center gap-3">
            <span className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold",
              entity.isClient ? "bg-blue-100 text-blue-700" : "bg-surface-2 text-text-3"
            )}>
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium truncate",
                  entity.isClient ? "text-text" : "text-text-2"
                )}>
                  {entity.name}
                  {entity.isClient && (
                    <span className="ml-1.5 inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                      You
                    </span>
                  )}
                </span>
                <span className={cn(
                  "text-sm font-bold tabular-nums ml-2",
                  entity.isClient ? "text-blue-700" : "text-text-3"
                )}>{entity.count}</span>
              </div>
              <div className="h-2.5 rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-500",
                    entity.isClient ? "bg-authority-stable" : "bg-white/10"
                  )}
                  style={{ width: `${(entity.count / displayMax) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODEL INTELLIGENCE MATRIX — centerpiece 3-column grid
═══════════════════════════════════════════════════════════════════════════ */
const MATRIX_MODELS = ["openai", "gemini", "anthropic"] as const;
function getMatrixStatusTag(score: number): "Strong" | "Stable" | "Watchlist" | "Critical" {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Stable";
  if (score >= 40) return "Watchlist";
  return "Critical";
}
function getModelSignals(score: number, detail: SnapshotDetailResponse | null): string[] {
  const signals: string[] = [];
  if (score < 50) signals.push("Retrieval gap detected");
  const mentionRate = detail ? pct(detail.summary.client_mentioned_count, detail.summary.responses_count || 1) : null;
  const citationRate = detail ? pct(detail.summary.sources_count, detail.summary.responses_count || 1) : null;
  if (mentionRate !== null && mentionRate < 50) signals.push("Citation coverage low");
  else if (citationRate !== null && citationRate < 20) signals.push("Authority signal deficiency");
  if (signals.length === 0 && score >= 60) signals.push("Stable retrieval");
  return signals.slice(0, 2);
}

function ModelIntelligenceMatrix({
  providers,
  detail,
}: {
  providers: [string, number][];
  detail: SnapshotDetailResponse | null;
}) {
  const sorted = [...providers].sort((a, b) => b[1] - a[1]);
  const primaryDisplacer = detail?.summary?.top_competitors?.[0]?.name ?? "—";
  const providerByKey = useMemo(() => {
    const map = new Map<string, [string, number]>();
    for (const [provider, score] of providers) {
      const p = provider.toLowerCase();
      if (p.includes("openai") || p.includes("chatgpt")) map.set("openai", [provider, score]);
      else if (p.includes("gemini") || p.includes("google")) map.set("gemini", [provider, score]);
      else if (p.includes("anthropic") || p.includes("claude")) map.set("anthropic", [provider, score]);
    }
    return map;
  }, [providers]);
  const rankByKey = useMemo(() => {
    const map = new Map<string, number>();
    sorted.forEach(([provider], idx) => {
      const p = provider.toLowerCase();
      const key = p.includes("openai") || p.includes("chatgpt") ? "openai" : p.includes("gemini") || p.includes("google") ? "gemini" : "anthropic";
      map.set(key, idx + 1);
    });
    return map;
  }, [sorted]);
  const totalModels = sorted.length || 1;

  return (
    <section>
      <h2 className="text-base font-semibold text-text mb-4">Model Intelligence Matrix</h2>
      {providers.length === 0 && (
        <p className="text-sm text-text-2 mb-4">Run a snapshot to see model-level intelligence.</p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {MATRIX_MODELS.map((key) => {
          const entry = providerByKey.get(key);
          const score = entry ? entry[1] : null;
          const rank = score != null ? (rankByKey.get(key) ?? totalModels) : null;
          const gap = score != null ? 100 - score : null;
          const statusTag = score != null ? getMatrixStatusTag(score) : null;
          const signals = score != null ? getModelSignals(score, detail) : [];
          const label = key === "openai" ? "GPT" : key === "gemini" ? "Gemini" : "Anthropic";
          return (
            <div
              key={key}
              className="rounded-app border border-white/[0.06] bg-surface p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-text">{label}</span>
                {statusTag && (
                  <span
                    className={cn(
                      "text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded",
                      statusTag === "Strong" && "text-authority-dominant bg-authority-dominant/10",
                      statusTag === "Stable" && "text-sky-200 bg-sky-400/10",
                      statusTag === "Watchlist" && "text-authority-watchlist bg-authority-watchlist/10",
                      statusTag === "Critical" && "text-authority-losing bg-authority-losing/10"
                    )}
                  >
                    {statusTag}
                  </span>
                )}
              </div>
              <div className="text-3xl font-semibold tabular-nums text-text">
                {score ?? "—"}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0 text-xs text-text-2">
                {rank != null && <span>Rank {rank}/{totalModels}</span>}
                {gap != null && <span>Gap: {gap} pts</span>}
              </div>
              <div>
                <div className="text-[10px] font-medium uppercase tracking-wider text-text-3">Primary displacer</div>
                <div className="mt-0.5 text-sm text-text">{primaryDisplacer}</div>
              </div>
              {signals.length > 0 && (
                <ul className="space-y-0.5 text-xs text-text-2">
                  {signals.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITIVE AUTHORITY RANKING + HELPERS
═══════════════════════════════════════════════════════════════════════════ */
function getProviderStatus(score: number): { label: string } {
  if (score >= 80) return { label: "Dominant" };
  if (score >= 60) return { label: "Stable" };
  if (score >= 40) return { label: "Watchlist" };
  return { label: "Losing" };
}

/** Central display names for model/provider keys. Use everywhere to avoid casing regressions. */
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  all: "All",
  openai: "OpenAI",
  gemini: "Gemini",
  anthropic: "Anthropic",
};
function getModelDisplayName(key: string): string {
  return MODEL_DISPLAY_NAMES[key.toLowerCase()] ?? key;
}

function getProviderDisplayName(provider: string): string {
  const p = provider.toLowerCase();
  if (p.includes("openai") || p.includes("chatgpt")) return MODEL_DISPLAY_NAMES.openai;
  if (p.includes("gemini") || p.includes("google")) return MODEL_DISPLAY_NAMES.gemini;
  if (p.includes("anthropic") || p.includes("claude")) return MODEL_DISPLAY_NAMES.anthropic;
  return provider;
}

function estimateCompetitorScores(clientScore: number, gap: number): { leader: number; challenger: number } {
  const leader = Math.min(100, Math.max(0, clientScore + Math.max(10, gap * 2)));
  const challenger = Math.min(100, Math.max(0, leader - 7));
  return { leader: Math.round(leader), challenger: Math.round(challenger) };
}

function getRecommendationLabel(score: number): string {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  return "Weak";
}

function CompetitiveAuthorityRanking({
  clientName,
  providers,
  previousProviders,
  detail,
}: {
  clientName: string;
  providers: [string, number][];
  previousProviders: Record<string, number>;
  detail: SnapshotDetailResponse | null;
}) {
  const [activeTab, setActiveTab] = useState<string>("overall");
  if (providers.length === 0) return null;

  const clientMentions = detail?.summary.client_mentioned_count ?? 0;
  const topCompetitors = detail?.summary.top_competitors ?? [];
  const leaderName = topCompetitors[0]?.name ?? "Category Leader";
  const mentionGap = topCompetitors[0] ? Math.max(0, topCompetitors[0].count - clientMentions) : 6;
  const allEntities = [
    { name: "You", count: clientMentions, isClient: true },
    ...topCompetitors.slice(0, 4).map(c => ({ name: c.name, count: c.count, isClient: false })),
  ].sort((a, b) => b.count - a.count);
  const clientRank = allEntities.findIndex(e => e.isClient) + 1;
  const totalEntities = allEntities.length;
  const overallLabel = totalEntities > 1 ? `#${clientRank} of ${totalEntities}` : "—";

  const providerTabs = [...providers].sort((a, b) => b[1] - a[1]).map(([provider]) => ({ id: provider, label: getProviderDisplayName(provider) }));

  return (
    <section>
      <h2 className="text-sm font-semibold text-text mb-3">Competitive Authority Ranking</h2>
      <p className="text-xs text-text-2 mb-3">Overall ranking: {overallLabel}</p>
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab("overall")}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-app",
            activeTab === "overall" ? "bg-white/10 text-text" : "text-text-2 hover:text-text"
          )}
        >
          Overall
        </button>
        {providerTabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-app",
              activeTab === id ? "bg-white/10 text-text" : "text-text-2 hover:text-text"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {activeTab === "overall" ? (
        <div className="text-sm">
          <table className="w-full text-left">
            <tbody>
              {allEntities.map((entity, idx) => (
                <tr key={entity.name} className={cn("border-b border-white/5", entity.isClient && "bg-white/[0.02]")}>
                  <td className="py-2 pr-2 text-text-3 tabular-nums w-6">{idx + 1}</td>
                  <td className="py-2 font-medium text-text">{entity.name}</td>
                  <td className="py-2 text-right tabular-nums text-text-2">{entity.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {[...providers]
            .filter(([p]) => p === activeTab)
            .map(([provider, score]) => {
              const { leader, challenger } = estimateCompetitorScores(score, mentionGap);
              const clientDelta = previousProviders[provider] != null ? score - previousProviders[provider] : null;
              const authorityGap = Math.max(0, leader - score);
              const entities = [
                { name: leaderName, score: leader, isClient: false, delta: null as number | null },
                { name: "Top Challenger", score: challenger, isClient: false, delta: null as number | null },
                { name: clientName, score, isClient: true, delta: clientDelta },
              ].sort((a, b) => b.score - a.score);
              return (
                <table key={provider} className="w-full text-left text-sm">
                  <tbody>
                    {entities.map((entity, idx) => (
                      <tr
                        key={`${entity.name}-${entity.isClient}`}
                        className={cn("border-b border-white/5", entity.isClient && "bg-white/[0.02]")}
                      >
                        <td className="w-6 py-1.5 pr-2 text-text-3 tabular-nums">{idx + 1}</td>
                        <td className="py-1.5">
                          <span className={cn("font-medium", entity.isClient ? "text-text" : "text-text-2")}>{entity.name}</span>
                          <span className="ml-1 text-[10px] text-text-3">{getRecommendationLabel(entity.score)}</span>
                        </td>
                        <td className="py-1.5 text-right tabular-nums font-medium text-text">{entity.score}</td>
                        <td className="py-1.5 text-right w-14">
                          {entity.delta !== null && (
                            <span className={cn("text-[10px]", entity.delta > 0 ? "text-authority-dominant" : entity.delta < 0 ? "text-authority-losing" : "text-text-3")}>
                              {entity.delta > 0 ? "+" : ""}{entity.delta}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            })}
        </div>
      )}
      <p className="mt-2 text-[10px] text-text-3">Leader scores inferred from displacement.</p>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE HEADER — back button (high contrast) + breadcrumb with separators
═══════════════════════════════════════════════════════════════════════════ */
/** Flat section: top rule + rhythm (Linear / Stripe style — no cards) */
function DashboardSection({
  title,
  subtitle,
  children,
  className,
  headerClassName,
  noTopRule,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  /** First block after hero already has border-b — skip duplicate top rule */
  noTopRule?: boolean;
}) {
  return (
    <section className={cn("w-full pt-6 space-y-4", !noTopRule && "border-t border-white/[0.06]", className)}>
      <header className={cn(headerClassName)}>
        <h2 className="text-base font-semibold tracking-tight text-text">{title}</h2>
        {subtitle != null ? <div className="mt-1 max-w-2xl text-sm leading-relaxed text-text-2">{subtitle}</div> : null}
      </header>
      {children}
    </section>
  );
}

function PageHeader({ clientName }: { clientName: string }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/[0.06] pb-4">
      <BackLink href="/app" label="Back to Dashboard" />
      <nav className="flex min-w-0 flex-1 items-center gap-1.5 text-sm" aria-label="Breadcrumb">
        <Link href="/app" className="font-medium text-text-2 transition-colors hover:text-text">Dashboard</Link>
        <span className="text-white/25" aria-hidden>
          /
        </span>
        <Link href="/app" className="font-medium text-text-2 transition-colors hover:text-text">Clients</Link>
        <span className="text-white/25" aria-hidden>
          /
        </span>
        <span className="truncate font-semibold text-text" aria-current="page">
          {clientName}
        </span>
      </nav>
    </header>
  );
}

/* Get chart series for filter: all = overall index, or single model. */
function getChartSeriesForFilter(
  snapshots: SnapshotRow[],
  filter: "all" | "openai" | "gemini" | "anthropic"
): { scores: number[]; dates: string[] } {
  const filtered = snapshots.filter(
    (s) => s.vrtl_score != null && (s.status?.toLowerCase().includes("complete") || s.status?.toLowerCase().includes("success"))
  ).slice(0, 10);
  const reversed = [...filtered].reverse();
  const dates = reversed.map((s) => new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }));
  if (filter === "all") {
    const scores = reversed.map((s) => s.vrtl_score!);
    return { scores, dates };
  }
  const pairs = reversed.map((s) => {
    const by = s.score_by_provider as Record<string, number> | null;
    if (!by) return { date: new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }), score: null as number | null };
    const key = Object.keys(by).find((k) => {
      const p = k.toLowerCase();
      if (filter === "openai") return p.includes("openai") || p.includes("chatgpt");
      if (filter === "gemini") return p.includes("gemini") || p.includes("google");
      if (filter === "anthropic") return p.includes("anthropic") || p.includes("claude");
      return false;
    });
    const score = key != null ? by[key]! : null;
    return { date: new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }), score };
  });
  const valid = pairs.filter((p): p is { date: string; score: number } => p.score != null);
  if (valid.length < 2) return { scores: reversed.map((s) => s.vrtl_score!), dates };
  return { scores: valid.map((p) => p.score), dates: valid.map((p) => p.date) };
}

function getLeaderSeriesByDate(snapshots: SnapshotRow[]): Record<string, number> {
  const filtered = snapshots.filter(
    (s) => s.vrtl_score != null && (s.status?.toLowerCase().includes("complete") || s.status?.toLowerCase().includes("success"))
  ).slice(0, 14);
  const reversed = [...filtered].reverse();
  const out: Record<string, number> = {};
  for (const s of reversed) {
    const dateKey = new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
    const by = s.score_by_provider as Record<string, number> | null;
    if (!by) {
      out[dateKey] = s.vrtl_score ?? 0;
      continue;
    }
    const leader = Math.max(...Object.values(by), s.vrtl_score ?? 0);
    out[dateKey] = leader;
  }
  return out;
}

/* Big trend chart — primary centerpiece: plot fills card, anchored */
const CHART_FILTERS = ["all", "openai", "gemini", "anthropic"] as const;
const CHART_RANGES = [
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
] as const;
const CHART_HEIGHT = 336;
const CHART_PADDING = { top: 2, right: 8, bottom: 10, left: 16 };
const CHART_VIEWBOX_WIDTH = 960;
const CHART_INNER_WIDTH = CHART_VIEWBOX_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
const CHART_INNER_HEIGHT = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
const CHART_Y_TICKS = [0, 50, 100];
const SEGMENT_CONTROL_HEIGHT = 36;

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  if (points.length === 2) return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function BigTrendChart({
  snapshots,
  embedded,
  minimalHeader,
  demoted,
}: {
  snapshots: SnapshotRow[];
  embedded?: boolean;
  /** Hide in-chart narrative when parent supplies section interpretation */
  minimalHeader?: boolean;
  /** Shorter chart + tighter chrome for supporting sections */
  demoted?: boolean;
}) {
  const [filter, setFilter] = useState<typeof CHART_FILTERS[number]>("all");
  const [timeRange, setTimeRange] = useState<(typeof CHART_RANGES)[number]["key"]>("7d");
  const [expanded, setExpanded] = useState(false);
  const rangedSnapshots = useMemo(() => {
    if (snapshots.length === 0) return snapshots;
    const latestTs = snapshots
      .map((s) => new Date(s.created_at).getTime())
      .filter((t) => Number.isFinite(t))
      .reduce((max, t) => Math.max(max, t), 0);
    if (!latestTs) return snapshots;
    const rangeCfg = CHART_RANGES.find((r) => r.key === timeRange) ?? CHART_RANGES[0];
    const cutoff = latestTs - rangeCfg.days * 24 * 60 * 60 * 1000;
    const filtered = snapshots.filter((s) => {
      const ts = new Date(s.created_at).getTime();
      return Number.isFinite(ts) && ts >= cutoff;
    });
    if (timeRange === "7d" && filtered.length < 7) {
      const complete = snapshots.filter(
        (s) => s.vrtl_score != null && (s.status?.toLowerCase().includes("complete") || s.status?.toLowerCase().includes("success"))
      );
      return complete.slice(0, 10);
    }
    return filtered.length >= 2 ? filtered : snapshots;
  }, [snapshots, timeRange]);
  const { scores, dates } = useMemo(() => getChartSeriesForFilter(rangedSnapshots, filter), [rangedSnapshots, filter]);
  const leaderByDate = useMemo(() => getLeaderSeriesByDate(rangedSnapshots), [rangedSnapshots]);

  const trajectoryNote = useMemo(() => {
    if (scores.length < 2) {
      return "Run more snapshots to plot movement and compare models with confidence.";
    }
    const delta = scores[scores.length - 1]! - scores[0]!;
    if (filter === "all") {
      if (delta < -3) return "No recovery — weakest channel still dragging performance.";
      if (delta > 3) return "Closing the gap — keep pressure on weak-channel fixes.";
      return "Flat trajectory — no recovery yet in weakest model channel.";
    }
    if (filter === "openai") {
      return delta < 0
        ? "OpenAI downtrend — entity clarity and citation quality still underperforming."
        : "OpenAI stabilizing — maintain retrieval-focused execution.";
    }
    if (filter === "gemini") {
      return delta < 0
        ? "Gemini downtrend — structured proof gaps remain unresolved."
        : "Gemini trend improving — reinforce winning content patterns.";
    }
    if (filter === "anthropic") {
      return delta < 0
        ? "Downtrend driven by Anthropic weakness."
        : "Anthropic pressure easing — continue execution to sustain lift.";
    }
    return "";
  }, [scores, filter]);

  const segmentControl = (
    <div className="flex w-full items-stretch border-b border-white/[0.06]">
      <div className="inline-flex h-[38px] w-full gap-1" style={{ minHeight: SEGMENT_CONTROL_HEIGHT }}>
        {CHART_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "min-w-0 flex-1 border-b-2 pb-2 pt-1 text-center text-xs font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 focus-visible:ring-offset-transparent",
              filter === f
                ? "border-text text-text"
                : "border-transparent text-text-3 hover:text-text-2"
            )}
          >
            {getModelDisplayName(f)}
          </button>
        ))}
      </div>
    </div>
  );

  const rangeControl = (
    <div className="inline-flex h-[30px] items-center gap-1">
      {CHART_RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          onClick={() => setTimeRange(r.key)}
          className={cn(
            "rounded px-2 py-1 text-[10px] font-semibold tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
            timeRange === r.key ? "text-text bg-white/[0.08]" : "text-text-3 hover:text-text-2"
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  const expandButton = (
    <button
      type="button"
      onClick={() => setExpanded(true)}
      className="inline-flex h-7 w-7 items-center justify-center rounded text-text-2/90 transition-all hover:text-text hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
      aria-label="Expand trajectory chart"
      title="Expand chart"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.6">
        <path d="M7 3H3v4M13 3h4v4M17 13v4h-4M3 13v4h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  const chartShell = "w-full";

  if (scores.length < 2) {
    return (
      <div className={chartShell}>
        <div className={cn("flex flex-wrap items-start justify-between gap-3", demoted ? "mb-2" : "mb-3", minimalHeader && "justify-end")}>
          {!minimalHeader && (
            <div className="min-w-0 flex-1">
              {!embedded && <h3 className="text-base font-semibold tracking-tight text-text">Authority Trajectory</h3>}
              <p className={cn("max-w-xl text-sm leading-relaxed text-text-2", !embedded && "mt-1", demoted && "text-xs")}>{trajectoryNote}</p>
            </div>
          )}
          <div className={cn("flex w-full shrink-0 flex-col gap-1.5", minimalHeader ? "max-w-full md:max-w-full" : "max-w-md lg:w-[min(100%,420px)]")}>
            <div className="flex items-center justify-between gap-2">
              {rangeControl}
              {expandButton}
            </div>
            {segmentControl}
          </div>
        </div>
        <div className={cn("flex items-center justify-center text-sm text-text-3", demoted ? "h-48" : "h-64")}>Run more snapshots to see trends</div>
      </div>
    );
  }

  const max = Math.max(...scores, 100);
  const leaderScores = dates.map((d) => leaderByDate[d] ?? 100);
  const min = Math.min(...scores, ...leaderScores, 0);
  const maxAll = Math.max(max, ...leaderScores, 100);
  const valueRange = maxAll - min || 1;
  const pathPoints = scores.map((val, i) => {
    const x = CHART_PADDING.left + (i / (scores.length - 1)) * CHART_INNER_WIDTH;
    const y = CHART_PADDING.top + CHART_INNER_HEIGHT - ((val - min) / valueRange) * CHART_INNER_HEIGHT;
    return { x, y, val };
  });
  const leaderPoints = leaderScores.map((val, i) => {
    const x = CHART_PADDING.left + (i / (leaderScores.length - 1 || 1)) * CHART_INNER_WIDTH;
    const y = CHART_PADDING.top + CHART_INNER_HEIGHT - ((val - min) / valueRange) * CHART_INNER_HEIGHT;
    return { x, y, val };
  });
  const pathD = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const leaderPathD = leaderPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `M ${CHART_PADDING.left} ${CHART_PADDING.top + CHART_INNER_HEIGHT} ${pathD} L ${pathPoints[pathPoints.length - 1]!.x} ${CHART_PADDING.top + CHART_INNER_HEIGHT} Z`;
  const gapAreaD = `M ${leaderPoints[0]!.x} ${leaderPoints[0]!.y} ${leaderPathD} L ${pathPoints[pathPoints.length - 1]!.x} ${pathPoints[pathPoints.length - 1]!.y} ${buildSmoothPath([...pathPoints].reverse())} Z`;
  const trend = scores[scores.length - 1]! - scores[0]!;
  const gapStart = leaderScores[0]! - scores[0]!;
  const gapEnd = leaderScores[leaderScores.length - 1]! - scores[scores.length - 1]!;
  const gapDelta = gapStart - gapEnd;
  const lineColor = trend >= 0 ? CHART_COLORS.dominant : CHART_COLORS.losing;
  const trendBadge = gapDelta > 2
    ? { label: "↑ Closing gap", tone: "text-authority-dominant" }
    : gapDelta < -2
      ? { label: "↓ Losing ground", tone: "text-authority-losing" }
      : { label: "→ Stalled", tone: "text-text-2" };
  const chartSvg = (
    <svg
      viewBox={`0 0 ${CHART_VIEWBOX_WIDTH} ${CHART_HEIGHT}`}
      className={cn("block h-full w-full", demoted ? "min-h-[200px] max-h-[240px]" : "min-h-[260px]")}
      style={{ maxHeight: demoted ? 240 : CHART_HEIGHT }}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id={`heroChartGrad-${filter}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.08" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.012" />
        </linearGradient>
        <linearGradient id={`heroGapGrad-${filter}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.014)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.085)" />
        </linearGradient>
      </defs>
      <rect x={CHART_PADDING.left} y={CHART_PADDING.top} width={CHART_INNER_WIDTH} height={CHART_INNER_HEIGHT / 3} fill="rgba(255,255,255,0.05)" opacity="0.06" />
      <rect x={CHART_PADDING.left} y={CHART_PADDING.top + CHART_INNER_HEIGHT / 3} width={CHART_INNER_WIDTH} height={CHART_INNER_HEIGHT / 3} fill="rgba(255,255,255,0.04)" opacity="0.05" />
      <rect x={CHART_PADDING.left} y={CHART_PADDING.top + (CHART_INNER_HEIGHT * 2) / 3} width={CHART_INNER_WIDTH} height={CHART_INNER_HEIGHT / 3} fill="rgba(255,255,255,0.03)" opacity="0.04" />
      {CHART_Y_TICKS.map((val) => {
        const y = CHART_PADDING.top + CHART_INNER_HEIGHT - ((val - min) / valueRange) * CHART_INNER_HEIGHT;
        return (
          <g key={val}>
            <line x1={CHART_PADDING.left} y1={y} x2={CHART_VIEWBOX_WIDTH - CHART_PADDING.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <text x={CHART_PADDING.left - 4} y={y + 2} textAnchor="end" className="text-[8px] fill-text-3">{val}</text>
          </g>
        );
      })}
      <path d={gapAreaD} fill={`url(#heroGapGrad-${filter})`} opacity="0.95" />
      <path d={buildSmoothPath(leaderPoints)} fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d={areaD} fill={`url(#heroChartGrad-${filter})`} />
      <path d={buildSmoothPath(pathPoints)} fill="none" stroke={lineColor} strokeOpacity="0.82" strokeWidth="3.3" strokeLinecap="round" strokeLinejoin="round" />
      {pathPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === pathPoints.length - 1 ? 5.2 : 2.8}
          fill="var(--surface)"
          stroke={lineColor}
          strokeOpacity={i === pathPoints.length - 1 ? 0.9 : 0.62}
          strokeWidth={i === pathPoints.length - 1 ? 2.3 : 1.5}
        />
      ))}
      {dates.map((d, i) => {
        const x = CHART_PADDING.left + (i / (scores.length - 1)) * CHART_INNER_WIDTH;
        return (
          <text key={i} x={x} y={CHART_HEIGHT - 3} textAnchor="middle" className="text-[8px] fill-text-3">{d}</text>
        );
      })}
    </svg>
  );

  return (
    <div className={chartShell}>
      <div className={cn("flex flex-wrap items-start justify-between gap-3", demoted ? "mb-2 gap-2" : "mb-3", minimalHeader && "justify-end")}>
        {!minimalHeader && (
          <div className="min-w-0 flex-1">
            {!embedded && <h3 className="text-base font-semibold tracking-tight text-text">Authority Trajectory</h3>}
            <p className={cn("mb-1 text-xs font-semibold uppercase tracking-[0.12em]", trendBadge.tone)}>{trendBadge.label}</p>
            <p className={cn("max-w-xl text-sm leading-relaxed text-text-2", !embedded && "mt-1", demoted && "line-clamp-2 text-xs")}>{trajectoryNote}</p>
          </div>
        )}
        <div className={cn("flex w-full shrink-0 flex-col gap-1.5", minimalHeader ? "max-w-full md:max-w-full" : "max-w-md lg:w-[min(100%,420px)]")}>
          <div className="flex items-center justify-between gap-2">
            {rangeControl}
            {expandButton}
          </div>
          {segmentControl}
        </div>
      </div>
      <div className={cn("overflow-hidden", demoted ? "max-h-[240px] min-h-[200px]" : "min-h-[300px]")}>{chartSvg}</div>
      {expanded && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-label="Expanded trajectory chart">
          <div className="w-full max-w-5xl border border-white/[0.1] bg-surface p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold tracking-tight text-text">Trajectory detail</p>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded text-text-3 transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                aria-label="Close expanded chart"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              {rangeControl}
              <div className="w-full md:w-[460px]">{segmentControl}</div>
            </div>
            <div className="min-h-[440px] overflow-hidden">
              <svg viewBox={`0 0 ${CHART_VIEWBOX_WIDTH} ${CHART_HEIGHT}`} className="w-full h-full min-h-[440px] block" style={{ maxHeight: 520 }} preserveAspectRatio="xMidYMid meet" aria-hidden>
                <defs>
                  <linearGradient id={`heroChartGradExpanded-${filter}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={lineColor} stopOpacity="0.14" />
                    <stop offset="100%" stopColor={lineColor} stopOpacity="0.03" />
                  </linearGradient>
                </defs>
                {CHART_Y_TICKS.map((val) => {
                  const y = CHART_PADDING.top + CHART_INNER_HEIGHT - ((val - min) / valueRange) * CHART_INNER_HEIGHT;
                  return (
                    <g key={val}>
                      <line x1={CHART_PADDING.left} y1={y} x2={CHART_VIEWBOX_WIDTH - CHART_PADDING.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                      <text x={CHART_PADDING.left - 4} y={y + 2} textAnchor="end" className="text-[8px] fill-text-3">{val}</text>
                    </g>
                  );
                })}
                <path d={areaD} fill={`url(#heroChartGradExpanded-${filter})`} />
                <path d={pathD} fill="none" stroke={lineColor} strokeOpacity="0.78" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                {pathPoints.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r="4.4" fill="var(--surface)" stroke={lineColor} strokeOpacity="0.82" strokeWidth="2.2" />
                ))}
                {dates.map((d, i) => {
                  const x = CHART_PADDING.left + (i / (scores.length - 1)) * CHART_INNER_WIDTH;
                  return (
                    <text key={i} x={x} y={CHART_HEIGHT - 3} textAnchor="middle" className="text-[8px] fill-text-3">{d}</text>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AI Answer Market Share — horizontal bar leaderboard (citation share by brand)
═══════════════════════════════════════════════════════════════════════════ */
/** Normalize brand name for display: trim, collapse whitespace, title-case; merge known variants. */
function normalizeBrandName(name: string): string {
  const t = name.trim().replace(/\s+/g, " ");
  if (!t) return name;
  const lower = t.toLowerCase();
  const known: Record<string, string> = {
    "hydro flask": "Hydro Flask",
    hydroflask: "Hydro Flask",
    "hydro-flask": "Hydro Flask",
    "stanley": "Stanley",
    "yeti": "Yeti",
    "rtic": "RTIC",
    "owala": "Owala",
  };
  if (known[lower]) return known[lower];
  return t.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Body only — wrap with DashboardSection on the page */
function AIAnswerMarketShareChart({
  clientName,
  detail,
  onRunSnapshot,
  running,
  snapshotStatus,
  gapTrendDelta,
  sideBySide,
  proofZone,
}: {
  clientName: string;
  detail: SnapshotDetailResponse | null;
  onRunSnapshot?: () => void;
  running?: boolean;
  snapshotStatus?: string | null;
  gapTrendDelta?: number | null;
  /** Donut + share list beside */
  sideBySide?: boolean;
  /** Proof-only: red client, share bars, no CTAs */
  proofZone?: boolean;
}) {
  const rows = useMemo(() => {
    if (!detail?.summary) return [];
    const clientCount = detail.summary.client_mentioned_count ?? 0;
    const competitors = detail.summary.top_competitors ?? [];
    const rawEntities: { name: string; count: number; isClient: boolean }[] = [
      { name: clientName, count: clientCount, isClient: true },
      ...competitors.map((c) => ({ name: c.name, count: c.count, isClient: false })),
    ];
    const merged = new Map<string, { name: string; count: number; isClient: boolean }>();
    for (const e of rawEntities) {
      const norm = normalizeBrandName(e.name);
      const existing = merged.get(norm);
      if (existing) {
        existing.count += e.count;
        if (e.isClient) existing.isClient = true;
      } else merged.set(norm, { name: norm, count: e.count, isClient: e.isClient });
    }
    const entities = Array.from(merged.values());
    const total = entities.reduce((sum, e) => sum + e.count, 0);
    if (total === 0) return [];

    const withShare = entities
      .map((e) => ({ ...e, share: Math.round((e.count / total) * 100) }))
      .filter((e) => e.count > 0)
      .sort((a, b) => b.share - a.share);

    const top5 = withShare.slice(0, 5);
    const rest = withShare.slice(5);
    const otherCount = rest.reduce((s, e) => s + e.count, 0);
    const otherShare = total > 0 ? Math.round((otherCount / total) * 100) : 0;
    if (rest.length > 0) {
      top5.push({ name: "Other", count: otherCount, isClient: false, share: otherShare });
    }
    return top5.map((row, i) => ({ ...row, rank: i + 1, isLeader: i === 0 }));
  }, [detail, clientName]);

  if (rows.length === 0) {
    return (
      <>
        <div className="grid place-items-center py-2">
          <div className="h-40 w-40 rounded-full border-8 border-white/[0.08]" />
        </div>
        <p className="mt-4 text-sm font-normal text-text-3">Run a snapshot to generate citation share by brand.</p>
        {!proofZone && onRunSnapshot && (
          <div className="mt-3 flex justify-end">
            <RunSnapshotButton running={running ?? false} snapshotStatus={snapshotStatus ?? null} onRunSnapshot={onRunSnapshot} />
          </div>
        )}
      </>
    );
  }

  const clientRow = rows.find((r) => r.isClient) ?? null;
  const topCompetitor = rows.find((r) => !r.isClient) ?? null;
  const donutSize = 152;
  const strokeWidth = 24;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const neutral = ["rgba(255,255,255,0.42)", "rgba(255,255,255,0.24)", "rgba(255,255,255,0.18)", "rgba(255,255,255,0.13)", "rgba(255,255,255,0.1)"];

  let offset = 0;
  const slices = rows.map((row, idx) => {
    const length = (row.share / 100) * circumference;
    const stroke = row.isClient
      ? proofZone
        ? "rgba(248,113,113,0.95)"
        : "rgba(245,158,11,0.95)"
      : row.isLeader
        ? neutral[0]
        : neutral[Math.min(idx, neutral.length - 1)];
    const node = (
      <circle
        key={row.name}
        cx={donutSize / 2}
        cy={donutSize / 2}
        r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={`${length} ${circumference - length}`}
        strokeDashoffset={-offset}
        strokeLinecap="butt"
      />
    );
    offset += length;
    return node;
  });

  const wrapClass = "relative h-[170px] w-[170px]";

  const shareGap =
    clientRow && topCompetitor ? Math.max(0, topCompetitor.share - clientRow.share) : null;
  const gapLine = proofZone
    ? shareGap != null
      ? `Losing ground — ${shareGap}% gap to leader`
      : "Share gap — run another snapshot"
    : gapTrendDelta != null
      ? gapTrendDelta > 0
        ? `Closing gap: -${Math.abs(gapTrendDelta)}% vs leader`
        : gapTrendDelta < 0
          ? `Losing ground: +${Math.abs(gapTrendDelta)}% gap to leader`
          : "Stalled vs leader"
      : shareGap != null
        ? `Trailing leader by ${shareGap}%`
        : "Leader gap unavailable";

  const donutBlock = (
    <div className="grid place-items-center shrink-0">
      <div className={wrapClass}>
        <svg viewBox={`0 0 ${donutSize} ${donutSize}`} className="-rotate-90 h-full w-full" aria-hidden>
          <circle
            cx={donutSize / 2}
            cy={donutSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {slices}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-2xl font-medium tabular-nums text-text">{clientRow ? `#${clientRow.rank}` : "—"}</p>
            <p className="mt-0.5 text-sm font-normal tabular-nums text-text-2">{clientRow ? `${clientRow.share}%` : "—"}</p>
            {!sideBySide && !proofZone && (
              <p className="mt-1 max-w-[120px] text-[10px] leading-snug text-text-3">{gapLine}</p>
            )}
          </div>
        </div>
      </div>
      {sideBySide && !proofZone && (
        <p className="mt-2 max-w-[160px] text-center text-[11px] leading-snug text-text-2">{gapLine}</p>
      )}
    </div>
  );

  const shareList = (
    <ul className={cn("min-w-0 flex-1 space-y-2", sideBySide && "pt-1")}>
      {rows.map((row, i) => (
        <li key={row.name} className="text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: row.isClient
                    ? proofZone
                      ? "rgba(248,113,113,0.95)"
                      : "rgba(245,158,11,0.95)"
                    : row.isLeader
                      ? neutral[0]
                      : neutral[Math.min(i, neutral.length - 1)],
                }}
              />
              <span className={cn("truncate", row.isClient ? "font-medium text-text" : "font-normal text-text-2")}>
                {normalizeBrandName(row.name)}
                {row.isClient ? " (You)" : ""}
              </span>
            </div>
            <span className={cn("shrink-0 tabular-nums", row.isClient ? "font-medium text-red-300" : "font-normal text-text-3")}>
              {row.share}%
            </span>
          </div>
          {proofZone && (
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-sm bg-white/[0.08]">
              <div
                className={cn("h-full rounded-sm", row.isClient ? "bg-red-500/70" : "bg-white/25")}
                style={{ width: `${row.share}%` }}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-2">
      {proofZone ? (
        <>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8">
            {donutBlock}
            <div className="min-w-0 flex-1">{shareList}</div>
          </div>
          <p className="mt-3 text-[13px] font-normal text-text-2">{gapLine}</p>
        </>
      ) : sideBySide ? (
        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-start sm:gap-6">
          {donutBlock}
          {shareList}
        </div>
      ) : (
        <>
          {donutBlock}
          {shareList}
          <p className="text-center text-xs text-text-3">
            {gapTrendDelta != null
              ? gapTrendDelta > 0
                ? `Closing gap: -${Math.abs(gapTrendDelta)}% vs leader`
                : gapTrendDelta < 0
                  ? `Losing ground: +${Math.abs(gapTrendDelta)}% gap to leader`
                  : "Stalled vs leader"
              : "Run another snapshot to assess gap direction."}
          </p>
        </>
      )}
    </div>
  );
}

const MODEL_LOGO: Record<string, string> = {
  openai: "https://www.google.com/s2/favicons?domain=openai.com&sz=48",
  gemini: "https://www.google.com/s2/favicons?domain=google.com&sz=48",
  anthropic: "https://www.google.com/s2/favicons?domain=anthropic.com&sz=48",
};
function getModelLogoKey(provider: string): string {
  const p = provider.toLowerCase();
  if (p.includes("openai") || p.includes("chatgpt")) return "openai";
  if (p.includes("gemini") || p.includes("google")) return "gemini";
  if (p.includes("anthropic") || p.includes("claude")) return "anthropic";
  return "";
}

/* ═══════════════════════════════════════════════════════════════════════════
   MODEL CHANNELS — score, issue, action inline; evidence expandable
═══════════════════════════════════════════════════════════════════════════ */
const VULN_MODELS = ["openai", "gemini", "anthropic"] as const;
const MODEL_INSIGHT_MATCH: Record<(typeof VULN_MODELS)[number], RegExp> = {
  openai: /openai|gpt|chatgpt/i,
  gemini: /gemini|google/i,
  anthropic: /anthropic|claude/i,
};

function sortStrategicInsights(
  insights: StrategicInsight[],
  providers: [string, number][]
): StrategicInsight[] {
  let weakestKey: (typeof VULN_MODELS)[number] | null = null;
  let min = Infinity;
  for (const [p, s] of providers) {
    const k = getModelLogoKey(p);
    if (!k || !VULN_MODELS.includes(k as (typeof VULN_MODELS)[number])) continue;
    if (s < min) {
      min = s;
      weakestKey = k as (typeof VULN_MODELS)[number];
    }
  }
  const re = weakestKey ? MODEL_INSIGHT_MATCH[weakestKey] : null;
  const pri = (x: StrategicInsight) => (x.priority === "HIGH" ? 0 : x.priority === "MEDIUM" ? 1 : 2);
  return [...insights].sort((a, b) => {
    const aW = re?.test(`${a.title} ${a.action}`) ? 0 : 1;
    const bW = re?.test(`${b.title} ${b.action}`) ? 0 : 1;
    if (aW !== bW) return aW - bW;
    return pri(a) - pri(b);
  });
}

function tacticalActionBullets(action: string): string[] {
  const parts = action.split(/(?<=[.!])\s+/).filter(Boolean).map((s) => s.trim()).slice(0, 2);
  const raw = parts.length > 0 ? parts : [action];
  return raw.map((b) =>
    b
      .replace(/^\s*Focus on\s+/gi, "")
      .replace(/^\s*Build\s+/gi, "Add ")
      .replace(/^\s*Create\s+/gi, "Ship ")
      .replace(/\bAudit\b/i, "Fix")
      .replace(/\bInvest in brand authority through\b/i, "Ship authority via")
      .trim()
  );
}

type ModelTerminalStatus = "strong" | "degrading" | "critical";

function getModelTerminalStatus(score: number): ModelTerminalStatus {
  if (score >= 80) return "strong";
  if (score >= 50) return "degrading";
  return "critical";
}

function modelTerminalPillClass(s: ModelTerminalStatus): string {
  if (s === "strong") return "bg-emerald-500/15 text-emerald-300";
  if (s === "degrading") return "bg-amber-500/15 text-amber-300";
  return "bg-red-500/15 text-red-300";
}

function modelTerminalLabel(s: ModelTerminalStatus): string {
  if (s === "strong") return "Strong";
  if (s === "degrading") return "Degrading";
  return "Critical";
}

/** 2px left border accent for diagnosis rows and playbook (no row background tint). */
function modelTerminalBorderHex(s: ModelTerminalStatus): string {
  if (s === "strong") return "#639922";
  if (s === "degrading") return "#EF9F27";
  return "#E24B4A";
}

function getModelDiagnosisOneLine(key: (typeof VULN_MODELS)[number], terminal: ModelTerminalStatus): string {
  if (terminal === "strong") return "Strong entity coverage — mirror this structure elsewhere";
  if (terminal === "degrading") {
    return key === "gemini"
      ? "Retrieval gap detected — content needs model-specific audit"
      : "Retrieval softening — tighten entities and citations";
  }
  return key === "anthropic"
    ? "Authority failure — not being cited in structured answers"
    : "Critical retrieval gap — rebuild structured signals";
}

function primaryActionUpside(priority: StrategicInsight["priority"]): string {
  if (priority === "HIGH") return "+8–14 pts";
  if (priority === "MEDIUM") return "+4–8 pts";
  return "+2–5 pts";
}

type PlaybookGridRow = { label: string; value: string };

type ModelPlaybookSpec = {
  diagnosisRows: PlaybookGridRow[];
  whyLead: string;
  whyRows: PlaybookGridRow[];
  steps: string[];
  /** One or two lines; each line ≤12 words; same meaning as prior expected-impact copy */
  expectedImpactLines: string[];
};

function buildModelPlaybook(key: (typeof VULN_MODELS)[number]): ModelPlaybookSpec {
  switch (key) {
    case "openai":
      return {
        diagnosisRows: [
          { label: "Coverage", value: "Strong — appears in product + comparison queries" },
          { label: "Retrieval signal", value: "Page structure matches OpenAI training patterns" },
          { label: "Risk", value: "Defensive — protect what is working" },
        ],
        whyLead: "OpenAI (ChatGPT) handles the highest volume of branded product queries of any AI model.",
        whyRows: [
          { label: "Volume rank", value: "#1 across all tracked models" },
          { label: "Query type", value: "Product discovery + brand comparison" },
          { label: "Risk if lost", value: "Highest single-model impact to VrtlScore" },
        ],
        steps: [
          "Audit which pages are driving retrieval — protect their structure",
          "Mirror successful entity patterns into your weaker product pages",
          "Monitor for position drift — strong scores erode slowly before they drop",
        ],
        expectedImpactLines: [
          "Maintain 88–92 range.",
          "Defensive priority — do not change what is working.",
        ],
      };
    case "gemini":
      return {
        diagnosisRows: [
          { label: "Coverage", value: "Present in some answers; weak recommendation positions" },
          { label: "Retrieval", value: "Structured + entity signals differ from OpenAI" },
          { label: "Pipeline fit", value: "Content not tuned for Gemini retrieval" },
        ],
        whyLead: "Gemini is embedded in Google products including Search, Workspace, and Android.",
        whyRows: [
          { label: "Ecosystem", value: "Google stack — early purchase journey touchpoints" },
          { label: "Query type", value: "Product discovery inside Google's ecosystem" },
          { label: "Risk", value: "Miss early-funnel AI consideration where intent forms" },
        ],
        steps: [
          "Audit your top 10 pages for entity markup — Gemini relies heavily on structured data",
          "Add FAQ schema targeting comparison and recommendation query patterns",
          "Increase third-party brand mentions on domains Google already trusts",
          "Review content for direct-answer formatting — Gemini favors concise factual passages",
        ],
        expectedImpactLines: ["+12–18 pts over 3–4 snapshot cycles with consistent implementation."],
      };
    case "anthropic":
      return {
        diagnosisRows: [
          { label: "Coverage", value: "Not appearing in structured answers" },
          { label: "Signal gap", value: "24 points below your OpenAI score" },
          { label: "Pattern", value: "Pages lack entity schema + citation signals" },
        ],
        whyLead: "Claude handles high-intent branded research at point of purchase decision.",
        whyRows: [
          { label: "Volume rank", value: "Growing — embedded in Notion, Cursor, enterprise tools" },
          { label: "Query type", value: "High-intent research + branded recommendations" },
          { label: "Risk if lost", value: "Invisible when purchase intent is highest" },
        ],
        steps: [
          "Publish JSON-LD schema for brand, product lines, and key entities",
          "Reformat key product pages to direct-answer structure (question → answer)",
          "Place brand authority facts on high-trust third-party domains",
          "Add FAQ blocks targeting the specific query patterns Claude handles",
        ],
        expectedImpactLines: [
          "+8–14 pts on Anthropic signal within 60 days.",
          "This is the highest-leverage single action available in this snapshot.",
        ],
      };
  }
}

function DecisionSurface({
  client,
  score,
  previousScore,
  providers,
  snapshots,
  snapshotId,
  snapshotStatus,
  selectedSnapshotId,
  onSelectSnapshotId,
  runSnapshot,
  running,
  competitors,
  detail,
}: {
  client: ClientRow;
  score: number | null;
  previousScore: number | null;
  providers: [string, number][];
  snapshots: SnapshotRow[];
  snapshotId: string | null;
  snapshotStatus: string | null;
  selectedSnapshotId: string | null;
  onSelectSnapshotId: (id: string) => void;
  runSnapshot: () => void;
  running: boolean;
  competitors: CompetitorRow[];
  detail: SnapshotDetailResponse | null;
}) {
  const domain = faviconDomain(client.website);
  const logoSrc = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=48` : null;
  const { label: statusLabel } = getScoreLabel(score);
  const delta = score != null && previousScore != null ? score - previousScore : null;

  const sortedInsights = useMemo(
    () => sortStrategicInsights(generateStrategicInsights(score, providers, competitors, detail), providers),
    [score, providers, competitors, detail]
  );
  const primary = sortedInsights[0];

  const sortedProviders = useMemo(() => [...providers].sort((a, b) => a[1] - b[1]), [providers]);
  const weakestEntry = sortedProviders[0];
  const weakestName = weakestEntry ? getProviderDisplayName(weakestEntry[0]) : null;

  const problemLine =
    score == null || !weakestName ? "Run a snapshot to surface the weak channel." : `You are losing authority due to ${weakestName}`;

  const causeLine =
    primary?.whyItMatters?.trim() ||
    (weakestName
      ? `Not being retrieved in ${weakestName} answers — displacement is accelerating.`
      : "Run a snapshot to isolate retrieval failure.");

  const topBullets = primary ? tacticalActionBullets(primary.action) : [];

  return (
    <section className="w-full border-b border-white/[0.08] pb-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.06] pb-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {logoSrc ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border border-white/[0.08]">
              <img src={logoSrc} alt="" className="h-6 w-6 object-contain" width={24} height={24} />
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/[0.08] text-xs font-medium text-text-3">
              {client.name.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <h1 className="truncate text-base font-medium tracking-tight text-text">{client.name}</h1>
            <p className="truncate text-xs font-normal text-text-2">{domain || client.website || "—"}</p>
          </div>
          <span
            className={cn("ml-0.5 shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium", getAuthorityStatusTone(score))}
          >
            {statusLabel}
          </span>
        </div>
        <div className="[&_label]:text-[10px] [&_label]:font-normal [&_label]:text-text-3 [&_select]:h-7 [&_select]:max-w-[220px] [&_select]:rounded-md [&_select]:border [&_select]:border-white/10 [&_select]:bg-transparent [&_select]:py-1 [&_select]:text-[11px] [&_select]:font-normal [&_select]:text-text-2">
          <SnapshotSelector snapshots={snapshots} selectedId={selectedSnapshotId} onSelect={onSelectSnapshotId} />
        </div>
      </div>

      <div
        className="mt-4"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          padding: "28px 28px 24px",
          marginBottom: 32,
        }}
      >
        <div>
          <div className="flex items-baseline" style={{ gap: 12 }}>
            <span className="text-[56px] font-medium leading-none tracking-[-0.03em] text-text tabular-nums md:text-[64px]">
              {score ?? "—"}
            </span>
            {delta !== null && delta !== 0 && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[13px] font-medium tabular-nums",
                  delta < 0 ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                )}
              >
                {delta < 0 ? <span aria-hidden>↓</span> : <span aria-hidden>↑</span>}
                <span>
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
                <span className="font-normal opacity-80">vs last</span>
              </span>
            )}
          </div>
          <span className="mt-1 block text-[12px] text-text-3">Overall VrtlScore / 100</span>
        </div>

        <div className="mt-4 space-y-2">
          <p className="max-w-2xl text-base font-medium leading-snug text-text">{problemLine}</p>
          <p className="max-w-2xl text-sm font-normal leading-snug text-text-2">{causeLine}</p>
        </div>

        {primary && (
          <div className="mt-5 max-w-xl rounded-xl border border-red-500/35 bg-red-500/[0.08] px-5 py-[18px]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-red-300">Fix this first</span>
              <span className="text-[13px] font-medium tabular-nums text-red-200">{primaryActionUpside(primary.priority)}</span>
            </div>
            <p className="mt-2 text-base font-medium text-text">{primary.title}</p>
            <ul className="mt-2 space-y-1">
              {topBullets.map((b, i) => (
                <li key={i} className="text-[13px] font-normal leading-snug text-red-300/90">
                  → {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <RunSnapshotButton
            running={running}
            snapshotStatus={snapshotStatus}
            onRunSnapshot={runSnapshot}
            className="!h-auto !rounded-lg !border-0 !bg-text !px-4 !py-2 !text-[13px] !font-medium !text-surface !shadow-none hover:!opacity-90"
          />
          {snapshotId && (
            <DownloadPdfButton
              snapshotId={snapshotId}
              variant="ghost"
              label="Download report"
              className="inline-block [&_button]:!rounded-lg [&_button]:!border [&_button]:!border-white/15 [&_button]:!bg-transparent [&_button]:!px-4 [&_button]:!py-2 [&_button]:!text-[13px] [&_button]:!font-medium [&_button]:!text-text-2"
            />
          )}
        </div>
      </div>
    </section>
  );
}

function WhatIsWrongSection({ providers }: { providers: [string, number][] }) {
  const providerByKey = useMemo(() => {
    const map = new Map<string, [string, number]>();
    for (const [provider, score] of providers) {
      const key = getModelLogoKey(provider) || provider;
      if (VULN_MODELS.includes(key as (typeof VULN_MODELS)[number])) map.set(key, [provider, score]);
    }
    return map;
  }, [providers]);

  return (
    <DashboardSection title="Where you're winning and losing" noTopRule className="!space-y-1 !pt-4">
      <div>
        <div>
          {VULN_MODELS.map((key) => {
            const entry = providerByKey.get(key);
            const modelScore = entry ? entry[1] : null;
            const label = getModelDisplayName(key);
            const logoUrl = MODEL_LOGO[key];
            const barPct = modelScore != null ? modelScore : 0;
            const terminal = modelScore != null ? getModelTerminalStatus(modelScore) : "critical";
            const playbook = buildModelPlaybook(key);
            const diagnosisLine = getModelDiagnosisOneLine(key, terminal);

            return (
              <DiagnosisModelRow
                key={key}
                label={label}
                logoUrl={logoUrl}
                score={modelScore}
                terminal={terminal}
                barPct={barPct}
                diagnosisLine={diagnosisLine}
                playbook={playbook}
              />
            );
          })}
        </div>
      </div>
    </DashboardSection>
  );
}

function PlaybookSpecGrid({ rows }: { rows: PlaybookGridRow[] }) {
  return (
    <div className="playbook-grid">
      {rows.map((r, i) => (
        <Fragment key={i}>
          <div className="playbook-grid-label">{r.label}</div>
          <div className="playbook-grid-value">{r.value}</div>
        </Fragment>
      ))}
    </div>
  );
}

function DiagnosisModelRow({
  label,
  logoUrl,
  score,
  terminal,
  barPct,
  diagnosisLine,
  playbook,
}: {
  label: string;
  logoUrl: string;
  score: number | null;
  terminal: ModelTerminalStatus;
  barPct: number;
  diagnosisLine: string;
  playbook: ModelPlaybookSpec;
}) {
  const [open, setOpen] = useState(false);
  const borderHex = modelTerminalBorderHex(terminal);
  const barFill =
    terminal === "strong" ? "bg-emerald-500" : terminal === "degrading" ? "bg-amber-500" : "bg-red-500";
  const impactValueClass = cn(
    "playbook-impact-value flex flex-col gap-1",
    terminal === "critical" && "playbook-impact-value--critical",
    terminal === "strong" && "playbook-impact-value--strong"
  );

  return (
    <div className="border-b border-white/[0.06] pt-3 last:border-b-0">
      <div
        style={{
          borderLeft: `2px solid ${borderHex}`,
          paddingLeft: 14,
          paddingBottom: 14,
          marginBottom: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="group/model-row w-full cursor-pointer select-none rounded-sm bg-transparent py-0 text-left hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          aria-expanded={open}
        >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:flex-nowrap md:items-center">
          <div className="flex min-w-0 items-center gap-2 md:w-[132px]">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden border border-white/[0.08]">
              <img src={logoUrl} alt="" className="h-4 w-4 object-contain" width={16} height={16} />
            </span>
            <span className="truncate text-[13px] font-medium text-text">{label}</span>
          </div>
          <div className="order-last min-h-[6px] w-full min-w-0 flex-1 md:order-none md:max-w-md">
            <div className="h-1.5 w-full overflow-hidden rounded-sm bg-white/[0.08]">
              <div className={cn("h-full rounded-sm", barFill)} style={{ width: `${barPct}%` }} />
            </div>
          </div>
          {score != null ? (
            <span className="w-11 shrink-0 text-right text-lg font-medium tabular-nums text-text md:w-12">{score}</span>
          ) : (
            <span className="w-11 shrink-0 text-right text-text-3">—</span>
          )}
          <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium", modelTerminalPillClass(terminal))}>
            {modelTerminalLabel(terminal)}
          </span>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <span
              className="text-[11px] text-text-3 transition-opacity duration-150 ease-in-out opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/model-row:opacity-100"
              aria-hidden
            >
              View playbook ›
            </span>
            <svg
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0 text-text-3 transition-transform duration-200 ease-in-out"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
              aria-hidden
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
          <p className="mt-2 text-[13px] font-normal leading-snug text-text-2">{diagnosisLine}</p>
        </button>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="mt-3 bg-transparent"
            style={{
              borderLeft: `2px solid ${borderHex}`,
              paddingLeft: 16,
              marginTop: 12,
            }}
          >
            <div className="playbook-header">PLAYBOOK · {label.toUpperCase()}</div>
            <div className="playbook-section-rule" aria-hidden />
            <div className="pb-2 pr-2">
              <div className="playbook-section-label">Diagnosis</div>
              <PlaybookSpecGrid rows={playbook.diagnosisRows} />
              <div className="playbook-section-rule" aria-hidden />
              <div className="playbook-section-label">Why this model matters</div>
              <div className="playbook-lead-sentence">{playbook.whyLead}</div>
              <PlaybookSpecGrid rows={playbook.whyRows} />
              <div className="playbook-section-rule" aria-hidden />
              <div className="playbook-section-label">Fixes</div>
              <div className="playbook-steps">
                {playbook.steps.map((step, i) => (
                  <div key={i} className="playbook-step">
                    <div className="playbook-step-num">Step {i + 1}</div>
                    <div className="playbook-step-text">{step}</div>
                  </div>
                ))}
              </div>
              <div className="playbook-impact-row">
                <div className="playbook-impact-label">Expected impact</div>
                <div className={impactValueClass}>
                  {playbook.expectedImpactLines.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="block text-text-3 hover:text-text-2"
                style={{
                  display: "block",
                  marginLeft: "auto",
                  marginTop: 16,
                  fontSize: 12,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ▲ Collapse
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SIGNAL QUALITY CHART (donut)
═══════════════════════════════════════════════════════════════════════════ */
function SignalQualityChart({ detail }: { detail: SnapshotDetailResponse | null }) {
  if (!detail || detail.summary.responses_count === 0) {
    return (
      <div className="rounded-app-lg border border-white/5 bg-surface p-5">
        <h3 className="text-sm font-semibold text-text">Authority Signal Composition</h3>
        <div className="mt-4 flex h-32 items-center justify-center text-sm text-text-3">
          No authority signals to analyze
        </div>
      </div>
    );
  }

  const { responses } = detail;
  const total = responses.length;
  
  const strong = responses.filter(r => 
    r.client_mentioned && r.client_position === "top" && r.recommendation_strength === "strong"
  ).length;
  const moderate = responses.filter(r => 
    r.client_mentioned && (r.client_position === "middle" || r.recommendation_strength === "moderate" || r.recommendation_strength === "weak")
  ).length;
  const weak = responses.filter(r => !r.client_mentioned).length;

  const data = [
    { label: "Strong", value: strong, color: CHART_COLORS.dominant },
    { label: "Moderate", value: moderate, color: CHART_COLORS.watchlist },
    { label: "Weak", value: weak, color: CHART_COLORS.losing },
  ].filter(d => d.value > 0);

  // Donut chart
  const size = 100;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let offset = 0;

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-5">
      <h3 className="text-sm font-semibold text-text">Authority Signal Composition</h3>
      <p className="text-xs text-text-3 mt-0.5">Response quality breakdown</p>
      <div className="mt-4 flex items-center gap-6">
        <div className="relative">
          <svg viewBox={`0 0 ${size} ${size}`} className="h-24 w-24 -rotate-90">
            {data.map((segment, idx) => {
              const segmentLength = (segment.value / total) * circumference;
              const path = (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                />
              );
              offset += segmentLength;
              return path;
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-text">{total}</span>
          </div>
        </div>
        <div className="space-y-2">
          {data.map(d => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-text-2">{d.label}</span>
              <span className="text-xs font-semibold text-text">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITORS SECTION (inline, compact)
═══════════════════════════════════════════════════════════════════════════ */
function CompetitorsSection({
  competitors,
  busy,
  newName,
  newWebsite,
  setNewName,
  setNewWebsite,
  onAddCompetitor,
  onDeleteCompetitor,
}: {
  competitors: CompetitorRow[];
  busy: boolean;
  newName: string;
  newWebsite: string;
  setNewName: (v: string) => void;
  setNewWebsite: (v: string) => void;
  onAddCompetitor: (e: React.FormEvent) => void;
  onDeleteCompetitor: (id: string) => void;
}) {
  const confidence = getConfidenceLabel(competitors.length);

  return (
    <div id="competitors" className="rounded-app-lg border border-white/5 bg-surface p-4 scroll-mt-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text">Tracked Competitors</h3>
          <p className="text-[10px] text-text-2">{competitors.length}/8 · {confidence.label}</p>
        </div>
        {competitors.length < 8 && (
          <form className="flex gap-1.5 flex-wrap" onSubmit={onAddCompetitor}>
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="rounded-app border border-white/10 bg-surface-2 px-2 py-1.5 text-xs text-text placeholder:text-text-3 focus:border-white/20 focus:outline-none w-28"
            />
            <input
              type="url"
              placeholder="URL"
              value={newWebsite}
              onChange={(e) => setNewWebsite(e.target.value)}
              className="rounded-app border border-white/10 bg-surface-2 px-2 py-1.5 text-xs text-text placeholder:text-text-3 focus:border-white/20 focus:outline-none w-32"
            />
            <button
              type="submit"
              disabled={busy || !newName.trim()}
              className="rounded-app border border-white/10 bg-surface-2 px-2 py-1.5 text-xs font-medium text-text hover:bg-surface disabled:opacity-50"
            >
              Add
            </button>
          </form>
        )}
      </div>
      {competitors.length > 0 ? (
        <div className="space-y-0.5">
          {competitors.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-app border border-white/5 bg-surface-2/30 px-2 py-1.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-surface text-[10px] font-medium text-text-2">
                  {(c.name || "?")[0].toUpperCase()}
                </span>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-text truncate block">{c.name}</span>
                  {c.website && <span className="text-[10px] text-text-3 truncate block">{c.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteCompetitor(c.id)}
                disabled={busy}
                className="shrink-0 p-1 text-text-3 hover:text-authority-losing transition-colors disabled:opacity-50"
                title="Remove"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-3 py-3">Add competitors to improve confidence and benchmark.</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVIDENCE SECTION (collapsible detailed findings)
═══════════════════════════════════════════════════════════════════════════ */
function EvidenceSection({ detail }: { detail: SnapshotDetailResponse }) {
  const { summary, responses } = detail;
  const signalsTotal = summary.responses_count;

  return (
    <details className="group rounded-app-lg border border-white/5 bg-surface">
      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-surface-2/40">
        <div>
          <h3 className="text-sm font-semibold text-text">Detailed findings</h3>
          <p className="text-xs text-text-3 mt-0.5">{responses.length} signals analyzed</p>
        </div>
        <svg className="h-5 w-5 text-text-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div className="border-t border-white/5">
        <div className="grid gap-4 p-5 sm:grid-cols-4">
          <div className="rounded-app border border-white/5 bg-surface-2/30 p-3">
            <div className="text-2xl font-bold text-text">{pct(summary.client_mentioned_count, signalsTotal)}%</div>
            <div className="text-xs text-text-2">Mention rate</div>
          </div>
          <div className="rounded-app border border-white/5 bg-surface-2/30 p-3">
            <div className="text-2xl font-bold text-text">{pct(summary.sources_count, signalsTotal)}%</div>
            <div className="text-xs text-text-2">Citeable</div>
          </div>
          <div className="rounded-app border border-white/5 bg-surface-2/30 p-3">
            <div className="text-2xl font-bold text-text">{pct(summary.specific_features_count, signalsTotal)}%</div>
            <div className="text-xs text-text-2">Feature specific</div>
          </div>
          <div className="rounded-app border border-white/5 bg-surface-2/30 p-3">
            <div className="text-2xl font-bold text-text">{signalsTotal}</div>
            <div className="text-xs text-text-2">Signals analyzed</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {responses.map((r, idx) => {
            const mentioned = r.client_mentioned;
            const position = r.client_position;
            const strength = r.recommendation_strength;
            let severity: "high" | "medium" | "low" = "low";
            let title = "Strong signal";
            if (!mentioned) {
              severity = "high";
              title = "Not mentioned";
            } else if (position === "middle" || position === "bottom" || strength === "weak" || strength === "none") {
              severity = "medium";
              title = "Weak positioning";
            }
            const severityStyles = {
              high: { bg: "bg-authority-losing/15", text: "text-authority-losing", border: "border-authority-losing/30" },
              medium: { bg: "bg-authority-watchlist/15", text: "text-authority-watchlist", border: "border-authority-watchlist/30" },
              low: { bg: "bg-authority-dominant/15", text: "text-authority-dominant", border: "border-authority-dominant/30" },
            };
            const styles = severityStyles[severity];
            return (
              <details key={r.id} className="group/item">
                <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface-2/20">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs font-bold text-text-2">
                      {idx + 1}
                    </span>
                    <span className={cn("rounded px-2 py-0.5 text-xs font-medium", styles.bg, styles.text, styles.border)}>
                      {severity === "high" ? "High" : severity === "medium" ? "Medium" : "Strong"}
                    </span>
                    <span className="text-sm font-medium text-text">{title}</span>
                  </div>
                  <svg className="h-4 w-4 text-text-3 transition-transform group-open/item:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-white/5 bg-surface-2/20 p-4 space-y-3">
                  {r.prompt_text && (
                    <div>
                      <div className="text-xs font-semibold text-text-3 mb-1">Prompt</div>
                      <p className="text-sm text-text-2 italic">&quot;{r.prompt_text}&quot;</p>
                    </div>
                  )}
                  {r.evidence_snippet && (
                    <div>
                      <div className="text-xs font-semibold text-text-3 mb-1">Evidence</div>
                      <p className="text-sm text-text">{r.evidence_snippet}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-surface-2 px-2 py-1 text-text-2">Position: {position || "N/A"}</span>
                    <span className="rounded bg-surface-2 px-2 py-1 text-text-2">Strength: {strength || "N/A"}</span>
                    {r.competitors_mentioned.length > 0 && (
                      <span className="rounded bg-surface-2 px-2 py-1 text-text-2">Competitors: {r.competitors_mentioned.join(", ")}</span>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </details>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITORS TAB (legacy - kept for reference, CompetitorsSection used)
═══════════════════════════════════════════════════════════════════════════ */
function CompetitorsTab({
  competitors,
  busy,
  newName,
  newWebsite,
  setNewName,
  setNewWebsite,
  onAddCompetitor,
  onDeleteCompetitor,
}: {
  competitors: CompetitorRow[];
  busy: boolean;
  newName: string;
  newWebsite: string;
  setNewName: (v: string) => void;
  setNewWebsite: (v: string) => void;
  onAddCompetitor: (e: React.FormEvent) => void;
  onDeleteCompetitor: (id: string) => void;
}) {
  const confidence = getConfidenceLabel(competitors.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Competitors</h2>
          <p className="text-sm text-text-2">
            {competitors.length}/8 tracked · {8 - competitors.length} slots available
          </p>
        </div>
        <Badge variant={confidence.variant}>{confidence.label}</Badge>
      </div>

      {competitors.length < 8 && (
        <form className="flex gap-2" onSubmit={onAddCompetitor}>
          <input
            type="text"
            placeholder="Competitor name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            disabled={busy}
            className="flex-1 rounded-app border border-white/10 bg-surface px-3 py-2 text-sm text-text placeholder:text-text-3 focus:border-text focus:outline-none"
          />
          <input
            type="url"
            placeholder="https://competitor.com"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            disabled={busy}
            className="flex-1 rounded-app border border-white/10 bg-surface px-3 py-2 text-sm text-text placeholder:text-text-3 focus:border-text focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="rounded-app bg-surface-2 px-3 py-2 text-sm font-medium text-text border border-white/10 transition-colors hover:bg-text/90 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {competitors.length > 0 ? (
        <div className="rounded-app-lg border border-white/5 bg-surface">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs font-medium uppercase tracking-wide text-text-3">
                <th className="px-4 py-3">Competitor</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {competitors.map((c) => (
                <tr key={c.id} className="group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-text text-xs font-bold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-text">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-2">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noreferrer" className="hover:underline">
                        {c.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onDeleteCompetitor(c.id)}
                      disabled={busy}
                      className="rounded-app p-1 text-text-3 opacity-0 transition-all hover:bg-authority-losing/15 hover:text-authority-losing group-hover:opacity-100"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-app-lg border border-dashed border-white/10 bg-surface py-12 text-center">
          <p className="text-sm font-medium text-text">No competitors tracked</p>
          <p className="mt-1 text-xs text-text-3">Add competitors to improve analysis confidence</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVIDENCE TAB
═══════════════════════════════════════════════════════════════════════════ */
function EvidenceTab({
  detail,
  loading,
}: {
  detail: SnapshotDetailResponse | null;
  loading: boolean;
  clientName?: string;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 animate-pulse rounded-xl bg-surface-2" />
        <div className="h-64 animate-pulse rounded-xl bg-surface-2" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-app-lg border border-dashed border-white/10 bg-surface py-12 text-center">
        <p className="text-sm font-medium text-text">No evidence available</p>
        <p className="mt-1 text-xs text-text-3">Run a snapshot to generate evidence</p>
      </div>
    );
  }

  const { summary, responses } = detail;
  const signalsTotal = summary.responses_count;

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-app-lg border border-white/5 bg-surface p-4">
          <div className="text-2xl font-bold text-text">{pct(summary.client_mentioned_count, signalsTotal)}%</div>
          <div className="text-xs text-text-2">Mention rate ({summary.client_mentioned_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-app-lg border border-white/5 bg-surface p-4">
          <div className="text-2xl font-bold text-text">{pct(summary.sources_count, signalsTotal)}%</div>
          <div className="text-xs text-text-2">Citeable ({summary.sources_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-app-lg border border-white/5 bg-surface p-4">
          <div className="text-2xl font-bold text-text">{pct(summary.specific_features_count, signalsTotal)}%</div>
          <div className="text-xs text-text-2">Feature specific ({summary.specific_features_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-app-lg border border-white/5 bg-surface p-4">
          <div className="text-2xl font-bold text-text">{signalsTotal}</div>
          <div className="text-xs text-text-2">Signals analyzed</div>
        </div>
      </div>

      {/* Findings list */}
      <div className="rounded-app-lg border border-white/5 bg-surface">
        <div className="border-b border-white/5 px-5 py-4">
          <h3 className="font-semibold text-text">Detailed Findings</h3>
          <p className="text-xs text-text-2">{responses.length} signals analyzed</p>
        </div>
        <div className="divide-y divide-border">
          {responses.map((r, idx) => {
            const mentioned = r.client_mentioned;
            const position = r.client_position;
            const strength = r.recommendation_strength;

            let severity: "high" | "medium" | "low" = "low";
            let title = "Strong signal";
            if (!mentioned) {
              severity = "high";
              title = "Not mentioned";
            } else if (position === "middle" || position === "bottom" || strength === "weak" || strength === "none") {
              severity = "medium";
              title = "Weak positioning";
            }

            const severityStyles = {
              high: { bg: "bg-authority-losing/15", text: "text-authority-losing", border: "border-authority-losing/30" },
              medium: { bg: "bg-authority-watchlist/15", text: "text-authority-watchlist", border: "border-authority-watchlist/30" },
              low: { bg: "bg-authority-dominant/15", text: "text-authority-dominant", border: "border-authority-dominant/30" },
            };
            const styles = severityStyles[severity];

            return (
              <details key={r.id} className="group">
                <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-surface">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-xs font-bold text-text-2">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-lg border px-2 py-0.5 text-xs font-medium", styles.bg, styles.text, styles.border)}>
                          {severity === "high" ? "High" : severity === "medium" ? "Medium" : "Strong"}
                        </span>
                        <span className="text-sm font-medium text-text">{title}</span>
                      </div>
                      {mentioned && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-authority-dominant">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mentioned
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-text-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-white/5 bg-surface p-4">
                  {r.prompt_text && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-text-3 mb-1">Prompt</div>
                      <p className="text-sm text-text-2 italic">&quot;{r.prompt_text}&quot;</p>
                    </div>
                  )}
                  {r.evidence_snippet && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-text-3 mb-1">Evidence</div>
                      <p className="text-sm text-text">{r.evidence_snippet}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded bg-surface-2 px-2 py-1 text-text-2">
                      Position: {position || "N/A"}
                    </span>
                    <span className="rounded bg-surface-2 px-2 py-1 text-text-2">
                      Strength: {strength || "N/A"}
                    </span>
                    {r.competitors_mentioned.length > 0 && (
                      <span className="rounded bg-surface-2 px-2 py-1 text-text-2">
                        Competitors: {r.competitors_mentioned.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORTS TAB
═══════════════════════════════════════════════════════════════════════════ */
function ReportsTab({ snapshot, clientName }: { snapshot: SnapshotRow | null; clientName: string }) {
  const isComplete = snapshot?.status?.toLowerCase().includes("complete") || 
                     snapshot?.status?.toLowerCase().includes("success");

  if (!snapshot) {
    return (
      <div className="rounded-app-lg border border-dashed border-white/10 bg-surface py-12 text-center">
        <p className="text-sm font-medium text-text">No reports available</p>
        <p className="mt-1 text-xs text-text-3">Run a snapshot to generate a report</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-text">Reports</h2>
        <p className="text-sm text-text-2">Download branded PDF reports for your clients</p>
      </div>

      <div className="rounded-app-lg border border-white/5 bg-surface p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-app bg-authority-losing/15">
              <svg className="h-6 w-6 text-authority-losing" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 18H7v-1.5l4-4 1.5 1.5-4 4zm6.5-10H8v-1h7v1z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text">AI Authority Briefing</h3>
              <p className="text-sm text-text-2">
                {clientName} · {new Date(snapshot.created_at).toLocaleDateString()}
              </p>
              <Badge variant={statusVariant(snapshot.status)} className="mt-1">
                {snapshot.status}
              </Badge>
            </div>
          </div>

          {isComplete && (
            <DownloadPdfButton snapshotId={snapshot.id} className="shrink-0" />
          )}
        </div>

        {!isComplete && (
          <p className="mt-4 text-sm text-text-3">
            {snapshot.status === "running" 
              ? "Report will be available once the snapshot completes..."
              : "This snapshot did not complete successfully. Run a new snapshot to generate a report."}
          </p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ClientDetailPage() {
  const params = useParams();
  const clientId = typeof params.id === "string" ? params.id : "";
  const supabase = getSupabaseBrowserClient();

  // State
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [client, setClient] = useState<ClientRow | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [snapshotDetail, setSnapshotDetail] = useState<SnapshotDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const heroSentinelRef = useRef<HTMLDivElement>(null);

  // Derived
  const selectedSnapshot = useMemo(() => {
    return snapshots.find((s) => s.id === selectedSnapshotId) ?? snapshots[0] ?? null;
  }, [snapshots, selectedSnapshotId]);

  const previousSnapshot = useMemo(() => {
    const idx = snapshots.findIndex((s) => s.id === selectedSnapshotId);
    return idx >= 0 && idx < snapshots.length - 1 ? snapshots[idx + 1] : null;
  }, [snapshots, selectedSnapshotId]);

  // Historical scores and dates for trend (most recent first, so reverse for display)
  const { historicalScores, historicalDates } = useMemo(() => {
    const filtered = snapshots
      .filter(s => s.vrtl_score !== null && (s.status?.toLowerCase().includes("complete") || s.status?.toLowerCase().includes("success")))
      .slice(0, 10);
    const scores = [...filtered].reverse().map(s => s.vrtl_score!);
    const dates = [...filtered].reverse().map(s => new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }));
    return { historicalScores: scores, historicalDates: dates };
  }, [snapshots]);

  // Refresh data
  const refresh = useCallback(async (agId: string) => {
    const [clientRes, compRes, snapRes] = await Promise.all([
      supabase.from("clients").select("id,name,website,industry").eq("id", clientId).eq("agency_id", agId).maybeSingle(),
      supabase.from("competitors").select("id,name,website,created_at").eq("client_id", clientId).order("created_at"),
      supabase.from("snapshots").select("id,status,vrtl_score,score_by_provider,started_at,completed_at,created_at,error").eq("client_id", clientId).order("created_at", { ascending: false }),
    ]);

    if (clientRes.error) throw clientRes.error;
    if (!clientRes.data) {
      setClient(null);
      return;
    }
    setClient(clientRes.data as ClientRow);
    setCompetitors((compRes.data ?? []) as CompetitorRow[]);
    setSnapshots((snapRes.data ?? []) as SnapshotRow[]);

    if (!selectedSnapshotId && snapRes.data && snapRes.data.length > 0) {
      setSelectedSnapshotId(snapRes.data[0].id);
    }
  }, [supabase, clientId, selectedSnapshotId]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { agencyId: aId } = await ensureOnboarded();
        if (cancelled) return;
        setAgencyId(aId);
        await refresh(aId);
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [refresh]);

  // Fetch snapshot detail when selected changes
  useEffect(() => {
    if (!selectedSnapshotId || !clientId) return;
    let cancelled = false;
    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        const res = await fetch(`/api/snapshots/detail?snapshotId=${selectedSnapshotId}&clientId=${encodeURIComponent(clientId)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to fetch snapshot detail");
        }
        const data: SnapshotDetailResponse = await res.json();
        if (!cancelled) setSnapshotDetail(data);
      } catch {
        if (!cancelled) setSnapshotDetail(null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    fetchDetail();
    return () => { cancelled = true; };
  }, [selectedSnapshotId, clientId, supabase]);

  // Poll for running snapshot
  useEffect(() => {
    if (!agencyId) return;
    const isRunning = selectedSnapshot?.status === "running";
    if (isRunning && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        await refresh(agencyId);
      }, 5000);
    }
    if (!isRunning && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
      if (selectedSnapshot?.status?.toLowerCase().includes("complete") || selectedSnapshot?.status?.toLowerCase().includes("success")) {
        setShowSuccess(true);
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [agencyId, selectedSnapshot?.status, refresh]);

  // Sticky download bar: show when scrolled past hero
  useEffect(() => {
    const el = heroSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Actions
  async function runSnapshot() {
    if (!agencyId) return;
    setRunning(true);
    setRunError(null);
    setShowSuccess(false);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch("/api/snapshots/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to start snapshot");
      }
      const data = await res.json();
      await refresh(agencyId);
      if (data.snapshot_id) {
        setSelectedSnapshotId(data.snapshot_id);
      }
    } catch (e) {
      setRunError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function resetRunningSnapshot() {
    if (!agencyId || !selectedSnapshot) return;
    setRunning(true);
    setRunError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await fetch("/api/snapshots/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ snapshotId: selectedSnapshot.id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to reset snapshot");
      }
      await refresh(agencyId);
    } catch (e) {
      setRunError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

  async function addCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyId || competitors.length >= 8) return;
    setBusy(true);
    setError(null);
    try {
      const insertRes = await supabase.from("competitors").insert({
        client_id: clientId,
        name: newName,
        website: newWebsite || null,
      });
      if (insertRes.error) throw insertRes.error;
      setNewName("");
      setNewWebsite("");
      await refresh(agencyId);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteCompetitor(id: string) {
    if (!agencyId) return;
    setBusy(true);
    setError(null);
    try {
      const delRes = await supabase.from("competitors").delete().eq("id", id);
      if (delRes.error) throw delRes.error;
      await refresh(agencyId);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  // Derived values
  const providers: [string, number][] = selectedSnapshot?.score_by_provider
    ? Object.entries(selectedSnapshot.score_by_provider)
    : [];
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="mx-auto max-w-[1200px] space-y-4 px-5 py-6 md:px-8 md:py-8">
        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            <div className="h-8 w-64 animate-pulse rounded-lg bg-surface-2" />
            <div className="h-32 animate-pulse rounded-xl bg-surface-2" />
            <div className="h-48 animate-pulse rounded-xl bg-surface-2" />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Not found */}
        {!loading && !error && !client && (
          <div className="rounded-2xl border border-white/5 bg-surface py-12 text-center">
            <p className="text-sm text-text-2">Client not found (or not in your agency).</p>
            <Link href="/app" className="mt-3 inline-block text-xs text-text hover:underline">
              Back to clients
            </Link>
          </div>
        )}

        {client && (
          <>
            <PageHeader clientName={client.name} />

            {selectedSnapshot?.status === "running" && (
              <SnapshotProgress startedAt={selectedSnapshot?.started_at ?? selectedSnapshot?.created_at ?? null} />
            )}
            {showSuccess && (
              <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-surface px-4 py-2">
                <span className="text-sm font-medium text-text">Snapshot complete</span>
                <span className="text-xs text-text-2">Index: {selectedSnapshot?.vrtl_score ?? "—"}</span>
                <button onClick={() => setShowSuccess(false)} className="ml-auto p-1 text-text-3 hover:text-text">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {runError && (
              <Alert variant="danger">
                <AlertDescription>{runError}</AlertDescription>
              </Alert>
            )}

            <div ref={heroSentinelRef} className="h-0" aria-hidden />

            <DecisionSurface
              client={client}
              score={selectedSnapshot?.vrtl_score ?? null}
              previousScore={previousSnapshot?.vrtl_score ?? null}
              providers={providers}
              snapshots={snapshots}
              snapshotId={selectedSnapshot?.id ?? null}
              snapshotStatus={selectedSnapshot?.status ?? null}
              selectedSnapshotId={selectedSnapshotId}
              onSelectSnapshotId={setSelectedSnapshotId}
              runSnapshot={runSnapshot}
              running={running}
              competitors={competitors}
              detail={snapshotDetail}
            />

            <WhatIsWrongSection providers={providers} />

            <DashboardSection title="Why you're losing" className="!space-y-2 !pt-4 opacity-[0.85]">
              <AIAnswerMarketShareChart
                clientName={client.name}
                detail={snapshotDetail}
                gapTrendDelta={
                  selectedSnapshot?.vrtl_score != null && previousSnapshot?.vrtl_score != null
                    ? selectedSnapshot.vrtl_score - previousSnapshot.vrtl_score
                    : null
                }
                proofZone
              />
            </DashboardSection>
          </>
        )}
      </div>

      {/* Mobile: sticky bottom CTA bar */}
      {client && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-3 border-t border-white/10 bg-surface/95 p-3 backdrop-blur-sm md:hidden">
          {selectedSnapshot?.id && (selectedSnapshot.status?.toLowerCase().includes("complete") || selectedSnapshot.status?.toLowerCase().includes("success")) && (
            <div className="[&_button]:!rounded-xl [&_button]:!px-4 [&_button]:!py-2.5 [&_button]:!text-sm [&_button]:!font-semibold [&_button]:!bg-white [&_button]:!text-surface">
              <DownloadPdfButton snapshotId={selectedSnapshot.id} label="Download PDF" />
            </div>
          )}
          <RunSnapshotButton running={running} snapshotStatus={selectedSnapshot?.status ?? null} onRunSnapshot={runSnapshot} />
        </div>
      )}

      {/* Desktop: sticky download bar after scroll (unchanged behavior) */}
      {stickyVisible && client && selectedSnapshot && (selectedSnapshot.status?.toLowerCase().includes("complete") || selectedSnapshot.status?.toLowerCase().includes("success")) && (
        <div className="fixed bottom-0 left-0 right-0 z-50 hidden border-t border-white/5 bg-surface py-2 pl-[var(--app-sidebar-width,240px)] pr-6 md:block">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-text-2">Ready to share with {client.name}</span>
            <DownloadPdfButton snapshotId={selectedSnapshot.id} variant="compact" />
          </div>
        </div>
      )}
    </div>
  );
}
