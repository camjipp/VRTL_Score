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
const INNER_W = MODEL_CARD_WIDTH - 14;
/** Equal-height analysis cards — keep moderate to reduce forced page breaks */
const CARD_MIN_H = 120;

const styles = StyleSheet.create({
  root: {
    width: MODEL_CARD_WIDTH,
    minHeight: CARD_MIN_H,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 8,
    overflow: "hidden",
  },
  topBand: {
    height: 3,
    width: "100%",
  },
  inner: {
    padding: 10,
    flexGrow: 1,
  },
  name: {
    fontSize: 8,
    fontWeight: 400,
    color: colors.ink,
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: fonts.sansBold,
    letterSpacing: 0.03,
  },
  scoreOnly: {
    fontSize: 34,
    fontWeight: 400,
    lineHeight: 1,
    fontFamily: fonts.sansBold,
    marginBottom: 6,
  },
  deltaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  deltaPill: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  deltaPillPos: { backgroundColor: colors.surface2 },
  deltaPillNeg: { backgroundColor: colors.surface2 },
  deltaPillText: {
    fontSize: 7,
    fontWeight: 400,
    color: colors.ink2,
    fontFamily: fonts.sansBold,
  },
  rule: {
    height: 1,
    backgroundColor: colors.rule,
    marginBottom: 5,
    width: INNER_W,
  },
  barTrack: {
    width: INNER_W,
    height: 6,
    backgroundColor: colors.surface2,
    borderRadius: 4,
    marginBottom: 2,
    flexDirection: "row",
  },
  barFill: {
    height: 6,
    borderRadius: 4,
  },
  barRest: {
    height: 6,
  },
  barWrap: {
    position: "relative",
    width: INNER_W,
    marginBottom: 3,
  },
  avgTick: {
    position: "absolute",
    top: -1,
    width: 2,
    height: 9,
    backgroundColor: colors.ink4,
  },
  avgLabel: {
    fontSize: 6,
    color: colors.ink4,
    marginBottom: 8,
    fontFamily: fonts.sans,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
    marginRight: 7,
  },
  bulletText: {
    width: INNER_W - 12,
    fontSize: 6.5,
    lineHeight: 1.48,
    color: colors.ink,
    fontFamily: fonts.sans,
  },
});

export function ModelAnalysisCard({
  modelId,
  modelName,
  score,
  deltaVsAvg,
  avg,
  insights,
  bandColor: _bandColor,
  scoreAccent: _scoreAccent,
  bulletDotColor: _bulletDotColor,
}: ModelAnalysisCardProps) {
  void _bandColor;
  void _scoreAccent;
  void _bulletDotColor;
  const scorePct = Math.min(100, Math.max(0, Math.round(score)));
  const rest = Math.max(0, 100 - scorePct);
  const avgPos = Math.min(100, Math.max(0, Math.round(avg)));
  const tickLeft = (INNER_W * avgPos) / 100 - 1;

  const nameLine = String(modelName).toUpperCase();
  const scoreLine = String(score);
  const deltaSign = deltaVsAvg >= 0 ? "+" : "-";
  const deltaAbs = String(Math.abs(deltaVsAvg));
  const deltaLine = `${deltaSign}${deltaAbs} vs avg`;
  const avgLabelLine = `avg ${avg}`;

  const posPill = deltaVsAvg >= 0;

  return (
    <View style={styles.root}>
      <View style={[styles.topBand, { backgroundColor: colors.surface2 }]} />
      <View style={styles.inner}>
        <Text style={styles.name}>{nameLine}</Text>
        <Text style={[styles.scoreOnly, { color: colors.ink }]}>{scoreLine}</Text>
        <View style={styles.deltaRow}>
          <View style={[styles.deltaPill, posPill ? styles.deltaPillPos : styles.deltaPillNeg]}>
            <Text style={styles.deltaPillText}>{deltaLine}</Text>
          </View>
        </View>

        <View style={styles.rule} />

        <View style={styles.barWrap}>
          <View style={styles.barTrack}>
            <View style={[{ flex: scorePct <= 0 ? 0 : scorePct, backgroundColor: colors.cyan }, styles.barFill]} />
            <View style={[{ flex: rest }, styles.barRest]} />
          </View>
          <View style={[styles.avgTick, { left: tickLeft }]} />
        </View>
        <Text style={styles.avgLabel}>{avgLabelLine}</Text>

        {insights.map((line, idx) => {
          const lineText = String(line);
          return (
            <View key={`${modelId}-row-${idx}`} style={styles.bulletRow} wrap={false}>
              <View style={[styles.dot, { backgroundColor: colors.ink4 }]} />
              <Text style={styles.bulletText}>{lineText}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
