import type { ReactNode } from "react";

import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Instrument_Serif } from "next/font/google";

import { SiteNav } from "@/components/SiteNav";
import { BRAND_FAVICON_SRC } from "@/lib/brand/logo";

import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VRTL Score: AI Visibility for Agencies",
    template: "%s | VRTL Score",
  },
  description:
    "Measure how your clients rank across ChatGPT, Gemini, and Claude. Generate branded reports that prove your SEO value.",
  keywords: ["AI visibility", "SEO", "agency tools", "ChatGPT ranking", "AI search", "GEO", "generative engine optimization"],
  authors: [{ name: "VRTL Score" }],
  creator: "VRTL Score",
  metadataBase: new URL("https://vrtlscore.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vrtlscore.com",
    siteName: "VRTL Score",
    title: "VRTL Score: AI Visibility for Agencies",
    description:
      "Measure how your clients rank across ChatGPT, Gemini, and Claude. Generate branded reports that prove your SEO value.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VRTL Score: AI Visibility for Agencies",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VRTL Score: AI Visibility for Agencies",
    description:
      "Measure how your clients rank across ChatGPT, Gemini, and Claude. Generate branded reports that prove your SEO value.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: BRAND_FAVICON_SRC, type: "image/jpeg", sizes: "1024x1024" }],
    apple: BRAND_FAVICON_SRC,
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      className={`${instrumentSerif.variable} ${dmSans.variable} ${dmMono.variable}`}
      lang="en"
    >
      <body className="min-h-screen bg-bg text-text antialiased">
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
