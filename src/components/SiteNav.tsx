"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "Questions" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide marketing nav inside the app; the app has its own shell.
  if (pathname.startsWith("/app")) return null;

  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-50">
      {/* Background — dark/transparent on homepage, light elsewhere */}
      <div
        className={cn(
          "absolute inset-0 border-b backdrop-blur-xl",
          isHome ? "border-white/10 bg-transparent" : "border-border/40 bg-white/80"
        )}
      />

      <div className="container-xl relative">
        <nav className="flex h-16 items-center justify-between md:h-18">
          {/* Logo — white on homepage */}
          <Link className="flex shrink-0 items-center transition-transform hover:scale-[1.02]" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="VRTL Score"
              className={cn("h-11 w-auto md:h-[52px]", isHome && "brightness-0 invert")}
              src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
            />
          </Link>

          {/* Desktop nav — centered pill */}
          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-1.5 py-1",
                isHome
                  ? "border border-white/20 bg-white/5"
                  : "border border-border/60 bg-surface-2/60"
              )}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                    isHome
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-text-2 hover:bg-white hover:text-text hover:shadow-sm"
                  )}
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
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                isHome
                  ? "border border-white/25 bg-white/10 text-white hover:bg-white/15"
                  : "border border-border bg-surface-2 text-text hover:bg-bg-2 hover:border-border/80"
              )}
              href="/login"
            >
              Log in
            </Link>
            <Link
              className={cn(
                "text-sm font-medium transition-colors",
                isHome ? "text-white/80 hover:text-white" : "text-text-3 hover:text-text"
              )}
              href="/onboarding"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-all md:hidden",
              isHome
                ? "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                : "border border-border bg-white text-text hover:bg-surface-2"
            )}
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
            "absolute left-4 right-4 top-full overflow-hidden rounded-2xl shadow-xl transition-all duration-300 ease-out md:hidden",
            mobileOpen ? "mt-2 max-h-96 opacity-100" : "max-h-0 opacity-0 border-0",
            isHome ? "border border-white/20 bg-black/95 backdrop-blur-xl" : "border border-border bg-surface"
          )}
        >
          <div className="p-4">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className={cn(
                    "rounded-xl px-4 py-3.5 text-base font-medium transition-all",
                    isHome
                      ? "text-white/80 hover:bg-white/10 hover:text-white"
                      : "text-text-2 hover:bg-surface-2 hover:text-text"
                  )}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <hr className={cn("my-3", isHome ? "border-white/15" : "border-border")} />
            <div className="flex flex-col gap-2">
              <Link
                className={cn(
                  "rounded-xl px-4 py-3.5 text-center text-base font-medium transition-all",
                  isHome
                    ? "border border-white/25 bg-white/10 text-white hover:bg-white/15"
                    : "border border-border bg-surface-2 text-text hover:bg-bg-2"
                )}
                href="/login"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                className={cn(
                  "rounded-xl px-4 py-3.5 text-center text-base font-medium transition-all",
                  isHome ? "text-white/80 hover:text-white" : "text-text-3 hover:text-text"
                )}
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

