import { colors, fonts } from "../theme";

/**
 * Design tokens for the locked 9-page report only.
 * Editorial / premium memo bias: sharp corners, rules over boxes, strong type steps.
 */
export const LD = {
  font: fonts,

  color: {
    ink: colors.ink,
    ink2: colors.ink2,
    ink3: colors.ink3,
    ink4: colors.ink4,
    rule: colors.rule,
    surface: colors.surface,
    surface2: colors.surface2,
    paper: colors.paper,
    accent: colors.cyan,
    accentMuted: colors.cyanLight,
    risk: colors.red,
    riskMuted: colors.redLight,
  },

  /** Typography scale (pt). */
  size: {
    /** Cover poster title — near full-line presence. */
    coverPoster: 58,
    /** Cover client name (below title). */
    coverClient: 17,
    /** Cover date line. */
    coverDate: 10,
    /** Cover main title — commanding, not dashboard-sized. */
    coverDisplay: 27,
    display2: 22,
    display1: 40,
    title: 12,
    titleSm: 10,
    lead: 10,
    body: 8.5,
    bodySm: 8,
    label: 7,
    caption: 6.5,
    micro: 6,
    tocTitle: 11,
    tocPage: 9,
    metricValue: 12,
    metricHero: 40,
    commandScore: 56,
    metricSecondary: 10,
  },

  lineHeight: {
    none: 1,
    tight: 1.12,
    snug: 1.28,
    normal: 1.45,
    relaxed: 1.55,
    editorial: 1.68,
  },

  space: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 28,
  },

  /** Sharp report geometry — avoid soft SaaS rounding. */
  radius: {
    xs: 0,
    sm: 0,
    md: 0,
  },

  border: {
    hairline: 1,
    rule: colors.rule,
    strong: colors.ink4,
    /** Table / section emphasis */
    accentRule: 2,
  },

  cardPad: {
    sm: 8,
    md: 10,
    lg: 12,
  },

  row: {
    competitor: 22,
    modelGrid: 44,
    signal: 20,
    evidenceLog: 16,
  },

  trackEyebrow: 0.5,
} as const;
