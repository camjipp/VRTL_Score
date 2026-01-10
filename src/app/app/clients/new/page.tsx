"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
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
      <h1 className="text-xl font-semibold">New client</h1>

      <form className="mt-6 max-w-md space-y-3" onSubmit={createClient}>
        <label className="block text-sm">
          <div className="mb-1">Name</div>
          <input
            className="w-full rounded border px-3 py-2"
            onChange={(e) => setName(e.target.value)}
            required
            value={name}
          />
        </label>

        <label className="block text-sm">
          <div className="mb-1">Website (optional)</div>
          <input
            className="w-full rounded border px-3 py-2"
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            value={website}
          />
        </label>

        <label className="block text-sm">
          <div className="mb-1">Industry</div>
          <input
            className="w-full rounded border px-3 py-2"
            onChange={(e) => setIndustry(e.target.value)}
            value={industry}
          />
        </label>

        {error ? (
          <div className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <button className="rounded border px-3 py-2 text-sm" disabled={busy} type="submit">
          {busy ? "Creating…" : "Create client"}
        </button>
      </form>
    </main>
  );
}


