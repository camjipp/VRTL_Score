"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
    <main className="bg-bg">
      <div className="container-xl py-14">
        <Card className="mx-auto max-w-2xl shadow-none">
          <CardHeader>
            <Badge variant="neutral" className="w-fit">
              Onboarding
            </Badge>
            <CardTitle className="mt-3 text-2xl tracking-tight">Set up your agency</CardTitle>
            <CardDescription>
              This appears on PDFs and reports. You can update it later in Settings.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {website ? (
              <div className="rounded-2xl border border-border bg-surface-2 p-4 text-sm">
                <div className="text-xs text-text-3">Starting with</div>
                <div className="mt-1 font-medium text-text">{website}</div>
              </div>
            ) : null}

            {loading ? <div className="text-sm text-text-2">Loading…</div> : null}
            {error ? (
              <Alert variant="danger">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <form className="space-y-4" onSubmit={finish}>
              <label className="block text-sm">
                <div className="mb-1 font-medium text-text">Agency name</div>
                <Input
                  disabled={saving}
                  onChange={(e) => setAgencyName(e.target.value)}
                  placeholder="Acme Agency"
                  value={agencyName}
                />
              </label>

              <label className="block text-sm">
                <div className="mb-1 font-medium text-text">Agency logo (optional)</div>
                <Input
                  accept="image/*"
                  disabled={saving}
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                  type="file"
                />
                <div className="mt-1 text-xs text-text-3">
                  If you skip this, PDFs will still generate. Upload anytime in Settings.
                </div>
              </label>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button disabled={saving} type="submit" variant="primary">
                  {saving ? "Saving…" : "Continue"}
                </Button>
                <Button
                  disabled={saving}
                  onClick={() => router.replace(isInternalPath(nextPath) ? nextPath : "/app")}
                  type="button"
                  variant="secondary"
                >
                  Skip for now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


