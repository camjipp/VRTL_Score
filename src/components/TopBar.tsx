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
        "relative z-[100] w-full max-w-full min-w-0 border-b border-white/[0.05] bg-bg/90 px-5 py-2.5 backdrop-blur-md sm:px-6 sm:py-3",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.07] before:to-transparent",
        className
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
      <div className="flex min-w-0 shrink-0 items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 items-center gap-2.5 rounded-lg border border-white/[0.06] bg-black/20 py-0 pl-1.5 pr-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors hover:border-white/[0.09] hover:bg-black/30"
          >
            {agency?.brand_logo_url ? (
              <img
                src={agency.brand_logo_url}
                alt=""
                className="h-7 w-7 shrink-0 rounded-md border border-white/[0.06] object-cover"
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.04] text-[12px] font-semibold text-white/80">
                {agency?.name?.charAt(0) ?? "A"}
              </div>
            )}
            <span className="max-w-[160px] truncate text-[13px] font-semibold tracking-tight text-text">
              {agency?.name ?? "Agency"}
            </span>
            <svg
              className={cn("h-3 w-3 shrink-0 text-text-3 transition-transform", menuOpen && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full z-[100] mt-2 min-w-[188px] rounded-lg border border-white/[0.08] bg-[#111111] py-1 shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
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
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2.5">
        {filters ? (
          <div className="min-w-0 flex-1 sm:max-w-md sm:flex-initial lg:max-w-sm">{filters}</div>
        ) : null}
        {primaryAction ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:items-stretch">{primaryAction}</div>
        ) : null}
      </div>
      </div>
    </div>
  );
}
