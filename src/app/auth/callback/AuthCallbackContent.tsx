"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BRAND_LOCKUP_IMAGE_HEIGHT,
  BRAND_LOCKUP_IMAGE_UNOPTIMIZED,
  BRAND_LOCKUP_IMAGE_WIDTH,
  BRAND_LOCKUP_SRC,
} from "@/lib/brand/logo";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

async function onboard(accessToken: string) {
  const res = await fetchWithTimeout(
    "/api/onboard",
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } },
    25000,
    1
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Onboard failed (${res.status})`);
  }
  return (await res.json()) as { agency_id: string };
}

export function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const next = searchParams.get("next");
      const nextPath = next && next.startsWith("/") ? next : "/app";

      // Check for OAuth error in hash (Supabase may redirect with #error=...&error_description=...)
      if (typeof window !== "undefined" && window.location.hash) {
        const params = new URLSearchParams(window.location.hash.replace("#", ""));
        const err = params.get("error");
        const errDesc = params.get("error_description");
        if (err) {
          if (!cancelled) {
            setErrorMessage(errDesc || err || "Sign-in was cancelled or failed.");
            setStatus("error");
          }
          return;
        }
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          if (!cancelled) {
            setErrorMessage(sessionError.message || "Could not get session.");
            setStatus("error");
          }
          return;
        }

        if (!session?.access_token) {
          if (!cancelled) {
            setErrorMessage("No session found. Please try signing in again.");
            setStatus("error");
          }
          return;
        }

        await onboard(session.access_token);
        if (!cancelled) router.replace(nextPath);
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
          setStatus("error");
        }
      }
    }

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams, supabase.auth]);

  if (status === "error") {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "#05070A" }}
      >
        <div className="w-full max-w-md rounded-[14px] border p-8 text-center" style={{ backgroundColor: "#0B0F14", borderColor: "#1A212B" }}>
          <p className="text-sm text-[#E6EDF3]">{errorMessage}</p>
          <Link
            href="/login"
            className="mt-6 inline-block rounded-[10px] bg-[#10A37F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0e8f6f]"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#05070A" }}
    >
      <Image
        src={BRAND_LOCKUP_SRC}
        alt="VRTL Score"
        width={BRAND_LOCKUP_IMAGE_WIDTH}
        height={BRAND_LOCKUP_IMAGE_HEIGHT}
        className="mb-6 h-11 w-auto max-w-[min(240px,85vw)] bg-transparent object-contain object-center opacity-95 animate-pulse"
        priority
        sizes="(max-width: 768px) 85vw, 240px"
        unoptimized={BRAND_LOCKUP_IMAGE_UNOPTIMIZED}
      />
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A212B] border-t-[#10A37F]"
      />
      <p className="mt-4 text-sm text-[#8B98A5]">Completing sign-in…</p>
    </main>
  );
}
