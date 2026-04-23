import { StyleSheet } from "@react-pdf/renderer";
import { fonts } from "../theme";
import { LD } from "./lockedDesignTokens";
import { REPORT_FRAME, REPORT_PAGE_H, REPORT_PAGE_W } from "./layoutConstants";

export const reportFrameStyles = StyleSheet.create({
  page: {
    width: REPORT_PAGE_W,
    height: REPORT_PAGE_H,
    fontFamily: fonts.sans,
    backgroundColor: LD.color.paper,
    color: LD.color.ink,
    position: "relative",
  },
  header: {
    position: "absolute",
    top: REPORT_FRAME.headerTop,
    left: REPORT_FRAME.inset,
    right: REPORT_FRAME.inset,
    height: REPORT_FRAME.headerHeight,
    justifyContent: "center",
    borderBottomWidth: LD.border.hairline,
    borderBottomColor: LD.color.rule,
  },
  headerTitle: {
    fontSize: LD.size.titleSm,
    fontFamily: fonts.sansBold,
    color: LD.color.ink,
    letterSpacing: -0.12,
  },
  content: {
    position: "absolute",
    top: REPORT_FRAME.contentTop,
    left: REPORT_FRAME.inset,
    right: REPORT_FRAME.inset,
    bottom: REPORT_FRAME.contentBottom,
  },
  footer: {
    position: "absolute",
    bottom: REPORT_FRAME.footerBottom,
    left: REPORT_FRAME.inset,
  },
  footerPage: {
    fontSize: LD.size.caption,
    fontFamily: fonts.sans,
    color: LD.color.ink4,
  },
});
