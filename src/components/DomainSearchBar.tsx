"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

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
      setError("Enter a valid website");
      return;
    }

    const clientName = defaultClientNameFromWebsite(website);

    // Build the final destination after onboarding
    const finalNextParams = new URLSearchParams();
    finalNextParams.set("website", website);
    if (clientName) finalNextParams.set("name", clientName);
    const finalNext = `/app/clients/new?${finalNextParams.toString()}`;

    // Go directly to onboarding (which handles auth)
    const onboardingParams = new URLSearchParams();
    onboardingParams.set("website", website);
    onboardingParams.set("next", finalNext);
    router.push(`/onboarding?${onboardingParams.toString()}`);
  }

  return (
    <form onSubmit={submit}>
      <div className="relative flex items-center overflow-hidden rounded-xl border-2 border-border bg-white shadow-md transition-all focus-within:border-accent/50 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-accent/20 sm:rounded-2xl">
        <span className="absolute left-5 text-text-3 sm:left-6">
          <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </span>
        <input
          className="h-14 w-full bg-transparent pl-12 pr-40 text-base text-text placeholder:text-text-3 outline-none sm:h-16 sm:pl-14 sm:pr-44 sm:text-lg"
          onChange={(e) => setValue(e.target.value)}
          placeholder="yourwebsite.com"
          value={value}
          inputMode="url"
          autoComplete="url"
          aria-label="Enter website domain"
        />
        <Button className="absolute right-2 h-10 rounded-lg px-5 text-sm font-semibold sm:right-2.5 sm:h-11 sm:rounded-xl sm:px-6" type="submit" variant="primary">
          Check visibility
        </Button>
      </div>
      {error ? (
        <div className="mt-2">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}
    </form>
  );
}


