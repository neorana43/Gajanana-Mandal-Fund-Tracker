"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase";
import {
  Home,
  PlusCircle,
  FileText,
  Lock,
  Menu,
  LogIn,
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
  const [role, setRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [navShrink, setNavShrink] = useState(false);
  const lastScrollY = useRef(0);

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
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 32) {
        setNavShrink(true);
      } else {
        setNavShrink(false);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "glass fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center px-1 lg:px-12 rounded-2xl shadow-2xl transition-all duration-300",
          "w-[95vw] max-w-2xl",
          navShrink
            ? "h-12 py-1 scale-95 opacity-90"
            : "h-16 py-2 scale-100 opacity-100",
        )}
        aria-label="Bottom Navigation Bar"
        role="navigation"
      >
        <ul className="relative flex justify-between items-center px-2 py-0 w-full">
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
                    className="relative flex h-fit gap-0 py-0 !px-0 min-w-fit flex-col shadow-none items-center text-xs font-medium text-muted-foreground hover:bg-transparent cursor-pointer hover:text-primary transition transform-none active:scale-100 hover:scale-100 hover:-translate-y-0 active:-translate-y-0"
                  >
                    <item.icon className="h-5 w-5 mb-1 transition-transform duration-200" />
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
        </ul>
      </nav>

      {/* Menu drawer */}
      {showMenu && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center sm:justify-center">
          <div className="glass w-full sm:max-w-sm p-4 rounded-t-xl sm:rounded-xl">
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
              className="mt-4 w-full text-sm "
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
