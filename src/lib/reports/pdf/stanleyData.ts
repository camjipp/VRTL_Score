import type { ReportData } from "./types";

/** Fixture aligned with VRTL Score editorial template (preview / health checks) */
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
    "Stanley holds the top rank in this snapshot, but the landscape is tightly contested. Strengthening first-position answers and authority signals will widen the gap versus peers.",
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
        "Your strongest model surface — replicate what works here across weaker models.",
        "Competitors may target this channel; defend with fresh authority signals.",
      ],
    },
    {
      name: "Gemini",
      score: 39,
      deltaVsAvg: -13,
      insights: [
        "Critical gap: users of Gemini may not reliably see your brand in category answers.",
        "Prioritize factual, citation-friendly pages this model tends to summarize.",
      ],
    },
    {
      name: "Anthropic",
      score: 26,
      deltaVsAvg: -26,
      insights: [
        "Largest gap — prioritize clear, citation-backed claims over promotional language.",
        "Publish authoritative guides that answer “best in category” style intents.",
      ],
    },
  ],
  alerts: {
    win: { title: "OpenAI strength", detail: "Score 90 — replicate patterns across weaker models." },
    risk: { title: "Contested set", detail: "Owala matches your mention count — differentiation matters." },
    priority: { title: "Authority depth", detail: "0% authority signals — build trust and citations." },
  },
  recommendations: [
    {
      priority: "HIGH",
      title: "Close the model spread",
      insight: "64 points separate your best and worst model scores.",
      explanation: "Inconsistent AI answers mean buyers get different stories depending on the assistant they use.",
      action: "Unify structured facts and citations across key URLs; ship one flagship comparison asset.",
      expectedOutcome: "Lift trailing models by 10+ points within 90 days.",
    },
    {
      priority: "HIGH",
      title: "Win first-position answers",
      insight: "Top position rate is 60% while mention rate is 60%.",
      explanation: "You appear in the set but are not always the default recommendation.",
      action: "Publish comparison pages with proof points and schema-aligned FAQs.",
      expectedOutcome: "Increase top-position share on priority intents.",
    },
    {
      priority: "MEDIUM",
      title: "Defend parity vs. Owala",
      insight: "Owala matches your mention count at 18.",
      explanation: "Tied mentions mean assistants may flip the default recommendation on thin margins.",
      action: "Refresh hero SKUs and earn net-new citations from review and press sources.",
      expectedOutcome: "Break ties in your favor on head-to-head queries.",
    },
    {
      priority: "LOW",
      title: "Monitor Hydro Flask variants",
      insight: "Lower-case and upper-case brand variants split signals.",
      explanation: "Fragmented entity recognition can dilute authority.",
      action: "Align canonical naming and entity schema across the site.",
      expectedOutcome: "Cleaner consolidation in model answers over time.",
    },
  ],
  evidencePreview: [
    {
      label: "STRENGTH",
      snippet:
        "For insulated drinkware, Stanley and Owala are frequently cited for durability and retail availability…",
      note: "Maintain differentiation on materials and warranty story.",
    },
    {
      label: "VULNERABLE",
      snippet:
        "Some assistants aggregate hydro flask variants inconsistently, which can split brand equity across listings…",
      note: "Tighten entity consistency and canonical product copy.",
    },
  ],
  executionPhases: [
    {
      phase: "Week 1–2",
      text: "Audit AI-visible content for extractability, schema coverage, and competitor comparison gaps. Baseline citation inventory and entity consistency.",
    },
    {
      phase: "Week 2–3",
      text: "Ship priority comparison assets and structured FAQs. Pitch two net-new citation targets in category-relevant publications.",
    },
    {
      phase: "Week 3–4",
      text: "Expand proof: reviews, press, and authoritative backlinks. Align messaging on the weakest model until gains hold.",
    },
    {
      phase: "Week 4+",
      text: "Re-run the visibility snapshot, measure deltas by model and intent cluster, and set the next 30-day plan.",
    },
  ],
  signalSummary: [
    {
      signal: "Strength (top + strong rec.)",
      count: 18,
      rate: "60%",
      status: "positive",
      actionNote: "Maintain & defend",
    },
    {
      signal: "Opportunity (mentioned, not top)",
      count: 0,
      rate: "0%",
      status: "improvable",
      actionNote: "Improve rank",
    },
    {
      signal: "Vulnerable (not mentioned)",
      count: 12,
      rate: "40%",
      status: "gap",
      actionNote: "Build presence",
    },
    {
      signal: "Authority (with citations)",
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
  methodology:
    "This briefing analyzes AI-assisted discovery responses under standardized scenarios. Composite signals reflect presence (mention consistency), positioning (relative rank among alternatives), and authority (citation and source signals). Results are directional and should be paired with your commercial and search data.",
  meta: {
    responses: 30,
    confidence: "High",
    generated: "April 1, 2026",
  },
  strategicTakeaway:
    "You lead the rank table, but the 64-point spread across AI models is the highest-leverage opportunity: buyers using different assistants may receive materially different recommendations. Standardize facts, citations, and comparison narratives before competitors consolidate the default answer.",
  agencyName: "Northbridge Digital",
  agencyLogoUrl: null,
};
