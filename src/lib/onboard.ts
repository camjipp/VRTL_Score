import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { fetchWithTimeout } from "@/lib/fetchWithTimeout";

export async function ensureOnboarded(): Promise<{ agencyId: string; accessToken: string }> {
  const supabase = getSupabaseBrowserClient();
  const sessionRes = await supabase.auth.getSession();
  const accessToken = sessionRes.data.session?.access_token;
  if (!accessToken) throw new Error("Not authenticated");

  const res = await fetchWithTimeout(
    "/api/onboard",
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}` } },
    25000, // 25s timeout (handles serverless cold starts)
    1     // 1 retry after 2s
  );
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as { agency_id: string };
  if (!json.agency_id) throw new Error("Onboard did not return agency_id");
  return { agencyId: json.agency_id, accessToken };
}


