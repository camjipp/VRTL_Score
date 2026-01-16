import Link from "next/link";
import Image from "next/image";

export function SiteNav() {
  return (
    <header className="border-b border-border/60 bg-bg0/80 backdrop-blur">
      <div className="container-xl">
        <nav className="flex h-16 items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            <Image
              alt="VRTL Score"
              height={28}
              priority
              src="/brand/vrtl-score-wordmark.svg"
              width={160}
            />
          </Link>

          <div className="flex items-center gap-3 text-sm">
            <Link className="text-text-2 hover:text-text" href="/pricing">
              Pricing
            </Link>
            <Link className="text-text-2 hover:text-text" href="/login">
              Log in
            </Link>
            <Link className="btn-primary" href="/app">
              Open app
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}



