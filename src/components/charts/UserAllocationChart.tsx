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

type AllocationData = {
  user_email: string;
  amount: number;
  user_display_name: string | null;
};

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

  const chartData = Object.values(aggregatedData).map((item) => ({
    user: item.name,
    amount: item.amount,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="user" />
          <YAxis />
          <Tooltip formatter={(value) => `₹${value}`} />
          <Legend />
          <Bar dataKey="amount" fill="#8884d8" name="Allocated Amount" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
