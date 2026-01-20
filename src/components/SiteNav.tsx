import Link from "next/link";

import { ButtonLink } from "@/components/ui/ButtonLink";

export function SiteNav() {
  return (
    <header className="border-b border-border/60 bg-bg/80 backdrop-blur">
      <div className="container-xl">
        <nav className="flex h-16 items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-accent/20 ring-1 ring-accent/40" />
              <div className="leading-tight">
                <div className="text-[15px] font-semibold tracking-tight text-text">
                  VRTL <span className="text-text-2">Score</span>
                </div>
                <div className="text-xs text-text-3">AI visibility for agencies</div>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <Link className="text-text-2 hover:text-text" href="/pricing">
              Pricing
            </Link>
            <Link className="text-text-2 hover:text-text" href="/login">
              Log in
            </Link>
            <ButtonLink href="/app" size="sm" variant="primary">
              Open app
            </ButtonLink>
          </div>
        </nav>
      </div>
    </header>
  );
}



