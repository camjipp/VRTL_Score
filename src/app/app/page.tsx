"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

type ClientWithStats = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
  created_at: string;
  // Snapshot stats
  latestScore: number | null;
  previousScore: number | null;
  lastSnapshotAt: string | null;
  snapshotCount: number;
  recentScores: number[]; // Last 5 scores for sparkline
  status: "running" | "complete" | "none";
  // Detailed stats
  mentionRate: number | null;
  topPositionRate: number | null;
  citationRate: number | null;
  competitorRank: number | null;
  competitorCount: number;
  bestModel: string | null;
  worstModel: string | null;
  hasAlert: boolean;
};

type PortfolioStats = {
  totalClients: number;
  avgScore: number;
  avgScoreDelta: number | null;
  snapshotsThisMonth: number;
  clientsWithAlerts: number;
  strongClients: number;
  moderateClients: number;
  weakClients: number;
  improvingClients: number;
  decliningClients: number;
};

type SnapshotDetailResponse = {
  summary: {
    responses_count: number;
    client_mentioned_count: number;
    sources_count: number;
    top_competitors: Array<{ name: string; count: number }>;
  };
  responses: Array<{
    client_mentioned: boolean;
    client_position: string | null;
  }>;
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function displayUrl(url: string | null): string {
  if (!url) return "";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0].split("?")[0].slice(0, 30) || "";
  }
}

function displayModelName(name: string | null): string {
  if (!name) return "";
  const p = name.toLowerCase();
  if (p.includes("openai") || p.includes("chatgpt")) return "OpenAI";
  if (p.includes("gemini") || p.includes("google")) return "Gemini";
  if (p.includes("anthropic") || p.includes("claude")) return "Anthropic";
  return name;
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
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getHealthLabel(score: number | null): { label: string; color: string; bg: string } {
  if (score === null) return { label: "No data", color: "text-zinc-600", bg: "bg-zinc-200/80" };
  if (score >= 70) return { label: "Strong", color: "text-emerald-700", bg: "bg-emerald-100/90" };
  if (score >= 40) return { label: "Moderate", color: "text-amber-700", bg: "bg-amber-100/90" };
  return { label: "Weak", color: "text-rose-700", bg: "bg-rose-100/90" };
}

function getMomentumLabel(delta: number | null): { label: string; color: string; icon: "up" | "down" | "flat" } {
  if (delta === null) return { label: "New", color: "text-zinc-500", icon: "flat" };
  if (delta > 0) return { label: "Improving", color: "text-emerald-600", icon: "up" };
  if (delta < 0) return { label: "Declining", color: "text-rose-600", icon: "down" };
  return { label: "Stable", color: "text-zinc-500", icon: "flat" };
}

// Generate an actionable signal for a client card
function getActionSignal(client: ClientWithStats): { text: string; color: string } | null {
  const delta = client.latestScore !== null && client.previousScore !== null
    ? client.latestScore - client.previousScore
    : null;

  // Score dropped significantly
  if (delta !== null && delta <= -5) {
    return { text: `Score dropped ${Math.abs(delta)} pts`, color: "text-rose-600" };
  }

  // Competitor ahead
  if (client.competitorRank !== null && client.competitorRank > 1) {
    return { text: `Ranked #${client.competitorRank} — competitor ahead`, color: "text-amber-600" };
  }

  // Low mention rate
  if (client.mentionRate !== null && client.mentionRate < 40) {
    return { text: "Low mention rate — visibility at risk", color: "text-amber-600" };
  }

  // Weak on a model
  if (client.worstModel && client.bestModel && client.worstModel !== client.bestModel) {
    return { text: `Weak on ${client.worstModel}`, color: "text-amber-600" };
  }

  // Gaining ground
  if (delta !== null && delta >= 5) {
    return { text: `Gained ${delta} pts — momentum building`, color: "text-emerald-600" };
  }

  return null;
}

// Mini sparkline component
function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;

  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 32;
  const width = 80;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-20">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Portfolio-level average score trend chart
function PortfolioTrendChart({ clients, embedded }: { clients: ClientWithStats[]; embedded?: boolean }) {
  // Collect all recent scores across clients (up to 5 time periods)
  const maxPeriods = 5;
  const avgByPeriod: number[] = [];

  for (let i = 0; i < maxPeriods; i++) {
    const scores = clients
      .filter(c => c.recentScores.length > i)
      .map(c => c.recentScores[i]);
    if (scores.length > 0) {
      avgByPeriod.push(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
    }
  }

  if (avgByPeriod.length < 2) return null;

  const max = Math.max(...avgByPeriod, 100);
  const min = Math.min(...avgByPeriod, 0);
  const range = max - min || 1;
  const chartH = 120;
  const chartW = 400;
  const padding = 8;
  const usableW = chartW - padding * 2;
  const usableH = chartH - padding * 2;

  const linePoints = avgByPeriod.map((val, i) => {
    const x = padding + (i / (avgByPeriod.length - 1)) * usableW;
    const y = padding + usableH - ((val - min) / range) * usableH;
    return { x, y, val };
  });

  const polyline = linePoints.map(p => `${p.x},${p.y}`).join(" ");

  // Gradient fill area
  const areaPath = `M${linePoints[0].x},${chartH - padding} L${polyline.replace(/,/g, " L")} L${linePoints[linePoints.length - 1].x},${chartH - padding} Z`;

  const chartSvg = (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className={embedded ? "w-full h-24" : "w-full h-28"}>
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#trendFill)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {linePoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#18181b" stroke="#10b981" strokeWidth="2" />
          <text
            x={p.x}
            y={p.y - 10}
            textAnchor="middle"
            fill="#52525b"
            fontSize="11"
            fontWeight="600"
          >
            {p.val}
          </text>
        </g>
      ))}
    </svg>
  );

  if (embedded) {
    return (
      <div className="mt-2 min-h-[100px]">
        {chartSvg}
      </div>
    );
  }

  return (
    <div className="dashboard-card h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="metric-label">Portfolio Visibility Trend</div>
        <div className="text-xs text-zinc-500">Last {avgByPeriod.length} snapshots</div>
      </div>
      <div className="mt-4 flex-1 min-h-[120px]">
        {chartSvg}
      </div>
    </div>
  );
}

// Action-driving insight — Moderate/Weak clients need attention
function getActionableInsight(clients: ClientWithStats[]): { text: string; clientId?: string } {
  const needsAttention = clients.filter(c => {
    if (c.latestScore === null) return false;
    return c.latestScore < 70; // Moderate (<70) or Weak (<40)
  });
  if (needsAttention.length === 0) {
    return { text: "All clients healthy", clientId: undefined };
  }
  const first = needsAttention[0];
  const severity = first.latestScore! < 40 ? "weak" : "moderate";
  const modelPart = first.worstModel ? ` on ${displayModelName(first.worstModel)}` : "";
  const count = needsAttention.length;
  const text = count === 1
    ? `1 client needs attention — ${first.name} is ${severity}${modelPart}`
    : `${count} clients need attention — ${first.name} is ${severity}${modelPart}`;
  return {
    text,
    clientId: first.id,
  };
}

// KPI metric cell — in-strip unit (Semrush/SimilarWeb single-bar style)
function KpiCell({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex min-w-[80px] flex-col px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{label}</span>
      <span className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900">{value}</span>
      {sub && <span className="mt-0.5 text-[10px] text-zinc-500">{sub}</span>}
    </div>
  );
}

// AI Visibility Overview — SimilarWeb/Semrush single-bar strip
function VisibilityOverview({ stats, clients }: { stats: PortfolioStats; clients: ClientWithStats[] }) {
  const actionable = getActionableInsight(clients);

  return (
    <div className="space-y-4">
      {/* Single-bar KPI strip — hero score visually dominant */}
      <div className="flex flex-wrap items-stretch divide-x divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        {/* Hero score — left anchor, premium prominence */}
        <div className="flex flex-col bg-zinc-50/50 px-6 py-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">AI Visibility Score</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-zinc-900">{stats.avgScore}</span>
            <span className="text-base font-medium text-zinc-500">/ 100</span>
          </div>
          {stats.avgScoreDelta !== null && stats.avgScoreDelta !== 0 && (
            <span className={cn("mt-1 text-[11px] font-semibold tabular-nums", stats.avgScoreDelta > 0 ? "text-emerald-600" : "text-rose-600")}>
              {stats.avgScoreDelta > 0 ? "+" : ""}{stats.avgScoreDelta} vs last
            </span>
          )}
        </div>
        <KpiCell label="Strong" value={stats.strongClients} />
        <KpiCell label="Moderate" value={stats.moderateClients} />
        <KpiCell label="Weak" value={stats.weakClients} />
        <KpiCell label="Snapshots" value={stats.snapshotsThisMonth} sub="This month" />
        <KpiCell
          label="Alerts"
          value={stats.clientsWithAlerts}
          sub={stats.clientsWithAlerts > 0 ? "Need attention" : "All healthy"}
        />
      </div>

      {/* Action-driving insight — calm system status line */}
      <div className="flex items-center gap-2 px-1 text-[13px] font-medium text-zinc-600">
        {actionable.text === "All clients healthy" ? (
          <>
            <span className="text-emerald-600" aria-hidden>✓</span>
            <span>{actionable.text}</span>
          </>
        ) : (
          <>
            <span className="text-amber-600" aria-hidden>⚠</span>
            <span>
              {actionable.clientId ? (
                <Link href={`/app/clients/${actionable.clientId}`} className="text-zinc-800 hover:text-zinc-900 no-underline hover:no-underline">
                  {actionable.text}
                </Link>
              ) : (
                actionable.text
              )}
            </span>
          </>
        )}
      </div>

      {/* Trend — collapsible (Semrush-style) */}
      <details className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50">
          <span>Portfolio visibility trend</span>
          <span className="text-[11px] font-medium text-zinc-500">Last 5 snapshots</span>
          <svg className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="border-t border-zinc-200 p-4">
          <PortfolioTrendChart clients={clients} embedded />
        </div>
      </details>
    </div>
  );
}

// Status indicator
function StatusDot({ score, status }: { score: number | null; status: string }) {
  if (status === "running") {
    return (
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
      </span>
    );
  }
  if (score === null) return <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />;
  if (score >= 70) return <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />;
  if (score >= 40) return <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />;
  return <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />;
}

// Dense client card (upgraded with narrative)
function DenseClientCard({ client }: { client: ClientWithStats }) {
  const delta = client.latestScore !== null && client.previousScore !== null
    ? client.latestScore - client.previousScore
    : null;

  const health = getHealthLabel(client.latestScore);
  const momentum = getMomentumLabel(delta);
  const signal = getActionSignal(client);

  const sparklineColor = client.latestScore !== null && client.latestScore >= 70
    ? "#10b981"
    : client.latestScore !== null && client.latestScore >= 40
      ? "#f59e0b"
      : "#f43f5e";

  const hasNoData = client.status === "none" && client.latestScore === null;

  return (
    <Link
      href={`/app/clients/${client.id}`}
      className={cn(
        "group flex min-h-[260px] flex-col transition-all hover:shadow-md",
        hasNoData
          ? "rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-6"
          : "dashboard-card hover:border-zinc-300"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
            {getInitials(client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <StatusDot score={client.latestScore} status={client.status} />
              <h3 className="min-w-0 flex-1 truncate font-semibold text-zinc-900">{client.name}</h3>
              {client.hasAlert && (
                <span className="shrink-0 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-600">
                  Needs attention
                </span>
              )}
            </div>
            {client.website && (
              <p className="text-xs text-zinc-500 truncate" title={client.website}>
                {displayUrl(client.website)}
              </p>
            )}
          </div>
        </div>
          <svg
            className="h-4 w-4 shrink-0 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Score + Sparkline — or empty state */}
      <div className={cn("mt-4 flex items-center justify-between gap-4", !hasNoData && "border-b border-zinc-200 pb-4")}>
        <div className="min-w-0 flex-1">
          {client.status === "running" ? (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-amber-600 font-medium">Analyzing...</span>
            </div>
          ) : hasNoData ? (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-zinc-500">No snapshots yet</span>
              <span className="text-xs text-zinc-400">Run first snapshot to measure AI visibility</span>
            </div>
          ) : client.latestScore !== null ? (
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold tabular-nums text-zinc-900">
                {client.latestScore}
              </span>
              {delta !== null && delta !== 0 && (
                <span className={cn(
                  "flex items-center gap-0.5 text-sm font-semibold",
                  delta > 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  <svg
                    className={cn("h-3 w-3", delta < 0 && "rotate-180")}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(delta)}
                </span>
              )}
            </div>
          ) : null}
          {client.lastSnapshotAt && client.status !== "running" && (
            <p className="mt-1 text-xs text-zinc-500">
              Updated {timeAgo(client.lastSnapshotAt)}
            </p>
          )}
        </div>
        {client.recentScores.length >= 2 && (
          <div className="shrink-0">
            <Sparkline data={client.recentScores} color={sparklineColor} />
          </div>
        )}
      </div>

      {/* Narrative row: Visibility / Momentum / Best / Worst */}
      {client.latestScore !== null && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-zinc-500">Visibility</span>
            <div className={cn("font-semibold", health.color)}>{health.label}</div>
          </div>
          <div>
            <span className="text-zinc-500">Momentum</span>
            <div className={cn("font-semibold flex items-center gap-1", momentum.color)}>
              {momentum.icon === "up" && (
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {momentum.icon === "down" && (
                <svg className="h-3 w-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {momentum.label}
            </div>
          </div>
          <div>
            <span className="text-zinc-500">Best model</span>
            <div className="font-semibold text-emerald-600 truncate">{client.bestModel ? displayModelName(client.bestModel) : "—"}</div>
          </div>
          <div>
            <span className="text-zinc-500">Weakest model</span>
            <div className="font-semibold text-zinc-600 truncate">
              {client.worstModel && client.bestModel && client.worstModel.toLowerCase() !== client.bestModel.toLowerCase()
                ? displayModelName(client.worstModel)
                : "—"}
            </div>
          </div>
        </div>
      )}

      {/* Action signal — subtle pill */}
      {signal && client.latestScore !== null && (
        <div className={cn(
          "mt-3 rounded-md border px-2.5 py-1.5 text-xs",
          signal.color.includes("rose") ? "border-rose-200/60 bg-rose-50/70 text-rose-700" :
          signal.color.includes("amber") ? "border-amber-200/60 bg-amber-50/70 text-amber-700" :
          "border-emerald-200/60 bg-emerald-50/70 text-emerald-700"
        )}>
          {signal.text}
        </div>
      )}

      {/* Empty state CTA when no snapshots */}
      {hasNoData && (
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Run first snapshot
          </span>
        </div>
      )}

      {/* Metrics bar — only when we have real data */}
      {client.latestScore !== null && (client.mentionRate != null || client.topPositionRate != null || client.citationRate != null || (client.competitorRank != null && client.competitorCount > 0)) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 border-t border-zinc-200 pt-3 text-xs text-zinc-500">
          {client.mentionRate != null && <span>Mention {client.mentionRate}%</span>}
          {client.mentionRate != null && (client.topPositionRate != null || client.citationRate != null) && <span>·</span>}
          {client.topPositionRate != null && <span>Top pos {client.topPositionRate}%</span>}
          {client.topPositionRate != null && client.citationRate != null && <span>·</span>}
          {client.citationRate != null && <span>Cited {client.citationRate}%</span>}
          {client.competitorRank != null && client.competitorCount > 0 && (
            <>
              <span>·</span>
              <span className={cn(
                "font-medium",
                client.competitorRank === 1 ? "text-emerald-600" : "text-amber-600"
              )}>
                #{client.competitorRank} of {client.competitorCount + 1}
              </span>
            </>
          )}
        </div>
      )}
    </Link>
  );
}

// Client table — SimilarWeb/Semrush data-dense row layout
function ClientTable({ clients }: { clients: ClientWithStats[] }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/80">
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Client</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Score</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Δ</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Health</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Weakest</th>
            <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Updated</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const delta = client.latestScore !== null && client.previousScore !== null
              ? client.latestScore - client.previousScore
              : null;
            const health = getHealthLabel(client.latestScore);
            const hasNoData = client.status === "none" && client.latestScore === null;
            return (
              <tr
                key={client.id}
                onClick={() => router.push(`/app/clients/${client.id}`)}
                className="group cursor-pointer border-b border-zinc-100 last:border-b-0 transition-colors hover:bg-zinc-50/80"
              >
                <td className="py-2.5 pl-4 pr-2">
                  <div className="flex items-center gap-2">
                    <StatusDot score={client.latestScore} status={client.status} />
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-zinc-900">{client.name}</span>
                      {hasNoData ? (
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-medium text-zinc-500">No snapshots yet</span>
                          <Link
                            href={`/app/clients/${client.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-semibold text-zinc-700 hover:text-zinc-900 no-underline"
                          >
                            Run first snapshot →
                          </Link>
                        </div>
                      ) : client.website ? (
                        <div className="text-[11px] font-medium text-zinc-500">{displayUrl(client.website)}</div>
                      ) : null}
                    </div>
                    {client.hasAlert && (
                      <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold text-rose-600 bg-rose-100/90">
                        Alert
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  {hasNoData ? (
                    <span className="text-zinc-400">—</span>
                  ) : client.latestScore !== null ? (
                    <span className="font-bold tabular-nums text-zinc-900">{client.latestScore}</span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {delta !== null && delta !== 0 ? (
                    <span className={cn("font-semibold tabular-nums", delta > 0 ? "text-emerald-600" : "text-rose-600")}>
                      {delta > 0 ? "+" : ""}{delta}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", health.color, health.bg)}>
                    {health.label}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[12px] font-medium text-zinc-600">
                  {client.worstModel ? displayModelName(client.worstModel) : "—"}
                </td>
                <td className="px-4 py-2.5 text-[11px] text-zinc-500">
                  {client.lastSnapshotAt ? timeAgo(client.lastSnapshotAt) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Empty state — intentional design with dashed border + CTA
function EmptyState() {
  return (
    <div className="empty-state-card mx-auto max-w-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100">
        <svg className="h-6 w-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-900">Add your first client</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Track how AI models like ChatGPT, Claude, and Gemini talk about your clients.
      </p>
      <Link
        href="/app/clients/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add client
      </Link>
    </div>
  );
}

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score" | "updated">("updated");
  const [filterHealth, setFilterHealth] = useState<"all" | "strong" | "moderate" | "weak">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setError(null);
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;

        // Get clients
        const clientsRes = await supabase
          .from("clients")
          .select("id, name, website, industry, created_at")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        if (clientsRes.error) throw clientsRes.error;
        const clientList = clientsRes.data ?? [];

        if (clientList.length === 0) {
          if (!cancelled) {
            setClients([]);
            setPortfolioStats({
              totalClients: 0, avgScore: 0, avgScoreDelta: null,
              snapshotsThisMonth: 0, clientsWithAlerts: 0,
              strongClients: 0, moderateClients: 0, weakClients: 0,
              improvingClients: 0, decliningClients: 0,
            });
            setLoading(false);
          }
          return;
        }

        // Get snapshots for all clients
        const clientIds = clientList.map(c => c.id);
        const snapshotsRes = await supabase
          .from("snapshots")
          .select("id, client_id, status, vrtl_score, score_by_provider, created_at, completed_at")
          .in("client_id", clientIds)
          .order("created_at", { ascending: false });

        const snapshots = snapshotsRes.data ?? [];

        // Get competitors count for each client
        const competitorsRes = await supabase
          .from("competitors")
          .select("client_id, id")
          .in("client_id", clientIds);

        const competitorsByClient = new Map<string, number>();
        (competitorsRes.data ?? []).forEach(c => {
          competitorsByClient.set(c.client_id, (competitorsByClient.get(c.client_id) || 0) + 1);
        });

        // Get snapshot details for metrics
        const latestSnapshotIds = clientList.map(c => {
          const completed = snapshots.filter(s => {
            const st = String(s.status ?? "").toLowerCase();
            return s.client_id === c.id && (st.includes("complete") || st.includes("success"));
          });
          return completed[0]?.id;
        }).filter(Boolean);

        const detailsMap = new Map<string, SnapshotDetailResponse>();
        if (latestSnapshotIds.length > 0) {
          const detailsPromises = latestSnapshotIds.map(async (snapshotId) => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return null;
            try {
              const res = await fetch(`/api/snapshots/detail?snapshotId=${snapshotId}`, {
                headers: { Authorization: `Bearer ${session.access_token}` },
              });
              if (!res.ok) return null;
              const data: SnapshotDetailResponse = await res.json();
              return { snapshotId, data };
            } catch {
              return null;
            }
          });
          const detailsResults = await Promise.all(detailsPromises);
          detailsResults.forEach(result => {
            if (result && result.data) {
              detailsMap.set(result.snapshotId, result.data);
            }
          });
        }

        // Build client stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const clientsWithStats: ClientWithStats[] = clientList.map(client => {
          const clientSnapshots = snapshots.filter(s => s.client_id === client.id);
          const completedSnapshots = clientSnapshots.filter(s => {
            const st = String(s.status ?? "").toLowerCase();
            return st.includes("complete") || st.includes("success");
          });
          const runningSnapshot = clientSnapshots.find(s => {
            const st = String(s.status ?? "").toLowerCase();
            return st.includes("running") || st.includes("pending") || st.includes("queued");
          });

          const scores = completedSnapshots
            .map(s => s.vrtl_score)
            .filter((s): s is number => typeof s === "number");

          const latestScore = scores.length > 0 ? scores[0] : null;
          const previousScore = scores.length > 1 ? scores[1] : null;
          const lastSnapshotAt = completedSnapshots[0]?.completed_at || completedSnapshots[0]?.created_at || null;
          const recentScores = scores.slice(0, 5).reverse();

          // Detail stats
          const latestSnapshotId = completedSnapshots[0]?.id;
          const detail = latestSnapshotId ? detailsMap.get(latestSnapshotId) : null;

          let mentionRate = null;
          let topPositionRate = null;
          let citationRate = null;
          let competitorRank = null;

          if (detail) {
            const total = detail.summary.responses_count || 1;
            mentionRate = Math.round((detail.summary.client_mentioned_count / total) * 100);
            citationRate = Math.round((detail.summary.sources_count / total) * 100);
            const topPositionCount = detail.responses?.filter(r => r.client_mentioned && r.client_position === "top").length || 0;
            topPositionRate = Math.round((topPositionCount / total) * 100);
            const clientMentions = detail.summary.client_mentioned_count;
            const competitors = detail.summary.top_competitors || [];
            const allEntities = [
              { name: client.name, mentions: clientMentions, isClient: true },
              ...competitors.map(c => ({ name: c.name, mentions: c.count, isClient: false }))
            ].sort((a, b) => b.mentions - a.mentions);
            competitorRank = allEntities.findIndex(e => e.isClient) + 1;
          }

          // Best/worst models
          let bestModel = null;
          let worstModel = null;
          if (completedSnapshots[0]?.score_by_provider) {
            const providers = Object.entries(completedSnapshots[0].score_by_provider as Record<string, number>);
            if (providers.length > 0) {
              const sorted = providers.sort((a, b) => b[1] - a[1]);
              bestModel = sorted[0][0];
              worstModel = sorted[sorted.length - 1][0];
            }
          }

          const hasAlert = (previousScore !== null && latestScore !== null && (previousScore - latestScore) >= 5) ||
                           (competitorRank !== null && competitorRank > 1);

          const competitorCount = competitorsByClient.get(client.id) || 0;

          return {
            ...client, latestScore, previousScore, lastSnapshotAt,
            snapshotCount: completedSnapshots.length, recentScores,
            status: runningSnapshot ? "running" : completedSnapshots.length > 0 ? "complete" : "none" as const,
            mentionRate, topPositionRate, citationRate, competitorRank,
            competitorCount, bestModel, worstModel, hasAlert,
          };
        });

        // Portfolio stats
        const scoresForAvg = clientsWithStats
          .map(c => c.latestScore)
          .filter((s): s is number => typeof s === "number");

        const avgScore = scoresForAvg.length > 0
          ? Math.round(scoresForAvg.reduce((sum, s) => sum + s, 0) / scoresForAvg.length)
          : 0;

        // Calculate avg score delta
        const deltas = clientsWithStats
          .filter(c => c.latestScore !== null && c.previousScore !== null)
          .map(c => c.latestScore! - c.previousScore!);
        const avgScoreDelta = deltas.length > 0
          ? Math.round(deltas.reduce((sum, d) => sum + d, 0) / deltas.length)
          : null;

        const snapshotsThisMonth = snapshots.filter(s => new Date(s.created_at) >= monthStart).length;
        const clientsWithAlerts = clientsWithStats.filter(c => c.hasAlert).length;
        const strongClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore >= 70).length;
        const moderateClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore >= 40 && c.latestScore < 70).length;
        const weakClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore < 40).length;
        const improvingClients = clientsWithStats.filter(c => c.latestScore !== null && c.previousScore !== null && c.latestScore > c.previousScore).length;
        const decliningClients = clientsWithStats.filter(c => c.latestScore !== null && c.previousScore !== null && c.latestScore < c.previousScore).length;

        if (!cancelled) {
          setClients(clientsWithStats);
          setPortfolioStats({
            totalClients: clientList.length, avgScore, avgScoreDelta,
            snapshotsThisMonth, clientsWithAlerts,
            strongClients, moderateClients, weakClients,
            improvingClients, decliningClients,
          });
        }
      } catch (e) {
        const err = e as { message?: string };
        if (!cancelled) setError(err?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [supabase]);

  // Filter and sort
  const filteredClients = useMemo(() => {
    let result = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (filterHealth !== "all") {
      result = result.filter(c => {
        if (filterHealth === "strong") return c.latestScore !== null && c.latestScore >= 70;
        if (filterHealth === "moderate") return c.latestScore !== null && c.latestScore >= 40 && c.latestScore < 70;
        if (filterHealth === "weak") return c.latestScore !== null && c.latestScore < 40;
        return true;
      });
    }

    if (sortBy === "score") {
      result.sort((a, b) => {
        if (a.latestScore === null && b.latestScore === null) return 0;
        if (a.latestScore === null) return 1;
        if (b.latestScore === null) return -1;
        return b.latestScore - a.latestScore;
      });
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => {
        if (!a.lastSnapshotAt && !b.lastSnapshotAt) return 0;
        if (!a.lastSnapshotAt) return 1;
        if (!b.lastSnapshotAt) return -1;
        return new Date(b.lastSnapshotAt).getTime() - new Date(a.lastSnapshotAt).getTime();
      });
    }

    return result;
  }, [clients, searchQuery, filterHealth, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
          <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-zinc-600">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-zinc-700 hover:text-zinc-900">
          Try again
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* AI Visibility Overview — SimilarWeb/Semrush single-strip */}
      <div className="space-y-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Overview</h2>
        {portfolioStats && <VisibilityOverview stats={portfolioStats} clients={clients} />}
      </div>

      {/* Clients section — SimilarWeb-style data table */}
      <div className="space-y-4 pt-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-widest text-zinc-500">Clients</h2>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-zinc-900">
            {filteredClients.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value as "all" | "strong" | "moderate" | "weak")}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
          >
            <option value="all">All health</option>
            <option value="strong">Strong</option>
            <option value="moderate">Moderate</option>
            <option value="weak">Weak</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "score" | "updated")}
            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none"
          >
            <option value="updated">Last updated</option>
            <option value="score">Score</option>
            <option value="name">Name</option>
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50/50 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "table" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors",
                viewMode === "cards" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Cards
            </button>
          </div>

          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-44 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <Link
            href="/app/clients/new"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/70 px-3.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100/80 hover:border-zinc-300 hover:text-zinc-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Add client</span>
          </Link>
        </div>
      </div>

      {/* Client cards grid */}
      {filteredClients.length === 0 && searchQuery ? (
        <div className="empty-state-card py-12">
          <p className="text-sm font-medium text-zinc-700">No clients match &quot;{searchQuery}&quot;</p>
          <button onClick={() => setSearchQuery("")} className="mt-3 text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Clear search
          </button>
        </div>
      ) : filteredClients.length === 0 && filterHealth !== "all" ? (
        <div className="empty-state-card py-12">
          <p className="text-sm font-medium text-zinc-700">No {filterHealth} clients found</p>
          <button onClick={() => setFilterHealth("all")} className="mt-3 text-sm font-medium text-zinc-600 hover:text-zinc-900">
            Clear filter
          </button>
        </div>
      ) : viewMode === "table" ? (
        <ClientTable clients={filteredClients} />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 [&>a]:flex">
          {filteredClients.map((client) => (
            <DenseClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
