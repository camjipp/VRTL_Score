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
  { value: "#22c55e", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#ffffff", label: "White" },
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
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-white/50">
          Customize your agency profile and branding for PDF reports.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        </div>
      )}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-2xl bg-white/5" />
          <div className="h-48 animate-pulse rounded-2xl bg-white/5" />
        </div>
      )}

      {/* Settings Form */}
      {!loading && settings && (
        <div className="space-y-6">
          {/* Agency Details Card */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#161616]">
            <div className="border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Agency Details</h2>
                  <p className="text-xs text-white/40">Basic information about your agency</p>
                </div>
              </div>
            </div>

            <form className="p-5" onSubmit={saveSettings}>
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-white/70">
                    Agency name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={saving}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50"
                  />
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-white/70">Accent color</label>
                  <p className="mt-1 text-xs text-white/40">Used for highlights in PDF reports</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setAccent(color.value)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-all",
                          accent === color.value
                            ? "border-white ring-2 ring-white/20"
                            : "border-transparent hover:scale-110"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      >
                        {accent === color.value && (
                          <svg className={cn("h-4 w-4", color.value === "#ffffff" ? "text-black" : "text-white")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    ))}
                    <input
                      type="text"
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      placeholder="#22c55e"
                      className="h-9 w-24 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder:text-white/30 focus:border-white/20 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-50"
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
          </div>

          {/* Logo Card */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#161616]">
            <div className="border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-white">Logo</h2>
                  <p className="text-xs text-white/40">Displayed on PDF reports</p>
                </div>
              </div>
            </div>

            <form className="p-5" onSubmit={uploadLogo}>
              <div className="space-y-5">
                {/* Current Logo */}
                {settings.brand_logo_url && !logoPreview && (
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <p className="mb-3 text-xs font-medium text-white/40">Current logo</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Agency logo"
                      src={settings.brand_logo_url}
                      className="h-auto max-h-12 max-w-[200px] object-contain"
                    />
                  </div>
                )}

                {/* Preview */}
                {logoPreview && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="mb-3 text-xs font-medium text-emerald-400">New logo preview</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Logo preview"
                      src={logoPreview}
                      className="h-auto max-h-12 max-w-[200px] object-contain"
                    />
                  </div>
                )}

                {/* Upload */}
                <label
                  htmlFor="logo-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-8 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
                >
                  <svg className="h-8 w-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-white/70">
                    {logoFile ? logoFile.name : "Click to upload"}
                  </p>
                  <p className="mt-1 text-xs text-white/40">PNG, JPG, or SVG up to 2MB</p>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>

                {/* Upload Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={uploading || !logoFile}
                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-500 disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      "Upload logo"
                    )}
                  </button>
                  {logoFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                      }}
                      className="text-sm text-white/50 transition-colors hover:text-white"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Tip */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/70">Pro tip</p>
                <p className="mt-0.5 text-xs text-white/50">
                  Use a logo with a transparent background. Horizontal logos work best in PDF headers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
