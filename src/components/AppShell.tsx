"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";

export function AppShell() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function navLinkClass(href: string) {
    const active = pathname === href || (href === "/app" && pathname?.startsWith("/app/clients"));
    return active ? "text-white" : "text-white/70 hover:text-white";
  }

  return (
    <header className="mb-6 overflow-hidden rounded-2xl border border-black/10 bg-[#080808] text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-5 text-sm">
          <Link className="flex items-center gap-3" href="/app">
            <span className="font-semibold tracking-tight text-white">VRTL Score</span>
          </Link>
          <Link className={navLinkClass("/app")} href="/app">
            Clients
          </Link>
          <Link className={navLinkClass("/app/settings")} href="/app/settings">
            Settings
          </Link>
          <Link className={navLinkClass("/app/admin")} href="/app/admin">
            Admin
          </Link>
        </nav>
        <Button
          className="border border-white/15 bg-white/10 text-white hover:bg-white/15"
          disabled={busy}
          onClick={logout}
          variant="secondary"
        >
          {busy ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </header>
  );
}


