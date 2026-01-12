"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type SnapshotRow = {
  id: string;
  status: string;
  vrtl_score: number | null;
  score_by_provider: Record<string, number> | null;
  created_at: string;
  completed_at: string | null;
  error: string | null;
};

type ResponseRow = {
  id: string;
  provider: string | null;
  prompt_key: string | null;
  parse_ok: boolean | null;
  raw_text: string | null;
};

export default function SnapshotDetailPage() {
  const params = useParams<{ id: string; snapshotId: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);
  const snapshotId = useMemo(
    () => (typeof params?.snapshotId === "string" ? params.snapshotId : ""),
    [params]
  );

  const supabase = getSupabaseBrowserClient();

  const [snapshot, setSnapshot] = useState<SnapshotRow | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!snapshotId) return;
      setLoading(true);
      setError(null);
      try {
        await ensureOnboarded();
        const snapRes = await supabase
          .from("snapshots")
          .select("id,status,vrtl_score,score_by_provider,created_at,completed_at,error,client_id")
          .eq("id", snapshotId)
          .maybeSingle();
        if (snapRes.error) throw snapRes.error;
        if (!snapRes.data) throw new Error("Snapshot not found");
        if (snapRes.data.client_id !== clientId) throw new Error("Snapshot not for this client");

        if (cancelled) return;
        setSnapshot(snapRes.data as unknown as SnapshotRow);

        const respRes = await supabase
          .from("responses")
          .select("id,provider,prompt_key,parse_ok,raw_text")
          .eq("snapshot_id", snapshotId)
          .order("prompt_ordinal", { ascending: true });
        if (respRes.error) throw respRes.error;
        if (!cancelled) setResponses((respRes.data ?? []) as ResponseRow[]);
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
  }, [clientId, snapshotId, supabase]);

  return (
    <main className="p-6">
      <div className="mb-4 text-sm">
        <Link className="underline" href={`/app/clients/${clientId}`}>
          ← Back to client
        </Link>
      </div>

      <h1 className="text-xl font-semibold">Snapshot</h1>

      {loading ? <div className="mt-4 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {snapshot ? (
        <div className="mt-4 rounded border p-4 text-sm">
          <div>Status: {snapshot.status}</div>
          <div>VRTL Score: {snapshot.vrtl_score ?? "—"}</div>
          <div>Created: {new Date(snapshot.created_at).toLocaleString()}</div>
          <div>
            Completed:{" "}
            {snapshot.completed_at ? new Date(snapshot.completed_at).toLocaleString() : "—"}
          </div>
          <div>
            Providers:{" "}
            {snapshot.score_by_provider
              ? Object.entries(snapshot.score_by_provider)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")
              : "—"}
          </div>
          {snapshot.error ? <div className="mt-2 text-red-700">Error: {snapshot.error}</div> : null}
        </div>
      ) : null}

      <h2 className="mt-8 text-lg font-medium">Responses</h2>
      <ul className="mt-3 space-y-2">
        {responses.map((r) => (
          <li key={r.id} className="rounded border p-3 text-sm">
            <div className="text-xs text-gray-600">
              {r.provider ?? "—"} · {r.prompt_key ?? "—"} · parse_ok:{" "}
              {String(Boolean(r.parse_ok))}
            </div>
            <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
              {r.raw_text ?? ""}
            </pre>
          </li>
        ))}
        {!loading && !error && responses.length === 0 ? (
          <li className="text-sm text-gray-600">No responses found.</li>
        ) : null}
      </ul>
    </main>
  );
}


