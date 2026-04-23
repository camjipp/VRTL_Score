import type { CompetitorRow } from "../types";

export type ShareSlice = {
  row: CompetitorRow;
  /** Integer 0–100; all slices sum to 100 */
  pct: number;
};

const PIE_CLIENT = "#0D0D0D";
const PIE_TOP_OTHER = "#52525C";
const PIE_OTHER_GRAYS = ["#A1A1AA", "#C4C4C4", "#D4D4D8", "#E5E5E5"] as const;

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
  let sum = withFloor.reduce((s, x) => s + x.pct, 0);
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
 * Client = black (#0D0D0D); strongest competitor by mentions = dark gray;
 * remaining competitors = lighter grays (no chroma).
 */
export function fillForShareSlice(slice: ShareSlice, all: readonly ShareSlice[]): string {
  if (slice.row.isClient) return PIE_CLIENT;
  const others = all.filter((s) => !s.row.isClient);
  if (others.length === 0) return PIE_CLIENT;
  const sorted = others.slice().sort((a, b) => {
    if (b.row.mentions !== a.row.mentions) return b.row.mentions - a.row.mentions;
    return a.row.rank - b.row.rank;
  });
  const top = sorted[0]!;
  if (top.row.name === slice.row.name && top.row.rank === slice.row.rank) {
    return PIE_TOP_OTHER;
  }
  const pos = sorted.findIndex((s) => s.row.name === slice.row.name && s.row.rank === slice.row.rank);
  const grayIdx = Math.max(0, pos - 1);
  return PIE_OTHER_GRAYS[grayIdx % PIE_OTHER_GRAYS.length]!;
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
