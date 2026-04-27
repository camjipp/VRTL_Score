import { Text, View } from "@react-pdf/renderer";
import type { ReactElement, ReactNode } from "react";
import { PdfInnerPage } from "../components/PdfInnerPage";
import { clipPdfText } from "../editorial/pdfNarrative";
import { formatEvidenceLogPillLabel } from "@/lib/reports/formatEvidenceFieldDisplay";
import type { ReportData, VulnerableExcerptParts } from "../types";
import {
  findStrengthPreview,
  findVulnerablePreview,
  normalizeVulnerableExcerptParts,
} from "./aiEvidencePick";
import { LOCKED_PAGE_HEADER } from "./layoutConstants";
import { LD } from "./lockedDesignTokens";
import { LockedNarrativeStack } from "./LockedNarrativeStack";
import { lockedStyles } from "./lockedDocumentStyles";
import { narrativeEvidence } from "./pageNarratives";

type KvPair = { key: string; val: string };

function brandName(data: ReportData): string {
  const n = data.clientName?.trim();
  return n && n.length > 0 ? n : "Your brand";
}

/** Display-time cleanup for notes that still say “assistants” (legacy HTML strings). */
function sanitizeEvidencePageCopy(s: string): string {
  let t = String(s).replace(/\s+/g, " ").trim();
  t = t.replace(/\bthird-party proof assistants can retrieve\b/gi, "third-party proof AI can retrieve");
  t = t.replace(/\bproof assistants can retrieve\b/gi, "proof AI can retrieve");
  t = t.replace(/\bassistants can retrieve\b/gi, "AI can retrieve");
  t = t.replace(/\bassistants can cite\b/gi, "AI answers can cite");
  t = t.replace(/\bassistants include\b/gi, "AI answers include");
  t = t.replace(/\bassistants\b/gi, "AI systems");
  t = t.replace(/\bassistant's\b/gi, "the AI's");
  t = t.replace(/\bassistant\b/gi, "AI");
  return clipPdfText(t);
}

function looksLikeStructuredBlob(s: string): boolean {
  const t = s.trim();
  return t.startsWith("{") || t.startsWith("[") || /"\w+"\s*:/.test(t);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Many exports join `key: value` fields with ". " on a single line. Without newlines,
 * the kv parser treats the whole blob as one value — normalize before splitting.
 */
function normalizeEvidenceSnippetLines(raw: string): string {
  const t = raw.trim();
  if (!t || /\r?\n/.test(t)) return t;
  return t.replace(/\.(\s+)(?=[A-Za-z][^\n:]{0,56}:)/g, ".\n");
}

function splitMetadataAndProse(raw: string): { pairs: KvPair[]; prose: string } | null {
  const normalized = normalizeEvidenceSnippetLines(raw);
  const lines = normalized.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const pairs: KvPair[] = [];
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i]!;
    const idx = line.indexOf(":");
    if (idx <= 0 || idx >= line.length - 1) break;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key.length > 52 || key.split(/\s+/).length > 8) break;
    pairs.push({ key, val });
  }
  if (pairs.length === 0) return null;
  const keys = pairs.map((p) => p.key.toLowerCase()).join(" | ");
  if (!/(client|competitor|recommend|mention|citation|source|snippet|feature|position|strength)/i.test(keys)) {
    return null;
  }
  const prose = lines.slice(i).join("\n").trim();
  return { pairs, prose };
}

/** Long prose fields belong in the excerpt block, not a dense table cell. */
function partitionEvidencePairs(pairs: readonly KvPair[]): { table: KvPair[]; excerpt: string } {
  const table: KvPair[] = [];
  const excerpts: string[] = [];
  for (const p of pairs) {
    const k = p.key.trim().toLowerCase();
    if (/^(evidence\s+snippet|snippet|response\s*excerpt|answer\s*excerpt)$/.test(k)) {
      if (p.val.trim()) excerpts.push(p.val.trim());
    } else {
      table.push(p);
    }
  }
  return { table, excerpt: excerpts.join("\n\n").trim() };
}

function EvidenceMetaTable({ pairs }: { pairs: readonly KvPair[] }): ReactElement {
  return (
    <View style={lockedStyles.ev_metaTable} wrap={false}>
      {pairs.map((p, idx) => {
        const last = idx === pairs.length - 1;
        const row = last ? lockedStyles.ev_metaTrLast : lockedStyles.ev_metaTr;
        return (
          <View key={`${p.key}-${idx}`} style={row} wrap={false}>
            <Text style={lockedStyles.ev_metaKey}>{clipPdfText(p.key, 44)}</Text>
            <Text style={lockedStyles.ev_metaVal}>{clipPdfText(p.val, 320)}</Text>
          </View>
        );
      })}
    </View>
  );
}

function HighlightedExcerpt({ text, brand }: { text: string; brand: string }): ReactElement {
  const b = brand.trim();
  if (!b || !text.trim()) {
    return <Text style={lockedStyles.ev_responseExcerpt}>{text}</Text>;
  }
  let parts: string[];
  try {
    parts = text.split(new RegExp(`(${escapeRegExp(b)})`, "gi"));
  } catch {
    return <Text style={lockedStyles.ev_responseExcerpt}>{text}</Text>;
  }
  const nodes: ReactNode[] = parts.map((part, i) => {
    if (part.toLowerCase() === b.toLowerCase()) {
      return (
        <Text key={i} style={lockedStyles.ev_brandHit}>
          {part}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
  return <Text style={lockedStyles.ev_responseExcerpt}>{nodes}</Text>;
}

function strengthBody(data: ReportData): string {
  const s = findStrengthPreview(data.evidencePreview);
  if (!s?.snippet?.trim()) return clipPdfText("No strength excerpt in this export.");
  const raw = String(s.snippet).trim();
  if (looksLikeStructuredBlob(raw)) {
    return clipPdfText(
      `In this answer, ${brandName(data)} is positioned as a brand this AI is willing to recommend.`,
    );
  }
  return clipPdfText(raw);
}

function competitorBulletsFromLine(namesLine: string): string[] {
  const t = namesLine.replace(/\s+/g, " ").trim();
  if (!t) return [];
  return t
    .split(/\s*,\s*|\s*;\s*|\s+and\s+/i)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
}

function vulnerableBlockFromParts(parts: VulnerableExcerptParts): ReactElement {
  const lead = sanitizeEvidencePageCopy(clipPdfText(parts.summary.replace(/\s+/g, " ").trim()));
  const bullets = competitorBulletsFromLine(parts.competitorsLine);
  const impact = parts.implication.trim()
    ? sanitizeEvidencePageCopy(clipPdfText(parts.implication.replace(/\s+/g, " ").trim()))
    : "";
  return (
    <View style={lockedStyles.ev_quote}>
      <Text style={lockedStyles.ev_quoteLead}>{lead}</Text>
      {bullets.length > 0 ? (
        <>
          <Text style={lockedStyles.ev_listIntro}>Instead, AI recommended:</Text>
          {bullets.map((b, i) => (
            <Text key={i} style={lockedStyles.ev_bullet}>
              {`• ${clipPdfText(b)}`}
            </Text>
          ))}
        </>
      ) : null}
      {impact ? <Text style={lockedStyles.ev_quoteImpact}>{impact}</Text> : null}
    </View>
  );
}

function StrengthMainContent({
  data,
  excerpt,
}: {
  data: ReportData;
  excerpt: string;
}): ReactElement {
  const s = findStrengthPreview(data.evidencePreview);
  const raw = s?.snippet?.trim() ? String(s.snippet).trim() : "";
  // Prefer parsing whichever source has kv-style metadata first.
  const source = excerpt || raw;
  const split = source ? splitMetadataAndProse(source) : null;
  if (split) {
    const { table, excerpt: snippetExcerpt } = partitionEvidencePairs(split.pairs);
    const proseMerged = [snippetExcerpt, split.prose].filter(Boolean).join("\n\n").trim();
    return (
      <>
        {table.length > 0 ? <EvidenceMetaTable pairs={table} /> : null}
        {proseMerged ? (
          <View style={lockedStyles.ev_excerptShell} wrap={false}>
            {snippetExcerpt ? <Text style={lockedStyles.ev_excerptKicker}>Evidence excerpt</Text> : null}
            <HighlightedExcerpt text={clipPdfText(proseMerged, 720)} brand={brandName(data)} />
          </View>
        ) : null}
      </>
    );
  }
  if (excerpt) {
    return (
      <View style={lockedStyles.ev_excerptShell} wrap={false}>
        <HighlightedExcerpt text={excerpt} brand={brandName(data)} />
      </View>
    );
  }
  return (
    <View style={lockedStyles.ev_quote} wrap={false}>
      <Text style={lockedStyles.ev_quoteText}>{sanitizeEvidencePageCopy(strengthBody(data))}</Text>
    </View>
  );
}

function VulnerabilityMainContent({
  data,
  vulnParts,
  vulnExcerpt,
  vulnerableQuoteFallback,
}: {
  data: ReportData;
  vulnParts: VulnerableExcerptParts | null;
  vulnExcerpt: string;
  vulnerableQuoteFallback: ReactElement;
}): ReactElement {
  if (vulnParts) return vulnerableQuoteFallback;
  if (vulnExcerpt) {
    return (
      <View style={lockedStyles.ev_excerptShell} wrap={false}>
        <HighlightedExcerpt text={vulnExcerpt} brand={brandName(data)} />
      </View>
    );
  }
  return vulnerableQuoteFallback;
}

function PromptRail({ tone, prompt }: { tone: "strong" | "risk"; prompt: string }): ReactElement {
  const rail =
    tone === "strong" ? lockedStyles.ev_promptRailStrong : lockedStyles.ev_promptRailRisk;
  return (
    <View style={[lockedStyles.ev_promptRail, rail]} wrap={false}>
      <Text style={lockedStyles.ev_promptKicker}>Prompt</Text>
      {prompt ? (
        <View style={[lockedStyles.ev_promptShell, { marginBottom: 0 }]} wrap={false}>
          <Text style={lockedStyles.ev_promptBody}>{`"${prompt}"`}</Text>
        </View>
      ) : (
        <Text style={lockedStyles.ev_glanceModel}>
          {clipPdfText("No prompt line was captured for this row in the export.")}
        </Text>
      )}
    </View>
  );
}

export function PageAiEvidence({ data }: { data: ReportData }): ReactElement {
  const s = findStrengthPreview(data.evidencePreview);
  const v = findVulnerablePreview(data.evidencePreview);
  const vulnParts = normalizeVulnerableExcerptParts(v);
  const strengthHint = s ? clipPdfText(formatEvidenceLogPillLabel(String(s.label)), 80) : "";
  const vulnHint = v ? clipPdfText(formatEvidenceLogPillLabel(String(v.label)), 80) : "";

  const strengthNote =
    s?.note?.trim() && !looksLikeStructuredBlob(String(s.note))
      ? sanitizeEvidencePageCopy(clipPdfText(String(s.note)))
      : "";

  let vulnerableQuote: ReactElement;
  if (vulnParts) {
    vulnerableQuote = vulnerableBlockFromParts(vulnParts);
  } else {
    const raw = v?.snippet?.trim() ? String(v.snippet) : "";
    const body = raw
      ? looksLikeStructuredBlob(raw)
        ? clipPdfText(
            `${brandName(data)} was not mentioned in this response. The AI recommended other brands instead.`,
          )
        : clipPdfText(raw)
      : clipPdfText("No exposure excerpt in this export.");
    vulnerableQuote = (
      <View style={lockedStyles.ev_quote} wrap={false}>
        <Text style={lockedStyles.ev_quoteLead}>{sanitizeEvidencePageCopy(body)}</Text>
      </View>
    );
  }

  const vulnNote =
    v?.note?.trim() && !looksLikeStructuredBlob(String(v.note))
      ? sanitizeEvidencePageCopy(clipPdfText(String(v.note)))
      : "";
  const slice = narrativeEvidence(data);

  const strengthPrompt = s?.prompt?.trim() ? clipPdfText(String(s.prompt), 260) : "";
  const strengthExcerpt =
    s?.responseExcerpt?.trim() && !looksLikeStructuredBlob(String(s.responseExcerpt))
      ? clipPdfText(String(s.responseExcerpt), 460)
      : "";
  const vulnPrompt = v?.prompt?.trim() ? clipPdfText(String(v.prompt), 260) : "";
  const vulnExcerpt =
    v?.responseExcerpt?.trim() && !looksLikeStructuredBlob(String(v.responseExcerpt))
      ? clipPdfText(String(v.responseExcerpt), 460)
      : "";

  const strengthModel = s?.model?.trim() ? clipPdfText(s.model, 40) : "";
  const vulnModel = v?.model?.trim() ? clipPdfText(v.model, 40) : "";

  const strengthVerdict = clipPdfText(
    "You are included in this answer with a favorable recommendation signal on this prompt shape.",
    240,
  );
  const exposureVerdict = clipPdfText(
    "You are omitted in this answer—other brands occupy the recommendation slot on the same query shape.",
    260,
  );

  return (
    <PdfInnerPage title={LOCKED_PAGE_HEADER[6]!}>
      <LockedNarrativeStack slice={slice} variant="compact" include={["headline"]} />

      <View style={lockedStyles.perf_section} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Proof at a glance</Text>
        <Text style={[lockedStyles.ev_glanceModel, { marginBottom: LD.space.sm, maxWidth: "100%" }]}>
          {clipPdfText(
            "Two prompt runs from the same export: one where you win recommendation share, and one where you do not.",
            520,
          )}
        </Text>
        <View style={lockedStyles.ev_glanceRow} wrap={false}>
          <View style={lockedStyles.ev_glanceCellStrong} wrap={false}>
            <Text style={lockedStyles.ev_glanceEyebrow}>Strength</Text>
            <Text style={lockedStyles.ev_glanceVerdict}>{strengthVerdict}</Text>
            {strengthHint ? <Text style={lockedStyles.ev_glanceLog}>{strengthHint}</Text> : null}
            {strengthModel ? (
              <Text style={lockedStyles.ev_glanceModel} wrap={false}>
                {`Model: ${strengthModel}`}
              </Text>
            ) : null}
          </View>
          <View style={lockedStyles.ev_glanceCellRisk} wrap={false}>
            <Text style={lockedStyles.ev_glanceEyebrow}>Exposure</Text>
            <Text style={lockedStyles.ev_glanceVerdict}>{exposureVerdict}</Text>
            {vulnHint ? <Text style={lockedStyles.ev_glanceLog}>{vulnHint}</Text> : null}
            {vulnModel ? (
              <Text style={lockedStyles.ev_glanceModel} wrap={false}>
                {`Model: ${vulnModel}`}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View style={lockedStyles.perf_section} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Strength proof</Text>
        <View style={lockedStyles.ev_proofSplitRow} wrap={false}>
          <PromptRail tone="strong" prompt={strengthPrompt} />
          <View style={lockedStyles.ev_answerRail} wrap={false}>
            <Text style={lockedStyles.ev_responseKicker}>Model output</Text>
            <StrengthMainContent data={data} excerpt={strengthExcerpt} />
            {strengthNote ? <Text style={lockedStyles.ev_note}>{strengthNote}</Text> : null}
          </View>
        </View>
      </View>

      <View style={lockedStyles.perf_section} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Exposure proof</Text>
        <View style={lockedStyles.ev_proofSplitRow} wrap={false}>
          <PromptRail tone="risk" prompt={vulnPrompt} />
          <View style={lockedStyles.ev_answerRail} wrap={false}>
            <Text style={lockedStyles.ev_responseKicker}>Model output</Text>
            <VulnerabilityMainContent
              data={data}
              vulnParts={vulnParts}
              vulnExcerpt={vulnExcerpt}
              vulnerableQuoteFallback={vulnerableQuote}
            />
            {vulnNote ? <Text style={lockedStyles.ev_note}>{vulnNote}</Text> : null}
          </View>
        </View>
      </View>

      <View style={lockedStyles.perf_sectionDiagnosis} wrap={false}>
        <Text style={lockedStyles.perf_sectionEyebrow}>Implication</Text>
        <View style={lockedStyles.perf_diagWrap} wrap={false}>
          <View style={lockedStyles.perf_diagNarrativeWrap} wrap={false}>
            <Text style={lockedStyles.perf_diagNarrative}>{slice.implication}</Text>
          </View>
        </View>
      </View>
    </PdfInnerPage>
  );
}
