import { Path, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

/**
 * Gauge arc: opens downward toward the score (classic dial).
 * Endpoints at bottom-left / bottom-right; major arc runs over the top (270°).
 * Progress draws along the path from left → right.
 *
 * The primary score digit(s) are anchored at the arc’s optical center (geometry
 * center + small nudge). “/100” is a separate annotation and does not participate
 * in that centering. OVERALL SCORE sits just below the arc viewport.
 */
const W = 172;
const H = 124;
const CX = W / 2;
const CY = 62;
const R = 54;
const STROKE = 13;

/** Nudge from math center (CX, CY) for optical balance inside the horseshoe (pt). */
const OPTICAL_X = 3;
const OPTICAL_Y = -3;

/** Pull the score glyph so its visual center lands on the anchor (approx. for 42pt 2-digit). */
const SCORE_PULL_X_TWO = -21;
const SCORE_PULL_X_ONE = -12;
const SCORE_PULL_X_THREE = -31;
const SCORE_PULL_Y = -22;
const SCORE_PULL_X_DASH = -13;

/** “/100” offset from the same anchor — lower-right of the primary figure (pt). */
const SUFFIX_X = 10;
const SUFFIX_Y = 16;

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

  const display = score == null ? "—" : String(score);
  const pullX =
    display === "—"
      ? SCORE_PULL_X_DASH
      : display.length >= 3
        ? SCORE_PULL_X_THREE
        : display.length <= 1
          ? SCORE_PULL_X_ONE
          : SCORE_PULL_X_TWO;

  const ax = CX + OPTICAL_X;
  const ay = CY + OPTICAL_Y;

  return (
    <View style={{ width: W, alignItems: "center" }}>
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

        <View style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
          <View
            style={{
              position: "absolute",
              left: ax,
              top: ay,
              marginLeft: pullX,
              marginTop: SCORE_PULL_Y,
            }}
          >
            <Text
              style={{
                fontSize: 42,
                fontWeight: 400,
                color: colors.ink,
                fontFamily: fonts.sansBold,
                lineHeight: 1,
              }}
            >
              {display}
            </Text>
          </View>

          <View
            style={{
              position: "absolute",
              left: ax + SUFFIX_X,
              top: ay + SUFFIX_Y,
            }}
          >
            <Text
              style={{
                fontSize: 7,
                color: colors.ink4,
                fontFamily: fonts.sans,
                lineHeight: 1,
              }}
            >
              /100
            </Text>
          </View>
        </View>
      </View>

      <Text
        style={{
          fontSize: 6,
          fontWeight: 400,
          color: colors.ink3,
          marginTop: 2,
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
