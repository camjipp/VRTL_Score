import type { ModelScoreRow } from "../types";

/**
 * Drops the same first-line insight shown in the hero strongest/weakest tiles so
 * model cards do not repeat the identical “pattern to copy…” language.
 */
export function insightsForModelCard(
  model: ModelScoreRow,
  heroBest: ModelScoreRow,
  heroWorst: ModelScoreRow,
): readonly string[] {
  const b0 = heroBest.insights[0] != null ? String(heroBest.insights[0]).trim() : "";
  const w0 = heroWorst.insights[0] != null ? String(heroWorst.insights[0]).trim() : "";
  const raw = model.insights.map((s) => String(s).trim()).filter(Boolean);
  const filtered = raw.filter((line) => {
    if (model.name === heroBest.name && b0.length > 0 && line === b0) return false;
    if (model.name === heroWorst.name && w0.length > 0 && line === w0) return false;
    return true;
  });
  const use = filtered.length > 0 ? filtered : raw;
  return use.slice(0, 1);
}
