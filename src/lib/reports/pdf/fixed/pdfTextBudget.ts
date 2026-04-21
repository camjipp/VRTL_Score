/** Word-safe truncation for fixed-layout PDF lines (avoid mid-word cuts). */
export function truncateAtWord(s: string, maxLen: number): string {
  const t = String(s).trim();
  if (t.length <= maxLen) return t;
  const slice = t.slice(0, maxLen);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLen * 0.55) return `${slice.slice(0, lastSpace)}…`;
  return `${slice.trimEnd()}…`;
}
