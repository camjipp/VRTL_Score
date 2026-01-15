"use client";

import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";

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

  return (
    <main>
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-gray-600">
        Internal-only: manage agency access (paywall entitlement).
      </p>

      {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="border px-3 py-2 text-left">Agency</th>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Active</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((a) => (
              <tr key={a.id}>
                <td className="border px-3 py-2">{a.name}</td>
                <td className="border px-3 py-2 font-mono text-xs">{a.id}</td>
                <td className="border px-3 py-2">{a.is_active ? "true" : "false"}</td>
                <td className="border px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      disabled={busyId === a.id || a.is_active}
                      onClick={() => setActive(a.id, true)}
                      type="button"
                    >
                      {busyId === a.id ? "Working…" : "Activate"}
                    </button>
                    <button
                      className="rounded border px-2 py-1 text-xs"
                      disabled={busyId === a.id || !a.is_active}
                      onClick={() => setActive(a.id, false)}
                      type="button"
                    >
                      {busyId === a.id ? "Working…" : "Deactivate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && agencies.length === 0 ? (
              <tr>
                <td className="border px-3 py-2 text-gray-600" colSpan={4}>
                  No agencies found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}


