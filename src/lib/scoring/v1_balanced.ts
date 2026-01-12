import type { Extraction } from "@/lib/extraction/schema";
import type { Provider } from "@/lib/llm/providers";

type ProviderScores = Record<Provider, number>;

export type ScoreResult = {
  overallScore: number;
  byProvider: ProviderScores;
  breakdown: Record<string, number>;
};

const PRESENCE_WEIGHT = 40;
const POSITION_WEIGHT = 30;
const STRENGTH_WEIGHT = 20;
const AUTHORITY_WEIGHT = 10;

const POSITION_POINTS: Record<Extraction["client_position"], number> = {
  top: 30,
  middle: 18,
  bottom: 9,
  not_mentioned: 0
};

const STRENGTH_POINTS: Record<Extraction["recommendation_strength"], number> = {
  strong: 20,
  medium: 12,
  weak: 6,
  none: 0
};

function clamp100(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function scoreOne(extractions: Extraction[]): ScoreResult {
  const total = extractions.length || 1;
  const presenceCount = extractions.filter((e) => e.client_mentioned).length;
  const topCount = extractions.filter((e) => e.client_position === "top").length;
  const authorityCount = extractions.filter((e) => e.has_sources_or_citations).length;
  const featuresCount = extractions.filter((e) => e.has_specific_features).length;

  const avgPositionPoints =
    extractions.reduce((sum, e) => sum + POSITION_POINTS[e.client_position], 0) / total;
  const avgStrengthPoints =
    extractions.reduce((sum, e) => sum + STRENGTH_POINTS[e.recommendation_strength], 0) / total;

  const presenceScore = (presenceCount / total) * PRESENCE_WEIGHT;
  const positionScore = (avgPositionPoints / 30) * POSITION_WEIGHT;
  const strengthScore = (avgStrengthPoints / 20) * STRENGTH_WEIGHT;
  const authorityScore =
    ((authorityCount / total) * 5 + (featuresCount / total) * 5) / 10 * AUTHORITY_WEIGHT;

  const overall =
    presenceScore + positionScore + strengthScore + authorityScore;

  return {
    overallScore: clamp100(overall),
    byProvider: {} as ProviderScores,
    breakdown: {
      presence_rate: presenceCount / total,
      top_rate: topCount / total,
      authority_rate: authorityCount / total,
      features_rate: featuresCount / total,
      presence_score: presenceScore,
      position_score: positionScore,
      strength_score: strengthScore,
      authority_score: authorityScore
    }
  };
}

export function scoreBalanced(
  byProviderExtractions: Record<Provider, Extraction[]>
): ScoreResult {
  const byProvider: Partial<ProviderScores> = {};
  const breakdown: Record<string, number> = {};
  const overallScores: number[] = [];

  for (const [provider, extractions] of Object.entries(byProviderExtractions)) {
    // Only score providers that actually ran (i.e., produced extractions).
    if (!Array.isArray(extractions) || extractions.length === 0) continue;
    const res = scoreOne(extractions);
    byProvider[provider as Provider] = res.overallScore;
    overallScores.push(res.overallScore);
    // include provider-specific breakdowns with prefix
    for (const [k, v] of Object.entries(res.breakdown)) {
      breakdown[`${provider}.${k}`] = v;
    }
  }

  const overall =
    overallScores.length === 0
      ? 0
      : overallScores.reduce((a, b) => a + b, 0) / overallScores.length;

  return {
    overallScore: clamp100(overall),
    byProvider: byProvider as ProviderScores,
    breakdown
  };
}


