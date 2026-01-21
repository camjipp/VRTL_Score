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
    year: "numeric",
  });
}

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState<ClientRow[]>([]);
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

        const res = await supabase
          .from("clients")
          .select("id,name,website,industry,created_at")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        if (res.error) throw res.error;
        if (!cancelled) setClients((res.data ?? []) as ClientRow[]);
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

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Workspace
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-text">Clients</h1>
          <p className="mt-2 text-text-2">
            Manage your clients, run competitive analysis, and generate reports.
          </p>
        </div>
        <Link
          href="/app/clients/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-2 hover:shadow-xl hover:shadow-accent/30"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New client
        </Link>
      </div>

      {/* Search & Stats */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 py-3 pl-12 pr-4 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-text-2">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {clients.length} total clients
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl bg-surface-2"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-8">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && clients.length === 0 && (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-2/50 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-text">No clients yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-text-2">
            Create your first client to start running competitive analysis snapshots and generating reports.
          </p>
          <Link
            href="/app/clients/new"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create your first client
          </Link>
        </div>
      )}

      {/* No search results */}
      {!loading && !error && clients.length > 0 && filteredClients.length === 0 && (
        <div className="mt-8 rounded-2xl border border-border bg-surface-2/50 py-12 text-center">
          <p className="text-text-2">No clients match &quot;{searchQuery}&quot;</p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Client cards */}
      {!loading && !error && filteredClients.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client, index) => (
            <Link
              key={client.id}
              href={`/app/clients/${client.id}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-300",
                "hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5",
                "animate-fade-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Industry gradient bar */}
              <div
                className={cn(
                  "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                  getIndustryColor(client.industry)
                )}
              />

              {/* Content */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                    getIndustryColor(client.industry)
                  )}
                >
                  {getInitials(client.name)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-semibold text-text group-hover:text-accent">
                    {client.name}
                  </h3>
                  <p className="mt-1 truncate text-sm text-text-2">
                    {client.website ? (
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                        </svg>
                        {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </span>
                    ) : (
                      "No website"
                    )}
                  </p>
                </div>
              </div>

              {/* Bottom info */}
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="inline-flex items-center rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-medium capitalize text-text-2">
                  {client.industry.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-text-3">
                  Added {formatDate(client.created_at)}
                </span>
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent opacity-0 transition-opacity group-hover:opacity-100">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
