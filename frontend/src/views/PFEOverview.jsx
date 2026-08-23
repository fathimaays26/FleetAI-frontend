import { Zap, AlertTriangle, ListChecks, Radar } from "lucide-react";
import PfeStatCard from "../components/pfe/PfeStatCard";
import TopPrecursorChart from "../components/pfe/TopPrecursorChart";
import { pfeStats, topPrecursorSignals } from "../data/pfeMockData";

export default function PFEOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <PfeStatCard
          icon={Zap}
          accent="text-purple-500"
          label="Components Under Watch"
          value={pfeStats.componentsUnderWatch}
          description="VIN/component pairs actively scored this cycle."
        />

        <PfeStatCard
          icon={AlertTriangle}
          accent="text-red-500"
          label="High Failure Probability"
          value={pfeStats.highFailureProbability}
          description="Predictions at or above the 70% action threshold."
        />

        <PfeStatCard
          icon={ListChecks}
          accent="text-teal-500"
          label="Components Inside 30-Day RUL"
          value={pfeStats.componentsInside30DayRUL}
          description="Remaining useful life inside the intervention window."
        />

        <PfeStatCard
          icon={Radar}
          accent="text-gray-500"
          label="Precursor Patterns Validated"
          value={pfeStats.precursorPatternsValidated}
          description="Trouble-code chains matched against realized failures."
        />
      </div>

      <TopPrecursorChart data={topPrecursorSignals} />
    </div>
  );
}