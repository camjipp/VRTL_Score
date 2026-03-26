"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, useRef, type ReactNode } from "react";
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
  className,
}: {
  running: boolean;
  snapshotStatus: string | null;
  onRunSnapshot: () => void;
  className?: string;
}) {
  if (snapshotStatus === "running") {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-authority-watchlist/10 px-3 py-2 text-sm font-medium text-authority-watchlist", className)}>
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

/** Format playbook/display text: ensure Anthropic, OpenAI, Gemini are properly capitalized. */
function formatPlaybookText(s: string): string {
  if (!s?.trim()) return s;
  return s
    .replace(/\banthropic\b/gi, "Anthropic")
    .replace(/\bopenai\b/gi, "OpenAI")
    .replace(/\bgemini\b/gi, "Gemini");
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

/* Big trend chart — primary centerpiece: plot fills card, anchored */
const CHART_FILTERS = ["all", "openai", "gemini", "anthropic"] as const;
const CHART_RANGES = [
  { key: "7d", label: "7D", days: 7 },
  { key: "30d", label: "30D", days: 30 },
  { key: "90d", label: "90D", days: 90 },
] as const;
const CHART_HEIGHT = 300;
const CHART_PADDING = { top: 2, right: 8, bottom: 10, left: 16 };
const CHART_VIEWBOX_WIDTH = 960;
const CHART_INNER_WIDTH = CHART_VIEWBOX_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
const CHART_INNER_HEIGHT = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
const CHART_Y_TICKS = [0, 50, 100];
const SEGMENT_CONTROL_HEIGHT = 36;

function BigTrendChart({ snapshots, embedded }: { snapshots: SnapshotRow[]; embedded?: boolean }) {
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
    return filtered.length >= 2 ? filtered : snapshots;
  }, [snapshots, timeRange]);
  const { scores, dates } = useMemo(() => getChartSeriesForFilter(rangedSnapshots, filter), [rangedSnapshots, filter]);

  const trajectoryNote = useMemo(() => {
    if (scores.length < 2) {
      return "Run more snapshots to plot movement and compare models with confidence.";
    }
    const delta = scores[scores.length - 1]! - scores[0]!;
    if (filter === "all") {
      if (delta < -3) return "Composite index has declined — prioritize the weakest model channel first.";
      if (delta > 3) return "Composite index is improving — reinforce mentions and citations to lock in gains.";
      return "Trajectory is relatively flat; displacement may still be shifting under the surface.";
    }
    if (filter === "openai") {
      return delta < 0
        ? "OpenAI / ChatGPT channel has softened — tighten entity, citation, and proof density."
        : "OpenAI channel is holding or improving versus prior snapshots.";
    }
    if (filter === "gemini") {
      return delta < 0
        ? "Gemini channel is losing ground — add structured, quotable brand proof."
        : "Gemini visibility is stable or strengthening.";
    }
    if (filter === "anthropic") {
      return delta < 0
        ? "Anthropic underperformance is dragging the story — close citation and retrieval gaps."
        : "Anthropic stress has eased in recent snapshots.";
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
      className="inline-flex h-7 w-7 items-center justify-center rounded text-text-3 transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
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
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!embedded && <h3 className="text-base font-semibold tracking-tight text-text">Authority Trajectory</h3>}
            <p className={cn("max-w-xl text-sm leading-relaxed text-text-2", !embedded && "mt-1")}>{trajectoryNote}</p>
          </div>
          <div className="flex w-full max-w-md shrink-0 flex-col gap-1.5 lg:w-[min(100%,420px)]">
            <div className="flex items-center justify-between gap-2">
              {rangeControl}
              {expandButton}
            </div>
            {segmentControl}
          </div>
        </div>
        <div className="flex h-64 items-center justify-center text-sm text-text-3">Run more snapshots to see trends</div>
      </div>
    );
  }

  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const valueRange = max - min || 1;
  const pathPoints = scores.map((val, i) => {
    const x = CHART_PADDING.left + (i / (scores.length - 1)) * CHART_INNER_WIDTH;
    const y = CHART_PADDING.top + CHART_INNER_HEIGHT - ((val - min) / valueRange) * CHART_INNER_HEIGHT;
    return { x, y, val };
  });
  const pathD = pathPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `M ${CHART_PADDING.left} ${CHART_PADDING.top + CHART_INNER_HEIGHT} ${pathD} L ${pathPoints[pathPoints.length - 1]!.x} ${CHART_PADDING.top + CHART_INNER_HEIGHT} Z`;
  const trend = scores[scores.length - 1]! - scores[0]!;
  const lineColor = trend >= 0 ? CHART_COLORS.dominant : CHART_COLORS.losing;
  const chartSvg = (
    <svg viewBox={`0 0 ${CHART_VIEWBOX_WIDTH} ${CHART_HEIGHT}`} className="w-full h-full min-h-[260px] block" style={{ maxHeight: CHART_HEIGHT }} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <linearGradient id={`heroChartGrad-${filter}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.02" />
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
      <path d={areaD} fill={`url(#heroChartGrad-${filter})`} />
      <path d={pathD} fill="none" stroke={lineColor} strokeOpacity="0.72" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      {pathPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.2" fill="var(--surface)" stroke={lineColor} strokeOpacity="0.78" strokeWidth="2.2" />
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
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {!embedded && <h3 className="text-base font-semibold tracking-tight text-text">Authority Trajectory</h3>}
          <p className={cn("max-w-xl text-sm leading-relaxed text-text-2", !embedded && "mt-1")}>{trajectoryNote}</p>
        </div>
        <div className="flex w-full max-w-md shrink-0 flex-col gap-1.5 lg:w-[min(100%,420px)]">
          <div className="flex items-center justify-between gap-2">
            {rangeControl}
            {expandButton}
          </div>
          {segmentControl}
        </div>
      </div>
      <div className="min-h-[260px] overflow-hidden">{chartSvg}</div>
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

/* Sentiment label from score delta / level */
function getSentiment(score: number | null, delta: number | null): { label: "Positive" | "Neutral" | "Negative"; change: string } {
  if (score == null) return { label: "Neutral", change: "—" };
  if (delta == null) return { label: score >= 60 ? "Positive" : score >= 40 ? "Neutral" : "Negative", change: "—" };
  if (delta > 0) return { label: "Positive", change: `+${delta} pts` };
  if (delta < 0) return { label: "Negative", change: `${delta} pts` };
  return { label: "Neutral", change: "0 pts" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   FULL-WIDTH HERO — identity, score, insight, strategic story, risk line, actions
═══════════════════════════════════════════════════════════════════════════ */
function HeroSection({
  client,
  score,
  previousScore,
  providers,
  detail,
  snapshots,
  snapshotId,
  snapshotStatus,
  selectedSnapshotId,
  onSelectSnapshotId,
  runSnapshot,
  running,
}: {
  client: ClientRow;
  score: number | null;
  previousScore: number | null;
  providers: [string, number][];
  detail: SnapshotDetailResponse | null;
  snapshots: SnapshotRow[];
  snapshotId: string | null;
  snapshotStatus: string | null;
  selectedSnapshotId: string | null;
  onSelectSnapshotId: (id: string) => void;
  runSnapshot: () => void;
  running: boolean;
}) {
  const domain = faviconDomain(client.website);
  const logoSrc = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=48` : null;
  const { label: statusLabel } = getScoreLabel(score);
  const delta = score != null && previousScore != null ? score - previousScore : null;
  const diagnosis = getVerdictSentence(score, providers, detail);
  const sortedDesc = [...providers].sort((a, b) => b[1] - a[1]);
  const sortedAsc = [...providers].sort((a, b) => a[1] - b[1]);
  const primaryDisplacerLabel =
    detail?.summary?.top_competitors?.[0]?.name?.trim() || "No clear displacer yet";
  const weakestModelLabel = sortedAsc.length > 0 ? getProviderDisplayName(sortedAsc[0]![0]) : "Insufficient data";
  const gapToLeaderPts = sortedDesc.length > 0 ? Math.max(0, 100 - sortedDesc[0]![1]) : null;
  const strongestModelLabel = sortedDesc.length > 0 ? getProviderDisplayName(sortedDesc[0]![0]) : null;
  const topCompetitorNames = (detail?.summary?.top_competitors ?? [])
    .slice(0, 2)
    .map((c) => c.name.trim())
    .filter(Boolean);
  const displacerPhrase =
    topCompetitorNames.length >= 2
      ? `${topCompetitorNames[0]} and ${topCompetitorNames[1]}`
      : topCompetitorNames.length === 1
        ? topCompetitorNames[0]!
        : "key competitors";
  const mentionRate = detail ? pct(detail.summary.client_mentioned_count, detail.summary.responses_count || 1) : null;
  const riskLine1 = `${displacerPhrase} are taking more recommendation share than ${client.name} in tracked AI answers.`;
  const riskLine2 = `${weakestModelLabel} is the critical weakness — it is elevating displacement risk.`;
  const riskLine3 = strongestModelLabel
    ? `Fastest recovery path: ${strongestModelLabel} — double down while you fix the weak channel.`
    : "Rebalance toward your strongest model channel while you close gaps on the weakest.";

  return (
    <section className="w-full border-b border-white/[0.08] pb-10">
      <div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 lg:items-start">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-white/[0.08]">
                {logoSrc ? (
                  <img src={logoSrc} alt="" className="h-9 w-9 object-contain" width={36} height={36} />
                ) : (
                  <span className="text-xl font-bold text-text-3">{client.name.charAt(0)}</span>
                )}
              </div>
              <div className="min-w-0 space-y-1.5 pt-0.5">
                <h1 className="text-2xl font-semibold tracking-tight text-text md:text-3xl">{client.name}</h1>
                <p className="text-sm text-text-2">{domain || client.website || "—"}</p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-3">AI Authority Index</p>
              <div className="mt-1.5">
                <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider", getAuthorityStatusTone(score))}>
                  {statusLabel}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
                <span className="text-7xl font-extrabold tabular-nums tracking-tight text-text md:text-8xl">{score ?? "—"}</span>
                {delta !== null && (
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[11px] font-bold tabular-nums tracking-wide",
                      delta > 0
                        ? "bg-authority-dominant/15 text-authority-dominant"
                        : delta < 0
                          ? "bg-authority-losing/15 text-authority-losing"
                          : "bg-white/[0.1] text-text-2"
                    )}
                  >
                    {delta > 0 ? "+" : ""}
                    {delta} vs last
                  </span>
                )}
              </div>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-2">{diagnosis}</p>
              {mentionRate !== null && (
                <p className="mt-2 text-xs text-text-3">
                  Mentioned in {mentionRate}% of tracked answers — displacement pressure clusters in weaker model channels.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-6 lg:col-span-5 lg:border-t-0 lg:pt-0">
            <div className="border-l border-white/[0.06] pl-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-3">Strategic story</p>
              <dl className="mt-3 space-y-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Displaced by</dt>
                  <dd className="mt-2 text-base font-semibold leading-snug text-text">{primaryDisplacerLabel}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Critical weakness</dt>
                  <dd className="mt-2 text-base font-semibold leading-snug text-text">{weakestModelLabel}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Gap to leader</dt>
                  <dd className="mt-2 text-base font-semibold tabular-nums leading-snug text-text">{gapToLeaderPts != null ? `${gapToLeaderPts} pts` : "—"}</dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/[0.08] pt-4">
              <p className="sr-only">Actions</p>
              <RunSnapshotButton
                running={running}
                snapshotStatus={snapshotStatus}
                onRunSnapshot={runSnapshot}
                className="w-full rounded-lg border border-white/15 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:border-white/25 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/15"
              />
              {snapshotId && (
                <div className="[&_button]:!w-full [&_button]:!rounded-lg [&_button]:!border [&_button]:!border-white/20 [&_button]:!bg-white [&_button]:!px-4 [&_button]:!py-2.5 [&_button]:!text-sm [&_button]:!font-semibold [&_button]:!text-surface [&_button]:shadow-sm [&_button]:hover:!bg-white/95">
                  <DownloadPdfButton snapshotId={snapshotId} label="Download Report" />
                </div>
              )}
              <div className="[&_label]:!text-xs [&_label]:!text-text-3">
                <SnapshotSelector snapshots={snapshots} selectedId={selectedSnapshotId} onSelect={onSelectSnapshotId} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-white/[0.06] pt-6 md:mt-6 md:pt-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-authority-watchlist/90">AI competitive risk detected</p>
          <p className="mt-2 max-w-4xl text-sm leading-relaxed text-text-2">
            <span>{riskLine1} </span>
            <span className="text-authority-watchlist">{riskLine2} </span>
            <span>{riskLine3}</span>
          </p>
        </div>
      </div>
    </section>
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
}: {
  clientName: string;
  detail: SnapshotDetailResponse | null;
  onRunSnapshot?: () => void;
  running?: boolean;
  snapshotStatus?: string | null;
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
          <div className="h-40 w-40 animate-pulse rounded-full border-8 border-white/[0.08]" />
        </div>
        <p className="mt-4 text-sm text-text-3">Run a snapshot to generate citation share by brand.</p>
        {onRunSnapshot && (
          <div className="mt-3 flex justify-end">
            <RunSnapshotButton running={running ?? false} snapshotStatus={snapshotStatus ?? null} onRunSnapshot={onRunSnapshot} />
          </div>
        )}
      </>
    );
  }

  const clientRow = rows.find((r) => r.isClient) ?? null;
  const topCompetitor = rows.find((r) => !r.isClient) ?? null;
  const donutSize = 170;
  const strokeWidth = 24;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const neutral = ["rgba(255,255,255,0.42)", "rgba(255,255,255,0.24)", "rgba(255,255,255,0.18)", "rgba(255,255,255,0.13)", "rgba(255,255,255,0.1)"];

  let offset = 0;
  const slices = rows.map((row, idx) => {
    const length = (row.share / 100) * circumference;
    const stroke = row.isClient
      ? "rgba(245,158,11,0.95)"
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

  return (
    <div className="space-y-2">
      <div className="grid place-items-center">
        <div className="relative h-[170px] w-[170px]">
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
              <p className="text-[10px] uppercase tracking-[0.12em] text-text-3">Your position</p>
              <p className="mt-1 text-xl font-semibold tabular-nums text-text">{clientRow ? `#${clientRow.rank}` : "—"}</p>
              <p className="text-sm tabular-nums text-text-2">{clientRow ? `${clientRow.share}%` : "—"}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-text-3">
        {clientRow && topCompetitor
          ? clientRow.rank === 1
            ? `Leading next competitor by ${Math.max(0, clientRow.share - topCompetitor.share)}%`
            : `Trailing top competitor by ${Math.max(0, topCompetitor.share - clientRow.share)}%`
          : "Run a snapshot to compare position vs competitors."}
      </p>
    </div>
  );
}

/* Executive Summary — gap, weakest channel, confidence, sentiment (standalone section or below trajectory chart) */
function ExecutiveSummaryGrid({
  providers,
  confidence,
  score,
  delta,
  variant = "section",
}: {
  providers: [string, number][];
  confidence: { label: string; variant: BadgeVariant };
  score: number | null;
  delta: number | null;
  variant?: "section" | "embedded";
}) {
  const sorted = [...providers].sort((a, b) => b[1] - a[1]);
  const gapToLeader = sorted.length > 0 ? 100 - (sorted[0]?.[1] ?? 0) : null;
  const weakest = sorted.length > 0 ? sorted[sorted.length - 1] : null;
  const sentiment = getSentiment(score, delta);

  const tiles = [
    {
      label: "Gap to Leader",
      value: gapToLeader != null ? `${gapToLeader} pts` : "—",
      hint: "Distance to your strongest model channel",
    },
    {
      label: "Weakest Model",
      value: weakest ? getProviderDisplayName(weakest[0]) : "—",
      hint: weakest ? `Index ${weakest[1]} — shore this up first` : "Run a snapshot to expose the weak channel",
    },
    { label: "Confidence", value: confidence.label, hint: null, badge: true as const, variant: confidence.variant },
    { label: "Sentiment", value: sentiment.label, hint: sentiment.change, sentiment: true as const, sentimentLabel: sentiment.label },
  ];

  const grid = (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10">
      {tiles.map((t, i) => (
        <div key={i}>
          <p className="text-[10px] font-medium uppercase tracking-wider text-text-3">{t.label}</p>
          {t.badge ? (
            <div className="mt-1.5"><Badge variant={t.variant}>{t.value}</Badge></div>
          ) : t.sentiment ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className={cn(
                "rounded-md px-2 py-0.5 text-xs font-semibold",
                t.sentimentLabel === "Positive" && "bg-authority-dominant/15 text-authority-dominant",
                t.sentimentLabel === "Neutral" && "bg-white/10 text-text-2",
                t.sentimentLabel === "Negative" && "bg-authority-losing/15 text-authority-losing"
              )}>{t.value}</span>
              {t.hint && t.hint !== "—" && <span className="text-xs tabular-nums text-text-3">{t.hint}</span>}
            </div>
          ) : (
            <>
              <p className="mt-1 text-xl font-bold tabular-nums leading-tight text-text">{t.value}</p>
              {t.hint && <p className="mt-0.5 text-[11px] leading-snug text-text-3">{t.hint}</p>}
            </>
          )}
        </div>
      ))}
    </div>
  );

  if (variant === "embedded") {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Quick read</p>
        {grid}
      </div>
    );
  }

  return (
    <DashboardSection
      title="Quick read"
      subtitle="Gap to leader, weakest channel, confidence, and trajectory sentiment."
    >
      {grid}
    </DashboardSection>
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

/* Per-model vulnerability detail for expandable content */
function getModelVulnerabilityDetail(
  key: string,
  score: number | null,
  detail: SnapshotDetailResponse | null
): { whatsWrong: string[]; evidence: string[]; quickWins: string[] } {
  const whatsWrong = score != null ? getModelSignals(score, detail) : ["Run a snapshot to see issues."];
  const evidence: string[] = [];
  const quickWins: string[] = [];
  if (detail && score != null) {
    const mentionRate = pct(detail.summary.client_mentioned_count, detail.summary.responses_count || 1);
    const citationRate = pct(detail.summary.sources_count, detail.summary.responses_count || 1);
    if (mentionRate < 50) evidence.push(`Mentioned in ${mentionRate}% of AI responses`);
    else evidence.push(`Mentioned in ${mentionRate}% of responses`);
    if (citationRate < 20) evidence.push(`Citations in ${citationRate}% of responses — below threshold`);
    else evidence.push(`Citations in ${citationRate}% of responses`);
    if (score < 50) {
      quickWins.push("Audit content for model-specific optimization");
      quickWins.push("Strengthen structured data and entity markup");
    }
    if (mentionRate < 50) quickWins.push("Increase brand authority through PR and backlinks");
    if (quickWins.length === 0 && score < 80) quickWins.push("Monitor retrieval signals and maintain content quality");
  }
  if (evidence.length === 0) evidence.push("Run a snapshot to see evidence signals.");
  if (quickWins.length === 0) quickWins.push("Run a snapshot to get quick wins.");
  return { whatsWrong, evidence: evidence.slice(0, 4), quickWins: quickWins.slice(0, 4) };
}

function firstStrategicSentence(text: string): string {
  const t = text.trim();
  if (!t) return t;
  const part = t.split(/(?<=[.!?])\s+/)[0];
  return part ?? t;
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

function WhatIsWrongSection({
  providers,
  detail,
  snapshots,
  previousSnapshot,
  score,
  competitors,
}: {
  providers: [string, number][];
  detail: SnapshotDetailResponse | null;
  snapshots: SnapshotRow[];
  previousSnapshot: SnapshotRow | null;
  score: number | null;
  competitors: CompetitorRow[];
}) {
  const providerByKey = useMemo(() => {
    const map = new Map<string, [string, number]>();
    for (const [provider, score] of providers) {
      const key = getModelLogoKey(provider) || provider;
      if (VULN_MODELS.includes(key as (typeof VULN_MODELS)[number])) map.set(key, [provider, score]);
    }
    return map;
  }, [providers]);
  const modelSeries = useMemo(() => {
    const filtered = snapshots.filter(
      (s) => s.vrtl_score != null && (s.status?.toLowerCase().includes("complete") || s.status?.toLowerCase().includes("success"))
    ).slice(0, 6);
    const rev = [...filtered].reverse();
    const out: Record<string, number[]> = { openai: [], gemini: [], anthropic: [] };
    rev.forEach((s) => {
      const by = s.score_by_provider as Record<string, number> | null;
      if (!by) return;
      VULN_MODELS.forEach((key) => {
        const k = Object.keys(by).find((k2) => {
          const p = k2.toLowerCase();
          if (key === "openai") return p.includes("openai") || p.includes("chatgpt");
          if (key === "gemini") return p.includes("gemini") || p.includes("google");
          if (key === "anthropic") return p.includes("anthropic") || p.includes("claude");
          return false;
        });
        if (k != null) out[key].push(by[k]!);
      });
    });
    return out;
  }, [snapshots]);

  const prioritizedInsights = useMemo(() => {
    const insights = generateStrategicInsights(score, providers, competitors, detail);
    return [...insights]
      .sort(
        (a, b) =>
          (a.priority === "HIGH" ? 0 : a.priority === "MEDIUM" ? 1 : 2) -
          (b.priority === "HIGH" ? 0 : b.priority === "MEDIUM" ? 1 : 2)
      )
      .slice(0, 5);
  }, [score, providers, competitors, detail]);

  const { insightIdxByModel, portfolioInsights } = useMemo(() => {
    const used = new Set<number>();
    const idxByModel: Record<(typeof VULN_MODELS)[number], number | undefined> = {
      openai: undefined,
      gemini: undefined,
      anthropic: undefined,
    };
    for (const key of VULN_MODELS) {
      const re = MODEL_INSIGHT_MATCH[key];
      const idx = prioritizedInsights.findIndex(
        (ins, i) => !used.has(i) && re.test(`${ins.title} ${ins.insight} ${ins.action}`)
      );
      if (idx >= 0) {
        used.add(idx);
        idxByModel[key] = idx;
      }
    }
    const portfolio = prioritizedInsights.filter((_, i) => !used.has(i));
    return { insightIdxByModel: idxByModel, portfolioInsights: portfolio };
  }, [prioritizedInsights]);

  return (
    <DashboardSection
      title="Model channels & execution"
      subtitle="Per-model score, issue, and recommended action — open detail for evidence and quick wins."
    >
      <div>
        <div className="divide-y divide-white/[0.06]">
          {VULN_MODELS.map((key) => {
            const entry = providerByKey.get(key);
            const modelScore = entry ? entry[1] : null;
            const label = getModelDisplayName(key);
            const logoUrl = MODEL_LOGO[key];
            const statusTag = modelScore != null ? getMatrixStatusTag(modelScore) : null;
            const gap = modelScore != null ? 100 - modelScore : null;
            const barPct = modelScore != null ? modelScore : 0;
            const barColor = modelScore != null
              ? modelScore >= 80
                ? "bg-authority-dominant"
                : modelScore >= 60
                  ? "bg-sky-400/80"
                  : modelScore >= 40
                    ? "bg-authority-watchlist"
                    : "bg-authority-losing"
              : "bg-white/20";
            const prevScore = previousSnapshot?.score_by_provider
              ? (() => {
                  const by = previousSnapshot.score_by_provider as Record<string, number>;
                  const k = Object.keys(by).find((k2) => getModelLogoKey(k2) === key);
                  return k != null ? by[k] ?? null : null;
                })()
              : null;
            const delta = modelScore != null && prevScore != null ? modelScore - prevScore : null;
            const series = modelSeries[key] ?? [];
            const { whatsWrong, evidence, quickWins } = getModelVulnerabilityDetail(key, modelScore, detail);
            const insIdx = insightIdxByModel[key];
            const matched = insIdx !== undefined ? prioritizedInsights[insIdx] : undefined;
            const primaryIssue = formatPlaybookText(
              matched?.whyItMatters?.trim() || whatsWrong[0] || "Run a snapshot to surface channel-specific issues."
            );
            const primaryAction = formatPlaybookText(
              matched?.action
                ? firstStrategicSentence(matched.action)
                : quickWins[0] || "Run a snapshot for model-specific execution guidance."
            );

            return (
              <VulnerabilityRow
                key={key}
                label={label}
                logoUrl={logoUrl}
                score={modelScore}
                statusTag={statusTag}
                gapToLeader={gap}
                barPct={barPct}
                barColor={barColor}
                delta={delta}
                series={series}
                whatsWrong={whatsWrong}
                evidence={evidence}
                quickWins={quickWins}
                primaryIssue={primaryIssue}
                primaryAction={primaryAction}
              />
            );
          })}
        </div>
        {portfolioInsights.length > 0 && (
          <div className="border-t border-white/[0.06] pt-6 mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Portfolio-level plays</p>
            <ul className="mt-3 space-y-3">
              {portfolioInsights.map((ins, i) => (
                <li key={i}>
                  <p className="text-sm font-semibold text-text">{formatPlaybookText(ins.title)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-2">{formatPlaybookText(firstStrategicSentence(ins.action))}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </DashboardSection>
  );
}

function MicroSparkline({ scores, color }: { scores: number[]; color: string }) {
  if (scores.length < 2) return null;
  const w = 48;
  const h = 20;
  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = max - min || 1;
  const points = scores.map((val, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((val - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-5 w-12 shrink-0" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function VulnerabilityRow({
  label,
  logoUrl,
  score,
  statusTag,
  gapToLeader,
  barPct,
  barColor,
  delta,
  series,
  whatsWrong,
  evidence,
  quickWins,
  primaryIssue,
  primaryAction,
}: {
  label: string;
  logoUrl: string;
  score: number | null;
  statusTag: string | null;
  gapToLeader: number | null;
  barPct: number;
  barColor: string;
  delta: number | null;
  series: number[];
  whatsWrong: string[];
  evidence: string[];
  quickWins: string[];
  primaryIssue: string;
  primaryAction: string;
}) {
  const [open, setOpen] = useState(false);
  const trendColor = delta != null ? (delta >= 0 ? CHART_COLORS.dominant : CHART_COLORS.losing) : "#94a3b8";
  return (
    <div className="group">
      <div className="grid w-full grid-cols-1 gap-2 py-2.5 md:grid-cols-[minmax(0,1.4fr)_auto_auto_minmax(0,1fr)_auto_auto] md:items-center md:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-white/[0.08]">
            <img src={logoUrl} alt="" className="h-6 w-6 object-contain" width={24} height={24} />
          </div>
          <span className="truncate font-medium text-text">{label}</span>
        </div>
        {score != null ? (
          <span className="tabular-nums text-lg font-semibold text-text md:text-base">{score}</span>
        ) : (
          <span className="text-sm text-text-3">—</span>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {statusTag && (
            <span className={cn(
              "rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              statusTag === "Strong" && "bg-authority-dominant/20 text-authority-dominant",
              statusTag === "Stable" && "bg-sky-400/20 text-sky-200",
              statusTag === "Watchlist" && "bg-authority-watchlist/20 text-authority-watchlist",
              statusTag === "Critical" && "bg-authority-losing/20 text-authority-losing"
            )}>{statusTag}</span>
          )}
        </div>
        <div className="min-w-0 md:pr-2">
          <div className="h-3 w-full max-w-[220px] overflow-hidden rounded-full bg-white/[0.08] md:max-w-none">
            <div className={cn("h-full rounded-full", barColor)} style={{ width: `${barPct}%` }} />
          </div>
          {gapToLeader != null && (
            <p className="mt-1 text-[11px] text-text-3">Gap to perfect index: {gapToLeader} pts</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {series.length >= 2 && <MicroSparkline scores={series} color={trendColor} />}
          {delta != null && (
            <span className={cn("text-xs font-semibold tabular-nums", delta >= 0 ? "text-authority-dominant" : "text-authority-losing")}>
              {delta >= 0 ? "+" : ""}
              {delta} vs last
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="justify-self-end rounded p-1 text-text-3 transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 md:justify-self-center"
          aria-expanded={open}
          aria-label={open ? "Hide evidence detail" : "Show evidence detail"}
        >
          <svg className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <div className="pb-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Issue</p>
        <p className="mt-0.5 text-[15px] leading-relaxed text-text-2">{primaryIssue}</p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Recommended action</p>
        <p className="mt-0.5 text-[15px] leading-relaxed text-text">{primaryAction}</p>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-white/[0.06] pb-4 pt-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Evidence &amp; detail</p>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 md:gap-8">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-3">What&apos;s wrong</h4>
                <ul className="list-disc space-y-1 pl-4 text-sm text-text-2">
                  {whatsWrong.map((b, i) => (
                    <li key={i}>{formatPlaybookText(b)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-3">Evidence signals</h4>
                <ul className="list-disc space-y-1 pl-4 text-sm text-text-2">
                  {evidence.map((b, i) => (
                    <li key={i}>{formatPlaybookText(b)}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-3">Quick wins</h4>
                <ul className="list-disc space-y-1 pl-4 text-sm text-text-2">
                  {quickWins.map((b, i) => (
                    <li key={i}>{formatPlaybookText(b)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Derive "models affected" from insight title; uses central display names. */
function getModelsAffectedFromInsight(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("openai") || t.includes("gpt")) return getModelDisplayName("openai");
  if (t.includes("gemini") || t.includes("google")) return getModelDisplayName("gemini");
  if (t.includes("anthropic") || t.includes("claude")) return getModelDisplayName("anthropic");
  return "All";
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXECUTION PRIORITIES — top 3: title, impact, models affected, tactical bullets
═══════════════════════════════════════════════════════════════════════════ */
function ExecutionPriorities({
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
  const top3 = [...insights]
    .sort((a, b) => (a.priority === "HIGH" ? 0 : a.priority === "MEDIUM" ? 1 : 2) - (b.priority === "HIGH" ? 0 : b.priority === "MEDIUM" ? 1 : 2))
    .slice(0, 3);

  if (score === null) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-text mb-3">Execution Priorities</h2>
        <p className="text-sm text-text-2">Run a snapshot to generate priorities.</p>
      </section>
    );
  }

  if (top3.length === 0) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-text mb-3">Execution Priorities</h2>
        <p className="text-sm text-text-2">Authority is performing well. Continue monitoring.</p>
      </section>
    );
  }

  function actionBullets(action: string): string[] {
    const parts = action.split(/(?<=[.!])\s+/).filter(Boolean).map(s => s.trim()).slice(0, 3);
    if (parts.length > 0) return parts;
    return [action];
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-text mb-3">Execution Priorities</h2>
      <ul className="space-y-5">
        {top3.map((insight, idx) => (
          <li key={idx} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
            <p className="font-medium text-text">{insight.title}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0 text-xs text-text-3">
              <span>Impact: <span className={cn("font-medium text-text-2", insight.priority === "HIGH" && "text-authority-losing", insight.priority === "MEDIUM" && "text-authority-watchlist")}>{insight.priority}</span></span>
              <span>Models: {getModelsAffectedFromInsight(insight.title)}</span>
            </div>
            <ul className="mt-2 space-y-0.5 pl-4 list-disc text-sm text-text-2">
              {actionBullets(insight.action).map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
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
  const previousProviders: Record<string, number> = previousSnapshot?.score_by_provider
    ? (previousSnapshot.score_by_provider as Record<string, number>)
    : {};
  const confidence = getConfidenceLabel(competitors.length);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <div className="mx-auto max-w-[1200px] space-y-6 px-5 py-8 md:px-8 md:py-10">
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

            <HeroSection
              client={client}
              score={selectedSnapshot?.vrtl_score ?? null}
              previousScore={previousSnapshot?.vrtl_score ?? null}
              providers={providers}
              detail={snapshotDetail}
              snapshots={snapshots}
              snapshotId={selectedSnapshot?.id ?? null}
              snapshotStatus={selectedSnapshot?.status ?? null}
              selectedSnapshotId={selectedSnapshotId}
              onSelectSnapshotId={setSelectedSnapshotId}
              runSnapshot={runSnapshot}
              running={running}
            />

            <WhatIsWrongSection
              providers={providers}
              detail={snapshotDetail}
              snapshots={snapshots}
              previousSnapshot={previousSnapshot}
              score={selectedSnapshot?.vrtl_score ?? null}
              competitors={competitors}
            />

            <div className="-mt-3 border-t border-white/[0.06] pt-3">
              <ExecutiveSummaryGrid
                variant="embedded"
                providers={providers}
                confidence={confidence}
                score={selectedSnapshot?.vrtl_score ?? null}
                delta={selectedSnapshot?.vrtl_score != null && previousSnapshot?.vrtl_score != null ? selectedSnapshot.vrtl_score - previousSnapshot.vrtl_score : null}
              />
            </div>

            <DashboardSection
              title="Market Position"
              className="pt-4"
              subtitle="Where you stand right now and where you are trending."
            >
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6">
                <div className="lg:col-span-8">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">Trajectory (context)</p>
                  <BigTrendChart snapshots={snapshots} embedded />
                </div>
                <div className="lg:col-span-4">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-3">AI answer market share</p>
                  <AIAnswerMarketShareChart clientName={client.name} detail={snapshotDetail} onRunSnapshot={runSnapshot} running={running} snapshotStatus={selectedSnapshot?.status ?? null} />
                </div>
              </div>
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
