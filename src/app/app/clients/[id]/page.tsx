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

function getScoreColor(score: number | null): string {
  if (score === null) return "text-text-3";
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function getScoreBorder(score: number | null): string {
  if (score === null) return "border-[#E5E5E5]";
  if (score >= 80) return "border-emerald-200";
  if (score >= 50) return "border-amber-200";
  return "border-red-200";
}

function getScoreRing(score: number | null): string {
  if (score === null) return "#e5e5e5";
  if (score >= 80) return "#059669";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

// Big animated score circle
function BigScoreCircle({ score }: { score: number | null }) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const pct = score !== null ? score / 100 : 0;
  const dash = c * pct;
  const color = getScoreRing(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 160 160">
        {/* Background ring */}
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="12"
        />
        {/* Progress ring */}
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-5xl font-bold" style={{ color }}>
          {score ?? "—"}
        </span>
        <span className="text-sm text-text-3">VRTL Score</span>
      </div>
    </div>
  );
}

// Mini sparkline-style trend indicator
function TrendIndicator({ snapshots }: { snapshots: SnapshotRow[] }) {
  const scores = snapshots
    .slice(0, 5)
    .map((s) => s.vrtl_score)
    .filter((s): s is number => s !== null)
    .reverse();

  if (scores.length < 2) {
    return <span className="text-xs text-text-3">Not enough data</span>;
  }

  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  const points = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * 60;
    const y = 20 - ((s - min) / range) * 16;
    return `${x},${y}`;
  }).join(" ");

  const trend = scores[scores.length - 1] - scores[0];
  const trendColor = trend > 0 ? "#059669" : trend < 0 ? "#dc2626" : "#6b7280";

  return (
    <div className="flex items-center gap-2">
      <svg className="h-6 w-16" viewBox="0 0 60 24">
        <polyline
          points={points}
          fill="none"
          stroke={trendColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn("text-xs font-medium", trend > 0 ? "text-emerald-600" : trend < 0 ? "text-red-600" : "text-text-3")}>
        {trend > 0 ? `+${trend}` : trend}
      </span>
    </div>
  );
}

// Provider score bar with icon
function ProviderBar({ provider, score }: { provider: string; score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium capitalize text-[#0A0A0A]">{provider}</span>
        <span className={cn("text-lg font-bold", getScoreColor(score))}>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-[#E5E5E5]">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = useMemo(() => (typeof params?.id === "string" ? params.id : ""), [params]);

  const supabase = getSupabaseBrowserClient();

  function statusVariant(status: string | null | undefined): BadgeVariant {
    const s = String(status ?? "").toLowerCase();
    if (!s) return "neutral";
    if (s.includes("complete") || s.includes("success")) return "success";
    if (s.includes("fail") || s.includes("error") || s.includes("cancel")) return "danger";
    if (s.includes("running") || s.includes("queued") || s.includes("pending")) return "warning";
    return "neutral";
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
      setSnapshot(rows[0] ?? null);
    } else {
      setSnapshot(null);
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
    return () => { cancelled = true; };
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
    return () => { cancelled = true; window.clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agencyId, snapshot?.status]);

  async function resetRunningSnapshot() {
    if (!clientId || !agencyId) return;
    const ok = window.confirm("Reset the currently running snapshot? This marks it as failed so you can run again.");
    if (!ok) return;

    setRunError(null);
    setRunning(true);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/snapshots/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ clientId })
      });
      if (!res.ok) throw new Error(await res.text());
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ clientId })
      });
      if (!res.ok) {
        const ct = res.headers.get("content-type") ?? "";
        if (ct.includes("application/json")) {
          const json = await res.json();
          throw new Error(json.error || `Failed (${res.status})`);
        }
        throw new Error(await res.text());
      }
      await refresh(agencyId ?? "");
    } catch (e) {
      setRunError(errorMessage(e));
    } finally {
      setRunning(false);
    }
  }

  async function addCompetitor(e: React.FormEvent) {
    e.preventDefault();
    if (!agencyId || competitors.length >= 8) return;
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

  const providers = snapshot?.score_by_provider ? Object.entries(snapshot.score_by_provider) : [];
  const competitorConfidence = competitors.length >= 3 ? "high" : competitors.length > 0 ? "medium" : "low";
  const avgScore = snapshots.length > 0
    ? Math.round(snapshots.filter(s => s.vrtl_score !== null).reduce((a, s) => a + (s.vrtl_score ?? 0), 0) / snapshots.filter(s => s.vrtl_score !== null).length) || null
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-[#666] hover:text-[#0A0A0A]">Dashboard</Link>
        <span className="text-[#999]">/</span>
        <span className="text-[#0A0A0A]">{client?.name || "Client"}</span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-[#F5F5F5]" />
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-xl bg-[#F5F5F5]" />
            <div className="h-80 animate-pulse rounded-xl bg-[#F5F5F5] lg:col-span-2" />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {/* Not found */}
      {!loading && !error && !client && (
        <div className="rounded-xl border border-[#E5E5E5] bg-white py-16 text-center">
          <p className="text-[#666]">Client not found (or not in your agency).</p>
          <Link href="/app" className="mt-4 inline-block text-sm text-[#0A0A0A] hover:underline">
            Back to dashboard
          </Link>
        </div>
      )}

      {client && (
        <>
          {/* Hero header */}
          <div className={cn("rounded-2xl border bg-white p-6", getScoreBorder(snapshot?.vrtl_score ?? null))}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                {/* Score circle */}
                <BigScoreCircle score={snapshot?.vrtl_score ?? null} />
                
                {/* Client info */}
                <div>
                  <h1 className="text-2xl font-bold text-[#0A0A0A]">{client.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#666]">
                    {client.website && (
                      <a
                        href={client.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] px-3 py-1 hover:bg-[#F5F5F5]"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        {client.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </a>
                    )}
                    <span className="rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] px-3 py-1 capitalize">
                      {client.industry.replace(/_/g, " ")}
                    </span>
                  </div>
                  
                  {/* Trend */}
                  {snapshots.length > 1 && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-[#999]">Trend:</span>
                      <TrendIndicator snapshots={snapshots} />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {snapshot?.status === "running" && (
                  <button
                    onClick={resetRunningSnapshot}
                    disabled={running}
                    className="rounded-lg border border-[#E5E5E5] bg-white px-5 py-2.5 text-sm font-medium text-[#666] transition-all hover:bg-[#F5F5F5]"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={runSnapshot}
                  disabled={running}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0A0A0A] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1a1a1a] disabled:opacity-50"
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
              </div>
            </div>

            {runError && (
              <div className="mt-4">
                <Alert variant="danger">
                  <AlertDescription>{runError}</AlertDescription>
                </Alert>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#666]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0A0A0A]">{competitors.length}</div>
                  <div className="text-xs text-[#999]">Competitors</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#666]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#0A0A0A]">{snapshots.length}</div>
                  <div className="text-xs text-[#999]">Snapshots</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#666]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className={cn("text-2xl font-bold", getScoreColor(avgScore))}>{avgScore ?? "—"}</div>
                  <div className="text-xs text-[#999]">Avg Score</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  competitorConfidence === "high" ? "bg-emerald-50 text-emerald-600" :
                  competitorConfidence === "medium" ? "bg-amber-50 text-amber-600" :
                  "bg-red-50 text-red-600"
                )}>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                </div>
                <div>
                  <div className={cn(
                    "text-2xl font-bold capitalize",
                    competitorConfidence === "high" ? "text-emerald-600" :
                    competitorConfidence === "medium" ? "text-amber-600" :
                    "text-red-600"
                  )}>
                    {competitorConfidence}
                  </div>
                  <div className="text-xs text-[#999]">Confidence</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Provider scores */}
            <div className="space-y-6">
              {/* Provider scores */}
              {providers.length > 0 && (
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
                  <h2 className="mb-4 font-semibold text-[#0A0A0A]">Score by Provider</h2>
                  <div className="space-y-3">
                    {providers.map(([provider, score]) => (
                      <ProviderBar key={provider} provider={provider} score={score} />
                    ))}
                  </div>
                </div>
              )}

              {/* Quick stats */}
              {snapshot && (
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
                  <h2 className="mb-4 font-semibold text-[#0A0A0A]">Latest Snapshot</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#999]">Status</span>
                      <Badge variant={statusVariant(snapshot.status)}>{snapshot.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#999]">Date</span>
                      <span className="text-[#0A0A0A]">{new Date(snapshot.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#999]">Providers</span>
                      <span className="text-[#0A0A0A]">{providers.length}</span>
                    </div>
                  </div>
                  <Link
                    href={`/app/clients/${clientId}/snapshots/${snapshot.id}`}
                    className="mt-4 block rounded-lg bg-[#0A0A0A] py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a]"
                  >
                    View Full Report →
                  </Link>
                </div>
              )}
            </div>

            {/* Right column - Competitors + History */}
            <div className="space-y-6 lg:col-span-2">
              {/* Competitors */}
              <div className="rounded-xl border border-[#E5E5E5] bg-white">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-[#0A0A0A]">Competitors</h2>
                    <p className="text-xs text-[#999]">{competitors.length}/8 tracked · {8 - competitors.length} slots available</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
                    competitorConfidence === "high" ? "bg-emerald-50 text-emerald-700" :
                    competitorConfidence === "medium" ? "bg-amber-50 text-amber-700" :
                    "bg-red-50 text-red-700"
                  )}>
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      competitorConfidence === "high" ? "bg-emerald-500" :
                      competitorConfidence === "medium" ? "bg-amber-500" :
                      "bg-red-500"
                    )} />
                    {competitorConfidence === "high" ? "High confidence" : competitorConfidence === "medium" ? "Add more" : "Low confidence"}
                  </div>
                </div>

                <div className="p-5">
                  {competitors.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {competitors.map((c) => (
                        <div
                          key={c.id}
                          className="group relative flex items-center gap-3 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] p-4 transition-colors hover:border-[#ccc]"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A0A0A] text-sm font-bold text-white">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[#0A0A0A]">{c.name}</div>
                            <div className="truncate text-xs text-[#999]">
                              {c.website ? c.website.replace(/^https?:\/\//, "") : "No website"}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteCompetitor(c.id)}
                            disabled={busy}
                            className="absolute right-2 top-2 rounded-lg p-1.5 text-[#999] opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-[#E5E5E5] py-8 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F5F5F5]">
                        <svg className="h-6 w-6 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-[#0A0A0A]">No competitors yet</p>
                      <p className="mt-1 text-xs text-[#999]">Add competitors for better analysis</p>
                    </div>
                  )}

                  {/* Add competitor form */}
                  {competitors.length < 8 && (
                    <form className="mt-4 flex gap-2" onSubmit={addCompetitor}>
                      <input
                        type="text"
                        placeholder="Competitor name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        disabled={busy}
                        className="flex-1 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#999] focus:border-[#0A0A0A] focus:outline-none"
                      />
                      <input
                        type="url"
                        placeholder="https://competitor.com"
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        required
                        disabled={busy}
                        className="flex-1 rounded-lg border border-[#E5E5E5] bg-[#FAFAF8] px-4 py-2.5 text-sm text-[#0A0A0A] placeholder:text-[#999] focus:border-[#0A0A0A] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={busy || !newName.trim()}
                        className="rounded-lg bg-[#0A0A0A] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a1a1a] disabled:opacity-50"
                      >
                        Add
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Snapshot history */}
              <div className="rounded-xl border border-[#E5E5E5] bg-white">
                <div className="border-b border-[#E5E5E5] px-5 py-4">
                  <h2 className="font-semibold text-[#0A0A0A]">Snapshot History</h2>
                  <p className="text-xs text-[#999]">Recent analysis runs</p>
                </div>

                {snapshots.length > 0 ? (
                  <div className="divide-y divide-[#E5E5E5]">
                    {snapshots.map((s) => (
                      <Link
                        key={s.id}
                        href={`/app/clients/${clientId}/snapshots/${s.id}`}
                        className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[#FAFAF8]"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-lg text-lg font-bold",
                            s.vrtl_score !== null
                              ? s.vrtl_score >= 80 ? "bg-emerald-50 text-emerald-600"
                              : s.vrtl_score >= 50 ? "bg-amber-50 text-amber-600"
                              : "bg-red-50 text-red-600"
                              : "bg-[#F5F5F5] text-[#999]"
                          )}>
                            {s.vrtl_score ?? "—"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                              {s.score_by_provider && (
                                <span className="text-xs text-[#999]">
                                  {Object.keys(s.score_by_provider).length} providers
                                </span>
                              )}
                            </div>
                            <div className="mt-1 text-sm text-[#666]">
                              {new Date(s.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <svg className="h-5 w-5 text-[#999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-sm text-[#666]">No snapshots yet</p>
                    <p className="mt-1 text-xs text-[#999]">Run your first snapshot to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
        </div>
  );
}
