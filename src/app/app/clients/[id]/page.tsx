"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

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
  started_at?: string | null;
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

function getScoreColor(score: number | null): string {
  if (score === null) return "text-text-3";
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getScoreBg(score: number | null): string {
  if (score === null) return "bg-surface-2";
  if (score >= 80) return "bg-green-500/10";
  if (score >= 50) return "bg-amber-500/10";
  return "bg-red-500/10";
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);

  const supabase = getSupabaseBrowserClient();

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

    const snapsRes = await supabase
      .from("snapshots")
      .select("id,status,vrtl_score,score_by_provider,started_at,completed_at,created_at,error")
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

  useEffect(() => {
    if (!agencyId) return;
    if (snapshot?.status !== "running") return;
    let cancelled = false;
    const t = window.setInterval(() => {
      if (cancelled) return;
      refresh(agencyId).catch((e) => {
        if (!cancelled) setError(errorMessage(e));
      });
    }, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, snapshot?.status]);

  async function resetRunningSnapshot() {
    if (!clientId) return;
    if (!agencyId) return;
    const ok = window.confirm(
      "Reset the currently running snapshot? This marks it as failed so you can run again."
    );
    if (!ok) return;

    setRunError(null);
    setRunning(true);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/snapshots/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ clientId })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Reset failed (${res.status})`);
      }
      await refresh(agencyId);
    } catch (e) {
      setRunError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

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
        const contentType = res.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const json = (await res.json()) as { error?: string; [k: string]: unknown };
          throw new Error(json.error ? String(json.error) : `Snapshot failed (${res.status})`);
        }
        const text = await res.text();
        throw new Error(text || `Snapshot failed (${res.status})`);
      }
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
    <div>
      {/* Back link */}
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-sm text-text-2 transition-colors hover:text-text"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to clients
      </Link>

      {/* Loading */}
      {loading && (
        <div className="mt-8 space-y-4">
          <div className="h-32 animate-pulse rounded-2xl bg-surface-2" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
            <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-6">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Not found */}
      {!loading && !error && !client && (
        <div className="mt-8 rounded-2xl border border-border bg-surface-2/50 py-12 text-center">
          <p className="text-text-2">Client not found (or not in your agency).</p>
        </div>
      )}

      {client && (
        <>
          {/* Client header */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="relative h-2 bg-gradient-to-r from-accent via-purple-500 to-pink-500" />
            <div className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple-500 text-lg font-bold text-white">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-text">{client.name}</h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-2">
                      {client.website && (
                        <span className="flex items-center gap-1">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                          </svg>
                          {client.website.replace(/^https?:\/\//, "")}
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-medium capitalize">
                        {client.industry.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text">{competitors.length}</div>
                    <div className="text-xs text-text-3">Competitors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-text">{snapshots.length}</div>
                    <div className="text-xs text-text-3">Snapshots</div>
                  </div>
                  {snapshot?.vrtl_score !== null && snapshot?.vrtl_score !== undefined && (
                    <div className="text-center">
                      <div className={cn("text-2xl font-bold", getScoreColor(snapshot.vrtl_score))}>
                        {snapshot.vrtl_score}
                      </div>
                      <div className="text-xs text-text-3">VRTL Score</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Competitors card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-text">Competitors</h2>
                    <p className="text-xs text-text-3">{competitors.length}/8 added</p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                  competitorConfidence.level === "high" ? "bg-green-500/10 text-green-600" :
                  competitorConfidence.level === "medium" ? "bg-amber-500/10 text-amber-600" :
                  "bg-red-500/10 text-red-600"
                )}>
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    competitorConfidence.level === "high" ? "bg-green-500" :
                    competitorConfidence.level === "medium" ? "bg-amber-500" :
                    "bg-red-500"
                  )} />
                  {competitorConfidence.label} confidence
                </div>
              </div>

              <div className="p-6">
                {/* Competitor list */}
                {competitors.length > 0 ? (
                  <div className="space-y-2">
                    {competitors.map((c) => (
                      <div
                        key={c.id}
                        className="group flex items-center justify-between rounded-xl bg-surface-2/50 px-4 py-3"
                      >
                        <div>
                          <div className="font-medium text-text">{c.name}</div>
                          <div className="text-xs text-text-3">
                            {c.website ? c.website.replace(/^https?:\/\//, "") : "No website"}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteCompetitor(c.id)}
                          disabled={busy}
                          className="rounded-lg p-2 text-text-3 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border-2 border-dashed border-border py-6 text-center">
                    <p className="text-sm text-text-2">No competitors yet</p>
                    <p className="mt-1 text-xs text-text-3">Add competitors to improve scoring accuracy</p>
                  </div>
                )}

                {/* Add competitor form */}
                {competitors.length < 8 && (
                  <form className="mt-4 space-y-3" onSubmit={addCompetitor}>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder="Competitor name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        disabled={busy}
                        className="rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                      <input
                        type="text"
                        placeholder="Website (optional)"
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        disabled={busy}
                        className="rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busy || !newName.trim()}
                      className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      {busy ? "Adding..." : "Add competitor"}
                    </button>
                  </form>
                )}

                {competitors.length >= 8 && (
                  <div className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm text-amber-600">
                    Maximum of 8 competitors reached
                  </div>
                )}
              </div>
            </div>

            {/* Snapshot card */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-text">Latest Snapshot</h2>
                    <p className="text-xs text-text-3">AI-powered competitive analysis</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Run controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={runSnapshot}
                    disabled={running}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-2 hover:shadow-xl hover:shadow-accent/30 disabled:opacity-50"
                  >
                    {running ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Running...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                        Run Snapshot
                      </>
                    )}
                  </button>
                  {snapshot?.status === "running" && (
                    <button
                      onClick={resetRunningSnapshot}
                      disabled={running}
                      className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {runError && (
                  <div className="mt-4">
                    <Alert variant="danger">
                      <AlertDescription>{runError}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {competitorConfidence.message && (
                  <div className="mt-4 rounded-xl bg-amber-500/10 px-4 py-3 text-sm">
                    <div className="font-medium text-amber-600">Confidence: {competitorConfidence.label}</div>
                    <div className="mt-1 text-amber-600/80">{competitorConfidence.message}</div>
                  </div>
                )}

                {/* Latest snapshot result */}
                {snapshot ? (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm text-text-2">
                      <Badge variant={statusVariant(snapshot.status)}>{snapshot.status}</Badge>
                      <span>·</span>
                      <span>
                        {snapshot.completed_at
                          ? new Date(snapshot.completed_at).toLocaleString()
                          : snapshot.started_at
                          ? `Started ${new Date(snapshot.started_at).toLocaleString()}`
                          : new Date(snapshot.created_at).toLocaleString()}
                      </span>
                    </div>

                    {snapshot.vrtl_score !== null && (
                      <div className={cn("mt-4 rounded-xl p-4", getScoreBg(snapshot.vrtl_score))}>
                        <div className="text-sm font-medium text-text-2">VRTL Score</div>
                        <div className={cn("text-4xl font-bold", getScoreColor(snapshot.vrtl_score))}>
                          {snapshot.vrtl_score}
                        </div>
                      </div>
                    )}

                    {snapshot.score_by_provider && Object.keys(snapshot.score_by_provider).length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium text-text-2">By Provider</div>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {Object.entries(snapshot.score_by_provider).map(([provider, score]) => (
                            <div key={provider} className="rounded-lg bg-surface-2 px-3 py-2 text-center">
                              <div className="text-xs text-text-3 capitalize">{provider}</div>
                              <div className={cn("font-bold", getScoreColor(score))}>{score}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {competitorMentions.length > 0 && (
                      <div className="mt-4 text-sm">
                        <span className="font-medium text-text-2">Competitors mentioned:</span>{" "}
                        <span className="text-text-3">{competitorMentions.join(", ")}</span>
                      </div>
                    )}

                    {snapshot.error && (
                      <div className="mt-4">
                        <Alert variant="danger">
                          <AlertDescription>Error: {snapshot.error}</AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-6 rounded-xl border-2 border-dashed border-border py-6 text-center">
                    <p className="text-sm text-text-2">No snapshots yet</p>
                    <p className="mt-1 text-xs text-text-3">Run your first snapshot to get competitive insights</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Snapshot history */}
          {snapshots.length > 0 && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border bg-surface-2/50 px-6 py-4">
                <h2 className="font-semibold text-text">Snapshot History</h2>
              </div>
              <div className="divide-y divide-border">
                {snapshots.map((s) => (
                  <Link
                    key={s.id}
                    href={`/app/clients/${clientId}/snapshots/${s.id}`}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-surface-2/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", getScoreBg(s.vrtl_score))}>
                        <span className={cn("text-lg font-bold", getScoreColor(s.vrtl_score))}>
                          {s.vrtl_score ?? "—"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                          {s.score_by_provider && (
                            <span className="text-xs text-text-3">
                              {Object.keys(s.score_by_provider).length} providers
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-text-2">
                          {new Date(s.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <svg className="h-5 w-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
