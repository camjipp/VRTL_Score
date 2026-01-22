"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

const industries = [
  { value: "default", label: "General" },
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
    <div className="mx-auto max-w-xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-white/50 hover:text-white">Dashboard</Link>
        <span className="text-white/30">/</span>
        <span className="text-white">New Client</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Create a client</h1>
        <p className="mt-1 text-sm text-white/50">Add a new client to run competitive analysis.</p>
      </div>

      {/* Form Card */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#161616]">
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />

        <form className="p-6" onSubmit={createClient}>
          <div className="space-y-5">
            {/* Name field */}
            <div>
              <label className="block text-sm font-medium text-white/70">
                Client name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Acme Corporation"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
              />
            </div>

            {/* Website field */}
            <div>
              <label className="block text-sm font-medium text-white/70">Website</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-4 w-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none"
                />
              </div>
            </div>

            {/* Industry field */}
            <div>
              <label className="block text-sm font-medium text-white/70">Industry</label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {industries.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                      industry === ind.value
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-white/5 bg-white/[0.02] text-white/50 hover:border-white/10 hover:text-white/70"
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
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={busy || !name.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-50"
              >
                {busy ? (
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
              <Link href="/app" className="text-sm text-white/50 transition-colors hover:text-white">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Help card */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">What happens next?</p>
            <p className="mt-0.5 text-xs text-white/50">
              After creating, add competitors, run AI-powered snapshots, and generate PDF reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewClientPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-white/50">Loading...</div>}>
      <NewClientForm />
    </Suspense>
  );
}
