"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

const INDUSTRIES = [
  { value: "technology", label: "Technology", icon: "💻" },
  { value: "healthcare", label: "Healthcare", icon: "🏥" },
  { value: "finance", label: "Finance", icon: "💰" },
  { value: "retail", label: "Retail", icon: "🛍️" },
  { value: "education", label: "Education", icon: "🎓" },
  { value: "marketing", label: "Marketing", icon: "📣" },
  { value: "real_estate", label: "Real Estate", icon: "🏠" },
  { value: "hospitality", label: "Hospitality", icon: "🏨" },
  { value: "legal", label: "Legal", icon: "⚖️" },
  { value: "other", label: "Other", icon: "📦" },
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
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-text-2 hover:text-text">Dashboard</Link>
        <span className="text-text-3">/</span>
        <span className="text-text">New Client</span>
      </div>

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
                placeholder="e.g., Acme Corp"
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
              <p className="text-sm text-text-3">Select the client&apos;s primary industry</p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all",
                      industry === ind.value
                        ? "border-accent bg-accent/5"
                        : "border-border bg-surface-2 hover:border-text-3"
                    )}
                  >
                    <span className="text-2xl">{ind.icon}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      industry === ind.value ? "text-text" : "text-text-2"
                    )}>
                      {ind.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2/50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-text">What happens next?</h3>
              <ul className="mt-2 space-y-1 text-sm text-text-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">→</span>
                  Add competitors to compare against
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">→</span>
                  Run a snapshot to analyze AI visibility
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600">→</span>
                  Get actionable insights and scores
                </li>
              </ul>
            </div>
          </div>
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
