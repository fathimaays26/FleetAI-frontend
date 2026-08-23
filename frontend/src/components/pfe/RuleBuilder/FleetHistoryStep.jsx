import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, Car, Gauge } from "lucide-react";
import { fleetHistoryByPart } from "../../../data/pfeMockData";

export default function FleetHistoryStep({ part, onChangePart, onRunCorrelation }) {
  // fall back to a generic history shape if this exact part isn't in the mock data
  const history = fleetHistoryByPart[part] ?? {
    historicalFailures: 120,
    affectedVins: 180,
    avgMileageAtFailure: "60k km",
    monthlyFailures: Array.from({ length: 12 }, (_, i) => ({
      month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
      count: 8 + Math.round(Math.random() * 10),
    })),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-gray-900">Fleet history — {part}</h2>
        <button onClick={onChangePart} className="text-sm text-indigo-600 hover:underline">← Change Part</button>
      </div>
      <p className="text-sm text-gray-500 mb-5">12-month failure history mined from job cards and warranty claims across the fleet.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">Historical Failures</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{history.historicalFailures}</div>
          <p className="text-sm text-gray-500 mt-1">Recorded over the trailing 12 months, fleet-wide.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">Affected VINs</span>
            <Car className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{history.affectedVins}</div>
          <p className="text-sm text-gray-500 mt-1">Distinct vehicles with at least one recorded failure.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">Avg Mileage at Failure</span>
            <Gauge className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">{history.avgMileageAtFailure}</div>
          <p className="text-sm text-gray-500 mt-1">Median odometer reading at the point of failure.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Monthly Failure Count, Trailing 12 Months</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={history.monthlyFailures}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#e0919b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <button
        onClick={onRunCorrelation}
        className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium hover:opacity-90"
      >
        Run Correlation →
      </button>
    </div>
  );
}
