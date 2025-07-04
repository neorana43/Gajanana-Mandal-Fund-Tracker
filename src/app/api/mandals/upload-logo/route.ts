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

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const fileName = `mandal-logo-${Date.now()}`;
  const { error } = await supabase.storage
    .from("mandal-logos")
    .upload(fileName, file, { upsert: true, contentType: file.type });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const {
    data: { publicUrl },
  } = supabase.storage.from("mandal-logos").getPublicUrl(fileName);
  return NextResponse.json({ url: publicUrl }, { status: 200 });
}
