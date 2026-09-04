import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FleetRiskTrendChart({ data }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
        No fleet risk trend data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900">Fleet Risk Trend</h3>
      <p className="text-sm text-gray-500 mb-4">
        Vehicle count by risk tier over the last 18 days
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="green"
            stackId="risk"
            stroke="#10b981"
            fill="#10b98122"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="amber"
            stackId="risk"
            stroke="#f59e0b"
            fill="#f59e0b22"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="red"
            stackId="risk"
            stroke="#ef4444"
            fill="#ef444422"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
