"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";

type Props = {
  children: React.ReactNode;
};

export function AppEntitlementGate({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string>("Checking access...");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const { accessToken } = await ensureOnboarded();
        const res = await fetch("/api/entitlements", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (res.ok) {
          if (!cancelled) setReady(true);
          return;
        }

        // If billing is enabled and they’re not entitled, send them to pricing.
        if (res.status === 403) {
          router.replace(`/pricing?next=${encodeURIComponent(pathname ?? "/app")}`);
          return;
        }

        const text = await res.text();
        if (!cancelled) setMessage(text || `Access check failed (${res.status})`);
      } catch (e) {
        if (!cancelled) setMessage(e instanceof Error ? e.message : String(e));
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) return <div className="p-6 text-sm">{message}</div>;
  return <>{children}</>;
}


