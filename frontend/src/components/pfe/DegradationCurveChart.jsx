import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export default function DegradationCurveChart({ curve }) {
  const data = [
    ...curve.observed.map((point) => ({
      km: point.km,
      observed: point.healthIndex,
      projected: null,
    })),
    ...curve.projected.map((point) => ({
      km: point.km,
      observed: null,
      projected: point.healthIndex,
    })),
  ];

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
        No degradation curve data available.
      </div>
    );
  }

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
      <p className="text-xs text-gray-400 mb-4">
        Solid = sensor-observed health index to date. Dashed = model projection.
        Failure threshold at index {curve.failureThreshold}.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="km"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
          />
          <YAxis domain={[0, 105]} tick={{ fontSize: 11 }} />
          <Tooltip
            labelFormatter={(value) => `${Number(value).toLocaleString()} km`}
          />
          <ReferenceLine
            y={curve.failureThreshold}
            stroke="#f87171"
            strokeDasharray="4 4"
            label={{
              value: "Failure threshold",
              fontSize: 10,
              fill: "#f87171",
              position: "insideBottomLeft",
            }}
          />
          <Area
            type="monotone"
            dataKey="observed"
            stroke="#9333ea"
            fill="#9333ea22"
            strokeWidth={2}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="projected"
            stroke="#c084fc"
            fill="#c084fc15"
            strokeWidth={2}
            strokeDasharray="6 4"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
