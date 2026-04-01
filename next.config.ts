import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** Use node_modules on the server so Yoga/layout WASM is not broken by the bundler (Vercel). */
  serverExternalPackages: [
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



