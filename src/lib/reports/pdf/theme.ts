import { StyleSheet } from "@react-pdf/renderer";

/** US Letter — 612 × 792 pt; 36 pt margins on all sides */
export const PAGE = { width: 612, height: 792, margin: 36 } as const;
export const CONTENT_W = PAGE.width - PAGE.margin * 2;

/** PDF-safe palette (plain hex — no CSS variables in @react-pdf) */
export const colors = {
  ink: "#0F1117",
  ink2: "#374151",
  ink3: "#6B7280",
  ink4: "#9CA3AF",
  rule: "#E5E7EB",
  surface: "#F9FAFB",
  surface2: "#F3F4F6",
  /** Chart / score ring / bar fills — brand green (legacy token name `cyan` kept for existing call sites) */
  cyan: "#00e87a",
  cyanLight: "#E8FAF0",
  green: "#00e87a",
  greenLight: "#E8FAF0",
  orange: "#F59E0B",
  orangeLight: "#FEF3C7",
  red: "#EF4444",
  redLight: "#FEE2E2",
  violet: "#7C3AED",
  violetLight: "#EDE9FE",
  /** Page / card fill */
  paper: "#FFFFFF",
} as const;

/** Vertical / horizontal rhythm (pt) — use across pages for consistent cadence */
export const rhythm = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

/**
 * Layout system (pt): section = major gaps after titles; block = between components;
 * cardPad = internal card padding (~20–24px at 72dpi ≈ 20–24pt).
 */
export const space = {
  pagePad: PAGE.margin,
  /** Chapter gaps — kept moderate to avoid orphan whitespace before page breaks */
  section: 32,
  block: 24,
  cardPad: 22,
} as const;

/** Narrow measure for long prose (~660px web ≈ 495pt; use 480 for margin safety) */
export const BODY_MAX_W = 480;

/** Built-in PDF fonts only — no registration, works in serverless (e.g. /var/task). */
export const fonts = {
  sans: "Helvetica",
  sansBold: "Helvetica-Bold",
  mono: "Courier",
} as const;

export const baseStyles = StyleSheet.create({
  page: {
    width: PAGE.width,
    height: PAGE.height,
    backgroundColor: colors.paper,
    padding: 0,
    fontFamily: fonts.sans,
    fontWeight: 400,
    color: colors.ink,
  },
  pageBody: {
    paddingTop: PAGE.margin,
    paddingBottom: 52,
    paddingHorizontal: PAGE.margin,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: space.block,
    paddingBottom: rhythm.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  /** Primary report label — left rail of every page */
  reportTitleMain: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink3,
    letterSpacing: 0.08,
    textTransform: "uppercase",
    fontFamily: fonts.sansBold,
  },
  headerAgency: {
    fontSize: 7.5,
    fontWeight: 400,
    color: colors.ink2,
    marginTop: 3,
    fontFamily: fonts.sans,
  },
  /** First heading in page body (chapter); not duplicated in header */
  chapterTitle: {
    fontSize: 15,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
    marginBottom: rhythm.xs,
    letterSpacing: -0.02,
  },
  chapterSubtitle: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.ink2,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
    marginBottom: 0,
  },
  reportTitle: {
    fontSize: 11,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
  },
  reportTitleCover: {
    fontSize: 12,
    fontWeight: 400,
    color: colors.ink,
    fontFamily: fonts.sansBold,
  },
  headerMeta: {
    alignItems: "flex-end",
    maxWidth: 240,
  },
  clientName: {
    fontSize: 17,
    fontWeight: 400,
    color: colors.ink,
    textAlign: "right",
    fontFamily: fonts.sansBold,
  },
  metaLine: {
    fontSize: 8.5,
    color: colors.ink3,
    textAlign: "right",
    marginTop: 3,
    lineHeight: 1.45,
    fontFamily: fonts.sans,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: space.block,
    fontFamily: fonts.sansBold,
  },
  sectionSlug: {
    fontSize: 8.5,
    fontWeight: 400,
    color: colors.ink3,
    marginTop: 5,
    letterSpacing: 0,
    fontFamily: fonts.sans,
  },
  body: {
    fontSize: 9,
    lineHeight: 1.72,
    color: colors.ink,
    fontWeight: 400,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  bodyLarge: {
    fontSize: 10,
    lineHeight: 1.68,
    color: colors.ink,
    fontFamily: fonts.sans,
    maxWidth: BODY_MAX_W,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: PAGE.margin,
    right: PAGE.margin,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7.5,
    color: colors.ink3,
    fontFamily: fonts.sans,
  },
  footerPageNum: {
    fontSize: 7.5,
    color: colors.ink2,
    fontFamily: fonts.sansBold,
  },
  card: {
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 6,
    padding: space.cardPad,
    overflow: "hidden",
  },
});
