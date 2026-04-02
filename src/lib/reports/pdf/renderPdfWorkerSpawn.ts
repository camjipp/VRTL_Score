/**
 * Optional subprocess PDF path (not used by `/api/reports/pdf` or health).
 * Kept for local experiments; production uses in-process `renderToBuffer` in generatePdfServer.
 */
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getPdfWorkerPath, getPdfWorkerStatus } from "./pdfWorkerPath";
import type { ReportData } from "./types";

export type WorkerPayload =
  | { mode: "minimal" }
  | { mode: "full"; data: ReportData; pages?: number[] };

/**
 * Renders PDF in a child Node process so @react-pdf + Yoga load from node_modules
 * (avoids Next/webpack breaking layout; avoids duplicate React vs external pdf).
 */
export async function renderPdfViaWorker(payload: WorkerPayload): Promise<Buffer> {
  const status = getPdfWorkerStatus();
  if (!status.ok) {
    throw new Error(`PDF worker not found at dist/pdf-worker.cjs (${status.hint})`);
  }
  const bin = getPdfWorkerPath();
  const inPath = join(tmpdir(), `report-pdf-${randomUUID()}.json`);
  writeFileSync(inPath, JSON.stringify(payload), "utf8");

  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [bin, inPath], {
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NODE_OPTIONS: "" },
    });
    const chunks: Buffer[] = [];
    let errText = "";
    proc.stdout.on("data", (c: Buffer) => chunks.push(Buffer.from(c)));
    proc.stderr.on("data", (c: Buffer) => {
      errText += c.toString();
    });
    proc.on("error", (e) => {
      try {
        unlinkSync(inPath);
      } catch {
        /* ignore */
      }
      reject(e);
    });
    proc.on("close", (code) => {
      try {
        unlinkSync(inPath);
      } catch {
        /* ignore */
      }
      if (code !== 0) {
        reject(new Error(errText.trim() || `pdf worker exited with code ${code}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
  });
}
