import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2, "Display name must be at least 2 characters."),
  phone: z.string().optional(),
  userType: z.enum(["admin", "volunteer"], {
    required_error: "User type is required",
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = userSchema.safeParse(body);

    if (!parsed.success) {
      const message =
        parsed.error.errors.map((e) => e.message).join(", ") ||
        "Invalid data provided.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, password, displayName, phone, userType } = parsed.data;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: displayName,
        phone: phone,
        user_type: userType,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Set the user's role in the user_roles table
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert([{ id: data.user.id, role: userType }]);

    if (roleError) {
      // If role assignment fails, delete the created user to maintain consistency
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      return NextResponse.json(
        { error: "Failed to assign user role." },
        { status: 500 },
      );
    }

    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
