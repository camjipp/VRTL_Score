"use client";

import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper
} from "@/components/ui/Table";

type AgencyRow = {
  id: string;
  name: string;
  is_active: boolean;
  created_at?: string | null;
};

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/admin/agencies", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { agencies: AgencyRow[] };
      setAgencies(json.agencies ?? []);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function setActive(agencyId: string, is_active: boolean) {
    setBusyId(agencyId);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/admin/agencies/set-active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ agencyId, is_active })
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main>
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-text-2">Internal-only: manage agency access (paywall entitlement).</p>

      {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-6">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <div className="mt-6">
        <Card className="p-5">
          <div className="mb-4">
            <div className="text-sm font-medium text-text">Agencies</div>
            <div className="mt-1 text-xs text-text-3">Toggle active access for paywall entitlement.</div>
          </div>

          <div className="overflow-x-auto">
            <TableWrapper>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="font-mono text-xs text-text-2">{a.id}</TableCell>
                      <TableCell>
                        <Badge variant={a.is_active ? "success" : "neutral"}>
                          {a.is_active ? "active" : "inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            className="h-9 px-3 text-xs"
                            disabled={busyId === a.id || a.is_active}
                            onClick={() => setActive(a.id, true)}
                            size="sm"
                            variant="primary"
                          >
                            {busyId === a.id ? "Working…" : "Activate"}
                          </Button>
                          <Button
                            className="h-9 px-3 text-xs"
                            disabled={busyId === a.id || !a.is_active}
                            onClick={() => setActive(a.id, false)}
                            size="sm"
                            variant="outline"
                          >
                            {busyId === a.id ? "Working…" : "Deactivate"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && agencies.length === 0 ? (
                    <TableRow>
                      <TableCell className="text-text-2" colSpan={4}>
                        No agencies found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableWrapper>
          </div>
        </Card>
      </div>
    </main>
  );
}


