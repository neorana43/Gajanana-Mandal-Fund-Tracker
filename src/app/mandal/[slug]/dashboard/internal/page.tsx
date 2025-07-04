import { cookies } from "next/headers";
import { createServerClientWithCookies } from "@/lib/supabase";
import DashboardTabs from "@/components/layouts/DashboardTabs";
import { Card } from "@/components/ui/card";

export default async function InternalDashboard() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClientWithCookies(cookieStore);
    let allocationsRes, usersRes;
    try {
      [allocationsRes, usersRes] = await Promise.all([
        supabase
          .from("fund_allocation_audit")
          .select("id, admin_id, user_id, amount, timestamp")
          .order("timestamp", { ascending: false }),
        supabase.from("users").select("id, full_name"),
      ]);
    } catch (err) {
      console.error("Supabase fetch error:", err);
      return (
        <div className="p-6 text-center text-red-600">
          <p>Failed to load internal dashboard data.</p>
          <p className="text-sm mt-2">{String(err)}</p>
        </div>
      );
    }

    const auditLogs = allocationsRes.data || [];
    const users = usersRes.data || [];

    const getUserName = (id: string) =>
      users.find((u) => u.id === id)?.full_name || "Unknown";

    return (
      <div className="p-4 pb-24 max-w-3xl mx-auto w-full">
        <h1 className="text-xl font-bold mb-4">Internal Dashboard</h1>

        <DashboardTabs
          tabs={[
            {
              label: "Summary",
              content: (
                <Card className="glass shadow-glass p-4 text-sm text-muted-foreground">
                  <p>This view is intended for admin insights only.</p>
                  <ul className="list-disc pl-6 mt-2">
                    <li>Allocation audit log</li>
                    <li>User-level fund control</li>
                    <li>Internal-only financial breakdown</li>
                  </ul>
                </Card>
              ),
            },
            {
              label: "Fund Flow",
              content: (
                <Card className="glass shadow-glass p-4 text-sm">
                  <p className="text-muted-foreground mb-2">
                    (Coming soon) Visualize internal transfers and allocation
                    deltas.
                  </p>
                </Card>
              ),
            },
            {
              label: "Audit Logs",
              content: (
                <div>
                  {auditLogs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No audit records found.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {auditLogs.map((log) => (
                        <li
                          key={log.id}
                          className="bg-white rounded-xl border p-4 shadow-sm text-sm"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-primary">
                              ₹{log.amount}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs mt-1">
                            Allocated by{" "}
                            <span className="font-medium">
                              {getUserName(log.admin_id)}
                            </span>{" "}
                            →{" "}
                            <span className="font-medium">
                              {getUserName(log.user_id)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    );
  } catch (error) {
    console.error("InternalDashboard runtime error:", error);
    return (
      <div className="p-6 text-center text-red-600">
        <p>Something went wrong rendering the internal dashboard.</p>
        <p className="text-sm mt-2">{String(error)}</p>
      </div>
    );
  }
}
