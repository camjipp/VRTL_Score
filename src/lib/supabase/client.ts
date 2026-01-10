// Back-compat shim: prefer `getSupabaseBrowserClient()` from `src/lib/supabase/browser.ts`.
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const supabase = getSupabaseBrowserClient();



