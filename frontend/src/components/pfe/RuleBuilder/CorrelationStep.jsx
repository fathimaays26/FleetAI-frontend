import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { correlationByPart } from "../../../data/pfeMockData";

const fallbackSignals = [
  { signal: "Coolant temp variance", value: 55, included: true },
  { signal: "Overload duty share", value: 48, included: true },
  { signal: "Oil pressure dips", value: 44, included: true },
  { signal: "Harsh braking frequency", value: 30, included: true },
];

export default function CorrelationStep({ part, onBack, onBuildRule }) {
  const initial = correlationByPart[part] ?? fallbackSignals;
  const [signals, setSignals] = useState(initial);

  const toggle = (signalName) => {
    setSignals((prev) => prev.map((s) => (s.signal === signalName ? { ...s, included: !s.included } : s)));
  };

  const chartData = [...signals].sort((a, b) => b.value - a.value);
  const anySelected = signals.some((s) => s.included);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-gray-900">Signal correlation — {part}</h2>
        <button onClick={onBack} className="text-sm text-indigo-600 hover:underline">← Back</button>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Telemetry and DTC signals correlated against the failure history above. Uncheck any signal to exclude it from the rule.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="signal" tick={{ fontSize: 12 }} width={130} />
            <Bar dataKey="value" fill="#a78bfa" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6">
        {signals.map((s) => (
          <label
            key={s.signal}
            className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-purple-50/60 hover:bg-purple-50 cursor-pointer"
          >
            <span className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={s.included}
                onChange={() => toggle(s.signal)}
                className="accent-purple-600 w-4 h-4"
              />
              {s.signal}
            </span>
            <span className="text-sm text-gray-500">{s.value}%</span>
          </label>
        ))}
      </div>

      <button
        disabled={!anySelected}
        onClick={() => onBuildRule(signals.filter((s) => s.included))}
        className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Build Failure Probability Calculation Rule →
      </button>
    </div>
  );
}
