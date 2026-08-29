const styles = {
  red: "bg-red-50 text-red-600 border-red-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200",
};

export default function RiskBadge({ level }) {
  const normalizedLevel = level == null ? null : String(level).toLowerCase();

  if (!normalizedLevel || !styles[normalizedLevel]) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-xs font-medium text-gray-400">
        —
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${styles[normalizedLevel]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />

      {normalizedLevel.toUpperCase()}
    </span>
  );
}
