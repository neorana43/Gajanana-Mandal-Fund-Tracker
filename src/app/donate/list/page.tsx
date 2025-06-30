"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToPDF } from "@/lib/export";

export default function DonationList() {
  const supabase = createClient();
  const [donations, setDonations] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });
      setDonations(data || []);
    };
    fetch();
  }, []);

  const filtered = donations.filter((d) =>
    d.donor_name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-4">
      <h1 className="text-xl font-bold">Donation Records</h1>

      <div className="flex gap-2">
        <input
          placeholder="Search by name"
          className="border p-2 rounded w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button onClick={() => exportToCSV(filtered, "donations")}>
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => exportToPDF("donation-table", "donations")}
        >
          Export PDF
        </Button>
      </div>

      <div id="donation-table" className="overflow-x-auto mt-4">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td className="border p-2">{d.donor_name}</td>
                <td className="border p-2">{d.contact}</td>
                <td className="border p-2">₹{d.amount}</td>
                <td className="border p-2">
                  {new Date(d.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
