import { existsSync } from "node:fs";
import { join } from "node:path";

/** Relative to `process.cwd()` (project root on Vercel: `/var/task`). */
export const PDF_WORKER_RELATIVE = join("dist", "pdf-worker.cjs");

export function getPdfWorkerPath(): string {
  return join(process.cwd(), PDF_WORKER_RELATIVE);
}

export type PdfWorkerStatus =
  | { ok: true; path: string; cwd: string }
  | { ok: false; path: string; cwd: string; hint: string };

export function getPdfWorkerStatus(): PdfWorkerStatus {
  const cwd = process.cwd();
  const path = getPdfWorkerPath();
  if (existsSync(path)) {
    return { ok: true, path, cwd };
  }
  return {
    ok: false,
    path,
    cwd,
    hint:
      "Run `pnpm build` (builds the worker before `next build`) or `pnpm build:pdf-worker`. On Vercel, use build command `pnpm run build` (see vercel.json).",
  };
}
