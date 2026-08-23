import { Truck, AlertTriangle, Wrench, HeartPulse } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import FleetRiskTrendChart from "../components/dashboard/FleetRiskTrendChart";
import RiskDistributionPanel from "../components/dashboard/RiskDistributionPanel";
import TopRiskVehiclesTable from "../components/dashboard/TopRiskVehiclesTable";
import FleetAlerts from "../components/dashboard/FleetAlerts";
import FleetInsights from "../components/dashboard/FleetInsights";
import { fleetStats, riskTrend, riskDistribution, topRiskVehicles, fleetAlerts, fleetInsights } from "../data/mockFleetData";

export default function Overview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Fleet Overview</h1>
        <p className="text-gray-500">Fleet health, risk distribution and maintenance signals across your entire fleet.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Truck} label="Total Vehicles" value={fleetStats.totalVehicles} deltaLabel={`across ${fleetStats.totalFleets} fleets`} />
        <StatCard icon={AlertTriangle} label="Vehicles at High Risk" value={fleetStats.highRisk} deltaLabel={`+${fleetStats.highRiskDelta} vs last week`} deltaTone="up" />
        <StatCard icon={Wrench} label="Components Requiring Attention" value={fleetStats.componentsFlagged} deltaLabel="flagged for inspection" />
        <StatCard icon={HeartPulse} label="Average Fleet Health" value={fleetStats.avgHealth} unit="/ 100" deltaLabel={`${fleetStats.avgHealthDelta} 30-day rolling`} deltaTone="down" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2"><FleetRiskTrendChart data={riskTrend} /></div>
        <RiskDistributionPanel distribution={riskDistribution} />
      </div>

      <TopRiskVehiclesTable vehicles={topRiskVehicles} />

      <div className="grid grid-cols-2 gap-4">
        <FleetAlerts alerts={fleetAlerts} />
        <FleetInsights insights={fleetInsights} />
      </div>
    </div>
  );
}