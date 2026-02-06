import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { Suspense } from "react";

import { AppAuthGate } from "@/components/AppAuthGate";
import { AppEntitlementGate } from "@/components/AppEntitlementGate";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "VRTL Score — App"
};

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg">
      <Image
        src="/brand/VRTL_Solo.png"
        alt="VRTL Score"
        width={160}
        height={56}
        className="mb-6 h-12 w-auto animate-pulse"
        priority
      />
      <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-text/20 border-t-text" />
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
