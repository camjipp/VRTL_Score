import { Circle, Defs, LinearGradient, Stop, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

const SIZE = 128;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 50;
const STROKE = 7;
const C = 2 * Math.PI * R;

type Props = { score: number | null };

/** Arc ring: stroke-dasharray on a circle (SVG, not canvas) */
export function ScoreRing({ score }: Props) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const dash = pct * C;
  const gap = C - dash;

  return (
    <View style={{ width: SIZE, alignItems: "center" }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Defs>
          <LinearGradient id="ringGradP1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0EA5E9" />
            <Stop offset="1" stopColor="#7C3AED" />
          </LinearGradient>
        </Defs>
        <Circle cx={CX} cy={CY} r={R} fill="none" stroke={colors.barTrack} strokeWidth={STROKE} />
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="url(#ringGradP1)"
          strokeWidth={STROKE}
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ marginTop: -78, alignItems: "center", marginBottom: 8 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: colors.text,
            fontFamily: fonts.display,
          }}
        >
          {score == null ? "—" : String(score)}
        </Text>
        <Text style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>/ 100</Text>
        <Text
          style={{
            fontSize: 7,
            fontWeight: 600,
            color: colors.muted,
            marginTop: 6,
            letterSpacing: 0.65,
          }}
        >
          OVERALL SCORE
        </Text>
      </View>
    </View>
  );
}
