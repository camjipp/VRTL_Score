"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        setError("Connection failed. The server may be starting up — please try again in a moment.");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label className="mb-2 block text-sm font-medium text-text">
          Email
        </label>
        <Input
          autoComplete="email"
          className="h-12 rounded-xl text-base"
          disabled={busy}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@agency.com"
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-text">
            Password
          </label>
          <Link
            className="text-xs text-text-3 hover:text-text"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          autoComplete="current-password"
          className="h-12 rounded-xl text-base"
          disabled={busy}
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          type="password"
          value={password}
        />
      </div>

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        className="h-12 w-full rounded-xl text-base shadow-lg shadow-accent/20"
        disabled={busy}
        type="submit"
        variant="primary"
      >
        {busy ? "Signing in..." : "Sign in →"}
      </Button>

      <p className="text-center text-sm text-text-3">
        Don&apos;t have an account?{" "}
        <Link
          className="font-medium text-accent hover:underline"
          href="/onboarding"
        >
          Sign up
        </Link>
      </p>
      </form>

      {/* Full-screen branded loader during sign-in/onboarding */}
      {busy && (
        <div
          className="vrtl-app fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-bg/95 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <Image
            src="/brand/VRTL_Solo.png"
            alt=""
            width={180}
            height={64}
            className="mb-6 h-12 w-auto animate-pulse opacity-90"
            priority
          />
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-text-2" />
          <p className="mt-4 text-sm text-text-2">Signing you in…</p>
        </div>
      )}
    </>
  );
}
