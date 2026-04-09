import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import { LoginForm } from "@/components/LoginForm";

const statRow = [
  { label: "Mention rate", value: "62%", color: "#111" },
  { label: "Top position", value: "60%", color: "#111" },
  { label: "Authority", value: "0%", color: "#e53e3e" },
] as const;

const rankRows = [
  { rank: "#1", name: "Your client", bar: 100, you: true },
  { rank: "#2", name: "Competitor A", bar: 72, you: false },
  { rank: "#3", name: "Competitor B", bar: 61, you: false },
] as const;

function LoginBrandSide() {
  return (
    <div
      className="hidden min-h-screen w-[55%] shrink-0 justify-between border-r border-[rgba(255,255,255,0.06)] md:flex md:flex-col"
      style={{
        background: "#070707",
        padding: "60px 64px",
      }}
    >
      <Link href="/" className="inline-block w-fit">
        <Image src="/brand/White_VRTL.png" alt="VRTL Score" width={140} height={28} className="h-7 w-auto" priority />
      </Link>

      <div>
        <div
          className="font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]"
          style={{ marginBottom: "20px" }}
        >
          // AI VISIBILITY FOR AGENCIES
        </div>

        <h1
          className="font-marketing-display font-normal tracking-[-0.02em] text-[#efefef]"
          style={{
            fontSize: "42px",
            lineHeight: 1.1,
            maxWidth: "380px",
            marginBottom: "16px",
          }}
        >
          Your clients are invisible to AI.
        </h1>

        <p
          className="font-marketing-body font-light"
          style={{
            fontSize: "15px",
            color: "#666",
            lineHeight: 1.6,
            maxWidth: "340px",
            marginBottom: "40px",
          }}
        >
          Sign in to access your dashboard, run snapshots, and deliver reports that prove AI visibility.
        </p>

        <div className="relative max-w-[320px]">
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "8px",
              left: "4px",
              right: "-8px",
              bottom: "-8px",
              background: "#e2e2e2",
              borderRadius: "2px",
              transform: "rotate(2.5deg)",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "4px",
              left: "2px",
              right: "-4px",
              bottom: "-4px",
              background: "#eeeeee",
              borderRadius: "2px",
              transform: "rotate(1.2deg)",
            }}
          />

          <div
            className="font-marketing-body relative"
            style={{
              background: "#ffffff",
              borderRadius: "2px",
              padding: "18px 20px",
              boxShadow: "0 4px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div
                  className="font-marketing-mono uppercase"
                  style={{
                    fontSize: "8px",
                    color: "#aaa",
                    letterSpacing: "0.12em",
                  }}
                >
                  AI Authority Report
                </div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "#111", marginTop: "2px" }}>Executive summary</div>
              </div>
              <div
                className="font-marketing-mono"
                style={{
                  background: "#111",
                  color: "#fff",
                  fontSize: "8px",
                  padding: "2px 6px",
                  borderRadius: "2px",
                }}
              >
                PDF
              </div>
            </div>

            <div style={{ height: "1px", background: "#f0f0f0", margin: "10px 0" }} />

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative", width: "52px", height: "52px", flexShrink: 0 }}>
                <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden>
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
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 300, color: "#111", lineHeight: 1 }}>68</span>
                  <span className="font-marketing-mono" style={{ fontSize: "7px", color: "#aaa" }}>
                    /100
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "4px",
                  flex: 1,
                }}
              >
                {statRow.map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: "#fafafa",
                      border: "1px solid #f0f0f0",
                      borderRadius: "2px",
                      padding: "6px 4px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 500, color: stat.color }}>{stat.value}</div>
                    <div
                      className="font-marketing-mono"
                      style={{ fontSize: "7px", color: "#aaa", marginTop: "1px", lineHeight: 1.3 }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "10px" }}>
              {rankRows.map((row) => (
                <div
                  key={row.rank}
                  style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}
                >
                  <span
                    className="font-marketing-mono"
                    style={{
                      fontSize: "9px",
                      color: row.you ? "#00e87a" : "#bbb",
                      width: "16px",
                    }}
                  >
                    {row.rank}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: row.you ? "#111" : "#888",
                      flex: 1,
                      fontWeight: row.you ? 500 : 400,
                    }}
                  >
                    {row.name}
                  </span>
                  <div style={{ width: "60px", height: "2px", background: "#f0f0f0", borderRadius: "999px" }}>
                    <div
                      style={{
                        width: `${row.bar}%`,
                        height: "100%",
                        background: row.you ? "#00e87a" : "#e0e0e0",
                        borderRadius: "999px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p
        className="font-marketing-mono"
        style={{
          fontSize: "11px",
          color: "#333",
          letterSpacing: "0.06em",
        }}
      >
        Trusted by agencies tracking AI visibility across ChatGPT, Gemini, Claude + Perplexity
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
      <LoginBrandSide />

      <div
        className="flex min-h-screen w-full flex-col justify-center bg-[#0c0c0c] px-6 py-10 md:w-[45%] md:px-16 md:py-[60px]"
      >
        <div className="mx-auto w-full max-w-[360px] md:mx-0">
          <div
            className="font-marketing-mono text-[11px] uppercase tracking-[0.12em] text-[var(--accent-marketing)]"
            style={{ marginBottom: "12px" }}
          >
            // SIGN IN
          </div>

          <h2
            className="font-marketing-display font-normal tracking-[-0.02em] text-[#efefef]"
            style={{ fontSize: "28px", marginBottom: "6px" }}
          >
            Welcome back.
          </h2>

          <p
            className="font-marketing-body font-light"
            style={{
              fontSize: "14px",
              color: "#555",
              marginBottom: "36px",
              lineHeight: 1.5,
            }}
          >
            Access your dashboard and client reports.
          </p>

          <LoginForm nextPath={nextPath} siteOrigin={siteOrigin} />
        </div>
      </div>
    </main>
  );
}
