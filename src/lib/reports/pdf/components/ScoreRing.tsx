import { Path, Svg, Text, View } from "@react-pdf/renderer";
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
  /** Performance snapshot — compact arc, large integer focal */
  performance: {
    W: 184,
    H: 118,
    R: 52,
    stroke: 12,
    colW: 192,
    scoreFont: 46,
    fracFont: 8,
    labelFont: 0,
    labelBottom: 0,
    nudgeY: -4,
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
  /**
   * `vivid` — legacy cyan / multi-zone amber (when `zoneTrack`).
   * `neutral` — gray track, progress red (under 40) / near-black (40–69) / green (70+); no orange.
   */
  palette?: "vivid" | "neutral";
  /** When false, only the integer score is shown (no `/100` line). */
  showFraction?: boolean;
  /**
   * When true (intended with `variant="performance"` + neutral palette), draws three
   * track segments for 0–50 / 50–70 / 70–100 and places Weak / Contested / Strong labels
   * near the arc.
   */
  arcZoneLabels?: boolean;
  /** Short radial tick on the arc at the current score (0–100). */
  arcScoreTick?: boolean;
};

const NEUTRAL_STRONG = "#15803d";

function zoneStrokeForScore(s: number | null): string {
  if (s == null || Number.isNaN(s)) return colors.cyan;
  if (s < 40) return ZONE_RED;
  if (s < 70) return ZONE_AMBER;
  return ZONE_GREEN;
}

function neutralProgressStroke(s: number | null): string {
  if (s == null || Number.isNaN(s)) return colors.ink2;
  if (s < 40) return ZONE_RED;
  if (s < 70) return colors.ink;
  return NEUTRAL_STRONG;
}

const ZONE_NEUTRAL_LOW = "#E5E7EB";
const ZONE_NEUTRAL_MID = "#D1D5DB";
const ZONE_NEUTRAL_HIGH = "#CBD5E1";

/** Score 0–100 → angle (deg) on the 270° horseshoe (135° … 405°). */
function angleForScore100(s: number): number {
  const clamped = Math.min(100, Math.max(0, s));
  return 135 + (clamped / 100) * 270;
}

export function ScoreRing({
  score,
  variant = "default",
  ringStroke,
  scoreLabel,
  zoneTrack,
  palette = "vivid",
  showFraction = true,
  arcZoneLabels = false,
  arcScoreTick = false,
}: Props) {
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
  const fillStroke =
    ringStroke ??
    (palette === "neutral"
      ? neutralProgressStroke(score)
      : zoneTrack
        ? zoneStrokeForScore(score)
        : colors.cyan);
  const labelText = scoreLabel === undefined ? "OVERALL SCORE" : scoreLabel;
  const zoneSlicesVivid = zoneTrack && palette === "vivid";
  const zoneSlicesNeutral = zoneTrack && palette === "neutral";
  const perfWcsTrack = arcZoneLabels && palette === "neutral";

  const labelR = R + STROKE * 0.5 + 10;
  const zoneLabelStyle = {
    position: "absolute" as const,
    fontSize: 8.5,
    fontFamily: fonts.sansBold,
    color: colors.ink2,
    width: 56,
    textAlign: "center" as const,
  };

  function labelAnchor(angleDeg: number): { left: number; top: number } {
    const t = angleDeg * DEG;
    const x = CX + labelR * Math.cos(t);
    const y = CY + labelR * Math.sin(t);
    return { left: x - 28, top: y - 5 };
  }

  const tickAngle = score == null || Number.isNaN(score) ? null : angleForScore100(score);
  let tickLineD: string | null = null;
  if (tickAngle != null && arcScoreTick) {
    const t = tickAngle * DEG;
    const x1 = CX + (R - 2) * Math.cos(t);
    const y1 = CY + (R - 2) * Math.sin(t);
    const x2 = CX + (R + STROKE + 8) * Math.cos(t);
    const y2 = CY + (R + STROKE + 8) * Math.sin(t);
    tickLineD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  }

  return (
    <View style={{ width: colW, alignItems: "center" }}>
      <View style={{ width: W, height: H, position: "relative" }}>
        <View style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {zoneSlicesVivid ? (
              <>
                <Path d={arcSliceD(135, 243)} stroke={ZONE_RED} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(243, 324)} stroke={ZONE_AMBER} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(324, 405)} stroke={ZONE_GREEN} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
              </>
            ) : zoneSlicesNeutral ? (
              <>
                <Path d={arcSliceD(135, 243)} stroke={ZONE_NEUTRAL_LOW} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(243, 324)} stroke={ZONE_NEUTRAL_MID} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(324, 405)} stroke={ZONE_NEUTRAL_HIGH} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
              </>
            ) : perfWcsTrack ? (
              <>
                <Path d={arcSliceD(135, 270)} stroke={ZONE_NEUTRAL_LOW} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(270, 324)} stroke={ZONE_NEUTRAL_MID} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
                <Path d={arcSliceD(324, 405)} stroke={ZONE_NEUTRAL_HIGH} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
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
            {tickLineD ? (
              <Path d={tickLineD} stroke={colors.ink} strokeWidth={3} fill="none" strokeLinecap="butt" />
            ) : null}
          </Svg>
        </View>

        {variant !== "hero" && variant !== "performance" && labelText !== null && labelText.length > 0 ? (
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

        {arcZoneLabels ? (
          <>
            <Text style={[zoneLabelStyle, labelAnchor(202.5)]}>Weak</Text>
            <Text style={[zoneLabelStyle, labelAnchor(297)]}>Contested</Text>
            <Text style={[zoneLabelStyle, labelAnchor(364.5)]}>Strong</Text>
          </>
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
            {showFraction ? (
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
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}
