import type { ReportData } from "./types";

/** Demo / fixture data for preview and tests */
export const stanleyData: ReportData = {
  clientName: "Stanley Steemer",
  domain: "stanleysteemer.com",
  date: "March 15, 2026",
  overallScore: 72,
  rank: 2,
  rankTotal: 5,
  status: "Moderate",
  mentionRate: 68,
  topPosition: 42,
  authorityScore: 35,
  bottomLine:
    "Stanley Steemer appears in 68% of AI responses but is rarely the first recommendation. ServiceMaster leads by 4 mentions — the gap is closable with focused authority building and comparison content.",
  tensionNote:
    "Contested landscape: tracked competitors cluster within a narrow mention band. Differentiation in the next 90 days will shape default recommendations.",
  competitors: [
    { name: "Stanley Steemer", mentions: 17, rate: 68, rank: 2, isClient: true },
    { name: "ServiceMaster", mentions: 21, rate: 84, rank: 1 },
    { name: "Chem-Dry", mentions: 14, rate: 56, rank: 3 },
    { name: "COIT", mentions: 11, rate: 44, rank: 4 },
    { name: "Zerorez", mentions: 8, rate: 32, rank: 5 },
  ],
  modelScores: [
    {
      name: "OpenAI",
      score: 78,
      deltaVsAvg: 6,
      insights: [
        "Strongest surface area — brand and service copy align with how this model summarizes local services.",
        "Maintain FAQ and comparison pages that explicitly contrast guarantees and service areas.",
      ],
    },
    {
      name: "Gemini",
      score: 71,
      deltaVsAvg: -1,
      insights: [
        "Slightly below your cross-model average — refresh structured data and regional landing consistency.",
        "Add third-party citations from industry and review sources this model tends to cite.",
      ],
    },
    {
      name: "Anthropic",
      score: 67,
      deltaVsAvg: -5,
      insights: [
        "Largest gap — prioritize clear, citation-backed claims over promotional language.",
        "Publish authoritative guides that answer “best carpet cleaner in [city]” style intents.",
      ],
    },
  ],
  alerts: {
    win: { title: "OpenAI strength", detail: "Score 78 — replicate patterns across weaker models." },
    risk: { title: "Share of voice", detail: "ServiceMaster leads mentions 21 vs your 17." },
    priority: { title: "Authority signals", detail: "Only 35% of mentions include citations — raise trust depth." },
  },
  recommendations: [
    {
      priority: "HIGH",
      title: "Close the citation gap",
      insight: "Citation rate sits at 35% — models treat you as visible but not primary source.",
      explanation: "AI systems overweight brands that appear in editorial, review, and news contexts.",
      action: "Earn 6–10 net-new citations from trade press, local media, and structured reviews in 60 days.",
      expectedOutcome: "Target 50%+ citation-attributed mentions on next briefing.",
    },
    {
      priority: "HIGH",
      title: "Win first-position answers",
      insight: "Top-position rate is 42% while mention rate is 68%.",
      explanation: "You are in the set but rarely the default recommendation.",
      action: "Ship comparison and “vs competitor” pages with clear differentiation and proof points.",
      expectedOutcome: "Lift top-position rate toward 55%+ within one quarter.",
    },
    {
      priority: "MEDIUM",
      title: "Lift Anthropic surface",
      insight: "Anthropic trails OpenAI by 11 points.",
      explanation: "Same buyers use multiple assistants — weakness here is leakage in consideration.",
      action: "Add concise, factual modules to key URLs; reduce marketing fluff in crawlable HTML.",
      expectedOutcome: "+8–12 points on Anthropic within 90 days.",
    },
    {
      priority: "LOW",
      title: "Defend OpenAI lead",
      insight: "OpenAI is your anchor model today.",
      explanation: "Competitors will study what works here.",
      action: "Quarterly content refresh on top URLs; monitor new SERP-style AI summaries.",
      expectedOutcome: "Hold 75+ while others catch up.",
    },
  ],
  evidencePreview: [
    {
      label: "STRENGTH",
      snippet:
        "For deep carpet cleaning in most U.S. markets, Stanley Steemer and Chem-Dry are frequently recommended for truck-mounted hot water extraction…",
      note: "Brand appears alongside peers — defend differentiation.",
    },
    {
      label: "OPPORTUNITY",
      snippet:
        "National chains like ServiceMaster often appear first in “best carpet cleaning company” style queries due to franchise density and review volume…",
      note: "You are referenced but not defaulted — tighten first-answer positioning.",
    },
  ],
  executionPhases: [
    {
      phase: "Week 1–2",
      text: "Audit AI-visible content: extractability, schema, and competitor comparison gaps. Baseline citation inventory.",
    },
    {
      phase: "Week 2–3",
      text: "Execute priority recommendations #1–2. Publish two comparison assets and pitch two citation targets.",
    },
    {
      phase: "Week 3–4",
      text: "Expand regional proof: reviews, press, and authoritative backlinks. Align messaging on weakest model.",
    },
    {
      phase: "Week 4+",
      text: "Re-run visibility briefing, measure deltas by model, and iterate the next 30-day plan.",
    },
  ],
  signalSummary: [
    { signal: "Strength (top + strong rec.)", count: 10, rate: "40%", status: "positive", actionNote: "Maintain" },
    { signal: "Opportunity (mentioned, not top)", count: 7, rate: "28%", status: "improvable", actionNote: "Improve rank" },
    { signal: "Vulnerable (not mentioned)", count: 8, rate: "32%", status: "gap", actionNote: "Build presence" },
    { signal: "Authority (with citations)", count: 9, rate: "35%", status: "trust", actionNote: "Earn citations" },
  ],
  competitiveTable: [
    { brand: "Stanley Steemer", mentions: 17, rate: "68%", vsYou: "—", status: "You" },
    { brand: "ServiceMaster", mentions: 21, rate: "84%", vsYou: "+4", status: "Ahead" },
    { brand: "Chem-Dry", mentions: 14, rate: "56%", vsYou: "-3", status: "Behind" },
    { brand: "COIT", mentions: 11, rate: "44%", vsYou: "-6", status: "Behind" },
  ],
  evidenceLog: Array.from({ length: 10 }, (_, i) => ({
    idx: i + 1,
    label: i % 3 === 0 ? "STRENGTH" : i % 3 === 1 ? "OPPORTUNITY" : "COMPETITIVE",
    mentioned: i % 4 === 0 ? "No" : "Yes",
    position: i % 4 === 0 ? "—" : i % 2 === 0 ? "top" : "middle",
    strength: i % 3 === 0 ? "strong" : "medium",
    competitors: String((i % 3) + 1),
  })),
  methodology:
    "This briefing analyzes AI-assisted discovery responses under standardized scenarios. Composite signals reflect presence (mention consistency), positioning (relative rank), and authority (citation signals). Results are directional and should be paired with your commercial and search data.",
  meta: {
    responses: 25,
    confidence: "High",
    generated: "March 15, 2026",
  },
  strategicTakeaway:
    "You have a workable mention footprint but not default recommendation strength. The fastest path to revenue impact is pairing citation growth with first-position narratives on high-intent queries — especially where ServiceMaster currently owns the opening sentence.",
  agencyName: "Northbridge Digital",
  agencyLogoUrl: null,
};
