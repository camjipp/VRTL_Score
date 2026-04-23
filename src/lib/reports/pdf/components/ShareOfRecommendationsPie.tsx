import { Path, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ShareSlice } from "../locked/competitiveSharePie";
import { fillForShareSlice, pieSlicePath } from "../locked/competitiveSharePie";
import { LD } from "../locked/lockedDesignTokens";

const W = 228;
const H = 188;
const CX = W / 2;
const CY = H / 2 - 2;
const R = 76;
const SLICE_STROKE = LD.color.paper;

type Props = {
  slices: readonly ShareSlice[];
};

export function ShareOfRecommendationsPie({ slices }: Props): ReactElement {
  let cursor = -90;
  const paths: ReactElement[] = [];
  for (let i = 0; i < slices.length; i++) {
    const s = slices[i]!;
    const sweep = (360 * s.pct) / 100;
    if (sweep <= 0.01) continue;
    const d = pieSlicePath(CX, CY, R, cursor, sweep);
    cursor += sweep;
    if (!d) continue;
    const fill = fillForShareSlice(s, slices);
    paths.push(
      <Path key={i} d={d} fill={fill} stroke={SLICE_STROKE} strokeWidth={0.75} />,
    );
  }

  const legend = [...slices].sort((a, b) => b.pct - a.pct);

  return (
    <View style={{ width: W }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {paths}
      </Svg>
      <View style={{ marginTop: 6 }}>
        {legend.map((s, i) => {
          const fill = fillForShareSlice(s, slices);
          return (
            <View
              key={`${s.row.name}-${s.row.rank}-${i}`}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 3,
              }}
              wrap={false}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: fill,
                  marginRight: 6,
                }}
              />
              <Text
                style={{
                  fontSize: LD.size.caption,
                  fontFamily: LD.font.sans,
                  color: LD.color.ink2,
                  flex: 1,
                }}
              >
                {clipPdfText(s.row.name, 36)}
              </Text>
              <Text
                style={{
                  fontSize: LD.size.caption,
                  fontFamily: LD.font.sansBold,
                  color: LD.color.ink,
                }}
              >
                {`${s.pct}%`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
