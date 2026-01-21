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
                <picture>
                  <source media="(prefers-color-scheme: dark)" srcSet="/brand/White_VRTL.png" />
                  <img
                    alt="VRTL"
                    className="h-full w-full scale-[1.6] object-cover object-left"
                    src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                  />
                </picture>
              </div>
              <div className="text-[88px] font-semibold leading-[0.9] tracking-tight text-text sm:text-[112px]">
                Score
              </div>
            </div>

            <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
              <div className="text-[26px] font-semibold leading-[1.06] tracking-tight text-text sm:text-[31px]">
                AI visibility, measured.
              </div>
              <div className="inline-flex items-center gap-2">
                <div className="inline-flex items-center -space-x-2">
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">ChatGPT</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/icons8-chatgpt.svg" />
                  </span>
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">Google</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/icons8-google-48.svg" />
                  </span>
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">Gemini</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/gemini.png" />
                  </span>
                  <span className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-border bg-surface">
                    <span className="sr-only">Claude</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" className="h-[17px] w-[17px]" src="/ai/icons8-claude.svg" />
                  </span>
                </div>
                <span className="text-sm text-text-3">&amp; more</span>
              </div>
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
      <section className="bg-bg" id="overview">
        <div className="container-xl py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Mock (left) */}
            <div className="mx-auto w-full max-w-[520px]">
              <Card className="p-6 shadow-none">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium text-text-3">AI visibility snapshot</div>
                  <Badge variant="neutral">Preview</Badge>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-text-3">Overall score</div>
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
                    <div className="mt-2 text-xs text-text-2">ChatGPT · Gemini · Claude · More</div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-text-3">
                  Evidence and provider breakdown are included in-app and in PDFs.
                </div>
              </Card>
            </div>

            {/* Copy (right) */}
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-3">One solution</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                One solution to win every search
              </h2>
              <div className="mt-5 space-y-4 text-sm text-text-2">
                <div className="flex gap-3">
                  <span className="mt-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-3">
                    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3v6m0 6v6M3 12h6m6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-text">Standardize measurement</div>
                    <div className="mt-1 text-text-2">Same prompts. Same schema. Comparable results over time.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-3">
                    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 12l2.5 2.5L16 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-text">Evidence-backed scoring</div>
                    <div className="mt-1 text-text-2">Structured extraction plus raw outputs—so scores hold up.</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-3">
                    <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                      <path d="M7 7h10M7 12h10M7 17h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="font-medium text-text">Client-ready reporting</div>
                    <div className="mt-1 text-text-2">Generate a clean PDF with scores, confidence, and evidence.</div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm">
                <Link className="text-text-2 hover:text-text" href="/app">
                  Open the app →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toolkits-style grid */}
      <section className="bg-bg-2" id="toolkits">
        <div className="container-xl py-16">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-text-3">Toolkits</div>
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

      {/* Testimonials */}
      <section className="bg-bg" id="testimonials">
        <div className="container-xl py-16">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-text-3">Testimonials</div>
            <h2 className="text-2xl font-semibold tracking-tight text-text">What agencies say</h2>
            <p className="max-w-2xl text-sm text-text-2">
              Short, factual feedback from teams using VRTL Score in real client work.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-6 shadow-none">
              <div className="text-sm text-text-2">
                “We finally have a repeatable way to measure AI visibility across accounts.”
              </div>
              <div className="mt-4 text-xs text-text-3">Agency lead</div>
            </Card>
            <Card className="p-6 shadow-none">
              <div className="text-sm text-text-2">
                “The evidence trail makes client conversations easy—no hand-wavy conclusions.”
              </div>
              <div className="mt-4 text-xs text-text-3">Strategy director</div>
            </Card>
            <Card className="p-6 shadow-none">
              <div className="text-sm text-text-2">
                “Scores and reports are consistent week to week. That’s the whole value.”
              </div>
              <div className="mt-4 text-xs text-text-3">Ops</div>
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



