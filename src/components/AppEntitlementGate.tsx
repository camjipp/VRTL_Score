"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type Props = {
  children: React.ReactNode;
};

// Cache entitlement status in memory to avoid re-checking on every navigation
let entitlementCache: { entitled: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AppEntitlementGate({ children }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasChecked = useRef(false);

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");
  const [authError, setAuthError] = useState<string | null>(null);
  const lastNetworkError = useRef(false);

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
        lastNetworkError.current = false;
        setAuthError(null);
        const { accessToken } = await ensureOnboarded();
        const res = await fetchWithTimeout(
          "/api/entitlements",
          { headers: { Authorization: `Bearer ${accessToken}` } },
          25000,
          1
        );

        if (res.ok) {
          // Cache the successful result
          entitlementCache = { entitled: true, timestamp: Date.now() };
          return true;
        }

        if (res.status === 403) {
          return false;
        }

        return false;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "Failed to fetch" || msg.includes("load failed") || msg.includes("aborted")) {
          lastNetworkError.current = true;
          if (!cancelled) setAuthError("Connection failed. Refresh the page to try again.");
        }
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

        // If not entitled and not from checkout, redirect (unless it was a network error)
        if (!isCheckoutSuccess) {
          if (lastNetworkError.current) {
            if (!cancelled) setStatusText("Connection failed — refresh the page to try again.");
            return;
          }
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
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="w-full max-w-sm px-6">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/brand/VRTL_Solo.png"
              alt="VRTL Score"
              width={180}
              height={64}
              className="h-12 w-auto"
              priority
            />
          </div>

          {/* Progress card */}
          <div className="rounded-xl border border-border bg-white p-6">
            {/* Status text */}
            <p className="mb-4 text-center text-sm font-medium text-text">
              {statusText}
            </p>

            {/* Progress bar */}
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-text transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Progress percentage */}
            <p className="mt-3 text-center text-xs text-text-3">
              {Math.round(progress)}%
            </p>

            {authError && (
              <p className="mt-3 text-center text-xs text-rose-600">
                {authError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
