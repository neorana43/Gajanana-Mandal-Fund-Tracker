"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { format } from "date-fns";
import Image from "next/image";

export default function ExpenseListPage() {
  const supabase = createClient();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      setExpenses(data || []);
    };

    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter((e) =>
    e.category?.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <div className="p-4 pb-24 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Expense List</h1>

      {/* Filter Input */}
      <input
        type="text"
        placeholder="Filter by category..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full border p-2 rounded-md text-sm mb-4"
      />

      {/* List */}
      {filteredExpenses.length === 0 ? (
        <p className="text-muted-foreground text-sm">No expenses found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredExpenses.map((expense) => (
            <li
              key={expense.id}
              className="bg-white rounded-xl shadow border p-4"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm capitalize">
                  {expense.category}
                </span>
                <span className="text-destructive font-semibold text-base">
                  ₹{expense.amount}
                </span>
              </div>
              <div className="text-xs text-muted-foreground mb-1">
                {format(new Date(expense.date), "dd MMM yyyy")}
              </div>
              {expense.notes && (
                <p className="text-xs mb-2 text-gray-800">{expense.notes}</p>
              )}
              {expense.receipt_url && (
                <Image
                  src={expense.receipt_url}
                  alt="Receipt"
                  width={100}
                  height={100}
                  className="rounded border object-cover"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
