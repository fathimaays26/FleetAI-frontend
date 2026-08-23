import RiskBadge from "./RiskBadge";

export default function TopRiskVehiclesTable({ vehicles }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Top Risk Vehicles</h3>
          <p className="text-sm text-gray-500">Vehicles ranked by highest failure probability</p>
        </div>
        <button className="text-sm text-indigo-600 hover:underline">View all →</button>
      </div>
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
          {vehicles.map((v) => (
            <tr key={v.vin} className="border-b border-gray-50 last:border-0">
              <td className="py-3 text-gray-500">{v.vin}</td>
              <td className="py-3">
                <div className="font-medium text-gray-900">{v.vehicle}</div>
                <div className="text-xs text-gray-400">{v.miles} · {v.fleet}</div>
              </td>
              <td className="py-3 text-gray-600">{v.region}</td>
              <td className="py-3 text-gray-600">{v.component}</td>
              <td className="py-3">
                <span className={v.risk === "red" ? "text-red-600 font-medium" : "text-amber-600 font-medium"}>{v.probability}%</span>
              </td>
              <td className="py-3 text-gray-500">{v.rul}</td>
              <td className="py-3"><RiskBadge level={v.risk} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}