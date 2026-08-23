import { useState } from "react";
import RiskBadge from "../components/pfe/RiskBadge";
import VinRankedList from "../components/pfe/VinRankedList";
import ProbabilityTrendChart from "../components/pfe/ProbabilityTrendChart";
import SignalDriversChart from "../components/pfe/SignalDriversChart";
import {
  vinFailureProbabilities,
  totalVinsMatching,
} from "../data/pfeMockData";

export default function FailureProbability() {
  const [selectedVin, setSelectedVin] = useState(
    vinFailureProbabilities[0].vin,
  );
  const [selectedPartName, setSelectedPartName] = useState(
    vinFailureProbabilities[0].parts[0].name,
  );

  const vin = vinFailureProbabilities.find((v) => v.vin === selectedVin);
  const part =
    vin.parts.find((p) => p.name === selectedPartName) ?? vin.parts[0];

  const handleSelectVin = (vinId) => {
    const v = vinFailureProbabilities.find((x) => x.vin === vinId);
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
        title="VINs Ranked by Their Highest-Probability Part"
        description="Probability that a vehicle/component pair fails within its predicted window, scored from correlated telematics signals. Pick a VIN, then check every part tracked on it."
        vins={vinFailureProbabilities}
        selectedVin={selectedVin}
        onSelectVin={handleSelectVin}
        totalMatching={totalVinsMatching}
        getPrimaryStat={(v) =>
          `${Math.max(...v.parts.map((p) => p.probability))}%`
        }
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
                {p.name} · {p.probability}%
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400">
              PFE-{part.name.slice(0, 4).toUpperCase()}
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Failure Probability
              </div>
              <div
                className={`text-3xl font-semibold ${part.probability >= 70 ? "text-red-600" : part.probability >= 40 ? "text-amber-600" : "text-emerald-600"}`}
              >
                {part.probability}%
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {part.name}
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600 mb-3">
            <span>
              <strong>Estimated window:</strong> {part.estimatedWindow}
            </span>
            <span>
              <strong>Top signal:</strong> {part.topSignal} (
              {part.topSignalShare}% of score)
            </span>
            <span className="flex items-center gap-1">
              <strong>Risk tier:</strong> <RiskBadge tier={part.riskTier} />
            </span>
          </div>
          <p className="text-sm text-gray-500 border-t border-gray-100 pt-3">
            Cross-checked against RUL Explorer — {part.rulCrossCheck}. Same
            part, same VIN, same underlying signal — not a second opinion.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ProbabilityTrendChart trend={part.trend} />
          <SignalDriversChart drivers={part.drivers} />
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm text-gray-600">
          {part.scoreNote}
        </div>
      </div>
    </div>
  );
}
