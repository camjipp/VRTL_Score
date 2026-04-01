import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
