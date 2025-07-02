import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return data.user;
}
