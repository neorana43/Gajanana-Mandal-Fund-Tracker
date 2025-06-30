import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import MainNav from "@/components/layouts/MainNav";
import ThemeInitializer from "@/components/theme-initializer"; // ✅ Use client-safe hook

export const metadata: Metadata = {
  title: "Gajanana Mandal Fund Tracker",
  description:
    "Track donations, expenses, sponsors, and more for Ganesh Mandal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-background text-foreground`}
      >
        <ThemeInitializer />
        <MainNav />
        <main className="pt-14 sm:pt-16">{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
