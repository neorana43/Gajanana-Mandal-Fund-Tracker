import { NextRequest, NextResponse } from "next/server";
import { createServerClientWithCookies } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  // Check session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  const body = await req.json();
  const { mandal_id, email, role } = body;
  if (!mandal_id || !email || !role) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Check if inviter is admin for this mandal
  const { data: adminRow } = await supabase
    .from("mandal_users")
    .select("role")
    .eq("mandal_id", mandal_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();
  if (!adminRow || adminRow.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Find user by email
  const { data: userRows } = await supabase
    .from("users")
    .select("id")
    .eq("email", email);
  const invitedUser = userRows && userRows.length > 0 ? userRows[0] : null;
  if (!invitedUser) {
    // Optionally, send invite email here
    return NextResponse.json(
      { error: "User not found. Please ask them to sign up first." },
      { status: 404 },
    );
  }

  // Insert invite into mandal_users
  const { error: muError } = await supabase.from("mandal_users").insert([
    {
      mandal_id,
      user_id: invitedUser.id,
      role,
      status: "invited",
      invited_by: user.id,
      invited_at: new Date().toISOString(),
    },
  ]);
  if (muError) {
    return NextResponse.json({ error: muError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
