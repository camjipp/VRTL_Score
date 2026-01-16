"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

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
      <h1 className="text-xl font-semibold">Log in</h1>
      <p className="mt-2 text-sm text-text-2">Use your email + password to access your agency workspace.</p>

      <div className="mt-4 flex gap-2 text-sm">
        <button
          className={`rounded-lg border border-border/70 px-3 py-1 ${mode === "signin" ? "bg-surface/60 font-semibold" : "bg-surface/20 text-text-2"}`}
          onClick={() => setMode("signin")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={`rounded-lg border border-border/70 px-3 py-1 ${mode === "signup" ? "bg-surface/60 font-semibold" : "bg-surface/20 text-text-2"}`}
          onClick={() => setMode("signup")}
          type="button"
        >
          Sign up
        </button>
      </div>

      <form className="mt-6 max-w-sm space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm">
          <div className="mb-1">Email</div>
          <input
            className="w-full rounded-lg border border-border/70 bg-bg1/60 px-3 py-2 text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/40"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block text-sm">
          <div className="mb-1">Password</div>
          <input
            className="w-full rounded-lg border border-border/70 bg-bg1/60 px-3 py-2 text-text placeholder:text-muted outline-none focus:ring-2 focus:ring-accent/40"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error ? (
          <div className="rounded-lg border border-red-400/40 bg-red-500/10 p-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button className="btn-primary w-full" disabled={busy} type="submit">
          {busy ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>
    </>
  );
}


