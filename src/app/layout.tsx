import type { ReactNode } from "react";

import type { Metadata } from "next";

import { SiteNav } from "@/components/SiteNav";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VRTL Score — AI Visibility for Agencies",
    template: "%s | VRTL Score",
  },
  description: "Measure how your clients rank across ChatGPT, Gemini, and Claude. Generate branded reports that prove your SEO value.",
  keywords: ["AI visibility", "SEO", "agency tools", "ChatGPT ranking", "AI search", "GEO", "generative engine optimization"],
  authors: [{ name: "VRTL Score" }],
  creator: "VRTL Score",
  metadataBase: new URL("https://vrtlscore.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vrtlscore.com",
    siteName: "VRTL Score",
    title: "VRTL Score — AI Visibility for Agencies",
    description: "Measure how your clients rank across ChatGPT, Gemini, and Claude. Generate branded reports that prove your SEO value.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VRTL Score — AI Visibility for Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VRTL Score — AI Visibility for Agencies",
    description: "Measure how your clients rank across ChatGPT, Gemini, and Claude. Generate branded reports that prove your SEO value.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/VRTL_Solo.png", type: "image/png" },
    ],
    apple: "/brand/VRTL_Solo.png",
  },
  manifest: "/manifest.json",
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
