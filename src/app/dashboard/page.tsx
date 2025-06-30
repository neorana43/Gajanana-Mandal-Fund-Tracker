import { cookies } from "next/headers";
import { createServerClientWithCookies } from "@/lib/supabase";
import FundChart from "@/components/charts/FundChart";

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

export default async function PublicDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  const [{ data: donations }, { data: expenses }, { data: sponsors }] =
    await Promise.all([
      supabase
        .from("donations")
        .select("amount, created_at, house_name")
        .order("created_at", { ascending: true }),
      supabase
        .from("expenses")
        .select("amount, date")
        .order("date", { ascending: true }),
      supabase
        .from("sponsors")
        .select("amount, purpose, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const donationByDate = groupByDate(donations || [], "created_at");
  const expenseByDate = groupByDate(expenses || [], "date");

  const allDates = Array.from(
    new Set([...Object.keys(donationByDate), ...Object.keys(expenseByDate)]),
  ).sort();

  let runningBalance = 0;
  const chartData = allDates.map((date) => {
    const income = donationByDate[date] || 0;
    const spent = expenseByDate[date] || 0;
    runningBalance += income - spent;
    return {
      date,
      donations: income,
      expenses: spent,
      balance: runningBalance,
    };
  });

  const totalDonations =
    donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const totalExpenses =
    expenses?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const balance = totalDonations - totalExpenses;

  const uniqueHouses = new Set(
    donations?.map((d) => d.house_name).filter(Boolean),
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-3xl font-bold text-center text-maroon-900">
        🙏 Ganesh Mandal Public Dashboard
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 text-center text-white">
        <div className="bg-orange-600 p-4 rounded shadow">
          💰 <div className="text-xl font-semibold">₹{totalDonations}</div>
          <div className="text-sm">Total Donations</div>
        </div>
        <div className="bg-red-600 p-4 rounded shadow">
          💸 <div className="text-xl font-semibold">₹{totalExpenses}</div>
          <div className="text-sm">Total Expenses</div>
        </div>
        <div className="bg-green-700 p-4 rounded shadow">
          🏦 <div className="text-xl font-semibold">₹{balance}</div>
          <div className="text-sm">Balance</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">📊 Fund Trends</h2>
        <FundChart data={chartData} />
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">
          🌟 Recent Sponsors (Secret)
        </h2>
        <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
          {sponsors?.map((s, i) => (
            <li key={i}>
              Sponsored ₹{s.amount} for{" "}
              <span className="font-medium">{s.purpose}</span>
            </li>
          )) || <p>No sponsor data</p>}
        </ul>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">🗺️ Donation Map (Houses)</h2>
        {uniqueHouses.size > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {[...uniqueHouses].map((house, idx) => (
              <div key={idx} className="bg-yellow-100 border px-2 py-1 rounded">
                {house}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No house-level data yet.</p>
        )}
      </div>

      <div className="text-center mt-10 text-sm text-gray-400">
        Built with ❤️ for community by the Mandal Committee
      </div>
    </div>
  );
}
