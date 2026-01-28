"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { Alert, AlertDescription } from "@/components/ui/Alert";

type AgencySettings = {
  agency_id: string;
  name: string;
  brand_logo_url?: string | null;
  brand_accent?: string | null;
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AgencySettings | null>(null);
  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { accessToken } = await ensureOnboarded();
        const res = await fetch("/api/agency/settings", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load settings");
        }
        const data = (await res.json()) as AgencySettings;
        setSettings(data);
        setName(data.name);
        if (data.brand_logo_url) setLogoPreview(data.brand_logo_url);
      } catch (e: unknown) {
        const err = e as { message?: string };
        setError(err?.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function uploadLogo() {
    if (!logoFile) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const { accessToken } = await ensureOnboarded();
      const formData = new FormData();
      formData.append("file", logoFile);

      const res = await fetch("/api/agency/logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload logo");
      }

      const data = await res.json();
      setLogoPreview(data.url);
      setLogoFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      const err = e as { message?: string };
      setError(err?.message || String(e));
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
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
        await uploadLogo();
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
        <h1 className="text-2xl font-bold tracking-tight text-text">Agency Settings</h1>
        <p className="mt-1 text-sm text-text-2">
          Customize your agency profile and branding.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
          <div className="h-48 animate-pulse rounded-2xl bg-surface-2" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success */}
      {success && (
        <Alert variant="success">
          <AlertDescription>Settings saved successfully!</AlertDescription>
        </Alert>
      )}

      {!loading && settings && (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Agency info */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-semibold text-text">Agency Information</h2>
              <p className="text-sm text-text-3">Basic details about your agency</p>
            </div>
            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-text">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-text placeholder:text-text-3 focus:border-accent focus:outline-none"
                  placeholder="Your Agency Name"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-6 py-4">
              <h2 className="font-semibold text-text">Agency Logo</h2>
              <p className="text-sm text-text-3">Shown on reports and exports</p>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Preview */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface-2">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <svg className="h-10 w-10 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  )}
                </div>

                {/* Upload area */}
                <div className="flex-1">
                  <label className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-2 px-6 py-8 transition-colors hover:border-accent hover:bg-surface-2/80">
                    <svg className="h-8 w-8 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="mt-2 text-sm font-medium text-text">
                      {logoFile ? logoFile.name : "Click to upload"}
                    </span>
                    <span className="mt-1 text-xs text-text-3">
                      PNG, JPG, or SVG up to 2MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || uploadingLogo}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-2 disabled:opacity-50"
            >
              {saving || uploadingLogo ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {uploadingLogo ? "Uploading logo..." : "Saving..."}
                </>
              ) : (
                "Save changes"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
