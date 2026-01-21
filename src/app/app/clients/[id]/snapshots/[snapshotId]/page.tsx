\"use client\";

import Link from \"next/link\";
import { useParams } from \"next/navigation\";
import { useEffect, useMemo, useState } from \"react\";

import { DownloadPdfButton } from \"@/components/DownloadPdfButton\";
import { ensureOnboarded } from \"@/lib/onboard\";
import { Alert, AlertDescription } from \"@/components/ui/Alert\";
import { Badge } from \"@/components/ui/Badge\";
import type { BadgeVariant } from \"@/components/ui/Badge\";
import { cn } from \"@/lib/cn\";

type SnapshotApiResponse = {
  snapshot: {
    id: string;
    status: string;
    vrtl_score: number | null;
    score_by_provider: Record<string, number> | null;
    created_at: string;
    started_at?: string | null;
    completed_at: string | null;
    error: string | null;
    prompt_pack_version: string | null;
    client_id: string;
  };
  client: {
    id: string;
    name: string;
    website: string | null;
    industry: string;
  };
  competitors: Array<{ id: string; name: string; website: string | null }>;
  summary: {
    responses_count: number;
    client_mentioned_count: number;
    sources_count: number;
    specific_features_count: number;
    top_competitors: Array<{ name: string; count: number }>;
  };
  responses: Array<{
    id: string;
    prompt_ordinal: number | null;
    created_at: string;
    parse_ok: boolean;
    client_mentioned: boolean;
    client_position: string | null;
    recommendation_strength: string | null;
    competitors_mentioned: string[];
    has_sources_or_citations: boolean;
    has_specific_features: boolean;
    evidence_snippet: string | null;
    // debug fields (optional)
    prompt_text?: string | null;
    raw_text?: string | null;
  }>;
  debug: { enabled: boolean; allowed: boolean; included: boolean };
};

function formatDate(d?: string | null) {
  if (!d) return \"—\";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? \"—\" : dt.toLocaleString();
}

function statusVariant(status: string | null | undefined): BadgeVariant {
  const s = String(status ?? \"\").toLowerCase();
  if (!s) return \"neutral\";
  if (s.includes(\"complete\") || s.includes(\"success\") || s.includes(\"succeed\")) return \"success\";
  if (s.includes(\"fail\") || s.includes(\"error\") || s.includes(\"cancel\")) return \"danger\";
  if (s.includes(\"running\") || s.includes(\"queued\") || s.includes(\"pending\") || s.includes(\"processing\"))
    return \"warning\";
  return \"neutral\";
}

function scoreVariant(score: number | null | undefined): BadgeVariant {
  if (typeof score !== \"number\") return \"neutral\";
  if (score >= 80) return \"success\";
  if (score >= 50) return \"warning\";
  return \"danger\";
}

function getScoreColor(score: number | null): string {
  if (score === null) return \"text-text-3\";
  if (score >= 80) return \"text-green-500\";
  if (score >= 50) return \"text-amber-500\";
  return \"text-red-500\";
}

function getScoreBg(score: number | null): string {
  if (score === null) return \"bg-surface-2\";
  if (score >= 80) return \"bg-green-500/10\";
  if (score >= 50) return \"bg-amber-500/10\";
  return \"bg-red-500/10\";
}

type CompetitorConfidence = {
  level: \"low\" | \"medium\" | \"high\";
  label: \"Low\" | \"Medium\" | \"High\";
  message: string | null;
};

function getCompetitorConfidence(count: number): CompetitorConfidence {
  if (count <= 0) {
    return {
      level: \"low\",
      label: \"Low\",
      message: \"Competitive analysis disabled — add 3+ competitors for full comparison.\"
    };
  }
  if (count < 3) {
    return {
      level: \"medium\",
      label: \"Medium\",
      message: \"Competitive analysis limited — add 1–2 more competitors for best results.\"
    };
  }
  return { level: \"high\", label: \"High\", message: null };
}

export default function SnapshotDetailPage() {
  const params = useParams<{ id: string; snapshotId: string }>();
  const clientId = useMemo(() => (typeof params?.id === \"string\" ? params.id : \"\"), [params]);
  const snapshotId = useMemo(
    () => (typeof params?.snapshotId === \"string\" ? params.snapshotId : \"\"),
    [params]
  );

  const [data, setData] = useState<SnapshotApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  async function load(nextShowDebug = showDebug) {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const qs = new URLSearchParams({ snapshotId, clientId });
      if (nextShowDebug) qs.set(\"debug\", \"1\");
      const res = await fetch(`/api/snapshots/detail?${qs.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as SnapshotApiResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!clientId || !snapshotId) return;
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, snapshotId]);

  const competitorConfidence = getCompetitorConfidence(data?.competitors?.length ?? 0);
  const providers = data?.snapshot.score_by_provider ?? null;
  const providerEntries = providers ? Object.entries(providers) : [];

  return (
    <div>
      <Link
        href={`/app/clients/${clientId}`}
        className=\"inline-flex items-center gap-2 text-sm text-text-2 transition-colors hover:text-text\"
      >
        <svg className=\"h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" strokeWidth={1.5}>
          <path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18\" />
        </svg>
        Back to client
      </Link>

      {loading ? (
        <div className=\"mt-6 space-y-4\">
          <div className=\"h-32 animate-pulse rounded-2xl bg-surface-2\" />
          <div className=\"grid gap-4 lg:grid-cols-2\">
            <div className=\"h-72 animate-pulse rounded-2xl bg-surface-2\" />
            <div className=\"h-72 animate-pulse rounded-2xl bg-surface-2\" />
          </div>
          <div className=\"h-80 animate-pulse rounded-2xl bg-surface-2\" />
        </div>
      ) : null}

      {error ? (
        <div className=\"mt-6\">
          <Alert variant=\"danger\">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {!loading && data ? (
        <div className=\"mt-6 space-y-6\">
          {/* Header */}\n
          <div className=\"overflow-hidden rounded-2xl border border-border bg-surface\">
            <div className=\"relative h-2 bg-gradient-to-r from-accent via-purple-500 to-pink-500\" />
            <div className=\"p-6\">
              <div className=\"flex flex-col gap-4 md:flex-row md:items-start md:justify-between\">
                <div className=\"min-w-0\">
                  <div className=\"inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent\">
                    Snapshot\n
                    <span className=\"font-mono text-[11px] text-accent/80\">{data.snapshot.id.slice(0, 8)}…</span>
                  </div>
                  <h1 className=\"mt-3 text-2xl font-bold tracking-tight text-text\">
                    {data.client.name}
                  </h1>
                  <div className=\"mt-2 flex flex-wrap items-center gap-2 text-sm text-text-2\">
                    <Badge variant={statusVariant(data.snapshot.status)}>{data.snapshot.status}</Badge>
                    <span className=\"text-text-3\">·</span>
                    <span>
                      <span className=\"text-text-3\">Created</span> {formatDate(data.snapshot.created_at)}
                    </span>
                    <span className=\"text-text-3\">·</span>
                    <span>
                      <span className=\"text-text-3\">Completed</span> {formatDate(data.snapshot.completed_at)}
                    </span>
                  </div>
                  {data.snapshot.prompt_pack_version ? (
                    <div className=\"mt-2 text-xs text-text-3\">
                      Prompt pack: <span className=\"font-mono\">{data.snapshot.prompt_pack_version}</span>
                    </div>
                  ) : null}
                </div>

                <div className=\"flex flex-col gap-3 sm:flex-row sm:items-center\">
                  <DownloadPdfButton snapshotId={data.snapshot.id} />
                  {data.debug.allowed ? (
                    <button
                      type=\"button\"
                      onClick={() => {
                        const next = !showDebug;
                        setShowDebug(next);
                        void load(next);
                      }}
                      className={cn(
                        \"rounded-xl border px-4 py-2 text-sm font-medium transition-colors\",
                        showDebug
                          ? \"border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/15\"
                          : \"border-border text-text-2 hover:bg-surface-2\"
                      )}
                      title={
                        data.debug.enabled
                          ? \"Show internal debug fields (prompts/raw model output)\"
                          : \"Enable VRTL_ENABLE_DEBUG_RESPONSES=1 to allow debug\"
                      }
                      disabled={!data.debug.enabled}
                    >
                      {showDebug ? \"Hide debug\" : \"Show debug\"}
                    </button>
                  ) : null}
                </div>
              </div>

              {data.snapshot.error ? (
                <div className=\"mt-4\">
                  <Alert variant=\"danger\">
                    <AlertDescription>Error: {data.snapshot.error}</AlertDescription>
                  </Alert>
                </div>
              ) : null}
            </div>
          </div>

          {/* Summary grid */}\n
          <div className=\"grid gap-4 lg:grid-cols-3\">
            <div className=\"rounded-2xl border border-border bg-surface p-5\">
              <div className=\"text-sm font-medium text-text-2\">Overall score</div>
              <div className={cn(\"mt-2 text-4xl font-bold\", getScoreColor(data.snapshot.vrtl_score))}>
                {data.snapshot.vrtl_score ?? \"—\"}
              </div>
              <div className=\"mt-2 inline-flex items-center gap-2 text-xs text-text-3\">
                <span className={cn(\"h-2 w-2 rounded-full\", competitorConfidence.level === \"high\" ? \"bg-green-500\" : competitorConfidence.level === \"medium\" ? \"bg-amber-500\" : \"bg-red-500\")} />
                Confidence: {competitorConfidence.label}
              </div>
              {competitorConfidence.message ? (
                <div className=\"mt-2 text-xs text-text-3\">{competitorConfidence.message}</div>
              ) : null}
            </div>

            <div className=\"rounded-2xl border border-border bg-surface p-5\">
              <div className=\"text-sm font-medium text-text-2\">Coverage</div>
              <div className=\"mt-3 grid grid-cols-3 gap-2\">
                <div className=\"rounded-xl bg-surface-2 px-3 py-2 text-center\">
                  <div className=\"text-xs text-text-3\">Responses</div>
                  <div className=\"text-lg font-bold text-text\">{data.summary.responses_count}</div>
                </div>
                <div className=\"rounded-xl bg-surface-2 px-3 py-2 text-center\">
                  <div className=\"text-xs text-text-3\">Mentions</div>
                  <div className=\"text-lg font-bold text-text\">{data.summary.client_mentioned_count}</div>
                </div>
                <div className=\"rounded-xl bg-surface-2 px-3 py-2 text-center\">
                  <div className=\"text-xs text-text-3\">Competitors</div>
                  <div className=\"text-lg font-bold text-text\">{data.competitors.length}</div>
                </div>
              </div>
              <div className=\"mt-3 text-xs text-text-3\">
                Sources in {data.summary.sources_count} · Specific features in {data.summary.specific_features_count}
              </div>
            </div>

            <div className=\"rounded-2xl border border-border bg-surface p-5\">
              <div className=\"text-sm font-medium text-text-2\">Providers</div>
              {providerEntries.length ? (
                <div className=\"mt-3 grid grid-cols-3 gap-2\">
                  {providerEntries.map(([provider, score]) => (
                    <div key={provider} className={cn(\"rounded-xl px-3 py-2 text-center\", getScoreBg(score))}>
                      <div className=\"text-xs text-text-3 capitalize\">{provider}</div>
                      <div className={cn(\"text-lg font-bold\", getScoreColor(score))}>{score}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className=\"mt-3 text-sm text-text-3\">—</div>
              )}
            </div>
          </div>

          {/* Top competitors */}\n
          <div className=\"rounded-2xl border border-border bg-surface p-6\">
            <div className=\"flex items-start justify-between gap-4\">
              <div>
                <h2 className=\"text-lg font-semibold text-text\">Competitive landscape</h2>
                <p className=\"mt-1 text-sm text-text-2\">Most frequently mentioned alternatives in this snapshot.</p>
              </div>
              {data.client.website ? (
                <a
                  href={data.client.website}
                  target=\"_blank\"
                  rel=\"noreferrer\"
                  className=\"inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-2 hover:bg-surface-2\"
                >
                  <svg className=\"h-4 w-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\" strokeWidth={1.5}>
                    <path strokeLinecap=\"round\" strokeLinejoin=\"round\" d=\"M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418\" />
                  </svg>
                  Visit site
                </a>
              ) : null}
            </div>

            <div className=\"mt-4 flex flex-wrap gap-2\">
              {data.summary.top_competitors.length ? (
                data.summary.top_competitors.map((c) => (
                  <span
                    key={c.name}
                    className=\"inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3 py-1 text-sm text-text\"
                  >
                    {c.name}
                    <span className=\"rounded-full bg-bg px-2 py-0.5 text-xs text-text-2\">{c.count}</span>
                  </span>
                ))
              ) : (
                <span className=\"text-sm text-text-3\">No competitor mentions found in responses.</span>
              )}
            </div>
          </div>

          {/* Insights */}\n
          <div className=\"overflow-hidden rounded-2xl border border-border bg-surface\">
            <div className=\"border-b border-border bg-surface-2/50 px-6 py-4\">
              <h2 className=\"text-lg font-semibold text-text\">Insights</h2>
              <p className=\"mt-1 text-sm text-text-2\">
                Clear, client-friendly takeaways (raw model output is hidden by default).
              </p>
            </div>

            <div className=\"divide-y divide-border\">
              {data.responses.map((r) => (
                <div key={r.id} className=\"px-6 py-5\">
                  <div className=\"flex flex-wrap items-center justify-between gap-3\">
                    <div className=\"flex items-center gap-2 text-sm text-text-2\">
                      <span className=\"rounded-lg bg-surface-2 px-2 py-1 text-xs font-medium text-text-2\">
                        Prompt #{r.prompt_ordinal ?? \"—\"}
                      </span>
                      <span className=\"text-text-3\">·</span>
                      <Badge variant={r.parse_ok ? \"success\" : \"danger\"}>{r.parse_ok ? \"parsed\" : \"failed\"}</Badge>
                      {r.client_mentioned ? (
                        <span className=\"inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600\">
                          <span className=\"h-1.5 w-1.5 rounded-full bg-green-500\" /> Mentioned
                        </span>
                      ) : (
                        <span className=\"inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2 py-1 text-xs font-medium text-slate-500\">
                          <span className=\"h-1.5 w-1.5 rounded-full bg-slate-400\" /> Not mentioned
                        </span>
                      )}
                    </div>
                    <div className=\"text-xs text-text-3\">{formatDate(r.created_at)}</div>
                  </div>

                  <div className=\"mt-3 grid gap-3 sm:grid-cols-3\">
                    <div className=\"rounded-xl bg-surface-2/60 px-4 py-3\">
                      <div className=\"text-xs text-text-3\">Position</div>
                      <div className=\"mt-1 text-sm font-medium text-text\">{r.client_position ?? \"—\"}</div>
                    </div>
                    <div className=\"rounded-xl bg-surface-2/60 px-4 py-3\">
                      <div className=\"text-xs text-text-3\">Strength</div>
                      <div className=\"mt-1 text-sm font-medium text-text\">{r.recommendation_strength ?? \"—\"}</div>
                    </div>
                    <div className=\"rounded-xl bg-surface-2/60 px-4 py-3\">
                      <div className=\"text-xs text-text-3\">Signals</div>
                      <div className=\"mt-1 flex flex-wrap gap-2\">
                        <span
                          className={cn(
                            \"rounded-full px-2 py-0.5 text-xs font-medium\",
                            r.has_sources_or_citations ? \"bg-blue-500/10 text-blue-600\" : \"bg-slate-500/10 text-slate-500\"
                          )}
                        >
                          {r.has_sources_or_citations ? \"Has sources\" : \"No sources\"}
                        </span>
                        <span
                          className={cn(
                            \"rounded-full px-2 py-0.5 text-xs font-medium\",
                            r.has_specific_features ? \"bg-purple-500/10 text-purple-600\" : \"bg-slate-500/10 text-slate-500\"
                          )}
                        >
                          {r.has_specific_features ? \"Specific features\" : \"Generic\"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className=\"mt-3 text-sm text-text-2\">
                    <span className=\"font-medium text-text\">Evidence:</span>{\" \"}
                    {r.evidence_snippet ? r.evidence_snippet : \"—\"}
                  </div>

                  {r.competitors_mentioned.length ? (
                    <div className=\"mt-3 flex flex-wrap gap-2\">
                      {r.competitors_mentioned.slice(0, 8).map((name) => (
                        <span
                          key={name}
                          className=\"rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-text-2\"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {showDebug && (r.prompt_text || r.raw_text) ? (
                    <details className=\"mt-4 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3\">
                      <summary className=\"cursor-pointer text-sm font-medium text-red-600\">
                        Debug details (internal)
                      </summary>
                      {r.prompt_text ? (
                        <div className=\"mt-3\">
                          <div className=\"text-xs font-medium text-red-600/80\">Prompt</div>
                          <div className=\"mt-1 text-xs text-text-2\">{r.prompt_text}</div>
                        </div>
                      ) : null}
                      {r.raw_text ? (
                        <div className=\"mt-3\">
                          <div className=\"text-xs font-medium text-red-600/80\">Raw output</div>
                          <pre className=\"mt-1 max-h-[320px] overflow-auto whitespace-pre-wrap break-words rounded-lg bg-bg p-3 text-xs text-text-2\">
                            {r.raw_text}
                          </pre>
                        </div>
                      ) : null}
                    </details>
                  ) : null}
                </div>
              ))}

              {data.responses.length === 0 ? (
                <div className=\"px-6 py-12 text-center text-sm text-text-2\">No responses found.</div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}


