"use client";

import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type DownloadPdfButtonProps = {
  snapshotId: string;
};

export function DownloadPdfButton({ snapshotId }: DownloadPdfButtonProps) {
  const supabase = getSupabaseBrowserClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const sessionRes = await supabase.auth.getSession();
      const token = sessionRes.data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/reports/pdf?snapshotId=${snapshotId}`, {
        headers: {
          Authorization: `Bearer ${token}`
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
      <button
        className="rounded border px-3 py-2 text-sm"
        disabled={busy}
        onClick={download}
        type="button"
      >
        {busy ? "Preparing PDF…" : "Download PDF"}
      </button>
      {error ? <span className="text-red-700">{error}</span> : null}
    </div>
  );
}


