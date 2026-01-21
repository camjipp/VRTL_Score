"use client";

import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

type AgencySettings = {
  agency_id: string;
  name: string;
  brand_logo_url?: string | null;
  brand_accent?: string | null;
};

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

const accentColors = [
  { value: "#0066FF", label: "Blue" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#059669", label: "Emerald" },
  { value: "#DC2626", label: "Red" },
  { value: "#EA580C", label: "Orange" },
  { value: "#0891B2", label: "Cyan" },
  { value: "#DB2777", label: "Pink" },
  { value: "#0f172a", label: "Slate" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<AgencySettings | null>(null);

  const [name, setName] = useState("");
  const [accent, setAccent] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/agency/settings", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as AgencySettings;
      setSettings(json);
      setName(json.name ?? "");
      setAccent(json.brand_accent ?? "");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const res = await fetch("/api/agency/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: name.trim(),
          brand_accent: accent.trim() || null
        })
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e2) {
      setError(errorMessage(e2));
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(e: React.FormEvent) {
    e.preventDefault();
    if (!logoFile) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const { accessToken } = await ensureOnboarded();
      const fd = new FormData();
      fd.append("file", logoFile);
      const res = await fetch("/api/agency/logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: fd
      });
      if (!res.ok) throw new Error(await res.text());
      setLogoFile(null);
      setLogoPreview(null);
      await load();
      setSuccess("Logo uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e2) {
      setError(errorMessage(e2));
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          </svg>
          Settings
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text">Agency Settings</h1>
        <p className="mt-2 text-text-2">
          Customize your agency profile. These settings appear on generated PDF reports.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mt-6 animate-fade-up rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-600">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        </div>
      )}
      {error && (
        <div className="mt-6">
          <Alert variant="danger">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-8 space-y-4">
          <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-48 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      )}

      {/* Settings Form */}
      {!loading && settings && (
        <div className="mt-8 space-y-6">
          {/* Agency Details Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border bg-surface-2/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-text">Agency Details</h2>
                  <p className="text-xs text-text-3">Basic information about your agency</p>
                </div>
              </div>
            </div>

            <form className="p-6" onSubmit={saveSettings}>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text">
                    Agency name
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={saving}
                    className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
                  />
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-text">
                    Accent color
                  </label>
                  <p className="mt-1 text-xs text-text-3">
                    Used for score highlights in PDF reports
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setAccent(color.value)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all",
                          accent === color.value
                            ? "border-text ring-2 ring-accent/20"
                            : "border-transparent hover:scale-110"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      >
                        {accent === color.value && (
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    ))}
                    <div className="relative">
                      <input
                        type="text"
                        value={accent}
                        onChange={(e) => setAccent(e.target.value)}
                        placeholder="#0066FF"
                        className="h-10 w-28 rounded-xl border border-border bg-bg px-3 text-xs text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-2 hover:shadow-xl hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          </div>

          {/* Logo Card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border bg-surface-2/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-text">Logo</h2>
                  <p className="text-xs text-text-3">Displayed on generated PDF reports</p>
                </div>
              </div>
            </div>

            <form className="p-6" onSubmit={uploadLogo}>
              <div className="space-y-6">
                {/* Current Logo */}
                {settings.brand_logo_url && !logoPreview && (
                  <div className="rounded-xl border border-border bg-surface-2/50 p-4">
                    <p className="mb-3 text-xs font-medium text-text-3">Current logo</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Agency logo"
                      src={settings.brand_logo_url}
                      className="h-auto max-h-16 max-w-[240px] object-contain"
                    />
                  </div>
                )}

                {/* Preview */}
                {logoPreview && (
                  <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
                    <p className="mb-3 text-xs font-medium text-accent">New logo preview</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Logo preview"
                      src={logoPreview}
                      className="h-auto max-h-16 max-w-[240px] object-contain"
                    />
                  </div>
                )}

                {/* Upload */}
                <div>
                  <label
                    htmlFor="logo-upload"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-8 transition-colors",
                      "border-border bg-surface-2/50 hover:border-accent hover:bg-accent/5"
                    )}
                  >
                    <svg className="h-10 w-10 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="mt-2 text-sm font-medium text-text">
                      {logoFile ? logoFile.name : "Click to upload"}
                    </p>
                    <p className="mt-1 text-xs text-text-3">
                      PNG, JPG, or SVG up to 2MB
                    </p>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Upload Button */}
                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={uploading || !logoFile}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-700 hover:shadow-xl hover:shadow-purple-600/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload logo
                      </>
                    )}
                  </button>
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="text-sm text-text-2 transition-colors hover:text-text"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Info Card */}
          <div className="rounded-2xl border border-border bg-surface-2/50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-text">Pro Tip</h3>
                <p className="mt-1 text-sm text-text-2">
                  For best results, use a logo with a transparent background. Horizontal logos work best in PDF headers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
