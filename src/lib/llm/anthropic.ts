import "server-only";

import { extractionSchema } from "@/lib/extraction/schema";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY || process.env.CLAUDE_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

type RunAnthropicArgs = {
  system: string;
  prompt: string;
  model?: string;
};

export type AnthropicResult = {
  rawText: string;
  parsed: ReturnType<typeof extractionSchema.safeParse>;
  modelUsed: string;
  latencyMs: number;
};

export async function runAnthropic({
  system,
  prompt,
  model
}: RunAnthropicArgs): Promise<AnthropicResult> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const modelToUse = model || ANTHROPIC_MODEL;
  const started = Date.now();

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: modelToUse,
      max_tokens: 800,
      temperature: 0,
      system,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const latencyMs = Date.now() - started;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const content =
    json.content
      ?.filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("") ?? "";

  const parsed = extractionSchema.safeParse(safeJson(content));

  return {
    rawText: content,
    parsed,
    modelUsed: modelToUse,
    latencyMs
  };
}

function safeJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}


