export default function StatCard({ icon: Icon, label, value, unit, deltaLabel, deltaTone = "neutral" }) {
  const toneClass = { up: "text-amber-600", down: "text-emerald-600", neutral: "text-gray-500" }[deltaTone];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-400">{unit}</span>}
      </div>
      {deltaLabel && <div className={`text-xs mt-2 ${toneClass}`}>{deltaLabel}</div>}
    </div>
  );
}