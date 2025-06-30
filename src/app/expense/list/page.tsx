"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { exportToCSV, exportToPDF } from "@/lib/export";

export default function ExpenseList() {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      setExpenses(data || []);
    };
    fetch();
  }, []);

  const filtered = expenses.filter((e) =>
    e.category.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-4">
      <h1 className="text-xl font-bold">Expense Records</h1>

      <div className="flex gap-2">
        <input
          placeholder="Filter by category"
          className="border p-2 rounded w-full"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Button onClick={() => exportToCSV(filtered, "expenses")}>
          Export CSV
        </Button>
        <Button
          variant="outline"
          onClick={() => exportToPDF("expense-table", "expenses")}
        >
          Export PDF
        </Button>
      </div>

      <div id="expense-table" className="overflow-x-auto mt-4">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id}>
                <td className="border p-2">{e.category}</td>
                <td className="border p-2">{e.description}</td>
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
    </div>
  );
}
