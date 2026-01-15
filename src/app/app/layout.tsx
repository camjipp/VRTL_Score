import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppAuthGate } from "@/components/AppAuthGate";
import { AppEntitlementGate } from "@/components/AppEntitlementGate";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "VRTLScore — App"
};

export default function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppAuthGate>
      <AppEntitlementGate>
        <section className="p-6">
          <AppShell />
          {children}
        </section>
      </AppEntitlementGate>
    </AppAuthGate>
  );
}


