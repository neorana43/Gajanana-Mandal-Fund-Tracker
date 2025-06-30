"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { exportToCSV, exportToPDF } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SponsorListPage() {
  const supabase = createClient();
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetch = async () => {
      const user = await supabase.auth.getUser();
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("id", user.data.user?.id)
        .single();

      if (roleData?.role !== "admin") {
        router.replace("/dashboard/internal");
        return;
      }

      setRole("admin");

      const { data } = await supabase
        .from("sponsors")
        .select("*")
        .order("created_at", { ascending: false });

      setSponsors(data || []);
    };

    fetch();
  }, [supabase, router]);

  if (!role) return null;

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-xl font-bold">Secret Sponsor Records</h1>

      <div className="flex gap-2">
        <Button onClick={() => exportToCSV(sponsors, "sponsors")}>
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => exportToPDF("sponsor-table", "sponsors")}
        >
          Export PDF
        </Button>
      </div>

      <div id="sponsor-table" className="overflow-x-auto mt-4">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Full?</th>
              <th className="border p-2">Details</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.map((s) => (
              <tr key={s.id}>
                <td className="border p-2">{s.sponsor_name}</td>
                <td className="border p-2">{s.category}</td>
                <td className="border p-2">₹{s.amount}</td>
                <td className="border p-2">{s.is_full ? "✅" : "❌"}</td>
                <td className="border p-2">{s.description || "-"}</td>
                <td className="border p-2">
                  {new Date(s.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
