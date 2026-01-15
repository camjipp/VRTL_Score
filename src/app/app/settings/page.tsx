"use client";

import { useEffect, useMemo, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";

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

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AgencySettings | null>(null);

  const [name, setName] = useState("");
  const [accent, setAccent] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const canEditBranding = useMemo(() => {
    // If the DB doesn't have branding columns, the API will still work for name updates.
    // We keep the UI enabled but show a helpful hint.
    return true;
  }, []);

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
      await load();
    } catch (e2) {
      setError(errorMessage(e2));
    } finally {
      setUploading(false);
    }
  }

  return (
    <main className="max-w-2xl">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="mt-1 text-sm text-gray-600">Agency profile used on PDF reports.</p>

      {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
      {error ? (
        <div className="mt-6 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {!loading && settings ? (
        <>
          <form className="mt-6 space-y-4 rounded border p-4" onSubmit={saveSettings}>
            <div className="text-sm font-medium">Agency</div>

            <label className="block text-sm">
              <div className="mb-1">Name</div>
              <input
                className="w-full rounded border px-3 py-2"
                disabled={saving}
                onChange={(e) => setName(e.target.value)}
                required
                value={name}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1">Accent color (optional)</div>
              <input
                className="w-full rounded border px-3 py-2"
                disabled={saving}
                onChange={(e) => setAccent(e.target.value)}
                placeholder="#0f172a"
                value={accent}
              />
              <div className="mt-1 text-xs text-gray-600">
                Used for score highlights in the PDF. Hex recommended (e.g. <code>#0f172a</code>).
              </div>
            </label>

            {!canEditBranding ? (
              <div className="text-xs text-amber-700">
                Branding fields aren’t enabled in your DB yet. Name updates still work.
              </div>
            ) : null}

            <button className="rounded border px-3 py-2 text-sm" disabled={saving} type="submit">
              {saving ? "Saving…" : "Save"}
            </button>
          </form>

          <form className="mt-6 space-y-4 rounded border p-4" onSubmit={uploadLogo}>
            <div className="text-sm font-medium">Logo</div>
            {settings.brand_logo_url ? (
              <div className="rounded border bg-white p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Agency logo"
                  src={settings.brand_logo_url}
                  style={{ maxHeight: 64, maxWidth: 240 }}
                />
                <div className="mt-2 text-xs text-gray-600 break-all">{settings.brand_logo_url}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">No logo uploaded yet.</div>
            )}

            <input
              accept="image/*"
              disabled={uploading}
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
              type="file"
            />
            <button
              className="rounded border px-3 py-2 text-sm"
              disabled={uploading || !logoFile}
              type="submit"
            >
              {uploading ? "Uploading…" : "Upload logo"}
            </button>
            <div className="text-xs text-gray-600">
              Note: this uses Supabase Storage. Make sure you’ve created a public bucket for logos (v1).
            </div>
          </form>
        </>
      ) : null}
    </main>
  );
}


