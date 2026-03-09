"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

/* VRTL onboarding design tokens (match dashboard) */
const ONBOARD = {
  pageBg: "#05070A",
  cardBg: "#0B0F14",
  border: "#1A212B",
  text: "#E6EDF3",
  textMuted: "#8B98A5",
  accent: "#10A37F",
  accentHover: "#0e8f6f",
  cardShadow: "0 10px 30px rgba(0,0,0,0.35)",
  buttonShadow: "0 6px 20px rgba(16,163,127,0.25)",
} as const;

function OnboardingHeader({ showExit }: { showExit: boolean }) {
  return (
    <header className="flex h-14 items-center justify-between border-b px-6 bg-[#05070A] border-[#1A212B]">
      <Link href="/" className="flex shrink-0 items-center">
        <Image src="/brand/VRTL_Solo.png" alt="VRTL Score" width={140} height={40} className="h-8 w-auto opacity-95" priority />
      </Link>
      {showExit && (
        <Link href="/" className="text-sm font-medium text-[#8B98A5] hover:text-[#E6EDF3] transition-colors">Exit setup</Link>
      )}
    </header>
  );
}

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
  { id: "reporting", label: "Client reporting" },
  { id: "competitive", label: "Competitive intelligence" },
  { id: "service", label: "Offer AI visibility as a service" },
  { id: "exploring", label: "Exploring the platform" },
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
  const [legalAccepted, setLegalAccepted] = useState(false);

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

  const LOAD_SETTINGS_TIMEOUT_MS = 25_000;

  async function loadAgencySettings(accessToken: string) {
    setLoading(true);
    setError(null);
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out. Please refresh and try again.")), LOAD_SETTINGS_TIMEOUT_MS);
      });
      const work = (async () => {
        await onboardApi(accessToken);
        const res = await fetch("/api/agency/settings", {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const json = (await res.json()) as AgencySettings;
        setAgencyName(json.name && json.name !== "New Agency" ? json.name : "");
      })();
      await Promise.race([work, timeoutPromise]);
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
    if (!legalAccepted) {
      setAuthError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setAuthBusy(true);
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            legal_accepted_at: new Date().toISOString(),
            legal_tos_version: "1.1",
            legal_privacy_version: "1.1"
          }
        }
      });
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

  // Finish agency setup. Logo upload is optional and must never block completion.
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
        })
      });
      if (!upd.ok) throw new Error(await upd.text());

      // Logo upload is optional. Do not block onboarding on storage/bucket errors.
      if (logoFile) {
        try {
          const fd = new FormData();
          fd.append("file", logoFile);
          const up = await fetch("/api/agency/logo", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: fd
          });
          if (!up.ok) {
            const errText = await up.text();
            if (typeof sessionStorage !== "undefined") {
              sessionStorage.setItem("onboarding_logo_failed", "1");
            }
            console.warn("Logo upload failed (onboarding continues):", errText);
          }
        } catch (logoErr) {
          if (typeof sessionStorage !== "undefined") {
            sessionStorage.setItem("onboarding_logo_failed", "1");
          }
          console.warn("Logo upload error (onboarding continues):", logoErr);
        }
      }

      // Check entitlements and redirect regardless of logo outcome
      const ent = await fetch("/api/entitlements", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!ent.ok && ent.status === 403) {
        router.replace(`/app/plans`);
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
    <main className="min-h-screen bg-[#05070A]">
      <OnboardingHeader showExit={isAuthenticated === true} />
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        {/* Loading state */}
        {isAuthenticated === null && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A212B] border-t-[#10A37F]" />
          </div>
        )}

        {/* Create account */}
        {isAuthenticated === false && (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
            <div>
              <div className="mb-5">
                <span className="inline-block rounded-md border px-2.5 py-1 text-xs font-medium bg-[#0B0F14] border-[#1A212B] text-[#8B98A5]">7-day free trial</span>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#E6EDF3] sm:text-3xl">
                  Start tracking AI visibility
                </h1>
                <p className="mt-1.5 text-base text-[#8B98A5]">
                  See how your clients rank across leading AI models. Try free for 7 days.
                </p>
              </div>

              {website && (
                <div className="mb-4 rounded-[12px] border p-4 bg-[#0B0F14] border-[#1A212B]" style={{ boxShadow: ONBOARD.cardShadow }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1A212B]">
                      <svg className="h-4 w-4 text-[#8B98A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#8B98A5]">First client</div>
                      <div className="font-medium text-[#E6EDF3]">{website}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-[12px] border p-6 sm:p-7 bg-[#0B0F14] border-[#1A212B]" style={{ boxShadow: ONBOARD.cardShadow }}>
                <form className="space-y-4" onSubmit={handleSignUp}>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#E6EDF3]">Work email</label>
                    <Input
                      autoComplete="email"
                      className="h-11 rounded-lg border-[#1A212B] bg-[#05070A] text-[#E6EDF3] placeholder:text-[#8B98A5] focus:ring-[#10A37F]/30 focus:border-[#1A212B]"
                      disabled={authBusy}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@agency.com"
                      required
                      type="email"
                      value={email}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#E6EDF3]">Password</label>
                    <Input
                      autoComplete="new-password"
                      className="h-11 rounded-lg border-[#1A212B] bg-[#05070A] text-[#E6EDF3] placeholder:text-[#8B98A5] focus:ring-[#10A37F]/30 focus:border-[#1A212B]"
                      disabled={authBusy}
                      minLength={8}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="8+ characters"
                      required
                      type="password"
                      value={password}
                    />
                  </div>

                  <label className="flex items-start gap-3 rounded-lg border border-[#1A212B] bg-[#05070A] px-3 py-2.5 text-sm text-[#8B98A5]">
                    <input
                      checked={legalAccepted}
                      className="mt-0.5 h-4 w-4 rounded border-[#1A212B] text-[#10A37F] accent-[#10A37F]"
                      disabled={authBusy}
                      onChange={(e) => setLegalAccepted(e.target.checked)}
                      type="checkbox"
                    />
                    <span>
                      I agree to the{" "}
                      <Link className="font-medium text-[#E6EDF3] underline underline-offset-2 hover:no-underline" href="/terms" target="_blank">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link className="font-medium text-[#E6EDF3] underline underline-offset-2 hover:no-underline" href="/privacy" target="_blank">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {authError && (
                    <Alert variant={authError.includes("confirm") ? "warning" : "danger"}>
                      <AlertDescription>{authError}</AlertDescription>
                    </Alert>
                  )}

                  <button
                    type="submit"
                    disabled={authBusy || !legalAccepted}
                    className="h-[52px] w-full rounded-[10px] text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 bg-[#10A37F] hover:bg-[#0e8f6f] border-0"
                    style={{ boxShadow: ONBOARD.buttonShadow }}
                  >
                    {authBusy ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      "Start free trial"
                    )}
                  </button>

                  <p className="text-center text-sm text-[#8B98A5]">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-[#8B98A5] hover:text-[#E6EDF3]">
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-8 space-y-3">
                <div className="text-xs font-medium uppercase tracking-wider text-[#8B98A5]">What you get</div>
                {[
                  { title: "AI visibility scores", desc: "Measure how often your clients are recommended by leading AI models." },
                  { title: "Competitive intelligence", desc: "See who ranks where in your client's space." },
                  { title: "Client-ready reports", desc: "Branded PDFs that prove your SEO value." },
                  { title: "Progress over time", desc: "Compare snapshots to show improvement." },
                ].map((item) => (
                  <div key={item.title} className="rounded-[12px] border p-4 bg-[#0B0F14] border-[#1A212B]" style={{ boxShadow: ONBOARD.cardShadow }}>
                    <div className="font-medium text-[#E6EDF3]">{item.title}</div>
                    <div className="mt-0.5 text-sm text-[#8B98A5]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Progressive Setup Flow */}
        {isAuthenticated === true && (
          <div className="mx-auto max-w-xl">
            {loading ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A212B] border-t-[#10A37F]" />
              </div>
            ) : (
              <>
                {/* Progress indicator */}
                <div className="mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[#8B98A5]">Step {setupStep} of {totalSetupSteps}</span>
                    <button
                      type="button"
                      onClick={() => finishSetup()}
                      className="text-xs font-medium text-[#8B98A5] hover:text-[#E6EDF3] transition-colors"
                    >
                      Skip setup
                    </button>
                  </div>
                  <div className="mt-2 h-[6px] overflow-hidden rounded-full bg-[#1A212B]">
                    <div
                      className="h-full rounded-full bg-[#10A37F] transition-all duration-300"
                      style={{ width: `${(setupStep / totalSetupSteps) * 100}%` }}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step 1: Agency Name */}
                {setupStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-4 text-center">
                      <h1 className="text-xl font-semibold text-[#E6EDF3] sm:text-2xl">
                        What&apos;s your agency name?
                      </h1>
                      <p className="mt-1 text-sm text-[#8B98A5]">
                        This will appear on client reports.
                      </p>
                    </div>

                    <div className="rounded-[12px] border p-6 bg-[#0B0F14] border-[#1A212B] sm:p-7" style={{ boxShadow: ONBOARD.cardShadow }}>
                      <Input
                        autoFocus
                        className="h-12 rounded-lg border-[#1A212B] bg-[#05070A] text-center text-[#E6EDF3] placeholder:text-[#8B98A5] focus:ring-[#10A37F]/30 focus:border-[#1A212B]"
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="Enter your agency name"
                        value={agencyName}
                      />
                      <button
                        type="button"
                        disabled={!agencyName.trim()}
                        onClick={() => setSetupStep(2)}
                        className="mt-5 h-[52px] w-full rounded-[10px] text-sm font-semibold text-white bg-[#10A37F] hover:bg-[#0e8f6f] disabled:opacity-50 transition-colors flex items-center justify-center"
                        style={{ boxShadow: ONBOARD.buttonShadow }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: How will you use */}
                {setupStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-4 text-center">
                      <h1 className="text-xl font-semibold text-[#E6EDF3] sm:text-2xl">
                        How will you use VRTL Score?
                      </h1>
                    </div>

                    <div className="space-y-2">
                      {goalOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedGoal(option.id);
                            setTimeout(() => setSetupStep(3), 200);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[12px] border p-4 text-left transition-all",
                            selectedGoal === option.id ? "border-[#10A37F] bg-[#0B0F14]" : "border-[#1A212B] bg-[#0B0F14] hover:bg-[#0f1419] hover:border-[#252d3a]"
                          )}
                          style={selectedGoal === option.id ? { boxShadow: "0 0 0 1px #10A37F, 0 0 12px rgba(16,163,127,0.15)" } : undefined}
                        >
                          <span className="font-medium text-[#E6EDF3]">{option.label}</span>
                          {selectedGoal === option.id && (
                            <svg className="h-5 w-5 shrink-0 text-[#10A37F]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <button type="button" onClick={() => setSetupStep(1)} className="mt-4 w-full text-center text-sm text-[#8B98A5] hover:text-[#E6EDF3]">
                      Back
                    </button>
                  </div>
                )}

                {/* Step 3: Team size */}
                {setupStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-4 text-center">
                      <h1 className="text-xl font-semibold text-[#E6EDF3] sm:text-2xl">
                        How many clients do you manage?
                      </h1>
                      <p className="mt-1 text-sm text-[#8B98A5]">
                        We&apos;ll recommend the right plan.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {sizeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedSize(option.id);
                            setTimeout(() => setSetupStep(4), 200);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-[12px] border p-4 text-left transition-all",
                            selectedSize === option.id ? "border-[#10A37F] bg-[#0B0F14]" : "border-[#1A212B] bg-[#0B0F14] hover:bg-[#0f1419] hover:border-[#252d3a]"
                          )}
                          style={selectedSize === option.id ? { boxShadow: "0 0 0 1px #10A37F, 0 0 12px rgba(16,163,127,0.15)" } : undefined}
                        >
                          <div>
                            <div className="font-medium text-[#E6EDF3]">{option.label}</div>
                            <div className="text-sm text-[#8B98A5]">{option.desc}</div>
                          </div>
                          {selectedSize === option.id && (
                            <svg className="h-5 w-5 shrink-0 text-[#10A37F]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <button type="button" onClick={() => setSetupStep(2)} className="mt-4 w-full text-center text-sm text-[#8B98A5] hover:text-[#E6EDF3]">
                      Back
                    </button>
                  </div>
                )}

                {/* Step 4: Logo (optional) */}
                {setupStep === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-4 text-center">
                      <h1 className="text-xl font-semibold text-[#E6EDF3] sm:text-2xl">
                        Add your agency logo
                      </h1>
                      <p className="mt-1 text-sm text-[#8B98A5]">
                        Used on reports. You can skip this for now.
                      </p>
                    </div>

                    <div className="rounded-[12px] border p-6 bg-[#0B0F14] border-[#1A212B] sm:p-7" style={{ boxShadow: ONBOARD.cardShadow }}>
                      <div className="flex flex-col items-center">
                        {logoPreview ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoPreview} alt="Logo preview" className="h-24 w-24 rounded-[12px] object-contain p-2 border bg-[#05070A] border-[#1A212B]" />
                            <button
                              type="button"
                              onClick={() => setLogoFile(null)}
                              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1A212B] text-[#8B98A5] hover:bg-[#252d3a] hover:text-[#E6EDF3] border border-[#1A212B]"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => document.getElementById("logo-input")?.click()}
                            className="flex h-24 w-24 flex-col items-center justify-center rounded-[12px] border border-dashed border-[#1A212B] bg-[#05070A] text-[#8B98A5] transition-colors hover:border-[#252d3a] hover:bg-[#0B0F14]"
                          >
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        )}
                        <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                        {!logoPreview && <p className="mt-3 text-xs text-[#8B98A5]">PNG or JPG. Transparent works best.</p>}
                        {logoPreview && (
                          <button type="button" onClick={() => document.getElementById("logo-input")?.click()} className="mt-3 text-sm text-[#8B98A5] hover:text-[#E6EDF3]">
                            Change logo
                          </button>
                        )}
                      </div>

                      <div className="mt-6 flex flex-col gap-2">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => finishSetup()}
                          className="h-[52px] w-full rounded-[10px] text-sm font-semibold text-white bg-[#10A37F] hover:bg-[#0e8f6f] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                          style={{ boxShadow: ONBOARD.buttonShadow }}
                        >
                          {saving ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Setting up...
                            </>
                          ) : (
                            "Launch dashboard"
                          )}
                        </button>
                        <button type="button" disabled={saving} onClick={() => finishSetup()} className="text-sm text-[#8B98A5] hover:text-[#E6EDF3]">
                          Skip for now
                        </button>
                      </div>
                    </div>

                    <button type="button" onClick={() => setSetupStep(3)} className="mt-4 w-full text-center text-sm text-[#8B98A5] hover:text-[#E6EDF3]">
                      Back
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
