import { useEffect, useState } from "react";
import { Zap, AlertTriangle, ListChecks, Radar } from "lucide-react";
import PfeStatCard from "../components/pfe/PfeStatCard";
import TopPrecursorChart from "../components/pfe/TopPrecursorChart";

const API_BASE_URL = "http://localhost:8000/api";

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
    ])
      .then(async ([kpisResponse, precursorsResponse]) => {
        if (!kpisResponse.ok || !precursorsResponse.ok)
          throw new Error("PFE overview request failed");
        const [kpisData, precursorsData] = await Promise.all([
          kpisResponse.json(),
          precursorsResponse.json(),
        ]);

        const precursorRows = Array.isArray(precursorsData)
          ? precursorsData
              .filter(
                (item) =>
                  item?.signal_name && Number.isFinite(Number(item.value)),
              )
              .map((item) => ({
                signal: item.signal_name,
                value: Number(item.value),
              }))
          : [];

        setKpis(kpisData);
        setPrecursors(precursorRows);
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
