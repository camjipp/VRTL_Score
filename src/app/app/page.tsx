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
};

function getIndustryGradient(industry: string) {
  const gradients: Record<string, string> = {
    technology: "from-blue-500 to-cyan-400",
    healthcare: "from-emerald-500 to-teal-400",
    finance: "from-amber-500 to-orange-400",
    retail: "from-pink-500 to-rose-400",
    education: "from-purple-500 to-violet-400",
    marketing: "from-red-500 to-pink-400",
    real_estate: "from-green-500 to-emerald-400",
    hospitality: "from-orange-500 to-amber-400",
    legal: "from-indigo-500 to-blue-400",
  };
  return gradients[industry.toLowerCase()] || "from-slate-500 to-slate-400";
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Animated welcome for first-run
function WelcomeExperience() {
  return (
    <div className="space-y-8">
      {/* Hero welcome card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-cyan-500 to-blue-500 p-8 text-white shadow-2xl shadow-emerald-500/20">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
            Let&apos;s get started
          </div>
          
          <h1 className="mt-4 text-3xl font-bold">Welcome to VRTL Score! 🎉</h1>
          <p className="mt-2 max-w-lg text-lg text-white/80">
            Track how AI models like ChatGPT, Claude, and Gemini recommend your clients. Get your first report in under 2 minutes.
          </p>

          <Link
            href="/app/clients/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-emerald-600 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add your first client
          </Link>
        </div>

        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5" />
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-lg font-semibold text-text">How it works</h2>
        <p className="mt-1 text-sm text-text-2">Three simple steps to your first AI visibility report</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              step: 1,
              title: "Add a client",
              desc: "Enter your client's name and website",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                </svg>
              ),
              color: "from-emerald-500 to-emerald-600",
              active: true,
            },
            {
              step: 2,
              title: "Add competitors",
              desc: "Tell us who they compete with",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              ),
              color: "from-cyan-500 to-cyan-600",
            },
            {
              step: 3,
              title: "Run a snapshot",
              desc: "Get your AI visibility report",
              icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
              ),
              color: "from-blue-500 to-blue-600",
            },
          ].map((item) => (
            <div
              key={item.step}
              className={cn(
                "relative rounded-2xl border p-5 transition-all",
                item.active
                  ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 shadow-lg shadow-emerald-500/10"
                  : "border-border bg-surface hover:border-border/80 hover:shadow-md"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg",
                item.color
              )}>
                {item.icon}
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-text-2">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-text">{item.title}</h3>
                </div>
                <p className="mt-1 text-sm text-text-2">{item.desc}</p>
              </div>
              {item.active && (
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick tip */}
      <div className="flex items-start gap-4 rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-100">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
          <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-amber-900">Pro tip</h4>
          <p className="mt-1 text-sm text-amber-800">
            Start with 3-5 competitors for the most actionable insights. Think about who your client loses deals to, not just the biggest names in the industry.
          </p>
        </div>
      </div>
    </div>
  );
}

// Dashboard when they have clients
function Dashboard({ clients, stats }: { clients: ClientRow[]; stats: SnapshotStats }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Dashboard</h1>
          <p className="mt-1 text-sm text-text-2">
            Your AI visibility overview
          </p>
        </div>
        <Link
          href="/app/clients/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl hover:scale-[1.02]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add client
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-2">Clients</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-text">{clients.length}</div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-2">Snapshots</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100">
              <svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-text">{stats.completed}</div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-2">Avg Score</span>
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              stats.avgScore !== null && stats.avgScore >= 70 ? "bg-emerald-100" : 
              stats.avgScore !== null && stats.avgScore >= 40 ? "bg-amber-100" : "bg-surface-2"
            )}>
              <svg className={cn(
                "h-5 w-5",
                stats.avgScore !== null && stats.avgScore >= 70 ? "text-emerald-600" : 
                stats.avgScore !== null && stats.avgScore >= 40 ? "text-amber-600" : "text-text-3"
              )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
          </div>
          <div className={cn(
            "mt-3 text-3xl font-bold",
            stats.avgScore !== null && stats.avgScore >= 70 ? "text-emerald-600" : 
            stats.avgScore !== null && stats.avgScore >= 40 ? "text-amber-600" : "text-text"
          )}>
            {stats.avgScore ?? "—"}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-2">Visibility</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
              <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-3 text-lg font-bold text-text">
            {stats.avgScore !== null && stats.avgScore >= 70 ? "Strong" : 
             stats.avgScore !== null && stats.avgScore >= 40 ? "Moderate" : 
             stats.avgScore !== null ? "Needs work" : "No data"}
          </div>
        </div>
      </div>

      {/* Clients section */}
      <div className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-semibold text-text">All Clients</h2>
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
              className="h-9 w-48 rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-text placeholder:text-text-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredClients.length === 0 && searchQuery && (
            <div className="py-12 text-center">
              <p className="text-text-2">No clients match &quot;{searchQuery}&quot;</p>
              <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-emerald-600 hover:underline">
                Clear search
              </button>
            </div>
          )}

          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/app/clients/${client.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/50"
            >
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-lg",
                getIndustryGradient(client.industry)
              )}>
                {getInitials(client.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-text">{client.name}</div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-text-3">
                  <span className="capitalize">{client.industry.replace(/_/g, " ")}</span>
                  {client.website && (
                    <>
                      <span>·</span>
                      <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="text-xs text-text-3">{formatDate(client.created_at)}</span>
              <svg className="h-5 w-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
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
  const [stats, setStats] = useState<SnapshotStats>({ total: 0, completed: 0, avgScore: null });
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
            .select("id, status, vrtl_score")
            .in("client_id", clientIds);
          
          if (snapshots) {
            const completed = snapshots.filter(s => s.status === "completed" || s.status === "success");
            const scores = completed.map(s => s.vrtl_score).filter((s): s is number => typeof s === "number");
            const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
            if (!cancelled) setStats({ total: snapshots.length, completed: completed.length, avgScore });
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
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
        <button onClick={() => window.location.reload()} className="mt-4 text-sm font-medium text-emerald-600 hover:underline">
          Try again
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return <WelcomeExperience />;
  }

  return <Dashboard clients={clients} stats={stats} />;
}
