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
          {/* Editorial paper haze (accent is monochrome, so keep this subtle) */}
          <div className="absolute -top-48 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-text/5 blur-3xl" />
          <div className="absolute bottom-[-240px] right-[-140px] h-[520px] w-[520px] rounded-full bg-text/3 blur-3xl" />
        </div>

        <div className="container-xl relative py-20">
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

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text sm:text-6xl sm:leading-[1.06]">
              Measure AI Visibility. Don’t Guess.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-text-2">
              Standardized prompts, structured evidence, and client-ready reports for agencies.
            </p>

            <div className="mx-auto mt-6 text-sm text-text-2">
              <span className="text-text-3">AI coverage</span>{" "}
              <span className="text-text-3">·</span> ChatGPT <span className="text-text-3">·</span>{" "}
              Gemini <span className="text-text-3">·</span> Claude{" "}
              <span className="text-text-3">·</span> More
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
          <h2 className="text-2xl font-semibold tracking-tight text-text">One workflow. One score.</h2>
          <p className="mt-2 max-w-2xl text-sm text-text-2">
            VRTL Score shows how brands appear across major AI models—using the same prompts, every time.
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
                Structured extraction plus raw outputs, so conclusions hold up in client reviews.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Client-ready reporting</div>
              <div className="mt-2 text-sm text-text-2">
                Branded PDFs with scores, confidence, and evidence by prompt.
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

          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Snapshot scoring</div>
              <div className="mt-2 text-sm text-text-2">
                Run the prompt pack and capture repeatable measurement runs.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Competitive analysis</div>
              <div className="mt-2 text-sm text-text-2">
                Track mentions and positioning versus a defined competitor set.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Provider breakdown</div>
              <div className="mt-2 text-sm text-text-2">
                See where scores come from across models.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Evidence by prompt</div>
              <div className="mt-2 text-sm text-text-2">
                Keep raw outputs tied directly to metrics.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Client reporting</div>
              <div className="mt-2 text-sm text-text-2">
                Generate a polished PDF the same day.
              </div>
            </Card>
            <Card className="p-5 shadow-none transition hover:shadow-lift">
              <div className="text-sm font-medium text-text">Agency branding</div>
              <div className="mt-2 text-sm text-text-2">
                Add your logo and accent for a white-labeled client experience.
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



