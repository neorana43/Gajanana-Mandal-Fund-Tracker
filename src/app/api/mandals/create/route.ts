import { NextRequest, NextResponse } from "next/server";
import { createServerClientWithCookies } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  // Check admin role
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (roleData?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Parse body
  const body = await req.json();
  const { name, description, address, logo } = body;
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Insert mandal with owner_id
  const { data: mandal, error: mandalError } = await supabase
    .from("mandals")
    .insert([{ name, description, address, logo, owner_id: user.id }])
    .select()
    .single();

  if (mandalError) {
    return NextResponse.json({ error: mandalError.message }, { status: 500 });
  }

  // Insert creator as admin in mandal_users
  const { error: muError } = await supabase.from("mandal_users").insert([
    {
      mandal_id: mandal.id,
      user_id: user.id,
      role: "admin",
      status: "active",
      invited_by: user.id,
      accepted_at: new Date().toISOString(),
    },
  ]);
  if (muError) {
    return NextResponse.json({ error: muError.message }, { status: 500 });
  }

  return NextResponse.json({ mandal }, { status: 201 });
}
