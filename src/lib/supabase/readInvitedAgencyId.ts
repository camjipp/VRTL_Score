import type { User } from "@supabase/supabase-js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Workspace invitations should set one of these on the Supabase user (user_metadata or app_metadata):
 * `join_agency_id`, `invited_agency_id` (UUID of an existing agency).
 * On first `/api/onboard`, the user is linked to that agency as `member` instead of creating a new empty agency.
 */
export function readInvitedAgencyId(user: User): string | null {
  const buckets = [user.user_metadata, user.app_metadata] as const;
  const keys = ["join_agency_id", "invited_agency_id"] as const;
  for (const obj of buckets) {
    if (!obj || typeof obj !== "object") continue;
    const rec = obj as Record<string, unknown>;
    for (const k of keys) {
      const v = rec[k];
      if (typeof v === "string" && UUID_RE.test(v.trim())) return v.trim();
    }
  }
  return null;
}
