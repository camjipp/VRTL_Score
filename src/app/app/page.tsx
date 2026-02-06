"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  // New detailed stats
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
  snapshotsThisMonth: number;
  clientsWithAlerts: number;
  strongClients: number;
  moderateClients: number;
  weakClients: number;
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
  if (score === null) return { label: "No data", color: "text-text-3", bg: "bg-surface-2" };
  if (score >= 70) return { label: "Strong", color: "text-emerald-600", bg: "bg-emerald-50" };
  if (score >= 40) return { label: "Moderate", color: "text-amber-600", bg: "bg-amber-50" };
  return { label: "Weak", color: "text-red-600", bg: "bg-red-50" };
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

// Portfolio Summary
function PortfolioSummary({ stats }: { stats: PortfolioStats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-3">Total Clients</div>
        <div className="mt-2 text-3xl font-bold text-text">{stats.totalClients}</div>
        <div className="mt-2 flex gap-2 text-xs">
          <span className="text-emerald-600">{stats.strongClients} strong</span>
          <span className="text-text-3">·</span>
          <span className="text-amber-600">{stats.moderateClients} moderate</span>
          <span className="text-text-3">·</span>
          <span className="text-red-600">{stats.weakClients} weak</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-3">Avg AI Score</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-text">{stats.avgScore}</span>
          <span className="text-sm text-text-3">/ 100</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-surface-2">
          <div 
            className={cn(
              "h-1.5 rounded-full",
              stats.avgScore >= 70 ? "bg-emerald-500" : stats.avgScore >= 40 ? "bg-amber-500" : "bg-red-500"
            )}
            style={{ width: `${stats.avgScore}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-3">Snapshots This Month</div>
        <div className="mt-2 text-3xl font-bold text-text">{stats.snapshotsThisMonth}</div>
        <div className="mt-2 text-xs text-text-2">Across all clients</div>
      </div>

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-text-3">Alerts</div>
        <div className="mt-2 text-3xl font-bold text-text">{stats.clientsWithAlerts}</div>
        <div className="mt-2 text-xs text-text-2">
          {stats.clientsWithAlerts > 0 ? "Clients need attention" : "All clients healthy"}
        </div>
      </div>
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
  
  if (score === null) {
    return <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />;
  }
  
  if (score >= 70) {
    return <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />;
  }
  
  if (score >= 40) {
    return <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />;
  }
  
  return <span className="h-2.5 w-2.5 rounded-full bg-red-500" />;
}

// Dense client card
function DenseClientCard({ client }: { client: ClientWithStats }) {
  const delta = client.latestScore !== null && client.previousScore !== null 
    ? client.latestScore - client.previousScore 
    : null;
  
  const health = getHealthLabel(client.latestScore);
  
  const sparklineColor = client.latestScore !== null && client.latestScore >= 70 
    ? "#10b981" 
    : client.latestScore !== null && client.latestScore >= 40 
      ? "#f59e0b" 
      : "#ef4444";

  return (
    <Link
      href={`/app/clients/${client.id}`}
      className="group rounded-xl border border-border bg-white p-5 transition-all hover:border-text/20 hover:shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-text text-sm font-semibold text-white">
            {getInitials(client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <StatusDot score={client.latestScore} status={client.status} />
              <h3 className="font-semibold text-text truncate">{client.name}</h3>
              {client.hasAlert && (
                <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                  ALERT
                </span>
              )}
            </div>
            {client.website && (
              <p className="text-xs text-text-3 truncate">
                {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </p>
            )}
          </div>
        </div>
        <svg 
          className="h-4 w-4 shrink-0 text-text-3 opacity-0 transition-opacity group-hover:opacity-100" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Main Score + Health */}
      <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
        <div>
          {client.status === "running" ? (
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-amber-600 font-medium">Analyzing...</span>
            </div>
          ) : client.latestScore !== null ? (
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold tabular-nums text-text">
                {client.latestScore}
              </span>
              {delta !== null && delta !== 0 && (
                <span className={cn(
                  "flex items-center gap-0.5 text-sm font-semibold",
                  delta > 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  <svg 
                    className={cn("h-3 w-3", delta < 0 && "rotate-180")} 
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
              <span className={cn("text-xs font-semibold rounded px-2 py-1", health.bg, health.color)}>
                {health.label}
              </span>
            </div>
          ) : (
            <span className="text-sm text-text-3">No snapshots yet</span>
          )}
          
          {client.lastSnapshotAt && client.status !== "running" && (
            <p className="mt-1 text-xs text-text-3">
              Updated {timeAgo(client.lastSnapshotAt)}
            </p>
          )}
        </div>

        {/* Sparkline */}
        {client.recentScores.length >= 2 && (
          <Sparkline data={client.recentScores} color={sparklineColor} />
        )}
      </div>

      {/* Key Metrics Grid */}
      {client.latestScore !== null && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-text-3">Mention</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-text">{client.mentionRate ?? "—"}%</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-surface-2">
              <div 
                className={cn(
                  "h-1 rounded-full",
                  (client.mentionRate ?? 0) >= 70 ? "bg-emerald-500" : (client.mentionRate ?? 0) >= 40 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${client.mentionRate ?? 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-text-3">Top Pos</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-text">{client.topPositionRate ?? "—"}%</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-surface-2">
              <div 
                className={cn(
                  "h-1 rounded-full",
                  (client.topPositionRate ?? 0) >= 50 ? "bg-emerald-500" : (client.topPositionRate ?? 0) >= 25 ? "bg-amber-500" : "bg-red-500"
                )}
                style={{ width: `${client.topPositionRate ?? 0}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-text-3">Citations</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-bold text-text">{client.citationRate ?? "—"}%</span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-surface-2">
              <div 
                className={cn(
                  "h-1 rounded-full",
                  (client.citationRate ?? 0) >= 30 ? "bg-emerald-500" : (client.citationRate ?? 0) >= 15 ? "bg-amber-500" : "bg-gray-400"
                )}
                style={{ width: `${client.citationRate ?? 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer: Model Performance + Competitive */}
      {client.latestScore !== null && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
          <div className="flex items-center gap-2">
            {client.bestModel && (
              <span className="text-text-2">
                Best: <span className="font-medium text-emerald-600">{client.bestModel}</span>
              </span>
            )}
            {client.worstModel && client.bestModel && <span className="text-text-3">·</span>}
            {client.worstModel && (
              <span className="text-text-2">
                Worst: <span className="font-medium text-red-600">{client.worstModel}</span>
              </span>
            )}
          </div>
          {client.competitorRank !== null && client.competitorCount > 0 && (
            <span className={cn(
              "font-medium",
              client.competitorRank === 1 ? "text-emerald-600" : "text-amber-600"
            )}>
              #{client.competitorRank} of {client.competitorCount + 1}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-surface-2 border border-border">
        <svg className="h-7 w-7 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <h1 className="mt-5 text-xl font-semibold text-text">Add your first client</h1>
      <p className="mt-2 text-sm text-text-2">
        Track how AI models like ChatGPT, Claude, and Gemini talk about your clients.
      </p>
      <Link
        href="/app/clients/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-text px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text/90"
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
              totalClients: 0,
              avgScore: 0,
              snapshotsThisMonth: 0,
              clientsWithAlerts: 0,
              strongClients: 0,
              moderateClients: 0,
              weakClients: 0,
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

        // Get snapshot details for metrics (latest completed snapshot per client)
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

        // Calculate this month start
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Build client stats
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
          
          // Get last 5 scores for sparkline (reverse so oldest first)
          const recentScores = scores.slice(0, 5).reverse();

          // Get detail stats for latest snapshot
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
            
            // Calculate competitive rank
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

          // Check for alerts (score drop > 5 points, or competitor ahead)
          const hasAlert = (previousScore !== null && latestScore !== null && (previousScore - latestScore) >= 5) ||
                           (competitorRank !== null && competitorRank > 1);

          const competitorCount = competitorsByClient.get(client.id) || 0;

          return {
            ...client,
            latestScore,
            previousScore,
            lastSnapshotAt,
            snapshotCount: completedSnapshots.length,
            recentScores,
            status: runningSnapshot ? "running" : completedSnapshots.length > 0 ? "complete" : "none",
            mentionRate,
            topPositionRate,
            citationRate,
            competitorRank,
            competitorCount,
            bestModel,
            worstModel,
            hasAlert,
          };
        });

        // Calculate portfolio stats
        const scoresForAvg = clientsWithStats
          .map(c => c.latestScore)
          .filter((s): s is number => typeof s === "number");
        
        const avgScore = scoresForAvg.length > 0 
          ? Math.round(scoresForAvg.reduce((sum, s) => sum + s, 0) / scoresForAvg.length)
          : 0;

        const snapshotsThisMonth = snapshots.filter(s => {
          const created = new Date(s.created_at);
          return created >= monthStart;
        }).length;

        const clientsWithAlerts = clientsWithStats.filter(c => c.hasAlert).length;
        const strongClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore >= 70).length;
        const moderateClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore >= 40 && c.latestScore < 70).length;
        const weakClients = clientsWithStats.filter(c => c.latestScore !== null && c.latestScore < 40).length;

        if (!cancelled) {
          setClients(clientsWithStats);
          setPortfolioStats({
            totalClients: clientList.length,
            avgScore,
            snapshotsThisMonth,
            clientsWithAlerts,
            strongClients,
            moderateClients,
            weakClients,
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
  let filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (filterHealth !== "all") {
    filteredClients = filteredClients.filter(c => {
      if (filterHealth === "strong") return c.latestScore !== null && c.latestScore >= 70;
      if (filterHealth === "moderate") return c.latestScore !== null && c.latestScore >= 40 && c.latestScore < 70;
      if (filterHealth === "weak") return c.latestScore !== null && c.latestScore < 40;
      return true;
    });
  }

  // Sort
  if (sortBy === "score") {
    filteredClients.sort((a, b) => {
      if (a.latestScore === null && b.latestScore === null) return 0;
      if (a.latestScore === null) return 1;
      if (b.latestScore === null) return -1;
      return b.latestScore - a.latestScore;
    });
  } else if (sortBy === "name") {
    filteredClients.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "updated") {
    filteredClients.sort((a, b) => {
      if (!a.lastSnapshotAt && !b.lastSnapshotAt) return 0;
      if (!a.lastSnapshotAt) return 1;
      if (!b.lastSnapshotAt) return -1;
      return new Date(b.lastSnapshotAt).getTime() - new Date(a.lastSnapshotAt).getTime();
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-text" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-text underline">
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
      {/* Portfolio Summary */}
      {portfolioStats && <PortfolioSummary stats={portfolioStats} />}

      {/* Header with filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Clients</h1>
          <p className="mt-1 text-sm text-text-2">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter by health */}
          <select
            value={filterHealth}
            onChange={(e) => setFilterHealth(e.target.value as "all" | "strong" | "moderate" | "weak")}
            className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-text focus:outline-none"
          >
            <option value="all">All health</option>
            <option value="strong">Strong</option>
            <option value="moderate">Moderate</option>
            <option value="weak">Weak</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "score" | "updated")}
            className="h-9 rounded-lg border border-border bg-white px-3 text-sm text-text focus:border-text focus:outline-none"
          >
            <option value="updated">Last updated</option>
            <option value="score">Score</option>
            <option value="name">Name</option>
          </select>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-44 rounded-lg border border-border bg-white pl-9 pr-3 text-sm text-text placeholder:text-text-3 focus:border-text focus:outline-none"
            />
          </div>
          {/* Add client */}
          <Link
            href="/app/clients/new"
            className="inline-flex items-center gap-2 rounded-lg bg-text px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text/90"
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
        <div className="py-12 text-center">
          <p className="text-text-2">No clients match &quot;{searchQuery}&quot;</p>
          <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-text underline">
            Clear search
          </button>
        </div>
      ) : filteredClients.length === 0 && filterHealth !== "all" ? (
        <div className="py-12 text-center">
          <p className="text-text-2">No {filterHealth} clients found</p>
          <button onClick={() => setFilterHealth("all")} className="mt-2 text-sm text-text underline">
            Clear filter
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <DenseClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
