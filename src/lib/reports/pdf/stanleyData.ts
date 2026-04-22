import type { ReportData } from "./types";
import { getDefaultRecommendedNextStepsBody, PDF_METHODOLOGY_TEXT } from "@/lib/reports/pdfTheme";

/** Fixture for PDF preview and health checks (sample client data). */
export const stanleyData: ReportData = {
  clientName: "STANLEY",
  domain: "stanley1913.com",
  date: "April 1, 2026",
  overallScore: 52,
  rank: 1,
  rankTotal: 5,
  status: "Contested",
  mentionRate: 60,
  topPosition: 60,
  authorityScore: 0,
  bottomLine:
    "You lead recommendation share in this set (60% of answers), but 40% still omit you—each is lost share. Owala ties your mentions; Thermo Flask and hydro flask are one to two mentions back. Any of them can take first pick after one credible proof sprint.",
  tensionNote: undefined,
  competitors: [
    { name: "Stanley", mentions: 18, rate: 60, rank: 1, isClient: true },
    { name: "Owala", mentions: 18, rate: 60, rank: 2 },
    { name: "Thermo Flask", mentions: 17, rate: 57, rank: 3 },
    { name: "hydro flask", mentions: 16, rate: 53, rank: 4 },
    { name: "Hydro Flask", mentions: 2, rate: 7, rank: 5 },
  ],
  modelScores: [
    {
      name: "OpenAI",
      score: 90,
      deltaVsAvg: 38,
      insights: [
        "Strongest surface: this is the pattern to copy onto Gemini and Anthropic before competitors narrow the gap.",
        "Refresh cited facts on money URLs so rivals cannot erode this path on the next model refresh.",
      ],
    },
    {
      name: "Gemini",
      score: 39,
      deltaVsAvg: -13,
      insights: [
        "Gemini answers often omit Stanley from the short list; share on this path goes to competitors.",
        "Ship cited comparison pages and FAQ blocks for the query shapes Gemini returns.",
      ],
    },
    {
      name: "Anthropic",
      score: 26,
      deltaVsAvg: -26,
      insights: [
        "Anthropic answers frequently drop Stanley from the recommendation set—you read as absent in many category decisions.",
        "Add citation-backed comparisons, schema-aligned FAQs, and retrievable third-party proof.",
      ],
    },
  ],
  alerts: {
    win: {
      title: "OpenAI strength",
      detail: "Score 90. Mirror URL structure, schema, and citation patterns onto Gemini and Anthropic first.",
    },
    risk: {
      title: "Fragile #1",
      detail: "Owala ties at 18 mentions; the next proof sprint can flip who gets named first.",
    },
    priority: {
      title: "Zero citation anchor",
      detail: "0% authority. Without third-party proof, wins stay easy to contest.",
    },
  },
  recommendations: [
    {
      priority: "HIGH",
      title: "Close the 64-point model spread",
      insight: "OpenAI 90 vs. Anthropic 26.",
      explanation:
        "Different assistants recommend different winners. You do not control the short list on every path.",
      action:
        "Ship 3–5 cited “vs.” pages; add FAQ blocks for Gemini and Anthropic intents; align Product/Organization schema on those URLs.",
      expectedOutcome: "+10–15 pts on trailing models in 90 days—visible on the next snapshot.",
    },
    {
      priority: "HIGH",
      title: "Win first position, not just inclusion",
      insight: "60% mention and 60% top-position.",
      explanation: "Mid-list still loses to whoever the assistant names first.",
      action:
        "Tighten claims and differentiators on money URLs; publish FAQs that match how assistants paraphrase questions.",
      expectedOutcome: "Higher top-position rate on priority intents in 60–90 days.",
    },
    {
      priority: "MEDIUM",
      title: "Break the tie with Owala",
      insight: "18 mentions each—no cushion.",
      explanation: "The next credible asset from Owala can swap first pick.",
      action: "Refresh hero SKUs with proof; add two net-new trusted mentions assistants can cite.",
      expectedOutcome: "3–5+ mention cushion on head-to-head queries within a quarter.",
    },
    {
      priority: "LOW",
      title: "Consolidate Hydro Flask entity variants",
      insight: "Split rows dilute the signal.",
      explanation: "Duplicate entities fragment how models aggregate your equity.",
      action: "Align canonical naming, sameAs, and product schema; consolidate duplicate listings.",
      expectedOutcome: "Cleaner single-entity signal in aggregated answers over time.",
    },
  ],
  evidencePreview: [
    {
      label: "STRENGTH",
      snippet:
        "For insulated drinkware, Stanley and Owala are frequently cited for durability and retail availability…",
      note: "Active recommendation share. Refresh proof before competitors erode the slot.",
    },
    {
      label: "VULNERABLE",
      snippet:
        "Some assistants aggregate hydro flask variants inconsistently, which splits brand equity across listings…",
      note: "Close it with cited comparisons, FAQs for these query shapes, and retrievable third-party proof.",
    },
  ],
  executionPhases: [
    {
      phase: "Week 1 to 2",
      text: "Audit content, schema, entities, and citation gaps; benchmark rival proof so priorities are explicit.",
    },
    {
      phase: "Week 2 to 3",
      text: "Rebuild Anthropic and Gemini first: comparison pages, FAQs, and schema matched to how those models retrieve.",
    },
    {
      phase: "Week 3 to 4",
      text: "Expand authority—reviews, trade press, trusted mentions assistants can cite; refresh OpenAI proof.",
    },
    {
      phase: "Week 4+",
      text: "Re-measure; read deltas by model; lock the next 30-day sprint.",
    },
  ],
  signalSummary: [
    {
      signal: "Strength (top + strong rec.)",
      count: 18,
      rate: "60%",
      status: "positive",
      actionNote: "Hold position",
    },
    {
      signal: "Mentioned (not top)",
      count: 0,
      rate: "0%",
      status: "improvable",
      actionNote: "Win top slot",
    },
    {
      signal: "Vulnerable (not mentioned)",
      count: 12,
      rate: "40%",
      status: "gap",
      actionNote: "Build presence",
    },
    {
      signal: "Authority (citations)",
      count: 0,
      rate: "0%",
      status: "trust",
      actionNote: "Earn citations",
    },
  ],
  competitiveTable: [
    { brand: "Stanley", mentions: 18, rate: "60%", vsYou: "—", status: "You" },
    { brand: "Owala", mentions: 18, rate: "60%", vsYou: "0", status: "Tied" },
    { brand: "Thermo Flask", mentions: 17, rate: "57%", vsYou: "-1", status: "Behind" },
    { brand: "hydro flask", mentions: 16, rate: "53%", vsYou: "-2", status: "Behind" },
    { brand: "Hydro Flask", mentions: 2, rate: "7%", vsYou: "-16", status: "Behind" },
  ],
  evidenceLog: Array.from({ length: 10 }, (_, i) => ({
    idx: i + 1,
    label: i % 3 === 0 ? "STRENGTH" : i % 3 === 1 ? "OPPORTUNITY" : "COMPETITIVE",
    mentioned: i % 4 === 0 ? "No" : "Yes",
    position: i % 4 === 0 ? "" : i % 2 === 0 ? "top" : "middle",
    strength: i % 3 === 0 ? "strong" : i % 3 === 1 ? "medium" : "weak",
    competitors: String((i % 3) + 1),
    note:
      i % 4 === 0
        ? "Best travel mug for commuting under $40, durable and leak proof."
        : "Which brands do assistants recommend for daily hydration?",
  })),
  methodology: PDF_METHODOLOGY_TEXT,
  meta: {
    responses: 30,
    confidence: "High",
    generated: "April 1, 2026",
  },
  strategicTakeaway:
    "64 points separate OpenAI from Anthropic—buyers see different short lists. Fix weak surfaces with cited comparisons and FAQs before a rival locks the default there.",
  dataSummaryInterpretation:
    "You lead mentions, but Owala ties and others sit one to two back: a contested default, not a lock. 40% of answers omit you; 0% citations means little third-party anchor.",
  recommendedNextSteps: getDefaultRecommendedNextStepsBody("Anthropic"),
  recommendedNextStepsVisible: true,
  agencyName: "Northbridge Digital",
  agencyLogoUrl: null,
};
