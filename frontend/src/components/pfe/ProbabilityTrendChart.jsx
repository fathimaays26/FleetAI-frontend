import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from "recharts";

export default function ProbabilityTrendChart({ trend }) {
  const data = trend.map((value, i) => ({ week: `W-${trend.length - 1 - i}`, value }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-5 h-5 rounded bg-purple-50 text-purple-500 text-xs font-medium flex items-center justify-center">02</span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Probability Trend, Last 10 Weeks</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <ReferenceLine y={70} stroke="#f87171" strokeDasharray="4 4" label={{ value: "Red threshold", fontSize: 10, fill: "#f87171", position: "insideTopLeft" }} />
          <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
