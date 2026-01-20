import Link from "next/link";

import { DomainSearchBar } from "@/components/DomainSearchBar";
import { LandingToolkits } from "@/components/LandingToolkits";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main>
      {/* Hero (Semrush-One inspired) */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="pointer-events-none absolute inset-0">
          {/* Editorial paper haze (accent is monochrome, so keep this subtle) */}
          <div className="absolute -top-48 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-text/5 blur-3xl" />
          <div className="absolute bottom-[-240px] right-[-140px] h-[520px] w-[520px] rounded-full bg-text/3 blur-3xl" />
        </div>

        <div className="container-xl relative py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-end justify-center gap-0">
              {/* Crop out the extra transparent padding baked into the PNG */}
              <div className="h-[118px] w-[260px] overflow-hidden -mr-4 sm:h-[148px] sm:w-[320px] sm:-mr-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="VRTL"
                  className="h-full w-full scale-[1.6] object-cover object-left"
                  src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                />
              </div>
              <div className="text-[88px] font-semibold leading-[0.9] tracking-tight text-text sm:text-[112px]">
                Score
              </div>
            </div>

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-[17px] leading-relaxed text-text-2">
              <span>Standardized prompts, structured evidence, and client-ready reports for agencies.</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-3">
                <span>AI coverage</span>
                <span className="h-4 w-px bg-border" />
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center -space-x-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2">
                    <span className="sr-only">ChatGPT</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="h-3.5 w-3.5" src="/ai/icons8-chatgpt.svg" />
                  </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2">
                    <span className="sr-only">Gemini</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="h-3.5 w-3.5" src="/ai/gemini.svg" />
                  </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2">
                    <span className="sr-only">Claude</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="" className="h-3.5 w-3.5" src="/ai/icons8-claude.svg" />
                  </span>
                  </span>
                  <span className="inline-flex items-center rounded-full border border-border bg-surface-2 px-2.5 py-1 text-xs text-text-3">
                    &amp; more
                  </span>
                </span>
              </span>
            </div>

            {/* Centered search bar (Semrush-like) */}
            <div className="mx-auto mt-6 max-w-3xl">
              <DomainSearchBar />
            </div>
            <div className="mt-5 flex items-center justify-center gap-3 text-sm">
              <Link className="text-text-2 hover:text-text" href="/pricing">
                See plans & pricing →
              </Link>
              <span className="text-text-3">·</span>
              <Link className="text-text-2 hover:text-text" href="/app">
                Open the app
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* “One solution…” (Semrush-style) */}
      <section className="bg-bg">
        <div className="container-xl py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-text">One solution to win every search</h2>
          <div className="mt-4 grid gap-6 lg:grid-cols-2 lg:items-start">
            <div>
              <ul className="space-y-3 text-sm text-text-2">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                  Standardized prompts across major AI models
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                  Structured evidence tied directly to each score
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                  Client-ready reporting for agency delivery
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ButtonLink href="/app" variant="primary">
                  Get insights
                </ButtonLink>
                <ButtonLink href="/pricing" variant="secondary">
                  View pricing
                </ButtonLink>
              </div>
            </div>

            <Card className="p-6 shadow-none">
              <div className="text-sm font-medium text-text">What you get</div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="text-sm font-medium text-text">One workflow. One score.</div>
                  <div className="mt-2 text-sm text-text-2">
                    VRTL Score shows how brands appear across major AI models—using the same prompts, every time.
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="text-xs font-medium text-text-3">Standardized</div>
                    <div className="mt-2 text-sm font-medium text-text">Scoring</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="text-xs font-medium text-text-3">Structured</div>
                    <div className="mt-2 text-sm font-medium text-text">Evidence</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="text-xs font-medium text-text-3">Client-ready</div>
                    <div className="mt-2 text-sm font-medium text-text">Reporting</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Toolkits-style grid */}
      <section className="bg-bg-2">
        <div className="container-xl py-16">
          <div className="flex flex-col gap-2">
            <Badge variant="neutral">Toolkits</Badge>
            <h2 className="text-2xl font-semibold tracking-tight text-text">
              Everything agencies need to ship AI visibility.
            </h2>
            <p className="max-w-2xl text-sm text-text-2">
              Run snapshots, benchmark competitors, and deliver reports—without ad-hoc analysis.
            </p>
          </div>

          <div className="mt-8">
            <LandingToolkits />
          </div>
        </div>
      </section>

      {/* Snapshot preview (moved down the page) */}
      <section className="bg-bg">
        <div className="container-xl py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-text">A report clients trust.</h2>
                <p className="mt-2 text-sm text-text-2">
                  Scores, confidence, competitors, and evidence—organized in one place.
                </p>
              </div>
              <Badge variant="neutral">Preview</Badge>
            </div>

            <Card className="p-6 shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-text">Snapshot preview</div>
                <Badge variant="neutral">Sample</Badge>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-text-3">Overall</div>
                  <Badge variant="success">82</Badge>
                </div>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-2">Mentioned</span>
                    <span className="text-text-3">7 / 10 prompts</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-bg">
                    <div className="h-2 w-[70%] rounded-full bg-accent/70" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-text-2">Confidence</span>
                    <span className="text-text-3">High</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-bg">
                    <div className="h-2 w-[86%] rounded-full bg-accent/45" />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="text-xs text-text-3">Top mentions</div>
                  <div className="mt-2 text-sm font-medium text-text">Competitors</div>
                  <div className="mt-2 text-xs text-text-2">Competitor A · Competitor B · Competitor C</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="text-xs text-text-3">Providers</div>
                  <div className="mt-2 text-sm font-medium text-text">Breakdown</div>
                  <div className="mt-2 text-xs text-text-2">OpenAI · Anthropic · Gemini</div>
                </div>
              </div>

              <div className="mt-4 text-xs text-text-3">
                Evidence by prompt and provider breakdown are available in-app and in PDFs.
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-bg">
        <div className="container-xl py-16">
          <Card className="p-8 shadow-none">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl font-semibold tracking-tight text-text">
                  Start measuring AI visibility.
                </div>
                <div className="mt-2 text-sm text-text-2">
                  Create a client, run a snapshot, and ship a report—in one flow.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href="/login" variant="primary">
                  Create account
                </ButtonLink>
                <ButtonLink href="/app" variant="secondary">
                  Open app
                </ButtonLink>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}



