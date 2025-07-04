"use client";
import Link from "next/link";
import { useEffect, useState, useContext } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { MandalSlugContext } from "@/app/mandal/[slug]/MandalSlugProvider";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const slug = useContext(MandalSlugContext);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session?.user);
    });
  }, [supabase]);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-2 glass shadow-glass backdrop-blur-md h-16">
      <Link href={slug ? `/mandal/${slug}/dashboard` : "/"}>
        <Image
          src="/logo.svg"
          alt="App Logo"
          height={48}
          width={160}
          className="h-12 w-auto"
          priority
        />
      </Link>
      {isLoggedIn && (
        <Button
          variant="glass"
          onClick={handleLogout}
          className="text-sm font-medium"
        >
          Logout
        </Button>
      )}
    </header>
  );
}
