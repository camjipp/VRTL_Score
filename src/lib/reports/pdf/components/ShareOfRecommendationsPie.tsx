import { Path, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { clipPdfText } from "../editorial/pdfNarrative";
import type { ShareSlice } from "../locked/competitiveSharePie";
import {
  fillForShareSlice,
  pieSliceLabelPosition,
  pieSlicePath,
  sliceLabelTextColor,
} from "../locked/competitiveSharePie";
import { LD } from "../locked/lockedDesignTokens";
import { fonts } from "../theme";

/** ~12% larger than prior chart for clearer hierarchy. */
const W = 256;
const H = 212;
const CX = W / 2;
const CY = H / 2 - 2;
const R = 87;
const SLICE_STROKE = "#FFFFFF";
const SLICE_STROKE_W = 1.1;
const MIN_SWEEP_DEG_FOR_INLINE = 17;

type Props = {
  slices: readonly ShareSlice[];
};

type SliceDraw = {
  slice: ShareSlice;
  startDeg: number;
  sweepDeg: number;
};

function buildSliceDraws(slices: readonly ShareSlice[]): SliceDraw[] {
  let cursor = -90;
  const out: SliceDraw[] = [];
  for (const slice of slices) {
    const sweepDeg = (360 * slice.pct) / 100;
    if (sweepDeg <= 0.01) continue;
    out.push({ slice, startDeg: cursor, sweepDeg });
    cursor += sweepDeg;
  }
  return out;
}

function inlineLabelText(s: ShareSlice, sweepDeg: number): string {
  const maxName = sweepDeg > 32 ? 22 : sweepDeg > 22 ? 14 : 10;
  return `${clipPdfText(s.row.name, maxName)} — ${s.pct}%`;
}

export function ShareOfRecommendationsPie({ slices }: Props): ReactElement {
  const draws = buildSliceDraws(slices);
  const smallForLegend = draws.filter((d) => d.sweepDeg < MIN_SWEEP_DEG_FOR_INLINE);

  return (
    <View style={{ width: W }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {draws.map((d, i) => {
          const dPath = pieSlicePath(CX, CY, R, d.startDeg, d.sweepDeg);
          if (!dPath) return null;
          const fill = fillForShareSlice(d.slice, slices);
          return (
            <Path
              key={`p-${d.slice.row.name}-${d.slice.row.rank}-${i}`}
              d={dPath}
              fill={fill}
              stroke={SLICE_STROKE}
              strokeWidth={SLICE_STROKE_W}
            />
          );
        })}
        {draws.map((d, i) => {
          if (d.sweepDeg < MIN_SWEEP_DEG_FOR_INLINE) return null;
          const { x, y } = pieSliceLabelPosition(CX, CY, R, d.startDeg, d.sweepDeg);
          const fill = sliceLabelTextColor(d.slice, slices);
          const fs = d.sweepDeg > 34 ? 6.25 : d.sweepDeg > 24 ? 5.75 : 5.25;
          const label = inlineLabelText(d.slice, d.sweepDeg);
          return (
            <Text
              key={`t-${d.slice.row.name}-${d.slice.row.rank}-${i}`}
              x={x}
              y={y + fs * 0.28}
              textAnchor="middle"
              style={{
                fontSize: fs,
                fontFamily: fonts.sansBold,
                fill,
              }}
            >
              {label}
            </Text>
          );
        })}
      </Svg>
      {smallForLegend.length > 0 ? (
        <View style={{ marginTop: 5 }}>
          {smallForLegend.map((d, i) => {
            const fill = fillForShareSlice(d.slice, slices);
            return (
              <View
                key={`sm-${d.slice.row.name}-${i}`}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 2,
                }}
                wrap={false}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    backgroundColor: fill,
                    marginRight: 5,
                    borderWidth: 0.5,
                    borderColor: LD.color.rule,
                  }}
                />
                <Text
                  style={{
                    fontSize: LD.size.micro,
                    fontFamily: LD.font.sans,
                    color: LD.color.ink3,
                  }}
                >
                  {`${clipPdfText(d.slice.row.name, 32)} — ${d.slice.pct}%`}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
