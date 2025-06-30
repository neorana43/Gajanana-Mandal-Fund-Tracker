// lib/auth/getUserRole.ts
import { createClient } from "../supabase";

export const getUserRole = async () => {
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) return null;

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", user.user.id)
    .single();

  return data?.role || null;
};
