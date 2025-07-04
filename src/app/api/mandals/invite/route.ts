import { NextRequest, NextResponse } from "next/server";
import {
  createClient,
  createAdminClient,
} from "../../../../lib/supabase/server";

export async function POST(req: NextRequest) {
  // Use regular client for user authentication and mandal admin check
  const supabase = await createClient();

  // Securely get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Auth error:", userError);
    return NextResponse.json(
      { error: "Unauthorized", details: userError },
      { status: 401 },
    );
  }

  // Parse body
  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error("JSON parse error:", e);
    return NextResponse.json(
      { error: "Invalid JSON", details: e },
      { status: 400 },
    );
  }
  const { mandal_id, email, role } = body;
  if (!mandal_id || !email || !role) {
    console.error("Missing fields:", { mandal_id, email, role });
    return NextResponse.json(
      { error: "Missing fields", details: { mandal_id, email, role } },
      { status: 400 },
    );
  }

  // Check if inviter is admin for this mandal
  const { data: adminRow, error: adminError } = await supabase
    .from("mandal_users")
    .select("role")
    .eq("mandal_id", mandal_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();
  if (adminError) {
    console.error("Admin check error:", adminError);
    return NextResponse.json(
      { error: "Admin check failed", details: adminError },
      { status: 400 },
    );
  }
  if (!adminRow || adminRow.role !== "admin") {
    console.error("Forbidden: not admin", {
      userId: user.id,
      mandal_id,
      adminRow,
    });
    return NextResponse.json(
      { error: "Forbidden", details: { userId: user.id, mandal_id, adminRow } },
      { status: 403 },
    );
  }

  // Check if user already exists in Supabase Auth
  const authRes = await fetch(
    `${
      process.env.NEXT_PUBLIC_SUPABASE_URL
    }/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        apiKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    },
  );
  const userList = await authRes.json();
  console.log("Supabase Auth Admin API userList:", userList);
  const existingAuthUser =
    (Array.isArray(userList.users) && userList.users[0]) ||
    (Array.isArray(userList) && userList[0]) ||
    null;

  if (existingAuthUser) {
    // Add to mandal_users if not already present
    const { data: mandalUser } = await supabase
      .from("mandal_users")
      .select("id")
      .eq("mandal_id", mandal_id)
      .eq("user_id", existingAuthUser.id)
      .single();

    if (!mandalUser) {
      await supabase.from("mandal_users").insert({
        mandal_id,
        user_id: existingAuthUser.id,
        role,
        status: "active",
      });
    }
    return NextResponse.json({ status: "added_existing_user" });
  }

  // If not, invite via Supabase Auth
  const adminSupabase = createAdminClient();
  const { error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(email, {
      data: { mandal_id, role },
    });

  if (inviteError) {
    console.error("Invite error:", inviteError);
    return NextResponse.json(
      { error: inviteError.message, details: inviteError },
      { status: 400 },
    );
  }

  return NextResponse.json({ status: "invited" });
}
