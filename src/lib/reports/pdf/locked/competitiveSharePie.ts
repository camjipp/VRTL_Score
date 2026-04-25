import type { CompetitorRow } from "../types";

export type ShareSlice = {
  row: CompetitorRow;
  /** Integer 0–100; all slices sum to 100 */
  pct: number;
};

/** Client (Stanley) — VRTL green */
export const PIE_CLIENT_FILL = "#22C55E";
/** Top competitor by mentions — charcoal */
export const PIE_TOP_COMPETITOR_FILL = "#1F2937";
const PIE_OTHER_GRAYS = ["#9CA3AF", "#D1D5DB"] as const;

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
 * Client = VRTL green; strongest competitor by mentions = black;
 * remaining competitors = #D1D5DB / #E5E7EB.
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

/** Legend: client first, then others by share (desc). */
export function legendSlicesOrdered(slices: readonly ShareSlice[]): ShareSlice[] {
  const client = slices.find((s) => s.row.isClient);
  const others = slices
    .filter((s) => !s.row.isClient)
    .slice()
    .sort((a, b) => b.pct - a.pct || a.row.rank - b.row.rank);
  return client ? [client, ...others] : others;
}

/** Small delta line when client is within ±3 points of the top share. */
export function shareDeltaCallout(slices: readonly ShareSlice[]): string | null {
  const client = slices.find((s) => s.row.isClient);
  if (!client) return null;
  const others = slices.filter((s) => !s.row.isClient);
  if (others.length === 0) return null;
  const maxOther = Math.max(...others.map((s) => s.pct));
  const d = client.pct - maxOther;
  if (d === 0) return "You match the leader — effectively tied";
  if (d > 0 && d <= 3) return `You lead by +${d}% — effectively tied`;
  if (d < 0 && d >= -3) return `You trail by ${Math.abs(d)}% — effectively tied`;
  return null;
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
