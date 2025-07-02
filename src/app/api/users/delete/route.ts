import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const toggleUserActiveSchema = z.object({
  id: z.string().uuid(),
  setActive: z.boolean(),
});

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const parsed = toggleUserActiveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid user ID or status provided." },
        { status: 400 },
      );
    }

    const { id, setActive } = parsed.data;

    // Fetch current user to preserve other metadata
    const { data: userData, error: getUserError } =
      await supabaseAdmin.auth.admin.getUserById(id);
    if (getUserError || !userData?.user) {
      return NextResponse.json(
        { error: getUserError?.message || "User not found." },
        { status: 404 },
      );
    }

    const currentMeta = userData.user.user_metadata || {};
    const newMeta = { ...currentMeta, active: setActive };

    // Update user metadata to set active/inactive
    const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      user_metadata: newMeta,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
