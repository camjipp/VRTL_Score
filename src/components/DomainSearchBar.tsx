"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

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
    <form onSubmit={submit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-stretch overflow-hidden rounded-2xl border border-border bg-surface shadow-lift">
          <div className="flex min-w-0 flex-1 items-center px-5">
            <Input
              className={cn(
                "h-12 w-full border-0 bg-transparent px-0 py-0 text-base placeholder:text-text-3 focus-visible:ring-0",
                "sm:h-14"
              )}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter website or URL"
              value={value}
            />
          </div>
          <div className="hidden w-px bg-border sm:block" />
          <Button className="h-12 rounded-none px-6 text-base sm:h-14" type="submit" variant="primary">
            Get insights
          </Button>
        </div>
      </div>
      {error ? (
        <div className="mt-2">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      <div className="mt-2 text-xs text-text-3">You’ll create an account next.</div>
    </form>
  );
}


