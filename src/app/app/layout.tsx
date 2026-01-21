import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppAuthGate } from "@/components/AppAuthGate";
import { AppEntitlementGate } from "@/components/AppEntitlementGate";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "VRTL Score — App"
};

export default function AppLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppAuthGate>
      <AppEntitlementGate>
        <AppShell>{children}</AppShell>
      </AppEntitlementGate>
    </AppAuthGate>
  );
}
