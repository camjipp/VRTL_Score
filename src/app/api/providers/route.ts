import { NextResponse } from "next/server";

import { getEnabledProviders } from "@/lib/llm/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/providers
 * Returns which AI providers are detected (env vars set).
 * Use this to verify Vercel has ANTHROPIC_API_KEY and GEMINI_API_KEY.
 * Does not expose any secrets.
 */
export async function GET() {
  const providers = getEnabledProviders();
  return NextResponse.json({
    openai: providers.includes("openai"),
    anthropic: providers.includes("anthropic"),
    gemini: providers.includes("gemini"),
    enabled: providers
  });
}
