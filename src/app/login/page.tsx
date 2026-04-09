import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import { LoginForm } from "@/components/LoginForm";

const statRow = [
  { label: "Mention rate", value: "62%", colorClass: "text-[#111]" },
  { label: "Top position", value: "60%", colorClass: "text-[#111]" },
  { label: "Authority", value: "0%", colorClass: "text-[#e53e3e]" },
] as const;

const rankRows = [
  { rank: "#1", name: "Your client", bar: 100, you: true },
  { rank: "#2", name: "Competitor A", bar: 72, you: false },
  { rank: "#3", name: "Competitor B", bar: 61, you: false },
] as const;

function AuthReportPreview() {
  return (
    <div className="relative mt-2 max-w-[300px]">
      <div
        aria-hidden
        className="absolute top-2 left-1 right-[-8px] bottom-[-8px] rotate-[2.5deg] rounded-sm bg-[#e2e2e2]"
      />
      <div
        aria-hidden
        className="absolute top-1 left-0.5 right-[-4px] bottom-[-4px] rotate-[1.2deg] rounded-sm bg-[#eeeeee]"
      />
      <div className="font-marketing-body relative rounded-sm bg-white px-4 py-4 shadow-[0_4px_32px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-marketing-mono text-[8px] uppercase tracking-[0.12em] text-[#aaa]">
              AI Authority Report
            </div>
            <div className="mt-0.5 text-[12px] font-medium text-[#111]">Executive summary</div>
          </div>
          <div className="rounded-sm bg-[#111] px-1.5 py-0.5 font-marketing-mono text-[8px] text-white">
            PDF
          </div>
        </div>
        <div className="my-2.5 h-px bg-[#f0f0f0]" />
        <div className="flex items-center gap-2.5">
          <div className="relative h-11 w-11 shrink-0">
            <svg width="44" height="44" viewBox="0 0 52 52" className="h-full w-full" aria-hidden>
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke="#f0f0f0"
                strokeWidth="4"
                strokeDasharray="94 126"
                strokeDashoffset="-16"
                strokeLinecap="round"
                transform="rotate(135 26 26)"
              />
              <circle
                cx="26"
                cy="26"
                r="20"
                fill="none"
                stroke="#00e87a"
                strokeWidth="4"
                strokeDasharray="64 156"
                strokeDashoffset="-16"
                strokeLinecap="round"
                transform="rotate(135 26 26)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-light leading-none text-[#111]">68</span>
              <span className="font-marketing-mono text-[6px] text-[#aaa]">/100</span>
            </div>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-3 gap-1">
            {statRow.map((stat) => (
              <div
                key={stat.label}
                className="rounded-sm border border-[#f0f0f0] bg-[#fafafa] px-0.5 py-1 text-center"
              >
                <div className={`text-[10px] font-medium ${stat.colorClass}`}>{stat.value}</div>
                <div className="font-marketing-mono text-[6px] leading-tight text-[#aaa]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 space-y-1">
          {rankRows.map((row) => (
            <div key={row.rank} className="flex items-center gap-1.5">
              <span
                className={`w-3.5 shrink-0 font-marketing-mono text-[8px] ${row.you ? "text-[var(--accent-marketing)]" : "text-[#bbb]"}`}
              >
                {row.rank}
              </span>
              <span
                className={`min-w-0 flex-1 text-[9px] ${row.you ? "font-medium text-[#111]" : "font-normal text-[#888]"}`}
              >
                {row.name}
              </span>
              <div className="h-0.5 w-12 shrink-0 rounded-full bg-[#f0f0f0]">
                <div
                  className={`h-full rounded-full ${row.you ? "bg-[var(--accent-marketing)]" : "bg-[#e0e0e0]"}`}
                  style={{ width: `${row.bar}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LoginBrandColumn() {
  return (
    <div className="hidden min-h-screen w-[56%] shrink-0 flex-col justify-between border-r border-white/[0.06] bg-[var(--bg-base)] px-8 py-12 md:flex md:px-14 md:py-16 lg:px-16">
      <Link href="/" className="inline-block w-fit">
        <Image
          src="/brand/White_VRTL.png"
          alt="VRTL Score"
          width={140}
          height={28}
          className="h-7 w-auto"
          priority
        />
      </Link>

      <div className="min-w-0 flex-1 py-10">
        <p className="mb-5 font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]">
          {"// SIGN IN"}
        </p>
        <h1 className="mb-4 max-w-[420px] font-marketing-display text-[2rem] font-normal leading-[1.12] tracking-[-0.02em] text-[var(--text-primary)] md:text-[2.35rem]">
          Welcome back to VRTL Score.
        </h1>
        <p className="mb-8 max-w-[380px] font-marketing-body text-[15px] font-light leading-relaxed text-[var(--text-secondary)]">
          Access your dashboard, run snapshots, and deliver reports that prove AI visibility.
        </p>
        <AuthReportPreview />
      </div>

      <p className="max-w-md font-marketing-mono text-[11px] leading-relaxed tracking-[0.06em] text-[var(--text-muted)]">
        Trusted by agencies tracking AI visibility across ChatGPT, Gemini, Claude, and Perplexity.
      </p>
    </div>
  );
}

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
    <main className="page-marketing flex min-h-screen flex-col md:flex-row">
      <LoginBrandColumn />

      <div className="flex min-h-screen w-full flex-1 flex-col justify-center bg-[#0a0a0a] px-6 py-10 md:w-[44%] md:max-w-none md:items-center md:px-16 md:py-16">
        <div className="w-full max-w-[400px] md:mx-auto">
          <p className="mb-3 font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]">
            {"// ACCOUNT ACCESS"}
          </p>
          <h2 className="mb-2 font-marketing-display text-[1.75rem] font-normal tracking-[-0.02em] text-[var(--text-primary)] md:text-[2rem]">
            Sign in
          </h2>
          <p className="mb-8 font-marketing-body text-sm font-light leading-relaxed text-[var(--text-secondary)]">
            Use your account credentials to continue.
          </p>
          <LoginForm nextPath={nextPath} siteOrigin={siteOrigin} />
        </div>
      </div>
    </main>
  );
}
