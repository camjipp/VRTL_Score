"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function normalizeWebsite(input: string): string {
  const raw = input.trim();
  if (!raw) return "";
  // If user types a bare domain, assume https.
  if (!raw.includes("://")) return `https://${raw}`;
  return raw;
}

function defaultClientNameFromWebsite(website: string): string {
  try {
    const host = new URL(website).hostname.replace(/^www\./, "");
    const base = host.split(".")[0] || host;
    return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
  } catch {
    return "";
  }
}

export function DomainSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const website = normalizeWebsite(value);
    if (!website) {
      setError("Enter a website (e.g. example.com)");
      return;
    }

    const clientName = defaultClientNameFromWebsite(website);

    const finalNextParams = new URLSearchParams();
    finalNextParams.set("website", website);
    if (clientName) finalNextParams.set("name", clientName);
    const finalNext = `/app/clients/new?${finalNextParams.toString()}`;

    const onboardingParams = new URLSearchParams();
    onboardingParams.set("website", website);
    onboardingParams.set("next", finalNext);
    const onboardingNext = `/onboarding?${onboardingParams.toString()}`;

    const loginParams = new URLSearchParams();
    loginParams.set("next", onboardingNext);
    router.push(`/login?${loginParams.toString()}`);
  }

  return (
    <form className="mt-8" onSubmit={submit}>
      <div className="card-surface flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <div className="text-xs font-medium text-text-2">Enter a client website to begin</div>
          <input
            className="mt-2 w-full rounded-lg border border-border/15 bg-bg1 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/30"
            onChange={(e) => setValue(e.target.value)}
            placeholder="example.com"
            value={value}
          />
        </div>
        <button className="btn-primary sm:mt-5" type="submit">
          Get VRTL Score
        </button>
      </div>
      {error ? <div className="mt-2 text-sm text-red-700">{error}</div> : null}
      <div className="mt-2 text-xs text-muted">
        You’ll create an account next, then we’ll guide you through agency setup and access.
      </div>
    </form>
  );
}


