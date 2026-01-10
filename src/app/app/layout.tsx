import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppAuthGate } from "@/components/AppAuthGate";
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
      <section className="p-6">
        <AppShell />
        {children}
      </section>
    </AppAuthGate>
  );
}


