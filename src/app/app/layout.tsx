import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { Suspense } from "react";

import { BRAND_LOCKUP_SRC } from "@/lib/brand/logo";
import { AppAuthGate } from "@/components/AppAuthGate";
import { AppEntitlementGate } from "@/components/AppEntitlementGate";
import { AppShell } from "@/components/AppShell";
import { ToastContextProvider } from "@/contexts/ToastContext";

export const metadata: Metadata = {
  title: "VRTL Score: App"
};

function LoadingScreen() {
  return (
    <div className="vrtl-app flex min-h-screen flex-col items-center justify-center bg-bg">
      <Image
        src={BRAND_LOCKUP_SRC}
        alt=""
        width={280}
        height={72}
        className="mb-6 h-12 w-auto max-w-[min(280px,85vw)] animate-pulse object-contain object-center opacity-90"
        priority
      />
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-text-2" />
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
          <ToastContextProvider>
            <AppShell>{children}</AppShell>
          </ToastContextProvider>
        </AppEntitlementGate>
      </Suspense>
    </AppAuthGate>
  );
}
