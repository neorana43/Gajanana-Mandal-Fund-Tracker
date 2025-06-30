"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  data: {
    email: string;
    allocated: number;
    spent: number;
  }[];
};

const COLORS = ["#a78bfa", "#06b6d4", "#f59e42", "#22c55e", "#6366f1"]; // violet, cyan, orange, green, indigo

export default function UserFundUsageChart({ data }: Props) {
  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="email"
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
          <Bar dataKey="allocated" fill={COLORS[0]} name="Allocated" />
          <Bar dataKey="spent" fill={COLORS[1]} name="Spent" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
