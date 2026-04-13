"use client";

import Image from "next/image";
import Link from "next/link";

import {
  BRAND_LOCKUP_IMAGE_HEIGHT,
  BRAND_LOCKUP_IMAGE_UNOPTIMIZED,
  BRAND_LOCKUP_IMAGE_WIDTH,
  BRAND_LOCKUP_SRC,
} from "@/lib/brand/logo";

const linkClass =
  "block text-[13px] font-light text-[var(--text-secondary)] transition-colors duration-150 hover:text-[var(--text-primary)]";

const headingClass =
  "font-marketing-mono text-[11px] font-normal uppercase tracking-[0.14em] text-[var(--text-muted)]";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--border-subtle)] bg-[var(--bg-surface)] pt-16 pb-10 md:pt-16 md:pb-10">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link className="inline-block" href="/">
              <Image
                alt="VRTL Score"
                className="h-[53px] w-auto max-w-[min(280px,85vw)] bg-transparent object-contain object-left md:h-[75px] md:max-w-[min(360px,90vw)]"
                height={BRAND_LOCKUP_IMAGE_HEIGHT}
                sizes="(max-width: 768px) 85vw, 360px"
                src={BRAND_LOCKUP_SRC}
                unoptimized={BRAND_LOCKUP_IMAGE_UNOPTIMIZED}
                width={BRAND_LOCKUP_IMAGE_WIDTH}
              />
            </Link>
            <p className="mt-4 max-w-[220px] text-sm font-light leading-relaxed text-[var(--text-secondary)]">
              AI visibility for agencies that want to win.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                aria-label="X"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className={headingClass}>Company</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "About", href: "/" },
                { label: "Pricing", href: "/pricing" },
                { label: "Blog", href: "/blog" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <li key={link.href + link.label}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Product</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "AI Visibility Monitoring", href: "/#product" },
                { label: "Performance Dashboard", href: "/#product" },
                { label: "Competitive Benchmarking", href: "/#product" },
                { label: "Branded PDF Reports", href: "/#product" },
              ].map((link) => (
                <li key={link.label}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Models</h3>
            <ul className="mt-4 space-y-2.5">
              {["ChatGPT", "Claude", "Gemini", "Perplexity", "DeepSeek"].map((label) => (
                <li key={label}>
                  <Link className={linkClass} href="/#product">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={headingClass}>Resources</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { label: "FAQ", href: "/#faq" },
                { label: "What is AI Visibility?", href: "/#faq" },
                { label: "Blog", href: "/blog" },
                { label: "Sample Report", href: "/preview" },
              ].map((link) => (
                <li key={link.label}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[color:var(--border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--text-muted)]">© 2026 VRTL Score · All Rights Reserved</p>
          <p className="font-marketing-display text-xs italic text-[var(--text-muted)]">Built for agencies.</p>
        </div>
      </div>
    </footer>
  );
}
