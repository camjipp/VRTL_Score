import { AppAuthGate } from "@/components/AppAuthGate";
import { OnboardingForm } from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <AppAuthGate>
      <OnboardingForm />
    </AppAuthGate>
  );
}


