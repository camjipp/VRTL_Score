"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";

type Props = {
  children: React.ReactNode;
};

export function AppEntitlementGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string>("Checking access...");

  // Check if user just came from successful checkout
  const isCheckoutSuccess = searchParams.get("checkout") === "success";

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = isCheckoutSuccess ? 10 : 1; // Poll up to 10 times if checkout success
    const pollInterval = 2000; // 2 seconds between polls

    async function checkEntitlements(): Promise<boolean> {
      try {
        const { accessToken } = await ensureOnboarded();
        const res = await fetch("/api/entitlements", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.ok) {
          return true;
        }

        if (res.status === 403) {
          return false;
        }

        const text = await res.text();
        if (!cancelled) setMessage(text || `Access check failed (${res.status})`);
        return false;
      } catch (e) {
        if (!cancelled) setMessage(e instanceof Error ? e.message : String(e));
        return false;
      }
    }

    async function run() {
      // If checkout success, show a nice message while polling
      if (isCheckoutSuccess && !cancelled) {
        setMessage("Setting up your account...");
      }

      while (attempts < maxAttempts && !cancelled) {
        attempts++;
        const entitled = await checkEntitlements();

        if (entitled) {
          if (!cancelled) setReady(true);
          return;
        }

        // If not entitled and not from checkout, redirect immediately
        if (!isCheckoutSuccess) {
          router.replace(`/pricing?next=${encodeURIComponent(pathname ?? "/app")}`);
          return;
        }

        // If from checkout, wait and retry
        if (attempts < maxAttempts) {
          if (!cancelled) {
            setMessage(`Setting up your account... (${attempts}/${maxAttempts})`);
          }
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }

      // All attempts exhausted, still not entitled
      if (!cancelled && isCheckoutSuccess) {
        // Give them access anyway - webhook will catch up eventually
        // This prevents a bad UX if Stripe webhook is slow
        setReady(true);
      } else if (!cancelled) {
        router.replace(`/pricing?next=${encodeURIComponent(pathname ?? "/app")}`);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router, isCheckoutSuccess]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-text/20 border-t-text" />
          <p className="text-sm text-text-2">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
