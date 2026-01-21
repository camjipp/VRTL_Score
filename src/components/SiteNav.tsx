"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#testimonials", label: "Testimonials" },
  { href: "/pricing", label: "Pricing" },
];

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide marketing nav inside the app; the app has its own shell.
  if (pathname.startsWith("/app")) return null;

  return (
    <header className="sticky top-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 border-b border-white/10 bg-[#080808]/80 backdrop-blur-xl" />

      <div className="container-xl relative">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link className="flex items-center gap-3 transition-opacity hover:opacity-80" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="VRTL" className="h-8 w-auto" src="/brand/White_VRTL.png" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/70 transition-all hover:text-white"
              href="/login"
            >
              Log in
            </Link>
            <Link
              className="group relative overflow-hidden rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#080808] transition-all hover:shadow-lg hover:shadow-white/20"
              href="/app"
            >
              <span className="relative z-10">Get started</span>
              <div className="absolute inset-0 -z-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/5 hover:text-white md:hidden"
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
            "absolute left-0 right-0 top-full overflow-hidden transition-all duration-300 ease-out md:hidden",
            mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="border-t border-white/10 bg-[#080808]/95 px-6 py-4 backdrop-blur-xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white"
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-white/10" />
              <Link
                className="rounded-lg px-4 py-3 text-sm font-medium text-white/70 transition-all hover:bg-white/5 hover:text-white"
                href="/login"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                className="mt-2 rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-[#080808] transition-all hover:bg-white/90"
                href="/app"
                onClick={() => setMobileOpen(false)}
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
