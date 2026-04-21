import type { RecommendationCard } from "../types";

/** Explicit grouping: page 5 = first two cards; each following page = up to two more. */
export function sliceRecommendationsForFixedTemplates(recs: readonly RecommendationCard[]): {
  page5Pair: RecommendationCard[];
  continuationPairs: RecommendationCard[][];
} {
  const page5Pair = recs.slice(0, 2);
  const tail = recs.slice(2);
  const continuationPairs: RecommendationCard[][] = [];
  for (let i = 0; i < tail.length; i += 2) {
    continuationPairs.push(tail.slice(i, i + 2));
  }
  return { page5Pair, continuationPairs };
}
