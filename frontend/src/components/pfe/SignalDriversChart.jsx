import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export default function SignalDriversChart({ drivers }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-5 h-5 rounded bg-purple-50 text-purple-500 text-xs font-medium flex items-center justify-center">03</span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Which Signals Drive This Prediction</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={drivers} layout="vertical" margin={{ left: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="signal" tick={{ fontSize: 11 }} width={110} />
          <Bar dataKey="value" fill="#a78bfa" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
