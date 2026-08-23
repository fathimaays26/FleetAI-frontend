export const fleetStats = {
  totalVehicles: 248,
  totalFleets: 4,
  highRisk: 19,
  highRiskDelta: 3,
  componentsFlagged: 47,
  avgHealth: 81.4,
  avgHealthDelta: -0.4,
};

export const riskTrend = [
  { date: "Aug 01", green: 210, amber: 30, red: 8 },
  { date: "Aug 04", green: 205, amber: 32, red: 9 },
  { date: "Aug 07", green: 200, amber: 34, red: 10 },
  { date: "Aug 10", green: 195, amber: 36, red: 12 },
  { date: "Aug 13", green: 190, amber: 38, red: 14 },
  { date: "Aug 16", green: 188, amber: 40, red: 17 },
  { date: "Aug 19", green: 187, amber: 42, red: 19 },
];

export const riskDistribution = { green: 187, amber: 42, red: 19 };

export const topRiskVehicles = [
  { vin: "FG-2026-001", vehicle: "Long-Haul Tractor", fleet: "National Freight", miles: "486k mi", region: "Midwest", component: "Alternator", probability: 73, rul: "7d", risk: "red" },
  { vin: "FG-2026-002", vehicle: "Regional Hauler", fleet: "National Freight", miles: "313k mi", region: "Southwest", component: "Transmission Fluid", probability: 61, rul: "14d", risk: "red" },
  { vin: "FG-2026-003", vehicle: "Distribution Truck", fleet: "Metro Logistics", miles: "198k mi", region: "Northeast", component: "Radiator Fan", probability: 58, rul: "18d", risk: "red" },
  { vin: "FG-2026-004", vehicle: "Long-Haul Tractor", fleet: "Pacific Transport", miles: "542k mi", region: "West Coast", component: "Brake Pads", probability: 54, rul: "21d", risk: "amber" },
  { vin: "FG-2026-005", vehicle: "Regional Hauler", fleet: "National Freight", miles: "277k mi", region: "Midwest", component: "HV Battery", probability: 49, rul: "28d", risk: "amber" },
];

export const fleetAlerts = [
  { title: "Alternator failure imminent", risk: "red", detail: "Voltage output degradation detected across 14-day rolling window.", vin: "FG-2026-001", component: "Alternator" },
  { title: "Transmission fluid degradation", risk: "red", detail: "Viscosity and thermal signature exceed threshold.", vin: "FG-2026-002", component: "Transmission Fluid" },
];

export const fleetInsights = [
  { title: "Alternator faults concentrated in Midwest fleet", stat: "80% concentration", detail: "4 of 5 high-risk alternator cases belong to the National Freight Midwest corridor." },
  { title: "Brake pad wear ahead of schedule on West Coast", stat: "+12% vs baseline", detail: "Pacific Transport tractors show 12% faster brake pad degradation versus fleet average." },
];