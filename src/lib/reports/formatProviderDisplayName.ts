/**
 * Display names for AI provider keys in reports (PDF + HTML).
 * Keeps OpenAI / Gemini / Anthropic capitalization consistent.
 */
export function formatProviderDisplayName(raw: string): string {
  const s = String(raw).trim();
  if (!s) return s;
  const k = s.toLowerCase();
  const map: Record<string, string> = {
    openai: "OpenAI",
    gemini: "Gemini",
    anthropic: "Anthropic",
    "google gemini": "Gemini",
    "google-gemini": "Gemini",
  };
  if (map[k]) return map[k];
  return s;
}
