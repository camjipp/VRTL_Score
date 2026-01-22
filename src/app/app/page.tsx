"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
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
};

function getIndustryColor(industry: string) {
  const colors: Record<string, string> = {
    default: "from-slate-500 to-slate-600",
    technology: "from-blue-500 to-cyan-500",
    healthcare: "from-emerald-500 to-teal-500",
    finance: "from-amber-500 to-orange-500",
    retail: "from-pink-500 to-rose-500",
    education: "from-purple-500 to-violet-500",
    marketing: "from-red-500 to-pink-500",
    real_estate: "from-green-500 to-emerald-500",
    hospitality: "from-orange-500 to-amber-500",
    legal: "from-indigo-500 to-blue-500",
  };
  return colors[industry.toLowerCase()] || colors.default;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function MetricCard({
  label,
  value,
  sublabel,
  icon,
  color = "default"
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  color?: "default" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    default: "text-text",
    success: "text-emerald-600",
    warning: "text-amber-600",
    danger: "text-red-600"
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-text-2">{label}</div>
          <div className={cn("mt-2 text-3xl font-bold tracking-tight", colorClasses[color])}>
            {value}
          </div>
          {sublabel && (
            <div className="mt-1 text-xs text-text-3">{sublabel}</div>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 text-text-3">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [stats, setStats] = useState<SnapshotStats>({ total: 0, completed: 0, avgScore: null });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;

        // Load clients
        const res = await supabase
          .from("clients")
          .select("id,name,website,industry,created_at")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        if (res.error) throw res.error;
        const clientList = (res.data ?? []) as ClientRow[];
        if (!cancelled) setClients(clientList);

        // Load snapshot stats
        if (clientList.length > 0) {
          const clientIds = clientList.map(c => c.id);
          const { data: snapshots } = await supabase
            .from("snapshots")
            .select("id, status, vrtl_score")
            .in("client_id", clientIds);
          
          if (snapshots) {
            const completed = snapshots.filter(s => s.status === "completed" || s.status === "success");
            const scores = completed
              .map(s => s.vrtl_score)
              .filter((s): s is number => typeof s === "number");
            const avgScore = scores.length > 0 
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : null;
            
            if (!cancelled) {
              setStats({
                total: snapshots.length,
                completed: completed.length,
                avgScore
              });
            }
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const recentClients = clients.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Dashboard</h1>
          <p className="mt-1 text-sm text-text-2">
            Overview of your AI visibility and competitive analysis.
          </p>
        </div>
        <Link
          href="/app/clients/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New client
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Metric cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Clients"
              value={clients.length}
              sublabel="Active accounts"
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              }
            />
            <MetricCard
              label="Total Snapshots"
              value={stats.total}
              sublabel={`${stats.completed} completed`}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              }
            />
            <MetricCard
              label="Avg. VRTL Score"
              value={stats.avgScore ?? "—"}
              sublabel="Across all clients"
              color={stats.avgScore !== null ? (stats.avgScore >= 80 ? "success" : stats.avgScore >= 50 ? "warning" : "danger") : "default"}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              }
            />
            <MetricCard
              label="AI Visibility"
              value={stats.avgScore !== null && stats.avgScore >= 50 ? "Good" : stats.avgScore !== null ? "Needs work" : "—"}
              sublabel="Overall health"
              color={stats.avgScore !== null ? (stats.avgScore >= 80 ? "success" : stats.avgScore >= 50 ? "warning" : "danger") : "default"}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </div>

          {/* Main content grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Clients list */}
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-text">Clients</h2>
                    <p className="text-xs text-text-3">{clients.length} total</p>
                  </div>
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
                      className="h-8 w-40 rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                {/* Empty state */}
                {clients.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                      <svg className="h-6 w-6 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-4 font-semibold text-text">No clients yet</h3>
                    <p className="mt-1 text-sm text-text-2">Create your first client to get started</p>
                    <Link
                      href="/app/clients/new"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Create client
                    </Link>
                  </div>
                )}

                {/* No search results */}
                {clients.length > 0 && filteredClients.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-text-2">No clients match &quot;{searchQuery}&quot;</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-sm text-accent hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {/* Client rows */}
                {filteredClients.length > 0 && (
                  <div className="divide-y divide-border">
                    {filteredClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/app/clients/${client.id}`}
                        className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-2"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                              getIndustryColor(client.industry)
                            )}
                          >
                            {getInitials(client.name)}
                          </div>
                          <div>
                            <div className="font-medium text-text">{client.name}</div>
                            <div className="flex items-center gap-2 text-xs text-text-3">
                              <span className="capitalize">{client.industry.replace(/_/g, " ")}</span>
                              <span>·</span>
                              <span>{formatDate(client.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions & recent activity */}
            <div className="space-y-6">
              {/* Quick actions */}
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="font-semibold text-text">Quick Actions</h2>
                </div>
                <div className="p-4 space-y-2">
                  <Link
                    href="/app/clients/new"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    Add new client
                  </Link>
                  <Link
                    href="/app/settings"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      </svg>
                    </div>
                    Agency settings
                  </Link>
                </div>
              </div>

              {/* Recent clients */}
              {recentClients.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="font-semibold text-text">Recent Clients</h2>
                  </div>
                  <div className="p-3 space-y-1">
                    {recentClients.map((client) => (
                      <Link
                        key={client.id}
                        href={`/app/clients/${client.id}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-surface-2"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold text-white",
                            getIndustryColor(client.industry)
                          )}
                        >
                          {getInitials(client.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-text">{client.name}</div>
                          <div className="text-xs text-text-3">{formatDate(client.created_at)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Getting started (if no clients) */}
              {clients.length === 0 && (
                <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2/50 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 font-semibold text-text">Getting Started</h3>
                  <p className="mt-2 text-sm text-text-2">
                    Create your first client to run AI visibility snapshots and competitive analysis reports.
                  </p>
                  <ol className="mt-4 space-y-2 text-sm text-text-2">
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text">1</span>
                      Add a client
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text">2</span>
                      Add competitors
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text">3</span>
                      Run a snapshot
                    </li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
