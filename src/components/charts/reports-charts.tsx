"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const palette = ["#0f766e", "#f59e0b", "#dc2626", "#1d4ed8", "#7c3aed"];

type ReportsChartsProps = {
  riskDistribution: Array<{
    riskLevel: string;
    _count: number;
  }>;
  causes: Array<{
    label: string;
    total: number;
  }>;
};

export function ReportsCharts({ riskDistribution, causes }: ReportsChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="h-80 rounded-3xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={riskDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="riskLevel" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="_count" fill="#0f766e" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-80 rounded-3xl border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={causes} dataKey="total" nameKey="label" outerRadius={105} label>
              {causes.map((cause, index) => (
                <Cell key={cause.label} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
