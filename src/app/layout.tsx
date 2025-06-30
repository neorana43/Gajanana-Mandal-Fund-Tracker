import "./globals.css";
import { Inter } from "next/font/google";
import MainNav from "@/components/layouts/MainNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Gajanana Fund Manager",
  description: "Track Ganesh Mandal donations & expenses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainNav />
        {children}
      </body>
    </html>
  );
}
