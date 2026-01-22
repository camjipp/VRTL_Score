"use client";

import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

type AgencyRow = {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string | null;
};

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/admin/agencies", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { agencies: AgencyRow[] };
      setAgencies(json.agencies ?? []);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function setActive(agencyId: string, is_active: boolean) {
    setBusyId(agencyId);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/admin/agencies/set-active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ agencyId, is_active })
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  const filteredAgencies = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = agencies.filter((a) => a.is_active).length;
  const inactiveCount = agencies.filter((a) => !a.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Internal Only
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Admin Panel</h1>
        <p className="mt-1 text-sm text-white/50">Manage agency access and entitlements.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{agencies.length}</div>
              <div className="text-xs text-white/40">Total Agencies</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeCount}</div>
              <div className="text-xs text-white/40">Active</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#161616] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{inactiveCount}</div>
              <div className="text-xs text-white/40">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search agencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
        />
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      )}

      {/* Agency list */}
      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#161616]">
          <div className="border-b border-white/5 px-5 py-4">
            <h2 className="font-semibold text-white">All Agencies</h2>
            <p className="text-xs text-white/40">Toggle access for paywall entitlement</p>
          </div>

          <div className="divide-y divide-white/5">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white",
                    agency.is_active ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-white/10"
                  )}>
                    {agency.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{agency.name}</span>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        agency.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40"
                      )}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", agency.is_active ? "bg-emerald-500" : "bg-white/40")} />
                        {agency.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-white/30">{agency.id.slice(0, 8)}…</div>
                  </div>
                </div>

                <div>
                  {agency.is_active ? (
                    <button
                      onClick={() => setActive(agency.id, false)}
                      disabled={busyId === agency.id}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
                    >
                      {busyId === agency.id ? "..." : "Deactivate"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setActive(agency.id, true)}
                      disabled={busyId === agency.id}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                    >
                      {busyId === agency.id ? "..." : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredAgencies.length === 0 && (
              <div className="py-12 text-center">
                {searchQuery ? (
                  <>
                    <p className="text-white/50">No agencies match &quot;{searchQuery}&quot;</p>
                    <button onClick={() => setSearchQuery("")} className="mt-2 text-sm text-white/70 hover:text-white hover:underline">Clear search</button>
                  </>
                ) : (
                  <p className="text-white/50">No agencies found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">Admin Notice</p>
            <p className="mt-0.5 text-xs text-white/50">
              Activating an agency gives them full access. Deactivating prevents login until reactivated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
