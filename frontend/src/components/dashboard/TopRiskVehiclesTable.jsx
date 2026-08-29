import { useState } from "react";
import RiskBadge from "./RiskBadge";

export default function TopRiskVehiclesTable({ vehicles }) {
  const [showAll, setShowAll] = useState(false);

  const sortedVehicles = [...vehicles].sort(
    (a, b) => Number(b.probability ?? 0) - Number(a.probability ?? 0),
  );

  const visibleVehicles = showAll ? sortedVehicles : sortedVehicles.slice(0, 4);

  const formatRul = (rul) => {
    if (rul == null || rul === "" || rul === "—") return "—";
    if (typeof rul === "string") {
      return rul.includes("km") ? rul : `${rul} km`;
    }
    return `${Number(rul).toLocaleString()} km`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Top Risk Vehicles</h3>

          <p className="text-sm text-gray-500">
            Vehicles ranked by highest failure probability
          </p>
        </div>

        {vehicles.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            {showAll ? "Show less ↑" : "View all →"}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs uppercase border-b border-gray-100">
              <th className="pb-2 font-medium">VIN</th>
              <th className="pb-2 font-medium">Vehicle</th>
              <th className="pb-2 font-medium">Region</th>
              <th className="pb-2 font-medium">At-Risk Component</th>
              <th className="pb-2 font-medium">Failure Prob.</th>
              <th className="pb-2 font-medium">RUL</th>
              <th className="pb-2 font-medium">Risk</th>
            </tr>
          </thead>

          <tbody>
            {visibleVehicles.map((v) => (
              <tr key={v.vin} className="border-b border-gray-50 last:border-0">
                {/* VIN */}
                <td className="py-3 text-gray-500">{v.vin}</td>

                {/* Vehicle */}
                <td className="py-3">
                  <div className="font-medium text-gray-900">{v.vehicle}</div>

                  <div className="text-xs text-gray-400">{v.miles}</div>
                </td>

                {/* Region */}
                <td className="py-3 text-gray-600">{v.region || "—"}</td>

                {/* Component */}
                <td className="py-3 text-gray-600">
                  {v.component || v.part_code || "—"}
                </td>

                {/* Probability */}
                <td className="py-3">
                  <span
                    className={
                      v.risk === "red"
                        ? "text-red-600 font-medium"
                        : v.risk === "amber"
                          ? "text-amber-600 font-medium"
                          : "text-emerald-600 font-medium"
                    }
                  >
                    {v.probability == null
                      ? "—"
                      : `${Number(v.probability).toFixed(1)}%`}
                  </span>
                </td>

                {/* RUL */}
                <td className="py-3 text-gray-500">{formatRul(v.rul)}</td>

                {/* Risk */}
                <td className="py-3">
                  <RiskBadge level={v.risk} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {visibleVehicles.length === 0 && (
        <div className="py-8 text-center text-sm text-gray-500">
          No prediction data available.
        </div>
      )}
    </div>
  );
}
