import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import { lockedStyles } from "./lockedDocumentStyles";
import type { NarrativeSlice } from "./pageNarratives";

const center = StyleSheet.create({ c: { textAlign: "center" as const } });

export type NarrativePart = "headline" | "interpretation" | "implication" | "action" | "inaction";

type Props = {
  slice: NarrativeSlice;
  variant?: "default" | "compact" | "cover";
  /** When `variant` is `compact`, override default max height (e.g. Data Summary band). */
  compactMaxHeight?: number;
  /** Omit parts to place primary content between headline and interpretation. Default: all. */
  include?: readonly NarrativePart[];
  /** `afterPrimary`: rule above block (interpretation / implication / action). `plain`: no outer rule (wrap in parent). */
  stackRole?: "top" | "afterPrimary" | "plain";
};

const ALL: readonly NarrativePart[] = ["headline", "interpretation", "implication", "action", "inaction"];

export function LockedNarrativeStack({
  slice,
  variant = "default",
  compactMaxHeight,
  include = ALL,
  stackRole = "top",
}: Props): ReactElement {
  const want = (p: NarrativePart) => include.includes(p);
  const stackStyle =
    variant === "compact"
      ? compactMaxHeight != null
        ? [lockedStyles.nar_stackCompact, { maxHeight: compactMaxHeight }]
        : lockedStyles.nar_stackCompact
      : variant === "cover"
        ? lockedStyles.nar_stackCover
        : stackRole === "afterPrimary"
          ? lockedStyles.nar_stackAfter
          : stackRole === "plain"
            ? lockedStyles.nar_stackPlain
            : lockedStyles.nar_stack;
  const h =
    variant === "compact" ? lockedStyles.nar_headlineCompact : lockedStyles.nar_headline;
  const i =
    variant === "compact" ? lockedStyles.nar_interpretationCompact : lockedStyles.nar_interpretation;
  const m =
    variant === "compact" ? lockedStyles.nar_implicationCompact : lockedStyles.nar_implication;
  const a = variant === "compact" ? lockedStyles.nar_actionCompact : lockedStyles.nar_action;
  const cx = variant === "cover" ? center.c : undefined;
  return (
    <View style={stackStyle} wrap={false}>
      {want("headline") ? <Text style={cx ? [h, cx] : h}>{slice.headline}</Text> : null}
      {want("interpretation") ? <Text style={cx ? [i, cx] : i}>{slice.interpretation}</Text> : null}
      {want("implication") ? <Text style={cx ? [m, cx] : m}>{slice.implication}</Text> : null}
      {want("action") && slice.action ? <Text style={cx ? [a, cx] : a}>{slice.action}</Text> : null}
      {want("inaction") && slice.inaction ? (
        <Text style={cx ? [lockedStyles.nar_inaction, cx] : lockedStyles.nar_inaction}>{slice.inaction}</Text>
      ) : null}
    </View>
  );
}
