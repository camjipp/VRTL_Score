import "server-only";

import { extractionSchema } from "@/lib/extraction/schema";
import { extractJson } from "@/lib/llm/extractJson";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

type RunOpenAIArgs = {
  system: string;
  prompt: string;
  model?: string;
};

export type OpenAIResult = {
  rawText: string;
  parsed: ReturnType<typeof extractionSchema.safeParse>;
  modelUsed: string;
  latencyMs: number;
};

export async function runOpenAI({
  system,
  prompt,
  model
}: RunOpenAIArgs): Promise<OpenAIResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }
  const modelToUse = model || OPENAI_MODEL;
  const started = Date.now();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        {
          role: "system",
          content: system
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0
    })
  });

  const latencyMs = Date.now() - started;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    choices: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content ?? "";
  const extracted = extractJson(content);
  const parsed = extractionSchema.safeParse(extracted ?? {});

  return {
    rawText: content,
    parsed,
    modelUsed: modelToUse,
    latencyMs
  };
}


