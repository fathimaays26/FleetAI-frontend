import { Zap, AlertTriangle, ListChecks, Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PfeStatCard from "../components/pfe/PfeStatCard";
import TopPrecursorChart from "../components/pfe/TopPrecursorChart";
import ShortcutCard from "../components/pfe/ShortcutCard";
import { pfeStats, topPrecursorSignals } from "../data/pfeMockData";

export default function PFEOverview() {
  const navigate = useNavigate();

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

      <div className="grid grid-cols-3 gap-4">
        <ShortcutCard
          icon={Zap}
          accent="purple"
          title="Open Failure Probability Rule Builder"
          description="VoltIQ-style guided flow: select a failed part, review its fleet history, correlate telematics signals, and deploy a Failure Probability Calculation Rule."
          onOpen={() => navigate("/predictive-failure-engine/rule-builder")}
        />
        <ShortcutCard
          icon={AlertTriangle}
          accent="red"
          title="Open Failure Probability"
          description="Ranked by VIN — pick a vehicle, then check the failure probability of every part tracked on it, with the precursor signals driving each score."
          onOpen={() =>
            navigate("/predictive-failure-engine/failure-probability")
          }
        />
        <ShortcutCard
          icon={ListChecks}
          accent="teal"
          title="Open RUL Explorer"
          description="Ranked by VIN — pick a vehicle, then check the remaining useful life of every part tracked on it, with the degradation curve behind each estimate."
          onOpen={() => navigate("/predictive-failure-engine/rul-explorer")}
        />
      </div>
    </div>
  );
}
