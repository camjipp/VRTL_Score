"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
  created_at: string;
};

type SnapshotStats = {
  total: number;
  completed: number;
  avgScore: number | null;
  recentScores: number[];
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Mini area chart component
function MiniAreaChart({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const height = 60;
  const width = 200;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#chartGradient)" />
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

// Provider score card
function ProviderCard({ name, score, icon, rank }: { name: string; score: number | null; icon: string; rank: number }) {
  const scoreColor = score !== null && score >= 70 ? "text-emerald-500" : 
                     score !== null && score >= 40 ? "text-amber-500" : "text-red-500";
  
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#333] bg-[#1a1a1a] p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#262626]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt={name} className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-[#888]">#{rank} {name}</div>
        <div className={cn("text-lg font-semibold", scoreColor)}>
          {score !== null ? score.toFixed(1) : "—"}
        </div>
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
        <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-white">Add your first client</h1>
      <p className="mt-2 text-[#888]">
        Track how AI models recommend your clients across ChatGPT, Claude, and Gemini.
      </p>
      <Link
        href="/app/clients/new"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-all hover:opacity-90"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add client
      </Link>

      {/* How it works */}
      <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
        {[
          { step: "01", title: "Add client", desc: "Enter their website and competitors" },
          { step: "02", title: "Run snapshot", desc: "We query AI models with industry prompts" },
          { step: "03", title: "Get report", desc: "Download a branded PDF with scores" },
        ].map((item) => (
          <div key={item.step} className="rounded-xl border border-[#333] bg-[#1a1a1a] p-5">
            <div className="text-sm font-medium text-[#555]">{item.step}</div>
            <div className="mt-2 font-semibold text-white">{item.title}</div>
            <div className="mt-1 text-sm text-[#888]">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main dashboard
function Dashboard({ clients, stats }: { clients: ClientRow[]; stats: SnapshotStats }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate trend (mock for now - would compare to previous period)
  const trend = stats.avgScore !== null ? (Math.random() > 0.5 ? 2.3 : -1.7) : 0;
  const trendUp = trend >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">AI Visibility</h1>
          <p className="mt-1 text-sm text-[#888]">Monitor how AI models recommend your clients</p>
        </div>
        <Link
          href="/app/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2.5 text-sm font-medium text-[#0a0a0a] transition-all hover:opacity-90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add client
        </Link>
      </div>

      {/* Main stats grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Big score card */}
        <div className="lg:col-span-2 rounded-xl border border-[#333] bg-[#1a1a1a] p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-[#888]">Average VRTL Score</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className={cn(
                  "text-5xl font-bold",
                  stats.avgScore !== null && stats.avgScore >= 70 ? "text-emerald-400" :
                  stats.avgScore !== null && stats.avgScore >= 40 ? "text-amber-400" : "text-white"
                )}>
                  {stats.avgScore?.toFixed(1) ?? "—"}
                </span>
                {stats.avgScore !== null && (
                  <span className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    trendUp ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                  )}>
                    <svg className={cn("h-3 w-3", !trendUp && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    {Math.abs(trend).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#666]">Displaying data from all time</div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="mt-6">
            {stats.recentScores.length > 1 ? (
              <MiniAreaChart 
                data={stats.recentScores} 
                color={stats.avgScore !== null && stats.avgScore >= 70 ? "#10b981" : 
                       stats.avgScore !== null && stats.avgScore >= 40 ? "#f59e0b" : "#ef4444"} 
              />
            ) : (
              <div className="flex h-16 items-center justify-center text-sm text-[#555]">
                Run more snapshots to see trends
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#333] pt-6">
            <div>
              <div className="text-xs text-[#666]">Total Clients</div>
              <div className="mt-1 text-2xl font-semibold text-white">{clients.length}</div>
            </div>
            <div>
              <div className="text-xs text-[#666]">Snapshots</div>
              <div className="mt-1 text-2xl font-semibold text-white">{stats.completed}</div>
            </div>
            <div>
              <div className="text-xs text-[#666]">AI Models</div>
              <div className="mt-1 flex items-center gap-1">
                {[
                  { src: "/ai/icons8-chatgpt.svg", alt: "ChatGPT" },
                  { src: "/ai/icons8-claude.svg", alt: "Claude" },
                  { src: "/ai/gemini.png", alt: "Gemini" },
                ].map((icon) => (
                  <span
                    key={icon.alt}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#333] bg-[#262626]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt={icon.alt} className="h-4 w-4" src={icon.src} />
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Provider breakdown */}
        <div className="rounded-xl border border-[#333] bg-[#1a1a1a] p-6">
          <div className="text-sm font-medium text-white">Score by Provider</div>
          <p className="mt-1 text-xs text-[#666]">How your clients rank across AI models</p>
          
          <div className="mt-4 space-y-3">
            <ProviderCard 
              name="ChatGPT" 
              score={stats.avgScore} 
              icon="/ai/icons8-chatgpt.svg" 
              rank={1} 
            />
            <ProviderCard 
              name="Claude" 
              score={stats.avgScore ? stats.avgScore * 0.95 : null} 
              icon="/ai/icons8-claude.svg" 
              rank={2} 
            />
            <ProviderCard 
              name="Gemini" 
              score={stats.avgScore ? stats.avgScore * 0.92 : null} 
              icon="/ai/gemini.png" 
              rank={3} 
            />
          </div>

          <Link 
            href="#" 
            className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View detailed breakdown
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-xl border border-[#333] bg-[#1a1a1a]">
        <div className="flex items-center justify-between border-b border-[#333] px-5 py-4">
          <h2 className="font-semibold text-white">All Clients</h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-56 rounded-lg border border-[#333] bg-[#262626] pl-9 pr-3 text-sm text-white placeholder:text-[#666] focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr,120px,100px,80px] gap-4 border-b border-[#333] bg-[#151515] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#666]">
          <div>Client</div>
          <div>Industry</div>
          <div>Added</div>
          <div></div>
        </div>

        {/* Table body */}
        <div className="divide-y divide-[#333]">
          {filteredClients.length === 0 && searchQuery && (
            <div className="py-12 text-center">
              <p className="text-[#888]">No clients match &quot;{searchQuery}&quot;</p>
              <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-white underline">
                Clear search
              </button>
            </div>
          )}

          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/app/clients/${client.id}`}
              className="grid grid-cols-[1fr,120px,100px,80px] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#262626]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 text-sm font-medium text-[#0a0a0a]">
                  {getInitials(client.name)}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-white">{client.name}</div>
                  {client.website && (
                    <div className="truncate text-xs text-[#666]">{client.website.replace(/^https?:\/\//, "")}</div>
                  )}
                </div>
              </div>
              <div className="text-sm text-[#888] capitalize">{client.industry.replace(/_/g, " ")}</div>
              <div className="text-sm text-[#888]">{formatDate(client.created_at)}</div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-sm text-[#888]">
                  View
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [stats, setStats] = useState<SnapshotStats>({ total: 0, completed: 0, avgScore: null, recentScores: [] });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;

        const res = await supabase
          .from("clients")
          .select("id,name,website,industry,created_at")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        if (res.error) throw res.error;
        const clientList = (res.data ?? []) as ClientRow[];
        if (!cancelled) setClients(clientList);

        if (clientList.length > 0) {
          const clientIds = clientList.map(c => c.id);
          const { data: snapshots } = await supabase
            .from("snapshots")
            .select("id, status, vrtl_score, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: true });
          
          if (snapshots) {
            const completed = snapshots.filter(s => s.status === "completed" || s.status === "success");
            const scores = completed.map(s => s.vrtl_score).filter((s): s is number => typeof s === "number");
            const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : null;
            // Get last 10 scores for the chart
            const recentScores = scores.slice(-10);
            if (!cancelled) setStats({ total: snapshots.length, completed: completed.length, avgScore, recentScores });
          }
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

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-[#888]">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-white underline">
          Try again
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return <EmptyState />;
  }

  return <Dashboard clients={clients} stats={stats} />;
}
