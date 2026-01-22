"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ensureOnboarded } from "@/lib/onboard";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

type Agency = {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export default function AdminPage() {
  const supabase = getSupabaseBrowserClient();

  const [role, setRole] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const { agencyId } = await ensureOnboarded();

        // Get the user's role from agency_members
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: membership } = await supabase
          .from("agency_members")
          .select("role")
          .eq("user_id", user.id)
          .eq("agency_id", agencyId)
          .maybeSingle();

        const userRole = membership?.role ?? null;
        setRole(userRole);

        if (userRole !== "admin" && userRole !== "owner") {
          setLoading(false);
          return;
        }

        const { data, error: err } = await supabase
          .from("agencies")
          .select("id, name, is_active, created_at")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setAgencies((data ?? []) as Agency[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  async function toggleAgency(id: string, currentActive: boolean) {
    setBusy(true);
    try {
      const { error: err } = await supabase
        .from("agencies")
        .update({ is_active: !currentActive })
        .eq("id", id);
      if (err) throw err;
      setAgencies((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !currentActive } : a))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const filteredAgencies = agencies.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = agencies.filter((a) => a.is_active).length;
  const inactiveCount = agencies.filter((a) => !a.is_active).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-text-2 hover:text-text">Dashboard</Link>
        <span className="text-text-3">/</span>
        <span className="text-text">Admin</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Admin Panel</h1>
        <p className="mt-1 text-sm text-text-2">
          Manage agencies and system settings.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-24 animate-pulse rounded-2xl bg-surface-2" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Not authorized */}
      {!loading && role !== "admin" && role !== "owner" && (
        <div className="rounded-2xl border border-border bg-surface py-16 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-4 font-semibold text-text">Access Denied</h2>
          <p className="mt-1 text-sm text-text-2">You need admin privileges to view this page.</p>
          <Link href="/app" className="mt-4 inline-block text-sm text-accent hover:underline">
            Back to dashboard
          </Link>
        </div>
      )}

      {/* Admin content */}
      {!loading && (role === "admin" || role === "owner") && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-sm font-medium text-text-2">Total Agencies</div>
              <div className="mt-2 text-3xl font-bold text-text">{agencies.length}</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-sm font-medium text-text-2">Active</div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">{activeCount}</div>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5">
              <div className="text-sm font-medium text-text-2">Inactive</div>
              <div className="mt-2 text-3xl font-bold text-text-3">{inactiveCount}</div>
            </div>
          </div>

          {/* Agencies list */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-semibold text-text">Agencies</h2>
                <p className="text-xs text-text-3">{agencies.length} total</p>
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
                  placeholder="Search agencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 rounded-lg border border-border bg-surface-2 pl-9 pr-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {filteredAgencies.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-2">No agencies found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredAgencies.map((agency) => (
                  <div
                    key={agency.id}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white",
                        agency.is_active
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500"
                          : "bg-gradient-to-br from-gray-400 to-gray-500"
                      )}>
                        {agency.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-text">{agency.name}</div>
                        <div className="flex items-center gap-2 text-xs text-text-3">
                          <span className={cn(
                            "flex items-center gap-1",
                            agency.is_active ? "text-emerald-600" : "text-text-3"
                          )}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              agency.is_active ? "bg-emerald-500" : "bg-gray-400"
                            )} />
                            {agency.is_active ? "Active" : "Inactive"}
                          </span>
                          <span>·</span>
                          <span>{new Date(agency.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAgency(agency.id, agency.is_active)}
                      disabled={busy}
                      className={cn(
                        "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                        agency.is_active
                          ? "bg-red-500/10 text-red-600 hover:bg-red-500/20"
                          : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      )}
                    >
                      {agency.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
