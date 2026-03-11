import Image from "next/image";
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
  const nextPath = typeof nextStr === "string" && nextStr.startsWith("/") ? nextStr : "/app";

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#05070A",
        backgroundImage: "radial-gradient(ellipse 120% 70% at 50% 40%, rgba(16,163,127,0.07), transparent 70%)",
      }}
    >
      {/* Minimal header: logo only */}
      <header className="flex h-14 shrink-0 items-center border-b px-6" style={{ borderColor: "#1A212B" }}>
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/VRTL_Solo.png"
            alt="VRTL Score"
            width={120}
            height={40}
            className="h-8 w-auto brightness-0 invert opacity-95"
            priority
          />
        </Link>
      </header>

      {/* Centered login card */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">
          <div
            className="rounded-[14px] border p-8"
            style={{
              backgroundColor: "#0B0F14",
              borderColor: "#1A212B",
              boxShadow: "0 25px 50px rgba(0,0,0,0.45)",
            }}
          >
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "#E6EDF3" }}>
              Sign in to your account
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#8B98A5" }}>
              Access your dashboard and client reports.
            </p>

            <div className="mt-6">
              <LoginForm nextPath={nextPath} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
