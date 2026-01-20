"use client";

import { useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { Button } from "@/components/ui/Button";
import { Alert, AlertDescription } from "@/components/ui/Alert";

type DownloadPdfButtonProps = {
  snapshotId: string;
};

export function DownloadPdfButton({ snapshotId }: DownloadPdfButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const { accessToken } = await ensureOnboarded();
      if (!accessToken) throw new Error("Not authenticated");

      const res = await fetch(`/api/reports/pdf?snapshotId=${snapshotId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `VRTLScore_${snapshotId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2 text-sm">
      <Button
        disabled={busy}
        onClick={download}
        size="sm"
        variant="outline"
      >
        {busy ? "Preparing PDF…" : "Download PDF"}
      </Button>
      {error ? (
        <Alert className="py-2" variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}


