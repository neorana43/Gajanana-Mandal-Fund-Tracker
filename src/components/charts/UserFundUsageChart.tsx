"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: {
    email: string;
    allocated: number;
    spent: number;
  }[];
};

export default function UserFundUsageChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <XAxis dataKey="email" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="allocated" fill="#FFA500" name="Allocated" />
        <Bar dataKey="spent" fill="#800000" name="Spent" />
      </BarChart>
    </ResponsiveContainer>
  );
}
