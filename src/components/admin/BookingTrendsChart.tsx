"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface BookingTrendsChartProps {
  data: { date: string; count: number }[];
}

/** Daily booking volume for the last 30 days, shown on the dashboard overview. */
export function BookingTrendsChart({ data }: BookingTrendsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: "#6b6355" }}
          interval={4}
        />
        <Tooltip
          cursor={{ fill: "#fbf2e5" }}
          contentStyle={{
            borderRadius: 8,
            borderColor: "#e8dfce",
            fontSize: 13,
          }}
          labelFormatter={(label) => `Day ${label}`}
          formatter={(value) => [`${value} bookings`, ""]}
        />
        <Bar dataKey="count" fill="#6b5500" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
