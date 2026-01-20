import Link from "next/link";

import { DomainSearchBar } from "@/components/DomainSearchBar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main>
      {/* Hero (Semrush-One inspired) */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute bottom-[-240px] right-[-140px] h-[520px] w-[520px] rounded-full bg-bg-2 blur-3xl" />
        </div>

        <div className="container-xl relative py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-end justify-center gap-1 sm:gap-2">
              {/* Crop out the extra transparent padding baked into the PNG */}
              <div className="h-[118px] w-[240px] overflow-hidden sm:h-[148px] sm:w-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="VRTL"
                  className="h-full w-full scale-[1.9] object-cover object-center"
                  src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                />
              </div>
              <div className="-ml-1 text-[88px] font-semibold leading-[0.9] tracking-tight text-text sm:-ml-2 sm:text-[112px]">
                Score
              </div>
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text sm:text-6xl sm:leading-[1.06]">
              Win <span className="marker-underline">AI Search Visibility</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-text-2">
              Standardized prompt packs, structured evidence extraction, and client-ready reporting
              for agencies.
            </p>

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-sm text-text-2">
              <span className="text-text-3">AI coverage:</span>

              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-bg-2">
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3.8c2.2-1.3 5.1-.6 6.4 1.6 1.1 1.9.7 4.2-.7 5.7 1.7 1 2.5 3.2 1.7 5.1-1 2.5-4 3.7-6.4 2.5-.4-.2-.7-.4-1-.7-.4 2.3-2.4 4-4.8 4-2.7 0-4.9-2.2-4.9-4.9 0-2.2 1.5-4.1 3.5-4.7-1.5-1.7-1.8-4.2-.5-6.2 1.3-2.2 4.2-2.9 6.3-1.6Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                ChatGPT
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-bg-2">
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l1.6 5 5 1.6-5 1.6-1.6 5-1.6-5-5-1.6 5-1.6L12 3Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                Gemini
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-bg-2">
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M16.5 8.2c-.9-1.1-2.3-1.9-4.1-1.9-3 0-5.4 2.4-5.4 5.4s2.4 5.4 5.4 5.4c1.8 0 3.2-.7 4.1-1.9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Claude
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm text-text-2">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-bg-2 text-text-3">
                  <span className="text-[11px] font-semibold leading-none">+</span>
                </span>
                more
              </span>
            </div>

            {/* Centered search bar (Semrush-like) */}
            <div className="mx-auto mt-8 max-w-2xl">
              <DomainSearchBar />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
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

      {/* “One solution…” */}
      <section className="bg-bg">
        <div className="container-xl py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-text">One workflow for AI search.</h2>
          <p className="mt-2 max-w-2xl text-sm text-text-2">
            VRTL Score helps agencies measure, explain, and improve how brands show up across LLMs.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Standardized scoring</div>
              <div className="mt-2 text-sm text-text-2">
                Same prompts. Same schema. Comparable results across clients and time.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Evidence you can defend</div>
              <div className="mt-2 text-sm text-text-2">
                Structured extraction plus raw outputs so clients can trust the conclusions.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Client-ready reporting</div>
              <div className="mt-2 text-sm text-text-2">
                Branded PDF with score dashboard, confidence, and evidence by prompt.
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
              Everything an agency needs to ship AI visibility.
            </h2>
            <p className="max-w-2xl text-sm text-text-2">
              Run snapshots, benchmark competitors, and generate reports—all in one calm workflow.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Snapshot scoring</div>
              <div className="mt-2 text-sm text-text-2">
                Execute the prompt pack and capture repeatable measurement runs.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Competitive analysis</div>
              <div className="mt-2 text-sm text-text-2">
                Track mentions and positioning signals versus a curated competitor set.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Provider breakdown</div>
              <div className="mt-2 text-sm text-text-2">
                Understand differences across models and where the score comes from.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Evidence by prompt</div>
              <div className="mt-2 text-sm text-text-2">
                Keep the raw outputs close to the metrics to reduce “black box” pushback.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Client reporting</div>
              <div className="mt-2 text-sm text-text-2">
                Generate a polished PDF your team can send the same day.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Agency branding</div>
              <div className="mt-2 text-sm text-text-2">
                Add logo + accent for a “built by your agency” client experience.
              </div>
            </Card>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <ButtonLink href="/app" variant="primary">
              Get insights
            </ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">
              View pricing
            </ButtonLink>
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
                Evidence-by-prompt + provider breakdown available in-app and in PDFs.
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
                  Start measuring AI visibility today.
                </div>
                <div className="mt-2 text-sm text-text-2">
                  Create a client, run a snapshot, and ship a report—all in one flow.
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



