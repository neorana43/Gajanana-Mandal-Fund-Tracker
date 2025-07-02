"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import MainNav from "@/components/layouts/MainNav";

export default function MainNavWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const supabase = createClient();
    // Initial check
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session?.user);
    });
    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session?.user);
      },
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);
  if (isLoggedIn === null) return null; // or a spinner
  if (!isLoggedIn) return null;
  return <MainNav />;
}
