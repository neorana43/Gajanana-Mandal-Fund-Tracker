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
  const { id, name, description, address, logo } = body;
  if (!id || !name) {
    return NextResponse.json(
      { error: "ID and name are required" },
      { status: 400 },
    );
  }

  // Update mandal
  const { data, error } = await supabase
    .from("mandals")
    .update({ name, description, address, logo })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ mandal: data }, { status: 200 });
}
