import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ScoreRing } from "../components/ScoreRing";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { lockedStyles } from "./lockedDocumentStyles";

const METRIC_H = 76;

const local = StyleSheet.create({
  metricsRow: { flexDirection: "row", minHeight: METRIC_H },
});

function fmtScore(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return String(Math.round(n));
}

type Health = "strong" | "moderate" | "weak";

function classify(value: number, strongAt: number, moderateAt: number): Health {
  if (!Number.isFinite(value) || value <= 0) return "weak";
  if (value >= strongAt) return "strong";
  if (value >= moderateAt) return "moderate";
  return "weak";
}

function valueStyle(h: Health) {
  if (h === "strong") return lockedStyles.perf_metricValueStrong;
  if (h === "weak") return lockedStyles.perf_metricValueWeak;
  return lockedStyles.perf_metricValueModerate;
}

function rankBarPct(rank: number, rankTotal: number): number {
  if (rankTotal <= 0 || !Number.isFinite(rank)) return 0;
  return Math.min(100, Math.max(0, Math.round(((rankTotal - rank + 1) / rankTotal) * 100)));
}

function primaryInsightForTier(tier: string): string {
  const t = (tier || "").trim();
  if (t === "Dominant") return "You are defining the category for assistants in this sample.";
  if (t === "Strong") return "You are a leading recommendation, with room to make first-slot outcomes even more automatic.";
  if (t === "Weak") return "You are underrepresented when buyers ask assistants for guidance in this category.";
  return "You are visible — but not the default choice.";
}

function heroSupportingForTier(tier: string): string {
  const t = (tier || "").trim();
  if (t === "Dominant" || t === "Strong") {
    return "Assistants already surface you frequently. The next step is defending that default position with proof and freshness so recommendations do not drift to challengers.";
  }
  if (t === "Weak") {
    return "You appear in fewer assistant answers than leaders in this category. Raising mention rate—and pairing it with credible proof—is how you move from occasional mention to reliable recommendation.";
  }
  return "Assistants include you often, but they do not consistently recommend you first. That means competitors still win decisions even when you are in the conversation.";
}

function buildDiagnosisNarrative(d: ReportData): string {
  const m = Math.min(100, Math.max(0, Math.round(d.mentionRate)));
  const miss = Math.max(0, 100 - m);
  const tp = d.topPosition;
  const auth = d.authorityScore;
  const authStr = String(d.authorityScore);

  const parts: string[] = [];

  parts.push(
    `You appear in ${m}% of assistant responses, which puts you in the conversation more often than most competitors.`,
  );

  parts.push(
    `However, visibility alone is not enough. In the remaining ${miss}% of responses, you are not mentioned at all—giving competitors full control over those decisions.`,
  );

  if (tp < 35) {
    parts.push(
      "Even when you are included, you are not consistently positioned as the first recommendation. That means assistants are not treating you as the default choice.",
    );
  } else if (tp >= 55) {
    parts.push(
      `When you are included, assistants often place you first (${String(d.topPosition)}% of answers in this sample). The remaining risk is when you are absent—and whether rivals own those answers outright.`,
    );
  } else {
    parts.push(
      `Even when you are included, first-slot positioning is mixed (${String(d.topPosition)}% list you first), so assistants are not fully standardizing on you as the default.`,
    );
  }

  if (auth === 0) {
    parts.push(
      "The biggest issue is authority. In this sample, none of your mentions include citations or supporting proof. Without that, assistants are more likely to favor competitors that appear more credible.",
    );
  } else if (auth < 15) {
    parts.push(
      `Authority is still a gap: only ${authStr}% of mentions in this sample include citations or supporting proof, so credibility is easy for rivals to challenge.`,
    );
  } else {
    parts.push(
      `Citation-backed authority is present at ${authStr}% of mentions in this sample, but gaps in presence and first-slot outcomes still give competitors room to win the answer.`,
    );
  }

  if (auth === 0) {
    if (m >= 50) {
      parts.push(
        "Right now, you look strong on presence, but weak on trust. That combination creates instability—your position can be replaced quickly if a competitor strengthens their authority signals.",
      );
    } else {
      parts.push(
        "With room to grow on presence and no citation-backed proof in this sample, assistants have little anchor for a durable recommendation—closing both gaps is the priority.",
      );
    }
  } else if (m >= 50 && auth < 15) {
    parts.push(
      "Right now, you look strong on presence relative to many peers, but proof is still thin—rivals can look more credible until citation depth catches up.",
    );
  } else if (m >= 50 && auth >= 15) {
    parts.push(
      "You pair solid presence with some proof—tightening first-slot consistency and deepening citations are what make the recommendation feel inevitable instead of optional.",
    );
  } else {
    parts.push(
      "Taken together, visibility, first-slot outcomes, and citation-backed authority explain where assistants default today—and where the next gains will come from.",
    );
  }

  return clipPdfText(parts.join("\n\n"), 2200);
}

export function PagePerformanceSnapshot({ data }: { data: ReportData }): ReactElement {
  const score = data.overallScore;
  const tier = (data.status || "").trim() || "Moderate";
  const scoreLine =
    score == null || Number.isNaN(score) ? "— / 100" : clipPdfText(`${fmtScore(score)} / 100`, 24);

  const rankPct = rankBarPct(data.rank, data.rankTotal);
  const narrative = buildDiagnosisNarrative(data);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[3]!}>
      <View style={lockedStyles.perf_section} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Score</Text>
        <View style={lockedStyles.perf_heroRow} wrap={false}>
          <View style={lockedStyles.perf_heroDial} wrap={false}>
            <ScoreRing
              score={score}
              variant="performance"
              scoreLabel={null}
              palette="neutral"
              showFraction={false}
              arcZoneLabels
              arcScoreTick
            />
          </View>
          <View style={lockedStyles.perf_heroAside} wrap={false}>
            <Text style={lockedStyles.perf_heroScoreLine}>{scoreLine}</Text>
            <Text style={lockedStyles.perf_heroPrimaryInsight}>{primaryInsightForTier(tier)}</Text>
            <Text style={lockedStyles.perf_heroSupporting}>{heroSupportingForTier(tier)}</Text>
            <Text style={lockedStyles.perf_heroContext}>
              Measured across OpenAI, Google Gemini, and Anthropic responses.
            </Text>
          </View>
        </View>
      </View>

      <View style={lockedStyles.perf_section} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Supporting metrics</Text>
        <View style={lockedStyles.perf_metricsBand} wrap={false}>
          <View style={[lockedStyles.perf_metricsRow, local.metricsRow]} wrap={false}>
            {(() => {
              const mh = classify(data.mentionRate, 65, 40);
              return (
                <View style={lockedStyles.perf_metricCellFirst}>
                  <Text style={lockedStyles.perf_metricLabel}>Mention Rate</Text>
                  <Text style={[lockedStyles.perf_metricValue, valueStyle(mh)]}>
                    {clipPdfText(String(data.mentionRate))}%
                  </Text>
                  <Text style={lockedStyles.perf_metricHelp}>Share of answers that include you.</Text>
                </View>
              );
            })()}
            {(() => {
              const th = classify(data.topPosition, 40, 20);
              return (
                <View style={lockedStyles.perf_metricCell}>
                  <Text style={lockedStyles.perf_metricLabel}>Top Position</Text>
                  <Text style={[lockedStyles.perf_metricValue, valueStyle(th)]}>
                    {clipPdfText(String(data.topPosition))}%
                  </Text>
                  <Text style={lockedStyles.perf_metricHelp}>Share of answers where you are listed first.</Text>
                </View>
              );
            })()}
            {(() => {
              const ah = classify(data.authorityScore, 30, 10);
              return (
                <View style={lockedStyles.perf_metricCell}>
                  <Text style={lockedStyles.perf_metricLabel}>Authority</Text>
                  <Text style={[lockedStyles.perf_metricValue, valueStyle(ah)]}>
                    {clipPdfText(String(data.authorityScore))}%
                  </Text>
                  <Text style={lockedStyles.perf_metricHelp}>Answers with citations or proof.</Text>
                </View>
              );
            })()}
            {(() => {
              const rank = data.rank || 0;
              const rh: Health = rank === 1 ? "strong" : rank <= 3 ? "moderate" : "weak";
              return (
                <View style={lockedStyles.perf_metricCellLast}>
                  <Text style={lockedStyles.perf_metricLabel}>Rank</Text>
                  <Text style={[lockedStyles.perf_metricValue, valueStyle(rh)]}>
                    {clipPdfText(`${data.rank}/${data.rankTotal}`)}
                  </Text>
                  <Text style={lockedStyles.perf_metricHelp}>
                    Leaderboard position ({fmtScore(rankPct)}% relative strength).
                  </Text>
                </View>
              );
            })()}
          </View>
        </View>
      </View>

      <View style={lockedStyles.perf_sectionTight} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Diagnosis</Text>
        <View style={lockedStyles.perf_diagWrap} wrap={false}>
          <View style={lockedStyles.perf_diagNarrativeWrap} wrap={false}>
            <Text style={lockedStyles.perf_diagNarrative}>{narrative}</Text>
          </View>
        </View>
      </View>
    </PdfInnerPage>
  );
}
