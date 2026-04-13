"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useState, useEffect } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { BRAND_LOCKUP_INTRINSIC_SIZE, BRAND_LOCKUP_SRC } from "@/lib/brand/logo";
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

/** Primary nav: production-ready routes only */
const NAV_LINKS = [
  {
    href: "/app",
    label: "Dashboard",
    hint: "Portfolio triage: who needs attention",
    icon: "dashboard" as const,
  },
  {
    href: "/app#clients-overview",
    label: "Clients",
    hint: "Browse and manage all clients",
    icon: "clients" as const,
  },
  {
    href: "/app/settings",
    label: "Settings",
    hint: "Account and workspace settings",
    icon: "settings" as const,
  },
];

/** Shown separately as disabled — not linked (placeholders exist but are not product-ready) */
const COMING_SOON_LINKS = [
  { label: "Reports", icon: "reports" as const },
  { label: "Snapshots", icon: "snapshots" as const },
];

function NavGlyph({
  name,
  className,
}: {
  name: "dashboard" | "clients" | "reports" | "snapshots" | "settings" | "admin";
  className?: string;
}) {
  const c = cn("h-5 w-5 shrink-0 text-text-2", className);
  switch (name) {
    case "dashboard":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75 12 3l8.25 6.75V20.25a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1-.75-.75V9.75Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21V12h4.5v9" />
        </svg>
      );
    case "clients":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
      );
    case "reports":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-9l-2.25 2.25v12a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6" />
        </svg>
      );
    case "snapshots":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5" />
        </svg>
      );
    case "settings":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      );
    case "admin":
      return (
        <svg className={c} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
        </svg>
      );
    default:
      return <span className={c} />;
  }
}

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

  const primaryNavLinks = isSuperAdmin
    ? [
        ...NAV_LINKS,
        {
          href: "/app/admin",
          label: "Admin",
          hint: "Platform administration",
          icon: "admin" as const,
        },
      ]
    : NAV_LINKS;

  const isPaywall = pathname === "/app/plans";
  /** Deep-dive client detail: narrow icon rail so content feels more immersive */
  const isClientDetailFocus =
    /^\/app\/clients\/.+/.test(pathname) && pathname !== "/app/clients/new";
  const sidebarCollapsed = isClientDetailFocus;

  return (
    <AgencyContext.Provider value={{ agency, logout }}>
      <div
        className={cn("vrtl-app min-h-screen", isPaywall ? "bg-[#05070A]" : "bg-bg")}
        style={
          {
            ["--app-sidebar-width" as string]: sidebarCollapsed ? "68px" : "220px",
          } as React.CSSProperties
        }
      >
        {!isPaywall && (
          <aside
            className={cn(
              "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-white/[0.06] bg-bg transition-[width] duration-200 ease-out",
              sidebarCollapsed ? "w-[68px]" : "w-[220px]"
            )}
          >
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center border-b border-white/[0.05] py-2.5",
                  sidebarCollapsed ? "px-1.5" : "px-2.5"
                )}
              >
                <Link
                  href="/app"
                  title="VRTL Score"
                  className={cn(
                    "block max-w-full overflow-hidden opacity-90 transition-opacity hover:opacity-100",
                    !sidebarCollapsed && "w-full"
                  )}
                >
                  <img
                    src={BRAND_LOCKUP_SRC}
                    alt="VRTL Score"
                    className={cn(
                      "mx-auto block max-w-full object-center",
                      sidebarCollapsed
                        ? "h-auto max-h-[38px] w-full object-contain"
                        : "h-[59px] w-full object-cover"
                    )}
                    width={BRAND_LOCKUP_INTRINSIC_SIZE}
                    height={BRAND_LOCKUP_INTRINSIC_SIZE}
                    decoding="async"
                  />
                </Link>
              </div>

              <nav className="flex min-h-0 flex-1 flex-col px-2 py-2.5" aria-label="App">
                <div className="flex flex-1 flex-col gap-0.5">
                  {primaryNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      title={link.hint}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg text-[13px] font-medium tracking-tight transition-colors duration-150",
                        sidebarCollapsed ? "justify-center px-0 py-2" : "px-2.5 py-2",
                        isActive(link.href)
                          ? sidebarCollapsed
                            ? "bg-white/[0.07] text-text"
                            : "bg-white/[0.07] text-text"
                          : sidebarCollapsed
                            ? "text-text-3/65 hover:bg-white/[0.04] hover:text-text-2"
                            : "text-text-3/65 hover:bg-white/[0.04] hover:text-text-2"
                      )}
                    >
                      <NavGlyph
                        name={link.icon}
                        className={cn(
                          "h-[18px] w-[18px]",
                          isActive(link.href) ? "text-text" : "text-text-3/70"
                        )}
                      />
                      <span className={cn("truncate", sidebarCollapsed && "sr-only")}>{link.label}</span>
                    </Link>
                  ))}
                </div>

                {!sidebarCollapsed && (
                  <div className="mt-3 border-t border-white/[0.05] pt-3" role="group" aria-label="Coming soon">
                    <p className="px-2.5 pb-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-text-3/45">
                      Soon
                    </p>
                    <div className="space-y-0.5">
                      {COMING_SOON_LINKS.map((item) => (
                        <div
                          key={item.label}
                          className="flex cursor-not-allowed items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-text-3/40"
                          aria-disabled="true"
                          title={`${item.label}: coming soon`}
                        >
                          <NavGlyph name={item.icon} className="h-4 w-4 text-text-3/40" />
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </nav>
            </div>
          </aside>
        )}

        <main
          className={cn(
            "min-h-screen min-w-0 flex flex-col",
            !isPaywall && "pl-[var(--app-sidebar-width,220px)]"
          )}
        >
          {children}
        </main>
      </div>
    </AgencyContext.Provider>
  );
}