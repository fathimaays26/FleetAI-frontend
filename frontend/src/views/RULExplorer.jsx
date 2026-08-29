import { useEffect, useState } from "react";
import RiskBadge from "../components/pfe/RiskBadge";
import VinRankedList from "../components/pfe/VinRankedList";
import DegradationCurveChart from "../components/pfe/DegradationCurveChart";
import ProbabilityTrendChart from "../components/pfe/ProbabilityTrendChart";

const API_BASE_URL = "http://localhost:8000";

// Backend currently uses 114 km/day for RUL conversion.
const DAILY_KM_USAGE = 114;

const formatKm = (value) =>
  value == null ? "—" : `${Number(value).toLocaleString()} km`;

const parseRulKm = (value) => {
  if (value == null) return null;

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));

  return Number.isFinite(parsed) ? parsed : null;
};

const calculateRulDays = (rulKm) => {
  const km = parseRulKm(rulKm);

  if (km == null) {
    return null;
  }

  return Math.floor(km / DAILY_KM_USAGE);
};

const toCurve = (curveResponse) => {
  if (
    !Array.isArray(curveResponse?.curve_data) ||
    !curveResponse.curve_data.length
  ) {
    return null;
  }

  const observed = curveResponse.curve_data.filter(
    (point) => !point.is_projection
  );

  const projected = curveResponse.curve_data.filter(
    (point) => point.is_projection
  );

  const lastObserved = observed[observed.length - 1];

  const lastPoint =
    curveResponse.curve_data[curveResponse.curve_data.length - 1];

  if (!lastObserved || !lastPoint || projected.length === 0) {
    return null;
  }

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

  // ---------------------------------------------------------
  // LOAD ALL PREDICTIONS
  // ---------------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();

    async function loadPredictions() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/predictions/?sort=desc`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load predictions");
        }

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

                  const rulKm = parseRulKm(item.rul);

                  acc[item.vin].parts.push({
                    name: item.component,
                    partCode: item.part_code,
                    probability: item.probability,
                    riskTier: item.risk,

                    // IMPORTANT:
                    // Keep the RUL already returned by predictions API.
                    rulKm: rulKm,
                    rulDays: calculateRulDays(rulKm),

                    // These are loaded separately for the selected VIN.
                    details: null,
                    curve: null,
                    trend: [],
                  });

                  return acc;
                }, {})
            )
          : [];

        setVins(grouped);

        setSelectedVin(grouped[0]?.vin || null);
        setSelectedPartCode(grouped[0]?.parts[0]?.partCode || null);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error("RUL predictions error:", requestError);

          setError(
            "Unable to load RUL predictions. Please make sure the backend is running."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPredictions();

    return () => controller.abort();
  }, []);

  // ---------------------------------------------------------
  // CURRENT VIN + PART
  // ---------------------------------------------------------

  const vin =
    vins.find((item) => item.vin === selectedVin) || null;

  const part =
    vin?.parts.find((item) => item.partCode === selectedPartCode) ||
    vin?.parts[0] ||
    null;

  // ---------------------------------------------------------
  // LOAD RUL DETAILS FOR ALL PARTS OF SELECTED VIN
  // ---------------------------------------------------------

  useEffect(() => {
    if (!vin || !vin.parts.length) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadRulData() {
      try {
        setDetailLoading(true);
        setDetailError("");

        const partsWithDetails = await Promise.all(
          vin.parts.map(async (currentPart) => {
            const query = `part_code=${encodeURIComponent(
              currentPart.partCode
            )}`;

            try {
              const [detailsResponse, curveResponse, trendResponse] =
                await Promise.all([
                  fetch(
                    `${API_BASE_URL}/api/rul/${encodeURIComponent(
                      vin.vin
                    )}/details?${query}`,
                    {
                      signal: controller.signal,
                    }
                  ),

                  fetch(
                    `${API_BASE_URL}/api/rul/${encodeURIComponent(
                      vin.vin
                    )}/degradation-curve?${query}`,
                    {
                      signal: controller.signal,
                    }
                  ),

                  fetch(
                    `${API_BASE_URL}/api/predictions/trend/${encodeURIComponent(
                      vin.vin
                    )}?${query}`,
                    {
                      signal: controller.signal,
                    }
                  ),
                ]);

              const details = detailsResponse.ok
                ? await detailsResponse.json()
                : null;

              const curveResponseData = curveResponse.ok
                ? await curveResponse.json()
                : null;

              const trendData = trendResponse.ok
                ? await trendResponse.json()
                : [];

              return {
                ...currentPart,

                details,

                curve: toCurve(curveResponseData),

                trend: Array.isArray(trendData)
                  ? trendData
                      .map((item) => item.probability)
                      .filter((value) => value != null)
                  : [],
              };
            } catch (partError) {
              if (partError.name === "AbortError") {
                throw partError;
              }

              console.error(
                `Failed to load RUL data for ${currentPart.partCode}:`,
                partError
              );

              return currentPart;
            }
          })
        );

        setVins((currentVins) =>
          currentVins.map((currentVin) => {
            if (currentVin.vin !== vin.vin) {
              return currentVin;
            }

            return {
              ...currentVin,
              parts: partsWithDetails,
            };
          })
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error("RUL details error:", requestError);

          setDetailError(
            "Unable to load RUL details for this VIN."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    }

    loadRulData();

    return () => controller.abort();
  }, [selectedVin]);

  // ---------------------------------------------------------
  // SELECT VIN
  // ---------------------------------------------------------

  const handleSelectVin = (vinId) => {
    const selected = vins.find((item) => item.vin === vinId);

    setSelectedVin(vinId);
    setSelectedPartCode(selected?.parts[0]?.partCode || null);
  };

  // ---------------------------------------------------------
  // PILL COLORS
  // ---------------------------------------------------------

  const pillColor = (tier) =>
    ({
      red: "border-red-200 text-red-600 bg-red-50",
      amber: "border-amber-200 text-amber-600 bg-amber-50",
      green: "border-emerald-200 text-emerald-600 bg-emerald-50",
    })[tier] || "border-gray-200 text-gray-600 bg-gray-50";

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading RUL data...
      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <div className="flex gap-6">
      {/* -------------------------------------------------- */}
      {/* LEFT: VIN LIST */}
      {/* -------------------------------------------------- */}

      <VinRankedList
        title="VINs Ranked by Their Most Urgent Part"
        description="RUL = predicted km remaining before the degradation index crosses the failure threshold, converted to days using each vehicle's own daily-usage rate. Pick a VIN, then check every part tracked on it."
        vins={vins}
        selectedVin={selectedVin}
        onSelectVin={handleSelectVin}
        totalMatching={vins.length}
        getPrimaryStat={(item) => {
          const firstPart = item.parts[0];

          // Use prediction API RUL immediately.
          // This means ALL VINs show their RUL,
          // not just the currently selected VIN.
          if (firstPart?.rulDays != null) {
            return `${firstPart.rulDays}d`;
          }

          // Fallback if details have already loaded.
          if (firstPart?.details?.predicted_rul_days != null) {
            return `${firstPart.details.predicted_rul_days}d`;
          }

          return "—";
        }}
      />

      {/* -------------------------------------------------- */}
      {/* RIGHT CONTENT */}
      {/* -------------------------------------------------- */}

      <div className="flex-1 space-y-4">
        {/* ------------------------------------------------ */}
        {/* VIN HEADER + PART PILLS */}
        {/* ------------------------------------------------ */}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {vin.vin}
            </h2>

            <RiskBadge tier={vin.riskTier} />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            {vin.model} · {vin.region} · {vin.parts.length} parts
            tracked on this VIN
          </p>

          <div className="flex flex-wrap gap-2">
            {vin.parts.map((item) => {
              const displayDays =
                item.rulDays ??
                item.details?.predicted_rul_days ??
                null;

              return (
                <button
                  key={item.partCode}
                  onClick={() =>
                    setSelectedPartCode(item.partCode)
                  }
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    item.partCode === selectedPartCode
                      ? "border-purple-300 bg-purple-50 text-purple-700 font-medium"
                      : pillColor(item.riskTier)
                  }`}
                >
                  {item.name} ·{" "}
                  {displayDays == null
                    ? "—"
                    : `${displayDays}d`}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* RUL DETAILS */}
        {/* ------------------------------------------------ */}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-gray-400">
              RUL-{part.partCode}
            </div>

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
            <div className="py-8 text-sm text-red-600">
              {detailError}
            </div>
          ) : !details ? (
            <div className="py-8 text-sm text-gray-500">
              No RUL details available.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {/* RUL KM */}
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Predicted RUL (km)
                  </div>

                  <div className="text-2xl font-semibold text-gray-900">
                    {formatKm(details.predicted_rul_km)}
                  </div>
                </div>

                {/* RUL DAYS */}
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

                {/* CONFIDENCE */}
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

                {/* TREND */}
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
                . Same part, same VIN, same underlying signal —
                not a second opinion.
              </p>
            </>
          )}
        </div>

        {/* ------------------------------------------------ */}
        {/* DEGRADATION CURVE */}
        {/* ------------------------------------------------ */}

        {part.curve ? (
          <DegradationCurveChart curve={part.curve} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
            No degradation curve data available.
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* PROBABILITY TREND */}
        {/* ------------------------------------------------ */}

        {part.trend.length ? (
          <ProbabilityTrendChart trend={part.trend} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
            No probability trend data available for this VIN
            and part.
          </div>
        )}
      </div>
    </div>
  );
}