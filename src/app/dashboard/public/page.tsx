import React from "react";
import { createClient } from "@/lib/supabase/server";
import FundPieChart from "@/components/charts/FundPieChart";
import FundChart from "@/components/charts/FundChart";
import DashboardTabs from "@/components/layouts/DashboardTabs";
import { Card } from "@/components/ui/card";

function groupByDate(
  data: { amount: number; created_at?: string | null; date?: string | null }[],
  key: "created_at" | "date",
) {
  const result: Record<string, number> = {};
  data.forEach((item) => {
    const raw = item[key];
    if (!raw) return;
    const parsed = new Date(raw);
    if (isNaN(parsed.getTime())) return;
    const date = parsed.toISOString().split("T")[0];
    result[date] = (result[date] || 0) + Number(item.amount);
  });
  return result;
}

export default async function PublicDashboardPage() {
  const supabase = createClient();
  const [donationRes, expenseRes] = await Promise.all([
    supabase
      .from("donations")
      .select("amount, created_at, donor_name")
      .order("created_at"),
    supabase.from("expenses").select("amount, date").order("date"),
  ]);

  const donations = donationRes.data || [];
  const expenses =
    (expenseRes.data as { amount: number; date?: string | null }[]) || [];

  if (donationRes.error || expenseRes.error) {
    return (
      <div className="p-6 max-w-2xl w-full mx-auto text-center text-red-600">
        <p className="text-lg font-semibold">Failed to load dashboard data.</p>
        <p className="text-sm mt-2">Please try again later.</p>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const donationBalance = totalDonations - totalExpenses;

  // Chart data
  const donationByDate = groupByDate(donations, "created_at");
  const expenseByDate = groupByDate(expenses, "date");
  const allDates = Array.from(
    new Set([...Object.keys(donationByDate), ...Object.keys(expenseByDate)]),
  ).sort();
  const chartData = allDates.map((date) => ({
    date,
    donations: donationByDate[date] || 0,
    expenses: expenseByDate[date] || 0,
  }));

  // Leaderboard: donor_name -> total amount
  const leaderboardMap = new Map<string, number>();
  for (const d of donations) {
    const name = d.donor_name || "Anonymous";
    leaderboardMap.set(name, (leaderboardMap.get(name) || 0) + d.amount);
  }
  const leaderboard = Array.from(leaderboardMap.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  const hasData = donations.length > 0 || expenses.length > 0;

  const tabs = [
    {
      label: "Summary",
      content: hasData ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="glass shadow-glass p-4 text-center">
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-lg font-semibold text-primary">
                ₹{totalDonations}
              </p>
            </Card>
            <Card className="glass shadow-glass p-4 text-center">
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className="text-lg font-semibold text-destructive">
                ₹{totalExpenses}
              </p>
            </Card>
            <Card className="glass shadow-glass p-4 text-center">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-lg font-semibold text-green-600">
                ₹{donationBalance}
              </p>
            </Card>
          </div>
          <div className="mb-8">
            <FundPieChart
              totalDonations={totalDonations}
              totalExpenses={totalExpenses}
            />
          </div>
        </>
      ) : (
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No data available yet.</p>
          <p className="text-sm mt-1">
            Start by adding donations or expenses to see the dashboard.
          </p>
        </div>
      ),
    },
    {
      label: "Trends",
      content: hasData ? (
        <div className="mb-8">
          <FundChart data={chartData} />
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No data available yet.</p>
          <p className="text-sm mt-1">
            Start by adding donations or expenses to see the dashboard.
          </p>
        </div>
      ),
    },
    {
      label: "Leaderboard",
      content: hasData ? (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Donors</h2>
          {leaderboard.length === 0 ? (
            <p className="text-muted-foreground">No donations yet.</p>
          ) : (
            <ol className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <li
                  key={entry.name}
                  className="glass rounded-lg shadow p-3 border flex justify-between items-center"
                >
                  <span className="font-medium">
                    {idx + 1}. {entry.name}
                  </span>
                  <span className="text-primary font-semibold">
                    ₹{entry.amount}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No data available yet.</p>
          <p className="text-sm mt-1">
            Start by adding donations or expenses to see the dashboard.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-2xl mx-auto text-center w-full">
      <h1 className="text-3xl font-bold mb-4">Gajanana Mandal Fund Tracker</h1>
      <p className="text-muted-foreground mb-8">
        Below are the latest stats for donations and expenses.
      </p>
      <DashboardTabs tabs={tabs} />
    </div>
  );
}
