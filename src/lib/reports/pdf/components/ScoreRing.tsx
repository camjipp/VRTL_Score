import { Path, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

/**
 * Gauge arc: opens downward toward the score (classic dial).
 * Endpoints at bottom-left / bottom-right; major arc runs over the top (270°).
 *
 * Layout: the arc viewport (W×H) is centered in `COLUMN_W` to match Page 1 heroLeft.
 * The score + “/100” stack is flex-centered inside the arc only (single visual unit).
 * A small negative translate pulls the stack to the optical center of the horseshoe.
 */
const W = 172;
const H = 124;
const CX = W / 2;
const CY = 62;
const R = 54;
const STROKE = 13;

/** Must match `heroLeft` width on Page 1 so the ring is centered in the column. */
export const SCORE_RING_COLUMN_W = 180;

/** Fine-tune optical center of the digit stack inside the arc (pt). */
const STACK_NUDGE_X = 0;
const STACK_NUDGE_Y = -6;

const DEG = Math.PI / 180;
function pt(angleDeg: number): { x: number; y: number } {
  const t = angleDeg * DEG;
  return { x: CX + R * Math.cos(t), y: CY + R * Math.sin(t) };
}

const P0 = pt(135);
const P1 = pt(45);
const ARC_D = `M ${P0.x.toFixed(2)} ${P0.y.toFixed(2)} A ${R} ${R} 0 1 1 ${P1.x.toFixed(2)} ${P1.y.toFixed(2)}`;

const ARC_LEN = (270 / 360) * (2 * Math.PI * R);
const RING_TRACK = "#D1D5DB";

type Props = { score: number | null };

export function ScoreRing({ score }: Props) {
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const filled = pct * ARC_LEN;
  const rest = Math.max(0.001, ARC_LEN - filled);

  const display = score == null ? "—" : String(score);

  return (
    <View style={{ width: SCORE_RING_COLUMN_W, alignItems: "center" }}>
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
          <View
            style={{
              alignItems: "center",
              marginLeft: STACK_NUDGE_X,
              marginTop: STACK_NUDGE_Y,
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
            <Text
              style={{
                fontSize: 7,
                color: colors.ink4,
                fontFamily: fonts.sans,
                lineHeight: 1,
                marginTop: 2,
                textAlign: "center",
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
