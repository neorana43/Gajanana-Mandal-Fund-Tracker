import { cookies } from "next/headers";
import { createServerClientWithCookies } from "@/lib/supabase";
import FundChart from "@/components/charts/FundChart";
import UserFundUsageChart from "@/components/charts/UserFundUsageChart";
import Link from "next/link";

function groupByDate<
  T extends { amount: number; created_at?: string; date?: string },
>(data: T[], key: "created_at" | "date") {
  const result: Record<string, number> = {};
  data.forEach((item) => {
    const date = new Date(item[key] || "").toISOString().split("T")[0];
    result[date] = (result[date] || 0) + Number(item.amount);
  });
  return result;
}

export default async function InternalDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  const [
    { data: donations },
    { data: expenses },
    { data: sponsors },
    { data: user },
  ] = await Promise.all([
    supabase.from("donations").select("amount, created_at"),
    supabase.from("expenses").select("amount, date, created_by"),
    supabase.from("sponsors").select("amount"),
    supabase.auth.getUser(),
  ]);

  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("id", user?.user?.id)
    .single();

  const isAdmin = roleData?.role === "admin";

  const donationByDate = groupByDate(donations || [], "created_at");
  const expenseByDate = groupByDate(expenses || [], "date");

  const dates = Array.from(
    new Set([...Object.keys(donationByDate), ...Object.keys(expenseByDate)]),
  ).sort();

  const chartData = dates.map((date) => ({
    date,
    donations: donationByDate[date] || 0,
    expenses: expenseByDate[date] || 0,
  }));

  const totalDonations =
    donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const totalExpenses =
    expenses?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const totalSecretFunds =
    sponsors?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const balance = totalDonations - totalExpenses;

  // Admin-only: fetch allocations + expenses per user
  let usageData: { email: string; allocated: number; spent: number }[] = [];
  if (isAdmin) {
    const [{ data: allUsers }, { data: allocations }] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from("user_allocations").select("user_id, amount"),
    ]);

    usageData =
      allUsers?.users
        .filter((u) => u.email) // Filter out users without emails
        .map((u) => {
          const allocated =
            allocations
              ?.filter((a) => a.user_id === u.id)
              .reduce((sum, a) => sum + Number(a.amount), 0) || 0;
          const spent =
            expenses
              ?.filter((e) => e.created_by === u.id)
              .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
          return {
            email: u.email!,
            allocated,
            spent,
          };
        }) || [];
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold">Internal Finance Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-semibold text-white text-center">
        <div className="bg-orange-500 p-4 rounded shadow">
          💰 Donations: ₹{totalDonations}
        </div>
        <div className="bg-red-600 p-4 rounded shadow">
          💸 Expenses: ₹{totalExpenses}
        </div>
        <div className="bg-yellow-600 p-4 rounded shadow">
          🕵️ Secret Sponsors: ₹{totalSecretFunds}
        </div>
        <div className="bg-green-700 p-4 rounded shadow">
          🏦 Balance: ₹{balance}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">
          📈 Donation vs Expense Trends
        </h2>
        <FundChart data={chartData} />
      </div>

      {isAdmin && (
        <>
          <div className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">
              ⚙️ Quick Links (Admin Only)
            </h2>
            <div className="flex gap-4 flex-wrap">
              <Link href="/donate/list">
                <button className="bg-white shadow px-4 py-2 rounded border hover:bg-gray-100">
                  📋 View Donations
                </button>
              </Link>
              <Link href="/expense/list">
                <button className="bg-white shadow px-4 py-2 rounded border hover:bg-gray-100">
                  💸 View Expenses
                </button>
              </Link>
              <Link href="/secret/list">
                <button className="bg-white shadow px-4 py-2 rounded border hover:bg-gray-100">
                  🕵️ View Sponsors
                </button>
              </Link>
              <Link href="/funds/allocate">
                <button className="bg-white shadow px-4 py-2 rounded border hover:bg-gray-100">
                  🎯 Allocate Funds
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-2">📊 User Fund Usage</h2>
            <UserFundUsageChart data={usageData} />
          </div>
        </>
      )}
    </div>
  );
}
