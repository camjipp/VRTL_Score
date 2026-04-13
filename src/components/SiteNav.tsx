"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { BRAND_LOCKUP_INTRINSIC_SIZE, BRAND_LOCKUP_SRC } from "@/lib/brand/logo";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/#product", label: "Product" },
  { href: "/preview", label: "Sample Report" },
  { href: "/#faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
];

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
        "sticky top-0 z-50 h-[80px] border-b px-6 md:px-12",
        isDarkPage
          ? "border-b border-[rgba(255,255,255,0.06)] bg-[rgba(7,7,7,0.92)] backdrop-blur-[16px]"
          : "border-border/40 bg-white/90 backdrop-blur-xl"
      )}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between">
        <Link
          href="/"
          className="relative flex h-[52px] w-[min(240px,52vw)] shrink-0 items-center overflow-hidden md:h-[68px] md:w-[min(300px,38vw)]"
        >
          <Image
            alt="VRTL Score"
            className="h-full w-full object-cover object-[50%_45%]"
            height={BRAND_LOCKUP_INTRINSIC_SIZE}
            priority
            sizes="(max-width: 768px) 50vw, 300px"
            src={BRAND_LOCKUP_SRC}
            width={BRAND_LOCKUP_INTRINSIC_SIZE}
          />
        </Link>

        <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className={cn(
                "text-[13px] font-medium transition-colors duration-150",
                isDarkPage
                  ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  : "text-text-2 hover:text-text"
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-6 md:flex">
          <Link
            className={cn(
              "text-[13px] font-medium transition-colors duration-150",
              isDarkPage
                ? "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                : "text-text-2 hover:text-text"
            )}
            href="/login"
          >
            Log in
          </Link>
          <Link
            className={cn(
              "nav-cta-pulse rounded-full px-[18px] py-2 text-[13px] font-medium text-black transition duration-150 hover:scale-[1.02] hover:brightness-110",
              isDarkPage ? "bg-[var(--accent-marketing)]" : "bg-accent text-white hover:bg-accent-2"
            )}
            href="/signup"
          >
            Run a free snapshot
          </Link>
        </div>

        <button
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md md:hidden",
            isDarkPage ? "text-[var(--text-secondary)]" : "text-text"
          )}
          type="button"
          aria-label="Menu"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div
          className={cn(
            "absolute left-4 right-4 top-[80px] z-50 rounded-lg border p-4 shadow-lg md:hidden",
            isDarkPage ? "border-[color:var(--border-subtle)] bg-[var(--bg-elevated)]" : "border-border bg-surface"
          )}
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  isDarkPage
                    ? "text-[var(--text-secondary)] hover:bg-white/[0.05] hover:text-[var(--text-primary)]"
                    : "text-text-2 hover:bg-bg-2 hover:text-text"
                )}
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className={cn("px-3 py-2 text-sm", isDarkPage ? "text-[var(--text-secondary)]" : "text-text-2")}
              href="/login"
              onClick={() => setMobileOpen(false)}
            >
              Log in
            </Link>
            <Link
              className={cn(
                "rounded-full py-2.5 text-center text-sm font-medium transition",
                isDarkPage ? "bg-[var(--accent-marketing)] text-black nav-cta-pulse" : "bg-accent text-white hover:bg-accent-2"
              )}
              href="/signup"
              onClick={() => setMobileOpen(false)}
            >
              Run a free snapshot
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
