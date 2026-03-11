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

  const inputBase =
    "w-full rounded-[10px] border px-[14px] py-[14px] text-[#E6EDF3] placeholder:text-[#8B98A5] transition-all focus:outline-none focus:border-[#10A37F] focus:shadow-[0_0_0_1px_#10A37F]";

  return (
    <div className="mx-auto max-w-2xl pt-12">
      {/* Breadcrumb — 48px above */}
      <nav className="flex items-center gap-1.5 text-sm mb-4">
        <Link href="/app" className="text-[#8B98A5] transition-colors hover:text-[#E6EDF3]">Clients</Link>
        <svg className="h-3.5 w-3.5 text-[#8B98A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-[#E6EDF3]">New Client</span>
      </nav>

      {/* Header — 16px after breadcrumb, 12px between title and subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[#E6EDF3]">Create New Client</h1>
        <p className="mt-3 text-sm text-[#8B98A5]">
          Add a client to track their AI visibility and competitive landscape.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form — 32px between subtitle and form card (mb-8 on header) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="overflow-hidden rounded-[12px] border"
          style={{ backgroundColor: "#0B0F14", borderColor: "#1A212B" }}
        >
          <div
            className="border-b px-6 py-4"
            style={{ borderColor: "#1A212B" }}
          >
            <h2 className="font-semibold text-[#E6EDF3]">Client Details</h2>
            <p className="text-sm text-[#8B98A5]">Basic information about the client</p>
          </div>
          <div className="space-y-6 p-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#E6EDF3]">
                Client Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Company or brand name"
                className={cn("mt-2", inputBase, "bg-[#0E141B] border-[#1A212B]")}
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-[#E6EDF3]">Website</label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[14px]">
                  <svg className="h-5 w-5 text-[#8B98A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className={cn("pl-12 pr-4", inputBase, "bg-[#0E141B] border-[#1A212B]")}
                />
              </div>
              <p className="mt-1 text-xs text-[#8B98A5]">Used for AI visibility analysis</p>
            </div>

            {/* Industry chips */}
            <div>
              <label className="block text-sm font-medium text-[#E6EDF3]">
                Industry <span className="text-red-500">*</span>
              </label>
              <p className="mt-1 text-sm text-[#8B98A5]">Used to generate relevant AI queries</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.value}
                    type="button"
                    onClick={() => setIndustry(ind.value)}
                    className={cn(
                      "rounded-[10px] border px-4 py-2 text-sm font-medium transition-all",
                      industry === ind.value
                        ? "border-[#10A37F] text-[#10A37F]"
                        : "border-[#1A212B] bg-[#0E141B] text-[#C9D1D9] hover:border-[#10A37F]"
                    )}
                    style={
                      industry === ind.value
                        ? { backgroundColor: "rgba(16,163,127,0.15)" }
                        : undefined
                    }
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What happens next — dark helper panel */}
        <div
          className="rounded-[12px] border border-dashed p-5"
          style={{ backgroundColor: "#0B0F14", borderColor: "#1A212B" }}
        >
          <h3 className="text-sm font-semibold text-[#E6EDF3]">What happens next</h3>
          <ol className="mt-3 space-y-3 text-sm text-[#C9D1D9]">
            <li className="flex items-start gap-3">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium text-[#8B98A5]"
                style={{ backgroundColor: "rgba(26,33,43,0.8)" }}
              >
                1
              </span>
              <span>Add competitors for benchmarking</span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium text-[#8B98A5]"
                style={{ backgroundColor: "rgba(26,33,43,0.8)" }}
              >
                2
              </span>
              <span>Run your first snapshot</span>
            </li>
            <li className="flex items-start gap-3">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-medium text-[#8B98A5]"
                style={{ backgroundColor: "rgba(26,33,43,0.8)" }}
              >
                3
              </span>
              <span>Generate reports</span>
            </li>
          </ol>
        </div>

        {/* Actions — Cancel left, Create client right */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Link
            href="/app"
            className="rounded-[10px] border px-6 py-[14px] text-sm font-medium text-[#8B98A5] transition-colors hover:border-[#1A212B] hover:bg-[#0E141B] hover:text-[#E6EDF3]"
            style={{ borderColor: "#1A212B" }}
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || !name || !industry}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#10A37F] px-6 py-[14px] text-sm font-semibold text-white transition-all hover:bg-[#0e8f6f] disabled:opacity-50"
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
