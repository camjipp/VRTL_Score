import { Suspense } from "react";

import { OnboardingForm } from "@/components/OnboardingForm";

function OnboardingLoading() {
  return (
    <main className="min-h-screen bg-bg">
      <div className="container-xl flex min-h-screen items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-text/20 border-t-text" />
      </div>
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
