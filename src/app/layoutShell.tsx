"use client";
import Header from "@/components/layouts/Header";
import MainNavWrapper from "@/components/layouts/MainNavWrapper";
import { usePathname } from "next/navigation";

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideHeader = ["/login", "/reset-password", "/signup"].includes(
    pathname,
  );
  return (
    <>
      {!hideHeader && <Header />}
      {!hideHeader && <MainNavWrapper />}
      <main className="pt-20 sm:pt-24 min-h-screen flex flex-col">
        {children}
      </main>
    </>
  );
}
