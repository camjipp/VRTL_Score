import { Path, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

/** ViewBox and geometry for ~270° horseshoe (gap at bottom), center (80, 78). */
const SIZE = 168;
const CX = 80;
const CY = 78;
const R = 58;
const STROKE = 11;

const DEG = Math.PI / 180;
function pt(angleDeg: number): { x: number; y: number } {
  const t = angleDeg * DEG;
  return { x: CX + R * Math.cos(t), y: CY + R * Math.sin(t) };
}

/** Major arc through the top from 210° to 330° (SVG coords: 0° = +x, 90° = +y). */
const ARC_START = pt(210);
const ARC_END = pt(330);
const ARC_D = `M ${ARC_START.x.toFixed(2)} ${ARC_START.y.toFixed(2)} A ${R} ${R} 0 1 0 ${ARC_END.x.toFixed(2)} ${ARC_END.y.toFixed(2)}`;

/** Arc length for 240° of radius R */
const ARC_LEN = (240 / 360) * (2 * Math.PI * R);

const RING_TRACK = "#D8DCE3";

type Props = { score: number | null };

export function ScoreRing({ score }: Props) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const filled = pct * ARC_LEN;
  const gap = Math.max(0.001, ARC_LEN - filled);

  return (
    <View style={{ width: SIZE, alignItems: "center", justifyContent: "center" }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Path d={ARC_D} stroke={RING_TRACK} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
        <Path
          d={ARC_D}
          stroke={colors.cyan}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="butt"
          strokeDasharray={`${filled} ${gap + ARC_LEN}`}
        />
      </Svg>
      <View style={{ marginTop: -108, alignItems: "center" }}>
        <Text
          style={{
            fontSize: 44,
            fontWeight: 400,
            color: colors.ink,
            fontFamily: fonts.sansBold,
            lineHeight: 1,
          }}
        >
          {score == null ? "—" : String(score)}
        </Text>
        <Text style={{ fontSize: 8, color: colors.ink3, marginTop: 0, fontFamily: fonts.sans }}>/ 100</Text>
        <Text
          style={{
            fontSize: 6,
            fontWeight: 400,
            color: colors.ink3,
            marginTop: 2,
            letterSpacing: 0.06,
            fontFamily: fonts.sansBold,
          }}
        >
          OVERALL SCORE
        </Text>
      </View>
    </View>
  );
}
