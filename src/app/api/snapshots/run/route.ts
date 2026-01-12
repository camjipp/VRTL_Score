import { NextResponse } from "next/server";

import { extractionSchema } from "@/lib/extraction/schema";
import type { Extraction } from "@/lib/extraction/schema";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PROMPT_PACK_VERSION, PROMPTS } from "@/lib/prompts/v1_core_10";
import { runOpenAI } from "@/lib/llm/openai";
import { getEnabledProviders, type Provider } from "@/lib/llm/providers";
import { scoreBalanced } from "@/lib/scoring/v1_balanced";

type RunBody = {
  clientId?: string;
};

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

const SYSTEM_PROMPT = `You are a strict JSON generator. Respond ONLY with a JSON object matching this schema:
{
  "client_mentioned": boolean,
  "client_position": "top" | "middle" | "bottom" | "not_mentioned",
  "recommendation_strength": "strong" | "medium" | "weak" | "none",
  "competitors_mentioned": string[],
  "has_sources_or_citations": boolean,
  "has_specific_features": boolean,
  "evidence_snippet": string
}
Do not include any extra keys or text. evidence_snippet must be <= 200 characters.`;

export async function POST(req: Request) {
  const token = bearerToken(req);
  if (!token) {
    return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
  }

  const body = (await req.json()) as RunBody;
  if (!body.clientId) {
    return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  // Auth
  const userRes = await supabase.auth.getUser(token);
  const user = userRes.data.user;
  if (userRes.error || !user) {
    return NextResponse.json(
      { error: userRes.error?.message ?? "Unauthorized" },
      { status: 401 }
    );
  }

  // Map user -> agency
  const agencyUser = await supabase
    .from("agency_users")
    .select("agency_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (agencyUser.error || !agencyUser.data?.agency_id) {
    return NextResponse.json({ error: "Agency not found for user" }, { status: 403 });
  }
  const agencyId = agencyUser.data.agency_id as string;

  // Verify client belongs to agency
  const clientRes = await supabase
    .from("clients")
    .select("id,name,website,industry,agency_id")
    .eq("id", body.clientId)
    .maybeSingle();
  if (clientRes.error || !clientRes.data) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }
  if (clientRes.data.agency_id !== agencyId) {
    return NextResponse.json({ error: "Client not in your agency" }, { status: 403 });
  }

  // Enforce lock: existing running snapshot
  const running = await supabase
    .from("snapshots")
    .select("id")
    .eq("client_id", body.clientId)
    .eq("status", "running")
    .limit(1)
    .maybeSingle();
  if (running.data?.id) {
    return NextResponse.json({ error: "Snapshot already running" }, { status: 409 });
  }

  // Create snapshot
  const snapshotInsert = await supabase
    .from("snapshots")
    .insert({
      agency_id: agencyId,
      client_id: body.clientId,
      status: "running",
      started_at: new Date().toISOString(),
      prompt_pack_version: PROMPT_PACK_VERSION
    })
    .select("id")
    .single();

  if (snapshotInsert.error || !snapshotInsert.data?.id) {
    return NextResponse.json(
      { error: snapshotInsert.error?.message ?? "Failed to create snapshot" },
      { status: 500 }
    );
  }
  const snapshotId = snapshotInsert.data.id as string;

  // Context: competitors list
  const competitorsRes = await supabase
    .from("competitors")
    .select("name,website")
    .eq("client_id", body.clientId);
  const competitorNames =
    competitorsRes.error || !competitorsRes.data ? [] : competitorsRes.data.map((c) => c.name);

  const providers = getEnabledProviders();
  if (providers.length === 0) {
    await supabase
      .from("snapshots")
      .update({
        status: "failed",
        error: "No providers enabled (set OPENAI_API_KEY or others)"
      })
      .eq("id", snapshotId);
    return NextResponse.json({ error: "No providers enabled" }, { status: 500 });
  }

  const byProviderExtractions: Record<Provider, Extraction[]> = {
    openai: [],
    anthropic: [],
    gemini: []
  };

  for (const provider of providers) {
    if (provider !== "openai") continue; // only OpenAI implemented

    for (const [idx, prompt] of PROMPTS.entries()) {
      let rawText = "";
      let parseOk = false;
      let parsedJson: unknown = null;
      let errorText: string | null = null;
      let latencyMs: number | null = null;
      let modelUsed: string | null = null;

      try {
        const result = await runOpenAI({
          system: SYSTEM_PROMPT,
          prompt: buildPrompt(clientRes.data.name, clientRes.data.industry, competitorNames, prompt),
          model: process.env.OPENAI_MODEL
        });
        rawText = result.rawText;
        latencyMs = result.latencyMs;
        modelUsed = result.modelUsed;
        parseOk = result.parsed.success;
        if (result.parsed.success) {
          parsedJson = result.parsed.data;
          if (!byProviderExtractions[provider]) byProviderExtractions[provider] = [];
          byProviderExtractions[provider].push(result.parsed.data);
        } else {
          parsedJson = result.parsed.error.flatten();
        }
      } catch (err) {
        errorText = err instanceof Error ? err.message : String(err);
      }

      await supabase.from("responses").insert({
        snapshot_id: snapshotId,
        agency_id: agencyId,
        prompt_ordinal: idx,
        prompt_key: prompt.key,
        prompt_text: prompt.text,
        provider,
        model: modelUsed,
        raw_text: rawText,
        parsed_json: parsedJson,
        parse_ok: parseOk,
        error: errorText,
        latency_ms: latencyMs
      });
    }
  }

  const score = scoreBalanced(byProviderExtractions);

  await supabase
    .from("snapshots")
    .update({
      status: "complete",
      completed_at: new Date().toISOString(),
      score_overall: score.overallScore,
      score_by_provider: score.byProvider,
      score_breakdown: score.breakdown
    })
    .eq("id", snapshotId);

  return NextResponse.json({ snapshot_id: snapshotId, status: "complete", score });
}

function buildPrompt(
  clientName: string,
  industry: string,
  competitorNames: string[],
  prompt: { key: string; text: string }
) {
  const competitorsText =
    competitorNames.length > 0 ? `Competitors: ${competitorNames.join(", ")}` : "Competitors: none";
  return `Brand: ${clientName}
Industry: ${industry}
${competitorsText}

Question: ${prompt.text}

Respond with JSON ONLY per the system schema.`;
}


