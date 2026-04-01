import { StyleSheet } from "@react-pdf/renderer";

/** Print-aware dark palette — 90% neutral, color = signal only */
export const colors = {
  page: "#0F1117",
  card: "#161823",
  border: "#23263A",
  text: "#F3F4F6",
  textSecondary: "#9CA3AF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  accent: "#60A5FA",
  barTrack: "rgba(255,255,255,0.12)",
  barFill: "rgba(255,255,255,0.35)",
} as const;

export const space = {
  pagePad: 40,
  section: 18,
  block: 12,
  cardPad: 16,
} as const;

/** PDFKit built-ins only — avoids network font fetch (unpkg) failing on Linux/server and breaking layout. */
export const fonts = {
  body: "Helvetica",
  display: "Helvetica",
} as const;

/** Base styles reused across pages */
export const baseStyles = StyleSheet.create({
  page: {
    backgroundColor: colors.page,
    paddingTop: space.pagePad,
    paddingBottom: space.pagePad,
    paddingHorizontal: space.pagePad,
    fontFamily: fonts.body,
    color: colors.text,
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
  reportTitle: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: colors.text,
    maxWidth: 320,
  },
  reportTitleCover: {
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: colors.text,
  },
  headerMeta: {
    alignItems: "flex-end",
    maxWidth: 220,
  },
  clientName: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.text,
    textAlign: "right",
  },
  metaLine: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: "right",
    marginTop: 3,
    lineHeight: 1.4,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.textSecondary,
    marginBottom: space.block,
  },
  sectionSlug: {
    fontSize: 10,
    fontWeight: 500,
    color: colors.textSecondary,
    marginTop: 4,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.55,
    color: colors.textSecondary,
  },
  bodyLarge: {
    fontSize: 11,
    lineHeight: 1.58,
    color: colors.textSecondary,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: space.pagePad,
    right: space.pagePad,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    padding: space.cardPad,
  },
});
