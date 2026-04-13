"use client";

import Image from "next/image";
import Link from "next/link";

import {
  BRAND_LOCKUP_IMAGE_UNOPTIMIZED,
  BRAND_LOCKUP_INTRINSIC_SIZE,
  BRAND_LOCKUP_SRC,
} from "@/lib/brand/logo";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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

const inputClass =
  "auth-input w-full rounded-md border border-white/[0.1] bg-[#141414] px-[14px] py-3 text-sm text-[var(--text-primary)] placeholder:text-[#555] outline-none transition-shadow disabled:opacity-50";

export function LoginForm({ nextPath, siteOrigin = "" }: { nextPath: string; siteOrigin?: string }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;

      const session = result.data.session ?? (await supabase.auth.getSession()).data.session;
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError("Signed in but no session token was found. Please try again.");
        return;
      }

      await onboard(accessToken);
      router.push(nextPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "Failed to fetch" || msg.includes("load failed") || msg.includes("NetworkError")) {
        setError("Connection failed. The server may be starting up. Please try again in a moment.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    try {
      const currentOrigin =
        typeof window !== "undefined" ? window.location.origin : "";
      const serverOrigin = siteOrigin ? siteOrigin.replace(/\/$/, "") : "";
      const isLocalhost = (url: string) =>
        /^https?:\/\/localhost(:\d+)?(\/|$)/i.test(url) || url.startsWith("http://127.0.0.1");
      let baseUrl = serverOrigin || currentOrigin;
      if (currentOrigin && !isLocalhost(currentOrigin) && (!baseUrl || isLocalhost(baseUrl))) {
        baseUrl = currentOrigin;
      }
      if (!baseUrl) {
        setError("Could not determine app URL. Please refresh and try again.");
        return;
      }
      const callbackUrl =
        nextPath && nextPath !== "/app"
          ? `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`
          : `${baseUrl}/auth/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
      if (oauthError) {
        setError(oauthError.message || "Google sign-in failed. Try again or use email.");
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Try again or use email.");
    }
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className={inputClass}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
              Password
            </label>
            <Link
              className="font-marketing-mono text-[11px] tracking-[0.04em] text-[var(--text-muted)] transition-colors hover:text-[var(--accent-marketing)]"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            className={inputClass}
          />
        </div>

        <label className="flex cursor-pointer items-center gap-2.5">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={busy}
            className="h-4 w-4 rounded border-white/15 bg-[#141414] accent-[var(--accent-marketing)]"
          />
          <span className="text-sm font-light text-[var(--text-secondary)]">Remember me</span>
        </label>

        {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <button
          type="submit"
          disabled={busy}
          className="font-marketing-body mt-1 w-full cursor-pointer rounded-md border-0 bg-[var(--accent-marketing)] py-3.5 text-sm font-medium text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="font-marketing-mono text-[11px] tracking-[0.08em] text-[var(--text-muted)]">OR</span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="font-marketing-body flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-white/[0.1] bg-[#161616] py-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-white/[0.16] hover:bg-[#1a1a1a] hover:text-[var(--text-primary)] disabled:opacity-50"
      >
        <svg className="h-5 w-5 shrink-0 opacity-80" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      <p className="mt-8 text-center text-sm font-light text-[var(--text-muted)]">
        New to VRTL?{" "}
        <Link href="/signup" className="text-[var(--accent-marketing)] transition-colors hover:underline">
          Sign up
        </Link>
      </p>

      {busy && (
        <div
          className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[var(--bg-base)]/95 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <Image
            src={BRAND_LOCKUP_SRC}
            alt=""
            width={BRAND_LOCKUP_INTRINSIC_SIZE}
            height={BRAND_LOCKUP_INTRINSIC_SIZE}
            className="mb-6 h-11 w-auto max-w-[min(240px,85vw)] bg-transparent object-contain object-center opacity-90 animate-pulse"
            priority
            sizes="(max-width: 768px) 85vw, 240px"
            unoptimized={BRAND_LOCKUP_IMAGE_UNOPTIMIZED}
          />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/[0.08] border-t-[var(--accent-marketing)]" />
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Signing you in…</p>
        </div>
      )}
    </>
  );
}
