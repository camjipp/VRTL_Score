import * as esbuild from "esbuild";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "dist");

mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: [path.join(root, "src/lib/reports/pdf/worker/renderPdfCli.tsx")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile: path.join(outDir, "pdf-worker.cjs"),
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "@react-pdf/renderer",
    "@react-pdf/font",
    "@react-pdf/layout",
    "@react-pdf/pdfkit",
    "@react-pdf/primitives",
    "@react-pdf/render",
    "@react-pdf/fns",
    "@react-pdf/image",
    "@react-pdf/png-js",
  ],
  jsx: "automatic",
  jsxImportSource: "react",
  loader: { ".tsx": "tsx" },
  logLevel: "info",
});

console.log("pdf-worker: wrote dist/pdf-worker.cjs");
