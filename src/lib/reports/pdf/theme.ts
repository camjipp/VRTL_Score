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
  cyan: "#0EA5E9",
  cyanLight: "#E0F2FE",
  green: "#10B981",
  greenLight: "#DCFCE7",
  orange: "#F59E0B",
  orangeLight: "#FEF3C7",
  red: "#EF4444",
  redLight: "#FEE2E2",
  violet: "#7C3AED",
  violetLight: "#EDE9FE",
  /** Page / card fill */
  paper: "#FFFFFF",
} as const;

export const space = {
  pagePad: PAGE.margin,
  section: 16,
  block: 10,
  cardPad: 14,
} as const;

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
    color: colors.ink2,
  },
  pageBody: {
    paddingTop: PAGE.margin,
    paddingBottom: PAGE.margin,
    paddingHorizontal: PAGE.margin,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: space.section,
    paddingBottom: space.block,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
  },
  brandKicker: {
    fontSize: 9,
    fontWeight: 400,
    color: colors.cyan,
    letterSpacing: 1,
    fontFamily: fonts.sansBold,
  },
  reportTitleMain: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink4,
    letterSpacing: 2,
    marginTop: 3,
    fontFamily: fonts.sansBold,
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
    fontSize: 20,
    fontWeight: 400,
    color: colors.ink,
    textAlign: "right",
    fontFamily: fonts.sansBold,
  },
  metaLine: {
    fontSize: 9,
    color: colors.ink4,
    textAlign: "right",
    marginTop: 4,
    lineHeight: 1.4,
    fontFamily: fonts.sans,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 400,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    color: colors.ink4,
    marginBottom: space.block,
    fontFamily: fonts.sansBold,
  },
  sectionSlug: {
    fontSize: 10,
    fontWeight: 400,
    color: colors.ink4,
    marginTop: 4,
    fontFamily: fonts.sansBold,
  },
  body: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.ink2,
    fontWeight: 400,
    fontFamily: fonts.sans,
  },
  bodyLarge: {
    fontSize: 9.5,
    lineHeight: 1.58,
    color: colors.ink2,
    fontFamily: fonts.sans,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: PAGE.margin,
    right: PAGE.margin,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.rule,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.ink4,
    fontFamily: fonts.sans,
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
