import Link from "next/link";

import { DomainSearchBar } from "@/components/DomainSearchBar";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/15 bg-bg0">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute bottom-[-240px] right-[-140px] h-[520px] w-[520px] rounded-full bg-black/5 blur-3xl" />
        </div>

        <div className="container-xl relative py-16">
          <div className="badge">Built for agencies</div>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Measure and improve your clients’ AI visibility.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-text-2">
            VRTL Score runs a standardized prompt pack, extracts structured evidence, and produces a
            branded report you can share with clients.
          </p>

          <DomainSearchBar />

          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/app">
              Open the app
            </Link>
            <Link className="btn-secondary" href="/pricing">
              View pricing
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="card-surface p-5">
              <div className="text-sm font-medium">Standardized scoring</div>
              <div className="mt-2 text-sm text-text-2">
                Same prompts. Same schema. Comparable results across clients and time.
              </div>
            </div>
            <div className="card-surface p-5">
              <div className="text-sm font-medium">Competitive context</div>
              <div className="mt-2 text-sm text-text-2">
                Add competitors and see mention frequency and positioning signals.
              </div>
            </div>
            <div className="card-surface p-5">
              <div className="text-sm font-medium">Client-ready PDFs</div>
              <div className="mt-2 text-sm text-text-2">
                Branded cover, score dashboard, and evidence by prompt.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg0">
        <div className="container-xl py-14">
          <h2 className="text-lg font-semibold">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="card-surface p-5">
              <div className="badge">Step 1</div>
              <div className="mt-2 text-sm font-medium">Add a client</div>
              <div className="mt-2 text-sm text-text-2">
                Create a client profile and keep their details in one place.
              </div>
            </div>
            <div className="card-surface p-5">
              <div className="badge">Step 2</div>
              <div className="mt-2 text-sm font-medium">Add competitors</div>
              <div className="mt-2 text-sm text-text-2">
                Add up to 8 competitors to strengthen comparative signals.
              </div>
            </div>
            <div className="card-surface p-5">
              <div className="badge">Step 3</div>
              <div className="mt-2 text-sm font-medium">Run a snapshot</div>
              <div className="mt-2 text-sm text-text-2">
                Generate a score, review evidence, and download a branded PDF.
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <Link className="btn-primary" href="/login">
              Create an account
            </Link>
            <Link className="text-sm text-text-2 hover:text-text" href="/pricing">
              See plans →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}



