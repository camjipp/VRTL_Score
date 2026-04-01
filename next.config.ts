import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@react-pdf/renderer",
    "@react-pdf/font",
    "@react-pdf/layout",
    "@react-pdf/pdfkit",
    "@react-pdf/primitives",
    "@react-pdf/render",
    "@react-pdf/fns",
  ],
};

export default nextConfig;



