"use client";

import Link from "next/link";
import { useRef, useState, useEffect, useContext, type ReactNode } from "react";

import { AgencyContext } from "@/components/AppShell";
import { cn } from "@/lib/cn";

type TopBarProps = {
  primaryAction?: ReactNode;
  filters?: ReactNode;
  className?: string;
};

export function TopBar({ primaryAction, filters, className }: TopBarProps) {
  const { agency, logout } = useContext(AgencyContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-white/5 bg-bg px-6 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            {agency?.brand_logo_url ? (
              <img
                src={agency.brand_logo_url}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full border border-white/10 object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface-2 text-sm font-medium text-white/80">
                {agency?.name?.charAt(0) ?? "A"}
              </div>
            )}
            <span className="font-medium text-white/85 tracking-tight">
              {agency?.name ?? "Agency"}
            </span>
            <svg
              className={cn("h-3.5 w-3.5 shrink-0 text-white/40 transition-transform", menuOpen && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-app border border-white/5 bg-surface py-1 shadow-lg">
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
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-2 hover:bg-surface-2 hover:text-text"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {filters}
        {primaryAction}
      </div>
    </div>
  );
}
