import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip } from "recharts";

export default function ProbabilityTrendChart({ trend = [] }) {
  // Map incoming backend objects, scale decimals (0.02) to percentages (2.0%), 
  // and use the actual week start date if available.
  const data = trend.map((item, i) => {
    const rawProb = typeof item === 'object' && item !== null ? item.probability : item;
    const weekLabel = typeof item === 'object' && item !== null && item.week_start_date 
      ? item.week_start_date 
      : `W-${trend.length - 1 - i}`;
      
    return {
      week: weekLabel,
      // Multiply by 100 so small ratios map correctly against the 0-100% Y-axis
      value: Number(((rawProb || 0) * 100).toFixed(2))
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-5 h-5 rounded bg-purple-50 text-purple-500 text-xs font-medium flex items-center justify-center">02</span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Probability Trend, Last 10 Weeks</h3>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
          <ReferenceLine y={70} stroke="#f87171" strokeDasharray="4 4" label={{ value: "Red threshold", fontSize: 10, fill: "#f87171", position: "insideTopLeft" }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '12px' }}
            formatter={(value) => [`${value}%`, 'Fleet Risk Ratio']}
            labelStyle={{ color: '#9CA3AF', marginBottom: '2px' }}
          />
          <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}