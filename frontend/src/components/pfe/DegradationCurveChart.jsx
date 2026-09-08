import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ReferenceLine, 
  ResponsiveContainer,
  Tooltip 
} from "recharts";

// ✨ FIX 1: Create a custom tooltip to match your dashboard's clean UI
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    // Determine if we are hovering over the historical or future line
    const isObserved = data.observed !== null;
    const health = isObserved ? data.observed : data.projected;
    const statusText = isObserved ? "Sensor Observed" : "AI Projection";

    return (
      <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-700 min-w-[160px]">
        <p className="text-xs text-gray-400 mb-1 font-medium tracking-wide uppercase">
          {label.toLocaleString()} km
        </p>
        <p className="text-sm font-semibold mb-1">
          {statusText}
        </p>
        <p className="text-sm text-purple-300">
          Health Index: {health?.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export default function DegradationCurveChart({ curve }) {
  const solidPoints = curve.values?.length || 0;
  const dashedPoints = curve.dashedValues?.length || 0;
  
  const stepSolid = solidPoints > 1 ? curve.solidEnd / (solidPoints - 1) : 0;
  const stepDashed = dashedPoints > 1 ? (curve.maxX - curve.solidEnd) / (dashedPoints - 1) : 0;

  const data = [
    ...(curve.values || []).map((v, i) => ({ 
      km: Math.round(i * stepSolid), 
      observed: v, 
      projected: null 
    })),
    ...(curve.dashedValues || []).map((v, i) => ({
      km: Math.round(curve.solidEnd + i * stepDashed),
      observed: i === 0 ? v : null,
      projected: v,
    })),
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded bg-purple-50 text-purple-500 text-xs font-medium flex items-center justify-center">
          02
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Degradation Curve vs Failure Threshold
        </h3>
      </div>
      <p className="text-xs text-gray-400 mb-6">
        Solid = sensor-observed health index to date. Dashed = model projection. Failure threshold at index {curve.failureThreshold}.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          
        <XAxis 
            dataKey="km" 
            // By removing type="number", Recharts defaults to categorical spacing.
            // This stretches out the dense projection points so you can actually see them!
            tick={{ fontSize: 11, fill: '#6b7280' }} 
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            tickMargin={10} 
          />
          <YAxis 
            domain={[0, 105]} 
            tick={{ fontSize: 11, fill: '#6b7280' }} 
            tickMargin={10}
          />
          
          {/* ✨ FIX 2: Inject the Tooltip component */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }} />
          
          <ReferenceLine 
            y={curve.failureThreshold} 
            stroke="#f87171" 
            strokeDasharray="4 4" 
            label={{ value: "Failure threshold", fontSize: 10, fill: "#f87171", position: "insideBottomLeft" }} 
          />
          
          {/* ✨ FIX 3: Changed type to "monotoneX" for a smooth, natural curve */}
          <Area 
            type="monotoneX" 
            dataKey="observed" 
            stroke="none" 
            fill="#9333ea22" 
            connectNulls 
            isAnimationActive={false}
          />
          
          <Line 
            type="monotoneX" 
            dataKey="observed" 
            stroke="#9333ea" 
            strokeWidth={2} 
            dot={false}
            activeDot={{ r: 6, fill: "#9333ea", stroke: "#fff", strokeWidth: 2 }} // Adds a dot only on hover
            connectNulls 
            isAnimationActive={false}
          />
          
          <Line 
            type="monotoneX" 
            dataKey="projected" 
            stroke="#c084fc" 
            strokeWidth={2} 
            strokeDasharray="6 4" 
            dot={false}
            activeDot={{ r: 6, fill: "#c084fc", stroke: "#fff", strokeWidth: 2 }} // Adds a dot only on hover
            connectNulls 
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}