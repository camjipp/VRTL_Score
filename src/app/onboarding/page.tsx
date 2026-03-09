import { Suspense } from "react";

import { OnboardingForm } from "@/components/OnboardingForm";

function OnboardingLoading() {
  return (
    <main className="min-h-screen bg-[#05070A]">
      <div className="flex min-h-screen items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1A212B] border-t-[#10A37F]" />
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
