import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /**
   * Keep @react-pdf out of the webpack server bundle so pdfkit internals
   * (which rely on PDF-spec property names like 'S') aren't mangled by
   * minification. At runtime they load from node_modules via require().
   *
   * React element interop works because:
   *  - types (Document, Page, …) come from the external package
   *  - $$typeof uses Symbol.for('react.element') (globally shared)
   *  - pnpm overrides pin a single react@18.3.1 across all packages
   */
  serverExternalPackages: [
    "@react-pdf/renderer",
    "@react-pdf/reconciler",
    "@react-pdf/font",
    "@react-pdf/layout",
    "@react-pdf/pdfkit",
    "@react-pdf/primitives",
    "@react-pdf/render",
    "@react-pdf/fns",
    "@react-pdf/image",
    "@react-pdf/png-js",
    "@react-pdf/stylesheet",
    "@react-pdf/textkit",
    "@react-pdf/types",
    "yoga-layout",
  ],
};

export default nextConfig;
