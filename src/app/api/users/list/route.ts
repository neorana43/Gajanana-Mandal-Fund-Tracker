import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (userId) {
      // Fetch a single user
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(
        userId,
      );
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (!data.user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      const user = data.user;
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError) {
        // Log the error but proceed, maybe with a default/null role
        console.error(`Could not fetch role for user ${user.id}:`, roleError);
      }

      const simplifiedUser = {
        id: user.id,
        email: user.email,
        displayName: user.user_metadata?.display_name,
        phone: user.user_metadata?.phone,
        userType: roleData?.role || "volunteer",
      };

      return NextResponse.json({ users: [simplifiedUser] }, { status: 200 });
    }

    // Fetch all users
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userIds = data.users.map((u) => u.id);
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("id, role")
      .in("id", userIds);

    if (roleError) {
      return NextResponse.json({ error: roleError.message }, { status: 500 });
    }

    const roleMap = new Map(roleData?.map((r) => [r.id, r.role]) || []);

    const simplifiedUsers = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.user_metadata?.display_name,
      phone: u.user_metadata?.phone,
      userType: roleMap.get(u.id) || "volunteer", // Default to volunteer
    }));

    return NextResponse.json({ users: simplifiedUsers }, { status: 200 });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 },
    );
  }
}
