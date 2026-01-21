"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

const industries = [
  { value: "default", label: "General / Other" },
  { value: "technology", label: "Technology" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "retail", label: "Retail" },
  { value: "education", label: "Education" },
  { value: "marketing", label: "Marketing" },
  { value: "real_estate", label: "Real Estate" },
  { value: "hospitality", label: "Hospitality" },
  { value: "legal", label: "Legal" },
];

function NewClientForm() {
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
    <div className="mx-auto max-w-2xl">
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

      {/* Header */}
      <div className="mt-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Client
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text">Create a client</h1>
        <p className="mt-2 text-text-2">
          Add a new client to your workspace to start running competitive analysis.
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
        {/* Gradient header */}
        <div className="relative h-2 bg-gradient-to-r from-accent via-purple-500 to-pink-500" />

        <form className="p-8" onSubmit={createClient}>
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-text">
                Client name
                <span className="ml-1 text-red-500">*</span>
              </label>
              <p className="mt-1 text-xs text-text-3">
                The name of your client&apos;s business or brand
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Acme Corporation"
                className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>

            {/* Website field */}
            <div>
              <label className="block text-sm font-medium text-text">
                Website
              </label>
              <p className="mt-1 text-xs text-text-3">
                The primary domain to analyze (optional)
              </p>
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
                  className="w-full rounded-xl border border-border bg-bg py-3 pl-12 pr-4 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            {/* Industry field */}
            <div>
              <label className="block text-sm font-medium text-text">
                Industry
              </label>
              <p className="mt-1 text-xs text-text-3">
                Helps tailor competitive analysis insights
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {industries.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={cn(
                      "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                      industry === ind.value
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border bg-surface-2 text-text-2 hover:border-text-3 hover:text-text"
                    )}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <Alert variant="danger">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-2 hover:shadow-xl hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Create client
                  </>
                )}
              </button>
              <Link
                href="/app"
                className="text-sm text-text-2 transition-colors hover:text-text"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Help card */}
      <div className="mt-6 rounded-2xl border border-border bg-surface-2/50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-text">What happens next?</h3>
            <p className="mt-1 text-sm text-text-2">
              After creating a client, you&apos;ll be able to add competitors, run AI-powered snapshots, and generate beautiful PDF reports with competitive insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewClientPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">Loading...</div>}>
      <NewClientForm />
    </Suspense>
  );
}
