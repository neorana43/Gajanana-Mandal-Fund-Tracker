import { createServerClientWithCookies } from "@/lib/supabase";
import { cookies } from "next/headers";

export default async function PublicDashboard() {
  const cookieStore = await cookies();
  const supabase = createServerClientWithCookies(cookieStore);

  const { data: donations } = await supabase
    .from("donations")
    .select("donor_name, amount")
    .order("amount", { ascending: false });

  const total = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Ganesh Mandal Dashboard</h1>
      <h2 className="text-lg font-semibold">Total Funds Collected: ₹{total}</h2>

      <h3 className="mt-8 text-md font-semibold">Donor Leaderboard</h3>
      <ul className="mt-3 space-y-2">
        {donations?.map((d, i) => (
          <li key={i} className="border p-2 rounded shadow-sm">
            {d.donor_name} — ₹{d.amount}
          </li>
        ))}
      </ul>
    </div>
  );
}
