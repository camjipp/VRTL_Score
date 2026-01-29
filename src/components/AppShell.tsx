"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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
      
      // Try with brand_logo_url first, fall back to just id,name if column doesn't exist
      let agencyData: Agency | null = null;
      const { data: fullData, error: fullErr } = await supabase
        .from("agencies")
        .select("id, name, brand_logo_url")
        .eq("id", membership.agency_id)
        .maybeSingle();
      
      if (fullErr) {
        // Column might not exist, try without it
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

  async function logout() {
    setBusy(true);
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
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Sidebar - Dark theme */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[228px] flex-col bg-[#262626] transition-transform duration-200 lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-[60px] items-center gap-3 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-sm font-semibold text-white">VRTL Score</span>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-[#262626]" />

        {/* Main nav */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link
            href="/app"
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              isActive("/app")
                ? "bg-[#445495] text-white"
                : "text-[#b2b2b2] hover:bg-[#333] hover:text-white"
            )}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Dashboard
          </Link>

          <div className="pt-4">
            <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-[#666]">
              Content
            </div>
            <Link
              href="/app"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#b2b2b2] hover:bg-[#333] hover:text-white transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              All Clients
            </Link>
          </div>

          <div className="pt-4">
            <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-[#666]">
              AI Visibility
            </div>
            <Link
              href="/app"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#b2b2b2] hover:bg-[#333] hover:text-white transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Overview
            </Link>
            <Link
              href="/app"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#b2b2b2] hover:bg-[#333] hover:text-white transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Performance
            </Link>
            <Link
              href="/app"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#b2b2b2] hover:bg-[#333] hover:text-white transition-all"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
              Sentiment
            </Link>
          </div>

          <div className="pt-4">
            <div className="px-3 pb-2 text-[10px] font-medium uppercase tracking-wider text-[#666]">
              Account
            </div>
            <Link
              href="/app/settings"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive("/app/settings")
                  ? "bg-[#445495] text-white"
                  : "text-[#b2b2b2] hover:bg-[#333] hover:text-white"
              )}
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
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive("/app/admin")
                    ? "bg-[#445495] text-white"
                    : "text-[#b2b2b2] hover:bg-[#333] hover:text-white"
                )}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Admin
              </Link>
            )}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[#333] p-4 space-y-1">
          {agency && (
            <div className="flex items-center gap-3 rounded-lg bg-[#333] px-3 py-2.5 mb-2">
              {agency.brand_logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agency.brand_logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 text-sm font-bold text-white">
                  {agency.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">{agency.name}</div>
                <div className="text-[11px] text-[#888]">Agency</div>
              </div>
            </div>
          )}
          
          <button
            onClick={logout}
            disabled={busy}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#b2b2b2] hover:bg-[#333] hover:text-white transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {busy ? "Signing out..." : "Sign out"}
          </button>

          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#b2b2b2] hover:bg-[#333] hover:text-white transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to home
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-4 border-b border-[#333] bg-[#1a1a1a] px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#b2b2b2] hover:bg-[#333] hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500">
            <span className="text-sm font-bold text-white">V</span>
          </div>
          <span className="text-sm font-semibold text-white">VRTL Score</span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-[#0f0f0f]">
          <div className="mx-auto max-w-6xl p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
