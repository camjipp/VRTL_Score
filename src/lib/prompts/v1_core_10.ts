export const PROMPT_PACK_VERSION = "v1_core_10";

export type PromptDef = {
  key: string;
  text: string;
};

export const PROMPTS: PromptDef[] = [
  {
    key: "overview",
    text: "In two sentences, describe the brand and its core offering."
  },
  {
    key: "value_proposition",
    text: "State the primary value proposition this brand claims compared to others."
  },
  {
    key: "who_it_is_for",
    text: "Who is the target audience? Mention segments or use-cases."
  },
  {
    key: "social_proof",
    text: "Summarize any social proof, awards, or trust signals shown."
  },
  {
    key: "features",
    text: "List the top 3 features or capabilities highlighted."
  },
  {
    key: "pricing",
    text: "Summarize pricing or plans if visible. If absent, state that clearly."
  },
  {
    key: "alternatives",
    text: "What alternatives or competitors are mentioned or implied?"
  },
  {
    key: "differentiation",
    text: "What differentiators does this brand claim over competitors?"
  },
  {
    key: "authority",
    text: "Note any citations, sources, or external references used."
  },
  {
    key: "call_to_action",
    text: "What is the primary call-to-action offered to visitors?"
  }
];


