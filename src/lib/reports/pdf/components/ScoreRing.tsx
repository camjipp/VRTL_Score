import { Path, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

/**
 * Gauge arc: opens downward toward the score (classic dial).
 * Endpoints at bottom-left / bottom-right; major arc runs over the top (270°).
 * Progress draws along the path from left → right.
 *
 * Geometry: circle center is (CX, CY) = (W/2, H/2). The score block is centered
 * in the H×W arc viewport so its center matches the arc center; OVERALL SCORE sits
 * below that viewport so it does not shift the number vertically.
 */
const W = 172;
const H = 124;
const CX = W / 2;
const CY = 62;
const R = 54;
const STROKE = 13;

const DEG = Math.PI / 180;
/** Standard math angle (CCW from +x); y increases downward (SVG). */
function pt(angleDeg: number): { x: number; y: number } {
  const t = angleDeg * DEG;
  return { x: CX + R * Math.cos(t), y: CY + R * Math.sin(t) };
}

const P0 = pt(135);
const P1 = pt(45);
/** large-arc 1 (270°), sweep 1 = clockwise → arc over the top, progress left → right */
const ARC_D = `M ${P0.x.toFixed(2)} ${P0.y.toFixed(2)} A ${R} ${R} 0 1 1 ${P1.x.toFixed(2)} ${P1.y.toFixed(2)}`;

const ARC_LEN = (270 / 360) * (2 * Math.PI * R);

const RING_TRACK = "#D1D5DB";

type Props = { score: number | null };

export function ScoreRing({ score }: Props) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const filled = pct * ARC_LEN;
  const rest = Math.max(0.001, ARC_LEN - filled);

  return (
    <View style={{ width: W, alignItems: "center" }}>
      {/* Fixed arc viewport: Svg + score share the same H; center = arc center (W/2, H/2). */}
      <View style={{ width: W, height: H, position: "relative" }}>
        <View style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <Path d={ARC_D} stroke={RING_TRACK} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
            <Path
              d={ARC_D}
              stroke={colors.cyan}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${filled} ${rest + ARC_LEN}`}
            />
          </Svg>
        </View>

        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: W,
            height: H,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 42,
                  fontWeight: 400,
                  color: colors.ink,
                  fontFamily: fonts.sansBold,
                  lineHeight: 1,
                }}
              >
                {score == null ? "—" : String(score)}
              </Text>
              <Text
                style={{
                  fontSize: 9,
                  color: colors.ink3,
                  marginLeft: 3,
                  fontFamily: fonts.sans,
                  lineHeight: 1,
                }}
              >
                /{"\u00A0"}100
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Text
        style={{
          fontSize: 6,
          fontWeight: 400,
          color: colors.ink3,
          marginTop: 4,
          letterSpacing: 0.06,
          fontFamily: fonts.sansBold,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        OVERALL SCORE
      </Text>
    </View>
  );
}
