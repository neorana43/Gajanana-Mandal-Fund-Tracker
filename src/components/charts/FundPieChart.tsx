"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function FundPieChart({
  totalDonations,
  totalExpenses,
}: {
  totalDonations: number;
  totalExpenses: number;
}) {
  const balance = totalDonations - totalExpenses;

  const data = [
    { name: "Donations", value: totalDonations },
    { name: "Expenses", value: totalExpenses },
    { name: "Balance", value: balance < 0 ? 0 : balance },
  ];

  const COLORS = ["#6366f1", "#ef4444", "#10b981"]; // primary, destructive, green

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name }) => name}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => `₹${val}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
