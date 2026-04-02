import { View } from "@react-pdf/renderer";
import { PAGE, colors } from "../theme";

/** Thin neutral rule at page top (no gradient). */
export function TopStripe() {
  return (
    <View
      style={{
        width: PAGE.width,
        height: 1,
        backgroundColor: colors.rule,
      }}
    />
  );
}
