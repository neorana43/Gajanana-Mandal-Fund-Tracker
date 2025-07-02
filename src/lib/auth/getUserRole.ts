// lib/auth/getUserRole.ts
import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserRole(supabase: SupabaseClient) {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return null;
  }

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", user.id)
    .single();

  return roleData?.role || null;
}
