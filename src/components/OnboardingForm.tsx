"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";

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

export function OnboardingForm() {
  const router = useRouter();
  const sp = useSearchParams();

  const website = useMemo(() => normalizeWebsite(sp.get("website") ?? ""), [sp]);
  const nextPath = useMemo(() => sp.get("next") ?? "/app", [sp]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agencyName, setAgencyName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
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
        if (!cancelled) {
          setAgencyName(json.name && json.name !== "New Agency" ? json.name : "");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();

      const name = agencyName.trim();
      if (!name) throw new Error("Please enter your agency name.");

      const upd = await fetch("/api/agency/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name, brand_accent: null })
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

      // If not entitled, route to paywall, preserving next.
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
    <main className="bg-bg0">
      <div className="container-xl py-14">
        <div className="card-surface mx-auto max-w-2xl p-6">
          <div className="badge">Onboarding</div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Set up your agency</h1>
          <p className="mt-2 text-sm text-text-2">
            This will appear on your PDFs. You can always update this later in Settings.
          </p>

          {website ? (
            <div className="mt-4 rounded-lg border border-border/15 bg-bg1 p-3 text-sm">
              <div className="text-xs text-muted">Starting with</div>
              <div className="font-medium text-text">{website}</div>
            </div>
          ) : null}

          {loading ? <div className="mt-6 text-sm">Loading…</div> : null}
          {error ? (
            <div className="mt-6 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={finish}>
            <label className="block text-sm">
              <div className="mb-1 font-medium">Agency name</div>
              <input
                className="w-full rounded-lg border border-border/15 bg-bg1 px-3 py-2 text-text outline-none focus:ring-2 focus:ring-accent/30"
                disabled={saving}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Acme Agency"
                value={agencyName}
              />
            </label>

            <label className="block text-sm">
              <div className="mb-1 font-medium">Agency logo (optional)</div>
              <input
                accept="image/*"
                disabled={saving}
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                type="file"
              />
              <div className="mt-1 text-xs text-muted">
                If you skip this, PDFs will still generate. Upload anytime in Settings.
              </div>
            </label>

            <div className="flex flex-wrap gap-3 pt-2">
              <button className="btn-primary" disabled={saving} type="submit">
                {saving ? "Saving…" : "Continue"}
              </button>
              <button
                className="btn-secondary"
                disabled={saving}
                onClick={() => router.replace(isInternalPath(nextPath) ? nextPath : "/app")}
                type="button"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}


