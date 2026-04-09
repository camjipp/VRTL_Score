"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { Alert, AlertDescription } from "@/components/ui/Alert";

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

const inputBase =
  "w-full rounded-[10px] border px-4 py-3 text-[#E6EDF3] placeholder:text-[#8B98A5] transition-all focus:outline-none focus:border-[#10A37F] focus:shadow-[0_0_0_1px_#10A37F] bg-[#0E141B] border-[#1A212B]";

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
      // Never redirect to localhost when user is on production: use server origin, or current origin if we're on a live site.
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
      // Supabase redirects the window; no further action here
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. Try again or use email.");
    }
  }

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#E6EDF3]">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            placeholder="you@agency.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            className={inputBase}
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-[#E6EDF3]">Password</label>
            <Link
              className="text-xs text-[#8B98A5] hover:text-[#10A37F] transition-colors"
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
            className={inputBase}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={busy}
            className="h-4 w-4 rounded border-[#1A212B] text-[#10A37F] accent-[#10A37F] bg-[#0E141B]"
          />
          <span className="text-sm text-[#8B98A5]">Remember me</span>
        </label>

        {error && (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full h-12 rounded-[10px] text-base font-semibold text-white transition-colors disabled:opacity-50 bg-[#10A37F] hover:bg-[#0e8f6f]"
        >
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* OR divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#1A212B]" />
        <span className="text-xs font-medium text-[#8B98A5]">OR</span>
        <div className="flex-1 h-px bg-[#1A212B]" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
        className="w-full h-12 rounded-[10px] border text-sm font-medium text-[#E6EDF3] border-[#1A212B] bg-[#0E141B] hover:border-[#10A37F]/50 hover:bg-[#0E141B] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
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

      <p className="mt-6 text-center text-sm text-[#8B98A5]">
        New to VRTL?{" "}
        <Link href="/signup" className="font-medium text-[#10A37F] hover:underline">
          Sign up
        </Link>
      </p>

      {/* Full-screen loader during sign-in */}
      {busy && (
        <div
          className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[#05070A]/95 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <Image
            src="/brand/VRTL_Solo.png"
            alt=""
            width={180}
            height={64}
            className="mb-6 h-12 w-auto brightness-0 invert opacity-95 animate-pulse"
            priority
          />
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-[#1A212B] border-t-[#10A37F]"
          />
          <p className="mt-4 text-sm text-[#8B98A5]">Signing you in…</p>
        </div>
      )}
    </>
  );
}
