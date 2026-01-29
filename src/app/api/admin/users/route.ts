import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function GET(req: NextRequest) {
  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // Create admin client (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the requesting user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if admin
    const email = user.email?.toLowerCase() ?? "";
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Fetch all agency_users with their agencies (bypasses RLS)
    const { data: agencyUsers, error: agencyUsersErr } = await supabaseAdmin
      .from("agency_users")
      .select(`
        user_id,
        role,
        created_at,
        agencies (
          id, 
          name, 
          is_active, 
          created_at, 
          plan,
          clients(count)
        )
      `)
      .order("created_at", { ascending: false });

    if (agencyUsersErr) {
      return NextResponse.json({ error: agencyUsersErr.message }, { status: 500 });
    }

    // Also get user emails from auth.users
    const userIds = (agencyUsers ?? []).map((au) => au.user_id);
    const userEmails: Record<string, string> = {};
    
    // Fetch each user's email (admin API)
    for (const userId of userIds) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userData?.user?.email) {
          userEmails[userId] = userData.user.email;
        }
      } catch {
        // Skip if user not found
      }
    }

    // Build response
    const users = (agencyUsers ?? []).map((au) => {
      const agencyData = au.agencies as unknown as {
        id: string;
        name: string;
        is_active: boolean;
        created_at: string;
        plan?: string;
        clients?: { count: number }[];
      } | null;

      return {
        id: au.user_id,
        email: userEmails[au.user_id] ?? "",
        role: au.role,
        created_at: au.created_at ?? agencyData?.created_at ?? "",
        agency: agencyData ? {
          id: agencyData.id,
          name: agencyData.name,
          is_active: agencyData.is_active,
          created_at: agencyData.created_at,
          plan: agencyData.plan,
          clients: agencyData.clients
        } : null
      };
    });

    return NextResponse.json({ users });
  } catch (e) {
    console.error("Admin users list error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

