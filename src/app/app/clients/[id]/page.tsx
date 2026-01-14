"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

type SnapshotRow = {
  id: string;
  status: string;
  vrtl_score: number | null;
  score_by_provider: Record<string, number> | null;
  completed_at: string | null;
  created_at: string;
  error?: string | null;
};

type ResponseRow = {
  id: string;
  parsed_json: { competitors_mentioned?: string[] } | null;
  parse_ok: boolean | null;
};

type CompetitorConfidence = {
  level: "low" | "medium" | "high";
  label: "Low" | "Medium" | "High";
  message: string | null;
};

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object") {
    const maybe = e as Record<string, unknown>;
    const msg = typeof maybe.message === "string" ? maybe.message : null;
    const details = typeof maybe.details === "string" ? maybe.details : null;
    const hint = typeof maybe.hint === "string" ? maybe.hint : null;
    const code = typeof maybe.code === "string" ? maybe.code : null;
    const parts = [msg, details, hint].filter(Boolean);
    const base = parts.length ? parts.join(" · ") : "Unknown error";
    return code ? `${base} (code: ${code})` : base;
  }
  return "Unknown error";
}

function getCompetitorConfidence(count: number): CompetitorConfidence {
  if (count <= 0) {
    return {
      level: "low",
      label: "Low",
      message: "Competitive scoring disabled — add 3+ competitors for full comparison."
    };
  }
  if (count < 3) {
    return {
      level: "medium",
      label: "Medium",
      message: "Competitive scoring limited — add 1–2 more competitors for best results."
    };
  }
  return { level: "high", label: "High", message: null };
}

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

  const [snapshot, setSnapshot] = useState<SnapshotRow | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [snapshots, setSnapshots] = useState<SnapshotRow[]>([]);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

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

    // last 10 snapshots (newest first)
    const snapsRes = await supabase
      .from("snapshots")
      .select("id,status,vrtl_score,score_by_provider,completed_at,created_at,error")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!snapsRes.error && snapsRes.data) {
      const rows = snapsRes.data as SnapshotRow[];
      setSnapshots(rows);

      const latest = rows[0] ?? null;
      setSnapshot(latest);

      if (!latest) {
        setResponses([]);
        return;
      }

      const respRes = await supabase
        .from("responses")
        .select("id,parsed_json,parse_ok")
        .eq("snapshot_id", latest.id);
      if (!respRes.error && respRes.data) {
        setResponses(respRes.data as ResponseRow[]);
      }
    } else {
      setSnapshot(null);
      setResponses([]);
      setSnapshots([]);
    }
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
        if (!cancelled) setError(errorMessage(e));
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

  async function runSnapshot() {
    if (!clientId) return;
    setRunError(null);
    setRunning(true);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/snapshots/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ clientId })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Snapshot failed (${res.status})`);
      }
      // reload snapshot/responses
      await refresh(agencyId ?? "");
    } catch (e) {
      setRunError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

  const competitorMentions = Array.from(
    new Set(
      responses
        .filter((r) => r.parse_ok && r.parsed_json?.competitors_mentioned)
        .flatMap((r) => r.parsed_json?.competitors_mentioned ?? [])
    )
  );

  const competitorConfidence = getCompetitorConfidence(competitors.length);

  async function addCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyId) return;
    if (competitors.length >= 8) return;
    setBusy(true);
    setError(null);
    try {
      const insertRes = await supabase.from("competitors").insert({
        client_id: clientId,
        name: newName,
        website: newWebsite || null
      });
      if (insertRes.error) throw insertRes.error;
      setNewName("");
      setNewWebsite("");
      await refresh(agencyId);
    } catch (e) {
      setError(errorMessage(e));
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
      setError(errorMessage(e));
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

      <section className="mt-10">
        <h2 className="text-lg font-medium">Snapshots</h2>
        {competitorConfidence.message ? (
          <div className="mt-3 rounded border bg-yellow-50 p-3 text-sm">
            <div className="font-medium">Score confidence: {competitorConfidence.label}</div>
            <div className="mt-1">{competitorConfidence.message}</div>
          </div>
        ) : null}
        <div className="mt-3 flex items-center gap-3">
          <button
            className="rounded border px-3 py-2 text-sm"
            disabled={running}
            onClick={runSnapshot}
            type="button"
          >
            {running ? "Running…" : "Run Snapshot"}
          </button>
          {snapshot ? (
            <span className="text-xs text-gray-600">
              Latest: {snapshot.status}{" "}
              {snapshot.completed_at ? `@ ${new Date(snapshot.completed_at).toLocaleString()}` : ""}
            </span>
          ) : (
            <span className="text-xs text-gray-600">No snapshots yet.</span>
          )}
        </div>
        {runError ? (
          <div className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">
            {runError}
          </div>
        ) : null}

        {snapshot ? (
          <div className="mt-4 rounded border p-4">
            <div className="text-sm text-gray-600">Status: {snapshot.status}</div>
            <div className="text-lg font-semibold">
              Overall score: {snapshot.vrtl_score ?? "n/a"}
            </div>
            {competitorConfidence.level !== "high" ? (
              <div className="mt-1 text-sm text-gray-700">
                Score confidence: {competitorConfidence.label} due to limited competitor set.
              </div>
            ) : null}
            {snapshot.score_by_provider ? (
              <div className="mt-2 text-sm">
                Providers:
                <ul className="ml-4 list-disc">
                  {Object.entries(snapshot.score_by_provider).map(([p, s]) => (
                    <li key={p}>
                      {p}: {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {competitorMentions.length ? (
              <div className="mt-3 text-sm">
                Competitors mentioned: {competitorMentions.join(", ")}
              </div>
            ) : null}
            {snapshot.error ? (
              <div className="mt-3 text-sm text-red-700">Error: {snapshot.error}</div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-3 py-2 text-left">Date</th>
                <th className="border px-3 py-2 text-left">Status</th>
                <th className="border px-3 py-2 text-left">VRTL Score</th>
                <th className="border px-3 py-2 text-left">Providers</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id}>
                  <td className="border px-3 py-2">
                    {new Date(s.created_at).toLocaleString()}
                  </td>
                  <td className="border px-3 py-2">{s.status}</td>
                  <td className="border px-3 py-2">{s.vrtl_score ?? "—"}</td>
                  <td className="border px-3 py-2">
                    {s.score_by_provider
                      ? Object.entries(s.score_by_provider)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")
                      : "—"}
                  </td>
                  <td className="border px-3 py-2">
                    <Link className="underline" href={`/app/clients/${clientId}/snapshots/${s.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 ? (
                <tr>
                  <td className="border px-3 py-2 text-gray-600" colSpan={5}>
                    No snapshots yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}


