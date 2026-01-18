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
      <div className="rounded-2xl border border-border/15 bg-bg1 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-bg0/40 px-3 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-black/5">
              <svg
                aria-hidden="true"
                className="h-5 w-5 text-muted"
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
              <input
                className="mt-1 w-full bg-transparent text-base text-text outline-none placeholder:text-muted"
                onChange={(e) => setValue(e.target.value)}
                placeholder="example.com"
                value={value}
              />
            </div>
          </div>

          <button className="btn-primary h-12 rounded-xl px-5 text-base" type="submit">
            Get VRTL Score
          </button>
        </div>
      </div>
      {error ? <div className="mt-2 text-sm text-red-700">{error}</div> : null}
      <div className="mt-2 text-xs text-muted">
        You’ll create an account next, then we’ll guide you through agency setup and access.
      </div>
    </form>
  );
}


