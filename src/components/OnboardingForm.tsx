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

const goalOptions = [
  { id: "reporting", label: "Client reporting & retention", icon: "📊" },
  { id: "competitive", label: "Competitive intelligence", icon: "🔍" },
  { id: "service", label: "Adding AI visibility as a service", icon: "🚀" },
  { id: "exploring", label: "Just exploring", icon: "👀" },
];

const sizeOptions = [
  { id: "small", label: "1-5 clients", desc: "Getting started" },
  { id: "medium", label: "6-20 clients", desc: "Growing agency" },
  { id: "large", label: "20+ clients", desc: "Established agency" },
];

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
  
  // Progressive setup steps
  const [setupStep, setSetupStep] = useState(1);
  const [agencyName, setAgencyName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const totalSetupSteps = 4;

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
      const err = e as { message?: string };
      setError(err?.message || String(e));
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
  async function finishSetup() {
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
        body: JSON.stringify({ 
          name, 
          brand_accent: null,
          // Store survey data as metadata (optional - could add these columns later)
          // goal: selectedGoal,
          // team_size: selectedSize,
        })
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-surface to-bg">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        {/* Loading state */}
        {isAuthenticated === null && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-text/20 border-t-text" />
          </div>
        )}

        {/* Step 1: Create account */}
        {isAuthenticated === false && (
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: Form */}
            <div>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  7-day free trial
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                  Start tracking AI visibility
                </h1>
                <p className="mt-3 text-lg text-text-2">
                  See how your clients rank across leading AI models. Try free for 7 days.
                </p>
              </div>

              {website && (
                <div className="mb-6 rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                      <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-emerald-700">Your first client</div>
                      <div className="font-medium text-text">{website}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-border bg-white p-6 shadow-xl sm:p-8">
                <form className="space-y-5" onSubmit={handleSignUp}>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-text">Work email</label>
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
                    className="h-12 w-full rounded-xl text-base shadow-lg shadow-accent/20"
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
                      "Start free trial →"
                    )}
                  </Button>

                  <p className="text-center text-sm text-text-3">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-accent hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>

              <p className="mt-6 text-center text-xs text-text-3">
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>

            {/* Right: Benefits */}
            <div className="hidden lg:block">
              <div className="sticky top-8">
                <div className="mb-6 text-sm font-medium text-text-3">
                  What you&apos;ll get
                </div>

                <div className="space-y-4">
                  {[
                    { icon: "📊", title: "AI Visibility Scores", desc: "Measure how often your clients are recommended by leading AI models." },
                    { icon: "🔍", title: "Competitive Intelligence", desc: "See who's winning the AI recommendation battle in your client's space." },
                    { icon: "📄", title: "Client-Ready Reports", desc: "Generate branded PDFs that prove your SEO value to clients." },
                    { icon: "📈", title: "Track Progress", desc: "Compare snapshots over time to show measurable improvement." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4 rounded-2xl border border-border bg-white p-5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-semibold text-text">{item.title}</div>
                        <div className="mt-1 text-sm text-text-2">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progressive Setup Flow */}
        {isAuthenticated === true && (
          <div className="mx-auto max-w-xl">
            {loading ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-text/20 border-t-text" />
              </div>
            ) : (
              <>
                {/* Progress indicator */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-text-3">Step {setupStep} of {totalSetupSteps}</span>
                    <button
                      type="button"
                      onClick={() => finishSetup()}
                      className="text-sm text-text-3 hover:text-text"
                    >
                      Skip setup
                    </button>
                  </div>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-border">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${(setupStep / totalSetupSteps) * 100}%` }}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step 1: Agency Name */}
                {setupStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-8 text-center">
                      <span className="text-4xl">👋</span>
                      <h1 className="mt-4 text-2xl font-bold text-text sm:text-3xl">
                        What&apos;s your agency called?
                      </h1>
                      <p className="mt-2 text-text-2">
                        This will appear on all your client reports.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-6 shadow-xl sm:p-8">
                      <Input
                        autoFocus
                        className="h-14 rounded-xl text-center text-lg"
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="Acme Agency"
                        value={agencyName}
                      />
                      <Button
                        className="mt-6 h-12 w-full rounded-xl text-base"
                        disabled={!agencyName.trim()}
                        onClick={() => setSetupStep(2)}
                        type="button"
                        variant="primary"
                      >
                        Continue →
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: What brings you here */}
                {setupStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-8 text-center">
                      <span className="text-4xl">🎯</span>
                      <h1 className="mt-4 text-2xl font-bold text-text sm:text-3xl">
                        What brings you to VRTL Score?
                      </h1>
                      <p className="mt-2 text-text-2">
                        This helps us tailor your experience.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {goalOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedGoal(option.id);
                            setTimeout(() => setSetupStep(3), 200);
                          }}
                          className={cn(
                            "flex w-full items-center gap-4 rounded-2xl border-2 bg-white p-5 text-left transition-all",
                            selectedGoal === option.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-border hover:border-text/20 hover:shadow-md"
                          )}
                        >
                          <span className="text-2xl">{option.icon}</span>
                          <span className="font-medium text-text">{option.label}</span>
                          {selectedGoal === option.id && (
                            <svg className="ml-auto h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSetupStep(1)}
                      className="mt-6 w-full text-center text-sm text-text-3 hover:text-text"
                    >
                      ← Back
                    </button>
                  </div>
                )}

                {/* Step 3: Team size */}
                {setupStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-8 text-center">
                      <span className="text-4xl">📈</span>
                      <h1 className="mt-4 text-2xl font-bold text-text sm:text-3xl">
                        How many clients do you manage?
                      </h1>
                      <p className="mt-2 text-text-2">
                        We&apos;ll recommend the right plan for you.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {sizeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedSize(option.id);
                            setTimeout(() => setSetupStep(4), 200);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-2xl border-2 bg-white p-5 text-left transition-all",
                            selectedSize === option.id
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-border hover:border-text/20 hover:shadow-md"
                          )}
                        >
                          <div>
                            <div className="font-medium text-text">{option.label}</div>
                            <div className="text-sm text-text-3">{option.desc}</div>
                          </div>
                          {selectedSize === option.id && (
                            <svg className="h-5 w-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSetupStep(2)}
                      className="mt-6 w-full text-center text-sm text-text-3 hover:text-text"
                    >
                      ← Back
                    </button>
                  </div>
                )}

                {/* Step 4: Logo (optional) */}
                {setupStep === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-8 text-center">
                      <span className="text-4xl">✨</span>
                      <h1 className="mt-4 text-2xl font-bold text-text sm:text-3xl">
                        Add your logo
                      </h1>
                      <p className="mt-2 text-text-2">
                        Make your reports look professional. You can skip this for now.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-6 shadow-xl sm:p-8">
                      <div className="flex flex-col items-center">
                        {logoPreview ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoPreview} alt="Logo preview" className="h-24 w-24 rounded-2xl object-contain bg-surface-2 p-2" />
                            <button
                              type="button"
                              onClick={() => setLogoFile(null)}
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow hover:bg-red-600"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => document.getElementById("logo-input")?.click()}
                            className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-2 text-text-3 transition-colors hover:border-text/30 hover:bg-surface-2/80"
                          >
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        )}
                        <input
                          id="logo-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                        />
                        
                        {!logoPreview && (
                          <p className="mt-4 text-sm text-text-3">PNG or JPG · Transparent works best</p>
                        )}

                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => document.getElementById("logo-input")?.click()}
                            className="mt-4 text-sm text-accent hover:underline"
                          >
                            Change logo
                          </button>
                        )}
                      </div>

                      <div className="mt-8 flex flex-col gap-3">
                        <Button
                          className="h-12 w-full rounded-xl text-base"
                          disabled={saving}
                          onClick={() => finishSetup()}
                          type="button"
                          variant="primary"
                        >
                          {saving ? (
                            <span className="flex items-center gap-2">
                              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Setting up...
                            </span>
                          ) : (
                            "Launch dashboard 🚀"
                          )}
                        </Button>
                        {!logoPreview && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => finishSetup()}
                            className="text-sm text-text-3 hover:text-text"
                          >
                            Skip for now
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSetupStep(3)}
                      className="mt-6 w-full text-center text-sm text-text-3 hover:text-text"
                    >
                      ← Back
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
