"use client";

import Image from "next/image";
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

const NAV_LINKS = [
  { href: "/app", label: "Clients" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      try {
        const res = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data.isAdmin);
        }
      } catch {
        // Ignore
      }
      
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
      
      if (agencyData) setAgency(agencyData);
    }
    loadData();
  }, [supabase]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
    setMenuOpen(false);
  }, [pathname]);

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

  const allNavLinks = isSuperAdmin
    ? [...NAV_LINKS, { href: "/app/admin", label: "Admin" }]
    : NAV_LINKS;

  return (
    <div className="min-h-screen bg-[#f2f3f5]">
      {/* ── Top navigation bar ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">

          {/* Left: Logo + Nav links */}
          <div className="flex items-center gap-6">
            {/* Logo — always links to dashboard */}
            <Link href="/app" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
              <Image
                src="/brand/VRTL_Solo.png"
                alt="VRTL Score"
                width={120}
                height={40}
                className="h-9 w-auto"
                priority
              />
            </Link>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-border sm:block" />

            {/* Desktop nav links */}
            <nav className="hidden items-center gap-1 sm:flex">
              {allNavLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-surface-2 text-text"
                      : "text-text-2 hover:bg-surface hover:text-text"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Account + Mobile hamburger */}
          <div className="flex items-center gap-2">
            {/* Account dropdown (desktop & mobile) */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                  menuOpen
                    ? "border-border bg-surface-2 text-text"
                    : "border-border bg-white text-text hover:bg-surface"
                )}
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
                  className={cn("h-3.5 w-3.5 text-text-3 transition-transform", menuOpen && "rotate-180")}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-white py-1 shadow-lg">
                  {agency && (
                    <div className="border-b border-border px-4 pb-3 pt-2">
                      <div className="text-sm font-medium text-text">{agency.name}</div>
                      <div className="text-xs text-text-3">Agency</div>
                    </div>
                  )}

                  <div className="py-1">
                    <Link
                      href="/"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-text-2 hover:bg-surface hover:text-text"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                      Marketing site
                    </Link>
                    <button
                      onClick={logout}
                      disabled={busy}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-text-2 hover:bg-surface hover:text-text"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      {busy ? "Signing out…" : "Sign out"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-text-2 hover:bg-surface sm:hidden"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav panel */}
        {mobileNavOpen && (
          <div className="border-t border-border bg-white px-4 py-3 sm:hidden">
            <nav className="flex flex-col gap-1">
              {allNavLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-surface-2 text-text"
                      : "text-text-2 hover:bg-surface hover:text-text"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
