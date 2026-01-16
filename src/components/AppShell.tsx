"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AppShell() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="mb-6 rounded-xl border border-border/60 bg-bg1/40 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-3 text-sm">
          <Link className="flex items-center" href="/app">
            <Image alt="VRTL Score" height={22} src="/brand/vrtl-score-wordmark.svg" width={130} />
          </Link>
          <span className="text-muted">/</span>
          <Link className="text-text-2 hover:text-text" href="/app">
            Clients
          </Link>
          <Link className="text-text-2 hover:text-text" href="/app/settings">
            Settings
          </Link>
          <Link className="text-text-2 hover:text-text" href="/app/admin">
            Admin
          </Link>
        </nav>
        <button className="btn-secondary" disabled={busy} onClick={logout}>
          {busy ? "Logging out..." : "Log out"}
        </button>
      </div>
    </header>
  );
}


