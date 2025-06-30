import { cookies } from "next/headers";
import { createServerClientWithCookies } from "@/lib/supabase";

export default async function UserDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id;

  const [{ data: allocation }, { data: expenses }] = await Promise.all([
    supabase
      .from("user_allocations")
      .select("amount")
      .eq("user_id", userId)
      .maybeSingle(),

    supabase
      .from("expenses")
      .select("amount, category, description, date, receipt_url")
      .eq("created_by", userId)
      .order("date", { ascending: false }),
  ]);

  const allocated = Number(allocation?.amount || 0);
  const totalSpent =
    expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const remaining = allocated - totalSpent;

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Your Fund Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 text-white text-center font-semibold">
        <div className="bg-saffron p-4 rounded shadow">
          💰 Allocated: ₹{allocated}
        </div>
        <div className="bg-red-600 p-4 rounded shadow">
          💸 Spent: ₹{totalSpent}
        </div>
        <div className="bg-green-600 p-4 rounded shadow">
          🏦 Remaining: ₹{remaining}
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8">Your Expenses</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Category</th>
            <th className="border p-2">Amount</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {expenses?.map((e, idx) => (
            <tr key={idx}>
              <td className="border p-2">{e.category}</td>
              <td className="border p-2">₹{e.amount}</td>
              <td className="border p-2">{e.date}</td>
              <td className="border p-2">
                {e.receipt_url ? (
                  <a
                    href={e.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
