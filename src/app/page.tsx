import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex items-center justify-center p-6 text-center h-full my-auto max-w-2xl w-full mx-auto">
      <div className="space-y-6 w-full">
        <h1 className="text-2xl font-bold">Gajanana Mandal Fund Tracker</h1>
        <p className="text-muted-foreground text-sm">
          Volunteers and admins can log in to manage donations, expenses, and
          budgets.
        </p>
        <Link
          href="/login"
          className={buttonVariants({ variant: "default", size: "default" })}
        >
          Login
        </Link>
      </div>
    </div>
  );
}
