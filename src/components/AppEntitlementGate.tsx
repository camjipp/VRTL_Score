"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";

type Props = {
  children: React.ReactNode;
};

// Cache entitlement status in memory to avoid re-checking on every navigation
let entitlementCache: { entitled: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AppEntitlementGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasChecked = useRef(false);

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");

  // Check if user just came from successful checkout
  const isCheckoutSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    // If already checked and entitled, don't re-check
    if (hasChecked.current && ready) return;

    // Check cache first (unless coming from checkout - always revalidate)
    if (!isCheckoutSuccess && entitlementCache) {
      const age = Date.now() - entitlementCache.timestamp;
      if (age < CACHE_DURATION && entitlementCache.entitled) {
        setReady(true);
        hasChecked.current = true;
        return;
      }
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = isCheckoutSuccess ? 8 : 1;
    const pollInterval = 1500;

    const statusMessages = [
      "Activating your subscription...",
      "Configuring your workspace...",
      "Setting up AI providers...",
      "Almost there...",
      "Finalizing setup...",
      "Just a moment...",
      "Preparing your dashboard...",
      "Ready in seconds...",
    ];

    async function checkEntitlements(): Promise<boolean> {
      try {
        const { accessToken } = await ensureOnboarded();
        const res = await fetch("/api/entitlements", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.ok) {
          // Cache the successful result
          entitlementCache = { entitled: true, timestamp: Date.now() };
          return true;
        }

        if (res.status === 403) {
          return false;
        }

        return false;
      } catch {
        return false;
      }
    }

    async function run() {
      while (attempts < maxAttempts && !cancelled) {
        // Update progress and status
        const progressPercent = Math.min(90, ((attempts + 1) / maxAttempts) * 100);
        if (!cancelled) {
          setProgress(progressPercent);
          setStatusText(statusMessages[attempts % statusMessages.length]);
        }

        attempts++;
        const entitled = await checkEntitlements();

        if (entitled) {
          if (!cancelled) {
            setProgress(100);
            setStatusText("Welcome!");
            // Small delay to show 100%
            await new Promise(r => setTimeout(r, 300));
            setReady(true);
            hasChecked.current = true;
          }
          return;
        }

        // If not entitled and not from checkout, redirect immediately
        if (!isCheckoutSuccess) {
          router.replace(`/app/plans`);
          return;
        }

        // If from checkout, wait and retry
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }

      // All attempts exhausted
      if (!cancelled && isCheckoutSuccess) {
        // Grant access anyway - webhook will catch up
        // Store in cache so navigation doesn't break
        entitlementCache = { entitled: true, timestamp: Date.now() };
        setProgress(100);
        setStatusText("Welcome!");
        await new Promise(r => setTimeout(r, 300));
        setReady(true);
        hasChecked.current = true;
      } else if (!cancelled) {
        router.replace(`/app/plans`);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  // Only re-run on mount or if checkout success status changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutSuccess]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-surface via-bg to-surface-2">
        <div className="w-full max-w-sm px-6">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
          </div>

          {/* Progress card */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xl">
            {/* Status text */}
            <p className="mb-4 text-center text-sm font-medium text-text">
              {statusText}
            </p>

            {/* Progress bar */}
            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress percentage */}
            <p className="mt-3 text-center text-xs text-text-3">
              {Math.round(progress)}% complete
            </p>
          </div>

          {/* Subtle hint */}
          <p className="mt-6 text-center text-xs text-text-3">
            This only takes a moment
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
