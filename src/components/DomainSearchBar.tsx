"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

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
      <Card className="shadow-none">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-bg-2 px-3 py-2 ring-1 ring-border/60">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-surface">
              <svg
                aria-hidden="true"
                className="h-5 w-5 text-text-3"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M2 12h20"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
                <path
                  d="M12 2c2.5 2.7 4 6.2 4 10s-1.5 7.3-4 10c-2.5-2.7-4-6.2-4-10s1.5-7.3 4-10Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-medium text-text-2">
                Enter a client website
              </div>
              <Input
                className="mt-1 border-0 bg-transparent px-0 py-0 text-base placeholder:text-text-3 focus-visible:ring-0"
                onChange={(e) => setValue(e.target.value)}
                placeholder="example.com"
                value={value}
              />
            </div>
          </div>

          <Button className="h-12 rounded-xl px-5 text-base" type="submit" variant="primary">
            Get VRTL Score
          </Button>
        </div>
      </Card>
      {error ? (
        <div className="mt-2">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      <div className="mt-2 text-xs text-text-3">
        You’ll create an account next, then we’ll guide you through agency setup and access.
      </div>
    </form>
  );
}


