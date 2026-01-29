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
  owner_id: string;
  is_active: boolean;
  created_at: string;
  plan?: string;
  clients?: { count: number }[];
  snapshots_count?: number;
};

type UserWithAgency = {
  id: string;
  email: string;
  created_at: string;
  agency: Agency | null;
};

export default function AdminPage() {
  const supabase = getSupabaseBrowserClient();

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
  async function load() {
      try {
        await ensureOnboarded();

        // Check if super admin
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Not authenticated");

        setCurrentUserId(session.user.id);
        setAccessToken(session.access_token);

        const adminCheck = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        
        if (!adminCheck.ok) {
          setLoading(false);
          return;
        }
        
        const { isAdmin } = await adminCheck.json();
        setIsSuperAdmin(isAdmin);

        if (!isAdmin) {
          setLoading(false);
          return;
        }

        // Fetch agency_users with their agencies and client counts
        const { data: agencyUsers, error: agencyUsersErr } = await supabase
          .from("agency_users")
          .select(`
            user_id,
            role,
            agencies (
              id, 
              name, 
              is_active, 
              created_at, 
              plan,
              clients(count)
            )
          `)
          .order("created_at", { ascending: false });

        if (agencyUsersErr) throw agencyUsersErr;

        // Build user list from agency_users
        const userList: UserWithAgency[] = (agencyUsers ?? []).map((au) => {
          // Supabase returns the relation as an object, cast through unknown first
          const agencyData = au.agencies as unknown as {
            id: string;
            name: string;
            is_active: boolean;
            created_at: string;
            plan?: string;
            clients?: { count: number }[];
          } | null;
          
          return {
            id: au.user_id,
            email: "", // We can't get this from client-side
            created_at: agencyData?.created_at ?? "",
            agency: agencyData ? {
              id: agencyData.id,
              name: agencyData.name,
              owner_id: au.user_id,
              is_active: agencyData.is_active,
              created_at: agencyData.created_at,
              plan: agencyData.plan,
              clients: agencyData.clients
            } : null
          };
        });

        setUsers(userList);
      } catch (e: unknown) {
        const err = e as { message?: string };
        setError(err?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  async function toggleAgency(agencyId: string, currentActive: boolean) {
    setBusy(true);
    try {
      const { error: err } = await supabase
        .from("agencies")
        .update({ is_active: !currentActive })
        .eq("id", agencyId);
      if (err) throw err;
      setUsers((prev) =>
        prev.map((u) => 
          u.agency?.id === agencyId 
            ? { ...u, agency: { ...u.agency!, is_active: !currentActive } } 
            : u
        )
      );
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser(userId: string) {
    if (!accessToken) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ userId })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }

      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setDeleteConfirm(null);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
    } finally {
      setBusy(false);
    }
  }

  const filteredUsers = users.filter((u) =>
    u.agency?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = users.filter((u) => u.agency?.is_active).length;
  const inactiveCount = users.filter((u) => !u.agency?.is_active).length;
  const totalClients = users.reduce((acc, u) => acc + (u.agency?.clients?.[0]?.count ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-[#666] hover:text-[#0A0A0A]">Dashboard</Link>
        <span className="text-[#999]">/</span>
        <span className="text-[#0A0A0A]">Admin</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A]">Admin Panel</h1>
        <p className="mt-1 text-sm text-[#666]">
          Manage users, agencies, and system settings.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-24 animate-pulse rounded-xl bg-[#F5F5F5]" />
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-xl bg-[#F5F5F5]" />
        </div>
      )}

      {/* Error */}
      {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {/* Not authorized */}
      {!loading && !isSuperAdmin && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white py-16 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>
          <h2 className="mt-4 font-semibold text-[#0A0A0A]">Access Denied</h2>
          <p className="mt-1 text-sm text-[#666]">You need admin privileges to view this page.</p>
          <Link href="/app" className="mt-4 inline-block text-sm text-[#0A0A0A] hover:underline">
            Back to dashboard
          </Link>
        </div>
      )}

      {/* Admin content */}
      {!loading && isSuperAdmin && (
        <>
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="text-sm font-medium text-[#666]">Total Users</div>
              <div className="mt-2 text-3xl font-bold text-[#0A0A0A]">{users.length}</div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="text-sm font-medium text-[#666]">Active</div>
              <div className="mt-2 text-3xl font-bold text-emerald-600">{activeCount}</div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="text-sm font-medium text-[#666]">Inactive</div>
              <div className="mt-2 text-3xl font-bold text-[#999]">{inactiveCount}</div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="text-sm font-medium text-[#666]">Total Clients</div>
              <div className="mt-2 text-3xl font-bold text-[#0A0A0A]">{totalClients}</div>
            </div>
          </div>

          {/* Users/Agencies list */}
          <div className="overflow-hidden rounded-xl border border-[#E5E5E5] bg-white">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
              <div>
                <h2 className="font-semibold text-[#0A0A0A]">Users & Agencies</h2>
                <p className="text-xs text-[#999]">{users.length} total users</p>
              </div>
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
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-48 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] pl-9 pr-3 text-sm text-[#0A0A0A] placeholder:text-[#999] focus:border-[#0A0A0A] focus:outline-none"
                />
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#666]">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E5E5E5]">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#FAFAF8]"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white",
                        user.agency?.is_active ? "bg-[#0A0A0A]" : "bg-[#999]"
                      )}>
                        {user.agency?.name.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <div className="font-medium text-[#0A0A0A]">{user.agency?.name ?? "No Agency"}</div>
                        <div className="flex items-center gap-2 text-xs text-[#999]">
                          <span className={cn(
                            "flex items-center gap-1",
                            user.agency?.is_active ? "text-emerald-600" : "text-[#999]"
                          )}>
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              user.agency?.is_active ? "bg-emerald-500" : "bg-[#ccc]"
                            )} />
                            {user.agency?.is_active ? "Active" : "Inactive"}
                          </span>
                          <span>·</span>
                          <span>{user.agency?.clients?.[0]?.count ?? 0} clients</span>
                          <span>·</span>
                          <span className="capitalize">{user.agency?.plan ?? "free"}</span>
                          <span>·</span>
                          <span>{new Date(user.created_at).toLocaleDateString()}</span>
                          {user.id === currentUserId && (
                            <>
                              <span>·</span>
                              <span className="rounded bg-[#0A0A0A] px-1.5 py-0.5 text-[10px] font-medium text-white">YOU</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.agency && (
                        <button
                          onClick={() => toggleAgency(user.agency!.id, user.agency!.is_active)}
                          disabled={busy}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            user.agency.is_active
                              ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          )}
                        >
                          {user.agency.is_active ? "Deactivate" : "Activate"}
                        </button>
                      )}
                      {user.id !== currentUserId && (
                        <>
                          {deleteConfirm === user.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={busy}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                              >
                                {busy ? "Deleting..." : "Confirm"}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={busy}
                                className="rounded-lg bg-[#F5F5F5] px-3 py-1.5 text-xs font-medium text-[#666] transition-colors hover:bg-[#E5E5E5]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(user.id)}
                              disabled={busy}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger zone info */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <h3 className="font-medium text-red-800">Important</h3>
                <p className="mt-1 text-sm text-red-700">
                  Deleting a user will permanently remove their account, agency, all clients, competitors, and snapshot data. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
  );
}
