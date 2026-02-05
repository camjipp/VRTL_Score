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
  providerAverages: Array<{ provider: string; avg: number; count: number }>;
  lastScore: number | null;
  prevScore: number | null;
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
  const scoreColor = score !== null && score >= 70 ? "text-emerald-600" : 
                     score !== null && score >= 40 ? "text-amber-600" : "text-red-600";
  
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={icon} alt={name} className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-text-3">#{rank} {name}</div>
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
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2 border border-border">
        <svg className="h-8 w-8 text-text-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-text">Add your first client</h1>
      <p className="mt-2 text-text-2">
        Track how AI models recommend your clients across ChatGPT, Claude, and Gemini.
      </p>
      <Link
        href="/app/clients/new"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-text px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-text/90"
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
          <div key={item.step} className="rounded-xl border border-border bg-white p-5">
            <div className="text-sm font-medium text-text-3">{item.step}</div>
            <div className="mt-2 font-semibold text-text">{item.title}</div>
            <div className="mt-1 text-sm text-text-2">{item.desc}</div>
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

  const trend = stats.lastScore !== null && stats.prevScore !== null && stats.prevScore > 0
    ? ((stats.lastScore - stats.prevScore) / stats.prevScore) * 100
    : null;
  const trendUp = (trend ?? 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">AI Visibility</h1>
          <p className="mt-1 text-sm text-text-2">Monitor how AI models recommend your clients</p>
        </div>
        <Link
          href="/app/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-text px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-text/90"
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
        <div className="lg:col-span-2 rounded-xl border border-border bg-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-text-2">Average VRTL Score</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className={cn(
                  "text-5xl font-bold",
                  stats.avgScore !== null && stats.avgScore >= 70 ? "text-emerald-600" :
                  stats.avgScore !== null && stats.avgScore >= 40 ? "text-amber-600" : "text-[#0A0A0A]"
                )}>
                  {stats.avgScore?.toFixed(1) ?? "—"}
                </span>
                {trend !== null && (
                  <span className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    trendUp ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
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
              <div className="text-xs text-text-3">Displaying data from all time</div>
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
              <div className="flex h-16 items-center justify-center text-sm text-text-3">
                Run more snapshots to see trends
              </div>
            )}
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
            <div>
              <div className="text-xs text-text-3">Total Clients</div>
              <div className="mt-1 text-2xl font-semibold text-text">{clients.length}</div>
            </div>
            <div>
              <div className="text-xs text-text-3">Snapshots</div>
              <div className="mt-1 text-2xl font-semibold text-text">{stats.completed}</div>
            </div>
            <div>
              <div className="text-xs text-text-3">AI Models</div>
              <div className="mt-1 flex items-center gap-1">
                {[
                  { src: "/ai/icons8-chatgpt.svg", alt: "ChatGPT" },
                  { src: "/ai/icons8-claude.svg", alt: "Claude" },
                  { src: "/ai/gemini.png", alt: "Gemini" },
                ].map((icon) => (
                  <span
                    key={icon.alt}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg"
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
        <div className="rounded-xl border border-border bg-white p-6">
          <div className="text-sm font-medium text-text">Score by Provider</div>
          <p className="mt-1 text-xs text-text-3">Averages from completed snapshots</p>
          
          <div className="mt-4 space-y-3">
            {stats.providerAverages.length > 0 ? (
              stats.providerAverages.slice(0, 3).map((p, idx) => (
                <ProviderCard
                  key={p.provider}
                  name={`${p.provider} (n=${p.count})`}
                  score={p.avg}
                  icon={
                    p.provider.toLowerCase().includes("openai") || p.provider.toLowerCase().includes("chatgpt")
                      ? "/ai/icons8-chatgpt.svg"
                      : p.provider.toLowerCase().includes("claude") || p.provider.toLowerCase().includes("anthropic")
                        ? "/ai/icons8-claude.svg"
                        : p.provider.toLowerCase().includes("gemini") || p.provider.toLowerCase().includes("google")
                          ? "/ai/gemini.png"
                          : "/ai/icons8-chatgpt.svg"
                  }
                  rank={idx + 1}
                />
              ))
            ) : (
              <>
                <ProviderCard name="ChatGPT" score={null} icon="/ai/icons8-chatgpt.svg" rank={1} />
                <ProviderCard name="Claude" score={null} icon="/ai/icons8-claude.svg" rank={2} />
                <ProviderCard name="Gemini" score={null} icon="/ai/gemini.png" rank={3} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Clients table */}
      <div className="rounded-xl border border-[#E5E5E5] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
          <h2 className="font-semibold text-[#0A0A0A]">All Clients</h2>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]"
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
              className="h-9 w-56 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#999] focus:border-[#0A0A0A] focus:outline-none"
            />
          </div>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[1fr,120px,100px,80px] gap-4 border-b border-[#E5E5E5] bg-[#FAFAF8] px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#999]">
          <div>Client</div>
          <div>Industry</div>
          <div>Added</div>
          <div></div>
        </div>

        {/* Table body */}
        <div className="divide-y divide-[#E5E5E5]">
          {filteredClients.length === 0 && searchQuery && (
            <div className="py-12 text-center">
              <p className="text-[#666]">No clients match &quot;{searchQuery}&quot;</p>
              <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-[#0A0A0A] underline">
                Clear search
              </button>
            </div>
          )}

          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/app/clients/${client.id}`}
              className="grid grid-cols-[1fr,120px,100px,80px] items-center gap-4 px-5 py-4 transition-colors hover:bg-[#FAFAF8]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A0A0A] text-sm font-medium text-white">
                  {getInitials(client.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-[#0A0A0A] truncate">{client.name}</div>
                  {client.website && (
                    <div className="truncate text-xs text-[#999] max-w-[200px]">{client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</div>
                  )}
                </div>
              </div>
              <div className="text-sm text-[#666] capitalize">{client.industry.replace(/_/g, " ")}</div>
              <div className="text-sm text-[#666]">{formatDate(client.created_at)}</div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-sm text-[#666]">
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
  const [stats, setStats] = useState<SnapshotStats>({
    total: 0,
    completed: 0,
    avgScore: null,
    recentScores: [],
    providerAverages: [],
    lastScore: null,
    prevScore: null,
  });
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
            .select("id, status, vrtl_score, score_by_provider, created_at")
            .in("client_id", clientIds)
            .order("created_at", { ascending: true });
          
          if (snapshots) {
            const completed = snapshots.filter((s) => {
              const st = String((s as { status?: unknown }).status ?? "").toLowerCase();
              return st.includes("complete") || st.includes("success");
            });

            const scores = completed.map((s) => (s as { vrtl_score?: unknown }).vrtl_score).filter((s): s is number => typeof s === "number");
            const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : null;
            // Get last 10 scores for the chart
            const recentScores = scores.slice(-10);

            const lastScore = scores.length > 0 ? scores[scores.length - 1] : null;
            const prevScore = scores.length > 1 ? scores[scores.length - 2] : null;

            const providerTotals = new Map<string, { sum: number; count: number }>();
            for (const s of completed) {
              const byProvider = (s as { score_by_provider?: unknown }).score_by_provider as Record<string, unknown> | null | undefined;
              if (!byProvider || typeof byProvider !== "object") continue;
              for (const [provider, val] of Object.entries(byProvider)) {
                if (typeof val !== "number") continue;
                const cur = providerTotals.get(provider) ?? { sum: 0, count: 0 };
                cur.sum += val;
                cur.count += 1;
                providerTotals.set(provider, cur);
              }
            }

            const providerAverages = Array.from(providerTotals.entries())
              .map(([provider, x]) => ({ provider, avg: Math.round((x.sum / x.count) * 10) / 10, count: x.count }))
              .sort((a, b) => b.avg - a.avg);

            if (!cancelled) {
              setStats({
                total: snapshots.length,
                completed: completed.length,
                avgScore,
                recentScores,
                providerAverages,
                lastScore,
                prevScore
              });
            }
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E5E5] border-t-[#0A0A0A]" />
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
        <h2 className="text-lg font-semibold text-[#0A0A0A]">Something went wrong</h2>
        <p className="mt-2 text-sm text-[#666]">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-[#0A0A0A] underline">
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
