import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionLabelProps = {
  children: ReactNode;
  className?: string;
  /** Omit default bottom margin (use when spacing comes from className). */
  noMargin?: boolean;
};

export function SectionLabel({ children, className, noMargin }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "font-marketing-mono text-[11px] uppercase tracking-[0.12em]",
        !noMargin && "mb-4",
        className
      )}
      style={{ color: "var(--accent-marketing)" }}
    >
      {children}
    </p>
  );
}
