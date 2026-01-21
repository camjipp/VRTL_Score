"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ButtonLink } from "@/components/ui/ButtonLink";

export function SiteNav() {
  const pathname = usePathname();
  // Hide marketing nav inside the app; the app has its own shell.
  if (pathname.startsWith("/app")) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#080808] text-white">
      <div className="container-xl">
        <nav className="flex h-14 items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="VRTL" className="h-7 w-auto" src="/brand/White_VRTL.png" />
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <div className="hidden items-center gap-5 md:flex">
              <Link className="text-white/75 hover:text-white" href="/#overview">
                Overview
              </Link>
              <Link className="text-white/75 hover:text-white" href="/#features">
                Features
              </Link>
              <Link className="text-white/75 hover:text-white" href="/#toolkits">
                Toolkits
              </Link>
              <Link className="text-white/75 hover:text-white" href="/#report">
                Report
              </Link>
              <Link className="text-white/75 hover:text-white" href="/#proof">
                Proof
              </Link>
              <Link className="text-white/75 hover:text-white" href="/#testimonials">
                Testimonials
              </Link>
              <Link className="text-white/75 hover:text-white" href="/pricing">
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link className="text-white/75 hover:text-white" href="/login">
                Log in
              </Link>
              <ButtonLink
                className="border border-white/15 bg-white/10 text-white hover:bg-white/15"
                href="/app"
                size="sm"
                variant="secondary"
              >
                Open app
              </ButtonLink>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}



