import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nftPath = join(root, ".next/server/app/api/reports/pdf/route.js.nft.json");
const workerPath = join(root, "dist", "pdf-worker.cjs");

if (!existsSync(nftPath)) {
  console.error("verify-pdf-worker-trace: missing", nftPath, "(run next build first)");
  process.exit(1);
}

if (!existsSync(workerPath)) {
  console.error("verify-pdf-worker-trace: missing", workerPath, "(run pnpm build:pdf-worker before next build)");
  process.exit(1);
}

const nft = JSON.parse(readFileSync(nftPath, "utf8"));
const files = Array.isArray(nft.files) ? nft.files : [];
const traced = files.some(
  (f) => typeof f === "string" && (f.includes("dist/pdf-worker.cjs") || f.endsWith("pdf-worker.cjs")),
);

if (!traced) {
  console.error(
    "verify-pdf-worker-trace: dist/pdf-worker.cjs is not listed in the PDF route NFT trace.\n" +
      "Fix: run `pnpm run build:pdf-worker` before `next build`, and keep outputFileTracingIncludes in next.config.ts.",
  );
  process.exit(1);
}

console.log("verify-pdf-worker-trace: ok (worker on disk + included in /api/reports/pdf trace)");
