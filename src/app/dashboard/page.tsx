import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/getUserRole";
import FundChart from "@/components/charts/FundChart";
import FundPieChart from "@/components/charts/FundPieChart";
import UserAllocationChart from "@/components/charts/UserAllocationChart";
import DashboardTabs from "@/components/layouts/DashboardTabs";
import { Tables } from "@/types/supabase";
import { Card } from "@/components/ui/card";

type Sponsor = Tables<"sponsors">;
type Allocation = {
  user_email: string;
  amount: number;
  user_display_name: string | null;
};

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

export default async function PublicDashboard() {
  const supabase = await createClient();
  const role = await getUserRole(supabase);

  const [donationRes, expenseRes, sponsorRes, allocationRes] =
    await Promise.all([
      supabase
        .from("donations")
        .select("amount, created_at")
        .order("created_at"),
      supabase.from("expenses").select("amount, date").order("date"),
      supabase
        .from("sponsors")
        .select("sponsor_name, amount, category")
        .order("created_at", { ascending: false }),
      role === "admin"
        ? supabase.rpc("get_allocations_with_emails")
        : Promise.resolve({ data: [], error: null }),
    ]);

  const donations = donationRes.data || [];
  const expenses =
    (expenseRes.data as { amount: number; date?: string | null }[]) || [];
  const sponsors = (sponsorRes.data as Sponsor[]) || [];
  const allocations = (allocationRes.data as Allocation[]) || [];

  if (donationRes.error || sponsorRes.error || allocationRes.error) {
    console.error("❌ Supabase errors:", {
      donationError: donationRes.error?.message,
      sponsorError: sponsorRes.error?.message,
      allocationError: allocationRes.error?.message,
    });

    return (
      <div className="p-6 max-w-2xl w-full mx-auto text-center text-red-600">
        <p className="text-lg font-semibold">Failed to load dashboard data.</p>
        <p className="text-sm mt-2">Please try again later.</p>
      </div>
    );
  }

  const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSponsors = sponsors.reduce((sum, s) => sum + s.amount, 0);

  const isAdmin = role === "admin";
  const donationBalance = totalDonations - totalExpenses;

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

  const hasData =
    donations.length > 0 || expenses.length > 0 || sponsors.length > 0;

  if (!hasData) {
    return (
      <div className="p-6 max-w-2xl w-full mx-auto text-center text-muted-foreground">
        <p className="text-lg font-medium">No data available yet.</p>
        <p className="text-sm mt-1">
          Start by adding donations or expenses to see the dashboard.
        </p>
      </div>
    );
  }

  const summaryCards = [
    <Card key="donations" className="glass shadow-glass p-4 text-center">
      <p className="text-sm text-muted-foreground">Total Donations</p>
      <p className="text-lg font-semibold text-primary">₹{totalDonations}</p>
    </Card>,
  ];

  if (isAdmin) {
    const totalIncome = totalDonations + totalSponsors;
    const sponsorBalance = totalIncome - totalExpenses;

    summaryCards.push(
      <Card key="sponsors" className="glass shadow-glass p-4 text-center">
        <p className="text-sm text-muted-foreground">Total Sponsors</p>
        <p className="text-lg font-semibold text-teal-500">₹{totalSponsors}</p>
      </Card>,
      <Card key="income" className="glass shadow-glass p-4 text-center">
        <p className="text-sm text-muted-foreground">Total Income</p>
        <p className="text-lg font-semibold text-blue-600">₹{totalIncome}</p>
      </Card>,
      <Card key="spent" className="glass shadow-glass p-4 text-center">
        <p className="text-sm text-muted-foreground">Spent</p>
        <p className="text-lg font-semibold text-destructive">
          ₹{totalExpenses}
        </p>
      </Card>,
      <Card
        key="donation_balance"
        className="glass shadow-glass p-4 text-center"
      >
        <p className="text-sm text-muted-foreground">Balance (Donations)</p>
        <p className="text-lg font-semibold text-green-600">
          ₹{donationBalance}
        </p>
      </Card>,
      <Card
        key="sponsor_balance"
        className="glass shadow-glass p-4 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Balance (Incl. Sponsors)
        </p>
        <p className="text-lg font-semibold text-green-700">
          ₹{sponsorBalance}
        </p>
      </Card>,
    );
  } else {
    summaryCards.push(
      <Card key="spent" className="glass shadow-glass p-4 text-center">
        <p className="text-sm text-muted-foreground">Spent</p>
        <p className="text-lg font-semibold text-destructive">
          ₹{totalExpenses}
        </p>
      </Card>,
      <Card key="balance" className="glass shadow-glass p-4 text-center">
        <p className="text-sm text-muted-foreground">Balance</p>
        <p className="text-lg font-semibold text-green-600">
          ₹{donationBalance}
        </p>
      </Card>,
    );
  }

  const tabs = [
    {
      label: "Summary",
      content: (
        <>
          <div
            className={`grid grid-cols-1 ${
              isAdmin ? "sm:grid-cols-2" : "sm:grid-cols-3"
            } gap-4 mb-6`}
          >
            {summaryCards}
          </div>
          <FundPieChart
            totalDonations={totalDonations}
            totalExpenses={totalExpenses}
            totalSponsors={isAdmin ? totalSponsors : undefined}
          />
        </>
      ),
    },
    {
      label: "Trends",
      content: (
        <div className="mb-6">
          <FundChart data={chartData} />
        </div>
      ),
    },
  ];

  if (role === "admin") {
    tabs.push(
      {
        label: "Sponsors",
        content: (
          <div>
            <h2 className="text-sm font-semibold mb-2">
              Recent Secret Sponsors
            </h2>
            <ul className="space-y-2">
              {sponsors.slice(0, 5).map((s: Sponsor, idx) => (
                <li key={idx} className="glass rounded-lg shadow p-3 border">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">
                        {s.sponsor_name || "Anonymous"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {s.category}
                      </p>
                    </div>
                    <span className="text-sm text-primary font-semibold">
                      ₹{s.amount}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ),
      },
      {
        label: "Allocations",
        content: (
          <div>
            <h2 className="text-sm font-semibold mb-2">
              User Fund Allocations
            </h2>
            <UserAllocationChart data={allocations} />
          </div>
        ),
      },
    );
  }

  return (
    <div className="p-4 pb-24 max-w-4xl w-full mx-auto">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <DashboardTabs tabs={tabs} />
    </div>
  );
}
