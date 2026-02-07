"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/#features", label: "How it Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide marketing nav inside the app; the app has its own shell.
  if (pathname.startsWith("/app")) return null;

  return (
    <header className="sticky top-0 z-50">
      {/* Frosted glass background */}
      <div className="absolute inset-0 border-b border-border/40 bg-white/80 backdrop-blur-xl" />

      <div className="container-xl relative">
        <nav className="flex h-16 items-center justify-between md:h-18">
          {/* Logo */}
          <Link className="flex shrink-0 items-center transition-transform hover:scale-[1.02]" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              alt="VRTL Score" 
              className="h-10 w-auto md:h-12" 
              src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png" 
            />
          </Link>

          {/* Desktop nav — centered pill */}
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-surface-2/60 px-1.5 py-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className="rounded-full px-4 py-1.5 text-sm font-medium text-text-2 transition-all hover:bg-white hover:text-text hover:shadow-sm"
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <Link
              className="rounded-full px-4 py-2 text-sm font-medium text-text-2 transition-colors hover:text-text"
              href="/login"
            >
              Log in
            </Link>
            <Link
              className="rounded-full bg-text px-5 py-2 text-sm font-semibold text-white shadow-md shadow-text/15 transition-all hover:bg-text/90 hover:shadow-lg hover:shadow-text/20"
              href="/onboarding"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text transition-all hover:bg-surface-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </nav>

        {/* Mobile menu */}
        <div
          className={cn(
            "absolute left-4 right-4 top-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xl transition-all duration-300 ease-out md:hidden",
            mobileOpen ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0 border-0"
          )}
        >
          <div className="p-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className="rounded-xl px-4 py-3.5 text-base font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <hr className="my-3 border-border" />
            <div className="flex flex-col gap-2">
              <Link
                className="rounded-xl px-4 py-3.5 text-center text-base font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
                href="/login"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                className="rounded-xl bg-text px-4 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-text/90"
                href="/onboarding"
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

