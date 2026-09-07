import { useEffect, useState } from "react";
import { Zap, AlertTriangle, ListChecks, Radar } from "lucide-react";
import PfeStatCard from "../components/pfe/PfeStatCard";
import TopPrecursorChart from "../components/pfe/TopPrecursorChart";

const API_BASE_URL = "http://localhost:8000/api";

const getSignalKey = (signal) => signal?.trim().toLowerCase();

// ✨ NEW: Added a mapping dictionary to convert raw database strings to UI-friendly labels
const SIGNAL_NAME_MAP = {
  "coolant_temp_variance": "Coolant temp variance",
  "battery_voltage_sag": "Battery voltage sag",
  "harsh_braking_frequency": "Harsh braking frequency",
  "short_trip_ratio": "Short-trip ratio",
  "dtc_recurrence_rate": "DTC recurrence rate",
  "oil_pressure_dips": "Oil pressure dips",
  "high_rpm_dwell_time": "High RPM dwell time",
  "idle_time_pct": "Idle time percentage",
  "overload_duty_share": "Overload duty share"
};

export default function PFEOverview() {
  const [kpis, setKpis] = useState(null);
  const [precursors, setPrecursors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(`${API_BASE_URL}/engine/overview-kpis`, {
        signal: controller.signal,
      }),
      fetch(`${API_BASE_URL}/engine/top-precursors`, {
        signal: controller.signal,
      }),
      fetch(`${API_BASE_URL}/parts`, { signal: controller.signal }),
    ])
      .then(async ([kpisResponse, precursorsResponse, partsResponse]) => {
        if (!kpisResponse.ok || !precursorsResponse.ok || !partsResponse.ok)
          throw new Error("PFE overview request failed");
        const [kpisData, precursorsData, partsData] = await Promise.all([
          kpisResponse.json(),
          precursorsResponse.json(),
          partsResponse.json(),
        ]);

        const partCodes = Object.values(partsData || {})
          .flatMap((partGroup) => (Array.isArray(partGroup) ? partGroup : []))
          .map((part) => part.part_code)
          .filter(Boolean);
        const correlationResponses = await Promise.all(
          partCodes.map((partCode) =>
            fetch(
              `${API_BASE_URL}/ml/correlations?part_code=${encodeURIComponent(partCode)}`,
              { signal: controller.signal },
            ),
          ),
        );
        const correlationData = await Promise.all(
          correlationResponses.map((response) =>
            response.ok ? response.json() : [],
          ),
        );
        const signalNames = [
          ...correlationData.flatMap((signals) =>
            Array.isArray(signals) ? signals.map((item) => item.signal) : [],
          ),
          ...(Array.isArray(precursorsData)
            ? precursorsData.map((item) => item.signal_name)
            : []),
        ];
        const measuredValues = new Map(
          (Array.isArray(precursorsData) ? precursorsData : [])
            .filter((item) => getSignalKey(item.signal_name))
            .map((item) => [getSignalKey(item.signal_name), item.value]),
        );
        
        const allSignals = [...new Set(signalNames.map(getSignalKey))]
          .filter(Boolean)
          .map((signalKey) => {
            const rawSignal = signalNames.find(
              (signal) => getSignalKey(signal) === signalKey,
            );
            return {
              // ✨ MODIFIED: Safely fall back to raw string if not in map, but overrides with friendly name
              signal: SIGNAL_NAME_MAP[rawSignal] || rawSignal,
              // ✨ NEW: Inject an explicit 'label' property in case TopPrecursorChart specifically looks for it
              label: SIGNAL_NAME_MAP[rawSignal] || rawSignal,
              value: measuredValues.get(signalKey) ?? 0,
              hasMeasuredValue: measuredValues.has(signalKey),
            };
          })
          // ✨ NEW: Filter out absolute zero values to remove duplicate flatlined bars at the bottom
          .filter(item => item.value > 0)
          .sort(
            (first, second) =>
              Number(second.hasMeasuredValue) -
                Number(first.hasMeasuredValue) || second.value - first.value,
          );

        setKpis(kpisData);
        setPrecursors(allSignals);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError")
          setError(
            "Unable to load PFE data. Please make sure the backend is running.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading PFE data...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center py-20 text-red-600">
        {error}
      </div>
    );
  if (!kpis)
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        No PFE data available.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <PfeStatCard
          icon={Zap}
          accent="text-purple-500"
          label="Components Under Watch"
          value={kpis.components_under_watch}
          description="VIN/component pairs actively scored this cycle."
        />

        <PfeStatCard
          icon={AlertTriangle}
          accent="text-red-500"
          label="High Failure Probability"
          value={kpis.high_failure_probability}
          description="Predictions at or above the 70% action threshold."
        />

        <PfeStatCard
          icon={ListChecks}
          accent="text-teal-500"
          label="Components Inside 30-Day RUL"
          value={kpis.components_inside_30_day_rul}
          description="Remaining useful life inside the intervention window."
        />

        <PfeStatCard
          icon={Radar}
          accent="text-gray-500"
          label="Precursor Patterns Validated"
          value={kpis.precursor_patterns_validated}
          description="Trouble-code chains matched against realized failures."
        />
      </div>

      {precursors.length ? (
        <TopPrecursorChart data={precursors} />
      ) : (
        <div className="rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
          No precursor data available.
        </div>
      )}
    </div>
  );
}