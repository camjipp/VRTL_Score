import { NextResponse } from "next/server";

import type { Extraction } from "@/lib/extraction/schema";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { PROMPT_PACK_VERSION, PROMPTS } from "@/lib/prompts/v1_core_10";
import { runAnthropic } from "@/lib/llm/anthropic";
import { runOpenAI } from "@/lib/llm/openai";
import { runGemini } from "@/lib/llm/gemini";
import { getEnabledProviders, type Provider } from "@/lib/llm/providers";
import { scoreBalanced } from "@/lib/scoring/v1_balanced";

// Vercel/Next route hints: snapshot runs can take longer than default serverless timeouts.
// Keep this on Node.js runtime (needed for OpenAI fetch + server-only env usage).
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const SNAPSHOT_API_VERSION = "2026-01-13";

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

function geminiConcurrency(): number {
  const raw = process.env.SNAPSHOT_GEMINI_CONCURRENCY;
  if (!raw) return 3;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 3;
  return Math.max(1, Math.min(6, Math.floor(n)));
}

function anthropicConcurrency(): number {
  const raw = process.env.SNAPSHOT_ANTHROPIC_CONCURRENCY;
  if (!raw) return 3;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 3;
  return Math.max(1, Math.min(6, Math.floor(n)));
}

function dailySnapshotLimit(): number | null {
  const raw = process.env.SNAPSHOT_DAILY_LIMIT;
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  const clamped = Math.max(0, Math.floor(n));
  return clamped === 0 ? 0 : clamped;
}

function clientCooldownMs(): number {
  const raw = process.env.SNAPSHOT_CLIENT_COOLDOWN_MS;
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function isMissingColumnError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const any = e as { code?: unknown; message?: unknown; details?: unknown };
  const code = typeof any.code === "string" ? any.code : "";
  const msg = typeof any.message === "string" ? any.message : "";
  const details = typeof any.details === "string" ? any.details : "";
  // PostgREST: PGRST204 "Could not find the '<col>' column ... in the schema cache"
  return (
    code === "PGRST204" ||
    msg.includes("schema cache") ||
    msg.includes("Could not find") ||
    details.includes("schema cache")
  );
}

async function insertResponseWithFallback(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  baseRow: Record<string, unknown>,
  extraRow: Record<string, unknown>
) {
  // Try inserting with extra columns; if the DB doesn't have them, retry with base.
  const first = await supabase.from("responses").insert(extraRow);
  if (!first.error) return;
  if (!isMissingColumnError(first.error)) throw first.error;
  const second = await supabase.from("responses").insert(baseRow);
  if (second.error) throw second.error;
}

function sleepMs(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runOpenAIWithRetry(args: Parameters<typeof runOpenAI>[0]) {
  const maxAttempts = Math.max(1, Number(process.env.SNAPSHOT_OPENAI_RETRIES ?? "2"));
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await runOpenAI(args);
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts) break;
      const backoffMs = 250 * attempt;
      console.log("openai call failed; retrying", {
        attempt,
        maxAttempts,
        backoffMs,
        message: err instanceof Error ? err.message : String(err)
      });
      await sleepMs(backoffMs);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function runGeminiWithRetry(args: Parameters<typeof runGemini>[0]) {
  const maxAttempts = Math.max(1, Number(process.env.SNAPSHOT_GEMINI_RETRIES ?? "2"));
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await runGemini(args);
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts) break;
      const backoffMs = 250 * attempt;
      console.log("gemini call failed; retrying", {
        attempt,
        maxAttempts,
        backoffMs,
        message: err instanceof Error ? err.message : String(err)
      });
      await sleepMs(backoffMs);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

async function runAnthropicWithRetry(args: Parameters<typeof runAnthropic>[0]) {
  const maxAttempts = Math.max(1, Number(process.env.SNAPSHOT_ANTHROPIC_RETRIES ?? "2"));
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await runAnthropic(args);
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts) break;
      const backoffMs = 250 * attempt;
      console.log("anthropic call failed; retrying", {
        attempt,
        maxAttempts,
        backoffMs,
        message: err instanceof Error ? err.message : String(err)
      });
      await sleepMs(backoffMs);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
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

    // Guardrails: rate/cost controls (no schema changes; uses snapshots.started_at)
    const cooldownMs = clientCooldownMs();
    if (cooldownMs > 0) {
      const latestRes = await supabase
        .from("snapshots")
        .select("id,started_at,status")
        .eq("client_id", body.clientId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const latestStarted = latestRes.data?.started_at as string | null | undefined;
      const latestStartedMs = latestStarted ? new Date(latestStarted).getTime() : null;
      const ageMs = latestStartedMs ? Date.now() - latestStartedMs : null;
      if (ageMs !== null && ageMs >= 0 && ageMs < cooldownMs) {
        return NextResponse.json(
          {
            error: "Snapshot cooldown active",
            clientId: body.clientId,
            retry_after_ms: cooldownMs - ageMs
          },
          { status: 429 }
        );
      }
    }

    const limit = dailySnapshotLimit();
    if (limit !== null) {
      const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const countRes = await supabase
        .from("snapshots")
        .select("id", { count: "exact", head: true })
        .eq("agency_id", agencyId)
        .gte("started_at", sinceIso);
      const used = countRes.count ?? 0;
      if (used >= limit) {
        return NextResponse.json(
          {
            error: "Daily snapshot limit reached",
            agencyId,
            window_hours: 24,
            used,
            limit
          },
          { status: 429 }
        );
      }
    }

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

    // We may store extra response metadata if the DB supports it.
    // If columns don't exist (schema cache mismatch), we fall back to base columns.

    // Context: competitors list
    const competitorsRes = await supabase
      .from("competitors")
      .select("name,website")
      .eq("client_id", body.clientId);
    const competitorNames =
      competitorsRes.error || !competitorsRes.data ? [] : competitorsRes.data.map((c) => c.name);

    const providers = getEnabledProviders();
    console.log("enabled providers", providers, {
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      hasAnthropic: !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY || process.env.CLAUDE_API_KEY),
      hasGemini: !!process.env.GEMINI_API_KEY
    });
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
    if (providers.includes("anthropic") && !process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_KEY && !process.env.CLAUDE_API_KEY) {
      await supabase
        .from("snapshots")
        .update({
          status: "failed",
          error: "ANTHROPIC_API_KEY (or ANTHROPIC_KEY / CLAUDE_API_KEY) is missing",
          completed_at: new Date().toISOString()
        })
        .eq("id", snapshotId);
      return NextResponse.json({ error: "ANTHROPIC_API_KEY (or ANTHROPIC_KEY / CLAUDE_API_KEY) is missing" }, { status: 500 });
    }
    if (providers.includes("gemini") && !process.env.GEMINI_API_KEY) {
      await supabase
        .from("snapshots")
        .update({
          status: "failed",
          error: "GEMINI_API_KEY is missing",
          completed_at: new Date().toISOString()
        })
        .eq("id", snapshotId);
      return NextResponse.json({ error: "GEMINI_API_KEY is missing" }, { status: 500 });
    }

    const byProviderExtractions: Record<Provider, Extraction[]> = {
      openai: [],
      anthropic: [],
      gemini: []
    };

    for (const provider of providers) {
      const concurrency =
        provider === "openai"
          ? openAiConcurrency()
          : provider === "gemini"
          ? geminiConcurrency()
          : anthropicConcurrency();

      // Run prompts with limited concurrency to avoid Vercel timeouts while keeping load reasonable.
      await runWithConcurrency(
        PROMPTS.map((prompt, idx) => ({ prompt, idx })),
        concurrency,
        async ({ prompt, idx }) => {
          console.log("before provider call", { provider, promptKey: prompt.key });
          let rawText = "";
          let parseOk = false;
          let parsedJson: unknown = null;
          let modelUsed: string | null = null;
          let latencyMs: number | null = null;

          try {
            const fullPrompt = buildPrompt(clientName, clientIndustry, competitorNames, prompt);
            const result =
              provider === "openai"
                ? await runOpenAIWithRetry({
                    system: SYSTEM_PROMPT,
                    prompt: fullPrompt,
                    model: process.env.OPENAI_MODEL
                  })
                : provider === "gemini"
                ? await runGeminiWithRetry({
                    system: SYSTEM_PROMPT,
                    prompt: fullPrompt,
                    model: process.env.GEMINI_MODEL
                  })
                : await runAnthropicWithRetry({
                    system: SYSTEM_PROMPT,
                    prompt: fullPrompt,
                    model: process.env.ANTHROPIC_MODEL
                  });
            rawText = result.rawText;
            modelUsed = result.modelUsed;
            latencyMs = result.latencyMs;
            parseOk = result.parsed.success;
            if (result.parsed.success) {
              parsedJson = result.parsed.data;
              byProviderExtractions[provider].push(result.parsed.data);
            } else {
              parsedJson = result.parsed.error.flatten();
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error(`Provider ${provider} failed:`, message);
            rawText = `ERROR: ${message}`;
            parsedJson = { error: message };
            parseOk = false;
          }

          const baseRow: Record<string, unknown> = {
            snapshot_id: snapshotId,
            agency_id: agencyId,
            prompt_ordinal: idx,
            prompt_text: prompt.text,
            raw_text: rawText,
            parsed_json: parsedJson,
            parse_ok: parseOk
          };

          const extraRow: Record<string, unknown> = {
            ...baseRow,
            provider,
            prompt_key: prompt.key,
            prompt_pack_version: PROMPT_PACK_VERSION,
            model_used: modelUsed,
            latency_ms: latencyMs
          };

          await insertResponseWithFallback(supabase, baseRow, extraRow);
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

    console.log("snapshot complete", { byProvider: Object.keys(score.byProvider) });
    return NextResponse.json({
      apiVersion: SNAPSHOT_API_VERSION,
      snapshot_id: snapshotId,
      status: "complete",
      score,
      enabled_providers: providers,
      providers_used: Object.keys(score.byProvider)
    });
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
    return NextResponse.json({ apiVersion: SNAPSHOT_API_VERSION, error: message }, { status: 500 });
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


