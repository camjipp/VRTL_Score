import type { ReportData } from "./types";

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
    "You rank first in this snapshot; the set is still contested. Raise first-position rate and authority to widen the lead.",
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
        "Strongest surface. Replicate this pattern on the lagging models.",
        "Competitors will pressure this channel. Refresh authority signals.",
      ],
    },
    {
      name: "Gemini",
      score: 39,
      deltaVsAvg: -13,
      insights: [
        "Gemini visibility is weak. Your brand is frequently absent from category responses.",
        "Ship factual, citation-heavy pages this model tends to summarize.",
      ],
    },
    {
      name: "Anthropic",
      score: 26,
      deltaVsAvg: -26,
      insights: [
        "Widest gap. Lead with clear, cited claims; cut promo-only copy.",
        'Publish authoritative guides for "best in category" intents.',
      ],
    },
  ],
  alerts: {
    win: { title: "OpenAI strength", detail: "Score 90. Mirror the winning URL pattern on weaker models." },
    risk: { title: "Contested set", detail: "Owala ties mentions at 18. Differentiate or you split the default answer." },
    priority: { title: "Authority depth", detail: "Authority reads 0%. Add citations and third-party proof." },
  },
  recommendations: [
    {
      priority: "HIGH",
      title: "Close the model spread",
      insight: "64 points separate your best and worst model scores.",
      explanation:
        "Performance is inconsistent across models. Buyers hear different defaults by assistant. You cede control of the narrative.",
      action: "Unify structured facts and citations on priority URLs. Ship one flagship comparison asset.",
      expectedOutcome: "Trailing models up 10+ points within 90 days.",
    },
    {
      priority: "HIGH",
      title: "Win first-position answers",
      insight: "Top position and mention rate both sit at 60%.",
      explanation: "You are in the set but not always the first pick. That caps conversion on high-intent queries.",
      action: "Publish comparison pages with proof points and schema-aligned FAQs.",
      expectedOutcome: "Higher top-position share on priority intents.",
    },
    {
      priority: "MEDIUM",
      title: "Defend parity vs. Owala",
      insight: "Owala matches your mention count at 18.",
      explanation: "Parity lets assistants flip the default on thin evidence.",
      action: "Refresh hero SKUs; earn net-new citations from review and press.",
      expectedOutcome: "Break ties in your favor on head-to-head queries.",
    },
    {
      priority: "LOW",
      title: "Monitor Hydro Flask variants",
      insight: "Lower-case and upper-case variants split the entity signal.",
      explanation: "Split entities dilute authority in aggregated answers.",
      action: "Align canonical naming and entity schema sitewide.",
      expectedOutcome: "Cleaner consolidation in model answers over time.",
    },
  ],
  evidencePreview: [
    {
      label: "STRENGTH",
      snippet:
        "For insulated drinkware, Stanley and Owala are frequently cited for durability and retail availability…",
      note: "Keep differentiation sharp on materials and warranty.",
    },
    {
      label: "VULNERABLE",
      snippet:
        "Some assistants aggregate hydro flask variants inconsistently, which splits brand equity across listings…",
      note: "Tighten entity consistency and canonical product copy.",
    },
  ],
  executionPhases: [
    {
      phase: "Week 1–2",
      text: "Audit what models can quote: machine-readable copy, schema, and comparison gaps. Baseline citations and entity consistency.",
    },
    {
      phase: "Week 2–3",
      text: "Ship priority comparison assets and structured FAQs. Pitch two net-new citations in category-relevant publications.",
    },
    {
      phase: "Week 3–4",
      text: "Add proof: reviews, press, authoritative backlinks. Align messaging on the weakest model until gains hold.",
    },
    {
      phase: "Week 4+",
      text: "Re-run the visibility snapshot. Measure deltas by model and intent cluster. Lock the next 30-day plan.",
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
    "We stress-test AI discovery responses under fixed scenarios. Composite scores blend presence, relative position, and citation-backed authority. Treat results as directional; pair them with your commercial and search data.",
  meta: {
    responses: 30,
    confidence: "High",
    generated: "April 1, 2026",
  },
  strategicTakeaway:
    "You lead the rank table, but the 64-point model spread is the lever: different assistants recommend different winners. Standardize facts, citations, and comparison narratives before a competitor owns the default answer.",
  agencyName: "Northbridge Digital",
  agencyLogoUrl: null,
};
