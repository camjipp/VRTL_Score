import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { ReportData } from "./types";

export type WorkerPayload =
  | { mode: "minimal" }
  | { mode: "full"; data: ReportData; pages?: number[] };

const WORKER_REL = join("dist", "pdf-worker.cjs");

function workerPath(): string {
  return join(process.cwd(), WORKER_REL);
}

/**
 * Renders PDF in a child Node process so @react-pdf + Yoga load from node_modules
 * (avoids Next/webpack breaking layout; avoids duplicate React vs external pdf).
 */
export async function renderPdfViaWorker(payload: WorkerPayload): Promise<Buffer> {
  const bin = workerPath();
  if (!existsSync(bin)) {
    throw new Error(
      "PDF worker not found at dist/pdf-worker.cjs. Run `pnpm build` (includes pdf worker) or `pnpm build:pdf-worker`."
    );
  }
  const inPath = join(tmpdir(), `vrtl-pdf-${randomUUID()}.json`);
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
