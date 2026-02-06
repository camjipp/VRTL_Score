"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

const INDUSTRIES = [
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing" },
  { value: "real_estate", label: "Real Estate" },
  { value: "hospitality", label: "Hospitality" },
  { value: "legal", label: "Legal" },
  { value: "other", label: "Other" },
];

export default function NewClientPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { agencyId } = await ensureOnboarded();

      const { data, error: insertError } = await supabase
        .from("clients")
        .insert({
          agency_id: agencyId,
          name,
          website: website || null,
          industry,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      router.push(`/app/clients/${data.id}`);
    } catch (e) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link href="/app" className="text-text-2 transition-colors hover:text-text">Clients</Link>
        <svg className="h-3.5 w-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-text">New Client</span>
      </nav>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Create New Client</h1>
        <p className="mt-1 text-sm text-text-2">
          Add a client to track their AI visibility and competitive landscape.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold text-text">Client Details</h2>
            <p className="text-sm text-text-3">Basic information about the client</p>
          </div>
          <div className="space-y-6 p-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-text">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Company or brand name"
                className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-text">
                Website
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-border bg-surface-2 py-3 pl-12 pr-4 text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
                />
              </div>
              <p className="mt-1 text-xs text-text-3">Used for AI visibility analysis</p>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-text">
                Industry <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-sm text-text-3">Used to generate relevant AI queries</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                      industry === ind.value
                        ? "border-text bg-text text-white"
                        : "border-border bg-white text-text-2 hover:border-text-3 hover:text-text"
                    )}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="rounded-xl border border-border bg-white p-5">
          <h3 className="text-sm font-semibold text-text">After creating this client</h3>
          <ol className="mt-3 space-y-2 text-sm text-text-2">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text-3">1</span>
              <span>Add competitors for benchmarking (optional)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text-3">2</span>
              <span>Run a snapshot to query AI models</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-text-3">3</span>
              <span>View scores and download reports</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/app"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !name || !industry}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : (
              "Create client"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
