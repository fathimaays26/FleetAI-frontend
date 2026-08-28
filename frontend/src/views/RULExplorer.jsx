import { useEffect, useState } from "react";
import RiskBadge from "../components/pfe/RiskBadge";
import VinRankedList from "../components/pfe/VinRankedList";
import DegradationCurveChart from "../components/pfe/DegradationCurveChart";

const API_BASE_URL = "http://localhost:8000";

const formatKm = (value) =>
  value == null ? "—" : `${Number(value).toLocaleString()} km`;

const toCurve = (curveResponse) => {
  if (
    !Array.isArray(curveResponse?.curve_data) ||
    !curveResponse.curve_data.length
  ) {
    return null;
  }

  const observed = curveResponse.curve_data.filter(
    (point) => !point.is_projection,
  );
  const projected = curveResponse.curve_data.filter(
    (point) => point.is_projection,
  );
  const lastObserved = observed[observed.length - 1];
  const lastPoint =
    curveResponse.curve_data[curveResponse.curve_data.length - 1];

  if (!lastObserved || !lastPoint || projected.length === 0) return null;

  return {
    solidEnd: lastObserved.km,
    values: observed.map((point) => point.health_index),
    dashedValues: projected.map((point) => point.health_index),
    failureThreshold: curveResponse.failure_threshold_index,
    maxX: lastPoint.km,
  };
};

export default function RULExplorer() {
  const [vins, setVins] = useState([]);
  const [selectedVin, setSelectedVin] = useState(null);
  const [selectedPartCode, setSelectedPartCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

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
        const grouped = Array.isArray(predictions)
          ? Object.values(
              predictions
                .filter((item) => item?.vin && item?.part_code)
                .reduce((acc, item) => {
                  if (!acc[item.vin]) {
                    acc[item.vin] = {
                      vin: item.vin,
                      model: item.vehicle,
                      region: item.region,
                      riskTier: item.risk,
                      parts: [],
                    };
                  }

                  acc[item.vin].parts.push({
                    name: item.component,
                    partCode: item.part_code,
                    probability: item.probability,
                    riskTier: item.risk,
                    details: null,
                    curve: null,
                  });

                  return acc;
                }, {}),
            )
          : [];

        const vinsWithDetails = await Promise.all(
          grouped.map(async (item) => {
            const firstPart = item.parts[0];
            if (!firstPart?.partCode) return item;

            try {
              const detailsResponse = await fetch(
                `${API_BASE_URL}/api/rul/${encodeURIComponent(item.vin)}/details?part_code=${encodeURIComponent(firstPart.partCode)}`,
                { signal: controller.signal },
              );
              if (!detailsResponse.ok) return item;

              const details = await detailsResponse.json();
              return {
                ...item,
                parts: item.parts.map((part, index) =>
                  index === 0 ? { ...part, details } : part,
                ),
              };
            } catch (detailsError) {
              if (detailsError.name === "AbortError") throw detailsError;
              return item;
            }
          }),
        );

        setVins(vinsWithDetails);
        setSelectedVin(vinsWithDetails[0]?.vin || null);
        setSelectedPartCode(vinsWithDetails[0]?.parts[0]?.partCode || null);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error("RUL predictions error:", requestError);
          setError(
            "Unable to load RUL predictions. Please make sure the backend is running.",
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

    async function loadRulData() {
      try {
        setDetailLoading(true);
        setDetailError("");
        const query = `part_code=${encodeURIComponent(part.partCode)}`;
        const [detailsResponse, curveResponse] = await Promise.all([
          fetch(
            `${API_BASE_URL}/api/rul/${encodeURIComponent(vin.vin)}/details?${query}`,
            { signal: controller.signal },
          ),
          fetch(
            `${API_BASE_URL}/api/rul/${encodeURIComponent(vin.vin)}/degradation-curve?${query}`,
            { signal: controller.signal },
          ),
        ]);
        if (!detailsResponse.ok || !curveResponse.ok) {
          throw new Error("Failed to load RUL details");
        }

        const [details, curveResponseData] = await Promise.all([
          detailsResponse.json(),
          curveResponse.json(),
        ]);

        setVins((currentVins) =>
          currentVins.map((currentVin) => {
            if (currentVin.vin !== vin.vin) return currentVin;
            return {
              ...currentVin,
              parts: currentVin.parts.map((currentPart) =>
                currentPart.partCode === part.partCode
                  ? {
                      ...currentPart,
                      details,
                      curve: toCurve(curveResponseData),
                    }
                  : currentPart,
              ),
            };
          }),
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error("RUL details error:", requestError);
          setDetailError("Unable to load RUL details for this part.");
        }
      } finally {
        if (!controller.signal.aborted) setDetailLoading(false);
      }
    }

    loadRulData();
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
        Loading RUL data...
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
        No RUL predictions available.
      </div>
    );
  }

  const details = part.details;

  return (
    <div className="flex gap-6">
      <VinRankedList
        title="VINs Ranked by Their Most Urgent Part"
        description="RUL = predicted km remaining before the degradation index crosses the failure threshold, converted to days using each vehicle's own daily-usage rate. Pick a VIN, then check every part tracked on it."
        vins={vins}
        selectedVin={selectedVin}
        onSelectVin={handleSelectVin}
        totalMatching={vins.length}
        getPrimaryStat={(item) =>
          `${item.parts[0]?.details?.predicted_rul_days ?? "—"}d`
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
            {vin.parts.map((item) => (
              <button
                key={item.partCode}
                onClick={() => setSelectedPartCode(item.partCode)}
                className={`px-3 py-1.5 rounded-full text-sm border ${
                  item.partCode === selectedPartCode
                    ? "border-purple-300 bg-purple-50 text-purple-700 font-medium"
                    : pillColor(item.riskTier)
                }`}
              >
                {item.name} ·{" "}
                {item.details?.predicted_rul_days == null
                  ? "—"
                  : `${item.details.predicted_rul_days}d`}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400">RUL-{part.partCode}</div>
            <RiskBadge tier={part.riskTier} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {part.name}
          </h3>
          {detailLoading ? (
            <div className="py-8 text-sm text-gray-500">
              Loading RUL details...
            </div>
          ) : detailError ? (
            <div className="py-8 text-sm text-red-600">{detailError}</div>
          ) : !details ? (
            <div className="py-8 text-sm text-gray-500">
              No RUL details available.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Predicted RUL (km)
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatKm(details.predicted_rul_km)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Predicted RUL (days)
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {details.predicted_rul_days == null
                      ? "—"
                      : `${details.predicted_rul_days} d`}
                  </div>
                  <div className="text-xs text-gray-400">
                    {details.observed_daily_usage_km == null
                      ? "—"
                      : `${details.observed_daily_usage_km} km/day observed usage`}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Model Confidence
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {details.model_confidence_pct == null
                      ? "—"
                      : `${details.model_confidence_pct}%`}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Degradation Trend
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {details.degradation_trend_monthly == null
                      ? "—"
                      : details.degradation_trend_monthly}
                  </div>
                  <div className="text-xs text-gray-400">
                    health-index points per month
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 border-t border-gray-100 pt-3">
                Cross-checked against Failure Probability —{" "}
                {part.probability == null
                  ? "—"
                  : `${part.probability}% failure probability`}
                . Same part, same VIN, same underlying signal — not a second
                opinion.
              </p>
            </>
          )}
        </div>

        {part.curve ? (
          <DegradationCurveChart curve={part.curve} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
            No degradation curve data available.
          </div>
        )}
      </div>
    </div>
  );
}
