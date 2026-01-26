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
    <main className="min-h-screen bg-gradient-to-b from-surface to-bg">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Form */}
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Welcome back
              </h1>
              <p className="mt-3 text-lg text-text-2">
                Sign in to access your dashboard and client reports.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-xl sm:p-8">
              <LoginForm nextPath={nextPath} />
            </div>
          </div>

          {/* Right: Visual */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <div className="mb-6 text-sm font-medium text-text-3">
                Your dashboard awaits
              </div>

              {/* Dashboard preview mockup */}
              <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
                {/* Header bar */}
                <div className="flex items-center justify-between border-b border-border bg-surface-2/50 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-emerald-500 text-sm font-bold text-white">
                      V
                    </div>
                    <span className="font-semibold text-text">VRTL Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-surface-2" />
                  </div>
                </div>

                {/* Dashboard content mockup */}
                <div className="p-6">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Clients", value: "12", color: "emerald" },
                      { label: "Avg Score", value: "78", color: "violet" },
                      { label: "Reports", value: "47", color: "amber" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-surface-2 p-4">
                        <div className="text-xs text-text-3">{stat.label}</div>
                        <div className={`mt-1 text-2xl font-bold ${
                          stat.color === "emerald" ? "text-emerald-600" :
                          stat.color === "violet" ? "text-violet-600" :
                          "text-amber-600"
                        }`}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Client list mockup */}
                  <div className="mt-6 space-y-3">
                    {[
                      { name: "Acme Corp", score: 82 },
                      { name: "TechStart Inc", score: 74 },
                      { name: "Growth Labs", score: 89 },
                    ].map((client) => (
                      <div key={client.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-sm font-bold text-slate-600">
                            {client.name.charAt(0)}
                          </div>
                          <div className="font-medium text-text">{client.name}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-emerald-600">{client.score}</span>
                          <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-text-3">
                Pick up right where you left off
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
