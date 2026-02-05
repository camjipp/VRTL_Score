"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useCallback } from "react";
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
  if (score === null) return "text-[#999]";
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number | null): string {
  if (score === null) return "bg-[#F5F5F5]";
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
      <label className="text-sm text-[#666]">Snapshot:</label>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="rounded-lg border border-[#E5E5E5] bg-white px-3 py-1.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:outline-none"
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
   SCORE HERO
═══════════════════════════════════════════════════════════════════════════ */
function ScoreHero({
  score,
  previousScore,
  confidence,
  updatedAt,
  status,
}: {
  score: number | null;
  previousScore: number | null;
  confidence: { label: string; variant: BadgeVariant };
  updatedAt: string | null;
  status: string | null;
}) {
  const { label, description } = getScoreLabel(score);
  const delta = score !== null && previousScore !== null ? score - previousScore : null;

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
        <div className="flex flex-col items-center sm:items-start">
          <div className="flex items-baseline gap-3">
            <span className={cn("text-7xl font-bold tabular-nums", getScoreColor(score))}>
              {score ?? "—"}
            </span>
            {delta !== null && delta !== 0 && (
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold",
                  delta > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}
              >
                <svg
                  className={cn("h-3.5 w-3.5", delta < 0 && "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {Math.abs(delta)}
              </span>
            )}
          </div>
          <div className="mt-1 text-sm text-[#999]">AI Visibility Score</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:ml-auto sm:mt-0 sm:flex-col sm:items-end sm:gap-1.5">
          <div className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", getScoreBg(score), getScoreColor(score))}>
            {label}
          </div>
          <Badge variant={confidence.variant}>{confidence.label}</Badge>
          {status === "running" && <Badge variant="warning">Analyzing...</Badge>}
          {updatedAt && (
            <span className="text-xs text-[#999]">Updated {timeAgo(updatedAt)}</span>
          )}
        </div>
      </div>
      <p className="mt-4 text-sm text-[#666]">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHY THIS SCORE
═══════════════════════════════════════════════════════════════════════════ */
function WhyThisScore({
  score,
  providers,
  competitors,
  snapshotCount,
}: {
  score: number | null;
  providers: [string, number][];
  competitors: CompetitorRow[];
  snapshotCount: number;
}) {
  if (score === null) {
    return (
      <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#0A0A0A]">Why this score?</h3>
        <p className="mt-2 text-sm text-[#666]">
          Run a snapshot to analyze how AI models perceive this brand.
        </p>
      </div>
    );
  }

  const insights: { icon: string; text: string; sentiment: "positive" | "neutral" | "negative" }[] = [];

  const strongProviders = providers.filter(([, s]) => s >= 80);
  const weakProviders = providers.filter(([, s]) => s < 50);
  const moderateProviders = providers.filter(([, s]) => s >= 50 && s < 80);

  if (strongProviders.length > 0) {
    insights.push({
      icon: "✓",
      text: `Strong presence in ${strongProviders.map(([p]) => p).join(", ")}`,
      sentiment: "positive",
    });
  }

  if (weakProviders.length > 0) {
    insights.push({
      icon: "!",
      text: `Weak visibility in ${weakProviders.map(([p]) => p).join(", ")}`,
      sentiment: "negative",
    });
  }

  if (moderateProviders.length > 0 && strongProviders.length === 0) {
    insights.push({
      icon: "—",
      text: `Moderate positioning in ${moderateProviders.map(([p]) => p).join(", ")}`,
      sentiment: "neutral",
    });
  }

  if (competitors.length >= 3) {
    insights.push({
      icon: "✓",
      text: `Benchmarked against ${competitors.length} competitors`,
      sentiment: "positive",
    });
  } else if (competitors.length > 0) {
    insights.push({
      icon: "—",
      text: `Only ${competitors.length} competitor${competitors.length === 1 ? "" : "s"} tracked — add more for better insights`,
      sentiment: "neutral",
    });
  } else {
    insights.push({
      icon: "!",
      text: "No competitors tracked — competitive context unavailable",
      sentiment: "negative",
    });
  }

  if (snapshotCount > 1) {
    insights.push({
      icon: "✓",
      text: `${snapshotCount} snapshots on record — trend data available`,
      sentiment: "positive",
    });
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <h3 className="text-sm font-semibold text-[#0A0A0A]">Why this score?</h3>
      <ul className="mt-3 space-y-2">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                insight.sentiment === "positive" && "bg-emerald-100 text-emerald-700",
                insight.sentiment === "neutral" && "bg-[#F5F5F5] text-[#666]",
                insight.sentiment === "negative" && "bg-red-100 text-red-700"
              )}
            >
              {insight.icon}
            </span>
            <span className="text-[#333]">{insight.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PROVIDER BREAKDOWN
═══════════════════════════════════════════════════════════════════════════ */
function ProviderBreakdown({ providers }: { providers: [string, number][] }) {
  if (providers.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <h3 className="text-sm font-semibold text-[#0A0A0A]">Score by AI Model</h3>
      <div className="mt-4 space-y-3">
        {providers.map(([provider, score]) => {
          const { label } = getScoreLabel(score);
          return (
            <div key={provider} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A0A0A] text-xs font-bold text-white">
                {provider.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-[#0A0A0A]">{provider}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-medium", getScoreColor(score))}>{label}</span>
                    <span className="text-sm font-semibold tabular-nums text-[#0A0A0A]">{score}</span>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-[#E5E5E5]">
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
   QUICK ACTIONS
═══════════════════════════════════════════════════════════════════════════ */
function QuickActions({
  running,
  snapshotStatus,
  onRunSnapshot,
  onResetSnapshot,
}: {
  running: boolean;
  snapshotStatus: string | null;
  onRunSnapshot: () => void;
  onResetSnapshot: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <h3 className="text-sm font-semibold text-[#0A0A0A]">Actions</h3>
      <div className="mt-3 space-y-2">
        <button
          onClick={onRunSnapshot}
          disabled={running}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A0A0A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50"
        >
          {running ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
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

        {snapshotStatus === "running" && (
          <button
            onClick={onResetSnapshot}
            disabled={running}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-sm font-medium text-[#666] transition-colors hover:bg-[#F5F5F5]"
          >
            Reset stuck snapshot
          </button>
        )}
      </div>
    </div>
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
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Competitors</h2>
          <p className="text-sm text-[#666]">
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
            className="flex-1 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#999] focus:border-[#0A0A0A] focus:outline-none"
          />
          <input
            type="url"
            placeholder="https://competitor.com"
            value={newWebsite}
            onChange={(e) => setNewWebsite(e.target.value)}
            disabled={busy}
            className="flex-1 rounded-lg border border-[#E5E5E5] bg-white px-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#999] focus:border-[#0A0A0A] focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !newName.trim()}
            className="rounded-lg bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50"
          >
            Add
          </button>
        </form>
      )}

      {competitors.length > 0 ? (
        <div className="rounded-xl border border-[#E5E5E5] bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-left text-xs font-medium uppercase tracking-wide text-[#999]">
                <th className="px-4 py-3">Competitor</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {competitors.map((c) => (
                <tr key={c.id} className="group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A0A0A] text-xs font-bold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#0A0A0A]">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#666]">
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
                      className="rounded-lg p-1.5 text-[#999] opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
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
        <div className="rounded-xl border-2 border-dashed border-[#E5E5E5] bg-white py-12 text-center">
          <p className="text-sm font-medium text-[#0A0A0A]">No competitors tracked</p>
          <p className="mt-1 text-xs text-[#999]">Add competitors to improve analysis confidence</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EVIDENCE TAB (inline, no page hop)
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
        <div className="h-24 animate-pulse rounded-xl bg-[#F5F5F5]" />
        <div className="h-64 animate-pulse rounded-xl bg-[#F5F5F5]" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#E5E5E5] bg-white py-12 text-center">
        <p className="text-sm font-medium text-[#0A0A0A]">No evidence available</p>
        <p className="mt-1 text-xs text-[#999]">Run a snapshot to generate evidence</p>
      </div>
    );
  }

  const { summary, responses } = detail;
  const signalsTotal = summary.responses_count;

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
          <div className="text-2xl font-bold text-[#0A0A0A]">{pct(summary.client_mentioned_count, signalsTotal)}%</div>
          <div className="text-xs text-[#666]">Mention rate ({summary.client_mentioned_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
          <div className="text-2xl font-bold text-[#0A0A0A]">{pct(summary.sources_count, signalsTotal)}%</div>
          <div className="text-xs text-[#666]">Citeable ({summary.sources_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
          <div className="text-2xl font-bold text-[#0A0A0A]">{pct(summary.specific_features_count, signalsTotal)}%</div>
          <div className="text-xs text-[#666]">Feature specific ({summary.specific_features_count}/{signalsTotal})</div>
        </div>
        <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
          <div className="text-2xl font-bold text-[#0A0A0A]">{signalsTotal}</div>
          <div className="text-xs text-[#666]">Signals analyzed</div>
        </div>
      </div>

      {/* Findings list */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white">
        <div className="border-b border-[#E5E5E5] px-5 py-4">
          <h3 className="font-semibold text-[#0A0A0A]">Detailed Findings</h3>
          <p className="text-xs text-[#666]">{responses.length} signals analyzed</p>
        </div>
        <div className="divide-y divide-[#E5E5E5]">
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
                <summary className="flex cursor-pointer items-center justify-between p-4 hover:bg-[#FAFAF8]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F5F5F5] text-xs font-bold text-[#666]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn("rounded-lg border px-2 py-0.5 text-xs font-medium", styles.bg, styles.text, styles.border)}>
                          {severity === "high" ? "High" : severity === "medium" ? "Medium" : "Strong"}
                        </span>
                        <span className="text-sm font-medium text-[#0A0A0A]">{title}</span>
                      </div>
                      {mentioned && (
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Mentioned
                        </span>
                      )}
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-[#999] transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </summary>
                <div className="border-t border-[#E5E5E5] bg-[#FAFAF8] p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-[#0A0A0A]">Position</h4>
                      <p className="mt-1 text-sm text-[#666] capitalize">{position || "—"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[#0A0A0A]">Recommendation strength</h4>
                      <p className="mt-1 text-sm text-[#666] capitalize">{strength || "—"}</p>
                    </div>
                  </div>
                  {r.competitors_mentioned.length > 0 && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-[#0A0A0A]">Competitors mentioned</h4>
                      <p className="mt-1 text-sm text-[#666]">{r.competitors_mentioned.join(", ")}</p>
                    </div>
                  )}
                  {r.evidence_snippet && (
                    <div className="mt-3 rounded-lg border border-[#E5E5E5] bg-white p-3 text-sm text-[#666]">
                      <strong className="text-[#0A0A0A]">Evidence:</strong> &quot;{r.evidence_snippet}&quot;
                    </div>
                  )}
                </div>
              </details>
            );
          })}
          {responses.length === 0 && (
            <div className="py-12 text-center text-sm text-[#999]">No findings available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORTS TAB (inline download)
═══════════════════════════════════════════════════════════════════════════ */
function ReportsTab({
  snapshot,
  clientName,
}: {
  snapshot: SnapshotRow | null;
  clientName: string;
}) {
  if (!snapshot || !snapshot.vrtl_score) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#E5E5E5] bg-white py-12 text-center">
        <p className="text-sm font-medium text-[#0A0A0A]">No reports available</p>
        <p className="mt-1 text-xs text-[#999]">Run a completed snapshot to generate reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#0A0A0A]">Download Report</h2>
        <p className="text-sm text-[#666]">
          Generate a branded PDF report for {clientName}
        </p>
      </div>

      <div className="rounded-xl border border-[#E5E5E5] bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F5]">
            <svg className="h-6 w-6 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[#0A0A0A]">AI Visibility Report</h3>
            <p className="mt-1 text-sm text-[#666]">
              Professional PDF with score breakdown, evidence, and recommendations. Ready for client presentation.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#999]">
              <span>Score: {snapshot.vrtl_score}</span>
              <span>·</span>
              <span>{new Date(snapshot.created_at).toLocaleDateString()}</span>
              <span>·</span>
              <Badge variant={statusVariant(snapshot.status)}>{snapshot.status}</Badge>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <DownloadPdfButton snapshotId={snapshot.id} />
        </div>
      </div>

      {/* Report history hint */}
      <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-4 text-sm text-[#666]">
        <strong className="text-[#0A0A0A]">Tip:</strong> Use the snapshot selector above to download reports from previous snapshots.
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);
  const supabase = getSupabaseBrowserClient();

  // Core state
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [client, setClient] = useState<ClientRow | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Detail data for Evidence/Reports tabs (loaded on demand)
  const [snapshotDetail, setSnapshotDetail] = useState<SnapshotDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Selected snapshot
  const selectedSnapshot = useMemo(
    () => snapshots.find((s) => s.id === selectedSnapshotId) ?? snapshots[0] ?? null,
    [snapshots, selectedSnapshotId]
  );
  const previousSnapshot = useMemo(() => snapshots[1] ?? null, [snapshots]);

  // Data refresh
  const refresh = useCallback(async (currentAgencyId: string) => {
    const clientRes = await supabase
      .from("clients")
      .select("id,name,website,industry")
      .eq("id", clientId)
      .eq("agency_id", currentAgencyId)
      .maybeSingle();

    if (clientRes.error) throw clientRes.error;
    setClient((clientRes.data as ClientRow | null) ?? null);

    const competitorsRes = await supabase
      .from("competitors")
      .select("id,name,website,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (competitorsRes.error) throw competitorsRes.error;
    setCompetitors((competitorsRes.data ?? []) as CompetitorRow[]);

    const snapsRes = await supabase
      .from("snapshots")
      .select("id,status,vrtl_score,score_by_provider,started_at,completed_at,created_at,error")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!snapsRes.error && snapsRes.data) {
      const rows = snapsRes.data as SnapshotRow[];
      setSnapshots(rows);
      if (!selectedSnapshotId && rows[0]) {
        setSelectedSnapshotId(rows[0].id);
      }
    } else {
      setSnapshots([]);
    }
  }, [clientId, supabase, selectedSnapshotId]);

  // Load snapshot detail (for Evidence/Reports tabs)
  const loadDetail = useCallback(async (snapshotId: string) => {
    if (!snapshotId) return;
    setDetailLoading(true);
    try {
      const { accessToken } = await ensureOnboarded();
      const qs = new URLSearchParams({ snapshotId, clientId });
      const res = await fetch(`/api/snapshots/detail?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setSnapshotDetail((await res.json()) as SnapshotDetailResponse);
    } catch (e) {
      console.error("Failed to load snapshot detail:", e);
      setSnapshotDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, [clientId]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!clientId) return;
      setLoading(true);
      setError(null);
      try {
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;
        setAgencyId(agencyId);
        await refresh(agencyId);
      } catch (e) {
        if (!cancelled) setError(errorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [clientId, refresh]);

  // Poll while running
  useEffect(() => {
    if (!agencyId) return;
    if (selectedSnapshot?.status !== "running") return;
    let cancelled = false;
    const t = window.setInterval(() => {
      if (cancelled) return;
      refresh(agencyId).catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      });
    }, 5000);
    return () => { cancelled = true; window.clearInterval(t); };
  }, [agencyId, selectedSnapshot?.status, refresh]);

  // Load detail when switching to Evidence/Reports tabs
  useEffect(() => {
    if ((activeTab === "evidence" || activeTab === "reports") && selectedSnapshot) {
      loadDetail(selectedSnapshot.id);
    }
  }, [activeTab, selectedSnapshot, loadDetail]);

  // Actions
  async function resetRunningSnapshot() {
    if (!clientId || !agencyId) return;
    const ok = window.confirm("Reset the currently running snapshot?");
    if (!ok) return;

    setRunError(null);
    setRunning(true);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/snapshots/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) throw new Error(await res.text());
      await refresh(agencyId);
    } catch (e) {
      setRunError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

  async function runSnapshot() {
    if (!clientId) return;
    setRunError(null);
    setRunning(true);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/snapshots/run", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ clientId }),
      });
      if (!res.ok) {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          throw new Error(json.error || `Failed (${res.status})`);
        }
        throw new Error(await res.text());
      }
      await refresh(agencyId ?? "");
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
        <Link href="/app" className="text-[#666] hover:text-[#0A0A0A]">Dashboard</Link>
        <span className="text-[#999]">/</span>
        <span className="text-[#0A0A0A]">{client?.name || "Client"}</span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-[#F5F5F5]" />
          <div className="h-32 animate-pulse rounded-xl bg-[#F5F5F5]" />
          <div className="h-48 animate-pulse rounded-xl bg-[#F5F5F5]" />
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
        <div className="rounded-xl border border-[#E5E5E5] bg-white py-16 text-center">
          <p className="text-[#666]">Client not found (or not in your agency).</p>
          <Link href="/app" className="mt-4 inline-block text-sm text-[#0A0A0A] hover:underline">
            Back to dashboard
          </Link>
        </div>
      )}

      {client && (
        <>
          {/* Client header + snapshot selector */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">{client.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#666]">
                {client.website && (
                  <a href={client.website} target="_blank" rel="noreferrer" className="hover:underline">
                    {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
                {client.website && <span className="text-[#ccc]">·</span>}
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
          <div className="border-b border-[#E5E5E5]">
            <nav className="-mb-px flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "border-[#0A0A0A] text-[#0A0A0A]"
                      : "border-transparent text-[#666] hover:border-[#E5E5E5] hover:text-[#0A0A0A]"
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
              {runError && (
                <Alert variant="danger">
                  <AlertDescription>{runError}</AlertDescription>
                </Alert>
              )}

              <ScoreHero
                score={selectedSnapshot?.vrtl_score ?? null}
                previousScore={previousSnapshot?.vrtl_score ?? null}
                confidence={confidence}
                updatedAt={selectedSnapshot?.completed_at || selectedSnapshot?.created_at || null}
                status={selectedSnapshot?.status ?? null}
              />

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                  <WhyThisScore
                    score={selectedSnapshot?.vrtl_score ?? null}
                    providers={providers}
                    competitors={competitors}
                    snapshotCount={snapshots.length}
                  />
                  <ProviderBreakdown providers={providers} />
                </div>

                <div className="space-y-6">
                  <QuickActions
                    running={running}
                    snapshotStatus={selectedSnapshot?.status ?? null}
                    onRunSnapshot={runSnapshot}
                    onResetSnapshot={resetRunningSnapshot}
                  />

                  <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
                    <h3 className="text-sm font-semibold text-[#0A0A0A]">Quick stats</h3>
                    <dl className="mt-3 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-[#666]">Competitors tracked</dt>
                        <dd className="font-medium text-[#0A0A0A]">{competitors.length}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[#666]">Snapshots</dt>
                        <dd className="font-medium text-[#0A0A0A]">{snapshots.length}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-[#666]">AI models</dt>
                        <dd className="font-medium text-[#0A0A0A]">{providers.length || "—"}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
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
