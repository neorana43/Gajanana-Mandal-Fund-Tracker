import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import ThemeInitializer from "@/components/theme-initializer"; // ✅ Use client-safe hook
import MainNavWrapper from "@/components/layouts/MainNavWrapper";

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
        <MainNavWrapper />
        <main className="py-14 sm:py-16 min-h-screen flex flex-col">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
