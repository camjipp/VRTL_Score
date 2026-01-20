import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SiteNav } from "@/components/SiteNav";

import "./globals.css";

export const metadata: Metadata = {
  title: "VRTL Score",
  description: "Internal agency diagnostic + measurement tool"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-text antialiased">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}


