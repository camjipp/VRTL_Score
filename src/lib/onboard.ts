import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function ensureOnboarded(): Promise<{ agencyId: string; accessToken: string }> {
  const supabase = getSupabaseBrowserClient();
  const sessionRes = await supabase.auth.getSession();
  const accessToken = sessionRes.data.session?.access_token;
  if (!accessToken) throw new Error("Not authenticated");

  const res = await fetch("/api/onboard", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as { agency_id: string };
  if (!json.agency_id) throw new Error("Onboard did not return agency_id");
  return { agencyId: json.agency_id, accessToken };
}


