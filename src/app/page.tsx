import Link from "next/link";

import { DomainSearchBar } from "@/components/DomainSearchBar";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF8]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-20">
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

            {/* Tagline */}
            <p className="mt-6 text-xl text-[#666] sm:text-2xl">
              AI visibility, measured.
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

            {/* Links */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <Link
                className="font-medium text-[#0A0A0A] underline decoration-[#0A0A0A]/20 underline-offset-4 hover:decoration-[#0A0A0A]"
                href="/onboarding"
              >
                Start free trial
              </Link>
              <Link
                className="text-[#666] hover:text-[#0A0A0A]"
                href="/pricing"
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

      {/* FEATURES */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              Everything you need to prove AI visibility
            </h2>
            <p className="mt-4 text-lg text-[#666]">
              From snapshot scoring to client-ready PDFs. One tool to measure and demonstrate progress.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
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
              <div key={feature.title} className="group">
                <h3 className="text-lg font-semibold text-[#0A0A0A] group-hover:underline">
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
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-[#666]">
              Your first report in under 5 minutes.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
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
              <div key={item.step} className="relative">
                {/* Connecting line */}
                {i < 2 && (
                  <div className="absolute left-[calc(100%+1rem)] top-5 hidden h-px w-[calc(100%-2rem)] bg-[#E5E5E5] md:block" />
                )}
                <div className="text-sm font-medium text-[#999]">{item.step}</div>
                <h3 className="mt-2 text-xl font-semibold text-[#0A0A0A]">
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

      {/* CTA */}
      <section className="px-6 py-24 md:py-32">
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
