"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
};

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;
        setAgencyId(agencyId);

        const res = await supabase
          .from("clients")
          .select("id,name,website,industry")
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

  return (
    <main>
      <h1 className="text-xl font-semibold">Clients</h1>
      <p className="mt-2 text-sm">Create and manage clients for your agency.</p>

      <div className="mt-4 flex items-center gap-3">
        <Link className="rounded border px-3 py-2 text-sm" href="/app/clients/new">
          New client
        </Link>
        {agencyId ? <span className="text-xs text-gray-500">agency_id: {agencyId}</span> : null}
      </div>

      {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <ul className="mt-6 space-y-2">
        {clients.map((c) => (
          <li key={c.id} className="rounded border p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-600">
                  {c.website ? c.website : "No website"} · {c.industry}
                </div>
              </div>
              <Link className="underline" href={`/app/clients/${c.id}`}>
                Open
              </Link>
            </div>
          </li>
        ))}
        {!loading && !error && clients.length === 0 ? (
          <li className="text-sm text-gray-600">No clients yet.</li>
        ) : null}
      </ul>
    </main>
  );
}



