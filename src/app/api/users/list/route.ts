import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch all user roles in one query
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("id, role");

    // Create a map of user IDs to roles
    const roleMap = new Map(roleData?.map((r) => [r.id, r.role]) || []);

    const simplifiedUsers = data.users.map((u) => ({
      id: u.id,
      email: u.email || "(no email)",
      displayName: u.user_metadata?.display_name || "N/A",
      phone: u.user_metadata?.phone || "N/A",
      userType: roleMap.get(u.id) || u.user_metadata?.user_type || "volunteer",
    }));

    return NextResponse.json({ users: simplifiedUsers }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
