import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

export type ModelAnalysisCardProps = {
  modelId: string;
  modelName: string;
  score: number;
  deltaVsAvg: number;
  avg: number;
  insights: readonly string[];
  bandColor: string;
  scoreAccent: string;
  bulletDotColor: string;
};

/** Three columns + gaps = 540pt content: 172 + 12 + 172 + 12 + 172 */
export const MODEL_CARD_WIDTH = 172;
const INNER_W = MODEL_CARD_WIDTH - 24;

const styles = StyleSheet.create({
  root: {
    width: MODEL_CARD_WIDTH,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  topBand: {
    height: 6,
    width: "100%",
  },
  inner: {
    padding: 12,
  },
  name: {
    fontSize: 11,
    fontWeight: 700,
    color: colors.text,
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: fonts.display,
  },
  score: {
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: 8,
    fontFamily: fonts.display,
  },
  deltaPill: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  deltaPillPos: { backgroundColor: "#D1FAE5" },
  deltaPillNeg: { backgroundColor: "#FEE2E2" },
  deltaPillText: {
    fontSize: 8,
    fontWeight: 700,
    color: colors.body,
  },
  barTrack: {
    width: INNER_W,
    height: 6,
    backgroundColor: colors.barTrack,
    borderRadius: 3,
    marginBottom: 2,
    flexDirection: "row",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  barRest: {
    height: 6,
  },
  barWrap: {
    position: "relative",
    width: INNER_W,
    marginBottom: 2,
  },
  avgTick: {
    position: "absolute",
    top: -1,
    width: 2,
    height: 9,
    backgroundColor: colors.muted,
  },
  avgLabel: {
    fontSize: 6,
    color: colors.muted,
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
    marginRight: 6,
  },
  bulletText: {
    width: INNER_W - 11,
    fontSize: 8,
    lineHeight: 1.5,
    color: colors.body,
  },
});

export function ModelAnalysisCard({
  modelId,
  modelName,
  score,
  deltaVsAvg,
  avg,
  insights,
  bandColor,
  scoreAccent,
  bulletDotColor,
}: ModelAnalysisCardProps) {
  const scorePct = Math.min(100, Math.max(0, Math.round(score)));
  const rest = Math.max(0, 100 - scorePct);
  const avgPos = Math.min(100, Math.max(0, Math.round(avg)));
  const tickLeft = (INNER_W * avgPos) / 100 - 1;

  const nameLine = String(modelName).toUpperCase();
  const scoreLine = String(score);
  const deltaSign = deltaVsAvg >= 0 ? "+" : "-";
  const deltaAbs = String(Math.abs(deltaVsAvg));
  const deltaLine = `${deltaSign}${deltaAbs} vs. avg`;
  const avgLabelLine = `avg ${avg}`;

  const posPill = deltaVsAvg >= 0;

  return (
    <View style={styles.root} wrap={false} minPresenceAhead={80}>
      <View style={[styles.topBand, { backgroundColor: bandColor }]} />
      <View style={styles.inner}>
        <Text style={styles.name}>{nameLine}</Text>
        <Text style={[styles.score, { color: scoreAccent }]}>{scoreLine}</Text>
        <View style={[styles.deltaPill, posPill ? styles.deltaPillPos : styles.deltaPillNeg]}>
          <Text style={styles.deltaPillText}>{deltaLine}</Text>
        </View>

        <View style={styles.barWrap}>
          <View style={styles.barTrack}>
            <View style={[{ flex: scorePct <= 0 ? 0 : scorePct, backgroundColor: scoreAccent }, styles.barFill]} />
            <View style={[{ flex: rest }, styles.barRest]} />
          </View>
          <View style={[styles.avgTick, { left: tickLeft }]} />
        </View>
        <Text style={styles.avgLabel}>{avgLabelLine}</Text>

        {insights.map((line, idx) => {
          const lineText = String(line);
          return (
            <View key={`${modelId}-row-${idx}`} style={styles.bulletRow} wrap={false}>
              <View style={[styles.dot, { backgroundColor: bulletDotColor }]} />
              <Text style={styles.bulletText}>{lineText}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
