import { Text } from "@react-pdf/renderer";
import { baseStyles } from "../theme";

export function ChapterTitle({ title }: { title: string }) {
  return <Text style={baseStyles.chapterTitle}>{title}</Text>;
}
