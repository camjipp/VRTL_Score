"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
};

type CompetitorRow = {
  id: string;
  name: string;
  website: string | null;
  created_at: string;
};

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);

  const supabase = getSupabaseBrowserClient();

  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [client, setClient] = useState<ClientRow | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh(currentAgencyId: string) {
    const clientRes = await supabase
      .from("clients")
      .select("id,name,website,industry")
      .eq("id", clientId)
      .eq("agency_id", currentAgencyId)
      .maybeSingle();

    if (clientRes.error) throw clientRes.error;
    setClient((clientRes.data as ClientRow | null) ?? null);

    const competitorsRes = await supabase
      .from("competitors")
      .select("id,name,website,created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (competitorsRes.error) throw competitorsRes.error;
    setCompetitors((competitorsRes.data ?? []) as CompetitorRow[]);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!clientId) return;
      setLoading(true);
      setError(null);
      try {
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;
        setAgencyId(agencyId);
        await refresh(agencyId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function addCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyId) return;
    if (competitors.length >= 8) return;
    setBusy(true);
    setError(null);
    try {
      const insertRes = await supabase.from("competitors").insert({
        client_id: clientId,
        agency_id: agencyId,
        name: newName,
        website: newWebsite || null
      });
      if (insertRes.error) throw insertRes.error;
      setNewName("");
      setNewWebsite("");
      await refresh(agencyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function deleteCompetitor(id: string) {
    if (!agencyId) return;
    setBusy(true);
    setError(null);
    try {
      const delRes = await supabase.from("competitors").delete().eq("id", id);
      if (delRes.error) throw delRes.error;
      await refresh(agencyId);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1 className="text-xl font-semibold">Client</h1>

      {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!loading && !error && !client ? (
        <div className="mt-6 text-sm text-gray-600">Client not found (or not in your agency).</div>
      ) : null}

      {client ? (
        <div className="mt-6 rounded border p-4">
          <div className="font-medium">{client.name}</div>
          <div className="text-sm text-gray-600">
            {client.website ? client.website : "No website"} · {client.industry}
          </div>
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-medium">Competitors</h2>
        <p className="mt-1 text-sm text-gray-600">Max 8 competitors.</p>

        <ul className="mt-4 space-y-2">
          {competitors.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded border p-3">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-gray-600">{c.website ? c.website : "No website"}</div>
              </div>
              <button
                className="rounded border px-3 py-1 text-sm"
                disabled={busy}
                onClick={() => deleteCompetitor(c.id)}
                type="button"
              >
                Delete
              </button>
            </li>
          ))}
          {!loading && competitors.length === 0 ? (
            <li className="text-sm text-gray-600">No competitors yet.</li>
          ) : null}
        </ul>

        <form className="mt-6 max-w-md space-y-3" onSubmit={addCompetitor}>
          <label className="block text-sm">
            <div className="mb-1">Name</div>
            <input
              className="w-full rounded border px-3 py-2"
              disabled={busy || competitors.length >= 8}
              onChange={(e) => setNewName(e.target.value)}
              required
              value={newName}
            />
          </label>

          <label className="block text-sm">
            <div className="mb-1">Website (optional)</div>
            <input
              className="w-full rounded border px-3 py-2"
              disabled={busy || competitors.length >= 8}
              onChange={(e) => setNewWebsite(e.target.value)}
              value={newWebsite}
            />
          </label>

          {competitors.length >= 8 ? (
            <div className="text-sm text-red-700">You’ve reached the max of 8 competitors.</div>
          ) : null}

          <button
            className="rounded border px-3 py-2 text-sm"
            disabled={busy || competitors.length >= 8}
            type="submit"
          >
            {busy ? "Adding…" : "Add competitor"}
          </button>
        </form>
      </section>
    </main>
  );
}


