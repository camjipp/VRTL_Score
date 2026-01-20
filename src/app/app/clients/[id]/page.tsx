"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper
} from "@/components/ui/Table";

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

    // last 10 snapshots (newest first)
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

  // Auto-refresh while a snapshot is running (helps recover from timeouts/crashes and shows completion without manual reload).
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
        <div className="mt-6">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {!loading && !error && !client ? (
        <div className="mt-6 text-sm text-text-2">Client not found (or not in your agency).</div>
      ) : null}

      {client ? (
        <div className="mt-6">
          <Card className="p-4">
            <div className="font-medium text-text">{client.name}</div>
            <div className="mt-1 text-sm text-text-2">
              {client.website ? client.website : "No website"}{" "}
              <span className="text-text-3">·</span> {client.industry}
            </div>
          </Card>
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-medium">Competitors</h2>
        <p className="mt-1 text-sm text-text-2">Max 8 competitors.</p>

        <ul className="mt-4 space-y-2">
          {competitors.map((c) => (
            <li key={c.id}>
              <Card className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-text">{c.name}</div>
                    <div className="text-sm text-text-2">
                      {c.website ? c.website : "No website"}
                    </div>
                  </div>
                  <Button
                    disabled={busy}
                    onClick={() => deleteCompetitor(c.id)}
                    size="sm"
                    variant="outline"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
          {!loading && competitors.length === 0 ? (
            <li className="text-sm text-text-2">No competitors yet.</li>
          ) : null}
        </ul>

        <form className="mt-6 max-w-md space-y-3" onSubmit={addCompetitor}>
          <label className="block text-sm">
            <div className="mb-1">Name</div>
            <Input
              disabled={busy || competitors.length >= 8}
              onChange={(e) => setNewName(e.target.value)}
              required
              value={newName}
            />
          </label>

          <label className="block text-sm">
            <div className="mb-1">Website (optional)</div>
            <Input
              disabled={busy || competitors.length >= 8}
              onChange={(e) => setNewWebsite(e.target.value)}
              value={newWebsite}
            />
          </label>

          {competitors.length >= 8 ? (
            <div className="text-sm text-danger">You’ve reached the max of 8 competitors.</div>
          ) : null}

          <Button disabled={busy || competitors.length >= 8} type="submit" variant="primary">
            {busy ? "Adding…" : "Add competitor"}
          </Button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Snapshots</h2>
        {competitorConfidence.message ? (
          <div className="mt-3">
            <Alert variant="warning">
              <AlertDescription>
                <span className="font-semibold text-text">Score confidence:</span>{" "}
                <span className="text-text">{competitorConfidence.label}</span>
                <div className="mt-1 text-text-2">{competitorConfidence.message}</div>
                <div className="mt-2 text-xs text-text-3">
                  You can still run a snapshot now — competitors just make the report stronger.
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : null}
        <div className="mt-3 flex items-center gap-3">
          <Button disabled={running} onClick={runSnapshot} variant="primary">
            {running ? "Running…" : "Run Snapshot"}
          </Button>
          {snapshot?.status === "running" ? (
            <Button disabled={running} onClick={resetRunningSnapshot} variant="outline">
              Reset running snapshot
            </Button>
          ) : null}
          {snapshot ? (
            <span className="inline-flex items-center gap-2 text-xs text-text-2">
              <span className="text-text-3">Latest</span>
              <Badge variant={statusVariant(snapshot.status)}>{snapshot.status}</Badge>
              <span>
                {snapshot.completed_at
                  ? `@ ${new Date(snapshot.completed_at).toLocaleString()}`
                  : snapshot.started_at
                  ? `(started ${new Date(snapshot.started_at).toLocaleString()})`
                  : ""}
              </span>
            </span>
          ) : (
            <span className="text-xs text-text-2">No snapshots yet.</span>
          )}
        </div>
        {runError ? (
          <div className="mt-3">
            <Alert variant="danger">
              <AlertDescription>{runError}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        {snapshot ? (
          <div className="mt-4">
            <Card className="p-4">
              <div className="text-sm text-text-2">
                Status: <Badge variant={statusVariant(snapshot.status)}>{snapshot.status}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-sm font-semibold text-text">
                  Overall <span className="marker-underline">score</span>
                </div>
                <Badge variant={scoreVariant(snapshot.vrtl_score)}>
                  {snapshot.vrtl_score == null ? "n/a" : snapshot.vrtl_score}
                </Badge>
              </div>
            {competitorConfidence.level !== "high" ? (
              <div className="mt-2 text-sm text-text-2">
                Score confidence: {competitorConfidence.label} due to limited competitor set.
              </div>
            ) : null}
            {snapshot.score_by_provider ? (
              <div className="mt-3 text-sm">
                <div className="font-medium text-text">Providers</div>
                <ul className="mt-1 ml-4 list-disc text-text-2">
                  {Object.entries(snapshot.score_by_provider).map(([p, s]) => (
                    <li key={p}>
                      {p}: {s}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {competitorMentions.length ? (
              <div className="mt-3 text-sm text-text-2">
                <span className="font-medium text-text">Competitors mentioned:</span>{" "}
                {competitorMentions.join(", ")}
              </div>
            ) : null}
            {snapshot.error ? (
              <div className="mt-3">
                <Alert variant="danger">
                  <AlertDescription>Error: {snapshot.error}</AlertDescription>
                </Alert>
              </div>
            ) : null}
            </Card>
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto">
          <TableWrapper>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>VRTL Score</TableHead>
                  <TableHead>Providers</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {snapshots.map((s) => {
                  const providersString = s.score_by_provider
                    ? Object.entries(s.score_by_provider)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")
                    : "—";

                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-text-2">
                        {new Date(s.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={scoreVariant(s.vrtl_score)}>
                          {s.vrtl_score == null ? "—" : s.vrtl_score}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-2">
                        <span
                          className="block max-w-[360px] truncate"
                          title={providersString !== "—" ? providersString : undefined}
                        >
                          {providersString}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          className="text-accent underline underline-offset-4 hover:text-accent-2"
                          href={`/app/clients/${clientId}/snapshots/${s.id}`}
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {snapshots.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-text-2" colSpan={5}>
                      No snapshots yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableWrapper>
        </div>
      </section>
    </main>
  );
}


