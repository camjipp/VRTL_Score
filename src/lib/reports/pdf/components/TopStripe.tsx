import { Defs, LinearGradient, Rect, Stop, Svg, View } from "@react-pdf/renderer";
import { PAGE } from "../theme";

/** Full-bleed 4pt cyan → violet gradient stripe (612pt wide). Unique id avoids SVG defs collisions. */
export function TopStripe({ gradientId }: { gradientId: string }) {
  const w = PAGE.width;
  const gid = gradientId.replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <View style={{ width: w, height: 4 }}>
      <Svg width={w} height={4} viewBox={`0 0 ${w} 4`}>
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#0EA5E9" />
            <Stop offset="1" stopColor="#7C3AED" />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={w} height={4} fill={`url(#${gid})`} />
      </Svg>
    </View>
  );
}
