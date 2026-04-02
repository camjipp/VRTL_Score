import { Circle, G, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

const SIZE = 144;
const R = 56;
const stroke = 10;
const CX = 72;
const CY = 72;

/** Track: very light gray; progress: single solid accent (no gradient). */
const RING_TRACK = "#E8EAED";

type Props = { score: number | null };

/** Arc from top via strokeDasharray + rotate -90° on value stroke only */
export function ScoreRing({ score }: Props) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const circumference = 2 * Math.PI * R;
  const filled = pct * circumference;
  const gap = Math.max(0, circumference - filled);

  return (
    <View style={{ width: SIZE, alignItems: "center", justifyContent: "center" }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          stroke={RING_TRACK}
          strokeWidth={stroke}
          fill="none"
        />
        <G transform={`rotate(-90 ${CX} ${CY})`}>
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            stroke={colors.cyan}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${filled} ${gap}`}
            strokeLinecap="butt"
          />
        </G>
      </Svg>
      <View style={{ marginTop: -104, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 40,
            fontWeight: 400,
            color: colors.ink,
            fontFamily: fonts.sansBold,
            lineHeight: 1,
          }}
        >
          {score == null ? "—" : String(score)}
        </Text>
        <Text style={{ fontSize: 8, color: colors.ink4, marginTop: 1, fontFamily: fonts.sans }}>/ 100</Text>
        <Text
          style={{
            fontSize: 6,
            fontWeight: 400,
            color: colors.ink4,
            marginTop: 3,
            letterSpacing: 0.08,
            fontFamily: fonts.sansBold,
          }}
        >
          OVERALL SCORE
        </Text>
      </View>
    </View>
  );
}
