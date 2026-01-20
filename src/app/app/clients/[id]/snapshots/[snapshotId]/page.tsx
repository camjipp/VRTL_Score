import Link from "next/link";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { DownloadPdfButton } from "@/components/DownloadPdfButton";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

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
  prompt_ordinal: number | null;
  prompt_text: string | null;
  parse_ok: boolean | null;
  parsed_json: ParsedJson | null;
  raw_text: string | null;
  created_at: string;
};

type ParsedJson = {
  client_mentioned?: boolean;
  client_position?: string;
  recommendation_strength?: string;
  evidence_snippet?: string;
  competitors_mentioned?: string[];
  has_sources_or_citations?: boolean;
  has_specific_features?: boolean;
};

type PageProps = {
  params: Promise<{
    id: string;
    snapshotId: string;
  }>;
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

function statusVariant(status: string | null | undefined): BadgeVariant {
  const s = String(status ?? "").toLowerCase();
  if (!s) return "neutral";
  if (s.includes("complete") || s.includes("success") || s.includes("succeed")) return "success";
  if (s.includes("fail") || s.includes("error") || s.includes("cancel")) return "danger";
  if (s.includes("running") || s.includes("queued") || s.includes("pending") || s.includes("processing"))
    return "warning";
  return "neutral";
}

function scoreVariant(score: number | null | undefined): BadgeVariant {
  if (typeof score !== "number") return "neutral";
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

function truncateText(text: string, len = 180) {
  if (text.length <= len) return text;
  return `${text.slice(0, len)}…`;
}

type CompetitorConfidence = {
  level: "low" | "medium" | "high";
  label: "Low" | "Medium" | "High";
  message: string | null;
};

function getCompetitorConfidence(count: number): CompetitorConfidence {
  if (count <= 0) {
    return {
      level: "low",
      label: "Low",
      message: "Competitive analysis disabled — add 3+ competitors for full comparison."
    };
  }
  if (count < 3) {
    return {
      level: "medium",
      label: "Medium",
      message: "Competitive analysis limited — add 1–2 more competitors for best results."
    };
  }
  return { level: "high", label: "High", message: null };
}

export default async function SnapshotDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const clientId = resolvedParams.id;
  const snapshotId = resolvedParams.snapshotId;
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
      <main>
        <Alert variant="danger">
          <AlertDescription>Snapshot not found.</AlertDescription>
        </Alert>
      </main>
    );
  }
  if (snapRes.data.client_id !== clientId) {
    return (
      <main>
        <Alert variant="danger">
          <AlertDescription>Snapshot does not belong to this client.</AlertDescription>
        </Alert>
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
  const competitorConfidence = getCompetitorConfidence(competitors.length);

  // Fetch responses
  const responsesRes = await supabase
    .from("responses")
    .select(
      "id,prompt_ordinal,prompt_text,parse_ok,parsed_json,raw_text,created_at"
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

  const providersString = summarizeProviders(snapshot.score_by_provider);

  return (
    <main className="space-y-6">
      <div className="text-sm">
        <Link
          className="text-accent underline underline-offset-4 hover:text-accent-2"
          href={`/app/clients/${clientId}`}
        >
          ← Back to client
        </Link>
      </div>

      <section>
        <Card className="p-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold">
              Snapshot {snapshot.id.slice(0, 8)}… {client ? `for ${client.name}` : ""}
            </h1>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-2">
              <span className="inline-flex items-center gap-2">
                <span className="text-text-3">Status</span>
                <Badge variant={statusVariant(snapshot.status)}>{snapshot.status}</Badge>
              </span>
              <span className="text-text-3">·</span>
              <span>
                <span className="text-text-3">Created</span> {formatDate(snapshot.created_at)}
              </span>
              <span className="text-text-3">·</span>
              <span>
                <span className="text-text-3">Completed</span> {formatDate(snapshot.completed_at)}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-text">
                Overall <span className="marker-underline">score</span>
              </div>
              <Badge variant={scoreVariant(snapshot.vrtl_score)}>
                {snapshot.vrtl_score == null ? "—" : snapshot.vrtl_score}
              </Badge>
            </div>

            {competitorConfidence.level !== "high" ? (
              <div className="text-sm text-text-2">
                Score confidence: {competitorConfidence.label} due to limited competitor set.
              </div>
            ) : null}

            <div className="text-sm text-text-2">
              <span className="text-text-3">Providers</span>{" "}
              <span
                className="inline-block max-w-[360px] truncate align-bottom"
                title={providersString !== "—" ? providersString : undefined}
              >
                {providersString}
              </span>
            </div>

            <div className="text-sm text-text-2">
              <span className="text-text-3">Prompt pack</span> {snapshot.prompt_pack_version ?? "—"}
            </div>

            {client ? (
              <div className="text-sm text-text-2">
                <span className="text-text-3">Client site</span>{" "}
                {client.website ? (
                  <a
                    className="text-accent underline underline-offset-4 hover:text-accent-2"
                    href={client.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {client.website}
                  </a>
                ) : (
                  "—"
                )}
              </div>
            ) : null}

            <div className="text-sm text-text-2">
              <span className="text-text-3">Competitors</span>{" "}
              {competitors.length ? competitors.map((c) => c.name).join(", ") : "none"}
            </div>

            {competitorConfidence.message ? (
              <div className="mt-2">
                <Alert variant="warning">
                  <AlertDescription>{competitorConfidence.message}</AlertDescription>
                </Alert>
              </div>
            ) : null}

            <DownloadPdfButton snapshotId={snapshot.id} />

            {snapshot.error ? (
              <div className="mt-2">
                <Alert variant="danger">
                  <AlertDescription>Error: {snapshot.error}</AlertDescription>
                </Alert>
              </div>
            ) : null}
          </div>
        </Card>
      </section>

      <section>
        <Card className="p-5">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Competitive summary</h2>
            <div className="text-sm text-text-2">
              Client mentioned/recommended in {clientMentionedCount} response(s)
            </div>
            <div className="text-sm text-text-2">Top competitors mentioned:</div>
            <ul className="ml-4 list-disc text-sm text-text-2">
              {topCompetitors.length === 0 ? (
                <li className="text-text-3">None</li>
              ) : (
                topCompetitors.map(([name, count]) => (
                  <li key={name}>
                    <span className="text-text">{name}</span>: {count}
                  </li>
                ))
              )}
            </ul>
          </div>
        </Card>
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
            <Card key={r.id} className="p-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-3">
                <span>prompt #{String(r.prompt_ordinal ?? "—")}</span>
                <span>·</span>
                <span className="text-text-2">{r.prompt_text ?? "Prompt"}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-2">
                  <span>parse_ok</span>
                  <Badge variant={r.parse_ok ? "success" : "danger"}>{String(Boolean(r.parse_ok))}</Badge>
                </span>
              </div>

              <div className="mt-2 text-sm text-text-2">
                <span className="text-text-3">client_mentioned</span>{" "}
                <span className="text-text">{String(Boolean(pj.client_mentioned))}</span>
                <span className="text-text-3">; position</span> {pj.client_position ?? "—"}
                <span className="text-text-3">; strength</span> {pj.recommendation_strength ?? "—"}
              </div>

              <div className="mt-2 text-sm text-text-2">
                <span className="text-text-3">competitors</span>{" "}
                {Array.isArray(pj.competitors_mentioned) && pj.competitors_mentioned.length
                  ? pj.competitors_mentioned.join(", ")
                  : "—"}
              </div>

              <div className="mt-2 text-sm text-text-2">
                <span className="text-text-3">evidence</span> {snippet}
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-accent underline underline-offset-4 hover:text-accent-2">
                  Raw output
                </summary>
                <pre className="mt-2 max-h-[320px] overflow-auto whitespace-pre-wrap break-words text-xs text-text-2">
                  {r.raw_text ?? ""}
                </pre>
              </details>
            </Card>
          );
        })}
        {responses.length === 0 ? (
          <div className="text-sm text-text-2">No responses found.</div>
        ) : null}
      </section>
    </main>
  );
}


