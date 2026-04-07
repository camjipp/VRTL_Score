"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/#product", label: "Product" },
  { href: "/preview", label: "Reports" },
  { href: "/#faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
];

const navContainer = "mx-auto w-full max-w-6xl px-6";

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (
    pathname.startsWith("/app") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/forgot-password"
  )
    return null;

  const isHome = pathname === "/" || pathname === null || pathname === undefined;
  const isDarkPage = isHome || pathname === "/pricing" || pathname === "/preview";

  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        isDarkPage ? "border-b border-white/[0.08] bg-[#080808]/85 backdrop-blur-[16px]" : "border-b border-border/40 bg-white/85 backdrop-blur-xl"
      )}
    >
      <div className={navContainer}>
        <nav className="flex h-14 items-center justify-between md:h-[3.75rem]">
          <Link className="flex shrink-0 items-center opacity-90 transition-opacity hover:opacity-100" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="VRTL Score"
              className={cn("h-9 w-auto md:h-10", isDarkPage && "brightness-0 invert")}
              src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
            />
          </Link>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    isDarkPage ? "text-white/55 hover:text-white" : "text-text-2 hover:text-text"
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-5 md:flex">
            <Link
              className={cn(
                "text-sm font-medium transition-colors",
                isDarkPage ? "text-white/55 hover:text-white" : "text-text-2 hover:text-text"
              )}
              href="/login"
            >
              Log in
            </Link>
            <Link
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                isDarkPage ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-accent text-white hover:bg-accent-2"
              )}
              href="/signup"
            >
              Run a free snapshot
            </Link>
          </div>

          <button
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md transition-colors md:hidden",
              isDarkPage ? "text-white/70 hover:bg-white/[0.06] hover:text-white" : "border border-border text-text hover:bg-surface-2"
            )}
            onClick={() => setMobileOpen(!mobileOpen)}
            type="button"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </nav>

        {mobileOpen && (
          <div
            className={cn(
              "absolute left-4 right-4 top-full z-50 mt-1 rounded-lg border py-3 shadow-lg md:hidden",
              isDarkPage ? "border-white/[0.08] bg-[#0a0a0a]" : "border-border bg-surface"
            )}
          >
            <div className="flex flex-col px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium",
                    isDarkPage ? "text-white/70 hover:bg-white/[0.05] hover:text-white" : "text-text-2 hover:bg-surface-2"
                  )}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className={cn("my-2 border-t", isDarkPage ? "border-white/[0.08]" : "border-border")} />
              <Link
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  isDarkPage ? "text-white/70 hover:bg-white/[0.05]" : "text-text-2 hover:bg-surface-2"
                )}
                href="/login"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                className="mt-1 rounded-full bg-emerald-500 py-2.5 text-center text-sm font-semibold text-black hover:bg-emerald-400"
                href="/signup"
                onClick={() => setMobileOpen(false)}
              >
                Run a free snapshot
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
