import { NextRequest, NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
  
  const token = authHeader.slice(7);
  const supabase = getSupabaseAdminClient();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
  
  const isSuperAdmin = isAdminEmail(user.email);
  
  return NextResponse.json({ isAdmin: isSuperAdmin });
}

