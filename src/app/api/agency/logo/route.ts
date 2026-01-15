import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOGO_BUCKET = process.env.AGENCY_LOGO_BUCKET || "agency-logos";

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function isMissingColumnError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const any = e as { code?: unknown; message?: unknown; details?: unknown };
  const code = typeof any.code === "string" ? any.code : "";
  const msg = typeof any.message === "string" ? any.message : "";
  const details = typeof any.details === "string" ? any.details : "";
  return code === "PGRST204" || msg.includes("schema cache") || details.includes("schema cache");
}

export async function POST(req: Request) {
  try {
    const token = bearerToken(req);
    if (!token) return NextResponse.json({ error: "Missing Authorization" }, { status: 401 });

    const supabase = getSupabaseAdminClient();
    const userRes = await supabase.auth.getUser(token);
    const user = userRes.data.user;
    if (userRes.error || !user) {
      return NextResponse.json(
        { error: userRes.error?.message ?? "Unauthorized" },
        { status: 401 }
      );
    }

    const agencyUser = await supabase
      .from("agency_users")
      .select("agency_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (agencyUser.error || !agencyUser.data?.agency_id) {
      return NextResponse.json({ error: "User not onboarded" }, { status: 403 });
    }
    const agencyId = agencyUser.data.agency_id as string;

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${agencyId}/logo.${ext}`;

    const upload = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (upload.error) {
      return NextResponse.json(
        {
          error: upload.error.message,
          hint: `Ensure Supabase Storage bucket '${LOGO_BUCKET}' exists (public recommended for v1).`
        },
        { status: 500 }
      );
    }

    const publicUrl = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl;

    // Try to persist to agencies.brand_logo_url; if the column doesn't exist, still return the URL.
    const upd = await supabase
      .from("agencies")
      .update({ brand_logo_url: publicUrl })
      .eq("id", agencyId)
      .select("id")
      .maybeSingle();
    if (upd.error && !isMissingColumnError(upd.error)) {
      return NextResponse.json({ error: upd.error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, brand_logo_url: publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


