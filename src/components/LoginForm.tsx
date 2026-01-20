"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";

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
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result =
        mode === "signup"
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;

      const session = result.data.session ?? (await supabase.auth.getSession()).data.session;
      const accessToken = session?.access_token;
      if (!accessToken) {
        setError(
          mode === "signup"
            ? "Account created. Please confirm your email, then return and sign in."
            : "Signed in but no session token was found. Please try again."
        );
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
    <>
      <h1 className="text-2xl font-semibold tracking-tight text-text">Log in</h1>
      <p className="mt-2 text-sm text-text-2">Use your email + password to access your workspace.</p>

      <div className="mt-6 inline-flex w-full max-w-sm rounded-2xl border border-border bg-bg-2 p-1 text-sm">
        <button
          className={`flex-1 rounded-xl px-3 py-2 transition ${mode === "signin" ? "bg-surface font-semibold text-text" : "text-text-2 hover:bg-surface-2"}`}
          onClick={() => setMode("signin")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`flex-1 rounded-xl px-3 py-2 transition ${mode === "signup" ? "bg-surface font-semibold text-text" : "text-text-2 hover:bg-surface-2"}`}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign up
        </button>
      </div>

      <form className="mt-6 w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <div className="mb-1 text-text-2">Email</div>
          <Input
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block text-sm">
          <div className="mb-1 text-text-2">Password</div>
          <Input
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error ? (
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button className="w-full" disabled={busy} type="submit" variant="primary">
          {busy ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
        </Button>
      </form>
    </>
  );
}


