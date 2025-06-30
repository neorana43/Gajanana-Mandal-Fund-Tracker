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
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      {/* Heading */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-maroon-800">
          🙏 Gajanana Mandal – Public Fund Tracker
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Transparent Ganesh Mandal donations & usage
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-3 gap-4 text-white">
        <div className="bg-orange-500 p-4 rounded-xl shadow flex flex-col items-center">
          <div className="text-sm">💰 Donations</div>
          <div className="text-xl font-bold">₹{totalDonations}</div>
        </div>
        <div className="bg-red-600 p-4 rounded-xl shadow flex flex-col items-center">
          <div className="text-sm">💸 Expenses</div>
          <div className="text-xl font-bold">₹{totalExpenses}</div>
        </div>
        <div className="bg-green-700 p-4 rounded-xl shadow flex flex-col items-center">
          <div className="text-sm">🏦 Balance</div>
          <div className="text-xl font-bold">₹{balance}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 text-maroon-800">
          📊 Fund Activity Over Time
        </h2>
        <FundChart data={chartData} />
      </div>

      {/* Recent Sponsors */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-maroon-800">
          🌟 Recent Secret Sponsors
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {(sponsors || []).map((s, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 shadow">
              <p className="text-sm text-gray-800">
                Sponsored <span className="font-bold">₹{s.amount}</span> for{" "}
                <span className="text-maroon-700 font-semibold">
                  {s.purpose}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(s.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Donation Map / House Names */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-maroon-800">
          🏘️ Donated Houses
        </h2>
        {uniqueHouses.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {[...uniqueHouses].map((house, idx) => (
              <span
                key={idx}
                className="bg-orange-100 text-sm px-3 py-1 rounded-full"
              >
                {house}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No donations recorded yet.</p>
        )}
      </div>

      <div className="text-center text-xs text-gray-400 mt-10">
        © {new Date().getFullYear()} Gajanana Mandal. Built with ❤️ for the
        community.
      </div>
    </div>
  );
}
