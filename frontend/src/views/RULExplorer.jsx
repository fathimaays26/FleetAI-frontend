import { useState } from "react";
import { ChevronRight } from "lucide-react";
import RiskBadge from "../components/pfe/RiskBadge";
import VinRankedList from "../components/pfe/VinRankedList";
import DegradationCurveChart from "../components/pfe/DegradationCurveChart";
import { vinRulRankings, totalVinsMatching } from "../data/pfeMockData";

// some mock parts only carry a `days` figure (used in the list) without full
// detail — fall back to a generic detail shape so any VIN in the list can be
// selected without breaking the panel.
function withFallbackDetail(part) {
  if (part.predictedKm) return part;
  return {
    ...part,
    predictedKm: "—",
    designLife: "design life unavailable",
    predictedDays: part.days,
    usageRate: "usage data unavailable",
    modelConfidence: 70,
    degradationTrend: "—",
    pfeCrossCheck: "see Failure Probability tab for this part",
    curve: {
      solidEnd: 20000,
      values: [90, 80, 70, 60, 50],
      dashedValues: [50, 45, 42, 40, 38],
      failureThreshold: 30,
      maxX: 30000,
    },
    modelNote: `At the current usage rate, this component crosses the failure threshold in ${part.days} days.`,
  };
}

export default function RULExplorer() {
  const [selectedVin, setSelectedVin] = useState(vinRulRankings[0].vin);
  const [selectedPartName, setSelectedPartName] = useState(
    vinRulRankings[0].parts[0].name,
  );

  const vin = vinRulRankings.find((v) => v.vin === selectedVin);
  const rawPart =
    vin.parts.find((p) => p.name === selectedPartName) ?? vin.parts[0];
  const part = withFallbackDetail(rawPart);

  const handleSelectVin = (vinId) => {
    const v = vinRulRankings.find((x) => x.vin === vinId);
    setSelectedVin(vinId);
    setSelectedPartName(v.parts[0].name);
  };

  const pillColor = (tier) =>
    ({
      red: "border-red-200 text-red-600 bg-red-50",
      amber: "border-amber-200 text-amber-600 bg-amber-50",
      green: "border-emerald-200 text-emerald-600 bg-emerald-50",
    })[tier];

  return (
    <div className="flex gap-6">
      <VinRankedList
        title="VINs Ranked by Their Most Urgent Part"
        description="RUL = predicted km remaining before the degradation index crosses the failure threshold, converted to days using each vehicle's own daily-usage rate. Pick a VIN, then check every part tracked on it."
        vins={vinRulRankings}
        selectedVin={selectedVin}
        onSelectVin={handleSelectVin}
        totalMatching={totalVinsMatching}
        getPrimaryStat={(v) => `${Math.min(...v.parts.map((p) => p.days))}d`}
      />

      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">{vin.vin}</h2>
            <RiskBadge tier={vin.riskTier} />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {vin.model} · {vin.region} · {vin.parts.length} parts tracked on
            this VIN
          </p>
          <div className="flex flex-wrap gap-2">
            {vin.parts.map((p) => (
              <button
                key={p.name}
                onClick={() => setSelectedPartName(p.name)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  p.name === selectedPartName
                    ? "border-purple-300 bg-purple-50 text-purple-700 font-medium"
                    : pillColor(p.riskTier)
                }`}
              >
                {p.name} · {p.days}d
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400">
              RUL-{part.name.slice(0, 4).toUpperCase()}
            </div>
            <RiskBadge tier={part.riskTier} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {part.name}
          </h3>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Predicted RUL (km)
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {part.predictedKm}
              </div>
              <div className="text-xs text-gray-400">{part.designLife}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Predicted RUL (days)
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {part.predictedDays} d
              </div>
              <div className="text-xs text-gray-400">{part.usageRate}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Model Confidence
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {part.modelConfidence}%
              </div>
              <div className="text-xs text-gray-400">
                width of the survival band
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                Degradation Trend
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {part.degradationTrend}
              </div>
              <div className="text-xs text-gray-400">
                health-index points per month
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-500 border-t border-gray-100 pt-3">
            Cross-checked against Failure Probability — {part.pfeCrossCheck}.
            Same part, same VIN, same underlying signal — not a second opinion.
          </p>
        </div>

        <DegradationCurveChart curve={part.curve} />

        <div className="bg-white rounded-xl border border-gray-200">
          <button className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-700">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-purple-50 text-purple-500 text-xs font-medium flex items-center justify-center">
                03
              </span>
              HOW RUL IS MODELED
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm text-gray-600">
          {part.modelNote}
        </div>
      </div>
    </div>
  );
}
