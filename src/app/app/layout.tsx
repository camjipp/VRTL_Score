import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { Suspense } from "react";

import { BRAND_LOCKUP_INTRINSIC_SIZE, BRAND_LOCKUP_SRC } from "@/lib/brand/logo";
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
        width={BRAND_LOCKUP_INTRINSIC_SIZE}
        height={BRAND_LOCKUP_INTRINSIC_SIZE}
        className="mb-6 h-24 w-[min(400px,88vw)] animate-pulse object-cover object-[50%_45%] opacity-90"
        priority
        sizes="(max-width: 768px) 88vw, 400px"
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
