"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

type Agency = {
  id: string;
  name: string;
  logo_url: string | null;
  accent_color: string | null;
};

const ACCENT_COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#2563eb" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Pink", value: "#db2777" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Green", value: "#059669" },
  { name: "Teal", value: "#0d9488" },
];

export default function SettingsPage() {
  const supabase = getSupabaseBrowserClient();

  const [agency, setAgency] = useState<Agency | null>(null);
  const [name, setName] = useState("");
  const [accentColor, setAccentColor] = useState("#000000");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { agencyId } = await ensureOnboarded();
        const { data, error: err } = await supabase
          .from("agencies")
          .select("id, name, logo_url, accent_color")
          .eq("id", agencyId)
          .maybeSingle();
        if (err) throw err;
        if (data) {
          const a = data as Agency;
          setAgency(a);
          setName(a.name);
          setAccentColor(a.accent_color || "#000000");
          if (a.logo_url) setLogoPreview(a.logo_url);
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!agency) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let logo_url = agency.logo_url;

      // Upload logo if changed
      if (logoFile) {
        const ext = logoFile.name.split(".").pop() || "png";
        const path = `${agency.id}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("agency-logos")
          .upload(path, logoFile, { upsert: true });
        if (uploadErr) throw uploadErr;

        const {
          data: { publicUrl },
        } = supabase.storage.from("agency-logos").getPublicUrl(path);
        logo_url = publicUrl;
      }

      // Update agency
      const { error: updateErr } = await supabase
        .from("agencies")
        .update({
          name,
          logo_url,
          accent_color: accentColor,
        })
        .eq("id", agency.id);
      if (updateErr) throw updateErr;

      setSuccess(true);
      setAgency({ ...agency, name, logo_url, accent_color: accentColor });
      setLogoFile(null);
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

      {!loading && agency && (
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

              {/* Accent color */}
              <div>
                <label className="block text-sm font-medium text-text">
                  Brand Color
                </label>
                <p className="text-sm text-text-3">Used for buttons and accents</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ACCENT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setAccentColor(color.value)}
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all",
                        accentColor === color.value
                          ? "border-accent scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {accentColor === color.value && (
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
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
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-2 disabled:opacity-50"
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
        </form>
      )}
    </div>
  );
}
