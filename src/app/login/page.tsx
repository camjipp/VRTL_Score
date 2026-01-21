import Link from "next/link";

import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : undefined;

  const nextParam = sp?.next;
  const nextStr = Array.isArray(nextParam) ? nextParam[0] : nextParam;

  // allow only internal paths to prevent open redirects
  const nextPath = typeof nextStr === "string" && nextStr.startsWith("/") ? nextStr : "/app";

  return (
    <main className="min-h-screen bg-bg">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="container-xl relative flex min-h-screen flex-col items-center justify-center py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Link href="/" className="transition-opacity hover:opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="VRTL Score"
                className="h-12 w-auto"
                src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
              />
            </Link>
          </div>

          {/* Login card */}
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl md:p-10">
            <LoginForm nextPath={nextPath} />
          </div>

          {/* Footer links */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-text-3">
            <Link href="/" className="hover:text-text">
              Home
            </Link>
            <Link href="/pricing" className="hover:text-text">
              Pricing
            </Link>
            <Link href="/privacy" className="hover:text-text">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
