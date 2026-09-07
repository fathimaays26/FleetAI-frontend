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

// ---------------------------------------------------------
// RISK TIER — SINGLE SOURCE OF TRUTH
// ---------------------------------------------------------
// Risk color must always track the actual RUL-day countdown,
// not the backend's ML probability `risk` field. Those two can
// disagree (e.g. an "amber" probability tier attached to a
// 1-day RUL), which was the source of the visual desync bug.
// Every tier used for display (VIN badge, part pills, part
// detail badge) is derived here from rulDays, once, rather than
// trusting whatever `risk` the backend attached to a record.

const RISK_CRITICAL_MAX_DAYS = 2;
const RISK_WARNING_MAX_DAYS = 7;

const getRiskTierFromDays = (days) => {
  if (days == null || !Number.isFinite(days)) return null;
  if (days <= RISK_CRITICAL_MAX_DAYS) return "red";
  if (days <= RISK_WARNING_MAX_DAYS) return "amber";
  return "green";
};

// The RUL-days value actually shown/used for a part: prefer the
// value already returned by the predictions list, falling back
// to the details endpoint's refined value once it has loaded.
const getDisplayDays = (part) =>
  part?.rulDays ?? part?.details?.predicted_rul_days ?? null;

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
                  const rulDays = calculateRulDays(rulKm);

                  acc[item.vin].parts.push({
                    name: item.component,
                    partCode: item.part_code,
                    probability: item.probability,

                    // Risk tier is derived from rulDays, not the
                    // backend's ML probability tier, so pills/badges
                    // never disagree with the countdown they sit next to.
                    riskTier: getRiskTierFromDays(rulDays) ?? item.risk,

                    // IMPORTANT:
                    // Keep the RUL already returned by predictions API.
                    rulKm: rulKm,
                    rulDays,

                    // Loaded lazily — only once this part is actually
                    // selected (see the on-demand effect below).
                    // `fetched` distinguishes "never requested" from
                    // "requested but the endpoint returned nothing",
                    // so a legitimately-empty response is still cached
                    // and doesn't get refetched every time the part is
                    // reselected.
                    fetched: false,
                    details: null,
                    curve: null,
                    trend: [],
                  });

                  return acc;
                }, {})
            )
          : [];

        // ✨ THE FIX: Sort vehicles by their most urgent (lowest) RUL days
        grouped.sort((a, b) => {
          // Find the lowest rulDays among all parts for vehicle A
          const aMinDays = Math.min(...a.parts.map((p) => p.rulDays));
          // Find the lowest rulDays among all parts for vehicle B
          const bMinDays = Math.min(...b.parts.map((p) => p.rulDays));
          
          // Sort ascending (0d, 1d, 8d, 11d...)
          return aMinDays - bMinDays;
        });

        // ✨ BONUS: Sort the parts inside each vehicle so the most urgent part is listed first
        grouped.forEach(vinObj => {
          vinObj.parts.sort((p1, p2) => p1.rulDays - p2.rulDays);

          // VIN-level badge reflects whichever part is most urgent
          // by days, matching the part that now sorts to the top.
          vinObj.riskTier = vinObj.parts[0]?.riskTier ?? vinObj.riskTier;
        });

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
  // LOAD RUL DETAILS/CURVE/TREND — ON DEMAND, PER PART
  // ---------------------------------------------------------
  // Only the active (VIN, part) pair is fetched, and only once:
  // if `part.fetched` is already true (this part's data is
  // cached in state from an earlier visit), this effect is a
  // no-op and the cached details/curve/trend render instantly.

  useEffect(() => {
    if (!vin || !part) {
      return undefined;
    }

    setDetailError("");

    // Cache hit — this part's data was already fetched earlier
    // in the session, so skip the network call entirely.
    if (part.fetched) {
      setDetailLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const targetVin = vin.vin;
    const targetPartCode = part.partCode;

    async function loadPartData() {
      try {
        setDetailLoading(true);

        const query = `part_code=${encodeURIComponent(targetPartCode)}`;

        const [detailsResponse, curveResponse, trendResponse] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}/api/rul/${encodeURIComponent(
                targetVin
              )}/details?${query}`,
              { signal: controller.signal }
            ),

            fetch(
              `${API_BASE_URL}/api/rul/${encodeURIComponent(
                targetVin
              )}/degradation-curve?${query}`,
              { signal: controller.signal }
            ),

            fetch(
              `${API_BASE_URL}/api/predictions/trend/${encodeURIComponent(
                targetVin
              )}?${query}`,
              { signal: controller.signal }
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

        setVins((currentVins) =>
          currentVins.map((currentVin) => {
            if (currentVin.vin !== targetVin) {
              return currentVin;
            }

            const updatedParts = currentVin.parts.map((currentPart) => {
              if (currentPart.partCode !== targetPartCode) {
                return currentPart;
              }

              // Recompute risk tier now that `details` may carry a
              // refined predicted_rul_days — keeps pills/badges from
              // going stale relative to what's actually displayed.
              const refreshedDays = getDisplayDays({
                ...currentPart,
                details,
              });

              return {
                ...currentPart,
                fetched: true,
                details,
                riskTier:
                  getRiskTierFromDays(refreshedDays) ??
                  currentPart.riskTier,
                curve: toCurve(curveResponseData),
                trend: Array.isArray(trendData)
                  ? trendData
                      .map((item) => item.probability)
                      .filter((value) => value != null)
                  : [],
              };
            });

            // Recompute the VIN-level tier across all parts (fetched
            // or not — unfetched parts still have rulDays from the
            // initial load) so the header badge always tracks whichever
            // part is most urgent.
            const mostUrgentDays = Math.min(
              ...updatedParts.map((p) => getDisplayDays(p) ?? Infinity)
            );

            return {
              ...currentVin,
              parts: updatedParts,
              riskTier:
                getRiskTierFromDays(mostUrgentDays) ?? currentVin.riskTier,
            };
          })
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          console.error(
            `RUL details error for ${targetPartCode}:`,
            requestError
          );

          setDetailError("Unable to load RUL details for this part.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    }

    loadPartData();

    return () => controller.abort();
  }, [selectedVin, selectedPartCode]);

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
          const days = getDisplayDays(firstPart);

          return days == null ? "—" : `${days}d`;
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
              const displayDays = getDisplayDays(item);

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