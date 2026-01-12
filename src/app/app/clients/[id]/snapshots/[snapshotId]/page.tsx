import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type SnapshotRow = {
  id: string;
  status: string;
  vrtl_score: number | null;
  score_by_provider: Record<string, number> | null;
  created_at: string;
  completed_at: string | null;
  error: string | null;
  prompt_pack_version: string | null;
  client_id: string;
};

type ClientRow = {
  id: string;
  name: string;
  website: string | null;
};

type CompetitorRow = {
  id: string;
  name: string;
  website: string | null;
};

type ResponseRow = {
  id: string;
  provider: string | null;
  model: string | null;
  prompt_ordinal: number | null;
  prompt_text: string | null;
  parse_ok: boolean | null;
  parsed_json: any | null;
  raw_text: string | null;
  created_at: string;
};

type PageProps = {
  params: {
    id: string;
    snapshotId: string;
  };
};

function formatDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? "—" : dt.toLocaleString();
}

function summarizeProviders(score_by_provider: Record<string, number> | null) {
  if (!score_by_provider || Object.keys(score_by_provider).length === 0) return "—";
  return Object.entries(score_by_provider)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");
}

function truncateText(text: string, len = 180) {
  if (text.length <= len) return text;
  return `${text.slice(0, len)}…`;
}

export default async function SnapshotDetailPage({ params }: PageProps) {
  const clientId = params.id;
  const snapshotId = params.snapshotId;
  const supabase = getSupabaseAdminClient();

  // Fetch snapshot
  const snapRes = await supabase
    .from("snapshots")
    .select(
      "id,status,vrtl_score,score_by_provider,created_at,completed_at,error,prompt_pack_version,client_id"
    )
    .eq("id", snapshotId)
    .maybeSingle();
  if (snapRes.error || !snapRes.data) {
    return (
      <main className="p-6">
        <div className="text-sm text-red-700">Snapshot not found.</div>
      </main>
    );
  }
  if (snapRes.data.client_id !== clientId) {
    return (
      <main className="p-6">
        <div className="text-sm text-red-700">Snapshot does not belong to this client.</div>
      </main>
    );
  }
  const snapshot = snapRes.data as SnapshotRow;

  // Fetch client
  const clientRes = await supabase
    .from("clients")
    .select("id,name,website")
    .eq("id", clientId)
    .maybeSingle();
  const client = clientRes.data as ClientRow | null;

  // Fetch competitors
  const competitorsRes = await supabase
    .from("competitors")
    .select("id,name,website")
    .eq("client_id", clientId)
    .order("name", { ascending: true });
  const competitors = (competitorsRes.data ?? []) as CompetitorRow[];

  // Fetch responses
  const responsesRes = await supabase
    .from("responses")
    .select(
      "id,provider,model,prompt_ordinal,prompt_text,parse_ok,parsed_json,raw_text,created_at"
    )
    .eq("snapshot_id", snapshotId)
    .order("prompt_ordinal", { ascending: true });
  const responses = (responsesRes.data ?? []) as ResponseRow[];

  // Competitive summary
  let clientMentionedCount = 0;
  const competitorMentionCounts = new Map<string, number>();

  for (const r of responses) {
    const pj = (r.parsed_json ?? {}) as {
      client_mentioned?: boolean;
      competitors_mentioned?: string[];
    };
    if (pj.client_mentioned) clientMentionedCount += 1;
    if (Array.isArray(pj.competitors_mentioned)) {
      for (const name of pj.competitors_mentioned) {
        competitorMentionCounts.set(name, (competitorMentionCounts.get(name) ?? 0) + 1);
      }
    }
  }

  const topCompetitors = Array.from(competitorMentionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <main className="p-6 space-y-6">
      <div className="text-sm">
        <Link className="underline" href={`/app/clients/${clientId}`}>
          ← Back to client
        </Link>
      </div>

      <section className="space-y-2">
        <h1 className="text-xl font-semibold">
          Snapshot {snapshot.id.slice(0, 8)}… {client ? `for ${client.name}` : ""}
        </h1>
        <div className="text-sm text-gray-700">
          Status: {snapshot.status} · Created: {formatDate(snapshot.created_at)} · Completed:{" "}
          {formatDate(snapshot.completed_at)}
        </div>
        <div className="text-lg font-semibold">Overall score: {snapshot.vrtl_score ?? "—"}</div>
        <div className="text-sm">Providers: {summarizeProviders(snapshot.score_by_provider)}</div>
        <div className="text-sm">Prompt pack: {snapshot.prompt_pack_version ?? "—"}</div>
        {snapshot.error ? (
          <div className="text-sm text-red-700">Error: {snapshot.error}</div>
        ) : null}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Competitive summary</h2>
        <div className="text-sm">
          Client mentioned/recommended in {clientMentionedCount} response(s)
        </div>
        <div className="text-sm">Top competitors mentioned:</div>
        <ul className="ml-4 list-disc text-sm">
          {topCompetitors.length === 0 ? (
            <li className="text-gray-600">None</li>
          ) : (
            topCompetitors.map(([name, count]) => (
              <li key={name}>
                {name}: {count}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Responses</h2>
        {responses.map((r) => {
          const pj = (r.parsed_json ?? {}) as {
            client_mentioned?: boolean;
            client_position?: string;
            recommendation_strength?: string;
            evidence_snippet?: string;
            competitors_mentioned?: string[];
          };
          const snippet =
            pj.evidence_snippet ??
            (r.raw_text ? truncateText(r.raw_text, 180) : "No evidence available");
          return (
            <div key={r.id} className="rounded border p-3 text-sm">
              <div className="text-xs text-gray-600">
                {r.provider ?? "—"} · {r.prompt_text ?? "Prompt"} · parse_ok:{" "}
                {String(Boolean(r.parse_ok))}
              </div>
              <div className="mt-1">
                client_mentioned: {String(Boolean(pj.client_mentioned))}; position:{" "}
                {pj.client_position ?? "—"}; strength: {pj.recommendation_strength ?? "—"}
              </div>
              <div className="mt-1">
                competitors:{" "}
                {Array.isArray(pj.competitors_mentioned) && pj.competitors_mentioned.length
                  ? pj.competitors_mentioned.join(", ")
                  : "—"}
              </div>
              <div className="mt-1">evidence: {snippet}</div>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs underline">Raw output</summary>
                <pre className="mt-1 whitespace-pre-wrap break-words text-xs">
                  {r.raw_text ?? ""}
                </pre>
              </details>
            </div>
          );
        })}
        {responses.length === 0 ? (
          <div className="text-sm text-gray-600">No responses found.</div>
        ) : null}
      </section>
    </main>
  );
}


