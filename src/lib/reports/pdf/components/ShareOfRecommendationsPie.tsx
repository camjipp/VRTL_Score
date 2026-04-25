import { Path, Svg, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { ShareSlice } from "../locked/competitiveSharePie";
import {
  fillForShareSlice,
  legendSlicesOrdered,
  pieSlicePath,
} from "../locked/competitiveSharePie";
import { lockedStyles } from "../locked/lockedDocumentStyles";

/** Increased scale (~12%) for stronger visual weight. */
const W = 286;
const H = 238;
const CX = W / 2;
const CY = H / 2;
const R = 98;

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
  const client = ordered.find((s) => s.row.isClient) ?? slices.find((s) => s.row.isClient);

  return (
    <View>
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
          <View style={lockedStyles.comp_pieCenterLabel} wrap={false}>
            <Text style={lockedStyles.comp_pieCenterPct}>{`${client?.pct ?? 0}%`}</Text>
            <Text style={lockedStyles.comp_pieCenterBrand}>{client?.row.name ?? "Stanley"}</Text>
          </View>
        </View>
        <View style={lockedStyles.comp_pieLegendWrap}>
          {legendRows.map((s, i) => {
            const fill = fillForShareSlice(s, slices);
            return (
              <View key={`${s.row.name}-${s.row.rank}-${i}`} style={lockedStyles.comp_pieLegendRow} wrap={false}>
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
