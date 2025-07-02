import type { Metadata } from "next";
import Link from "next/link";
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

        <MainNavWrapper />
        <main className="py-14 sm:py-16 min-h-screen flex flex-col">
          <div className="w-full flex justify-center items-center py-4">
            <Link href="/">
              <img
                src="/logo.svg"
                alt="App Logo"
                height={70}
                className="h-20 w-auto"
              />
            </Link>
          </div>
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
