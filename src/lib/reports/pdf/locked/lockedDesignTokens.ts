import { colors, fonts } from "../theme";

/**
 * Design tokens for the locked 9-page report only.
 * Layout geometry lives in `layoutConstants` / per-page constants — not here.
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
    display2: 22,
    display1: 40,
    title: 11,
    titleSm: 10,
    lead: 10,
    body: 8.5,
    bodySm: 8,
    label: 7,
    caption: 6.5,
    micro: 6,
    tocTitle: 10,
    tocPage: 9,
    metricValue: 12,
    metricHero: 40,
    /** Performance snapshot command score (dominant focal). */
    commandScore: 56,
    /** Secondary metric numerals (below hero). */
    metricSecondary: 10,
  },

  lineHeight: {
    none: 1,
    tight: 1.15,
    snug: 1.28,
    normal: 1.45,
    relaxed: 1.55,
    /** Editorial supporting copy. */
    editorial: 1.68,
  },

  /** Spacing rhythm (pt). */
  space: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    xxl: 20,
  },

  radius: {
    xs: 3,
    sm: 5,
    md: 6,
  },

  /** Hairline / divider */
  border: {
    hairline: 1,
    rule: colors.rule,
    strong: colors.ink4,
  },

  /** Card interior padding (pt). */
  cardPad: {
    sm: 10,
    md: 12,
    lg: 14,
  },

  /** Fixed table row heights (pt) — must match page implementations. */
  row: {
    competitor: 22,
    modelGrid: 44,
    signal: 20,
    evidenceLog: 16,
  },

  /** Letter-spacing for uppercase labels */
  trackEyebrow: 0.45,
} as const;
