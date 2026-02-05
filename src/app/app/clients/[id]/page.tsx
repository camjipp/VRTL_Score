"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES (unchanged from original)
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

// Semantic score interpretation
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

/* ═══════════════════════════════════════════════════════════════════════════
   TAB NAVIGATION (Ahrefs-style)
═══════════════════════════════════════════════════════════════════════════ */
type Tab = "overview" | "snapshots" | "competitors" | "evidence" | "reports";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: "snapshots",
    label: "Snapshots",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: "competitors",
    label: "Competitors",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
  {
    id: "evidence",
    label: "Evidence",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: "reports",
    label: "Reports",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
];

function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  return (
    <div className="border-b border-[#E5E5E5]">
      <nav className="-mb-px flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-[#0A0A0A] text-[#0A0A0A]"
                : "border-transparent text-[#666] hover:border-[#E5E5E5] hover:text-[#0A0A0A]"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCORE HERO (Dominant metric - Ahrefs style)
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
        {/* Score number - dominant */}
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

        {/* Metadata column */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:ml-auto sm:mt-0 sm:flex-col sm:items-end sm:gap-1.5">
          {/* Semantic label */}
          <div className={cn("rounded-lg px-3 py-1.5 text-sm font-medium", getScoreBg(score), getScoreColor(score))}>
            {label}
          </div>
          {/* Confidence badge */}
          <Badge variant={confidence.variant}>{confidence.label}</Badge>
          {/* Status if running */}
          {status === "running" && <Badge variant="warning">Analyzing...</Badge>}
          {/* Updated timestamp */}
          {updatedAt && (
            <span className="text-xs text-[#999]">Updated {timeAgo(updatedAt)}</span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-sm text-[#666]">{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHY THIS SCORE (Insight bullets - Ahrefs style)
═══════════════════════════════════════════════════════════════════════════ */
function WhyThisScore({
  score,
  providers,
  competitors,
  snapshotCount,
  clientId,
  snapshotId,
}: {
  score: number | null;
  providers: [string, number][];
  competitors: CompetitorRow[];
  snapshotCount: number;
  clientId: string;
  snapshotId: string | null;
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

  // Derive insights from provider scores
  const insights: { icon: string; text: string; sentiment: "positive" | "neutral" | "negative" }[] = [];

  // Provider-specific insights
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

  // Competitor context
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

  // Historical context
  if (snapshotCount > 1) {
    insights.push({
      icon: "✓",
      text: `${snapshotCount} snapshots on record — trend data available`,
      sentiment: "positive",
    });
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#0A0A0A]">Why this score?</h3>
        {snapshotId && (
          <Link
            href={`/app/clients/${clientId}/snapshots/${snapshotId}`}
            className="text-xs font-medium text-[#0A0A0A] hover:underline"
          >
            View evidence →
          </Link>
        )}
      </div>
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
   PROVIDER BREAKDOWN (Semantic labels)
═══════════════════════════════════════════════════════════════════════════ */
function ProviderBreakdown({ providers }: { providers: [string, number][] }) {
  if (providers.length === 0) {
    return null;
  }

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
   QUICK ACTIONS (Run snapshot, Download report)
═══════════════════════════════════════════════════════════════════════════ */
function QuickActions({
  running,
  hasSnapshot,
  snapshotStatus,
  onRunSnapshot,
  onResetSnapshot,
  clientId,
  snapshotId,
}: {
  running: boolean;
  hasSnapshot: boolean;
  snapshotStatus: string | null;
  onRunSnapshot: () => void;
  onResetSnapshot: () => void;
  clientId: string;
  snapshotId: string | null;
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

        {hasSnapshot && snapshotId && (
          <Link
            href={`/app/clients/${clientId}/snapshots/${snapshotId}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            View full report
          </Link>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITORS TAB CONTENT
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#0A0A0A]">Competitors</h2>
          <p className="text-sm text-[#666]">
            {competitors.length}/8 tracked · {8 - competitors.length} slots available
          </p>
        </div>
        <Badge variant={confidence.variant}>{confidence.label}</Badge>
      </div>

      {/* Add form */}
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

      {/* List */}
      {competitors.length > 0 ? (
        <div className="rounded-xl border border-[#E5E5E5] bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-left text-xs font-medium uppercase tracking-wide text-[#999]">
                <th className="px-4 py-3">Competitor</th>
                <th className="px-4 py-3">Website</th>
                <th className="px-4 py-3">Added</th>
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
                  <td className="px-4 py-3 text-sm text-[#666]">
                    {new Date(c.created_at).toLocaleDateString()}
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
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5]">
            <svg className="h-6 w-6 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[#0A0A0A]">No competitors tracked</p>
          <p className="mt-1 text-xs text-[#999]">Add competitors to improve analysis confidence</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SNAPSHOTS TAB CONTENT
═══════════════════════════════════════════════════════════════════════════ */
function SnapshotsTab({ snapshots, clientId }: { snapshots: SnapshotRow[]; clientId: string }) {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#E5E5E5] bg-white py-12 text-center">
        <p className="text-sm font-medium text-[#0A0A0A]">No snapshots yet</p>
        <p className="mt-1 text-xs text-[#999]">Run your first snapshot to start tracking visibility</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E5E5] text-left text-xs font-medium uppercase tracking-wide text-[#999]">
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Models</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 w-12"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5E5]">
          {snapshots.map((s) => (
            <tr key={s.id} className="group transition-colors hover:bg-[#FAFAF8]">
              <td className="px-4 py-3">
                <span className={cn("text-lg font-bold tabular-nums", getScoreColor(s.vrtl_score))}>
                  {s.vrtl_score ?? "—"}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-[#666]">
                {s.score_by_provider ? Object.keys(s.score_by_provider).length : 0}
              </td>
              <td className="px-4 py-3 text-sm text-[#666]">
                {new Date(s.created_at).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/app/clients/${clientId}/snapshots/${s.id}`}
                  className="rounded-lg p-1.5 text-[#999] opacity-0 transition-all hover:bg-[#F5F5F5] hover:text-[#0A0A0A] group-hover:opacity-100"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PLACEHOLDER TAB (for Evidence/Reports)
═══════════════════════════════════════════════════════════════════════════ */
function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#E5E5E5] bg-white py-12 text-center">
      <p className="text-sm font-medium text-[#0A0A0A]">{title}</p>
      <p className="mt-1 text-xs text-[#999]">{description}</p>
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

  // State
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [client, setClient] = useState<ClientRow | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  const [snapshot, setSnapshot] = useState<SnapshotRow | null>(null);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Data refresh (unchanged logic)
  async function refresh(currentAgencyId: string) {
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
      .limit(10);

    if (!snapsRes.error && snapsRes.data) {
      const rows = snapsRes.data as SnapshotRow[];
      setSnapshots(rows);
      setSnapshot(rows[0] ?? null);
    } else {
      setSnapshot(null);
      setSnapshots([]);
    }
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Poll while running
  useEffect(() => {
    if (!agencyId) return;
    if (snapshot?.status !== "running") return;
    let cancelled = false;
    const t = window.setInterval(() => {
      if (cancelled) return;
      refresh(agencyId).catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      });
    }, 5000);
    return () => { cancelled = true; window.clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, snapshot?.status]);

  // Actions (unchanged logic)
  async function resetRunningSnapshot() {
    if (!clientId || !agencyId) return;
    const ok = window.confirm("Reset the currently running snapshot? This marks it as failed so you can run again.");
    if (!ok) return;

    setRunError(null);
    setRunning(true);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/snapshots/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ clientId })
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
        body: JSON.stringify({ clientId })
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
        website: newWebsite || null
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
  const providers: [string, number][] = snapshot?.score_by_provider ? Object.entries(snapshot.score_by_provider) : [];
  const previousSnapshot = snapshots[1] ?? null;
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
          {/* Client header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0A0A0A]">{client.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#666]">
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
                {client.website && <span className="text-[#ccc]">·</span>}
                <span className="capitalize">{client.industry.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Run error */}
              {runError && (
                <Alert variant="danger">
                  <AlertDescription>{runError}</AlertDescription>
                </Alert>
              )}

              {/* Score hero - dominant metric */}
              <ScoreHero
                score={snapshot?.vrtl_score ?? null}
                previousScore={previousSnapshot?.vrtl_score ?? null}
                confidence={confidence}
                updatedAt={snapshot?.completed_at || snapshot?.created_at || null}
                status={snapshot?.status ?? null}
              />

              {/* Two-column layout */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column - Why + Providers */}
                <div className="space-y-6 lg:col-span-2">
                  <WhyThisScore
                    score={snapshot?.vrtl_score ?? null}
                    providers={providers}
                    competitors={competitors}
                    snapshotCount={snapshots.length}
                    clientId={clientId}
                    snapshotId={snapshot?.id ?? null}
                  />
                  <ProviderBreakdown providers={providers} />
                </div>

                {/* Right column - Actions */}
                <div className="space-y-6">
                  <QuickActions
                    running={running}
                    hasSnapshot={!!snapshot}
                    snapshotStatus={snapshot?.status ?? null}
                    onRunSnapshot={runSnapshot}
                    onResetSnapshot={resetRunningSnapshot}
                    clientId={clientId}
                    snapshotId={snapshot?.id ?? null}
                  />

                  {/* Summary cards */}
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

          {activeTab === "snapshots" && (
            <SnapshotsTab snapshots={snapshots} clientId={clientId} />
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

          {activeTab === "evidence" && (
            snapshot ? (
              <div className="space-y-4">
                <p className="text-sm text-[#666]">
                  Detailed evidence from the latest snapshot analysis.
                </p>
                <Link
                  href={`/app/clients/${clientId}/snapshots/${snapshot.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a]"
                >
                  View full evidence report →
                </Link>
              </div>
            ) : (
              <PlaceholderTab
                title="No evidence yet"
                description="Run a snapshot to generate evidence"
              />
            )
          )}

          {activeTab === "reports" && (
            snapshot ? (
              <div className="space-y-4">
                <p className="text-sm text-[#666]">
                  Download branded PDF reports for client presentations.
                </p>
                <Link
                  href={`/app/clients/${clientId}/snapshots/${snapshot.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a]"
                >
                  Go to report download →
                </Link>
              </div>
            ) : (
              <PlaceholderTab
                title="No reports available"
                description="Run a snapshot to generate reports"
              />
            )
          )}
        </>
      )}
    </div>
  );
}
