import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-2xl font-bold">Gajanana Mandal Fund Tracker</h1>
        <p className="text-muted-foreground text-sm">
          Volunteers and admins can log in to manage donations, expenses, and
          budgets.
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
