"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function FundChart({
  data,
}: {
  data: { date: string; donations: number; expenses: number }[];
}) {
  return (
    <div className="w-full h-80 bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-4 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
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
          <Line
            type="monotone"
            dataKey="donations"
            stroke="#a78bfa"
            strokeWidth={3}
            dot={{ r: 6, fill: "#6366f1" }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={3}
            dot={{ r: 6, fill: "#f59e42" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
