"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function MainNav() {
  const supabase = createClient();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      setIsLoggedIn(!!user);

      if (user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(roleData?.role || null);
      }
    };
    check();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="w-full bg-saffron text-white px-4 py-2 flex justify-between items-center sticky top-0 z-50 shadow-md">
      <Link href="/" className="font-bold text-lg">
        Gajanana Mandal
      </Link>

      <div className="flex items-center gap-4 text-sm">
        <Link href="/dashboard">Dashboard</Link>
        {isLoggedIn && <Link href="/dashboard/internal">Internal</Link>}
        {role === "admin" && (
          <>
            <Link href="/donate/list">Donations</Link>
            <Link href="/expense/list">Expenses</Link>
            <Link href="/secret/list">Sponsors</Link>
          </>
        )}
        {isLoggedIn && <Link href="/dashboard/user">My Dashboard</Link>}
        {!isLoggedIn ? (
          <Link href="/login">
            <Button
              size="sm"
              className="bg-maroon hover:bg-maroon/90 text-white"
            >
              Login
            </Button>
          </Link>
        ) : (
          <Button
            size="sm"
            onClick={handleLogout}
            className="bg-maroon hover:bg-maroon/90 text-white"
          >
            Logout
          </Button>
        )}
      </div>
    </nav>
  );
}
