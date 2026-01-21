"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function NewClientPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const [name, setName] = useState(() => searchParams.get("name") ?? "");
  const [website, setWebsite] = useState(() => searchParams.get("website") ?? "");
  const [industry, setIndustry] = useState("default");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createClient(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { agencyId } = await ensureOnboarded();

      const res = await supabase
        .from("clients")
        .insert({
          agency_id: agencyId,
          name,
          website: website || null,
          industry: industry || "default"
        })
        .select("id")
        .single();

      if (res.error) throw res.error;
      router.replace(`/app/clients/${res.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <Card className="max-w-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">New client</CardTitle>
          <CardDescription>Create a client record to run snapshots and generate reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={createClient}>
            <label className="block text-sm">
              <div className="mb-1 font-medium text-text">Name</div>
              <Input onChange={(e) => setName(e.target.value)} required value={name} />
            </label>

            <label className="block text-sm">
              <div className="mb-1 font-medium text-text">Website (optional)</div>
              <Input
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                value={website}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 font-medium text-text">Industry</div>
              <Input onChange={(e) => setIndustry(e.target.value)} value={industry} />
            </label>

            {error ? (
              <Alert variant="danger">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <Button disabled={busy} type="submit" variant="primary">
              {busy ? "Creating…" : "Create client"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}


