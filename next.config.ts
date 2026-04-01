import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * PDF routes spawn `node dist/pdf-worker.cjs`; NFT does not follow dynamic spawn
   * paths, so Vercel omitted the file. Explicitly include it in those traces.
   * Run `build:pdf-worker` before `next build` so this path exists during tracing.
   */
  outputFileTracingIncludes: {
    "/api/reports/pdf": ["./dist/pdf-worker.cjs"],
    "/api/reports/pdf/health": ["./dist/pdf-worker.cjs"],
    "/api/reports/pdf/debug": ["./dist/pdf-worker.cjs"],
  },
  /**
   * Bundle @react-pdf into the server chunk with the same `react` the route uses.
   * serverExternalPackages + JSX from the app caused two React copies → reconciler
   * error #31 (“object with keys $$typeof, type, key, ref, props”).
   */
  transpilePackages: [
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
};

export default nextConfig;
