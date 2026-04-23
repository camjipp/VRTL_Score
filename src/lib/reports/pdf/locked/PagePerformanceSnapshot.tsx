import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { ScoreRing } from "../components/ScoreRing";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ReportData } from "../types";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LD } from "./lockedDesignTokens";
import { lockedStyles } from "./lockedDocumentStyles";

const METRIC_H = 92;

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

function barFill(h: Health): string {
  if (h === "weak") return LD.color.risk;
  if (h === "strong") return LD.color.signalStrong;
  return LD.color.ink3;
}

function PctBar({ pct, fill }: { pct: number; fill: string }): ReactElement {
  const p = Math.min(100, Math.max(0, Math.round(pct)));
  const rest = 100 - p;
  return (
    <View style={lockedStyles.perf_miniBarTrack} wrap={false}>
      <View style={[lockedStyles.perf_miniBarFill, { flex: Math.max(1, p), backgroundColor: fill }]} />
      <View style={[lockedStyles.perf_miniBarRest, { flex: Math.max(1, rest) }]} />
    </View>
  );
}

function rankBarPct(rank: number, rankTotal: number): number {
  if (rankTotal <= 0 || !Number.isFinite(rank)) return 0;
  return Math.min(100, Math.max(0, Math.round(((rankTotal - rank + 1) / rankTotal) * 100)));
}

function heroLeadForStatus(status: string): string {
  const s = (status || "").trim();
  const map: Record<string, string> = {
    Dominant: "You are often the default recommendation when this category comes up.",
    Strong: "You show up strongly—close to owning the first recommendation consistently.",
    Moderate: "You appear in answers, but the first slot is still up for grabs.",
    Contested: "You show up often, but are not the default choice.",
    Weak: "You are rarely recommended first—visibility needs concentrated repair.",
    Unknown: "Snapshot coverage was not enough to stabilize this tier yet.",
  };
  return map[s] ?? "Visibility is mixed; the row below isolates where leverage shows up.";
}

function perfWhatsHappening(d: ReportData): string {
  const m = Math.min(100, Math.max(0, Math.round(d.mentionRate)));
  const miss = Math.max(0, 100 - m);
  return clipPdfText(`You are included in ${m}% of answers — but missing in ${miss}%.`, 220);
}

function perfDriving(d: ReportData): string {
  const parts: string[] = [];
  const tp = d.topPosition;
  const auth = d.authorityScore;
  if (tp < 25) parts.push("You are not consistently ranked first.");
  else if (tp < 45) parts.push("First-slot wins are still inconsistent.");
  if (auth === 0) parts.push("You have zero citation support in this sample.");
  else if (auth < 15) parts.push("Citation support is very thin.");
  if (parts.length === 0) parts.push("Signals are uneven across mentions, position, and proof.");
  return clipPdfText(parts.slice(0, 2).join(" "), 260);
}

function perfRisk(d: ReportData): string {
  const t = (d.tensionNote || "").trim();
  if (t) return clipPdfText(t, 280);
  const client = d.competitors.find((c) => c.isClient);
  const others = d.competitors.filter((c) => !c.isClient).sort((a, b) => b.mentions - a.mentions);
  const runner = others[0];
  if (
    client &&
    runner &&
    runner.mentions >= client.mentions - 3 &&
    runner.mentions <= client.mentions + 6
  ) {
    return "Competitors are close enough to take your position with minimal improvement.";
  }
  const bl = (d.bottomLine || "").trim();
  if (bl) return clipPdfText(bl, 280);
  return "Competitors can still close the gap on first-slot recommendations with sharper proof.";
}

export function PagePerformanceSnapshot({ data }: { data: ReportData }): ReactElement {
  const score = data.overallScore;
  const tier = (data.status || "").trim() || "Moderate";
  const scoreHeadline =
    score == null || Number.isNaN(score)
      ? clipPdfText(`— / 100 — ${tier}`, 140)
      : clipPdfText(`${fmtScore(score)} / 100 — ${tier}`, 140);

  const rankPct = rankBarPct(data.rank, data.rankTotal);

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[3]!}>
      <View style={lockedStyles.perf_heroRow} wrap={false}>
        <View style={lockedStyles.perf_heroDial} wrap={false}>
          <ScoreRing
            score={score}
            variant="performance"
            scoreLabel={null}
            palette="neutral"
            showFraction={false}
          />
        </View>
        <View style={lockedStyles.perf_heroAside} wrap={false}>
          <Text style={lockedStyles.perf_heroHeadline}>{scoreHeadline}</Text>
          <Text style={lockedStyles.perf_heroLead}>{clipPdfText(heroLeadForStatus(tier), 240)}</Text>
          <Text style={lockedStyles.perf_heroSupport}>
            Measured across real AI responses from OpenAI, Google Gemini, and Anthropic.
          </Text>
        </View>
      </View>

      <View style={lockedStyles.perf_metricsBand} wrap={false}>
        <View style={[lockedStyles.perf_metricsRow, local.metricsRow]} wrap={false}>
          {(() => {
            const mh = classify(data.mentionRate, 65, 40);
            return (
              <View style={lockedStyles.perf_metricCellFirst}>
                <Text style={lockedStyles.perf_metricLabel}>Mention rate</Text>
                <Text style={[lockedStyles.perf_metricValue, valueStyle(mh)]}>
                  {clipPdfText(String(data.mentionRate))}%
                </Text>
                <PctBar pct={data.mentionRate} fill={barFill(mh)} />
                <Text style={lockedStyles.perf_metricHelp}>Share of answers that include you.</Text>
              </View>
            );
          })()}
          {(() => {
            const th = classify(data.topPosition, 40, 20);
            return (
              <View style={lockedStyles.perf_metricCell}>
                <Text style={lockedStyles.perf_metricLabel}>Top position</Text>
                <Text style={[lockedStyles.perf_metricValue, valueStyle(th)]}>
                  {clipPdfText(String(data.topPosition))}%
                </Text>
                <PctBar pct={data.topPosition} fill={barFill(th)} />
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
                <PctBar pct={data.authorityScore} fill={barFill(ah)} />
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
                <PctBar pct={rankPct} fill={barFill(rh)} />
                <Text style={lockedStyles.perf_metricHelp}>Leaderboard position (bar = relative strength).</Text>
              </View>
            );
          })()}
        </View>
      </View>

      <View style={lockedStyles.perf_diagWrap} wrap={false}>
        <View style={lockedStyles.perf_diagBlock} wrap={false}>
          <Text style={lockedStyles.perf_diagTitle}>{"What's happening"}</Text>
          <Text style={lockedStyles.perf_diagBody}>{perfWhatsHappening(data)}</Text>
        </View>
        <View style={lockedStyles.perf_diagBlock} wrap={false}>
          <Text style={lockedStyles.perf_diagTitle}>Why it matters</Text>
          <Text style={lockedStyles.perf_diagBody}>
            When you are missing, competitors take the recommendation.
          </Text>
        </View>
        <View style={lockedStyles.perf_diagBlock} wrap={false}>
          <Text style={lockedStyles.perf_diagTitle}>{"What's driving it"}</Text>
          <Text style={lockedStyles.perf_diagBody}>{perfDriving(data)}</Text>
        </View>
        <View style={lockedStyles.perf_diagBlock} wrap={false}>
          <Text style={lockedStyles.perf_diagTitle}>Risk</Text>
          <Text style={lockedStyles.perf_diagBody}>{perfRisk(data)}</Text>
        </View>
      </View>
    </PdfInnerPage>
  );
}
