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
    <main className="vrtl-app min-h-screen bg-bg">
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

            <div className="rounded-app-lg border border-white/5 bg-surface p-6 sm:p-8">
              <LoginForm nextPath={nextPath} />
            </div>
          </div>

          {/* Right: Value props */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <div className="rounded-app-lg border border-white/5 bg-surface p-8">
                <h2 className="text-lg font-semibold text-text">What you get with VRTL Score</h2>

                <div className="mt-6 space-y-5">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app bg-authority-dominant/15">
                      <svg className="h-5 w-5 text-authority-dominant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-text">AI Visibility Scores</h3>
                      <p className="mt-1 text-sm text-text-2">See how AI models like ChatGPT, Claude, and Gemini perceive your clients.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app bg-authority-stable/15">
                      <svg className="h-5 w-5 text-authority-stable" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-text">Competitive Benchmarking</h3>
                      <p className="mt-1 text-sm text-text-2">Track up to 8 competitors per client and see who AI recommends more often.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-app bg-authority-watchlist/15">
                      <svg className="h-5 w-5 text-authority-watchlist" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-text">Branded PDF Reports</h3>
                      <p className="mt-1 text-sm text-text-2">Generate professional reports with your agency branding in seconds.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {["/ai/icons8-chatgpt.svg", "/ai/icons8-claude.svg", "/ai/gemini.png"].map((src) => (
                        <div key={src} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-surface-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-text-2">Analyzes ChatGPT, Claude, Gemini & more</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
