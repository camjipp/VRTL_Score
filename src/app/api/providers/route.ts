import { NextResponse } from "next/server";

import { runAnthropic } from "@/lib/llm/anthropic";
import { runGemini } from "@/lib/llm/gemini";
import { runOpenAI } from "@/lib/llm/openai";
import { getEnabledProviders } from "@/lib/llm/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MINIMAL_PROMPT = 'Respond with valid JSON only: {"client_mentioned":true,"client_position":"top","recommendation_strength":"strong","competitors_mentioned":[],"has_sources_or_citations":false,"has_specific_features":false,"evidence_snippet":"test"}';

/**
 * GET /api/providers
 * Returns which AI providers are detected (env vars set).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const test = url.searchParams.get("test") === "1";

  const providers = getEnabledProviders();
  const status = {
    openai: providers.includes("openai"),
    anthropic: providers.includes("anthropic"),
    gemini: providers.includes("gemini"),
    enabled: providers
  };

  if (!test) {
    return NextResponse.json(status);
  }

  // ?test=1 — actually call each provider to surface errors
  const results: Record<string, { ok: boolean; error?: string }> = {};

  if (status.openai) {
    try {
      await runOpenAI({
        system: "Respond only with valid JSON.",
        prompt: MINIMAL_PROMPT
      });
      results.openai = { ok: true };
    } catch (e) {
      results.openai = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    results.openai = { ok: false, error: "Not configured" };
  }

  if (status.anthropic) {
    try {
      await runAnthropic({
        system: "Respond only with valid JSON.",
        prompt: MINIMAL_PROMPT
      });
      results.anthropic = { ok: true };
    } catch (e) {
      results.anthropic = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    results.anthropic = { ok: false, error: "Not configured (ANTHROPIC_API_KEY, ANTHROPIC_KEY, or CLAUDE_API_KEY not set)" };
  }

  if (status.gemini) {
    try {
      await runGemini({
        system: "Respond only with valid JSON.",
        prompt: MINIMAL_PROMPT
      });
      results.gemini = { ok: true };
    } catch (e) {
      results.gemini = { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    results.gemini = { ok: false, error: "Not configured" };
  }

  return NextResponse.json({ status, test_results: results });
}
