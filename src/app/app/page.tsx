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

// Mini sparkline component
function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 24;
  const width = 60;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-6 w-15">
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

// Client card
function ClientCard({ client }: { client: ClientWithStats }) {
  const delta = client.latestScore !== null && client.previousScore !== null 
    ? client.latestScore - client.previousScore 
    : null;
  
  const scoreColor = client.latestScore !== null && client.latestScore >= 70 
    ? "text-emerald-600" 
    : client.latestScore !== null && client.latestScore >= 40 
      ? "text-amber-600" 
      : "text-text";

  const sparklineColor = client.latestScore !== null && client.latestScore >= 70 
    ? "#10b981" 
    : client.latestScore !== null && client.latestScore >= 40 
      ? "#f59e0b" 
      : "#6b7280";

  return (
    <Link
      href={`/app/clients/${client.id}`}
      className="group rounded-xl border border-border bg-white p-5 transition-all hover:border-text/20 hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-text text-sm font-semibold text-white">
            {getInitials(client.name)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusDot score={client.latestScore} status={client.status} />
              <h3 className="font-semibold text-text truncate">{client.name}</h3>
            </div>
            {client.website && (
              <p className="text-xs text-text-3 truncate max-w-[180px]">
                {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </p>
            )}
          </div>
        </div>
        <svg 
          className="h-4 w-4 text-text-3 opacity-0 transition-opacity group-hover:opacity-100" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-end justify-between">
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
            <div className="flex items-baseline gap-2">
              <span className={cn("text-3xl font-bold tabular-nums", scoreColor)}>
                {client.latestScore}
              </span>
              {delta !== null && delta !== 0 && (
                <span className={cn(
                  "flex items-center gap-0.5 text-sm font-medium",
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
            </div>
          ) : (
            <span className="text-sm text-text-3">No snapshots yet</span>
          )}
          
          {client.lastSnapshotAt && client.status !== "running" && (
            <p className="mt-1 text-xs text-text-3">
              {timeAgo(client.lastSnapshotAt)}
            </p>
          )}
        </div>

        {/* Sparkline */}
        {client.recentScores.length >= 2 && (
          <Sparkline data={client.recentScores} color={sparklineColor} />
        )}
      </div>
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
  const [searchQuery, setSearchQuery] = useState("");
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
            setLoading(false);
          }
          return;
        }

        // Get snapshots for all clients
        const clientIds = clientList.map(c => c.id);
        const snapshotsRes = await supabase
          .from("snapshots")
          .select("id, client_id, status, vrtl_score, created_at, completed_at")
          .in("client_id", clientIds)
          .order("created_at", { ascending: false });

        const snapshots = snapshotsRes.data ?? [];

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

          return {
            ...client,
            latestScore,
            previousScore,
            lastSnapshotAt,
            snapshotCount: completedSnapshots.length,
            recentScores,
            status: runningSnapshot ? "running" : completedSnapshots.length > 0 ? "complete" : "none",
          };
        });

        if (!cancelled) {
          setClients(clientsWithStats);
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

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Clients</h1>
          <p className="mt-1 text-sm text-text-2">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-3">
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </div>
  );
}
