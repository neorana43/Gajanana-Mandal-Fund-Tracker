import { createClient } from "@/lib/supabase";

export async function onboardMandalUser(
  userId: string,
  userMetadata: Record<string, unknown>,
) {
  if (!userMetadata?.mandal_id || !userMetadata?.role) return;

  const supabase = createClient();

  // Check if already in mandal_users
  const { data: existing } = await supabase
    .from("mandal_users")
    .select("id")
    .eq("mandal_id", userMetadata.mandal_id)
    .eq("user_id", userId)
    .single();

  if (!existing) {
    await supabase.from("mandal_users").insert({
      mandal_id: userMetadata.mandal_id,
      user_id: userId,
      role: userMetadata.role,
      status: "active",
    });
  }
}
