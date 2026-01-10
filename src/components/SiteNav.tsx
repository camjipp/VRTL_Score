import Link from "next/link";

export function SiteNav() {
  return (
    <header className="border-b">
      <nav className="flex gap-4 p-4 text-sm">
        <Link className="underline" href="/">
          Home
        </Link>
        <Link className="underline" href="/login">
          Login
        </Link>
        <Link className="underline" href="/pricing">
          Pricing
        </Link>
        <Link className="underline" href="/app">
          App
        </Link>
      </nav>
    </header>
  );
}



