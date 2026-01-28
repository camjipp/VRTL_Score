"use client";

import Link from "next/link";
import { useState } from "react";

import { DomainSearchBar } from "@/components/DomainSearchBar";
import { Footer } from "@/components/Footer";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[#E5E5E5]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-lg font-semibold text-[#0A0A0A]">{question}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-[#999] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-[#666] leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF8]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-bg">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-text/5 blur-3xl" />
          <div className="absolute bottom-[-240px] right-[-140px] h-[520px] w-[520px] rounded-full bg-text/3 blur-3xl" />
        </div>

        <div className="container-xl relative py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="flex items-end justify-center gap-0">
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

            <div className="mx-auto mt-6 max-w-3xl">
              <DomainSearchBar />
            </div>

            <p className="mt-8 text-sm text-text-2">
              Built for agencies who want to lead in AI search.
            </p>

            <div className="mt-5 flex items-center justify-center gap-3 text-sm">
              <Link className="text-text-2 hover:text-text" href="/pricing">
                See plans & pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR WAYS - Right after hero */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
            Four ways we prove AI visibility
          </h2>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Automated scoring",
                description: "Run standardized prompts across ChatGPT, Claude, and Gemini. Get a score you can track and defend.",
                visual: (
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-[#0A0A0A]">82</div>
                    <div className="h-8 w-24 overflow-hidden rounded-full bg-[#E5E5E5]">
                      <div className="h-full w-[82%] rounded-full bg-[#0A0A0A]" />
                    </div>
                  </div>
                ),
              },
              {
                title: "Evidence capture",
                description: "Every mention is recorded with context. No screenshots needed. Real proof your clients can trust.",
                visual: (
                  <div className="rounded-lg bg-white p-3 text-sm">
                    <span className="rounded bg-yellow-100 px-1">&ldquo;Acme Agency&rdquo;</span>
                    <span className="text-[#666]"> is recommended...</span>
                  </div>
                ),
              },
              {
                title: "Competitive ranking",
                description: "See exactly where your client stands against competitors across all AI models.",
                visual: (
                  <div className="space-y-1.5">
                    {["Your client", "Competitor A", "Competitor B"].map((name, i) => (
                      <div key={name} className="flex items-center gap-2 text-sm">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0A0A0A] text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        <span className={i === 0 ? "font-medium text-[#0A0A0A]" : "text-[#999]"}>{name}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                title: "PDF reports",
                description: "Generate polished, branded reports in seconds. Send to clients immediately after the call.",
                visual: (
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zm3 0a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5z" />
                    </svg>
                    <span className="text-sm font-medium text-[#0A0A0A]">report.pdf</span>
                  </div>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl border border-[#E5E5E5] bg-white p-6 transition-all hover:border-[#0A0A0A]/20 hover:shadow-lg"
              >
                <div className="mb-4 rounded-xl bg-[#FAFAF8] p-4">
                  {item.visual}
                </div>
                <h3 className="text-lg font-semibold text-[#0A0A0A]">{item.title}</h3>
                <p className="mt-2 text-[#666] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THREE STEPS */}
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
            Reports in 3 steps
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-[#666]">
            The fastest way to prove AI visibility to your clients.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Add client",
                description: "Enter their website and competitors. Takes 30 seconds.",
              },
              {
                step: "2",
                title: "Run snapshot",
                description: "We query all AI models with industry-specific prompts.",
              },
              {
                step: "3",
                title: "Get report",
                description: "Download a branded PDF with scores and evidence.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A] text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-[#0A0A0A]">{item.title}</h3>
                <p className="mt-2 text-[#666]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
            No more manual searches.<br />Real, defensible data.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Without */}
            <div className="rounded-2xl border border-[#E5E5E5] bg-white p-6">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#999]">
                Manual AI checks
              </div>
              <ul className="space-y-3 text-[#666]">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Copy-paste queries into each AI
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Screenshots that look unprofessional
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  No way to track changes over time
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hours building reports manually
                </li>
              </ul>
            </div>

            {/* With */}
            <div className="rounded-2xl border border-[#0A0A0A] bg-[#0A0A0A] p-6 text-white">
              <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-white/60">
                VRTL Score
              </div>
              <ul className="space-y-3 text-white/80">
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Automated queries across all models
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Branded PDFs ready for clients
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Month-over-month tracking built in
                </li>
                <li className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Reports generated in minutes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { value: "3+", label: "AI Models", sublabel: "ChatGPT, Claude, Gemini, and more" },
              { value: "10", label: "Prompts", sublabel: "Industry-specific queries per snapshot" },
              { value: "<5min", label: "To Report", sublabel: "From client onboarding to PDF" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-5xl font-bold text-[#0A0A0A]">{stat.value}</div>
                <div className="mt-2 text-lg font-medium text-[#0A0A0A]">{stat.label}</div>
                <div className="mt-1 text-sm text-[#999]">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Accordion style */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
            Frequently asked questions
          </h2>

          <div className="mt-12">
            <FAQItem
              question="How does VRTL Score work?"
              answer="We query ChatGPT, Claude, and Gemini with standardized, industry-specific prompts. We analyze the responses to see if and how your client is mentioned, then calculate a visibility score based on frequency, prominence, and sentiment."
            />
            <FAQItem
              question="What AI models do you support?"
              answer="Currently we support ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google). We're constantly adding new models as they become relevant for AI search."
            />
            <FAQItem
              question="How accurate are the scores?"
              answer="Scores are based on real AI responses at the time of the snapshot. AI outputs can vary, which is why we recommend running monthly snapshots to track trends over time rather than focusing on any single score."
            />
            <FAQItem
              question="Can I white-label the reports?"
              answer="Yes. PDF reports include your agency branding. You can add your logo and customize the look to match your brand."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes, we offer a 7-day free trial so you can test the platform with your own clients before committing."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[#E5E5E5] bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
            AI visibility that helps now, not later.
          </h2>
          <p className="mt-4 text-lg text-[#666]">
            Try VRTL Score on your next client today.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/onboarding"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0A0A0A] px-8 text-base font-medium text-white transition-all hover:bg-[#1A1A1A] hover:scale-[1.02]"
            >
              Start free trial
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E5E5E5] bg-white px-8 text-base font-medium text-[#0A0A0A] transition-all hover:bg-[#FAFAF8]"
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
