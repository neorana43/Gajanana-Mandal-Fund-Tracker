import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">
        Welcome to Gajanana Fund Tracker
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        View public donation stats or log in to manage Mandal funds.
      </p>

      <div className="space-x-4">
        <Link href="/dashboard">
          <Button variant="default">View Dashboard</Button>
        </Link>
        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>
    </main>
  );
}
