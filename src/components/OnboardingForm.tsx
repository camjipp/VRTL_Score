"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

function normalizeWebsite(input: string): string {
  const raw = input.trim();
  if (!raw) return "";
  if (!raw.includes("://")) return `https://${raw}`;
  return raw;
}

function isInternalPath(p: string | null | undefined): p is string {
  return typeof p === "string" && p.startsWith("/");
}

type AgencySettings = {
  agency_id: string;
  name: string;
  brand_logo_url?: string | null;
  brand_accent?: string | null;
};

async function onboardApi(accessToken: string) {
  const res = await fetch("/api/onboard", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Onboard failed (${res.status})`);
  }
  return (await res.json()) as { agency_id: string };
}

export function OnboardingForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const website = useMemo(() => normalizeWebsite(sp.get("website") ?? ""), [sp]);
  const nextPath = useMemo(() => sp.get("next") ?? "/app", [sp]);

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  // Agency setup state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      if (data.session) {
        loadAgencySettings(data.session.access_token);
      }
    }
    checkAuth();
  }, [supabase.auth]);

  async function loadAgencySettings(accessToken: string) {
    setLoading(true);
    setError(null);
    try {
      await onboardApi(accessToken);
      const res = await fetch("/api/agency/settings", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as AgencySettings;
      setAgencyName(json.name && json.name !== "New Agency" ? json.name : "");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // Handle logo preview
  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  // Sign up handler
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthBusy(true);
    try {
      const result = await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;

      const session = result.data.session ?? (await supabase.auth.getSession()).data.session;
      if (!session?.access_token) {
        setAuthError("Account created! Please check your email to confirm, then return here.");
        return;
      }

      setIsAuthenticated(true);
      await loadAgencySettings(session.access_token);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : String(err));
    } finally {
      setAuthBusy(false);
    }
  }

  // Finish agency setup
  async function finishSetup(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error("Not authenticated");

      const name = agencyName.trim();
      if (!name) throw new Error("Please enter your agency name.");

      const upd = await fetch("/api/agency/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name, brand_accent: null })
      });
      if (!upd.ok) throw new Error(await upd.text());

      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const up = await fetch("/api/agency/logo", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: fd
        });
        if (!up.ok) throw new Error(await up.text());
      }

      // Check entitlements
      const ent = await fetch("/api/entitlements", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!ent.ok && ent.status === 403) {
        router.replace(`/pricing?next=${encodeURIComponent(isInternalPath(nextPath) ? nextPath : "/app")}`);
        return;
      }

      router.replace(isInternalPath(nextPath) ? nextPath : "/app");
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : String(e2));
    } finally {
      setSaving(false);
    }
  }

  // Determine current step
  const currentStep = isAuthenticated === null ? 0 : isAuthenticated ? 2 : 1;

  return (
    <main className="min-h-screen bg-bg">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="container-xl relative py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-10 text-center">
            {/* Progress indicator */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                currentStep >= 1 ? "bg-emerald-500 text-white" : "bg-surface-2 text-text-3"
              )}>
                {currentStep > 1 ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : "1"}
              </div>
              <div className={cn("h-0.5 w-12 rounded-full transition-colors", currentStep > 1 ? "bg-emerald-500" : "bg-border")} />
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                currentStep >= 2 ? "bg-emerald-500 text-white" : "bg-surface-2 text-text-3"
              )}>
                2
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
              {currentStep <= 1 ? "Create your account" : "Set up your agency"}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-text-2">
              {currentStep <= 1
                ? "Get started with VRTL Score in under a minute."
                : "This info appears on your reports and PDFs. You can update it anytime."}
            </p>
          </div>

          {/* Content */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left: Form */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl md:p-8">
              {/* Loading state */}
              {isAuthenticated === null && (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-text/20 border-t-text" />
                </div>
              )}

              {/* Step 1: Create account */}
              {isAuthenticated === false && (
                <>
                  {website && (
                    <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-text-3">Your first client</div>
                          <div className="font-medium text-text">{website}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <form className="space-y-5" onSubmit={handleSignUp}>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-text">Email</label>
                      <Input
                        autoComplete="email"
                        className="h-12 rounded-xl text-base"
                        disabled={authBusy}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@agency.com"
                        required
                        type="email"
                        value={email}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-text">Password</label>
                      <Input
                        autoComplete="new-password"
                        className="h-12 rounded-xl text-base"
                        disabled={authBusy}
                        minLength={8}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="8+ characters"
                        required
                        type="password"
                        value={password}
                      />
                    </div>

                    {authError && (
                      <Alert variant={authError.includes("confirm") ? "warning" : "danger"}>
                        <AlertDescription>{authError}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      className="h-12 w-full rounded-xl text-base"
                      disabled={authBusy}
                      type="submit"
                      variant="primary"
                    >
                      {authBusy ? (
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating account...
                        </span>
                      ) : (
                        "Create account"
                      )}
                    </Button>

                    <p className="text-center text-sm text-text-3">
                      Already have an account?{" "}
                      <Link href="/login" className="font-medium text-text hover:underline">
                        Sign in
                      </Link>
                    </p>
                  </form>
                </>
              )}

              {/* Step 2: Agency setup */}
              {isAuthenticated === true && (
                <>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-text/20 border-t-text" />
                    </div>
                  ) : (
                    <form className="space-y-6" onSubmit={finishSetup}>
                      {error && (
                        <Alert variant="danger">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      {/* Agency name */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text">Agency name</label>
                        <Input
                          className="h-12 rounded-xl text-base"
                          disabled={saving}
                          onChange={(e) => setAgencyName(e.target.value)}
                          placeholder="Acme Agency"
                          value={agencyName}
                        />
                        <p className="mt-2 text-xs text-text-3">This appears in the header of your reports</p>
                      </div>

                      {/* Logo upload */}
                      <div>
                        <label className="mb-2 block text-sm font-medium text-text">
                          Agency logo <span className="font-normal text-text-3">(optional)</span>
                        </label>
                        <div
                          className={cn(
                            "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
                            logoPreview
                              ? "border-emerald-500/50 bg-emerald-500/5"
                              : "border-border hover:border-text/30 hover:bg-surface-2"
                          )}
                          onClick={() => document.getElementById("logo-input")?.click()}
                        >
                          {logoPreview ? (
                            <div className="relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={logoPreview} alt="Logo preview" className="h-16 w-auto object-contain" />
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setLogoFile(null); }}
                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2">
                                <svg className="h-6 w-6 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                </svg>
                              </div>
                              <p className="mt-3 text-sm text-text-2">
                                <span className="font-medium text-text">Click to upload</span>
                              </p>
                              <p className="mt-1 text-xs text-text-3">PNG, JPG up to 2MB</p>
                            </>
                          )}
                          <input
                            id="logo-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={saving}
                            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                        <Button
                          className="h-12 flex-1 rounded-xl text-base"
                          disabled={saving || !agencyName.trim()}
                          type="submit"
                          variant="primary"
                        >
                          {saving ? "Saving..." : "Continue to dashboard"}
                        </Button>
                        <Button
                          className="h-12 rounded-xl text-base"
                          disabled={saving}
                          onClick={() => router.replace(isInternalPath(nextPath) ? nextPath : "/app")}
                          type="button"
                          variant="secondary"
                        >
                          Skip
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>

            {/* Right: Preview / Info */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                {currentStep <= 1 ? (
                  /* Benefits for sign-up step */
                  <div className="space-y-4">
                    <div className="text-sm font-medium text-text-3">What you&apos;ll get</div>
                    {[
                      { icon: "🎯", title: "AI Visibility Scoring", desc: "Measure how often your brand is recommended by ChatGPT, Gemini, and Claude." },
                      { icon: "📊", title: "Evidence & Insights", desc: "See exactly what LLMs say about you and your competitors." },
                      { icon: "📄", title: "Client-Ready Reports", desc: "Generate professional PDFs with your branding in one click." },
                      { icon: "📈", title: "Track Progress", desc: "Compare snapshots month-over-month to prove your value." },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-4 rounded-xl bg-surface p-4 border border-border">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-medium text-text">{item.title}</div>
                          <div className="mt-1 text-sm text-text-2">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Report preview for agency setup step */
                  <>
                    <div className="mb-4 text-sm font-medium text-text-3">Preview: Your report header</div>
                    <div className="rounded-2xl border border-border bg-white p-6 shadow-xl">
                      <div className="flex items-start justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-3">
                          {logoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoPreview} alt="Logo" className="h-10 w-auto object-contain" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-text/10 to-text/5 text-sm font-bold text-text">
                              {agencyName ? agencyName.charAt(0).toUpperCase() : "A"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-text">{agencyName || "Your Agency Name"}</div>
                            <div className="text-xs text-text-3">AI Visibility Report</div>
                          </div>
                        </div>
                        <div className="text-right text-xs text-text-3">
                          <div>Jan 21, 2026</div>
                          <div>{website || "client.com"}</div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="h-3 w-3/4 rounded bg-surface-2" />
                        <div className="h-3 w-1/2 rounded bg-surface-2" />
                      </div>
                    </div>

                    <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface-2 p-4">
                      <span className="text-lg">💡</span>
                      <div>
                        <div className="text-sm font-medium text-text">Pro tip</div>
                        <div className="text-xs text-text-2">Use a transparent PNG logo for best results on reports.</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
