"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
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

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;
        setAgencyId(agencyId);

        const res = await supabase
          .from("clients")
          .select("id,name,website,industry")
          .eq("agency_id", agencyId)
          .order("created_at", { ascending: false });

        if (res.error) throw res.error;
        if (!cancelled) setClients((res.data ?? []) as ClientRow[]);
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
  }, [supabase]);

  return (
    <main>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-2 text-sm text-text-2">Create and manage clients for your agency.</p>
        </div>
        <ButtonLink href="/app/clients/new" variant="primary">
          New client
        </ButtonLink>
      </div>

      {agencyId ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-text-2">
          <span className="text-text-3">agency_id</span>
          <Badge variant="neutral">{agencyId}</Badge>
        </div>
      ) : null}

      {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-6">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <div className="mt-6 overflow-x-auto">
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-text-2">{c.website ? c.website : "No website"}</TableCell>
                  <TableCell>
                    <Badge variant="neutral">{c.industry}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      className="text-accent underline underline-offset-4 hover:text-accent-2"
                      href={`/app/clients/${c.id}`}
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && !error && clients.length === 0 ? (
                <TableRow>
                  <TableCell className="text-text-2" colSpan={4}>
                    No clients yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableWrapper>
      </div>
    </main>
  );
}



