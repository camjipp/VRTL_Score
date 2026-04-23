import { PDF_PAGE_HEIGHT, PDF_PAGE_WIDTH } from "../theme";

/** US Letter — fixed canvas for locked report (same tuple as `PDF_PAGE_SIZE`). */
export const REPORT_PAGE_W = PDF_PAGE_WIDTH;
export const REPORT_PAGE_H = PDF_PAGE_HEIGHT;

/** Absolute frame insets (pt). Content must not draw outside these bounds. */
export const REPORT_FRAME = {
  inset: 40,
  headerTop: 40,
  headerHeight: 40,
  footerBottom: 30,
  contentTop: 100,
  contentBottom: 80,
} as const;

export const REPORT_CONTENT_HEIGHT = REPORT_PAGE_H - REPORT_FRAME.contentTop - REPORT_FRAME.contentBottom;

/** Vertical gutter (pt) between the two ~50% bands on Data Summary. */
export const REPORT_CONTENT_SPLIT_GUTTER = 4 as const;

/** Half content band height for split pages (two bands + gutter = `REPORT_CONTENT_HEIGHT`). */
export const REPORT_CONTENT_HALF_H = Math.floor((REPORT_CONTENT_HEIGHT - REPORT_CONTENT_SPLIT_GUTTER) / 2);

/** Locked physical page index → header title (must match TOC line). */
export const LOCKED_PAGE_HEADER: Record<number, string> = {
  2: "Table of Contents",
  3: "Performance Snapshot",
  4: "Competitive Landscape",
  5: "Model Breakdown",
  6: "AI Evidence",
  7: "Recommendations",
  8: "Data Summary",
  9: "Closing",
};

/**
 * TOC source of truth: `targetPage` is the physical page index in this locked document.
 * Replace with dynamic resolver later without changing row titles.
 */
export const LOCKED_TOC_ROWS: readonly { readonly targetPage: number; readonly title: string }[] = [
  { targetPage: 3, title: LOCKED_PAGE_HEADER[3]! },
  { targetPage: 4, title: LOCKED_PAGE_HEADER[4]! },
  { targetPage: 5, title: LOCKED_PAGE_HEADER[5]! },
  { targetPage: 6, title: LOCKED_PAGE_HEADER[6]! },
  { targetPage: 7, title: LOCKED_PAGE_HEADER[7]! },
  { targetPage: 8, title: LOCKED_PAGE_HEADER[8]! },
  { targetPage: 9, title: LOCKED_PAGE_HEADER[9]! },
] as const;

export const LOCKED_REPORT_PAGE_COUNT = 9 as const;
