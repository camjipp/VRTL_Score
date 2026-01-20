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
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <Badge variant="accent">VRTL Score</Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text sm:text-6xl sm:leading-[1.06]">
                Win <span className="marker-underline">AI visibility</span> for every client.
              </h1>
              <p className="mt-5 text-[17px] leading-relaxed text-text-2">
                Run a standardized prompt pack, extract structured evidence, and ship a client-ready
                report—fast.
              </p>
              <div className="mt-4 text-sm text-text-2">
                ChatGPT · Claude · Gemini · Perplexity &amp; more
              </div>

              <DomainSearchBar />

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/app" variant="primary">
                  Open the app
                </ButtonLink>
                <ButtonLink href="/login" variant="secondary">
                  Create account
                </ButtonLink>
                <Link className="text-sm text-text-2 hover:text-text" href="/pricing">
                  See plans →
                </Link>
              </div>

              <div className="mt-10">
                <div className="text-xs font-medium uppercase tracking-wide text-text-3">
                  Trusted by teams that ship
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2">
                    Agency ops
                  </span>
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2">
                    SEO leads
                  </span>
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2">
                    Strategy teams
                  </span>
                  <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-text-2">
                    Client services
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full max-w-xl">
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



