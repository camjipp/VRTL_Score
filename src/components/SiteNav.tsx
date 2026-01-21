import Link from "next/link";

import { ButtonLink } from "@/components/ui/ButtonLink";

export function SiteNav() {
  return (
    <header className="border-b border-border bg-[#080808] text-white">
      <div className="container-xl">
        <nav className="flex h-16 items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="VRTL" className="h-7 w-auto" src="/brand/VRTL_white_transparent.png" />
          </Link>

          <div className="flex items-center gap-5 text-sm">
            <Link className="text-white/80 hover:text-white" href="#overview">
              Overview
            </Link>
            <Link className="text-white/80 hover:text-white" href="#toolkits">
              Toolkits
            </Link>
            <Link className="text-white/80 hover:text-white" href="#testimonials">
              Testimonials
            </Link>
            <Link className="text-white/80 hover:text-white" href="/pricing">
              Pricing
            </Link>
            <Link className="text-white/80 hover:text-white" href="/login">
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
        </nav>
      </div>
    </header>
  );
}



