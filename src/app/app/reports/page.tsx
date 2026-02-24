"use client";

import { BackLink } from "@/components/BackLink";
import { TopBar } from "@/components/TopBar";

export default function ReportsPage() {
  return (
    <>
      <TopBar />
      <div className="p-6">
        <BackLink href="/app" label="Back to Dashboard" />
        <p className="mt-4 text-sm text-text-2">Reports section. Coming soon.</p>
      </div>
    </>
  );
}
