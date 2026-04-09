import type { ReportData } from "./types";
import { PDF_METHODOLOGY_TEXT } from "@/lib/reports/pdfTheme";

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
    "You currently lead AI recommendation share in this set, appearing in 60% of tested assistant answers. That still leaves 40% with no Stanley mention—each one is missed recommendation share when buyers ask for options. Owala ties your mention count; Thermo Flask and hydro flask sit one to two mentions back—close enough that a focused content, entity, and citation sprint from any of them can replace your default first pick without intervention.",
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
        "Strongest surface—this is the pattern to copy onto Gemini and Anthropic before competitors narrow the gap.",
        "Expect rivals to study this path; refresh proof and cited facts proactively.",
      ],
    },
    {
      name: "Gemini",
      score: 39,
      deltaVsAvg: -13,
      insights: [
        "Gemini-backed answers often omit Stanley from the short list—recommendation share on that path is going to competitors.",
        "Ship 3–5 cited comparison pages plus direct-answer FAQ blocks for the query shapes Gemini returns.",
      ],
    },
    {
      name: "Anthropic",
      score: 26,
      deltaVsAvg: -26,
      insights: [
        "On Anthropic-powered answers, Stanley is often absent from the recommendation set—effectively invisible in many category decisions this assistant influences.",
        "Rebuild with citation-backed comparison URLs, schema-aligned FAQs, and third-party proof this model can retrieve.",
      ],
    },
  ],
  alerts: {
    win: {
      title: "OpenAI strength",
      detail: "Score 90—clone URL structure, schema, and citation types onto Gemini and Anthropic first.",
    },
    risk: {
      title: "Fragile #1",
      detail: "Owala ties at 18 mentions; assistants can flip who they recommend first on the next credible proof sprint.",
    },
    priority: {
      title: "Zero citation anchor",
      detail: "0% authority—without third-party proof, wins stay negotiable and easy for rivals to contest.",
    },
  },
  recommendations: [
    {
      priority: "HIGH",
      title: "Close the 64-point model spread",
      insight: "OpenAI scores 90 while Anthropic sits at 26.",
      explanation:
        "Different assistants recommend different winners—buyers do not get one story, and you do not control who wins the short list on each path.",
      action:
        "Ship 3–5 cited “vs.” and category comparison pages; add direct-answer FAQ blocks for the intents Gemini and Anthropic return; align Product/Organization schema and canonical entities on those URLs.",
      expectedOutcome: "Target +10–15 points on trailing models within 90 days, visible as higher mention and top-position share on the next snapshot.",
    },
    {
      priority: "HIGH",
      title: "Win first-position, not just inclusion",
      insight: "Mention rate and top-position rate both read 60%.",
      explanation:
        "When you appear mid-list, high-intent buyers still default to whoever the assistant names first.",
      action:
        "Tighten headline claims and cited differentiators on money URLs; publish schema-aligned FAQs that answer the exact questions assistants paraphrase.",
      expectedOutcome: "Measurable lift in top-position rate on priority intents within 60–90 days.",
    },
    {
      priority: "MEDIUM",
      title: "Break the tie with Owala",
      insight: "Owala matches 18 mentions—zero cushion on the default recommendation.",
      explanation: "Parity means the next credible citation or comparison asset from Owala can swap first pick.",
      action:
        "Refresh hero SKUs with proof points; secure two net-new trusted mentions (reviews, trade press, or category authorities) assistants can cite.",
      expectedOutcome: "Open a 3–5+ mention cushion on head-to-head queries within a quarter.",
    },
    {
      priority: "LOW",
      title: "Consolidate Hydro Flask entity variants",
      insight: "Lower-case and upper-case hydro flask rows split the signal.",
      explanation: "Split entities dilute how models aggregate your equity in category answers.",
      action: "Align canonical naming, sameAs, and product schema sitewide; redirect or consolidate duplicate listings.",
      expectedOutcome: "Cleaner single-entity consolidation in aggregated assistant answers over time.",
    },
  ],
  evidencePreview: [
    {
      label: "STRENGTH",
      snippet:
        "For insulated drinkware, Stanley and Owala are frequently cited for durability and retail availability…",
      note: "That is active recommendation share—refresh proof so competitors cannot erode the slot on the next model update.",
    },
    {
      label: "VULNERABLE",
      snippet:
        "Some assistants aggregate hydro flask variants inconsistently, which splits brand equity across listings…",
      note: "Close the hole with cited comparisons, FAQs for these query shapes, and third-party proof assistants retrieve.",
    },
  ],
  executionPhases: [
    {
      phase: "Week 1 to 2",
      text: "We audit structured content, schema, entity consistency, and citation gaps; benchmark competitor proof so priorities are explicit.",
    },
    {
      phase: "Week 2 to 3",
      text: "We rebuild Anthropic and Gemini surfaces first—shipped comparison pages, FAQs, and schema aligned to how those assistants retrieve.",
    },
    {
      phase: "Week 3 to 4",
      text: "We expand authority through reviews, trade press, and trusted third-party mentions assistants can cite; defend OpenAI with fresh proof.",
    },
    {
      phase: "Week 4+",
      text: "We re-measure with the next snapshot, read deltas by model, and lock the following 30-day sprint.",
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
    position: i % 4 === 0 ? "—" : i % 2 === 0 ? "top" : "middle",
    strength: i % 3 === 0 ? "strong" : i % 3 === 1 ? "medium" : "weak",
    competitors: String((i % 3) + 1),
  })),
  methodology: PDF_METHODOLOGY_TEXT,
  meta: {
    responses: 30,
    confidence: "High",
    generated: "April 1, 2026",
  },
  strategicTakeaway:
    "Sixty-four points separate OpenAI from Anthropic—buyers get different short lists depending on which assistant they use. Rebuild the weak surfaces with cited comparisons and FAQs before a competitor locks the default recommendation there.",
  dataSummaryInterpretation:
    "Stanley leads the mention table, but Owala is tied and the next brands sit one to two mentions back—this is a contested default, not a locked win. Forty percent of answers omit you entirely, and citation coverage is 0%, so assistants have little third-party proof to anchor you ahead.",
  recommendedNextSteps:
    "What happens next: your agency runs this as an ongoing program—not a one-off readout. We own monthly (or agreed) snapshots, sequencing of the fixes in this report, and re-measurement by model so progress shows up in scores. Stanley approves positioning, key pages, and brand risk; we execute audits, content and schema updates, citation outreach, and iteration against the weakest surfaces first. Typical shape: 90-day execution sprints with snapshot checkpoints; expand scope as recommendation share stabilizes or new competitors enter the set.",
  agencyName: "Northbridge Digital",
  agencyLogoUrl: null,
};
