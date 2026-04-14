"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  BRAND_LOCKUP_IMAGE_HEIGHT,
  BRAND_LOCKUP_IMAGE_UNOPTIMIZED,
  BRAND_LOCKUP_IMAGE_WIDTH,
  BRAND_LOCKUP_SRC,
} from "@/lib/brand/logo";
import { ensureOnboarded } from "@/lib/onboard";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

type Props = {
  children: React.ReactNode;
};

// Cache entitlement status in memory to avoid re-checking on every navigation
let entitlementCache: { entitled: boolean; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const FIRST_LOAD_KEY = "vrtl_entitlement_ui_seen";

const GATE_DARK = {
  bg: "#05070A",
  cardBg: "#0B0F14",
  border: "#1A212B",
  text: "#E6EDF3",
  textMuted: "#8B98A5",
} as const;

export function AppEntitlementGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasChecked = useRef(false);

  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing...");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isFirstLoad] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return !sessionStorage.getItem(FIRST_LOAD_KEY);
    } catch {
      return true;
    }
  });
  const lastNetworkError = useRef(false);

  // Check if user just came from successful checkout
  const isCheckoutSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    // Always allow through to paywall — no entitlement check on /app/plans
    if (pathname === "/app/plans") {
      setReady(true);
      hasChecked.current = true;
      return;
    }

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
    /** Checkout: Stripe webhook can lag — poll longer. Normal load: retry transient API errors (500, cold start) instead of sending users to /app/plans. */
    const maxAttempts = isCheckoutSuccess ? 8 : 4;
    const pollInterval = 1500;
    const retryDelayMs = 600;

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

    /**
     * `paywall` = 403 from API (not subscribed / inactive agency) — only case we send user to /app/plans.
     * `ok` = entitled.
     * `retry` = transient (5xx, network, onboard hiccup) — do not treat as paywall.
     * `auth` = 401 — session invalid; caller should send to login.
     */
    async function checkEntitlements(): Promise<"ok" | "paywall" | "retry" | "auth"> {
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
          entitlementCache = { entitled: true, timestamp: Date.now() };
          return "ok";
        }

        if (res.status === 403) {
          return "paywall";
        }

        if (res.status === 401) {
          return "auth";
        }

        return "retry";
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "Failed to fetch" || msg.includes("load failed") || msg.includes("aborted")) {
          lastNetworkError.current = true;
          if (!cancelled) setAuthError("Connection failed. Refresh the page to try again.");
        }
        return "retry";
      }
    }

    async function run() {
      while (attempts < maxAttempts && !cancelled) {
        const progressPercent = Math.min(90, ((attempts + 1) / maxAttempts) * 100);
        if (!cancelled) {
          setProgress(progressPercent);
          setStatusText(statusMessages[attempts % statusMessages.length]);
        }

        attempts++;
        const outcome = await checkEntitlements();

        if (outcome === "ok") {
          if (!cancelled) {
            setProgress(100);
            setStatusText("Welcome!");
            await new Promise((r) => setTimeout(r, 300));
            try {
              sessionStorage.setItem(FIRST_LOAD_KEY, "1");
            } catch {
              // ignore
            }
            setReady(true);
            hasChecked.current = true;
          }
          return;
        }

        if (outcome === "auth") {
          if (!cancelled) {
            router.replace(`/login?next=${encodeURIComponent(pathname ?? "/app")}`);
          }
          return;
        }

        if (outcome === "paywall") {
          if (!isCheckoutSuccess) {
            router.replace(`/app/plans`);
            return;
          }
          if (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
          }
          continue;
        }

        // retry: transient error — wait and try again (checkout uses longer pollInterval below)
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, isCheckoutSuccess ? pollInterval : retryDelayMs));
        }
      }

      if (!cancelled && isCheckoutSuccess) {
        entitlementCache = { entitled: true, timestamp: Date.now() };
        setProgress(100);
        setStatusText("Welcome!");
        await new Promise((r) => setTimeout(r, 300));
        try {
          sessionStorage.setItem(FIRST_LOAD_KEY, "1");
        } catch {
          // ignore
        }
        setReady(true);
        hasChecked.current = true;
      } else if (!cancelled) {
        if (lastNetworkError.current) {
          setStatusText("Connection failed. Refresh the page to try again.");
          return;
        }
        setAuthError("We couldn't verify your workspace. Refresh the page, or try again in a moment.");
        setStatusText("Couldn't verify access");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [isCheckoutSuccess, pathname, router]);

  if (!ready) {
    // First-time load: show full "Activating your subscription..." card (dark theme)
    const showFullActivation = isFirstLoad === true;

    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: GATE_DARK.bg }}
      >
        <div className="w-full max-w-sm px-6">
          <div className="mb-8 flex justify-center">
            <Image
              src={BRAND_LOCKUP_SRC}
              alt="VRTL Score"
              width={BRAND_LOCKUP_IMAGE_WIDTH}
              height={BRAND_LOCKUP_IMAGE_HEIGHT}
              className="h-16 w-auto max-w-[min(280px,85vw)] bg-transparent object-contain object-center opacity-95"
              priority
              sizes="(max-width: 768px) 85vw, 280px"
              unoptimized={BRAND_LOCKUP_IMAGE_UNOPTIMIZED}
            />
          </div>

          {showFullActivation ? (
            /* Full activation card — dark theme, only on first load */
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: GATE_DARK.cardBg,
                borderColor: GATE_DARK.border,
              }}
            >
              <p className="mb-4 text-center text-sm font-medium" style={{ color: GATE_DARK.text }}>
                {statusText}
              </p>
              <div
                className="h-1.5 overflow-hidden rounded-full"
                style={{ backgroundColor: GATE_DARK.border }}
              >
                <div
                  className="h-full rounded-full bg-[#10A37F] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-center text-xs" style={{ color: GATE_DARK.textMuted }}>
                {Math.round(progress)}%
              </p>
              {authError && (
                <p className="mt-3 text-center text-xs text-rose-400">
                  {authError}
                </p>
              )}
            </div>
          ) : (
            /* Returning user: minimal dark loader */
            <div className="flex flex-col items-center gap-6">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2"
                style={{ borderColor: GATE_DARK.border, borderTopColor: "#10A37F" }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
