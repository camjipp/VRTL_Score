"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";
import {
  BRAND_LOCKUP_IMAGE_HEIGHT,
  BRAND_LOCKUP_IMAGE_UNOPTIMIZED,
  BRAND_LOCKUP_IMAGE_WIDTH,
  BRAND_LOCKUP_SRC,
} from "@/lib/brand/logo";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

const authInputClass =
  "auth-input w-full rounded-md border border-white/[0.1] bg-[#141414] px-[14px] py-3 text-sm text-[var(--text-primary)] placeholder:text-[#555] outline-none transition-shadow disabled:opacity-50";

const panelClass =
  "rounded-xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8";

const primaryBtnClass =
  "font-marketing-body flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-[var(--accent-marketing)] text-sm font-medium text-black transition hover:brightness-110 disabled:opacity-50";

function OnboardingHeader({ showExit }: { showExit: boolean }) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[var(--bg-base)] px-6 md:px-10 md:h-14">
      <Link
        href="/"
        className="flex h-[38px] shrink-0 items-center md:h-[43px]"
      >
        <Image
          src={BRAND_LOCKUP_SRC}
          alt="VRTL Score"
          width={BRAND_LOCKUP_IMAGE_WIDTH}
          height={BRAND_LOCKUP_IMAGE_HEIGHT}
          className="h-full w-auto max-w-[min(260px,72vw)] bg-transparent object-contain object-left md:max-w-[min(300px,50vw)]"
          priority
          sizes="(max-width: 768px) 72vw, 300px"
          unoptimized={BRAND_LOCKUP_IMAGE_UNOPTIMIZED}
        />
      </Link>
      {showExit && (
        <Link
          href="/"
          className="font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          Exit setup
        </Link>
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

/** Supabase / auth providers use several phrasings for an existing email on sign-up. */
function isAlreadyRegisteredAuthMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already exists") ||
    m.includes("email address is already") ||
    m.includes("already in use")
  );
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
    headers: { Authorization: `Bearer ${accessToken}` },
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

const valuePoints = [
  {
    title: "Visibility across major AI models",
    desc: "See how clients surface in ChatGPT, Gemini, Claude, and more.",
  },
  {
    title: "Competitive displacement detection",
    desc: "Spot when competitors replace your clients in model answers.",
  },
  {
    title: "Client-ready reporting",
    desc: "Branded outputs you can deliver in QBRs and renewals.",
  },
  {
    title: "Snapshot-based progress tracking",
    desc: "Compare runs over time to prove momentum.",
  },
];

export function OnboardingForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const website = useMemo(() => normalizeWebsite(sp.get("website") ?? ""), [sp]);
  const nextPath = useMemo(() => sp.get("next") ?? "/app", [sp]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [setupStep, setSetupStep] = useState(1);
  const [agencyName, setAgencyName] = useState("");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const totalSetupSteps = 4;

  useEffect(() => {
    async function checkAuth() {
      const signupIntent = sp.get("signup") === "1";
      const keepSessionForTesting = sp.get("test") === "1";
      const { data } = await supabase.auth.getSession();

      if (signupIntent && !keepSessionForTesting && data.session) {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(!!data.session);
      if (data.session) {
        loadAgencySettings(data.session.access_token);
      }
    }
    checkAuth();
  }, [supabase.auth, sp]);

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
          headers: { Authorization: `Bearer ${accessToken}` },
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

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

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
            legal_privacy_version: "1.1",
          },
        },
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
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          brand_accent: null,
        }),
      });
      if (!upd.ok) throw new Error(await upd.text());

      if (logoFile) {
        try {
          const fd = new FormData();
          fd.append("file", logoFile);
          const up = await fetch("/api/agency/logo", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
            body: fd,
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

      const ent = await fetch("/api/entitlements", {
        headers: { Authorization: `Bearer ${accessToken}` },
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
    <main className="page-marketing min-h-screen">
      <OnboardingHeader showExit={isAuthenticated === true} />
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14 lg:px-12">
        {isAuthenticated === null && (
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/[0.08] border-t-[var(--accent-marketing)]" />
          </div>
        )}

        {isAuthenticated === false && (
          <div className="grid gap-14 lg:grid-cols-2 lg:items-start lg:gap-20">
            <div className="min-w-0 lg:max-w-xl">
              <p className="mb-4 font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]">
                {"// CREATE ACCOUNT"}
              </p>
              <h1 className="mb-3 max-w-lg font-marketing-display text-[2rem] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--text-primary)] md:text-[2.35rem]">
                Start tracking AI visibility.
              </h1>
              <p className="mb-8 max-w-md font-marketing-body text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">
                Create your account to access snapshots, reporting, and competitive visibility analysis.
              </p>

              {website && (
                <div className={`mb-6 ${panelClass}`}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-[#141414]">
                      <svg className="h-4 w-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-marketing-mono text-[10px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                        First client
                      </div>
                      <div className="font-marketing-body text-sm font-medium text-[var(--text-primary)]">{website}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className={panelClass}>
                <form className="space-y-5" onSubmit={handleSignUp}>
                  <div>
                    <label className="mb-2 block font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Work email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@agency.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={authBusy}
                      className={authInputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block font-marketing-mono text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Password
                    </label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      placeholder="8+ characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={authBusy}
                      className={authInputClass}
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/[0.08] bg-[#141414]/60 px-3 py-3">
                    <input
                      checked={legalAccepted}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/15 bg-[#141414] accent-[var(--accent-marketing)]"
                      disabled={authBusy}
                      onChange={(e) => setLegalAccepted(e.target.checked)}
                      type="checkbox"
                    />
                    <span className="text-sm font-light leading-relaxed text-[var(--text-secondary)]">
                      I agree to the{" "}
                      <Link
                        className="text-[var(--text-primary)] underline decoration-white/20 underline-offset-2 transition-colors hover:text-[var(--accent-marketing)]"
                        href="/terms"
                        target="_blank"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        className="text-[var(--text-primary)] underline decoration-white/20 underline-offset-2 transition-colors hover:text-[var(--accent-marketing)]"
                        href="/privacy"
                        target="_blank"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {authError &&
                    (isAlreadyRegisteredAuthMessage(authError) ? (
                      <div
                        className="mt-4 rounded-md border border-white/[0.1] bg-[#141414]/50 px-3.5 py-3 sm:px-4"
                        role="status"
                      >
                        <p className="text-center text-sm font-light leading-relaxed text-[var(--text-secondary)] sm:text-left">
                          Already have an account?{" "}
                          <Link
                            href="/login"
                            className="font-medium text-[var(--accent-marketing)] transition-colors hover:underline hover:opacity-95"
                          >
                            Sign in
                          </Link>{" "}
                          to continue.
                        </p>
                      </div>
                    ) : (
                      <Alert variant={authError.includes("confirm") ? "warning" : "danger"}>
                        <AlertDescription>{authError}</AlertDescription>
                      </Alert>
                    ))}

                  <button type="submit" disabled={authBusy || !legalAccepted} className={primaryBtnClass}>
                    {authBusy ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>

                  <p className="pt-1 text-center text-sm font-light text-[var(--text-muted)]">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--accent-marketing)] transition-colors hover:underline">
                      Sign in
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            <aside className="hidden lg:block lg:border-l lg:border-white/[0.06] lg:pl-14">
              <p className="mb-5 font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]">
                {"// PLATFORM"}
              </p>
              <h2 className="mb-10 max-w-sm font-marketing-display text-[1.65rem] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--text-primary)]">
                Built for agencies who sell on clarity.
              </h2>
              <ul className="space-y-8">
                {valuePoints.map((item) => (
                  <li key={item.title} className="border-l border-[var(--accent-marketing)]/25 pl-5">
                    <p className="font-marketing-body text-[15px] font-medium text-[var(--text-primary)]">{item.title}</p>
                    <p className="mt-1.5 font-marketing-body text-sm font-light leading-relaxed text-[var(--text-secondary)]">
                      {item.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}

        {isAuthenticated === true && (
          <div className="mx-auto max-w-xl">
            {loading ? (
              <div className="flex min-h-[50vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/[0.08] border-t-[var(--accent-marketing)]" />
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <span className="font-marketing-mono text-[11px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
                      Step {setupStep} of {totalSetupSteps}
                    </span>
                    <button
                      type="button"
                      onClick={() => finishSetup()}
                      className="font-marketing-mono text-[11px] uppercase tracking-[0.06em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      Skip setup
                    </button>
                  </div>
                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[var(--accent-marketing)] transition-all duration-300"
                      style={{ width: `${(setupStep / totalSetupSteps) * 100}%` }}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {setupStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 text-center lg:text-left">
                      <h1 className="font-marketing-display text-xl font-normal text-[var(--text-primary)] sm:text-2xl">
                        What&apos;s your agency name?
                      </h1>
                      <p className="mt-2 text-sm font-light text-[var(--text-secondary)]">This will appear on client reports.</p>
                    </div>

                    <div className={panelClass}>
                      <input
                        autoFocus
                        className={`${authInputClass} text-center lg:text-left`}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="Enter your agency name"
                        value={agencyName}
                      />
                      <button
                        type="button"
                        disabled={!agencyName.trim()}
                        onClick={() => setSetupStep(2)}
                        className={`${primaryBtnClass} mt-5`}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {setupStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 text-center lg:text-left">
                      <h1 className="font-marketing-display text-xl font-normal text-[var(--text-primary)] sm:text-2xl">
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
                            "flex w-full items-center justify-between rounded-lg border px-4 py-3.5 text-left transition-all",
                            selectedGoal === option.id
                              ? "border-[var(--accent-marketing)]/40 bg-white/[0.04]"
                              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]",
                          )}
                        >
                          <span className="font-marketing-body text-sm font-medium text-[var(--text-primary)]">{option.label}</span>
                          {selectedGoal === option.id && (
                            <svg className="h-5 w-5 shrink-0 text-[var(--accent-marketing)]" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSetupStep(1)}
                      className="mt-6 w-full text-center text-sm font-light text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      Back
                    </button>
                  </div>
                )}

                {setupStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 text-center lg:text-left">
                      <h1 className="font-marketing-display text-xl font-normal text-[var(--text-primary)] sm:text-2xl">
                        How many clients do you manage?
                      </h1>
                      <p className="mt-2 text-sm font-light text-[var(--text-secondary)]">We&apos;ll recommend the right plan.</p>
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
                            "flex w-full items-center justify-between rounded-lg border px-4 py-3.5 text-left transition-all",
                            selectedSize === option.id
                              ? "border-[var(--accent-marketing)]/40 bg-white/[0.04]"
                              : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.03]",
                          )}
                        >
                          <div>
                            <div className="font-marketing-body text-sm font-medium text-[var(--text-primary)]">{option.label}</div>
                            <div className="text-xs font-light text-[var(--text-secondary)]">{option.desc}</div>
                          </div>
                          {selectedSize === option.id && (
                            <svg className="h-5 w-5 shrink-0 text-[var(--accent-marketing)]" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setSetupStep(2)}
                      className="mt-6 w-full text-center text-sm font-light text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      Back
                    </button>
                  </div>
                )}

                {setupStep === 4 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 text-center lg:text-left">
                      <h1 className="font-marketing-display text-xl font-normal text-[var(--text-primary)] sm:text-2xl">
                        Add your agency logo
                      </h1>
                      <p className="mt-2 text-sm font-light text-[var(--text-secondary)]">Used on reports. You can skip this for now.</p>
                    </div>

                    <div className={panelClass}>
                      <div className="flex flex-col items-center">
                        {logoPreview ? (
                          <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="h-24 w-24 rounded-lg border border-white/[0.08] bg-[#141414] object-contain p-2"
                            />
                            <button
                              type="button"
                              onClick={() => setLogoFile(null)}
                              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/[0.1] bg-[#1a1a1a] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
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
                            className="flex h-24 w-24 flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.12] bg-[#141414]/50 text-[var(--text-muted)] transition-colors hover:border-white/[0.18] hover:bg-[#141414]"
                          >
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          </button>
                        )}
                        <input id="logo-input" type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)} />
                        {!logoPreview && <p className="mt-3 text-xs font-light text-[var(--text-muted)]">PNG or JPG. Transparent works best.</p>}
                        {logoPreview && (
                          <button
                            type="button"
                            onClick={() => document.getElementById("logo-input")?.click()}
                            className="mt-3 text-sm font-light text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          >
                            Change logo
                          </button>
                        )}
                      </div>

                      <div className="mt-6 flex flex-col gap-2">
                        <button type="button" disabled={saving} onClick={() => finishSetup()} className={primaryBtnClass}>
                          {saving ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Setting up...
                            </>
                          ) : (
                            "Launch dashboard"
                          )}
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => finishSetup()}
                          className="text-center text-sm font-light text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          Skip for now
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSetupStep(3)}
                      className="mt-6 w-full text-center text-sm font-light text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                    >
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
