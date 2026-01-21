"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

async function onboard(accessToken: string) {
  const res = await fetch("/api/onboard", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
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
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight text-text">Welcome back</h1>
      <p className="mt-2 text-sm text-text-2">
        Sign in to your account to continue.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Email
          </label>
          <Input
            autoComplete="email"
            className="h-12 rounded-xl text-base"
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
          className="h-12 w-full rounded-xl text-base"
          disabled={busy}
          type="submit"
          variant="primary"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-text-2">
          Don&apos;t have an account?{" "}
          <Link
            className="font-medium text-text hover:underline"
            href="/onboarding"
          >
            Get started free
          </Link>
        </p>
      </div>
    </div>
  );
}
