"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

type ClientRow = {
  id: string;
  name: string;
  website: string | null;
  industry: string;
  created_at: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Welcome/onboarding component for first-run
function WelcomeExperience({ onCreateClient }: { onCreateClient: () => void }) {
  const [currentStep] = useState(1);

  const steps = [
    {
      number: 1,
      title: "Add your first client",
      description: "Enter a client name and website to start tracking their AI visibility.",
      action: "Add client",
      active: currentStep === 1,
    },
    {
      number: 2,
      title: "Add competitors",
      description: "Tell us who your client competes with so we can compare visibility.",
      active: currentStep === 2,
    },
    {
      number: 3,
      title: "Run a snapshot",
      description: "Analyze how AI models recommend your client vs competitors.",
      active: currentStep === 3,
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Welcome header */}
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400">
          <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-text">Welcome to VRTL Score</h1>
        <p className="mt-2 text-text-2">
          Let&apos;s get your first AI visibility report set up in under 2 minutes.
        </p>
      </div>

      {/* Steps */}
      <div className="mt-12 space-y-4">
        {steps.map((step, idx) => (
          <div
            key={step.number}
            className={cn(
              "relative rounded-xl border p-5 transition-all",
              step.active
                ? "border-text/20 bg-surface shadow-sm"
                : "border-border bg-surface/50"
            )}
          >
            <div className="flex items-start gap-4">
              {/* Step number */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  step.active
                    ? "bg-text text-white"
                    : idx < currentStep - 1
                      ? "bg-emerald-500 text-white"
                      : "bg-surface-2 text-text-3"
                )}
              >
                {idx < currentStep - 1 ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium",
                  step.active ? "text-text" : "text-text-2"
                )}>
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-text-3">
                  {step.description}
                </p>

                {/* Action button */}
                {step.active && step.action && (
                  <button
                    onClick={onCreateClient}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-text px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-text/90"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {step.action}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-10 rounded-xl bg-surface-2/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-text">Pro tip</h4>
            <p className="mt-1 text-sm text-text-3">
              Start with 3-5 competitors for the most actionable insights. You can always add more later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Client list when they have clients
function ClientList({ clients, searchQuery, setSearchQuery }: {
  clients: ClientRow[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}) {
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.website && c.website.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Clients</h1>
          <p className="mt-1 text-sm text-text-3">{clients.length} client{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/app/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-text px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-text/90"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add client
        </Link>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm text-text placeholder:text-text-3 focus:border-text/30 focus:outline-none focus:ring-1 focus:ring-text/10"
          />
        </div>
      </div>

      {/* Client list */}
      <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {filteredClients.length === 0 && searchQuery && (
          <div className="py-12 text-center">
            <p className="text-sm text-text-2">No clients match &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-sm text-text hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {filteredClients.map((client) => (
          <Link
            key={client.id}
            href={`/app/clients/${client.id}`}
            className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-2/50"
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm font-semibold text-text-2">
              {getInitials(client.name)}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-text">{client.name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-text-3">
                <span className="capitalize">{client.industry.replace(/_/g, " ")}</span>
                {client.website && (
                  <>
                    <span>·</span>
                    <span className="truncate">{client.website.replace(/^https?:\/\//, "")}</span>
                  </>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="text-xs text-text-3">
              {formatDate(client.created_at)}
            </div>

            {/* Arrow */}
            <svg className="h-4 w-4 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AppPage() {
  const supabase = getSupabaseBrowserClient();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        const { agencyId } = await ensureOnboarded();
        if (cancelled) return;

        const res = await supabase
          .from("clients")
          .select("id,name,website,industry,created_at")
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
    return () => { cancelled = true; };
  }, [supabase]);

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-text/20 border-t-text" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text">Something went wrong</h2>
        <p className="mt-2 text-sm text-text-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm font-medium text-text hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // First run - no clients
  if (clients.length === 0) {
    return (
      <WelcomeExperience
        onCreateClient={() => window.location.href = "/app/clients/new"}
      />
    );
  }

  // Has clients
  return (
    <ClientList
      clients={clients}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}
