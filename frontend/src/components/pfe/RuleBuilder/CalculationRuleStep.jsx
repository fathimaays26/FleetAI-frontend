import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { ClipboardList, CheckCircle2, Gauge, Zap } from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api";

function buildFormula(selectedSignals) {
  const total = selectedSignals.reduce((sum, s) => sum + s.value, 0);
  if (!total) return "No selected signal weights available";

  const terms = [...selectedSignals]
    .sort((a, b) => b.value - a.value)
    .map((s) => {
      const coeff = (s.value / total).toFixed(2);
      const key = s.signal
        .toLowerCase()
        .replace(/[^a-z]+/g, "_")
        .replace(/^_|_$/g, "");
      return `${coeff}·${key}`;
    });
  return `failure_probability = ${terms.join(" + ")}`;
}

export default function CalculationRuleStep({
  part,
  selectedSignals,
  onBack,
  onAnalyzeAnother,
}) {
  const [deployed, setDeployed] = useState(false);
  const [backtest, setBacktest] = useState(null);
  const [backtestLoading, setBacktestLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [ruleTrend, setRuleTrend] = useState([]);

  const formulaText = buildFormula(selectedSignals);
  const selectedWeightPct = selectedSignals.length
    ? Math.round(selectedSignals.reduce((sum, signal) => sum + signal.value, 0))
    : null;

  useEffect(() => {
    const controller = new AbortController();
    setBacktest(null);

    const runBacktest = async () => {
      try {
        setBacktestLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/ml/backtest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            part_code: part.part_code,
            selected_signals: selectedSignals.map((signal) => signal.signal),
          }),
        });
        if (!response.ok) throw new Error("Backtest failed");
        const result = await response.json();
        setBacktest({
          daysToAlert: result.days_to_alert,
          rulePrecision: result.rule_precision_pct,
          ruleCoverage: result.rule_coverage_pct,
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError("Unable to run backtest for this rule.");
        }
      } finally {
        if (!controller.signal.aborted) setBacktestLoading(false);
      }
    };

    runBacktest();
    return () => controller.abort();
  }, [part.part_code, selectedSignals]);

  const deployRule = async () => {
    try {
      setSaving(true);
      setError("");
      const ruleResponse = await fetch(`${API_BASE_URL}/ml/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part_code: part.part_code,
          signals: selectedSignals.map((signal) => ({
            signal: signal.signal,
            weight: signal.value / 100,
            is_included: true,
          })),
        }),
      });
      if (!ruleResponse.ok) throw new Error("Rule save failed");
      const trendResponse = await fetch(
        `${API_BASE_URL}/ml/rule-trend?part_code=${encodeURIComponent(part.part_code)}`,
      );
      setRuleTrend(trendResponse.ok ? await trendResponse.json() : []);
      setDeployed(true);
    } catch (requestError) {
      setError("Unable to save this rule.");
    } finally {
      setSaving(false);
    }
  };

  if (deployed) {
    const driverData = [...selectedSignals].sort((a, b) => b.value - a.value);

    return (
      <div>
        <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-100">
          <span className="text-sm text-emerald-700">
            <strong>
              Failure Probability Calculation Rule deployed for{" "}
              {part.description}
            </strong>{" "}
            — now scoring every VIN carrying this component.
          </span>
          <button
            onClick={onAnalyzeAnother}
            className="text-sm text-indigo-600 hover:underline whitespace-nowrap"
          >
            Analyze another part →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
              Probability Trend, Last 10 Weeks
            </h3>
            {ruleTrend.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={ruleTrend.map((item, index) => ({
                    week: `W-${ruleTrend.length - index}`,
                    value: item.probability,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 11 }}
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#f87171"
                    strokeDasharray="4 4"
                    label={{
                      value: "Red threshold",
                      fontSize: 10,
                      fill: "#f87171",
                      position: "insideTopLeft",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-gray-500">
                No probability trend data available for this deployed rule.
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">
              Which Signals Drive This Prediction — All Selected, Per the
              Formula
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={driverData}
                layout="vertical"
                margin={{ left: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="signal"
                  tick={{ fontSize: 11 }}
                  width={110}
                />
                <Bar
                  dataKey="value"
                  fill="#a78bfa"
                  radius={[0, 4, 4, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 text-sm text-gray-600">
          This rule now runs continuously against every VIN carrying a{" "}
          <strong>{part.description}</strong> — any vehicle whose live signal
          profile crosses the learned thresholds surfaces automatically in
          Failure Probability, cross-checked against that same component's
          degradation curve in RUL Explorer. All three views read from the same
          underlying signal and health data — a rule built here can never
          disagree with what the other two show for the same part.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-gray-900">
          Failure Probability Calculation Rule — {part.description}
        </h2>
        <button
          onClick={onBack}
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        A linear regression-style formula built from every signal selected in
        the previous step — no if/else branching.
      </p>

      <div className="bg-gray-900 text-gray-100 rounded-xl p-5 mb-6 font-mono text-sm space-y-2">
        <div className="text-purple-300">{formulaText}</div>
        <div className="text-gray-400 text-xs">
          coefficients = each signal's share of total correlation weight (Σ =
          1.00, all {selectedSignals.length} selected signals included)
        </div>
        <div className="text-emerald-300">
          SELECTED WEIGHT COVERAGE:{" "}
          {selectedWeightPct == null ? "—" : `${selectedWeightPct}%`} for{" "}
          {part.description}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              Days to Alert
            </span>
            <ClipboardList className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {backtestLoading ? "..." : (backtest?.daysToAlert ?? "—")}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Lead time the rule gives before a realized failure.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              Rule Precision
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {backtestLoading
              ? "..."
              : backtest?.rulePrecision == null
                ? "—"
                : `${backtest.rulePrecision}%`}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Flagged cases confirmed as genuine failures in back-testing.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              Rule Coverage
            </span>
            <Gauge className="w-4 h-4 text-gray-400" />
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {backtestLoading
              ? "..."
              : backtest?.ruleCoverage == null
                ? "—"
                : `${backtest.ruleCoverage}%`}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Share of historical failures this rule would have caught.
          </p>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
      <button
        disabled={saving}
        onClick={deployRule}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white text-sm font-medium hover:opacity-90"
      >
        <Zap className="w-4 h-4" />{" "}
        {saving
          ? "Saving rule..."
          : "Deploy Failure Probability Calculation Rule"}
      </button>
    </div>
  );
}
