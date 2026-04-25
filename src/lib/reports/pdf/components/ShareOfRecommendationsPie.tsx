import { Path, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ShareSlice } from "../locked/competitiveSharePie";
import {
  fillForShareSlice,
  legendSlicesOrdered,
  pieSlicePath,
} from "../locked/competitiveSharePie";
import { lockedStyles } from "../locked/lockedDocumentStyles";

/**
 * Pie + legend must fit the left column (~half of content width minus padding).
 * US Letter content ≈ 532pt wide → ~260pt per half column; keep chart+gap+legend under that.
 */
const W = 142;
const H = 142;
const CX = W / 2;
const CY = H / 2;
const R = 64;

type Props = {
  slices: readonly ShareSlice[];
};

const MAX_VISUAL_SLICES = 4;

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

/** Draw non-client slices first so the client wedge reads on top with its outline. */
function sortDrawsForPaintOrder(draws: readonly SliceDraw[]): SliceDraw[] {
  return draws.slice().sort((a, b) => {
    if (a.slice.row.isClient === b.slice.row.isClient) return 0;
    return a.slice.row.isClient ? 1 : -1;
  });
}

export function ShareOfRecommendationsPie({ slices }: Props): ReactElement {
  const ordered = legendSlicesOrdered(slices).slice(0, MAX_VISUAL_SLICES);
  const draws = buildSliceDraws(ordered);
  const paintOrder = sortDrawsForPaintOrder(draws);
  const legendRows = ordered;

  return (
    <View style={lockedStyles.comp_pieBlockRoot} wrap={false}>
      <View style={lockedStyles.comp_pieChartLegendRow} wrap={false}>
        <View style={lockedStyles.comp_pieChartWrap} wrap={false}>
          <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            {paintOrder.map((d, i) => {
              const dPath = pieSlicePath(CX, CY, R, d.startDeg, d.sweepDeg);
              if (!dPath) return null;
              const fill = fillForShareSlice(d.slice, ordered);
              return <Path key={`p-${d.slice.row.name}-${d.slice.row.rank}-${i}`} d={dPath} fill={fill} />;
            })}
          </Svg>
        </View>
        <View style={lockedStyles.comp_pieLegendWrap}>
          {legendRows.map((s, i) => {
            const fill = fillForShareSlice(s, ordered);
            const isLast = i === legendRows.length - 1;
            return (
              <View
                key={`${s.row.name}-${s.row.rank}-${i}`}
                style={isLast ? [lockedStyles.comp_pieLegendRow, lockedStyles.comp_pieLegendRowLast] : lockedStyles.comp_pieLegendRow}
                wrap={false}
              >
                <View style={[lockedStyles.comp_pieLegendSwatch, { backgroundColor: fill }]} />
                <Text style={lockedStyles.comp_pieLegendText}>{`${s.row.name} — ${s.pct}%`}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
