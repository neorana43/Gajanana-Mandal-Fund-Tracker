// lib/auth/getUserRole.ts
import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserRole(supabase: SupabaseClient) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

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
