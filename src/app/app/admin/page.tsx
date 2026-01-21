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
    <div>
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Internal Only
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text">Admin Panel</h1>
        <p className="mt-2 text-text-2">
          Manage agency access and paywall entitlements.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{agencies.length}</div>
              <div className="text-sm text-text-3">Total Agencies</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{activeCount}</div>
              <div className="text-sm text-text-3">Active</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-text">{inactiveCount}</div>
              <div className="text-sm text-text-3">Inactive</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mt-8">
        <div className="relative max-w-sm">
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
            placeholder="Search agencies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface-2 py-3 pl-12 pr-4 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      )}

      {/* Agency list */}
      {!loading && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border bg-surface-2/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-text">All Agencies</h2>
                <p className="text-xs text-text-3">Toggle access for paywall entitlement</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-surface-2/30"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white",
                    agency.is_active
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gradient-to-br from-slate-400 to-slate-500"
                  )}>
                    {agency.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-text">{agency.name}</div>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        agency.is_active
                          ? "bg-green-500/10 text-green-600"
                          : "bg-slate-500/10 text-slate-500"
                      )}>
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          agency.is_active ? "bg-green-500" : "bg-slate-400"
                        )} />
                        {agency.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-xs text-text-3">{agency.id}</div>
                    {agency.created_at && (
                      <div className="text-xs text-text-3">
                        Created {new Date(agency.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {agency.is_active ? (
                    <button
                      onClick={() => setActive(agency.id, false)}
                      disabled={busyId === agency.id}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2 disabled:opacity-50"
                    >
                      {busyId === agency.id ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      )}
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => setActive(agency.id, true)}
                      disabled={busyId === agency.id}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {busyId === agency.id ? (
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredAgencies.length === 0 && (
              <div className="px-6 py-12 text-center">
                {searchQuery ? (
                  <>
                    <p className="text-text-2">No agencies match &quot;{searchQuery}&quot;</p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-2 text-sm text-accent hover:underline"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <p className="text-text-2">No agencies found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info card */}
      <div className="mt-6 rounded-2xl border border-border bg-surface-2/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-text">Admin Notice</h3>
            <p className="mt-1 text-sm text-text-2">
              This page is for internal use only. Activating an agency gives them access to the app and all features.
              Deactivating an agency will prevent them from logging in until reactivated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
