import type { CompetitorRow } from "../types";
import { LD } from "./lockedDesignTokens";

export type ShareSlice = {
  row: CompetitorRow;
  /** Integer 0–100; all slices sum to 100 */
  pct: number;
};

export const PIE_CLIENT_FILL = "#0D0D0D";
/** Top competitor by mentions — VRTL green (matches locked report signal token). */
export const PIE_TOP_COMPETITOR_FILL = LD.color.signalStrong;
const PIE_OTHER_GRAYS = ["#D4D4D8", "#E2E2E7", "#ECECEF", "#F0F0F3"] as const;

/** Normalize mention counts to integer percentages summing to 100. */
export function normalizeMentionShares(competitors: readonly CompetitorRow[]): ShareSlice[] {
  const valid = competitors.filter((c) => Number.isFinite(c.mentions) && c.mentions >= 0);
  if (valid.length === 0) return [];
  const total = valid.reduce((s, c) => s + c.mentions, 0);
  if (total <= 0) {
    const even = Math.floor(100 / valid.length);
    let rem = 100 - even * valid.length;
    return valid.map((row) => ({
      row,
      pct: even + (rem-- > 0 ? 1 : 0),
    }));
  }
  const raw = valid.map((row) => ({ row, exact: (100 * row.mentions) / total }));
  const withFloor = raw.map(({ row, exact }) => ({
    row,
    pct: Math.floor(exact + 1e-9),
    rem: exact - Math.floor(exact + 1e-9),
  }));
  const sum = withFloor.reduce((s, x) => s + x.pct, 0);
  const deficit = 100 - sum;
  const order = [...withFloor.keys()].sort((a, b) => withFloor[b]!.rem - withFloor[a]!.rem);
  const out = withFloor.map((x) => ({ row: x.row, pct: x.pct }));
  for (let k = 0; k < deficit && k < order.length; k++) {
    const i = order[k]!;
    out[i] = { row: out[i]!.row, pct: out[i]!.pct + 1 };
  }
  return out;
}

/**
 * Client = black; strongest competitor by mentions = VRTL green;
 * remaining competitors = light gray shades.
 */
export function fillForShareSlice(slice: ShareSlice, all: readonly ShareSlice[]): string {
  if (slice.row.isClient) return PIE_CLIENT_FILL;
  const others = all.filter((s) => !s.row.isClient);
  if (others.length === 0) return PIE_CLIENT_FILL;
  const sorted = others.slice().sort((a, b) => {
    if (b.row.mentions !== a.row.mentions) return b.row.mentions - a.row.mentions;
    return a.row.rank - b.row.rank;
  });
  const top = sorted[0]!;
  if (top.row.name === slice.row.name && top.row.rank === slice.row.rank) {
    return PIE_TOP_COMPETITOR_FILL;
  }
  const pos = sorted.findIndex((s) => s.row.name === slice.row.name && s.row.rank === slice.row.rank);
  const grayIdx = Math.max(0, pos - 1);
  return PIE_OTHER_GRAYS[grayIdx % PIE_OTHER_GRAYS.length]!;
}

/** Light-on-dark slices need white label text; gray slices use dark ink. */
export function sliceLabelTextColor(slice: ShareSlice, all: readonly ShareSlice[]): string {
  const fill = fillForShareSlice(slice, all);
  if (fill === PIE_CLIENT_FILL || fill === PIE_TOP_COMPETITOR_FILL) return "#FFFFFF";
  return "#111827";
}

/** Mid-slice point for inline labels (same angle convention as {@link pieSlicePath}). */
export function pieSliceLabelPosition(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  sweepDeg: number,
): { x: number; y: number } {
  const midDeg = startDeg + sweepDeg / 2;
  const rad = Math.PI / 180;
  const rr = r * 0.54;
  return {
    x: cx + rr * Math.cos(midDeg * rad),
    y: cy + rr * Math.sin(midDeg * rad),
  };
}

/** Degrees: 0° = 3 o'clock. Slices start at −90° (12 o'clock) and sweep clockwise. */
export function pieSlicePath(cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): string {
  if (sweepDeg <= 0) return "";
  const rad = Math.PI / 180;
  const endDeg = startDeg + sweepDeg;
  const x1 = cx + r * Math.cos(startDeg * rad);
  const y1 = cy + r * Math.sin(startDeg * rad);
  const x2 = cx + r * Math.cos(endDeg * rad);
  const y2 = cy + r * Math.sin(endDeg * rad);
  const largeArc = sweepDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
}
