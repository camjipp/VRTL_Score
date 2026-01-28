import Link from "next/link";

import { DomainSearchBar } from "@/components/DomainSearchBar";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF8]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-16 md:pb-24 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            {/* Logo + wordmark */}
            <div className="flex items-end justify-center gap-0">
              <div className="h-[100px] w-[220px] overflow-hidden -mr-3 sm:h-[130px] sm:w-[280px] sm:-mr-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="VRTL"
                  className="h-full w-full scale-[1.6] object-cover object-left"
                  src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                />
              </div>
              <span className="text-[72px] font-semibold leading-[0.9] tracking-tight text-[#0A0A0A] sm:text-[96px]">
                Score
              </span>
            </div>

            {/* Tagline with emphasis */}
            <p className="mt-6 text-xl text-[#666] sm:text-2xl">
              <span className="font-semibold text-[#0A0A0A]">AI visibility</span>, measured.
            </p>

            {/* AI provider icons */}
            <div className="mt-6 flex items-center justify-center gap-1">
              {[
                { src: "/ai/icons8-chatgpt.svg", alt: "ChatGPT" },
                { src: "/ai/icons8-google-48.svg", alt: "Google" },
                { src: "/ai/gemini.png", alt: "Gemini" },
                { src: "/ai/icons8-claude.svg", alt: "Claude" },
              ].map((icon) => (
                <span
                  key={icon.alt}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5E5] bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={icon.alt} className="h-4 w-4" src={icon.src} />
                </span>
              ))}
              <span className="ml-2 text-sm text-[#999]">& more</span>
            </div>

            {/* Search bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <DomainSearchBar />
            </div>

            {/* CTA buttons */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0A0A0A] px-6 text-sm font-medium text-white transition-colors hover:bg-[#1A1A1A]"
              >
                Start free trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-6 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F5F5F5]"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT SCREENSHOT */}
      <section className="px-6">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-2xl shadow-black/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-[#E5E5E5] bg-[#FAFAF8] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              <span className="ml-4 flex-1 rounded-md bg-white px-3 py-1.5 text-xs text-[#999]">
                app.vrtlscore.com
              </span>
            </div>
            {/* Dashboard mockup */}
            <div className="p-6 md:p-8">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Client card */}
                <div className="md:col-span-2">
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A0A0A] text-sm font-bold text-white">
                          A
                        </div>
                        <div>
                          <div className="font-semibold text-[#0A0A0A]">Acme Agency</div>
                          <div className="text-sm text-[#999]">Last snapshot: Today</div>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                        Active
                      </span>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-[#999]">VRTL Score</div>
                        <div className="mt-1 text-3xl font-semibold text-[#0A0A0A]">82</div>
                      </div>
                      <div>
                        <div className="text-sm text-[#999]">Mentions</div>
                        <div className="mt-1 text-3xl font-semibold text-[#0A0A0A]">7/10</div>
                      </div>
                      <div>
                        <div className="text-sm text-[#999]">vs Last</div>
                        <div className="mt-1 text-3xl font-semibold text-emerald-600">+12</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="text-[#666]">AI Visibility</span>
                        <span className="font-medium text-[#0A0A0A]">82%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#E5E5E5]">
                        <div className="h-full w-[82%] rounded-full bg-[#0A0A0A]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provider scores */}
                <div className="space-y-3">
                  {[
                    { name: "ChatGPT", score: 84 },
                    { name: "Claude", score: 83 },
                    { name: "Gemini", score: 79 },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-4"
                    >
                      <span className="text-sm font-medium text-[#666]">{p.name}</span>
                      <span className="text-lg font-semibold text-[#0A0A0A]">{p.score}</span>
                    </div>
                  ))}
                  <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A0A0A] py-3 text-sm font-medium text-white">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPS - Grow style */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                title: "Speed",
                description: "From client onboarding to branded PDF in under 5 minutes. No manual data collection or screenshot hunting.",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
                title: "Evidence",
                description: "Every score is backed by real AI responses. No black boxes. Audit-ready documentation your clients can trust.",
              },
              {
                icon: (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                ),
                title: "Progress",
                description: "Compare snapshots month over month. Show clients exactly how their AI visibility is improving.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A0A0A] text-white">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#0A0A0A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[#666] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              Everything you need to prove AI visibility
            </h2>
            <p className="mt-4 text-lg text-[#666]">
              One platform to measure, track, and report on how your clients appear in AI search.
            </p>
          </div>

          <div className="mt-16 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Snapshot Scoring",
                description: "Run standardized prompts across ChatGPT, Claude, and Gemini. Get a score you can track month over month.",
              },
              {
                title: "Competitive Analysis",
                description: "See how your clients stack up against competitors across all AI models. Real positioning data.",
              },
              {
                title: "Evidence Capture",
                description: "Every mention is captured with context. No screenshots needed. Audit-ready documentation.",
              },
              {
                title: "PDF Reports",
                description: "Generate polished reports with your branding. Scores, evidence, and recommendations in one doc.",
              },
              {
                title: "Multi-Provider",
                description: "Track visibility across ChatGPT, Claude, Gemini, and more. One dashboard for all AI search.",
              },
              {
                title: "Progress Tracking",
                description: "Compare snapshots over time to show clients their growth. Proof of improvement.",
              },
            ].map((feature) => (
              <div key={feature.title}>
                <h3 className="text-lg font-semibold text-[#0A0A0A]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[#666] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-[#666]">
              Your first report in under 5 minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add your client",
                description: "Enter their website and competitors. Takes 30 seconds.",
              },
              {
                step: "02",
                title: "Run the snapshot",
                description: "We query ChatGPT, Claude, and Gemini with industry-specific prompts.",
              },
              {
                step: "03",
                title: "Share the report",
                description: "Download a branded PDF with scores, evidence, and next steps.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#0A0A0A] text-lg font-semibold text-white">
                  {item.step}
                </div>
                {/* Connecting line */}
                {i < 2 && (
                  <div className="absolute left-[calc(50%+2rem)] top-7 hidden h-px w-[calc(100%-4rem)] bg-[#E5E5E5] md:block" />
                )}
                <h3 className="mt-4 text-xl font-semibold text-[#0A0A0A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[#666] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL - Lattice style */}
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <blockquote className="text-2xl font-medium leading-relaxed text-[#0A0A0A] md:text-3xl">
            &ldquo;VRTL Score finally gives us a way to prove our AI optimization work is paying off. The reports are client-ready and the data speaks for itself.&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A0A0A] text-sm font-bold text-white">
              JM
            </div>
            <div className="text-left">
              <div className="font-semibold text-[#0A0A0A]">Jordan Mitchell</div>
              <div className="text-sm text-[#666]">Director of SEO, Digital Agency</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON - Grow style */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              Before vs After VRTL Score
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Before */}
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
              <div className="mb-4 inline-flex rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
                Without VRTL Score
              </div>
              <ul className="space-y-3 text-[#666]">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  Manual ChatGPT searches for every client
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  Screenshots that look unprofessional
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  No way to track progress over time
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  Hours spent building reports
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
              <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                With VRTL Score
              </div>
              <ul className="space-y-3 text-[#666]">
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Automated queries across all AI models
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Branded PDFs ready for clients
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Month-over-month comparison built in
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  Reports generated in minutes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
            Ready to measure AI visibility?
          </h2>
          <p className="mt-4 text-lg text-[#666]">
            Start your 7-day free trial. No credit card required.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0A0A0A] px-8 text-base font-medium text-white transition-colors hover:bg-[#1A1A1A]"
            >
              Get started free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E5E5] bg-white px-8 text-base font-medium text-[#0A0A0A] transition-colors hover:bg-[#FAFAF8]"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
