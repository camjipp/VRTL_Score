import { Suspense } from "react";

import { OnboardingForm } from "@/components/OnboardingForm";

function OnboardingLoading() {
  return (
    <main className="page-marketing flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/[0.08] border-t-[var(--accent-marketing)]" />
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingLoading />}>
      <OnboardingForm />
    </Suspense>
  );
}
