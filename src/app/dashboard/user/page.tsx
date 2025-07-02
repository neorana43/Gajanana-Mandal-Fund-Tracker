import { cookies } from "next/headers";
import { createServerClientWithCookies } from "@/lib/supabase";
import DashboardTabs from "@/components/layouts/DashboardTabs";
import { Card } from "@/components/ui/card";

export default async function UserDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>You must be logged in to view your dashboard.</p>
      </div>
    );
  }

  const [allocRes, expensesRes, donationsRes] = await Promise.all([
    supabase
      .from("fund_allocations")
      .select("amount")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("expenses")
      .select("amount, category, date")
      .eq("user_id", user.id)
      .order("date", { ascending: false }),
    supabase
      .from("donations")
      .select("amount, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const allocated = allocRes?.data?.amount || 0;
  const expenses = expensesRes?.data || [];
  const donations = donationsRes?.data || [];

  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = allocated - spent;

  return (
    <div className="p-4 pb-24 max-w-2xl w-full mx-auto w-full">
      <h1 className="text-xl font-bold mb-4">Your Dashboard</h1>

      <DashboardTabs
        tabs={[
          {
            label: "Overview",
            content: (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="glass shadow-glass p-4 text-center">
                  <p className="text-sm text-muted-foreground">Allocated</p>
                  <p className="text-lg font-semibold text-primary">
                    ₹{allocated}
                  </p>
                </Card>
                <Card className="glass shadow-glass p-4 text-center">
                  <p className="text-sm text-muted-foreground">Spent</p>
                  <p className="text-lg font-semibold text-destructive">
                    ₹{spent}
                  </p>
                </Card>
                <Card className="glass shadow-glass p-4 text-center">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{remaining}
                  </p>
                </Card>
              </div>
            ),
          },
          {
            label: "Your Donations",
            content: (
              <div className="space-y-2">
                {donations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No donations found.
                  </p>
                ) : (
                  donations.map((d, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg border shadow p-3 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-primary">
                          ₹{d.amount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(d.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
          {
            label: "Your Expenses",
            content: (
              <div className="space-y-2">
                {expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No expenses recorded.
                  </p>
                ) : (
                  expenses.map((e, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg border shadow p-3 text-sm"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-destructive">
                          ₹{e.amount}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(e.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {e.category}
                      </p>
                    </div>
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
