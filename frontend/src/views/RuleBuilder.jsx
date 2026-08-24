import { useState } from "react";
import { Zap } from "lucide-react";
import WizardSteps from "../components/pfe/RuleBuilder/WizardSteps";
import SelectFailedPartStep from "../components/pfe/RuleBuilder/SelectFailedPartStep";
import FleetHistoryStep from "../components/pfe/RuleBuilder/FleetHistoryStep";
import CorrelationStep from "../components/pfe/RuleBuilder/CorrelationStep";
import CalculationRuleStep from "../components/pfe/RuleBuilder/CalculationRuleStep";

export default function RuleBuilder() {
  const [step, setStep] = useState(1);
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedSignals, setSelectedSignals] = useState([]);

  const reset = () => {
    setStep(1);
    setSelectedPart(null);
    setSelectedSignals([]);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
        <Zap className="w-4 h-4 text-purple-600" />
        <span className="font-semibold text-gray-900">VoltIQ</span>
        <span className="text-gray-400 text-sm">
          · Part Failure Analysis & Failure Probability Rules
        </span>
      </div>

      <WizardSteps currentStep={step} />

      <div className="p-6">
        {step === 1 && (
          <SelectFailedPartStep
            onSelectPart={(part) => {
              setSelectedPart(part);
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <FleetHistoryStep
            part={selectedPart}
            onChangePart={() => setStep(1)}
            onRunCorrelation={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <CorrelationStep
            part={selectedPart}
            onBack={() => setStep(2)}
            onBuildRule={(signals) => {
              setSelectedSignals(signals);
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <CalculationRuleStep
            part={selectedPart}
            selectedSignals={selectedSignals}
            onBack={() => setStep(3)}
            onAnalyzeAnother={reset}
          />
        )}
      </div>
    </div>
  );
}
