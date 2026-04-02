import { StyleSheet } from "@react-pdf/renderer";

/** US Letter — 612 × 792 pt; 36 pt margins on all sides */
export const PAGE = { width: 612, height: 792, margin: 36 } as const;
export const CONTENT_W = PAGE.width - PAGE.margin * 2;

export const colors = {
  bg: "#FFFFFF",
  surface: "#FAFAFA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  divider: "#F3F4F6",
  text: "#111827",
  body: "#374151",
  muted: "#9CA3AF",
  cyan: "#0EA5E9",
  green: "#10B981",
  orange: "#F59E0B",
  red: "#EF4444",
  violet: "#7C3AED",
  blueTint: "#EFF6FF",
  blueTintBorder: "#0EA5E9",
  calloutTint: "#F0F9FF",
  winBg: "#F0FDF4",
  riskBg: "#FFF7ED",
  priBg: "#FEF2F2",
  strategyTint: "#F5F3FF",
  barTrack: "#F3F4F6",
  shadow: "rgba(0,0,0,0.06)",
} as const;

export const space = {
  pagePad: PAGE.margin,
  section: 16,
  block: 10,
  cardPad: 14,
} as const;

/** Built-in PDF fonts — reliable on Vercel without remote TTF fetch */
export const fonts = {
  body: "Helvetica",
  display: "Helvetica-Bold",
} as const;

export const baseStyles = StyleSheet.create({
  page: {
    width: PAGE.width,
    height: PAGE.height,
    backgroundColor: colors.bg,
    padding: 0,
    fontFamily: fonts.body,
    color: colors.body,
  },
  pageBody: {
    paddingTop: PAGE.margin,
    paddingBottom: PAGE.margin,
    paddingHorizontal: PAGE.margin,
    flexGrow: 1,
  },
  stripeWrap: {
    width: PAGE.width,
    height: 4,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: space.section,
    paddingBottom: space.block,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brandKicker: {
    fontSize: 9,
    fontWeight: 800,
    color: colors.cyan,
    letterSpacing: 1,
  },
  reportTitleMain: {
    fontSize: 8,
    fontWeight: 600,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 3,
  },
  reportTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.text,
  },
  reportTitleCover: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.text,
  },
  headerMeta: {
    alignItems: "flex-end",
    maxWidth: 240,
  },
  clientName: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.text,
    textAlign: "right",
    fontFamily: fonts.display,
  },
  metaLine: {
    fontSize: 9,
    color: colors.muted,
    textAlign: "right",
    marginTop: 4,
    lineHeight: 1.4,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 0.65,
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: space.block,
  },
  sectionSlug: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.muted,
    marginTop: 4,
  },
  body: {
    fontSize: 9,
    lineHeight: 1.55,
    color: colors.body,
    fontWeight: 400,
  },
  bodyLarge: {
    fontSize: 9.5,
    lineHeight: 1.58,
    color: colors.body,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: PAGE.margin,
    right: PAGE.margin,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
