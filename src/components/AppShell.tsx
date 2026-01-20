"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";

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
    <header className="mb-6 rounded-2xl border border-border bg-surface shadow-lift">
      <div className="flex items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-3 text-sm">
          <Link className="flex items-center" href="/app">
            <span className="font-semibold tracking-tight text-text">
              VRTL <span className="text-text-2">Score</span>
            </span>
          </Link>
          <span className="text-text-3">/</span>
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
        <Button disabled={busy} onClick={logout} variant="secondary">
          {busy ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </header>
  );
}


