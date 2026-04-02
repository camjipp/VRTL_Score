import { Circle, G, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

const R = 44;
const stroke = 9;
const CX = 55;
const CY = 55;

type Props = { score: number | null };

/** Arc from top via strokeDasharray + rotate -90° on value stroke only */
export function ScoreRing({ score }: Props) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const circumference = 2 * Math.PI * R;
  const filled = pct * circumference;
  const gap = Math.max(0, circumference - filled);

  return (
    <View style={{ width: 110, alignItems: "center" }}>
      <Svg width={110} height={110} viewBox="0 0 110 110">
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
      <View style={{ marginTop: -78, alignItems: "center", marginBottom: 8 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: colors.ink,
            fontFamily: fonts.sans,
          }}
        >
          {score == null ? "—" : String(score)}
        </Text>
        <Text style={{ fontSize: 9, color: colors.ink4, marginTop: 2, fontFamily: fonts.sans }}>/ 100</Text>
        <Text
          style={{
            fontSize: 7,
            fontWeight: 600,
            color: colors.ink4,
            marginTop: 6,
            letterSpacing: 0.65,
            fontFamily: fonts.sans,
          }}
        >
          OVERALL SCORE
        </Text>
      </View>
    </View>
  );
}
