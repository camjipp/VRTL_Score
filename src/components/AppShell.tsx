"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

type Agency = {
  id: string;
  name: string;
  brand_logo_url?: string | null;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      // Check if super admin
      try {
        const res = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data.isAdmin);
        }
      } catch {
        // Ignore errors
      }
      
      // Load agency
      const { data: membership } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (!membership?.agency_id) return;
      
      let agencyData: Agency | null = null;
      const { data: fullData, error: fullErr } = await supabase
        .from("agencies")
        .select("id, name, brand_logo_url")
        .eq("id", membership.agency_id)
        .maybeSingle();
      
      if (fullErr) {
        const { data: basicData } = await supabase
          .from("agencies")
          .select("id, name")
          .eq("id", membership.agency_id)
          .maybeSingle();
        if (basicData) {
          agencyData = { id: basicData.id, name: basicData.name };
        }
      } else if (fullData) {
        agencyData = fullData as Agency;
      }
      
      if (agencyData) {
        setAgency(agencyData);
      }
    }
    loadData();
  }, [supabase]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function logout() {
    setBusy(true);
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function isActive(href: string) {
    if (href === "/app") {
      return pathname === "/app" || pathname?.startsWith("/app/clients");
    }
    return pathname === href || pathname?.startsWith(href + "/");
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Left: Logo */}
          <Link href="/app" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-text">
              <span className="text-sm font-bold text-white">V</span>
            </div>
            <span className="text-sm font-semibold text-text">VRTL Score</span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Settings link - desktop */}
            <Link
              href="/app/settings"
              className={cn(
                "hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:block",
                isActive("/app/settings")
                  ? "bg-surface-2 text-text"
                  : "text-text-2 hover:bg-surface-2 hover:text-text"
              )}
            >
              Settings
            </Link>

            {/* Admin link - desktop */}
            {isSuperAdmin && (
              <Link
                href="/app/admin"
                className={cn(
                  "hidden rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:block",
                  isActive("/app/admin")
                    ? "bg-surface-2 text-text"
                    : "text-text-2 hover:bg-surface-2 hover:text-text"
                )}
              >
                Admin
              </Link>
            )}

            {/* Account dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-surface-2"
              >
                {agency?.brand_logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={agency.brand_logo_url} alt="" className="h-6 w-6 rounded object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-text text-xs font-bold text-white">
                    {agency?.name?.charAt(0) || "?"}
                  </div>
                )}
                <span className="hidden max-w-[120px] truncate sm:block">
                  {agency?.name || "Account"}
                </span>
                <svg
                  className={cn("h-4 w-4 text-text-3 transition-transform", menuOpen && "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white py-2 shadow-lg">
                  {/* Agency info */}
                  {agency && (
                    <div className="border-b border-border px-4 pb-3 pt-1">
                      <div className="text-sm font-medium text-text">{agency.name}</div>
                      <div className="text-xs text-text-3">Agency</div>
                    </div>
                  )}

                  {/* Mobile-only links */}
                  <div className="border-b border-border py-1 sm:hidden">
                    <Link
                      href="/app/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </Link>
                    {isSuperAdmin && (
                      <Link
                        href="/app/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                        Admin
                      </Link>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                      Back to home
                    </Link>
                    <button
                      onClick={logout}
                      disabled={busy}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-text-2 hover:bg-surface-2 hover:text-text"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      {busy ? "Signing out..." : "Sign out"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
