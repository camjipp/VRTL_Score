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

function scoreLeadParagraph(score: number | null): string {
  const n = score == null || Number.isNaN(score) ? "—" : String(Math.round(score));
  return clipPdfText(
    `Your AI Authority Score is ${n} out of 100. You are visible, but not the default choice. Top models include you often, but they do not consistently recommend you first. That means competitors still win decisions—even when you are in the conversation.`,
    900,
  );
}

function diagnosisParagraphs(d: ReportData): [string, string] {
  const m = Math.min(100, Math.max(0, Math.round(d.mentionRate)));
  const miss = Math.max(0, 100 - m);
  const authStr = String(d.authorityScore);

  const p1 = clipPdfText(
    `You appear in ${m}% of AI responses, which puts you in the conversation more often than most competitors. However, visibility alone is not enough. In the remaining ${miss}% of responses, you are not mentioned at all—giving competitors full control over those decisions.`,
    1200,
  );

  const authorityProof =
    d.authorityScore === 0
      ? "In this sample, none of your mentions include citations or supporting proof."
      : `In this sample, only ${authStr}% of mentions include citations or supporting proof.`;

  const p2 = clipPdfText(
    `Even when you are included, AI answers often place you first, but not consistently enough to make you the default choice. The biggest issue is authority. ${authorityProof} Without that, those answers are more likely to favor competitors that appear more credible. Right now, you look strong on presence, but weak on trust—and that creates instability in your position.`,
    1200,
  );

  return [p1, p2];
}

export function PagePerformanceSnapshot({ data }: { data: ReportData }): ReactElement {
  const score = data.overallScore;
  const rankPct = rankBarPct(data.rank, data.rankTotal);
  const [diagP1, diagP2] = diagnosisParagraphs(data);
  const scoreLead = scoreLeadParagraph(score);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[3]!}>
      <View style={lockedStyles.perf_section} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Score</Text>
        <View style={lockedStyles.perf_heroRow} wrap={false}>
          <View style={lockedStyles.perf_heroDial} wrap={false}>
            <ScoreRing score={score} variant="performance" scoreLabel={null} showFraction={false} />
          </View>
          <View style={lockedStyles.perf_heroAside} wrap={false}>
            <Text style={lockedStyles.perf_heroVerdictTitle}>AI Authority Score (Out of 100)</Text>
            <View style={lockedStyles.perf_heroTakeawayWrap} wrap={false}>
              <Text style={lockedStyles.perf_heroTakeaway}>{scoreLead}</Text>
            </View>
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

      <View style={lockedStyles.perf_sectionDiagnosis} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Diagnosis</Text>
        <View style={lockedStyles.perf_diagWrap} wrap={false}>
          <View style={lockedStyles.perf_diagNarrativeWrap} wrap={false}>
            <Text style={[lockedStyles.perf_diagNarrative, lockedStyles.perf_diagNarrativeGap]} wrap={false}>
              {diagP1}
            </Text>
            <Text style={lockedStyles.perf_diagNarrative} wrap={false}>
              {diagP2}
            </Text>
          </View>
        </View>
      </View>
    </PdfInnerPage>
  );
}
