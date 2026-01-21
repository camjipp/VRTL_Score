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
                  <div className="text-xs font-medium uppercase tracking-wide text-text-3">
                    Snapshot preview
                  </div>
                  <Badge variant="neutral">Sample</Badge>
                </div>

                <div className="mt-4 rounded-2xl border border-border bg-surface-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-text-3">Overall score</div>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-semibold tracking-tight text-text">82</div>
                      <Badge variant="success">Strong</Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-2">Mentioned</span>
                      <span className="text-text-3">7 / 10 prompts</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-bg">
                      <div className="h-2 w-[70%] rounded-full bg-success/70" />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-text-2">Confidence</span>
                      <span className="inline-flex items-center gap-2 text-text-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        High
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-bg">
                      <div className="h-2 w-[86%] rounded-full bg-success/40" />
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
              <div className="text-xs font-medium uppercase tracking-wide text-text-3">Overview</div>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                One system for AI visibility.
              </h2>
              <div className="mt-6 grid gap-4">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="text-sm font-semibold text-text">Standardized measurement</div>
                  <div className="mt-2 text-sm text-text-2">Same prompts. Same schema. Comparable runs.</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="text-sm font-semibold text-text">Evidence-backed scoring</div>
                  <div className="mt-2 text-sm text-text-2">Scores tied to structured evidence + raw output.</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="text-sm font-semibold text-text">Client-ready reporting</div>
                  <div className="mt-2 text-sm text-text-2">Deliver the same day. Clean and consistent.</div>
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
            <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Built for agencies.</h2>
            <p className="max-w-2xl text-sm text-text-2">
              Snapshots, competitive context, and reporting—designed as a repeatable workflow.
            </p>
          </div>

          <div className="mt-8">
            <LandingToolkits />
          </div>
        </div>
      </section>

      {/* Report preview */}
      <section className="bg-bg" id="report">
        <div className="container-xl py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-text-3">Reporting</div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                A report clients can scan in minutes.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-text-2">
                Scores, confidence, provider breakdown, and evidence—laid out like a real deliverable.
              </p>
              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="text-sm font-semibold text-text">Executive summary</div>
                  <div className="mt-2 text-sm text-text-2">The headline score and the why behind it.</div>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <div className="text-sm font-semibold text-text">Evidence by prompt</div>
                  <div className="mt-2 text-sm text-text-2">Snippets and structured fields for defensibility.</div>
                </div>
              </div>
            </div>

            {/* PDF-style mock page */}
            <div className="mx-auto w-full max-w-[520px]">
              <div className="rounded-2xl border border-border bg-surface shadow-lift">
                <div className="border-b border-border px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wide text-text-3">
                        VRTL Score Report
                      </div>
                      <div className="mt-2 text-lg font-semibold tracking-tight text-text">Acme Agency</div>
                      <div className="mt-1 text-xs text-text-3">client.com · 2026‑01‑21</div>
                    </div>
                    <Badge variant="neutral">PDF</Badge>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-border bg-surface-2 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-text-3">Overall score</div>
                        <div className="text-3xl font-semibold tracking-tight text-text">82</div>
                      </div>
                      <div className="mt-3 text-xs text-text-3">Confidence: High</div>
                      <div className="mt-3 h-2 w-full rounded-full bg-bg">
                        <div className="h-2 w-[82%] rounded-full bg-success/70" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-surface p-4">
                        <div className="text-xs font-medium uppercase tracking-wide text-text-3">Providers</div>
                        <div className="mt-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-text-2">ChatGPT</span>
                            <span className="font-medium text-text">84</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-text-2">Gemini</span>
                            <span className="font-medium text-text">79</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-text-2">Claude</span>
                            <span className="font-medium text-text">83</span>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface p-4">
                        <div className="text-xs font-medium uppercase tracking-wide text-text-3">Evidence</div>
                        <div className="mt-3 text-xs text-text-2">
                          “Mentions Acme as a top recommendation for agencies…”
                        </div>
                        <div className="mt-3 text-[11px] text-text-3">Prompt #3 · recommendation: strong</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="text-xs font-medium uppercase tracking-wide text-text-3">3 actions</div>
                      <div className="mt-3 grid gap-2 text-xs text-text-2">
                        <div className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                          Add competitors to increase confidence
                        </div>
                        <div className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                          Improve “top” placements across prompts
                        </div>
                        <div className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-text-3" />
                          Re-run after messaging changes
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 text-[11px] text-text-3">
                    Preview only — generated PDFs include evidence by prompt and provider breakdown.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-bg" id="testimonials">
        <div className="container-xl py-16">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-text-3">Testimonials</div>
            <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">What teams say</h2>
            <p className="max-w-2xl text-sm text-text-2">
              Short, factual feedback from teams using VRTL Score with real client accounts.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <Card className="p-8 shadow-none md:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-text-3">Featured</div>
              <div className="mt-4 text-2xl font-semibold leading-tight tracking-tight text-text">
                “We finally have a repeatable way to measure AI visibility across accounts.”
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <div className="text-sm text-text-2">
                  <span className="font-medium text-text">Agency lead</span> · Weekly reporting cadence
                </div>
                <Badge variant="success">82 avg</Badge>
              </div>
            </Card>
            <Card className="p-6 shadow-none">
              <div className="text-base leading-relaxed text-text">
                “The evidence trail makes client conversations easy—no hand-wavy conclusions.”
              </div>
              <div className="mt-4 text-xs text-text-3">Strategy director</div>
            </Card>
            <Card className="p-6 shadow-none">
              <div className="text-base leading-relaxed text-text">
                “Scores and reports are consistent week to week. That’s the whole value.”
              </div>
              <div className="mt-4 text-xs text-text-3">Ops</div>
            </Card>
            <Card className="p-6 shadow-none">
              <div className="text-base leading-relaxed text-text">
                “It’s the first time we can benchmark AI recommendations like we benchmark SEO.”
              </div>
              <div className="mt-4 text-xs text-text-3">Account director</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#080808] text-white">
        <div className="container-xl py-16">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-white/60">Get started</div>
              <div className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start measuring AI visibility.
              </div>
              <div className="mt-2 text-sm text-white/70">
                Create a client, run a snapshot, and ship a report—in one flow.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink className="border border-white/15 bg-white/10 text-white hover:bg-white/15" href="/login" variant="secondary">
                Create account
              </ButtonLink>
              <ButtonLink className="border border-white/15 bg-white/10 text-white hover:bg-white/15" href="/app" variant="secondary">
                Open app
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



