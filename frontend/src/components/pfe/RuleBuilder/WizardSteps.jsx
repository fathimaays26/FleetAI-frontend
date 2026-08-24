const steps = ["Select Failed Part", "Fleet History", "Correlation", "Failure Probability Calculation Rule"];

export default function WizardSteps({ currentStep }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 text-sm overflow-x-auto">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;
        return (
          <div key={label} className="flex items-center gap-3 shrink-0">
            {i > 0 && <span className="text-gray-300">—</span>}
            <div className="flex items-center gap-2">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                  active || done ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {stepNum}
              </span>
              <span className={active ? "font-medium text-gray-900" : "text-gray-400"}>{label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
