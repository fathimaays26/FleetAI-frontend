import { useEffect, useState } from "react";
import { Truck, AlertTriangle, Wrench, HeartPulse } from "lucide-react";

import StatCard from "../components/dashboard/StatCard";
import FleetRiskTrendChart from "../components/dashboard/FleetRiskTrendChart";
import RiskDistributionPanel from "../components/dashboard/RiskDistributionPanel";
import TopRiskVehiclesTable from "../components/dashboard/TopRiskVehiclesTable";
import FleetAlerts from "../components/dashboard/FleetAlerts";
import FleetInsights from "../components/dashboard/FleetInsights";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export default function Overview() {
  const [kpis, setKpis] = useState(null);
  const [riskTrend, setRiskTrend] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState(null);
  const [topRiskVehicles, setTopRiskVehicles] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFleetOverview() {
      try {
        setLoading(true);
        setError("");

        const [
          kpisResponse,
          trendResponse,
          predictionsResponse,
          alertsResponse,
        ] = await Promise.all([
          fetch(`${API_BASE_URL}/fleet/overview-kpis`),
          fetch(`${API_BASE_URL}/fleet/risk-trend`),
          fetch(`${API_BASE_URL}/predictions/?sort=desc`),
          fetch(`${API_BASE_URL}/fleet/alerts-and-insights`),
        ]);

        if (
          !kpisResponse.ok ||
          !trendResponse.ok ||
          !predictionsResponse.ok ||
          !alertsResponse.ok
        ) {
          throw new Error("Failed to load fleet data");
        }

        const kpisData = await kpisResponse.json();
        const trendData = await trendResponse.json();
        const predictionsData = await predictionsResponse.json();
        const alertsData = await alertsResponse.json();

        setKpis(kpisData);

        setRiskTrend(
          trendData.trend_data.map((item) => ({
            date: item.date,
            green: item.low_risk,
            amber: item.medium_risk,
            red: item.high_risk,
          }))
        );

        setRiskDistribution({
          green: trendData.current_distribution.low,
          amber: trendData.current_distribution.medium,
          red: trendData.current_distribution.high,
        });

        setTopRiskVehicles(
  predictionsData.map((item) => ({
    vin: item.vin,
    vehicle: item.vin,
    miles: "—",
    fleet: "—",
    region: "—",
    component: item.part_code,
    probability: item.failure_probability_pct,
    rul: item.rul_km,
    risk: item.risk_tier?.toLowerCase() || "green",
  }))
);

        setAlerts(alertsData.alerts || []);
        setInsights(alertsData.insights || []);
      } catch (err) {
        console.error("Fleet overview error:", err);
        setError("Unable to load fleet data from the backend.");
      } finally {
        setLoading(false);
      }
    }

    loadFleetOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        Loading fleet data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Fleet Overview
        </h1>
        <p className="text-gray-500">
          Fleet health, risk distribution and maintenance signals across your
          entire fleet.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Truck}
          label="Total Vehicles"
          value={kpis.total_vehicles}
        />

        <StatCard
          icon={AlertTriangle}
          label="Vehicles at High Risk"
          value={kpis.vehicles_at_high_risk}
        />

        <StatCard
          icon={Wrench}
          label="Components Requiring Attention"
          value={kpis.components_requiring_attention}
        />

        <StatCard
          icon={HeartPulse}
          label="Average Fleet Health"
          value={kpis.average_fleet_health}
          unit="/ 100"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <FleetRiskTrendChart data={riskTrend} />
        </div>

        <RiskDistributionPanel
          distribution={riskDistribution}
        />
      </div>

      <TopRiskVehiclesTable vehicles={topRiskVehicles} />

      <div className="grid grid-cols-2 gap-4">
        <FleetAlerts alerts={alerts} />
        <FleetInsights insights={insights} />
      </div>
    </div>
  );
}