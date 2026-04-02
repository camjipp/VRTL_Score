import { Circle, G, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

const SIZE = 120;
const R = 48;
const stroke = 9;
const CX = 60;
const CY = 60;

type Props = { score: number | null };

/** Arc from top via strokeDasharray + rotate -90° on value stroke only */
export function ScoreRing({ score }: Props) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const circumference = 2 * Math.PI * R;
  const filled = pct * circumference;
  const gap = Math.max(0, circumference - filled);

  return (
    <View style={{ width: SIZE, alignItems: "center" }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          stroke={colors.surface2}
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
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={{ marginTop: -86, alignItems: "center", marginBottom: 6 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: colors.ink,
            fontFamily: fonts.sansBold,
          }}
        >
          {score == null ? "—" : String(score)}
        </Text>
        <Text style={{ fontSize: 9, color: colors.ink4, marginTop: 2, fontFamily: fonts.sans }}>/ 100</Text>
        <Text
          style={{
            fontSize: 7,
            fontWeight: 400,
            color: colors.ink4,
            marginTop: 5,
            letterSpacing: 0.25,
            fontFamily: fonts.sansBold,
          }}
        >
          OVERALL SCORE
        </Text>
      </View>
    </View>
  );
}
