/**
 * Writes a sample AI Authority PDF using `stanleyData` (fixed-template document).
 * Uses `generatePDF` from `generatePdfServer` (same path as API export).
 *
 * Usage: pnpm exec tsx --tsconfig tsconfig.tools.json scripts/render-sample-pdf.ts [output.pdf]
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { generatePDF } from "../src/lib/reports/pdf/generatePdfServer";
import { stanleyData } from "../src/lib/reports/pdf/stanleyData";

async function main() {
  const outPath = resolve(process.argv[2] ?? "sample-ai-authority-report.pdf");
  const buf = await generatePDF(stanleyData);
  writeFileSync(outPath, buf);
  console.log(`Wrote ${outPath} (${buf.length} bytes)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
