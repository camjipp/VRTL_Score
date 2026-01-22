"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

type Agency = {
  id: string;
  name: string;
  logo_url: string | null;
};

const mainNavItems = [
  {
    href: "/app",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    href: "/app/clients",
    label: "Clients",
    matchPaths: ["/app/clients", "/app"],
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
];

const bottomNavItems = [
  {
    href: "/app/settings",
    label: "Settings",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/app/admin",
    label: "Admin",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);

  useEffect(() => {
    async function loadAgency() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: membership } = await supabase
        .from("agency_members")
        .select("agency_id")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (!membership?.agency_id) return;
      
      const { data: agencyData } = await supabase
        .from("agencies")
        .select("id, name, logo_url")
        .eq("id", membership.agency_id)
        .maybeSingle();
      
      if (agencyData) {
        setAgency(agencyData as Agency);
      }
    }
    loadAgency();
  }, [supabase]);

  async function logout() {
    setBusy(true);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function isActive(href: string, matchPaths?: string[]) {
    if (href === "/app") {
      return pathname === "/app";
    }
    if (matchPaths) {
      return matchPaths.some(p => pathname === p || pathname?.startsWith(p + "/"));
    }
    return pathname === href || pathname?.startsWith(href + "/");
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-border bg-surface transition-transform duration-300 ease-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + Agency */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <Link href="/app" className="flex items-center gap-3">
            {agency?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={agency.logo_url}
                alt={agency.name}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="VRTL"
                  className="h-5 w-5"
                  src="/brand/VRTL_Solo.png"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-text">
                {agency?.name || "VRTL Score"}
              </div>
              <div className="text-xs text-text-3">Workspace</div>
            </div>
          </Link>
        </div>

        {/* Main nav */}
        <nav className="flex-1 space-y-1 p-3">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-3">
            Main
          </div>
          {mainNavItems.map((item) => {
            const active = item.href === "/app" 
              ? pathname === "/app" || pathname?.startsWith("/app/clients")
              : isActive(item.href, item.matchPaths);
            return (
              <Link
                key={item.href}
                href={item.href === "/app/clients" ? "/app" : item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-2 hover:bg-surface-2 hover:text-text"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  active ? "text-accent" : "text-text-3 group-hover:text-text-2"
                )}>
                  {item.icon}
                </span>
                {item.label}
                {active && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}

          <div className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-wider text-text-3">
            Account
          </div>
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-text-2 hover:bg-surface-2 hover:text-text"
                )}
              >
                <span className={cn(
                  "transition-colors",
                  active ? "text-accent" : "text-text-3 group-hover:text-text-2"
                )}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border p-3">
          <button
            onClick={logout}
            disabled={busy}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
          >
            <svg className="h-5 w-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {busy ? "Signing out..." : "Sign out"}
          </button>

          <Link
            href="/"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-text-2 transition-all hover:bg-surface-2 hover:text-text"
          >
            <svg className="h-5 w-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Back to home
          </Link>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content wrapper */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur-md lg:px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-2 hover:bg-surface-2 hover:text-text lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search clients, reports..."
                className="h-9 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-4 text-sm text-text placeholder:text-text-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20"
              />
              <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-3 sm:block">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Help */}
            <button className="flex h-9 w-9 items-center justify-center rounded-lg text-text-2 hover:bg-surface-2 hover:text-text">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </button>

            {/* Notifications */}
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-2 hover:bg-surface-2 hover:text-text">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
            </button>

            {/* Divider */}
            <div className="mx-1 h-6 w-px bg-border" />

            {/* User menu */}
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                {agency?.name?.charAt(0) || "V"}
              </div>
              <svg className="h-4 w-4 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-bg">
          <div className="mx-auto max-w-7xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
