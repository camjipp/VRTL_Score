import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableWrapper } from "@/components/ui/Table";

function Check() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 ring-1 ring-border">
      <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
        <path
          d="M20 6L9 17l-5-5"
          stroke="currentColor"
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
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border text-text-3">
      <svg aria-hidden="true" fill="none" height="12" viewBox="0 0 24 24" width="12">
        <path
          d="M6 6l12 12M18 6L6 18"
          stroke="currentColor"
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
    <main className="bg-bg">
      <section className="border-b border-border bg-bg">
        <div className="container-xl py-14">
          <Badge variant="neutral" className="w-fit">
            Plans & pricing
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text">Pricing built for agencies</h1>
          <p className="mt-3 max-w-2xl text-sm text-text-2">
            Billing is still v1/manual. When billing is enabled, non‑entitled agencies are redirected here.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-border bg-surface p-1 text-sm">
              <button className="rounded-full bg-surface-2 px-3 py-1 text-text" type="button">
                Monthly
              </button>
              <button className="rounded-full px-3 py-1 text-text-2 hover:text-text" type="button">
                Yearly <span className="ml-1 text-xs text-text-3">(save)</span>
              </button>
            </div>
            <span className="text-xs text-text-3">Checkout comes later.</span>
          </div>
        </div>
      </section>

      <section className="bg-bg">
        <div className="container-xl py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6 shadow-none">
              <div className="text-sm font-semibold text-text">Starter</div>
              <div className="mt-1 text-sm text-text-2">For small agencies getting started.</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-4xl font-semibold tracking-tight text-text">$—</div>
                <div className="pb-1 text-sm text-text-3">/mo</div>
              </div>
              <div className="mt-2 text-xs text-text-3">Request access (v1)</div>
              <Button className="mt-6 w-full" type="button" variant="secondary">
                Request access
              </Button>
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
            </Card>

            <Card className="relative p-6 shadow-none ring-1 ring-accent/25">
              <div className="absolute -top-3 left-6">
                <Badge variant="accent">Most popular</Badge>
              </div>
              <div className="text-sm font-semibold text-text">Pro</div>
              <div className="mt-1 text-sm text-text-2">For teams running weekly reporting.</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-4xl font-semibold tracking-tight text-text">$—</div>
                <div className="pb-1 text-sm text-text-3">/mo</div>
              </div>
              <div className="mt-2 text-xs text-text-3">Request access (v1)</div>
              <Button className="mt-6 w-full" type="button" variant="primary">
                Request access
              </Button>
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
            </Card>

            <Card className="p-6 shadow-none">
              <div className="text-sm font-semibold text-text">Enterprise</div>
              <div className="mt-1 text-sm text-text-2">Custom workflows + advanced controls.</div>
              <div className="mt-6 flex items-end gap-2">
                <div className="text-4xl font-semibold tracking-tight text-text">$—</div>
                <div className="pb-1 text-sm text-text-3">custom</div>
              </div>
              <div className="mt-2 text-xs text-text-3">Talk to us</div>
              <Button className="mt-6 w-full" type="button" variant="secondary">
                Contact sales
              </Button>
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
            </Card>
          </div>

          <Card className="mt-12 p-6 shadow-none">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-text">Compare plans</div>
              <ButtonLink href="/login" size="sm" variant="secondary">
                Request access
              </ButtonLink>
            </div>

            <div className="mt-4">
              <TableWrapper>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Starter</TableHead>
                      <TableHead>Pro</TableHead>
                      <TableHead>Enterprise</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-text-2">Snapshot scoring + evidence</TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-text-2">Branded PDF</TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-text-2">Agency logo + accent</TableCell>
                      <TableCell>
                        <XMark />
                      </TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-text-2">Custom prompt packs</TableCell>
                      <TableCell>
                        <XMark />
                      </TableCell>
                      <TableCell>
                        <XMark />
                      </TableCell>
                      <TableCell>
                        <Check />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableWrapper>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface-2 p-4 text-sm text-text-2">
              Access today is gated with <code className="text-text">BILLING_ENABLED</code> and{" "}
              <code className="text-text">agencies.is_active</code>. Stripe checkout is a later phase.
            </div>
          </Card>

          <div className="mt-12">
            <div className="text-sm font-semibold text-text">FAQ</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Card className="p-5 shadow-none">
                <div className="text-sm font-medium text-text">Can I run without competitors?</div>
                <div className="mt-2 text-sm text-text-2">
                  Yes. Competitors improve confidence and comparative context, but snapshots still run.
                </div>
              </Card>
              <Card className="p-5 shadow-none">
                <div className="text-sm font-medium text-text">Is Stripe required today?</div>
                <div className="mt-2 text-sm text-text-2">
                  No. v1 uses agency activation and a paywall destination; Stripe can be added later.
                </div>
              </Card>
              <Card className="p-5 shadow-none">
                <div className="text-sm font-medium text-text">What happens when billing is enabled?</div>
                <div className="mt-2 text-sm text-text-2">
                  Non‑entitled agencies are redirected to this page. Admin can activate agencies from{" "}
                  <code className="text-text">/app/admin</code>.
                </div>
              </Card>
              <Card className="p-5 shadow-none">
                <div className="text-sm font-medium text-text">Can we change plans later?</div>
                <div className="mt-2 text-sm text-text-2">
                  Absolutely. This UI is a design scaffold; pricing and entitlements will evolve.
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-12 text-sm">
            <Link className="text-text-2 hover:text-text" href="/">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}



