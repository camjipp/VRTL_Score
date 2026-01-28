import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { AppAuthGate } from "@/components/AppAuthGate";
import { AppEntitlementGate } from "@/components/AppEntitlementGate";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "VRTL Score — App"
};

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-text/20 border-t-text" />
        <p className="text-sm text-text-2">Loading...</p>
      </div>
    </div>
  );
}

export default function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppAuthGate>
      <Suspense fallback={<LoadingScreen />}>
        <AppEntitlementGate>
          <AppShell>{children}</AppShell>
        </AppEntitlementGate>
      </Suspense>
    </AppAuthGate>
  );
}
