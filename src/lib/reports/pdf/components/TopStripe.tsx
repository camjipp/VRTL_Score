import { View } from "@react-pdf/renderer";
import { PAGE } from "../theme";

/** 3pt full-width stripe: stepped cyan → violet (no SVG gradient — PDF-safe). */
export function TopStripe() {
  const segments = 40;
  return (
    <View style={{ flexDirection: "row", width: PAGE.width, height: 3 }}>
      {Array.from({ length: segments }, (_, i) => {
        const t = i / (segments - 1);
        const r = Math.round(14 + (124 - 14) * t);
        const g = Math.round(165 + (58 - 165) * t);
        const b = Math.round(233 + (237 - 233) * t);
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              backgroundColor: `rgb(${r},${g},${b})`,
            }}
          />
        );
      })}
    </View>
  );
}
