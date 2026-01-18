function Check() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 ring-1 ring-accent/40">
      <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
        <path
          d="M20 6L9 17l-5-5"
          stroke="rgb(var(--text))"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      </svg>
    </span>
  );
}

function XMark() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface/40 ring-1 ring-border/60">
      <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="rgb(var(--muted))"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
      </svg>
    </span>
  );
}

export default function PricingPage() {
  return (
    <main className="bg-bg0">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          {/* Brand watermark */}
          <div className="absolute right-[-120px] top-[-120px] rotate-[-8deg]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" src="/brand/Logo_2.png" style={{ width: 760 }} />
          </div>
        </div>

        <div className="container-xl relative py-14">
          <div className="badge">Plans & pricing</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Pricing built for agencies</h1>
          <p className="mt-3 max-w-2xl text-sm text-text-2">
            Modeled after modern B2B pricing pages (e.g. Semrush) while billing is still v1/manual.
            When billing is enabled, non‑entitled agencies are redirected here.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border/60 bg-surface/30 p-1 text-sm">
              <button className="rounded-full bg-surface/70 px-3 py-1 text-text" type="button">
                Monthly
              </button>
              <button className="rounded-full px-3 py-1 text-text-2 hover:text-text" type="button">
                Yearly <span className="ml-1 text-xs text-muted">(save)</span>
              </button>
            </div>
            <span className="text-xs text-muted">
              Billing UI is present for design parity; checkout comes later.
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="container-xl py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-surface p-6">
              <div className="text-sm font-semibold">Starter</div>
              <div className="mt-1 text-sm text-text-2">For small agencies getting started.</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-4xl font-semibold tracking-tight">$—</div>
                <div className="pb-1 text-sm text-muted">/mo</div>
              </div>
              <div className="mt-2 text-xs text-muted">Request access (v1)</div>
              <button className="btn-secondary mt-6 w-full" type="button">
                Request access
              </button>
              <ul className="mt-6 space-y-3 text-sm text-text-2">
                <li className="flex items-center gap-2">
                  <Check /> Branded PDF exports
                </li>
                <li className="flex items-center gap-2">
                  <Check /> Snapshot history + detail
                </li>
                <li className="flex items-center gap-2">
                  <Check /> Competitor context (up to 8)
                </li>
              </ul>
            </div>

            <div className="card-surface relative p-6 ring-1 ring-accent/40">
              <div className="absolute -top-3 left-6">
                <span className="badge bg-accent/20 text-text">Most popular</span>
              </div>
              <div className="text-sm font-semibold">Pro</div>
              <div className="mt-1 text-sm text-text-2">For teams running weekly reporting.</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-4xl font-semibold tracking-tight">$—</div>
                <div className="pb-1 text-sm text-muted">/mo</div>
              </div>
              <div className="mt-2 text-xs text-muted">Request access (v1)</div>
              <button className="btn-primary mt-6 w-full" type="button">
                Request access
              </button>
              <ul className="mt-6 space-y-3 text-sm text-text-2">
                <li className="flex items-center gap-2">
                  <Check /> Higher daily snapshot limits
                </li>
                <li className="flex items-center gap-2">
                  <Check /> Faster turnaround (tuning)
                </li>
                <li className="flex items-center gap-2">
                  <Check /> Agency branding (logo + accent)
                </li>
              </ul>
            </div>

            <div className="card-surface p-6">
              <div className="text-sm font-semibold">Enterprise</div>
              <div className="mt-1 text-sm text-text-2">Custom workflows + advanced controls.</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-4xl font-semibold tracking-tight">$—</div>
                <div className="pb-1 text-sm text-muted">custom</div>
              </div>
              <div className="mt-2 text-xs text-muted">Talk to us</div>
              <button className="btn-secondary mt-6 w-full" type="button">
                Contact sales
              </button>
              <ul className="mt-6 space-y-3 text-sm text-text-2">
                <li className="flex items-center gap-2">
                  <Check /> Custom prompt packs
                </li>
                <li className="flex items-center gap-2">
                  <Check /> SSO / advanced permissions (later)
                </li>
                <li className="flex items-center gap-2">
                  <Check /> Dedicated support
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 card-surface p-6">
            <div className="text-sm font-semibold">Compare plans</div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-text-2">
                    <th className="border-b border-border/60 pb-3 pr-4">Feature</th>
                    <th className="border-b border-border/60 pb-3 pr-4">Starter</th>
                    <th className="border-b border-border/60 pb-3 pr-4">Pro</th>
                    <th className="border-b border-border/60 pb-3 pr-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="text-text">
                  <tr>
                    <td className="border-b border-border/30 py-3 pr-4 text-text-2">
                      Snapshot scoring + evidence
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border/30 py-3 pr-4 text-text-2">Branded PDF</td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border/30 py-3 pr-4 text-text-2">
                      Agency logo + accent
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <XMark />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                  </tr>
                  <tr>
                    <td className="border-b border-border/30 py-3 pr-4 text-text-2">
                      Custom prompt packs
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <XMark />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <XMark />
                    </td>
                    <td className="border-b border-border/30 py-3 pr-4">
                      <Check />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-lg border border-border/60 bg-surface/30 p-4 text-sm text-text-2">
              Access today: gated with <code className="text-text">BILLING_ENABLED</code> and{" "}
              <code className="text-text">agencies.is_active</code>. Stripe checkout is a later phase.
            </div>
          </div>

          <div className="mt-12">
            <div className="text-sm font-semibold">FAQ</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="card-surface p-5">
                <div className="text-sm font-medium">Can I run without competitors?</div>
                <div className="mt-2 text-sm text-text-2">
                  Yes. Competitors improve confidence and comparative context, but snapshots still run.
                </div>
              </div>
              <div className="card-surface p-5">
                <div className="text-sm font-medium">Is Stripe required today?</div>
                <div className="mt-2 text-sm text-text-2">
                  No. v1 uses agency activation and a paywall destination; Stripe can be added later.
                </div>
              </div>
              <div className="card-surface p-5">
                <div className="text-sm font-medium">What happens when billing is enabled?</div>
                <div className="mt-2 text-sm text-text-2">
                  Non‑entitled agencies are redirected to this page. Admin can activate agencies from{" "}
                  <code className="text-text">/app/admin</code>.
                </div>
              </div>
              <div className="card-surface p-5">
                <div className="text-sm font-medium">Can we change plans later?</div>
                <div className="mt-2 text-sm text-text-2">
                  Absolutely. This UI is a design scaffold; pricing and entitlements will evolve.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



