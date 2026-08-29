import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

// riskOf(vin) => "red" | "amber" | "green", getPrimaryStat(vin) => string label (e.g. "73%" or "7d")
export default function VinRankedList({
  title,
  description,
  vins,
  selectedVin,
  onSelectVin,
  totalMatching,
  getPrimaryStat,
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const listRef = useRef(null);

  const filtered = vins.filter(
    (v) =>
      v.vin.toLowerCase().includes(query.toLowerCase()) ||
      v.model.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (visibleCount > 10) {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [visibleCount]);

  const riskColor = {
    red: "text-red-600",
    amber: "text-amber-600",
    green: "text-emerald-600",
  };

  return (
    <div className="w-[380px] shrink-0 border-r border-gray-100 pr-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 rounded bg-purple-50 text-purple-500 text-xs font-medium flex items-center justify-center">
          01
        </span>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      <div className="relative mb-3">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search VIN or model..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white"
        />
      </div>

      <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
        <span>{totalMatching} matching</span>
      </div>

      <div ref={listRef} className="space-y-1 max-h-[520px] overflow-y-auto">
        {filtered.slice(0, visibleCount).map((v) => {
          const active = v.vin === selectedVin;
          return (
            <button
              key={v.vin}
              onClick={() => onSelectVin(v.vin)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                active
                  ? "bg-purple-50 border border-purple-200"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{v.vin}</div>
                <div className="text-xs text-gray-400">
                  {v.model} · {v.parts.length} part
                  {v.parts.length > 1 ? "s" : ""} tracked
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${riskColor[v.riskTier]}`}
              >
                {getPrimaryStat(v)}
              </span>
            </button>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <button
          type="button"
          onClick={() =>
            setVisibleCount((c) => Math.min(c + 30, filtered.length))
          }
          className="w-full mt-2 py-2 text-sm text-indigo-600 hover:underline"
        >
          Show 30 more ({filtered.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
