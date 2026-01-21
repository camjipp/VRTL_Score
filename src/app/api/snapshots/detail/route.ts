import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

type ParsedJson = {
  client_mentioned?: boolean;
  client_position?: string;
  recommendation_strength?: string;
  evidence_snippet?: string;
  competitors_mentioned?: string[];
  has_sources_or_citations?: boolean;
  has_specific_features?: boolean;
};

export async function GET(req: Request) {
  try {
    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization: Bearer <token>" }, { status: 401 });
    }

    const url = new URL(req.url);
    const snapshotId = url.searchParams.get("snapshotId");
    const clientId = url.searchParams.get("clientId");
    const debug = url.searchParams.get("debug") === "1";

    if (!snapshotId) return NextResponse.json({ error: "Missing snapshotId" }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

    const supabase = getSupabaseAdminClient();

    // Auth
    const userRes = await supabase.auth.getUser(token);
    const user = userRes.data.user;
    if (userRes.error || !user) {
      return NextResponse.json({ error: userRes.error?.message ?? "Unauthorized" }, { status: 401 });
    }

    // Map user -> agency (+ role for debug gating)
    const agencyUserRes = await supabase
      .from("agency_users")
      .select("agency_id,role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (agencyUserRes.error || !agencyUserRes.data?.agency_id) {
      return NextResponse.json({ error: "Agency not found for user" }, { status: 403 });
    }
    const agencyId = agencyUserRes.data.agency_id as string;
    const role = (agencyUserRes.data.role as string | null) ?? null;

    const debugEnabled = process.env.VRTL_ENABLE_DEBUG_RESPONSES === "1";
    const debugAllowed = debugEnabled && (role === "owner" || role === "admin");
    const includeDebug = debug && debugAllowed;

    // Verify client belongs to agency
    const clientRes = await supabase
      .from("clients")
      .select("id,name,website,industry,agency_id")
      .eq("id", clientId)
      .maybeSingle();
    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    if ((clientRes.data.agency_id as string) !== agencyId) {
      return NextResponse.json({ error: "Client not in your agency" }, { status: 403 });
    }

    // Fetch snapshot (and verify it belongs to this client)
    const snapRes = await supabase
      .from("snapshots")
      .select(
        "id,status,vrtl_score,score_by_provider,created_at,started_at,completed_at,error,prompt_pack_version,client_id,agency_id"
      )
      .eq("id", snapshotId)
      .maybeSingle();
    if (snapRes.error || !snapRes.data) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }
    if ((snapRes.data.client_id as string) !== clientId) {
      return NextResponse.json({ error: "Snapshot does not belong to this client" }, { status: 403 });
    }

    // Extra guard: if snapshots.agency_id exists, enforce it too
    const snapshotAgencyId = (snapRes.data.agency_id as string | null) ?? null;
    if (snapshotAgencyId && snapshotAgencyId !== agencyId) {
      return NextResponse.json({ error: "Snapshot not in your agency" }, { status: 403 });
    }

    // Competitors
    const competitorsRes = await supabase
      .from("competitors")
      .select("id,name,website")
      .eq("client_id", clientId)
      .order("name", { ascending: true });
    const competitors = (competitorsRes.data ?? []) as Array<{
      id: string;
      name: string;
      website: string | null;
    }>;

    // Responses (sanitized by default)
    const responseSelect = includeDebug
      ? "id,prompt_ordinal,prompt_text,parse_ok,parsed_json,raw_text,created_at"
      : "id,prompt_ordinal,parse_ok,parsed_json,created_at";
    const responsesRes = await supabase
      .from("responses")
      .select(responseSelect)
      .eq("snapshot_id", snapshotId)
      .order("prompt_ordinal", { ascending: true });

    const responses = ((responsesRes.data ?? []) as unknown) as Array<{
      id: string;
      prompt_ordinal: number | null;
      prompt_text?: string | null;
      parse_ok: boolean | null;
      parsed_json: ParsedJson | null;
      raw_text?: string | null;
      created_at: string;
    }>;

    // Summary
    let clientMentionedCount = 0;
    const competitorMentionCounts = new Map<string, number>();
    let sourcesCount = 0;
    let featuresCount = 0;

    for (const r of responses) {
      const pj = (r.parsed_json ?? {}) as ParsedJson;
      if (pj.client_mentioned) clientMentionedCount += 1;
      if (pj.has_sources_or_citations) sourcesCount += 1;
      if (pj.has_specific_features) featuresCount += 1;
      if (Array.isArray(pj.competitors_mentioned)) {
        for (const name of pj.competitors_mentioned) {
          competitorMentionCounts.set(name, (competitorMentionCounts.get(name) ?? 0) + 1);
        }
      }
    }

    const topCompetitors = Array.from(competitorMentionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    // Normalize response payload for client UI
    const responseItems = responses.map((r) => {
      const pj = (r.parsed_json ?? {}) as ParsedJson;
      const base = {
        id: r.id,
        prompt_ordinal: r.prompt_ordinal,
        created_at: r.created_at,
        parse_ok: Boolean(r.parse_ok),
        client_mentioned: Boolean(pj.client_mentioned),
        client_position: pj.client_position ?? null,
        recommendation_strength: pj.recommendation_strength ?? null,
        competitors_mentioned: Array.isArray(pj.competitors_mentioned) ? pj.competitors_mentioned : [],
        has_sources_or_citations: Boolean(pj.has_sources_or_citations),
        has_specific_features: Boolean(pj.has_specific_features),
        evidence_snippet: pj.evidence_snippet ?? null
      };
      if (!includeDebug) return base;
      return {
        ...base,
        prompt_text: r.prompt_text ?? null,
        raw_text: r.raw_text ?? null
      };
    });

    return NextResponse.json({
      snapshot: snapRes.data,
      client: {
        id: clientRes.data.id,
        name: clientRes.data.name,
        website: clientRes.data.website,
        industry: clientRes.data.industry
      },
      competitors,
      summary: {
        responses_count: responses.length,
        client_mentioned_count: clientMentionedCount,
        sources_count: sourcesCount,
        specific_features_count: featuresCount,
        top_competitors: topCompetitors
      },
      responses: responseItems,
      debug: {
        enabled: debugEnabled,
        allowed: debugAllowed,
        included: includeDebug
      }
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


