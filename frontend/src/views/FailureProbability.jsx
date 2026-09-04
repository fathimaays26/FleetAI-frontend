import { useEffect, useState } from "react";
import RiskBadge from "../components/pfe/RiskBadge";
import VinRankedList from "../components/pfe/VinRankedList";
import ProbabilityTrendChart from "../components/pfe/ProbabilityTrendChart";
import SignalDriversChart from "../components/pfe/SignalDriversChart";

const API_BASE_URL = "http://localhost:8000";

const getProbability = (item) => item.probability;

const groupPredictionsByVin = (predictions) => {
  const grouped = new Map();

  predictions.forEach((item) => {
    if (!item?.vin) return;

    const part = {
      name: item.component || "—",
      partCode: item.part_code,
      probability: getProbability(item),
      riskTier: item.risk,
      rul: item.rul || "—",
      topSignal: item.top_signal || "—",
      topSignalShare: null,
      estimatedWindow: "Based on current RUL",
      rulCrossCheck: `Current predicted RUL: ${item.rul || "—"}`,
      trend: [],
      drivers: [],
      scoreNote:
        "Prediction generated from the active rule configuration and latest available telematics signals.",
    };

    const existing = grouped.get(item.vin);
    if (existing) {
      existing.parts.push(part);
      return;
    }

    grouped.set(item.vin, {
      vin: item.vin,
      model: item.vehicle || "—",
      region: item.region || "—",
      riskTier: part.riskTier,
      parts: [part],
    });
  });

  return Array.from(grouped.values());
};

export default function FailureProbability() {
  const [vins, setVins] = useState([]);
  const [selectedVin, setSelectedVin] = useState(null);
  const [selectedPartCode, setSelectedPartCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPredictions() {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `${API_BASE_URL}/api/predictions/?sort=desc`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Failed to load predictions");

        const predictions = await response.json();
        const groupedVins = groupPredictionsByVin(
          Array.isArray(predictions) ? predictions : [],
        );
        setVins(groupedVins);
        setSelectedVin(groupedVins[0]?.vin || null);
        setSelectedPartCode(groupedVins[0]?.parts[0]?.partCode || null);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error("PFE predictions error:", requestError);
          setError(
            "Unable to load predictions. Please make sure the backend is running.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadPredictions();
    return () => controller.abort();
  }, []);

  const vin = vins.find((item) => item.vin === selectedVin) || null;
  const part =
    vin?.parts.find((item) => item.partCode === selectedPartCode) ||
    vin?.parts[0] ||
    null;

  useEffect(() => {
    if (!vin || !part?.partCode) return undefined;

    const controller = new AbortController();

    async function loadPartDetails() {
      try {
        setDetailLoading(true);
        const query = `part_code=${encodeURIComponent(part.partCode)}`;
        const [trendResponse, driversResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/predictions/trend/${encodeURIComponent(vin.vin)}?${query}`,
            { signal: controller.signal },
          ),
          fetch(
            `${API_BASE_URL}/api/predictions/${encodeURIComponent(vin.vin)}/signal-breakdown?${query}`,
            { signal: controller.signal },
          ),
        ]);
        if (!trendResponse.ok || !driversResponse.ok) {
          throw new Error("Failed to load prediction details");
        }

        const [trendData, driversData] = await Promise.all([
          trendResponse.json(),
          driversResponse.json(),
        ]);
        const trend = (Array.isArray(trendData) ? trendData : [])
          .filter((item) => item?.probability != null)
          .map((item) => ({
            period: item.week_start_date || item.date || item.week,
            value: item.probability,
          }));
        const drivers = (Array.isArray(driversData) ? driversData : []).map(
          (item) => ({
            signal: item.signal_name,
            value: item.contribution_pct,
          }),
        );
        const topSignal = part.topSignal.toLowerCase();
        const topSignalMatch = driversData.find(
          (item) => item.signal_name?.toLowerCase() === topSignal,
        );

        setVins((currentVins) =>
          currentVins.map((currentVin) => {
            if (currentVin.vin !== vin.vin) return currentVin;
            return {
              ...currentVin,
              parts: currentVin.parts.map((currentPart) =>
                currentPart.partCode === part.partCode
                  ? {
                      ...currentPart,
                      trend,
                      drivers,
                      topSignalShare: topSignalMatch?.contribution_pct ?? null,
                    }
                  : currentPart,
              ),
            };
          }),
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error("PFE detail error:", requestError);
        }
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }

    loadPartDetails();
    return () => controller.abort();
  }, [selectedVin, selectedPartCode]);

  const handleSelectVin = (vinId) => {
    const selected = vins.find((item) => item.vin === vinId);
    setSelectedVin(vinId);
    setSelectedPartCode(selected?.parts[0]?.partCode || null);
  };

  const pillColor = (tier) =>
    ({
      red: "border-red-200 text-red-600 bg-red-50",
      amber: "border-amber-200 text-amber-600 bg-amber-50",
      green: "border-emerald-200 text-emerald-600 bg-emerald-50",
    })[tier];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading predictions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-red-600">
        {error}
      </div>
    );
  }

  if (!vin || !part) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        No predictions available.
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <VinRankedList
        title="VINs Ranked by Their Highest-Probability Part"
        description="Probability that a vehicle/component pair fails within its predicted window, scored from correlated telematics signals. Pick a VIN, then check every part tracked on it."
        vins={vins}
        selectedVin={selectedVin}
        onSelectVin={handleSelectVin}
        totalMatching={vins.length}
        getPrimaryStat={(v) =>
          `${Math.max(...v.parts.map((p) => p.probability))}%`
        }
      />

      <div className="flex-1 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">{vin.vin}</h2>
            <RiskBadge level={vin.riskTier} tier={vin.riskTier} />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {vin.model} · {vin.region} · {vin.parts.length} parts tracked on
            this VIN
          </p>
          <div className="flex flex-wrap gap-2">
            {vin.parts.map((p) => (
              <button
                key={p.name}
                onClick={() => setSelectedPartCode(p.partCode)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  p.partCode === selectedPartCode
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
            <div className="text-xs text-gray-400">PFE-{part.partCode}</div>
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
              <strong>Estimated window:</strong> Based on current RUL
            </span>
            <span>
              <strong>Top signal:</strong> {part.topSignal} (
              {part.topSignalShare == null ? "—" : `${part.topSignalShare}%`} of
              score)
            </span>
            <span className="flex items-center gap-1">
              <strong>Risk tier:</strong>{" "}
              <RiskBadge level={part.riskTier} tier={part.riskTier} />
            </span>
          </div>
          <p className="text-sm text-gray-500 border-t border-gray-100 pt-3">
            Cross-checked against RUL Explorer — Current predicted RUL:{" "}
            {part.rul}. Same part, same VIN, same underlying signal — not a
            second opinion.
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
