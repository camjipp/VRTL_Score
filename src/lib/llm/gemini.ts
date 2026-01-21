import "server-only";

import { extractionSchema } from "@/lib/extraction/schema";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";

type RunGeminiArgs = {
  system: string;
  prompt: string;
  model?: string;
};

export type GeminiResult = {
  rawText: string;
  parsed: ReturnType<typeof extractionSchema.safeParse>;
  modelUsed: string;
  latencyMs: number;
};

export async function runGemini({ system, prompt, model }: RunGeminiArgs): Promise<GeminiResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const modelToUse = model || GEMINI_MODEL;
  const started = Date.now();

  // Gemini API (Generative Language) — keep it dependency-free via fetch.
  // We ask for strict JSON via system prompt, and request JSON MIME where supported.
  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      modelToUse
    )}:generateContent`
  );
  url.searchParams.set("key", GEMINI_API_KEY);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${system}\n\n${prompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json"
      }
    })
  });

  const latencyMs = Date.now() - started;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const content = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
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


