import { getPdfWorkerStatus } from "@/lib/reports/pdf/pdfWorkerPath";

export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const status = getPdfWorkerStatus();
  if (!status.ok) {
    console.error("[pdf-worker] missing at Node startup", {
      path: status.path,
      cwd: status.cwd,
      hint: status.hint,
    });
  }
}
