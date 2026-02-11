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
      <div className="relative flex items-center rounded-full border border-border bg-white shadow-sm transition-shadow focus-within:shadow-md">
        <input
          className="h-12 w-full rounded-full bg-transparent pl-5 pr-36 text-base text-text placeholder:text-text-3 outline-none sm:h-14 sm:pr-40"
          onChange={(e) => setValue(e.target.value)}
          placeholder="yourwebsite.com"
          value={value}
          inputMode="url"
          autoComplete="url"
          aria-label="Website"
        />
        <Button className="absolute right-1.5 h-9 rounded-full px-5 text-sm font-semibold sm:h-11 sm:px-6" type="submit" variant="primary">
          Run free snapshot
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


