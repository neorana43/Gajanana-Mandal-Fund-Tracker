"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function FundChart({
  data,
}: {
  data: { date: string; donations: number; expenses: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="donations" stroke="#10b981" />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
      </LineChart>
    </ResponsiveContainer>
  );
}
