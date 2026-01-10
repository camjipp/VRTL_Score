import { createClient } from "@supabase/supabase-js";

export function getSupabaseBrowserClient() {
  // IMPORTANT: Use static env var access so Next can inline values into the client bundle.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient(url, anonKey);
}


