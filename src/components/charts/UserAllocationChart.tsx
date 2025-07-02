"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/card";

type AllocationData = {
  user_email: string;
  amount: number;
  user_display_name: string | null;
};

const COLORS = ["#a78bfa", "#06b6d4", "#f59e42", "#22c55e", "#6366f1"]; // violet, cyan, orange, green, indigo

export default function UserAllocationChart({
  data,
}: {
  data: AllocationData[];
}) {
  // Aggregate data in case a user has multiple allocations
  const aggregatedData = data.reduce(
    (acc, { user_email, amount, user_display_name }) => {
      // Use a unique key for aggregation, like email
      acc[user_email] = {
        amount: (acc[user_email]?.amount || 0) + amount,
        name: user_display_name || user_email.split("@")[0],
      };
      return acc;
    },
    {} as Record<string, { amount: number; name: string }>,
  );

  const chartData = Object.values(aggregatedData);
  return (
    <Card className="glass shadow-glass w-full h-80 p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#a78bfa"
            fontSize={12}
            fontWeight={600}
          />
          <YAxis stroke="#a78bfa" fontSize={12} fontWeight={600} />
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
          <Bar dataKey="amount" fill={COLORS[0]} radius={[16, 16, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
