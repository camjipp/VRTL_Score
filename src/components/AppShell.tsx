"use client";

import Link from "next/link";
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
    <header className="mb-6 flex items-center justify-between border-b pb-3">
      <nav className="flex gap-4 text-sm">
        <Link className="underline" href="/app">
          App
        </Link>
        <Link className="underline" href="/app/settings">
          Settings
        </Link>
      </nav>
      <button className="rounded border px-3 py-1 text-sm" disabled={busy} onClick={logout}>
        {busy ? "Logging out..." : "Log out"}
      </button>
    </header>
  );
}


