export default function RiskDistributionPanel({ distribution }) {
  const rows = [
    {
      label: "Low Risk",
      value: Number(distribution?.green) || 0,
      color: "bg-emerald-500",
    },
    {
      label: "Medium Risk",
      value: Number(distribution?.amber) || 0,
      color: "bg-amber-400",
    },
    {
      label: "High Risk",
      value: Number(distribution?.red) || 0,
      color: "bg-red-500",
    },
  ];
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  if (!total) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
        No risk distribution data available.
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900">Risk Distribution</h3>
      <p className="text-sm text-gray-500 mb-4">
        Current fleet split by risk tier
      </p>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-24 text-sm text-gray-600 shrink-0">
              {r.label}
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${r.color} rounded-full`}
                style={{ width: `${(r.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100">
        {rows.map((r) => (
          <div key={r.label} className="text-center">
            <div className="text-xl font-semibold text-gray-900">{r.value}</div>
            <div className="text-xs text-gray-500">
              {r.label.split(" ")[0].toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
