"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "../ui/card";

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

  const COLORS = ["#a78bfa", "#06b6d4", "#f59e42", "#22c55e", "#6366f1"]; // violet, cyan, orange, green, indigo

  return (
    <Card className="glass shadow-glass w-full h-80 p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, value }) => (value && value > 0 ? name : null)}
            stroke="#fff"
            strokeWidth={2}
          >
            {data.map((entry, index) =>
              entry.value > 0 ? (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  style={{
                    filter: "drop-shadow(0 2px 8px rgba(99,102,241,0.08))",
                  }}
                />
              ) : null,
            )}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              background: "#fff",
              color: "#6366f1",
              fontWeight: 500,
            }}
            formatter={(val) => `\u20b9${val}`}
          />
          <Legend
            wrapperStyle={{
              color: "#a78bfa",
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
