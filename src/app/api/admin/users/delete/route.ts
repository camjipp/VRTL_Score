import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    // Get auth header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }
    const token = authHeader.slice(7);

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the requesting user
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !requestingUser) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if admin
    const email = requestingUser.email?.toLowerCase() ?? "";
    if (!ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get the user ID to delete
    const body = await req.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === requestingUser.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Get the user to delete (to find their agency)
    const { data: targetUser, error: targetError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (targetError || !targetUser?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the agency owned by this user
    const { data: agency } = await supabaseAdmin
      .from("agencies")
      .select("id")
      .eq("owner_id", userId)
      .maybeSingle();

    if (agency) {
      // Delete all related data in order (respecting foreign keys)
      
      // 1. Get all clients for this agency
      const { data: clients } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("agency_id", agency.id);

      if (clients && clients.length > 0) {
        const clientIds = clients.map((c) => c.id);

        // 2. Get all snapshots for these clients
        const { data: snapshots } = await supabaseAdmin
          .from("snapshots")
          .select("id")
          .in("client_id", clientIds);

        if (snapshots && snapshots.length > 0) {
          const snapshotIds = snapshots.map((s) => s.id);

          // 3. Delete prompt_responses for these snapshots
          await supabaseAdmin
            .from("prompt_responses")
            .delete()
            .in("snapshot_id", snapshotIds);

          // 4. Delete snapshots
          await supabaseAdmin
            .from("snapshots")
            .delete()
            .in("client_id", clientIds);
        }

        // 5. Delete competitors for these clients
        await supabaseAdmin
          .from("competitors")
          .delete()
          .in("client_id", clientIds);

        // 6. Delete clients
        await supabaseAdmin
          .from("clients")
          .delete()
          .eq("agency_id", agency.id);
      }

      // 7. Delete the agency
      await supabaseAdmin
        .from("agencies")
        .delete()
        .eq("id", agency.id);
    }

    // 8. Finally, delete the user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "User and all associated data deleted successfully" 
    });
  } catch (e) {
    console.error("Delete user error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

