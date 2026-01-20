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
    <main className="bg-bg">
      <div className="container-xl py-14">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface shadow-lift">
          <div className="grid md:grid-cols-2">
            <div className="hidden bg-bg-2 p-10 md:block">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="VRTL Score" className="h-10 w-auto" src="/brand/VRTL_Solo.png" />
                <div className="leading-tight">
                  <div className="text-sm font-semibold tracking-tight text-text">VRTL Score</div>
                  <div className="text-xs text-text-3">AI visibility for agencies</div>
                </div>
              </div>

              <div className="mt-10">
                <div className="text-2xl font-semibold tracking-tight text-text">
                  Log in to continue.
                </div>
                <div className="mt-3 text-sm text-text-2">
                  Measure AI search visibility, track competitors, and export client-ready reports.
                </div>
              </div>

              <ul className="mt-8 space-y-3 text-sm text-text-2">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                  Standardized prompt packs + structured evidence
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                  Competitive context with mention signals
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                  Branded PDF reporting for client delivery
                </li>
              </ul>

              <div className="mt-10 text-xs text-text-3">
                By continuing, you agree to follow your agency’s internal usage guidelines.
              </div>
            </div>

            <div className="p-8 md:p-10">
              <LoginForm nextPath={nextPath} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



