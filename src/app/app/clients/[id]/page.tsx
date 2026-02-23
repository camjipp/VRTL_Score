"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
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

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE SPARKLINE
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
   SCORE HERO (with sparkline + Report Ready)
═══════════════════════════════════════════════════════════════════════════ */
function ScoreHero({
  score,
  previousScore,
  confidence,
  updatedAt,
  status,
  historicalScores,
  reportReadyAt,
  gapToLeader = null,
}: {
  score: number | null;
  previousScore: number | null;
  confidence: { label: string; variant: BadgeVariant };
  updatedAt: string | null;
  status: string | null;
  historicalScores: number[];
  reportReadyAt: string | null;
  gapToLeader?: number | null;
}) {
  const { label, description } = getScoreLabel(score);
  const delta = score !== null && previousScore !== null ? score - previousScore : null;
  const displayGap = gapToLeader ?? (score != null ? 100 - score : null);

  const sparklineColor = score !== null && score >= 80 
    ? CHART_COLORS.dominant 
    : score !== null && score >= 50 
      ? CHART_COLORS.watchlist 
      : CHART_COLORS.losing;

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex flex-col">
            <span className="text-4xl font-semibold tabular-nums tracking-tight text-text leading-none">
              {score ?? "—"}
            </span>
            <span className="mt-1 text-xs text-text-2">AI Authority Index</span>
            {delta !== null && delta !== 0 && (
              <span className={cn("mt-0.5 text-xs tabular-nums", delta > 0 ? "text-authority-dominant" : "text-authority-losing")}>
                {delta > 0 ? "+" : ""}{delta} vs last
              </span>
            )}
            {displayGap != null && displayGap > 0 && (
              <span className="mt-0.5 text-xs text-text-2">{displayGap} pts behind leader</span>
            )}
          </div>
          {historicalScores.length >= 2 && (
            <div className="hidden sm:block">
              <ScoreSparkline scores={historicalScores} color={sparklineColor} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1 text-right text-xs">
          <span><span className="text-text-3">Status:</span> <span className="text-text">{label}</span></span>
          <span><span className="text-text-3">Confidence:</span> <span className="text-text">{confidence.label}</span></span>
          {updatedAt && <span><span className="text-text-3">Updated:</span> <span className="text-text">{timeAgo(updatedAt)}</span></span>}
          {reportReadyAt && <span className="text-text-3">Report {timeAgo(reportReadyAt)}</span>}
          {status === "running" && <Badge variant="warning" className="mt-1 w-fit self-end">Analyzing...</Badge>}
        </div>
      </div>
      {/* Position Bar: 0–100 with leader and client markers */}
      {score != null && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-text-3">Position vs leader</span>
            {displayGap != null && displayGap > 0 && (
              <span className="text-[10px] text-text-2">{displayGap} pts behind leader</span>
            )}
          </div>
          <div className="relative h-6 w-full rounded-app bg-surface-2/50 overflow-hidden">
            <div className="absolute inset-y-0 left-0 right-0 flex">
              <div className="h-full bg-white/5" style={{ width: `${score}%` }} />
              <div className="h-full bg-surface-2" style={{ width: `${100 - score}%` }} />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-text rounded-full"
              style={{ left: `${score}%`, marginLeft: -2 }}
              aria-hidden
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-authority-stable rounded-full"
              style={{ right: 0, marginRight: -2 }}
              aria-hidden
            />
          </div>
          <div className="flex justify-between mt-0.5 text-[10px] text-text-3">
            <span>0</span>
            <span>Client · {score}</span>
            <span>Leader · 100</span>
          </div>
        </div>
      )}
      <p className="mt-2 text-sm text-text-2">{description}</p>
    </div>
  );
}

/* Compact Trend strip: sparkline + gap widening/narrowing */
function TrendStrip({ historicalScores, delta }: { historicalScores: number[]; delta: number | null }) {
  const momentumLabel = delta === null || delta === 0 ? "Stable" : delta < 0 ? "Gap widening" : "Gap narrowing";
  const momentumColor = delta === null || delta === 0 ? "text-text-2" : delta < 0 ? "text-authority-losing" : "text-authority-dominant";
  if (historicalScores.length < 2) {
    return (
      <div className="rounded-app border border-white/5 bg-surface px-3 py-2 flex items-center justify-between">
        <span className="text-xs text-text-2">Trend</span>
        <span className={cn("text-[11px]", momentumColor)}>{momentumLabel}</span>
      </div>
    );
  }
  const color = delta !== null && delta < 0 ? CHART_COLORS.losing : CHART_COLORS.dominant;
  return (
    <div className="rounded-app border border-white/5 bg-surface px-3 py-2 flex items-center gap-3">
      <span className="text-xs text-text-2 shrink-0">Trend</span>
      <div className="flex-1 min-w-0">
        <ScoreSparkline scores={historicalScores} color={color} />
      </div>
      <span className={cn("text-[11px] shrink-0", momentumColor)}>{momentumLabel}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   KEY INSIGHTS (4 punchy cards)
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
    insights.push({
      priority: "HIGH",
      title: `${worstModel[0]} Retrieval Weakness`,
      insight: `${worstModel[0]} scores ${worstModel[1]} — a ${gap}-point authority signal deficiency vs your average.`,
      whyItMatters: `${worstModel[0]} processes significant AI query volume. This retrieval weakness means your brand is systematically excluded from discovery in this model's architecture.`,
      action: `Audit content for ${worstModel[0]}-specific optimization. Focus on structured data markup, clear entity relationships, and content that directly maps to common retrieval queries.`,
      expectedImpact: `+10-15 point lift in ${worstModel[0]} ranking signal density within 60 days.`,
      consequence: `Every week this gap persists, competitors capture discovery opportunities and compound their authority advantage.`
    });
  }
  
  // Competitor threat — HIGH priority
  if (detail?.summary.top_competitors && detail.summary.top_competitors.length > 0) {
    const topCompetitor = detail.summary.top_competitors[0];
    const clientMentions = detail.summary.client_mentioned_count;
    if (topCompetitor.count >= clientMentions) {
      insights.push({
        priority: "HIGH",
        title: "Competitor Visibility Threat",
        insight: `${topCompetitor.name} is mentioned ${topCompetitor.count} times vs your ${clientMentions}.`,
        whyItMatters: "AI models are positioning a competitor ahead of you in recommendations. Users asking about your category see them first.",
        action: "Audit their content strategy — what are they doing that you're not? Counter-position with differentiated messaging and unique value props.",
        expectedImpact: "Regain competitive parity within 90 days.",
        consequence: `Failure to act increases the likelihood ${topCompetitor.name} becomes the default AI recommendation.`
      });
    }
  }
  
  // Low mention rate — HIGH priority
  if (mentionRate < 50) {
    insights.push({
      priority: "HIGH",
      title: "Critical Citation Absence",
      insight: `Surfaced in only ${mentionRate}% of AI responses — below the consideration threshold.`,
      whyItMatters: "More than half of AI-driven queries about your category return zero mention of your brand. This signals a fundamental authority gap in model training data and retrieval systems.",
      action: "Invest in brand authority through PR coverage, quality backlinks, and structured data markup. Create content that maps directly to the queries AI models use for retrieval.",
      expectedImpact: "Target 70%+ mention rate to enter the AI consideration set.",
      consequence: `Citation absence compounds — models learn from each other's outputs, and being absent now accelerates future invisibility.`
    });
  }
  
  // Low positioning — MEDIUM priority
  if (topPositionRate < 30 && mentionRate >= 50) {
    insights.push({
      priority: "MEDIUM",
      title: "Positioning Weakness",
      insight: `Mentioned but only in top position ${topPositionRate}% of the time.`,
      whyItMatters: "You're in the conversation but not the first recommendation. Users trust first recommendations more.",
      action: "Strengthen your unique value proposition. Create comparison content that positions you favorably. Build authority signals through reviews and testimonials.",
      expectedImpact: "Move from 'also mentioned' to 'first choice' positioning.",
      consequence: `Second place in AI recommendations means second place in consideration. Buyers often stop at the first option.`
    });
  }
  
  // Low citations — MEDIUM priority
  if (citationRate < 20) {
    insights.push({
      priority: "MEDIUM",
      title: "Authority Signal Deficiency",
      insight: `Only ${citationRate}% of mentions include direct citations — well below trust threshold.`,
      whyItMatters: "AI models don't classify your brand as an authoritative source worth citing. This erodes both retrieval priority and user trust in recommendations.",
      action: "Build citation density through industry publications, trusted review platforms, and authoritative third-party sources. Create structured, quotable content that models will reference directly.",
      expectedImpact: "Higher citation rate correlates with +5-10 points in ranking signal density.",
      consequence: `Without strong authority signals, AI models will systematically deprioritize you in favor of competitors with denser citation profiles.`
    });
  }
  
  // Competitor tracking — MEDIUM priority
  if (competitors.length < 3) {
    insights.push({
      priority: "MEDIUM",
      title: "Incomplete Competitive Intelligence",
      insight: `Only ${competitors.length} competitor${competitors.length === 1 ? '' : 's'} tracked — recommend at least 3.`,
      whyItMatters: "Without adequate competitive context, your score confidence is lower and you can't accurately benchmark your position.",
      action: `Add ${3 - competitors.length} more key competitor${3 - competitors.length === 1 ? '' : 's'} to improve analysis accuracy and get meaningful competitive insights.`,
      expectedImpact: "Higher confidence scores and actionable competitive intelligence.",
      consequence: `Incomplete competitor data means blind spots — competitors may be gaining ground without your awareness.`
    });
  }
  
  // Strong model to replicate — LOW priority
  if (strongProviders.length > 0 && strongProviders.length < providers.length) {
    const bestModel = strongProviders.sort((a, b) => b[1] - a[1])[0];
    insights.push({
      priority: "LOW",
      title: `${bestModel[0]} Success — Replicate`,
      insight: `${bestModel[0]} scores ${bestModel[1]} — your highest performer.`,
      whyItMatters: "This proves your content strategy can work. Understanding why gives you a playbook for other models.",
      action: "Analyze what content resonates with this model — format, structure, keywords, citations. Apply these patterns to underperforming models.",
      expectedImpact: "Lift weaker models by applying proven patterns.",
      consequence: `This is a proven playbook — not replicating it to other models is leaving points on the table.`
    });
  }
  
  // Good score with no issues — LOW priority maintenance
  if (score >= 70 && insights.length === 0) {
    insights.push({
      priority: "LOW",
      title: "Strong Position — Maintain",
      insight: "Your visibility is competitive — maintain current strategy.",
      whyItMatters: "Strong positions require active defense. Competitors are working to catch up.",
      action: "Continue content velocity, monitor competitor activity, and track score changes. Set up alerts for significant drops.",
      expectedImpact: "Sustain top-tier visibility and early warning of threats.",
      consequence: `Even strong positions erode without maintenance. Competitors are always working to overtake you.`
    });
  }
  
  return insights.slice(0, 4);
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
}: {
  running: boolean;
  snapshotStatus: string | null;
  onRunSnapshot: () => void;
}) {
  if (snapshotStatus === "running") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-app bg-authority-watchlist/15 px-2.5 py-1 text-xs font-medium text-authority-watchlist">
        <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
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
      className="inline-flex items-center gap-1.5 rounded-app border border-white/10 bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2 disabled:opacity-50"
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
   CROSS-MODEL SNAPSHOT (chart + diagnosis in ONE card)
═══════════════════════════════════════════════════════════════════════════ */
function getProviderStatus(score: number): { label: string; bar: string } {
  if (score >= 80) return { label: "Dominant", bar: "border-l-authority-dominant" };
  if (score >= 60) return { label: "Stable", bar: "border-l-authority-stable" };
  if (score >= 40) return { label: "Watchlist", bar: "border-l-authority-watchlist" };
  return { label: "Losing", bar: "border-l-authority-losing" };
}

function getProviderDisplayName(provider: string): string {
  const p = provider.toLowerCase();
  if (p.includes("openai") || p.includes("chatgpt")) return "OpenAI";
  if (p.includes("gemini") || p.includes("google")) return "Gemini";
  if (p.includes("anthropic") || p.includes("claude")) return "Anthropic";
  return provider;
}

function CrossModelSnapshot({
  providers,
  detail,
}: {
  providers: [string, number][];
  detail: SnapshotDetailResponse | null;
}) {
  if (providers.length === 0) {
    return (
      <div className="rounded-app-lg border border-white/5 bg-surface p-4">
        <h3 className="text-sm font-semibold text-text">Model Authority Breakdown</h3>
        <p className="mt-2 text-xs text-text-2">Run a snapshot to see model-specific performance</p>
      </div>
    );
  }

  const sorted = [...providers].sort((a, b) => b[1] - a[1]);
  const weakest = sorted[sorted.length - 1];
  const gap = sorted[0][1] - weakest[1];
  const avg = Math.round(sorted.reduce((sum, [, s]) => sum + s, 0) / sorted.length);

  const leaderScore = 100;

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-4">
      <h3 className="text-base font-semibold text-text">Model Authority Breakdown</h3>
      <p className="text-xs text-text-2 mt-0.5">Per-model score and gap to leader</p>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* Left: ranked list with score, state stripe, delta */}
        <div className="space-y-1">
          {sorted.map(([provider, score]) => {
            const status = getProviderStatus(score);
            return (
              <div
                key={provider}
                className={cn("flex items-center gap-3 border-l-[3px] py-1.5 px-2 rounded-app", status.bar, "bg-surface-2/30")}
              >
                <span className="w-20 shrink-0 text-xs font-medium text-text">{getProviderDisplayName(provider)}</span>
                <span className="tabular-nums text-sm font-semibold text-text w-8">{score}</span>
                <span className="text-[10px] text-text-2">{status.label}</span>
                <div className="flex-1 h-0.5 max-w-20 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-current opacity-50" style={{ width: `${Math.min(100, score)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        {/* Right: Per-Model Gap Visual — thin comparison bar per model */}
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-text-3">Gap to leader</div>
          {sorted.map(([provider, score]) => {
            const modelGap = Math.max(0, leaderScore - score);
            return (
              <div key={provider} className="flex items-center gap-2">
                <span className="w-20 shrink-0 text-[11px] text-text-2">{getProviderDisplayName(provider)}</span>
                <div className="relative flex-1 h-4 rounded bg-surface-2/50 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-full flex">
                    <div className="h-full bg-white/10" style={{ width: `${score}%` }} />
                    <div className="h-full bg-surface-2" style={{ width: `${100 - score}%` }} />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-text" style={{ left: `${score}%`, marginLeft: -1 }} aria-hidden />
                  <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-authority-stable right-0" style={{ marginRight: -1 }} aria-hidden />
                </div>
                <span className="w-12 shrink-0 text-right text-[10px] tabular-nums text-text-2">Gap: {modelGap}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-0 text-[10px] text-text-2">
        <span>Gap: {gap} pts</span>
        <span>Weakest: {getProviderDisplayName(weakest[0])}</span>
      </div>
    </div>
  );
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
  if (providers.length === 0) return null;

  const clientMentions = detail?.summary.client_mentioned_count ?? 0;
  const topCompetitors = detail?.summary.top_competitors ?? [];
  const leaderName = topCompetitors[0]?.name ?? "Category Leader";
  const challengerName = topCompetitors[1]?.name ?? "Top Challenger";
  const mentionGap = topCompetitors[0] ? Math.max(0, topCompetitors[0].count - clientMentions) : 6;

  return (
    <div className="rounded-app-lg border border-white/5 bg-surface p-4" id="cross-model">
      <h3 className="text-sm font-semibold text-text">Competitive Authority Ranking</h3>
      <p className="mt-0.5 text-[10px] text-text-2">Gap = Leader − Client Index</p>

      <div className="mt-3 space-y-4">
        {[...providers].sort((a, b) => b[1] - a[1]).map(([provider, score]) => {
          const { leader, challenger } = estimateCompetitorScores(score, mentionGap);
          const clientDelta = previousProviders[provider] != null ? score - previousProviders[provider] : null;
          const authorityGap = Math.max(0, leader - score);

          const entities = [
            { name: leaderName, score: leader, isClient: false, delta: null as number | null },
            { name: challengerName, score: challenger, isClient: false, delta: null as number | null },
            { name: clientName, score, isClient: true, delta: clientDelta },
          ].sort((a, b) => b.score - a.score);

          return (
            <div key={provider} className="rounded-app border border-white/5 bg-surface-2/40 overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-white/5">
                <span className="text-xs font-medium text-text">{getProviderDisplayName(provider)}</span>
                <span className="text-[10px] text-text-2">{authorityGap} pts behind leader</span>
              </div>
              <table className="w-full text-left text-[13px]">
                <tbody>
                  {entities.map((entity, idx) => (
                    <tr
                      key={`${entity.name}-${entity.isClient}`}
                      className={cn(
                        "border-b border-white/5 last:border-b-0",
                        entity.isClient && "bg-white/5"
                      )}
                    >
                      <td className="w-6 py-1.5 px-2 text-text-3 tabular-nums">{idx + 1}</td>
                      <td className="py-1.5 px-2">
                        <span className={cn("font-medium", entity.isClient ? "text-text" : "text-text-2")}>{entity.name}</span>
                        <span className="ml-1 text-[10px] text-text-3">{getRecommendationLabel(entity.score)}</span>
                      </td>
                      <td className="py-1.5 px-2 text-right tabular-nums font-medium text-text">{entity.score}</td>
                      <td className="py-1.5 px-2 text-right w-14">
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
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-text-3">Leader scores inferred from displacement. Refined with more snapshots.</p>
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

  // Historical scores for sparkline (most recent first, so reverse for display)
  const historicalScores = useMemo(() => {
    return snapshots
      .filter(s => s.vrtl_score !== null && (s.status?.toLowerCase().includes("complete") || s.status?.toLowerCase().includes("success")))
      .slice(0, 10)
      .map(s => s.vrtl_score!)
      .reverse();
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
    if (!selectedSnapshotId) return;
    let cancelled = false;
    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");
        const res = await fetch(`/api/snapshots/detail?snapshotId=${selectedSnapshotId}`, {
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
  }, [selectedSnapshotId, supabase]);

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
  const previousProviders: Record<string, number> = previousSnapshot?.score_by_provider
    ? (previousSnapshot.score_by_provider as Record<string, number>)
    : {};
  const confidence = getConfidenceLabel(competitors.length);

  return (
    <div className="space-y-6 p-6">
      <BackLink href="/app" label="Back to Dashboard" />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-text-2 hover:text-text">Clients</Link>
        <span className="text-text-3">/</span>
        <span className="text-text">{client?.name || "Client"}</span>
      </div>

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
        <div className="rounded-app-lg border border-white/5 bg-surface py-12 text-center">
          <p className="text-sm text-text-2">Client not found (or not in your agency).</p>
          <Link href="/app" className="mt-3 inline-block text-xs text-text hover:underline">
            Back to clients
          </Link>
        </div>
      )}

      {client && (
        <>
          {/* Client header: Left = name + site, Right = actions + snapshot */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">{client.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-2">
                {client.website && (
                  <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline">
                    {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
                {client.website && <span className="text-text-3">·</span>}
                <span className="capitalize">{client.industry.replace(/_/g, " ")}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <SnapshotSelector
                  snapshots={snapshots}
                  selectedId={selectedSnapshotId}
                  onSelect={setSelectedSnapshotId}
                />
                <RunSnapshotButton
                  running={running}
                  snapshotStatus={selectedSnapshot?.status ?? null}
                  onRunSnapshot={runSnapshot}
                />
              </div>
              {selectedSnapshot && (selectedSnapshot.status?.toLowerCase().includes("complete") || selectedSnapshot.status?.toLowerCase().includes("success")) && (
                <DownloadPdfButton snapshotId={selectedSnapshot.id} variant="compact" className="ml-4" />
              )}
            </div>
          </div>

          {/* Single scrollable page — tight spacing */}
          <div className="space-y-5">
              {/* Snapshot progress (if running) */}
              {selectedSnapshot?.status === "running" && (
                <SnapshotProgress startedAt={selectedSnapshot?.started_at ?? selectedSnapshot?.created_at ?? null} />
              )}

              {showSuccess && (
                <div className="flex items-center gap-3 rounded-app-lg border border-white/5 border-l-authority-dominant bg-surface px-4 py-2">
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

              {/* SECTION 1: Score Summary */}
              <ScoreHero
                score={selectedSnapshot?.vrtl_score ?? null}
                previousScore={previousSnapshot?.vrtl_score ?? null}
                confidence={confidence}
                updatedAt={selectedSnapshot?.completed_at || selectedSnapshot?.created_at || null}
                status={selectedSnapshot?.status ?? null}
                historicalScores={historicalScores}
                reportReadyAt={
                  selectedSnapshot && (selectedSnapshot.status?.toLowerCase().includes("complete") || selectedSnapshot.status?.toLowerCase().includes("success"))
                    ? (selectedSnapshot.completed_at || selectedSnapshot.created_at)
                    : null
                }
                gapToLeader={
                  selectedSnapshot?.vrtl_score != null ? 100 - selectedSnapshot.vrtl_score : null
                }
              />
              <TrendStrip
                historicalScores={historicalScores}
                delta={
                  selectedSnapshot?.vrtl_score != null && previousSnapshot?.vrtl_score != null
                    ? selectedSnapshot.vrtl_score - previousSnapshot.vrtl_score
                    : null
                }
              />
              <div ref={heroSentinelRef} className="h-0" aria-hidden />

              {/* SECTION 2: Cross-Model Snapshot (chart + diagnosis in one card) */}
              <div id="cross-model" className="scroll-mt-4">
                <CrossModelSnapshot providers={providers} detail={snapshotDetail} />
              </div>

              <CompetitiveAuthorityRanking
                clientName={client.name}
                providers={providers}
                previousProviders={previousProviders}
                detail={snapshotDetail}
              />

              {/* SECTION 4: Recommended Actions */}
              <Recommendations
                score={selectedSnapshot?.vrtl_score ?? null}
                providers={providers}
                competitors={competitors}
                detail={snapshotDetail}
              />

              {/* SECTION 5: Deep Analytics (collapsible) */}
              <details className="group rounded-app-lg border border-white/5 bg-surface">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-surface-2/40">
                  <h3 className="text-sm font-semibold text-text">Deep Analytics</h3>
                  <svg className="h-4 w-4 text-text-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-white/5 space-y-4 p-4">
                  <KeyInsightsCards
                    score={selectedSnapshot?.vrtl_score ?? null}
                    providers={providers}
                    detail={snapshotDetail}
                    competitors={competitors}
                    confidence={confidence}
                  />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ScoreTrendChart 
                      scores={historicalScores} 
                      dates={snapshots
                        .filter(s => s.vrtl_score !== null && (s.status?.toLowerCase().includes("complete") || s.status?.toLowerCase().includes("success")))
                        .slice(0, 10)
                        .map(s => s.created_at)
                        .reverse()
                      } 
                    />
                    <ProviderBreakdown providers={providers} />
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <CompetitorComparisonChart
                      clientName={client.name}
                      clientMentions={snapshotDetail?.summary.client_mentioned_count ?? 0}
                      topCompetitors={snapshotDetail?.summary.top_competitors ?? []}
                    />
                    <PromptPerformance detail={snapshotDetail} />
                  </div>
                  <SignalQualityChart detail={snapshotDetail} />
                  <CompetitorsSection
                    competitors={competitors}
                    busy={busy}
                    newName={newName}
                    newWebsite={newWebsite}
                    setNewName={setNewName}
                    setNewWebsite={setNewWebsite}
                    onAddCompetitor={addCompetitor}
                    onDeleteCompetitor={deleteCompetitor}
                  />
                  {snapshotDetail?.responses && snapshotDetail.responses.length > 0 && (
                    <EvidenceSection detail={snapshotDetail} />
                  )}
                </div>
              </details>
            </div>

          {/* Sticky Download Bar - appears after scroll */}
          {stickyVisible && selectedSnapshot && (selectedSnapshot.status?.toLowerCase().includes("complete") || selectedSnapshot.status?.toLowerCase().includes("success")) && (
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-surface py-2 pl-[240px] pr-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-2">Ready to share with {client.name}</span>
                <DownloadPdfButton snapshotId={selectedSnapshot.id} variant="compact" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
