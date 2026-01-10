import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SiteNav } from "@/components/SiteNav";

import "./globals.css";

export const metadata: Metadata = {
  title: "VRTLScore",
  description: "Internal agency diagnostic + measurement tool"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}


