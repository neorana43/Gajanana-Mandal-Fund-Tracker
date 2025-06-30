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
  totalSponsors,
}: {
  totalDonations: number;
  totalExpenses: number;
  totalSponsors?: number;
}) {
  const totalIncome = totalDonations + (totalSponsors || 0);
  const balance = totalIncome - totalExpenses;

  const data = [];

  data.push({ name: "Donations", value: totalDonations });

  if (totalSponsors && totalSponsors > 0) {
    data.push({ name: "Sponsors", value: totalSponsors });
  }

  data.push({ name: "Expenses", value: totalExpenses });

  // Only show balance if it's positive
  if (balance > 0) {
    data.push({ name: "Balance", value: balance });
  }

  const COLORS = ["#6366f1", "#14b8a6", "#ef4444", "#10b981"]; // indigo, teal, red, green

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
            label={({ name, value }) => (value && value > 0 ? name : null)}
          >
            {data.map((entry, index) =>
              entry.value > 0 ? (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ) : null,
            )}
          </Pie>
          <Tooltip formatter={(val) => `₹${val}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
