import { Path, Svg } from "@react-pdf/renderer";
import { Text, View } from "@react-pdf/renderer";
import { colors, fonts } from "../theme";

const RING_PRESETS = {
  default: {
    W: 188,
    H: 132,
    R: 58,
    stroke: 14,
    colW: 196,
    scoreFont: 48,
    fracFont: 7,
    labelFont: 6,
    labelBottom: 22,
    nudgeY: -6,
  },
  /** Page 1 hero — dominant dial + numerals (agency deliverable focal) */
  hero: {
    W: 238,
    H: 166,
    R: 74,
    stroke: 17,
    colW: 252,
    scoreFont: 72,
    fracFont: 9,
    labelFont: 6.5,
    labelBottom: 26,
    nudgeY: -10,
  },
} as const;

export type ScoreRingVariant = keyof typeof RING_PRESETS;

/** Default column width for score column layouts (matches `default` preset). */
export const SCORE_RING_COLUMN_W = RING_PRESETS.default.colW;

/** Wider column when {@link ScoreRing} uses `variant="hero"` (Page 1 focal). */
export const SCORE_RING_COLUMN_W_HERO = RING_PRESETS.hero.colW;

const DEG = Math.PI / 180;

const RING_TRACK = "#D1D5DB";

type Props = { score: number | null; variant?: ScoreRingVariant };

export function ScoreRing({ score, variant = "default" }: Props) {
  const p = RING_PRESETS[variant];
  const { W, H, R, stroke: STROKE, colW, scoreFont, fracFont, labelFont, labelBottom, nudgeY } = p;
  const CX = W / 2;
  const CY = H / 2;

  function pt(angleDeg: number): { x: number; y: number } {
    const t = angleDeg * DEG;
    return { x: CX + R * Math.cos(t), y: CY + R * Math.sin(t) };
  }

  const P0 = pt(135);
  const P1 = pt(45);
  const ARC_D = `M ${P0.x.toFixed(2)} ${P0.y.toFixed(2)} A ${R} ${R} 0 1 1 ${P1.x.toFixed(2)} ${P1.y.toFixed(2)}`;

  const ARC_LEN = (270 / 360) * (2 * Math.PI * R);
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const filled = pct * ARC_LEN;
  const rest = Math.max(0.001, ARC_LEN - filled);

  const display = score == null ? "—" : String(score);

  return (
    <View style={{ width: colW, alignItems: "center" }}>
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

        <View style={{ position: "absolute", bottom: labelBottom, left: 0, width: W, alignItems: "center" }}>
          <Text
            style={{
              fontSize: labelFont,
              fontWeight: 400,
              color: colors.ink3,
              letterSpacing: 0.06,
              fontFamily: fonts.sansBold,
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            OVERALL SCORE
          </Text>
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
              marginLeft: 0,
              marginTop: nudgeY,
            }}
          >
            <Text
              style={{
                fontSize: scoreFont,
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
                fontSize: fracFont,
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
    </View>
  );
}
