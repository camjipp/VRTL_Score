"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useState, useEffect } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

type Agency = {
  id: string;
  name: string;
  brand_logo_url?: string | null;
};

export const AgencyContext = createContext<{ agency: Agency | null; logout: () => Promise<void> }>({
  agency: null,
  logout: async () => {},
});

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
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [hash, setHash] = useState("");

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

  async function logout() {
    setBusy(true);
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
    <AgencyContext.Provider value={{ agency, logout }}>
      <div className="vrtl-app min-h-screen bg-bg">
        <aside
          className="fixed left-0 top-0 z-40 flex h-full w-[240px] flex-col border-r border-white/5 bg-bg-2"
          style={{ backgroundColor: "#0F1216" }}
        >
          <div className="flex flex-1 flex-col">
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-white/5 px-4">
              <Link href="/app" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                <img
                  src="/brand/ChatGPT%20Image%20Jan%2020,%202026,%2001_19_44%20PM.png"
                  alt=""
                  className="h-8 w-auto shrink-0 brightness-0 invert"
                />
                <span className="whitespace-nowrap font-semibold text-white/90 tracking-tight">Score</span>
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
          </div>
        </aside>

        <main className="min-h-screen pl-[240px]">
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </AgencyContext.Provider>
  );
}