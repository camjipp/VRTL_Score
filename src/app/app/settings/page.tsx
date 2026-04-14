"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

type AgencySettings = {
  agency_id: string;
  name: string;
  brand_logo_url?: string | null;
  brand_accent?: string | null;
};

type UserProfile = {
  email: string;
};

type SubscriptionInfo = {
  plan: string | null;
  is_active: boolean;
  has_stripe: boolean;
};

const SECTIONS = [
  { id: "profile", label: "Agency profile", icon: "building" },
  { id: "account", label: "Account", icon: "user" },
  { id: "subscription", label: "Subscription", icon: "card" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** Dashboard-aligned surface — subtle, same family as main app cards */
const cardSurface =
  "rounded-2xl border border-white/[0.08] bg-[#0B0F14]/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]";

const inputDark =
  "w-full rounded-lg border border-white/[0.08] bg-black/25 px-3.5 py-2.5 text-[13px] text-text placeholder:text-text-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-colors hover:bg-accent-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 disabled:opacity-50";

const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-transparent px-4 py-2.5 text-[13px] font-medium text-text-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50";

function SectionIcon({ icon, className }: { icon: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    building: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
        />
      </svg>
    ),
    user: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
    card: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
        />
      </svg>
    ),
  };
  return <>{icons[icon]}</>;
}

function getPlanDisplay(plan: string | null) {
  const plans: Record<string, { name: string; price: string }> = {
    starter: { name: "Starter", price: "$149/mo" },
    growth: { name: "Growth", price: "$399/mo" },
    pro: { name: "Pro", price: "$749/mo" },
  };
  return plans[plan || "starter"] || plans.starter;
}

function getPlanFeatures(plan: string | null): string[] {
  const p = (plan || "starter").toLowerCase();
  if (p === "pro") {
    return [
      "Higher snapshot volume and priority processing",
      "Full competitive set and export tooling",
      "Dedicated success and onboarding support",
    ];
  }
  if (p === "growth") {
    return ["Expanded client and snapshot limits", "Advanced reporting and share links", "Email support"];
  }
  return ["Core authority indexing across models", "PDF reports per snapshot", "Standard email support"];
}

export default function SettingsPage() {
  const supabase = getSupabaseBrowserClient();

  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { accessToken } = await ensureOnboarded();

        const settingsRes = await fetch("/api/agency/settings", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (settingsRes.ok) {
          const data = (await settingsRes.json()) as AgencySettings;
          setSettings(data);
          setName(data.name);
          if (data.brand_logo_url) setLogoPreview(data.brand_logo_url);
        }

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser?.email) {
          setUser({ email: authUser.email });
        }

        const { data: membership } = await supabase.from("agency_users").select("agency_id").eq("user_id", authUser?.id).maybeSingle();

        if (membership?.agency_id) {
          const { data: agency } = await supabase
            .from("agencies")
            .select("plan, is_active, stripe_customer_id")
            .eq("id", membership.agency_id)
            .maybeSingle();

          if (agency) {
            setSubscription({
              plan: agency.plan || "starter",
              is_active: agency.is_active ?? true,
              has_stripe: !!agency.stripe_customer_id,
            });
          }
        }
      } catch (e: unknown) {
        const err = e as { message?: string };
        setError(err?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { accessToken } = await ensureOnboarded();

      const res = await fetch("/api/agency/settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const logoRes = await fetch("/api/agency/logo", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        });

        if (!logoRes.ok) {
          const data = await logoRes.json();
          throw new Error(data.error || "Failed to upload logo");
        }

        const logoData = await logoRes.json();
        setLogoPreview(logoData.url);
        setLogoFile(null);
      }

      setSuccess(true);
      setSettings({ ...settings, name });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  async function openBillingPortal() {
    setPortalLoading(true);
    setError(null);

    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to open billing portal");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
      setPortalLoading(false);
    }
  }

  return (
    <div className="mx-auto min-w-0 max-w-[1100px] space-y-4 overflow-x-hidden px-5 pb-8 pt-3 sm:px-6 sm:pt-3.5">
      <nav className="flex items-center gap-1.5 text-[13px]">
        <Link href="/app" className="text-text-2 transition-colors hover:text-text">
          Clients
        </Link>
        <svg className="h-3.5 w-3.5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="font-medium text-text">Settings</span>
      </nav>

      <header>
        <h1 className="font-app-display text-xl font-normal tracking-tight text-text sm:text-2xl">Settings</h1>
        <p className="mt-1 text-[13px] text-text-3">Agency profile, account, and billing.</p>
      </header>

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertDescription>Saved.</AlertDescription>
        </Alert>
      )}

      {loading && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <div className="w-full shrink-0 lg:w-[11.5rem]">
            <div className="space-y-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={cn("h-9 animate-pulse rounded-lg bg-white/[0.04]")} />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className={cn("h-72 animate-pulse", cardSurface)} />
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
          <nav
            className="shrink-0 lg:w-[11.5rem] lg:border-r lg:border-white/[0.06] lg:pr-6"
            aria-label="Settings sections"
          >
            <div className="flex flex-row gap-1 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150",
                    "lg:w-full",
                    activeSection === section.id
                      ? "bg-white/[0.08] text-text"
                      : "text-text-3/70 hover:bg-white/[0.05] hover:text-text-2"
                  )}
                >
                  <SectionIcon
                    icon={section.icon}
                    className={cn(
                      "h-4 w-4 shrink-0",
                      activeSection === section.id ? "text-text" : "text-text-3/65"
                    )}
                  />
                  {section.label}
                </button>
              ))}
            </div>
          </nav>

          <div className="min-w-0 flex-1 space-y-4">
            {activeSection === "profile" && settings && (
              <form onSubmit={handleSaveProfile} className={cn(cardSurface)}>
                <div className="space-y-5 p-5 sm:p-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-3/85">Agency profile</p>
                    <h2 className="mt-1 text-base font-semibold tracking-tight text-text">Branding</h2>
                    <p className="mt-1 text-[13px] text-text-3">Shown on exported reports.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black/30 ring-1 ring-inset ring-white/[0.06]">
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-text-3">{name.charAt(0) || "A"}</span>
                      )}
                    </div>
                    <label className={cn(btnGhost, "cursor-pointer py-2")}>
                      Change logo
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                    <p className="w-full text-[11px] text-text-3 sm:w-auto sm:pl-1">JPG, PNG, or SVG · max 2MB</p>
                  </div>

                  <div className="max-w-md">
                    <label htmlFor="agency-name" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-3/90">
                      Agency name
                    </label>
                    <input
                      id="agency-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={cn(inputDark, "mt-2")}
                      placeholder="Your agency name"
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-white/[0.05] px-5 py-4 sm:px-6">
                  <button type="submit" disabled={saving} className={btnPrimary}>
                    {saving ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving…
                      </>
                    ) : (
                      "Save changes"
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeSection === "account" && user && (
              <div className="space-y-5">
                <div className={cn(cardSurface, "p-5 sm:p-6")}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-3/85">Account</p>
                  <h2 className="mt-1 text-base font-semibold tracking-tight text-text">Sign-in</h2>
                  <p className="mt-1 text-[13px] text-text-3">Email and password for this user.</p>

                  <div className="mt-5 max-w-md space-y-4">
                    <div>
                      <label htmlFor="acct-email" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-3/90">
                        Email
                      </label>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input
                          id="acct-email"
                          type="email"
                          value={user.email}
                          disabled
                          className={cn(inputDark, "max-w-md opacity-90")}
                        />
                        <span className="rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                          Verified
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-3/90">Password</p>
                      <p className="mt-2 text-[13px] leading-relaxed text-text-2">
                        Reset via <span className="text-text">Forgot password</span> on the login page.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "rounded-[16px] border border-red-500/20 p-5 sm:p-6",
                    "bg-[rgba(255,0,0,0.05)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                  )}
                >
                  <h3 className="text-sm font-semibold text-text">Delete account</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-2">
                    Permanently removes your user and data. Contact support to proceed.
                  </p>
                  <button type="button" disabled className={cn(btnGhost, "mt-4 border-red-500/25 text-text-2 opacity-60")}>
                    Contact support
                  </button>
                </div>
              </div>
            )}

            {activeSection === "subscription" && subscription && (
              <div className="space-y-5">
                <div className={cn(cardSurface)}>
                  <div className="space-y-5 p-5 sm:p-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-3/85">Subscription</p>
                      <h2 className="mt-1 text-base font-semibold tracking-tight text-text">Current plan</h2>
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/35 ring-1 ring-inset ring-white/[0.08]">
                          <svg className="h-5 w-5 text-text-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-semibold tracking-tight text-text">{getPlanDisplay(subscription.plan).name}</p>
                          <p className="text-[13px] text-text-2">{getPlanDisplay(subscription.plan).price}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                          subscription.is_active
                            ? "border-accent/30 bg-accent/10 text-accent"
                            : "border-red-500/25 bg-red-500/10 text-red-300"
                        )}
                      >
                        {subscription.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <ul className="space-y-2 border-t border-white/[0.05] pt-4">
                      {getPlanFeatures(subscription.plan).map((line) => (
                        <li key={line} className="flex gap-2 text-[13px] text-text-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent/80" aria-hidden />
                          {line}
                        </li>
                      ))}
                    </ul>

                    <div className="pt-1">
                      <Link href="/app/plans" className={btnPrimary}>
                        Upgrade or change plan
                      </Link>
                    </div>
                  </div>
                </div>

                <div className={cn(cardSurface, "p-5 sm:p-6")}>
                  <h3 className="text-sm font-semibold text-text">Billing</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-text-2">
                    Payment method, invoices, and subscription changes open in a secure portal.
                  </p>
                  {subscription.has_stripe ? (
                    <button type="button" onClick={openBillingPortal} disabled={portalLoading} className={cn(btnGhost, "mt-4")}>
                      {portalLoading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Opening…
                        </>
                      ) : (
                        "Manage billing"
                      )}
                    </button>
                  ) : (
                    <p className="mt-3 text-[13px] text-text-3">Billing connects when you subscribe to a paid plan.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
