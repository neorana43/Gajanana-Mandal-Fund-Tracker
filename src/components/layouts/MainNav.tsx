"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Home,
  PlusCircle,
  FileText,
  Lock,
  Menu,
  LogIn,
  LogOut,
  LucideProps,
  Landmark,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  label: string;
  action?: () => void;
  type?: "menu";
};

const navItems = (role: string | null, isLoggedIn: boolean): NavItem[] => {
  if (!isLoggedIn) {
    return [
      {
        href: "/login",
        icon: LogIn,
        label: "Login",
      },
    ];
  }

  const baseItems: NavItem[] = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/donate/list", icon: PlusCircle, label: "Donate" },
    { href: "/expense/list", icon: FileText, label: "Expenses" },
  ];

  if (role === "admin") {
    baseItems.push({ href: "/funds/list", icon: Landmark, label: "Funds" });
    baseItems.push({ href: "/secret/list", icon: Lock, label: "Secret" });
  }

  baseItems.push({
    href: "#",
    icon: Menu,
    label: "Menu",
    type: "menu",
  });

  return baseItems;
};

export default function MainNav() {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (user) {
        setIsLoggedIn(true);
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(roleData?.role || null);
      } else {
        setIsLoggedIn(false);
        setRole(null);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-background border-t shadow-sm">
        <ul className="relative flex justify-between items-center px-4 py-2">
          {navItems(role, isLoggedIn).map((item) => {
            const isActive = pathname.startsWith(item.href);

            if (item.type === "menu") {
              return (
                <li
                  key="menu"
                  className="flex-1 text-center flex justify-center items-center"
                >
                  <Button
                    onClick={() => setShowMenu(true)}
                    variant={"ghost"}
                    className="relative flex flex-col items-center text-xs font-medium text-muted-foreground hover:bg-transparent cursor-pointer hover:text-primary transition"
                  >
                    <item.icon className="h-5 w-5 mb-1" />
                    {item.label}
                  </Button>
                </li>
              );
            }

            return (
              <li key={item.href} className="flex-1 text-center">
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center text-xs font-medium transition-all duration-200 ease-in-out hover:no-underline",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  <item.icon className="h-5 w-5 mb-1 transition-transform duration-200" />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-1/2 w-4 h-1 bg-primary rounded-full -translate-x-2/4"
                      style={{ transform: "translateX(-50%)" }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}

          {isLoggedIn && (
            <li className="flex-1 text-center flex justify-center items-center">
              <Button
                onClick={handleLogout}
                variant={"ghost"}
                className="relative flex flex-col items-center hover:bg-transparent cursor-pointer text-xs font-medium transition-all duration-200 ease-in-out hover:no-underline hover:text-primary hover:font-semibold"
              >
                <LogOut className="h-5 w-5 mb-1 transition-transform duration-200" />
                Logout
              </Button>
            </li>
          )}
        </ul>
      </nav>

      {/* Menu drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center sm:justify-center">
          <div className="bg-white dark:bg-background rounded-t-xl sm:rounded-xl w-full sm:max-w-sm p-4">
            <h2 className="text-lg font-semibold mb-2">Quick Menu</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard/user"
                  onClick={() => setShowMenu(false)}
                  className="block p-2 rounded hover:bg-muted"
                >
                  My Dashboard
                </Link>
              </li>
              {role === "admin" && (
                <>
                  <li>
                    <Link
                      href="/users/list"
                      onClick={() => setShowMenu(false)}
                      className="block p-2 rounded hover:bg-muted"
                    >
                      User List
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <Button
              onClick={() => setShowMenu(false)}
              className="mt-4 w-full text-sm text-muted-foreground"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
