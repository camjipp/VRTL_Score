import { NextResponse } from "next/server";

import type { Extraction } from "@/lib/extraction/schema";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PROMPT_PACK_VERSION, PROMPTS } from "@/lib/prompts/v1_core_10";
import { runOpenAI } from "@/lib/llm/openai";
import { getEnabledProviders, type Provider } from "@/lib/llm/providers";
import { scoreBalanced } from "@/lib/scoring/v1_balanced";

// Vercel/Next route hints: snapshot runs can take longer than default serverless timeouts.
// Keep this on Node.js runtime (needed for OpenAI fetch + server-only env usage).
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

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

function staleRunningSnapshotMs(): number {
  const raw = process.env.SNAPSHOT_STALE_RUNNING_MS;
  if (!raw) return 15 * 60 * 1000;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 15 * 60 * 1000;
}

function openAiConcurrency(): number {
  const raw = process.env.SNAPSHOT_OPENAI_CONCURRENCY;
  if (!raw) return 6;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 6;
  return Math.max(1, Math.min(10, Math.floor(n)));
}

export async function POST(req: Request) {
  let snapshotId: string | null = null;

  try {
    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
    }

    const body = (await req.json()) as RunBody;
    if (!body.clientId) {
      return NextResponse.json({ error: "Missing clientId" }, { status: 400 });
    }
    console.log("snapshot start", { clientId: body.clientId });

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
    const clientName = clientRes.data.name as string;
    const clientIndustry = clientRes.data.industry as string;

    // Enforce lock: existing running snapshot
    const running = await supabase
      .from("snapshots")
      .select("id,started_at")
      .eq("client_id", body.clientId)
      .eq("status", "running")
      .limit(1)
      .maybeSingle();
    if (running.data?.id) {
      const startedAtIso = running.data.started_at as string | null | undefined;
      const startedAtMs = startedAtIso ? new Date(startedAtIso).getTime() : null;
      const ageMs = startedAtMs ? Date.now() - startedAtMs : null;

      // If we have a stale "running" snapshot (e.g., crash mid-run), auto-clear it so the user can retry.
      const staleMs = staleRunningSnapshotMs();
      if (ageMs !== null && ageMs > staleMs) {
        console.log("stale running snapshot detected; auto-failing", {
          clientId: body.clientId,
          runningSnapshotId: running.data.id,
          ageMs,
          staleMs
        });
        const cutoffIso = new Date(Date.now() - staleMs).toISOString();
        const cleared = await supabase
          .from("snapshots")
          .update({
            status: "failed",
            error: `auto-reset: stale>${Math.round(staleMs / 60000)}m (${running.data.id})`,
            completed_at: new Date().toISOString()
          })
          .eq("id", running.data.id)
          .eq("status", "running")
          .lt("started_at", cutoffIso)
          .select("id")
          .maybeSingle();

        if (cleared.data?.id) {
          console.log("stale running snapshot auto-failed", { snapshotId: cleared.data.id });
        } else {
          console.log("stale-clear attempted but no row updated (race?)", {
            runningSnapshotId: running.data.id
          });
        }
      } else {
        console.log("snapshot lock hit", {
          clientId: body.clientId,
          runningSnapshotId: running.data.id,
          ageMs
        });
        return NextResponse.json(
          {
            error: "Snapshot already running",
            clientId: body.clientId,
            running_snapshot_id: running.data.id
          },
          { status: 409 }
        );
      }
    }

    // Re-check lock after potential stale-clear
    const runningAfter = await supabase
      .from("snapshots")
      .select("id")
      .eq("client_id", body.clientId)
      .eq("status", "running")
      .limit(1)
      .maybeSingle();
    if (runningAfter.data?.id) {
      console.log("snapshot lock still present after stale-clear attempt", {
        clientId: body.clientId,
        runningSnapshotId: runningAfter.data.id
      });
      return NextResponse.json(
        {
          error: "Snapshot already running",
          clientId: body.clientId,
          running_snapshot_id: runningAfter.data.id
        },
        { status: 409 }
      );
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
    snapshotId = snapshotInsert.data.id as string;
    console.log("created snapshot", { snapshotId });

    // Context: competitors list
    const competitorsRes = await supabase
      .from("competitors")
      .select("name,website")
      .eq("client_id", body.clientId);
    const competitorNames =
      competitorsRes.error || !competitorsRes.data ? [] : competitorsRes.data.map((c) => c.name);

    const providers = getEnabledProviders();
    console.log("enabled providers", providers);
    if (providers.length === 0) {
      await supabase
        .from("snapshots")
        .update({
          status: "failed",
          error: "No providers enabled (set OPENAI_API_KEY or others)",
          completed_at: new Date().toISOString()
        })
        .eq("id", snapshotId);
      return NextResponse.json({ error: "No providers enabled" }, { status: 500 });
    }

    if (providers.includes("openai") && !process.env.OPENAI_API_KEY) {
      await supabase
        .from("snapshots")
        .update({
          status: "failed",
          error: "OPENAI_API_KEY is missing",
          completed_at: new Date().toISOString()
        })
        .eq("id", snapshotId);
      return NextResponse.json({ error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const byProviderExtractions: Record<Provider, Extraction[]> = {
      openai: [],
      anthropic: [],
      gemini: []
    };

    for (const provider of providers) {
      if (provider !== "openai") continue; // only OpenAI implemented

      // Run prompts with limited concurrency to avoid Vercel timeouts while keeping load reasonable.
      await runWithConcurrency(
        PROMPTS.map((prompt, idx) => ({ prompt, idx })),
        openAiConcurrency(),
        async ({ prompt, idx }) => {
          console.log("before openai call", { promptKey: prompt.key });
          let rawText = "";
          let parseOk = false;
          let parsedJson: unknown = null;
          let errorText: string | null = null;
          let latencyMs: number | null = null;
          let modelUsed: string | null = null;

          try {
            const result = await runOpenAI({
              system: SYSTEM_PROMPT,
              prompt: buildPrompt(
                clientName,
                clientIndustry,
                competitorNames,
                prompt
              ),
              model: process.env.OPENAI_MODEL
            });
            rawText = result.rawText;
            latencyMs = result.latencyMs;
            modelUsed = result.modelUsed;
            parseOk = result.parsed.success;
            if (result.parsed.success) {
              parsedJson = result.parsed.data;
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
          console.log("stored response", { promptKey: prompt.key });
        }
      );
    }

    console.log("scoring");
    const score = scoreBalanced(byProviderExtractions);

    await supabase
      .from("snapshots")
      .update({
        status: "complete",
        completed_at: new Date().toISOString(),
        vrtl_score: score.overallScore,
        score_by_provider: score.byProvider
      })
      .eq("id", snapshotId);

    console.log("snapshot complete");
    return NextResponse.json({ snapshot_id: snapshotId, status: "complete", score });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (snapshotId) {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from("snapshots")
        .update({
          status: "failed",
          error: message,
          completed_at: new Date().toISOString()
        })
        .eq("id", snapshotId);
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  const queue = items.slice();
  const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (!item) return;
      await fn(item);
    }
  });
  await Promise.all(workers);
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


