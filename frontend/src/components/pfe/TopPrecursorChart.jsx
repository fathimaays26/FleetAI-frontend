import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Info, Zap } from "lucide-react";

export default function TopPrecursorChart({ data }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-purple-500" />
        <h3 className="font-semibold text-gray-900 text-sm tracking-wide uppercase">Top Precursor Signals Across the Fleet</h3>
        <Info className="w-3.5 h-3.5 text-gray-300" />
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="signal" tick={{ fontSize: 12 }} width={140} />
          <Tooltip />
          <Bar dataKey="value" fill="#a78bfa" radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
