import path from "path";

import type { NextConfig } from "next";

/**
 * Next.js 15 vendors React 19 whose createElement produces elements with
 *   $$typeof = Symbol.for('react.transitional.element')
 * but external @react-pdf/reconciler (React 18) only recognises
 *   $$typeof = Symbol.for('react.element')
 *
 * For files in lib/reports/pdf/ we redirect `react` and `react/*` imports
 * to the project's react@18.3.1 in node_modules so $$typeof matches.
 *
 * The react@18.3.1 jsx-runtime internally does require('react'); that inner
 * require also needs redirecting, so we match issuers inside reactPkgDir too.
 */
const reactPath = require.resolve("react");
const reactJsxPath = require.resolve("react/jsx-runtime");
const reactJsxDevPath = require.resolve("react/jsx-dev-runtime");
const reactPkgDir = path.dirname(require.resolve("react/package.json"));

const PDF_DIR = /[\\/]lib[\\/]reports[\\/]pdf[\\/]/;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  /**
   * Keep @react-pdf out of the webpack server bundle so pdfkit internals
   * (PDF-spec dictionary keys like 'S') aren't mangled by Terser/SWC.
   * At runtime they load from node_modules via require().
   * (Next 15: `serverExternalPackages` replaces experimental `serverComponentsExternalPackages`.)
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
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.plugins?.push(
        new webpack.NormalModuleReplacementPlugin(
          /^react(\/.*)?$/,
          (resource: { request: string; contextInfo?: { issuer?: string } }) => {
            const issuer = resource.contextInfo?.issuer ?? "";

            const isPdfFile = PDF_DIR.test(issuer);
            const isInsideReact18 = issuer.startsWith(reactPkgDir);
            if (!isPdfFile && !isInsideReact18) return;

            switch (resource.request) {
              case "react":
                resource.request = reactPath;
                break;
              case "react/jsx-runtime":
                resource.request = reactJsxPath;
                break;
              case "react/jsx-dev-runtime":
                resource.request = reactJsxDevPath;
                break;
            }
          },
        ),
      );
    }
    return config;
  },
};

export default nextConfig;
