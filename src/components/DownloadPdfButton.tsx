"use client";

import { useState } from "react";

import { ensureOnboarded } from "@/lib/onboard";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { cn } from "@/lib/cn";

type DownloadPdfButtonProps = {
  snapshotId: string;
  className?: string;
};

export function DownloadPdfButton({ snapshotId, className }: DownloadPdfButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function download() {
    setBusy(true);
    setError(null);
    setSuccess(false);
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        disabled={busy}
        onClick={download}
        className={cn(
          "group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-4 text-base font-semibold text-white shadow-xl transition-all",
          busy
            ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-wait"
            : success
              ? "bg-gradient-to-r from-emerald-500 to-green-500 shadow-emerald-500/30"
              : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02]"
        )}
      >
        {/* Shimmer effect */}
        {!busy && !success && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}

        {/* Icon */}
        {busy ? (
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : success ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        )}

        {/* Text */}
        <span className="relative">
          {busy ? "Generating report..." : success ? "Downloaded!" : "Download PDF Report"}
        </span>
      </button>

      {/* Subtext */}
      {!busy && !success && !error && (
        <p className="text-center text-xs text-text-3">
          Client-ready report with your branding
        </p>
      )}

      {/* Error */}
      {error && (
        <Alert className="py-2" variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
