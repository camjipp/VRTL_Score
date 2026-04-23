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

const ZONE_RED = "#EF4444";
const ZONE_AMBER = "#F59E0B";
const ZONE_GREEN = "#00e87a";

type Props = {
  score: number | null;
  variant?: ScoreRingVariant;
  /** Arc fill (defaults to zone color from score when `zoneTrack` is on). */
  ringStroke?: string;
  /** Upper label under arc; `null` hides the label row. */
  scoreLabel?: string | null;
  /** Draw 0–40 / 40–70 / 70–100 zone colors along the track (strategic gauge). */
  zoneTrack?: boolean;
};

function zoneStrokeForScore(s: number | null): string {
  if (s == null || Number.isNaN(s)) return colors.cyan;
  if (s < 40) return ZONE_RED;
  if (s < 70) return ZONE_AMBER;
  return ZONE_GREEN;
}

export function ScoreRing({ score, variant = "default", ringStroke, scoreLabel, zoneTrack }: Props) {
  const p = RING_PRESETS[variant];
  const { W, H, R, stroke: STROKE, colW, scoreFont, fracFont, labelFont, labelBottom, nudgeY } = p;
  const CX = W / 2;
  const CY = H / 2;

  function pt(angleDeg: number): { x: number; y: number } {
    const t = angleDeg * DEG;
    return { x: CX + R * Math.cos(t), y: CY + R * Math.sin(t) };
  }

  /** Partial arc along the same 270° sweep as the main gauge (135° → 405° / 45°). */
  function arcSliceD(angleFrom: number, angleTo: number): string {
    const a = pt(angleFrom);
    const b = pt(angleTo);
    const sweep = angleTo - angleFrom;
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
    return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
  }

  const P0 = pt(135);
  const P1 = pt(45);
  const ARC_D = `M ${P0.x.toFixed(2)} ${P0.y.toFixed(2)} A ${R} ${R} 0 1 1 ${P1.x.toFixed(2)} ${P1.y.toFixed(2)}`;

  const ARC_LEN = (270 / 360) * (2 * Math.PI * R);
  const pct = score == null ? 0 : Math.min(100, Math.max(0, score)) / 100;
  const filled = pct * ARC_LEN;
  const rest = Math.max(0.001, ARC_LEN - filled);

  const display = score == null ? "—" : String(score);
  const fillStroke = ringStroke ?? (zoneTrack ? zoneStrokeForScore(score) : colors.cyan);
  const labelText = scoreLabel === undefined ? "OVERALL SCORE" : scoreLabel;

  return (
    <View style={{ width: colW, alignItems: "center" }}>
      <View style={{ width: W, height: H, position: "relative" }}>
        <View style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {zoneTrack ? (
              <>
                <Path d={arcSliceD(135, 243)} stroke={ZONE_RED} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(243, 324)} stroke={ZONE_AMBER} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(324, 405)} stroke={ZONE_GREEN} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
              </>
            ) : (
              <Path d={ARC_D} stroke={RING_TRACK} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
            )}
            <Path
              d={ARC_D}
              stroke={fillStroke}
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${filled} ${rest + ARC_LEN}`}
            />
          </Svg>
        </View>

        {variant !== "hero" && labelText !== null && labelText.length > 0 ? (
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
              {labelText}
            </Text>
          </View>
        ) : null}

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
