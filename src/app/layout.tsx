import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import ThemeInitializer from "@/components/theme-initializer"; // ✅ Use client-safe hook
import MainNavWrapper from "@/components/layouts/MainNavWrapper";
import Header from "@/components/layouts/Header";

export const metadata: Metadata = {
  title: "Gajanana Mandal Fund Tracker",
  description:
    "Track donations, expenses, sponsors, and more for Ganesh Mandal.",
  icons: {
    icon: "/app-icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ff9700" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans bg-background text-foreground`}
      >
        <ThemeInitializer />
        <Header />
        <MainNavWrapper />
        <main className="pt-20 sm:pt-24 min-h-screen flex flex-col">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
