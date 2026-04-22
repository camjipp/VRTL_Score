import { Page } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";
import { PDF_PAGE_SIZE, baseStyles } from "../theme";

type Props = {
  children: ReactNode;
  wrap?: boolean;
  /** Merged after `pdfSlidePage` (e.g. `{ paddingTop: 100 }`). Omit for the default shell. */
  pageStyleOverlay?: Record<string, string | number>;
};

/**
 * Single physical page shell: canonical `size`, `pdfSlidePage` padding, paper background.
 * All report `<Page>` instances should render through this (or `FixedInnerPage`, which uses it).
 */
export function ReportPage({ children, wrap = false, pageStyleOverlay }: Props): ReactElement {
  const pageStyle =
    pageStyleOverlay != null ? [baseStyles.pdfSlidePage, pageStyleOverlay] : baseStyles.pdfSlidePage;
  return (
    <Page size={PDF_PAGE_SIZE} style={pageStyle} wrap={wrap}>
      {children}
    </Page>
  );
}
