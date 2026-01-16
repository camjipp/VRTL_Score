export default function PricingPage() {
  return (
    <main className="bg-bg0">
      <section className="border-b border-border/60">
        <div className="container-xl py-14">
          <div className="badge">Plans</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Pricing</h1>
          <p className="mt-3 max-w-2xl text-sm text-text-2">
            VRTL Score is currently available by agency activation. Stripe checkout can come later —
            this page is the paywall destination when billing is enabled.
          </p>
        </div>
      </section>

      <section>
        <div className="container-xl py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card-surface p-6">
              <div className="text-sm font-semibold">Starter</div>
              <div className="mt-1 text-sm text-text-2">For small agencies getting started.</div>
              <div className="mt-6 text-3xl font-semibold">$—</div>
              <div className="mt-2 text-xs text-muted">Talk to us (v1)</div>
              <ul className="mt-6 space-y-2 text-sm text-text-2">
                <li>- 10 snapshots / day</li>
                <li>- Branded PDF exports</li>
                <li>- Basic competitor context</li>
              </ul>
              <button className="btn-primary mt-6 w-full" type="button">
                Request access
              </button>
            </div>

            <div className="card-surface p-6 ring-1 ring-accent/40">
              <div className="badge">Recommended</div>
              <div className="mt-2 text-sm font-semibold">Pro</div>
              <div className="mt-1 text-sm text-text-2">For agency teams running weekly reports.</div>
              <div className="mt-6 text-3xl font-semibold">$—</div>
              <div className="mt-2 text-xs text-muted">Talk to us (v1)</div>
              <ul className="mt-6 space-y-2 text-sm text-text-2">
                <li>- Higher daily limits</li>
                <li>- Priority snapshot queue (later)</li>
                <li>- Better competitive confidence</li>
              </ul>
              <button className="btn-primary mt-6 w-full" type="button">
                Request access
              </button>
            </div>

            <div className="card-surface p-6">
              <div className="text-sm font-semibold">Enterprise</div>
              <div className="mt-1 text-sm text-text-2">Custom workflows + reporting.</div>
              <div className="mt-6 text-3xl font-semibold">$—</div>
              <div className="mt-2 text-xs text-muted">Talk to us</div>
              <ul className="mt-6 space-y-2 text-sm text-text-2">
                <li>- Custom prompt packs</li>
                <li>- SSO / advanced controls (later)</li>
                <li>- Dedicated support</li>
              </ul>
              <button className="btn-secondary mt-6 w-full" type="button">
                Contact sales
              </button>
            </div>
          </div>

          <div className="mt-10 card-surface p-6">
            <div className="text-sm font-semibold">How access works today</div>
            <p className="mt-2 text-sm text-text-2">
              Billing is gateable with <code className="text-text">BILLING_ENABLED</code>. When
              enabled, agencies must be marked <code className="text-text">is_active=true</code>{" "}
              to access the app. This will later be driven by Stripe.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}



