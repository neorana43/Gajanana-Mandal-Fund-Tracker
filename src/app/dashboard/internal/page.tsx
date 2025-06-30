import { cookies } from "next/headers";
import { createServerClientWithCookies } from "@/lib/supabase";
import FundChart from "@/components/charts/FundChart";
import UserFundUsageChart from "@/components/charts/UserFundUsageChart";
import Link from "next/link";
import { ArrowRight, FileText, PiggyBank, Users } from "lucide-react";

type UsageEntry = {
  email: string;
  allocated: number;
  spent: number;
};

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

  // Admin-only fund usage breakdown

  let usageData: UsageEntry[] = [];
  if (isAdmin) {
    const [{ data: allUsers }, { data: allocations }] = await Promise.all([
      supabase.auth.admin.listUsers(),
      supabase.from("user_allocations").select("user_id, amount"),
    ]);

    usageData =
      allUsers?.users.map((u) => {
        const allocated =
          allocations
            ?.filter((a) => a.user_id === u.id)
            .reduce((sum, a) => sum + Number(a.amount), 0) || 0;
        const spent =
          expenses
            ?.filter((e) => e.created_by === u.id)
            .reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        return {
          email: u.email || "", // ✅ fallback to empty string
          allocated,
          spent,
        };
      }) || [];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-bold text-maroon-800 text-center">
        📊 Internal Finance Dashboard
      </h1>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-orange-500 text-white p-4 rounded-lg shadow text-center">
          <div className="text-sm">💰 Donations</div>
          <div className="text-xl font-bold">₹{totalDonations}</div>
        </div>
        <div className="bg-red-600 text-white p-4 rounded-lg shadow text-center">
          <div className="text-sm">💸 Expenses</div>
          <div className="text-xl font-bold">₹{totalExpenses}</div>
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded-lg shadow text-center">
          <div className="text-sm">🕵️ Secret Sponsors</div>
          <div className="text-xl font-bold">₹{totalSecretFunds}</div>
        </div>
        <div className="bg-green-700 text-white p-4 rounded-lg shadow text-center">
          <div className="text-sm">🏦 Balance</div>
          <div className="text-xl font-bold">₹{balance}</div>
        </div>
      </div>

      {/* Chart Block */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-maroon-800 mb-4">
          📈 Donation vs Expense Trends
        </h2>
        <FundChart data={chartData} />
      </div>

      {/* Admin only: quick links + usage chart */}
      {isAdmin && (
        <>
          {/* Admin Quick Links */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-maroon-800 mb-4">
              ⚙️ Admin Quick Links
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link href="/donate/list">
                <div className="bg-gray-100 hover:bg-gray-200 transition rounded-lg p-4 text-center shadow">
                  <FileText className="mx-auto text-maroon-800 mb-1" />
                  <span className="text-sm">Donations</span>
                </div>
              </Link>
              <Link href="/expense/list">
                <div className="bg-gray-100 hover:bg-gray-200 transition rounded-lg p-4 text-center shadow">
                  <PiggyBank className="mx-auto text-maroon-800 mb-1" />
                  <span className="text-sm">Expenses</span>
                </div>
              </Link>
              <Link href="/secret/list">
                <div className="bg-gray-100 hover:bg-gray-200 transition rounded-lg p-4 text-center shadow">
                  <Users className="mx-auto text-maroon-800 mb-1" />
                  <span className="text-sm">Sponsors</span>
                </div>
              </Link>
              <Link href="/funds/allocate">
                <div className="bg-gray-100 hover:bg-gray-200 transition rounded-lg p-4 text-center shadow">
                  <ArrowRight className="mx-auto text-maroon-800 mb-1" />
                  <span className="text-sm">Allocate Funds</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Fund usage breakdown */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-semibold text-maroon-800 mb-4">
              👤 User Fund Usage
            </h2>
            <UserFundUsageChart data={usageData} />
          </div>
        </>
      )}
    </div>
  );
}
