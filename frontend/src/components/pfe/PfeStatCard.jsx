export default function PfeStatCard({ icon: Icon, label, value, description, accent = "text-gray-400" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
      </div>
      <div className="text-3xl font-semibold text-gray-900 mb-1">{value}</div>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}
