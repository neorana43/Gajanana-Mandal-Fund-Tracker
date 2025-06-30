import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateUserSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  phone: z.string().optional(),
  email: z.string().email(),
  userType: z.enum(["admin", "volunteer"], {
    required_error: "User type is required",
  }),
});

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { id, email, displayName, phone, userType } = parsed.data;

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      user_metadata: {
        display_name: displayName,
        phone: phone || null,
        user_type: userType,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update the user's role in the user_roles table
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .upsert({ id, role: userType }, { onConflict: "id" });

    if (roleError) {
      return NextResponse.json(
        { error: "Failed to update user role." },
        { status: 500 },
      );
    }

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
