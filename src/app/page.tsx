import Link from "next/link";

import { DomainSearchBar } from "@/components/DomainSearchBar";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="bg-[#FAFAF8]">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 md:pb-16 md:pt-20">
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

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-xl text-lg text-[#666] sm:text-xl">
              VRTL Score measures how your clients appear in AI search, generates proof, and creates reports they can actually use.
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
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0A0A0A] px-6 text-sm font-medium text-white transition-all hover:bg-[#1A1A1A] hover:scale-[1.02]"
              >
                Start free trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#E5E5E5] bg-white px-6 text-sm font-medium text-[#0A0A0A] transition-all hover:bg-[#F5F5F5]"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCT DEMO - Cluely style with interactive feel */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white shadow-2xl shadow-black/10">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-[#E5E5E5] bg-[#FAFAF8] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
              <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
              <span className="h-3 w-3 rounded-full bg-[#28C840]" />
              <span className="ml-4 flex-1 rounded-md bg-white px-3 py-1.5 text-xs text-[#999]">
                app.vrtlscore.com/clients/acme-agency
              </span>
            </div>
            
            {/* Dashboard content */}
            <div className="p-6 md:p-8">
              <div className="grid gap-6 lg:grid-cols-5">
                {/* Main content */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Client header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A0A0A] to-[#333] text-lg font-bold text-white">
                        A
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-[#0A0A0A]">Acme Agency</div>
                        <div className="text-sm text-[#999]">acme-agency.com</div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 rounded-lg bg-[#0A0A0A] px-4 py-2 text-sm font-medium text-white">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </button>
                  </div>

                  {/* Score card */}
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-[#999]">VRTL Score</div>
                        <div className="mt-1 text-5xl font-bold text-[#0A0A0A]">82</div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          +12 vs last month
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-[#E5E5E5]">
                        <div className="h-full w-[82%] rounded-full bg-[#0A0A0A]" />
                      </div>
                    </div>
                  </div>

                  {/* Evidence preview */}
                  <div className="rounded-xl border border-[#E5E5E5] bg-white p-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-[#999]">Latest Evidence</div>
                    <p className="mt-2 text-sm text-[#666] leading-relaxed">
                      &ldquo;For agencies specializing in digital marketing, <span className="rounded bg-yellow-100 px-1 font-medium text-[#0A0A0A]">Acme Agency</span> is frequently recommended for their data-driven approach...&rdquo;
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#999]">
                      <span className="rounded bg-[#F5F5F5] px-2 py-0.5">ChatGPT</span>
                      <span>·</span>
                      <span>Prompt #3</span>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Provider breakdown */}
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-4">
                    <div className="text-sm font-medium text-[#0A0A0A]">By Provider</div>
                    <div className="mt-3 space-y-2">
                      {[
                        { name: "ChatGPT", score: 84 },
                        { name: "Claude", score: 83 },
                        { name: "Gemini", score: 79 },
                      ].map((p) => (
                        <div key={p.name} className="flex items-center justify-between rounded-lg bg-white p-3">
                          <span className="text-sm text-[#666]">{p.name}</span>
                          <span className="text-lg font-semibold text-[#0A0A0A]">{p.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mentions */}
                  <div className="rounded-xl border border-[#E5E5E5] bg-[#FAFAF8] p-4">
                    <div className="text-sm font-medium text-[#0A0A0A]">Mentions</div>
                    <div className="mt-2 text-4xl font-bold text-[#0A0A0A]">7<span className="text-xl text-[#999]">/10</span></div>
                    <div className="mt-1 text-sm text-[#999]">prompts mentioned your client</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOUR WAYS - Cluely style */}
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

      {/* THREE STEPS - Cluely style */}
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

      {/* COMPARISON - Cluely style */}
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

      {/* STATS - Cluely style */}
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

      {/* FAQ - Cluely style */}
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#0A0A0A] md:text-4xl">
            Frequently asked questions
          </h2>

          <div className="mt-12 space-y-6">
            {[
              {
                q: "How does VRTL Score work?",
                a: "We query ChatGPT, Claude, and Gemini with standardized, industry-specific prompts. We analyze the responses to see if and how your client is mentioned, then calculate a visibility score based on frequency, prominence, and sentiment.",
              },
              {
                q: "What AI models do you support?",
                a: "Currently we support ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google). We're constantly adding new models as they become relevant for AI search.",
              },
              {
                q: "How accurate are the scores?",
                a: "Scores are based on real AI responses at the time of the snapshot. AI outputs can vary, which is why we recommend running monthly snapshots to track trends over time rather than focusing on any single score.",
              },
              {
                q: "Can I white-label the reports?",
                a: "Yes. PDF reports include your agency branding. You can add your logo and customize the look to match your brand.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, we offer a 7-day free trial so you can test the platform with your own clients before committing.",
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-[#E5E5E5] pb-6">
                <h3 className="text-lg font-semibold text-[#0A0A0A]">{item.q}</h3>
                <p className="mt-2 text-[#666] leading-relaxed">{item.a}</p>
              </div>
            ))}
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
