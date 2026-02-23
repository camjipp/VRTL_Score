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
  { href: "/app", label: "Dashboard" },
  { href: "/app#clients-overview", label: "Clients" },
  { href: "/app/reports", label: "Reports" },
  { href: "/app/snapshots", label: "Snapshots" },
  { href: "/app/settings", label: "Settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [hash, setHash] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHash(typeof window !== "undefined" ? window.location.hash : "");
  }, [pathname]);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      try {
        const res = await fetch("/api/admin/check", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsSuperAdmin(data.isAdmin);
        }
      } catch {
        // ignore
      }

      const { data: membership } = await supabase
        .from("agency_users")
        .select("agency_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!membership?.agency_id) return;

      const { data: fullData, error: fullErr } = await supabase
        .from("agencies")
        .select("id, name, brand_logo_url")
        .eq("id", membership.agency_id)
        .maybeSingle();

      if (!fullErr && fullData) {
        setAgency(fullData as Agency);
      } else {
        const { data: basicData } = await supabase
          .from("agencies")
          .select("id, name")
          .eq("id", membership.agency_id)
          .maybeSingle();
        if (basicData) setAgency({ id: basicData.id, name: basicData.name });
      }
    }
    loadData();
  }, [supabase]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function logout() {
    setBusy(true);
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.replace("/login");
  }

  function isActive(href: string) {
    const base = href.replace(/#.*/, "");
    const fragment = href.includes("#") ? href.slice(href.indexOf("#")) : "";
    if (pathname !== base) return false;
    if (fragment === "" && hash === "") return true;
    if (fragment && hash === fragment) return true;
    if (fragment === "" && hash !== "") return false;
    return false;
  }

  const allNavLinks = isSuperAdmin
    ? [...NAV_LINKS, { href: "/app/admin", label: "Admin" }]
    : NAV_LINKS;

  return (
    <div className="vrtl-app min-h-screen bg-bg">
      <aside
        className="fixed left-0 top-0 z-40 flex h-full w-[240px] flex-col border-r border-white/5 bg-bg-2"
        style={{ backgroundColor: "#0F1216" }}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center border-b border-white/5 px-4">
            <Link href="/app" className="flex items-center gap-2 transition-opacity hover:opacity-90">
              <Image
                src="/brand/VRTL_Solo.png"
                alt=""
                width={100}
                height={36}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {allNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-app border-l-2 py-2 px-3 text-sm font-medium transition-colors",
                  isActive(link.href)
                    ? "border-l-white/20 bg-white/5 text-text"
                    : "border-l-transparent text-text-2 hover:bg-surface/40 hover:text-text"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-white/5 p-3">
            <div className="mb-2 truncate px-2 text-xs font-medium text-text-2">
              {agency?.name ?? "Organization"}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-app border border-white/5 py-2 px-3 text-left text-sm text-text transition-colors",
                  menuOpen ? "bg-surface" : "hover:bg-surface/60"
                )}
              >
                {agency?.brand_logo_url ? (
                  <img
                    src={agency.brand_logo_url}
                    alt=""
                    className="h-6 w-6 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-surface-2 text-xs font-medium text-text-2">
                    {agency?.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="min-w-0 flex-1 truncate">Organization</span>
                <svg
                  className={cn("h-3.5 w-3.5 shrink-0 text-text-3", menuOpen && "rotate-180")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute bottom-full left-0 mb-1 w-full rounded-app border border-white/5 bg-surface py-1 shadow-lg">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-text-2 hover:bg-surface-2 hover:text-text"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                    Marketing site
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    disabled={busy}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-2 hover:bg-surface-2 hover:text-text"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    {busy ? "Signing out…" : "Sign out"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-screen pl-[240px]">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}