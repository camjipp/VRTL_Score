"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Link from "next/link";

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
  if (score === null) return { label: "No data", description: "Run a snapshot to measure visibility" };
  if (score >= 80) return { label: "Strong", description: "Consistently surfaced in AI responses" };
  if (score >= 50) return { label: "Moderate", description: "Mentioned but not prominently positioned" };
  return { label: "Weak", description: "Rarely surfaced in AI responses" };
}

function getScoreColor(score: number | null): string {
  if (score === null) return "text-text-3";
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number | null): string {
  if (score === null) return "bg-surface-2";
  if (score >= 80) return "bg-emerald-50";
  if (score >= 50) return "bg-amber-50";
  return "bg-red-50";
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
   TAB NAVIGATION
═══════════════════════════════════════════════════════════════════════════ */
type Tab = "overview" | "evidence" | "competitors" | "reports";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "evidence", label: "Evidence" },
  { id: "competitors", label: "Competitors" },
  { id: "reports", label: "Reports" },
];

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
        className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-text focus:border-text focus:outline-none"
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
function ScoreSparkline({ scores, color = "#10b981" }: { scores: number[]; color?: string }) {
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
   SCORE HERO (with sparkline)
═══════════════════════════════════════════════════════════════════════════ */
function ScoreHero({
  score,
  previousScore,
  confidence,
  updatedAt,
  status,
  historicalScores,
}: {
  score: number | null;
  previousScore: number | null;
  confidence: { label: string; variant: BadgeVariant };
  updatedAt: string | null;
  status: string | null;
  historicalScores: number[];
}) {
  const { label, description } = getScoreLabel(score);
  const delta = score !== null && previousScore !== null ? score - previousScore : null;

  const sparklineColor = score !== null && score >= 80 
    ? "#10b981" 
    : score !== null && score >= 50 
      ? "#f59e0b" 
      : "#ef4444";

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Score */}
        <div className="flex items-start gap-6">
          <div className="flex flex-col items-center">
            <span className={cn("text-6xl font-bold tabular-nums", getScoreColor(score))}>
              {score ?? "—"}
            </span>
            <span className="mt-1 text-xs text-text-3">AI Visibility Score</span>
          </div>

          {/* Sparkline + delta */}
          {historicalScores.length >= 2 && (
            <div className="hidden flex-col items-end sm:flex">
              <ScoreSparkline scores={historicalScores} color={sparklineColor} />
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "mt-1 flex items-center gap-0.5 text-sm font-semibold",
                    delta > 0 ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  <svg
                    className={cn("h-3 w-3", delta < 0 && "rotate-180")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(delta)} vs last
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Labels */}
        <div className="flex flex-wrap items-start gap-2 sm:flex-col sm:items-end">
          <div className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", getScoreBg(score), getScoreColor(score))}>
            {label}
          </div>
          <Badge variant={confidence.variant}>{confidence.label}</Badge>
          {status === "running" && <Badge variant="warning">Analyzing...</Badge>}
          {updatedAt && (
            <span className="text-xs text-text-3">{timeAgo(updatedAt)}</span>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm text-text-2">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROMPT PERFORMANCE
═══════════════════════════════════════════════════════════════════════════ */
function PromptPerformance({ detail }: { detail: SnapshotDetailResponse | null }) {
  if (!detail) {
    return (
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="text-sm font-semibold text-text">Prompt Performance</h3>
        <p className="mt-2 text-sm text-text-2">Run a snapshot to see performance</p>
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
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="text-sm font-semibold text-text">Prompt Performance</h3>
      
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* Mention rate */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-text-3">Mention Rate</span>
            <span className={cn(
              "text-lg font-bold",
              pct(summary.client_mentioned_count, total) >= 70 ? "text-emerald-600" :
              pct(summary.client_mentioned_count, total) >= 40 ? "text-amber-600" : "text-red-600"
            )}>
              {pct(summary.client_mentioned_count, total)}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                pct(summary.client_mentioned_count, total) >= 70 ? "bg-emerald-500" :
                pct(summary.client_mentioned_count, total) >= 40 ? "bg-amber-500" : "bg-red-500"
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
              pct(summary.sources_count, total) >= 50 ? "text-emerald-600" :
              pct(summary.sources_count, total) >= 20 ? "text-amber-600" : "text-text-2"
            )}>
              {pct(summary.sources_count, total)}%
            </span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-surface-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                pct(summary.sources_count, total) >= 50 ? "bg-emerald-500" :
                pct(summary.sources_count, total) >= 20 ? "bg-amber-500" : "bg-gray-400"
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
      <div className="mt-5 border-t border-border pt-4">
        <div className="text-xs text-text-3 mb-2">Position when mentioned</div>
        <div className="flex gap-1">
          {positions.top > 0 && (
            <div 
              className="h-6 bg-emerald-500 rounded-l transition-all flex items-center justify-center text-[10px] font-medium text-white"
              style={{ width: `${pct(positions.top, summary.client_mentioned_count || 1)}%`, minWidth: positions.top > 0 ? '24px' : 0 }}
              title={`Top position: ${positions.top}`}
            >
              {positions.top}
            </div>
          )}
          {positions.middle > 0 && (
            <div 
              className="h-6 bg-amber-500 transition-all flex items-center justify-center text-[10px] font-medium text-white"
              style={{ width: `${pct(positions.middle, summary.client_mentioned_count || 1)}%`, minWidth: positions.middle > 0 ? '24px' : 0 }}
              title={`Middle position: ${positions.middle}`}
            >
              {positions.middle}
            </div>
          )}
          {positions.bottom > 0 && (
            <div 
              className="h-6 bg-red-500 rounded-r transition-all flex items-center justify-center text-[10px] font-medium text-white"
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
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-emerald-500" /> Top</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-amber-500" /> Middle</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-red-500" /> Bottom</span>
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
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="text-sm font-semibold text-text">Score by AI Model</h3>
        <p className="mt-2 text-sm text-text-2">Run a snapshot to see model scores</p>
      </div>
    );
  }

  const sorted = [...providers].sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="text-sm font-semibold text-text">Score by AI Model</h3>
      <div className="mt-4 space-y-3">
        {sorted.map(([provider, score], idx) => {
          const { label } = getScoreLabel(score);
          const icon = provider.toLowerCase().includes("openai") || provider.toLowerCase().includes("chatgpt")
            ? "/ai/icons8-chatgpt.svg"
            : provider.toLowerCase().includes("claude") || provider.toLowerCase().includes("anthropic")
              ? "/ai/icons8-claude.svg"
              : provider.toLowerCase().includes("gemini") || provider.toLowerCase().includes("google")
                ? "/ai/gemini.png"
                : "/ai/icons8-chatgpt.svg";
          
          return (
            <div key={provider} className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs font-bold text-text-3">
                {idx + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={icon} alt={provider} className="h-6 w-6" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium capitalize text-text truncate">{provider}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-xs font-medium", getScoreColor(score))}>{label}</span>
                    <span className="text-sm font-bold tabular-nums text-text">{score}</span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-surface-2">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RECOMMENDATIONS
═══════════════════════════════════════════════════════════════════════════ */
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
  const recommendations: { text: string; type: "action" | "insight" | "warning" }[] = [];

  if (score === null) {
    return (
      <div className="rounded-xl border border-border bg-white p-5">
        <h3 className="text-sm font-semibold text-text">Recommendations</h3>
        <p className="mt-2 text-sm text-text-2">Run a snapshot to get recommendations</p>
      </div>
    );
  }

  // Generate recommendations based on data
  const weakProviders = providers.filter(([, s]) => s < 50);
  const strongProviders = providers.filter(([, s]) => s >= 80);
  const mentionRate = detail ? pct(detail.summary.client_mentioned_count, detail.summary.responses_count || 1) : 0;

  if (weakProviders.length > 0) {
    recommendations.push({
      text: `Improve visibility in ${weakProviders.map(([p]) => p).join(", ")} — currently scoring below 50`,
      type: "action",
    });
  }

  if (strongProviders.length > 0 && strongProviders.length < providers.length) {
    recommendations.push({
      text: `Strong performance in ${strongProviders.map(([p]) => p).join(", ")} — replicate this strategy`,
      type: "insight",
    });
  }

  if (competitors.length < 3) {
    recommendations.push({
      text: `Add ${3 - competitors.length} more competitor${competitors.length === 2 ? "" : "s"} for better benchmarking`,
      type: "action",
    });
  }

  if (mentionRate < 50) {
    recommendations.push({
      text: `Low mention rate (${mentionRate}%) — review brand positioning and content`,
      type: "warning",
    });
  }

  if (detail && detail.summary.sources_count < detail.summary.responses_count * 0.3) {
    recommendations.push({
      text: "Improve content authority — low citation rate indicates weak online presence",
      type: "action",
    });
  }

  if (score >= 70 && recommendations.length === 0) {
    recommendations.push({
      text: "Strong visibility — maintain current strategy and monitor for changes",
      type: "insight",
    });
  }

  const icons = {
    action: (
      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    insight: (
      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    warning: (
      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  const bgColors = {
    action: "bg-blue-50",
    insight: "bg-emerald-50",
    warning: "bg-amber-50",
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h3 className="text-sm font-semibold text-text">Recommendations</h3>
      <ul className="mt-3 space-y-2">
        {recommendations.map((rec, i) => (
          <li key={i} className={cn("flex items-start gap-3 rounded-lg p-2.5", bgColors[rec.type])}>
            <span className="shrink-0 mt-0.5">{icons[rec.type]}</span>
            <span className="text-sm text-text">{rec.text}</span>
          </li>
        ))}
      </ul>
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
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
          <svg className="h-5 w-5 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-amber-900">Analyzing AI responses...</div>
          <div className="mt-1 text-xs text-amber-700">
            Querying ChatGPT, Claude, and Gemini — {minutes}:{seconds.toString().padStart(2, '0')} elapsed
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-1.5 rounded-full bg-amber-200">
          <div 
            className="h-1.5 rounded-full bg-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-amber-600">
          This typically takes 2-3 minutes
        </div>
      </div>
    </div>
  );
}

function QuickActions({
  running,
  snapshotStatus,
  snapshotStartedAt,
  onRunSnapshot,
  onResetSnapshot,
}: {
  running: boolean;
  snapshotStatus: string | null;
  snapshotStartedAt: string | null;
  onRunSnapshot: () => void;
  onResetSnapshot: () => void;
}) {
  if (snapshotStatus === "running") {
    return (
      <div className="space-y-3">
        <SnapshotProgress startedAt={snapshotStartedAt} />
        <button
          onClick={onResetSnapshot}
          disabled={running}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2"
        >
          Reset stuck snapshot
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onRunSnapshot}
      disabled={running}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-text px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-text/90 disabled:opacity-50"
    >
      {running ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Starting...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          Run new snapshot
        </>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITORS TAB
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
            className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-3 focus:border-text focus:outline-none"
          />
          <input
            type="url"
            placeholder="https://competitor.com"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            disabled={busy}
            className="flex-1 rounded-lg border border-border bg-white px-4 py-2.5 text-sm text-text placeholder:text-text-3 focus:border-text focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="rounded-lg bg-text px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text/90 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {competitors.length > 0 ? (
        <div className="rounded-xl border border-border bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-text-3">
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
                      className="rounded-lg p-1.5 text-text-3 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
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
        <div className="rounded-xl border-2 border-dashed border-border bg-white py-12 text-center">
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
  clientName,
}: {
  detail: SnapshotDetailResponse | null;
  loading: boolean;
  clientName: string;
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
      <div className="rounded-xl border-2 border-dashed border-border bg-white py-12 text-center">
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
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-2xl font-bold text-text">{pct(summary.client_mentioned_count, signalsTotal)}%</div>
          <div className="text-xs text-text-2">Mention rate ({summary.client_mentioned_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-2xl font-bold text-text">{pct(summary.sources_count, signalsTotal)}%</div>
          <div className="text-xs text-text-2">Citeable ({summary.sources_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-2xl font-bold text-text">{pct(summary.specific_features_count, signalsTotal)}%</div>
          <div className="text-xs text-text-2">Feature specific ({summary.specific_features_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-xl border border-border bg-white p-4">
          <div className="text-2xl font-bold text-text">{signalsTotal}</div>
          <div className="text-xs text-text-2">Signals analyzed</div>
        </div>
      </div>

      {/* Findings list */}
      <div className="rounded-xl border border-border bg-white">
        <div className="border-b border-border px-5 py-4">
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
              high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
              medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
              low: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
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
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mentioned
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-text-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-border bg-surface p-4">
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
      <div className="rounded-xl border-2 border-dashed border-border bg-white py-12 text-center">
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

      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 18H7v-1.5l4-4 1.5 1.5-4 4zm6.5-10H8v-1h7v1z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text">AI Visibility Report</h3>
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
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      } catch (e) {
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
      if (data.snapshot?.id) {
        setSelectedSnapshotId(data.snapshot.id);
      }
    } catch (e) {
      setRunError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

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
  const confidence = getConfidenceLabel(competitors.length);

  return (
    <div className="space-y-6">
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
        <div className="rounded-xl border border-border bg-white py-16 text-center">
          <p className="text-text-2">Client not found (or not in your agency).</p>
          <Link href="/app" className="mt-4 inline-block text-sm text-text hover:underline">
            Back to clients
          </Link>
        </div>
      )}

      {client && (
        <>
          {/* Client header + snapshot selector */}
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
            <SnapshotSelector
              snapshots={snapshots}
              selectedId={selectedSnapshotId}
              onSelect={setSelectedSnapshotId}
            />
          </div>

          {/* Tab bar */}
          <div className="border-b border-border">
            <nav className="-mb-px flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-text text-text"
                      : "border-transparent text-text-2 hover:border-border hover:text-text"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {showSuccess && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-emerald-900">Snapshot complete!</div>
                    <div className="text-xs text-emerald-700">AI visibility score: {selectedSnapshot?.vrtl_score ?? "—"}</div>
                  </div>
                  <button onClick={() => setShowSuccess(false)} className="p-1 text-emerald-600 hover:text-emerald-800">
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

              {/* Score Hero */}
              <ScoreHero
                score={selectedSnapshot?.vrtl_score ?? null}
                previousScore={previousSnapshot?.vrtl_score ?? null}
                confidence={confidence}
                updatedAt={selectedSnapshot?.completed_at || selectedSnapshot?.created_at || null}
                status={selectedSnapshot?.status ?? null}
                historicalScores={historicalScores}
              />

              {/* Run snapshot button (always visible at top) */}
              <QuickActions
                running={running}
                snapshotStatus={selectedSnapshot?.status ?? null}
                snapshotStartedAt={selectedSnapshot?.started_at ?? selectedSnapshot?.created_at ?? null}
                onRunSnapshot={runSnapshot}
                onResetSnapshot={resetRunningSnapshot}
              />

              {/* Main content grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                <PromptPerformance detail={snapshotDetail} />
                <ProviderBreakdown providers={providers} />
              </div>

              {/* Recommendations */}
              <Recommendations
                score={selectedSnapshot?.vrtl_score ?? null}
                providers={providers}
                competitors={competitors}
                detail={snapshotDetail}
              />
            </div>
          )}

          {activeTab === "evidence" && (
            <EvidenceTab
              detail={snapshotDetail}
              loading={detailLoading}
              clientName={client.name}
            />
          )}

          {activeTab === "competitors" && (
            <CompetitorsTab
              competitors={competitors}
              busy={busy}
              newName={newName}
              newWebsite={newWebsite}
              setNewName={setNewName}
              setNewWebsite={setNewWebsite}
              onAddCompetitor={addCompetitor}
              onDeleteCompetitor={deleteCompetitor}
            />
          )}

          {activeTab === "reports" && (
            <ReportsTab snapshot={selectedSnapshot} clientName={client.name} />
          )}
        </>
      )}
    </div>
  );
}
