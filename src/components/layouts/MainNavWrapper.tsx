"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import MainNav from "@/components/layouts/MainNav";

export default function MainNavWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session?.user);
    });
  }, []);
  if (isLoggedIn === null) return null; // or a spinner
  if (!isLoggedIn) return null;
  return <MainNav />;
}
