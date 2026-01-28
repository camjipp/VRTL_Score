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

type SectionId = typeof SECTIONS[number]["id"];

function SectionIcon({ icon, className }: { icon: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    building: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
    user: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    card: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
  };
  return <>{icons[icon]}</>;
}

export default function SettingsPage() {
  const supabase = getSupabaseBrowserClient();
  
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  
  // Form states
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
        
        // Load agency settings
        const settingsRes = await fetch("/api/agency/settings", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (settingsRes.ok) {
          const data = (await settingsRes.json()) as AgencySettings;
          setSettings(data);
          setName(data.name);
          if (data.brand_logo_url) setLogoPreview(data.brand_logo_url);
        }
        
        // Load user profile
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser?.email) {
          setUser({ email: authUser.email });
        }
        
        // Load subscription info
        const { data: membership } = await supabase
          .from("agency_users")
          .select("agency_id")
          .eq("user_id", authUser?.id)
          .maybeSingle();
          
        if (membership?.agency_id) {
          // Try to get subscription info - handle missing columns gracefully
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

      // Save name
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

      // Upload logo if changed
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

  function getPlanDisplay(plan: string | null) {
    const plans: Record<string, { name: string; price: string }> = {
      starter: { name: "Starter", price: "$149/mo" },
      growth: { name: "Growth", price: "$399/mo" },
      pro: { name: "Pro", price: "$799/mo" },
    };
    return plans[plan || "starter"] || plans.starter;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/app" className="text-text-2 hover:text-text">Dashboard</Link>
        <span className="text-text-3">/</span>
        <span className="text-text">Settings</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-2">
          Manage your agency profile and subscription.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success */}
      {success && (
        <Alert variant="success">
          <AlertDescription>Changes saved successfully!</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex gap-6">
          <div className="w-56 shrink-0">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-2" />
              ))}
            </div>
          </div>
          <div className="flex-1">
            <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
          </div>
        </div>
      )}

      {!loading && (
        <div className="flex gap-6">
          {/* Sidebar */}
          <nav className="w-56 shrink-0">
            <div className="space-y-1">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                    activeSection === section.id
                      ? "bg-surface-2 text-text"
                      : "text-text-2 hover:bg-surface-2/50 hover:text-text"
                  )}
                >
                  <SectionIcon icon={section.icon} className="h-5 w-5" />
                  {section.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Agency Profile Section */}
            {activeSection === "profile" && settings && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="rounded-2xl border border-border bg-surface">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="font-semibold text-text">Agency profile</h2>
                    <p className="text-sm text-text-3">This information appears on your reports.</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Logo */}
                    <div className="flex items-center gap-6">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-surface-2">
                        {logoPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={logoPreview}
                            alt="Logo"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-text-3">
                            {name.charAt(0) || "A"}
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-2">
                          Change logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                        </label>
                        <p className="mt-2 text-xs text-text-3">
                          JPG, PNG or SVG. Max 2MB.
                        </p>
                      </div>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-text">
                        Agency name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-2 w-full max-w-md rounded-lg border border-border bg-surface px-4 py-2.5 text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
                        placeholder="Your Agency Name"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end border-t border-border px-6 py-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-accent-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        "Save changes"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Account Section */}
            {activeSection === "account" && user && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-surface">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="font-semibold text-text">Account information</h2>
                    <p className="text-sm text-text-3">Your personal account details.</p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-text">
                        Email address
                      </label>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full max-w-md rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-text-2"
                        />
                        <span className="shrink-0 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-text">
                        Password
                      </label>
                      <p className="mt-1 text-sm text-text-3">
                        Use the &quot;Forgot password&quot; flow on the login page to reset your password.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="rounded-2xl border border-red-200 bg-red-50">
                  <div className="border-b border-red-200 px-6 py-4">
                    <h2 className="font-semibold text-red-900">Danger zone</h2>
                    <p className="text-sm text-red-700">Irreversible actions.</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-red-900">Delete account</div>
                        <p className="text-sm text-red-700">
                          Permanently delete your account and all data.
                        </p>
                      </div>
                      <button
                        disabled
                        className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 opacity-50"
                      >
                        Contact support
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Section */}
            {activeSection === "subscription" && subscription && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-surface">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="font-semibold text-text">Current plan</h2>
                    <p className="text-sm text-text-3">Manage your subscription and billing.</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-text">
                            {getPlanDisplay(subscription.plan).name}
                          </div>
                          <div className="text-sm text-text-2">
                            {getPlanDisplay(subscription.plan).price}
                          </div>
                        </div>
                      </div>
                      <span className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        subscription.is_active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-red-500/10 text-red-600"
                      )}>
                        {subscription.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing management */}
                <div className="rounded-2xl border border-border bg-surface">
                  <div className="border-b border-border px-6 py-4">
                    <h2 className="font-semibold text-text">Billing</h2>
                    <p className="text-sm text-text-3">Update payment method, view invoices, and more.</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {subscription.has_stripe ? (
                      <>
                        <p className="text-sm text-text-2">
                          Manage your subscription, update payment methods, and download invoices through our billing portal.
                        </p>
                        <button
                          onClick={openBillingPortal}
                          disabled={portalLoading}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
                        >
                          {portalLoading ? (
                            <>
                              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Opening...
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                              </svg>
                              Manage billing
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-text-2">
                        No billing account linked yet. This will be set up when you subscribe to a plan.
                      </p>
                    )}
                  </div>
                </div>

                {/* Plan comparison link */}
                <div className="rounded-2xl border border-border bg-gradient-to-br from-violet-50 to-purple-50">
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                        <svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text">Want more features?</div>
                        <p className="text-sm text-text-2">
                          Compare plans and see what&apos;s included in each tier.
                        </p>
                      </div>
                      <Link
                        href="/pricing"
                        className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
                      >
                        View plans
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
