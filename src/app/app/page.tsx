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
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-2 text-sm text-text-2">Create and manage clients for your agency.</p>
        </div>
        <Link className="btn-primary" href="/app/clients/new">
          New client
        </Link>
      </div>

      {agencyId ? <div className="mt-3 text-xs text-muted">agency_id: {agencyId}</div> : null}

      {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <ul className="mt-6 space-y-3">
        {clients.map((c) => (
          <li key={c.id} className="card-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-text">{c.name}</div>
                <div className="mt-1 text-sm text-text-2">
                  {c.website ? c.website : "No website"} <span className="text-muted">·</span>{" "}
                  {c.industry}
                </div>
              </div>
              <Link className="btn-secondary" href={`/app/clients/${c.id}`}>
                Open
              </Link>
            </div>
          </li>
        ))}
        {!loading && !error && clients.length === 0 ? (
          <li className="text-sm text-text-2">No clients yet.</li>
        ) : null}
      </ul>
    </main>
  );
}



