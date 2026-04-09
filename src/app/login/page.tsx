import { headers } from "next/headers";

import { LoginForm } from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : undefined;
  const nextParam = sp?.next;
  const nextStr = Array.isArray(nextParam) ? nextParam[0] : nextParam;
  const nextPath = typeof nextStr === "string" && nextStr.startsWith("/") ? nextStr : "/app";

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host") ?? "";
  const proto =
    headersList.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const siteOrigin = host ? `${proto}://${host}` : "";

  return (
    <main className="page-marketing flex min-h-screen flex-col items-center justify-center px-6 py-14 md:px-12 md:py-20">
      <div className="w-full max-w-[420px]">
        <p className="mb-3 font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]">
          {"// ACCOUNT ACCESS"}
        </p>
        <h1 className="mb-2 font-marketing-display text-[1.75rem] font-normal tracking-[-0.02em] text-[var(--text-primary)] md:text-[2rem]">
          Sign in
        </h1>
        <p className="mb-8 font-marketing-body text-sm font-light leading-relaxed text-[var(--text-secondary)]">
          Use your account credentials to continue.
        </p>
        <LoginForm nextPath={nextPath} siteOrigin={siteOrigin} />
      </div>
    </main>
  );
}
