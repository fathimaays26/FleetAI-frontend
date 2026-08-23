// ---------------------------------------------------------------------------
// PFE OVERVIEW TAB
// ---------------------------------------------------------------------------
export const pfeStats = {
  componentsUnderWatch: 264,
  highFailureProbability: 11,
  componentsInside30DayRUL: 22,
  precursorPatternsValidated: 84,
};

export const topPrecursorSignals = [
  { signal: "Short-trip ratio", value: 2600 },
  { signal: "Overload duty share", value: 2350 },
  { signal: "High-RPM dwell time", value: 2280 },
  { signal: "Coolant temp variance", value: 2020 },
  { signal: "Crank time drift", value: 1750 },
  { signal: "Harsh braking frequency", value: 1650 },
];

// ---------------------------------------------------------------------------
// RULE BUILDER (VoltIQ wizard)
// ---------------------------------------------------------------------------
export const partCategories = [
  "All categories", "Battery & Charging", "Braking", "Powertrain",
  "Cooling System", "Electrical", "Suspension", "Transmission", "Wheel End",
];

export const parts = [
  { name: "12V Auxiliary Battery", category: "Battery & Charging" },
  { name: "HV Battery Pack", category: "Battery & Charging" },
  { name: "Alternator", category: "Battery & Charging" },
  { name: "DC-DC Converter", category: "Battery & Charging" },
  { name: "Brake Pads Front", category: "Braking" },
  { name: "Brake Pads Rear", category: "Braking" },
  { name: "Brake Discs", category: "Braking" },
  { name: "ABS Module", category: "Braking" },
  { name: "Engine Oil Life", category: "Powertrain" },
  { name: "Timing Belt", category: "Powertrain" },
  { name: "Clutch Assembly", category: "Powertrain" },
  { name: "Turbocharger", category: "Powertrain" },
  { name: "Coolant Pump", category: "Cooling System" },
  { name: "Radiator Fan", category: "Cooling System" },
  { name: "Thermostat", category: "Cooling System" },
  { name: "Starter Motor", category: "Electrical" },
  { name: "Ignition Coils", category: "Electrical" },
  { name: "Wiring Harness", category: "Electrical" },
  { name: "Shock Absorbers", category: "Suspension" },
  { name: "Control Arm Bushes", category: "Suspension" },
  { name: "Air Springs", category: "Suspension" },
  { name: "Transmission Fluid", category: "Transmission" },
  { name: "Clutch Actuator", category: "Transmission" },
  { name: "Torque Converter", category: "Transmission" },
  { name: "Wheel Bearings", category: "Wheel End" },
  { name: "CV Joints", category: "Wheel End" },
  { name: "Tyre Set", category: "Wheel End" },
];

// Fleet history + correlation + rule, keyed by part name. Alternator is fully
// populated to match the reference demo; other parts fall back to a generic
// template (see getFleetHistory / getCorrelation helpers below).
export const fleetHistoryByPart = {
  Alternator: {
    historicalFailures: 213,
    affectedVins: 315,
    avgMileageAtFailure: "74k km",
    monthlyFailures: [
      { month: "Jan", count: 13 }, { month: "Feb", count: 15 },
      { month: "Mar", count: 19 }, { month: "Apr", count: 18 },
      { month: "May", count: 16 }, { month: "Jun", count: 20 },
      { month: "Jul", count: 15 }, { month: "Aug", count: 15 },
      { month: "Sep", count: 12 }, { month: "Oct", count: 15 },
      { month: "Nov", count: 19 }, { month: "Dec", count: 22 },
    ],
  },
};

export const correlationByPart = {
  Alternator: [
    { signal: "Coolant temp variance", value: 68, included: true },
    { signal: "Overload duty share", value: 62, included: true },
    { signal: "Oil pressure dips", value: 62, included: true },
    { signal: "DTC recurrence rate", value: 56, included: true },
    { signal: "Battery voltage sag", value: 42, included: true },
    { signal: "High-RPM dwell time", value: 30, included: true },
  ],
};

export const calculationRule = {
  part: "Alternator",
  formulaText:
    "failure_probability = 0.24·coolant_temp_variance + 0.22·overload_duty_share + 0.22·oil_pressure_dips + 0.18·dtc_recurrence_rate + 0.15·battery_voltage_sag",
  note: "coefficients = each signal's share of total correlation weight (Σ = 1.00, all 5 selected signals included)",
  result: "RESULT: 59% for Alternator — flag for inspection within 17 days if this crosses 70%",
  daysToAlert: 17,
  rulePrecision: 79,
  ruleCoverage: 90,
};

// ---------------------------------------------------------------------------
// FAILURE PROBABILITY + RUL EXPLORER (shared VIN list, per-part detail)
// ---------------------------------------------------------------------------
export const vinFailureProbabilities = [
  {
    vin: "MZ4A109644", model: "2823 Tipper", region: "West region",
    riskTier: "red",
    parts: [
      {
        name: "Alternator", probability: 73,
        estimatedWindow: "34-73 days", topSignal: "Vibration RMS trend", topSignalShare: 33,
        riskTier: "red",
        rulCrossCheck: "31% component health, 11 days remaining",
        trend: [12, 14, 14, 16, 15, 14, 24, 26, 33, 46, 73],
        drivers: [
          { signal: "Vibration RMS trend", value: 33 },
          { signal: "Ambient heat exposure", value: 31 },
          { signal: "Crank time drift", value: 18 },
          { signal: "Battery voltage sag", value: 16 },
        ],
        scoreNote: "The dominant driver here is vibration rms trend at 33% of the score. This prediction has crossed the action threshold — recommend pre-positioning a matched replacement part at the dealer and slotting a workshop visit before the estimated window closes.",
      },
      {
        name: "Transmission Fluid", probability: 51,
        estimatedWindow: "30-75 days", topSignal: "Oil pressure dips", topSignalShare: 34,
        riskTier: "amber",
        rulCrossCheck: "48% component health, 250 days remaining",
        trend: [10, 12, 12, 13, 14, 18, 20, 33, 41, 47, 51],
        drivers: [
          { signal: "Oil pressure dips", value: 34 },
          { signal: "Short-trip ratio", value: 29 },
          { signal: "Overload duty share", value: 27 },
          { signal: "Coolant temp variance", value: 15 },
        ],
        scoreNote: "The dominant driver here is oil pressure dips at 34% of the score. Below the action threshold for parts pre-positioning; the vehicle stays on the weekly watch list.",
      },
      {
        name: "12V Auxiliary Battery", probability: 32,
        estimatedWindow: "11-66 days", topSignal: "Overload duty share", topSignalShare: 40,
        riskTier: "green",
        rulCrossCheck: "71% component health, 297 days remaining",
        trend: [8, 9, 9, 10, 12, 14, 22, 26, 31, 28, 32],
        drivers: [
          { signal: "Overload duty share", value: 40 },
          { signal: "Harsh braking frequency", value: 26 },
          { signal: "Ambient heat exposure", value: 25 },
          { signal: "Coolant temp variance", value: 8 },
        ],
        scoreNote: "The dominant driver here is overload duty share at 40% of the score. Below the action threshold for parts pre-positioning; the vehicle stays on the weekly watch list.",
      },
    ],
  },
  {
    vin: "MZ4A108387", model: "1217 Distribution", region: "South region",
    riskTier: "amber",
    parts: [
      {
        name: "Radiator Fan", probability: 51,
        estimatedWindow: "31-46 days", topSignal: "DTC recurrence rate", topSignalShare: 29,
        riskTier: "amber",
        rulCrossCheck: "51% component health, 107 days remaining",
        trend: [4, 5, 6, 7, 12, 14, 24, 27, 37, 43, 51],
        drivers: [
          { signal: "DTC recurrence rate", value: 29 },
          { signal: "Vibration RMS trend", value: 27 },
          { signal: "Harsh braking frequency", value: 26 },
          { signal: "Short-trip ratio", value: 14 },
        ],
        scoreNote: "The dominant driver here is dtc recurrence rate at 29% of the score. Below the action threshold for parts pre-positioning; the vehicle stays on the weekly watch list.",
      },
      { name: "Timing Belt", probability: 33, estimatedWindow: "60-120 days", topSignal: "High-RPM dwell time", topSignalShare: 22, riskTier: "green", rulCrossCheck: "88% component health, 2282 days remaining", trend: [5,6,7,8,10,12,15,18,22,28,33], drivers: [{signal:"High-RPM dwell time",value:22},{signal:"Overload duty share",value:18}], scoreNote: "Below the action threshold; the vehicle stays on the weekly watch list." },
    ],
  },
  {
    vin: "MZ4A104782", model: "4223 Long-Haul Tractor", region: "East region", riskTier: "red",
    parts: [{ name: "Transmission Fluid", probability: 73, estimatedWindow: "14-47 days", topSignal: "Oil pressure dips", topSignalShare: 36, riskTier: "red", rulCrossCheck: "31% component health, 9 days remaining", trend: [15,16,18,20,24,30,38,50,60,68,73], drivers: [{signal:"Oil pressure dips",value:36},{signal:"Overload duty share",value:28}], scoreNote: "Recommend pre-positioning a matched replacement part now." }],
  },
  {
    vin: "MZ4A107577", model: "4223 Long-Haul Tractor", region: "East region", riskTier: "red",
    parts: [{ name: "Transmission Fluid", probability: 72, estimatedWindow: "14-47 days", topSignal: "Oil pressure dips", topSignalShare: 34, riskTier: "red", rulCrossCheck: "31% component health, 7 days remaining", trend: [14,15,17,19,23,29,37,49,59,67,72], drivers: [{signal:"Oil pressure dips",value:34},{signal:"Short-trip ratio",value:26}], scoreNote: "That is inside the standard parts lead time — recommend pre-positioning the replacement part at the dealer now." }],
  },
  {
    vin: "MZ4A108414", model: "2523 Rigid", region: "Central region", riskTier: "red",
    parts: [{ name: "Alternator", probability: 72, estimatedWindow: "30-70 days", topSignal: "Vibration RMS trend", topSignalShare: 31, riskTier: "red", rulCrossCheck: "31% component health, 16 days remaining", trend: [13,14,16,18,22,28,36,48,58,66,72], drivers: [{signal:"Vibration RMS trend",value:31}], scoreNote: "Recommend pre-positioning a matched replacement part." }],
  },
  {
    vin: "MZ4A110016", model: "2523 Rigid", region: "Central region", riskTier: "red",
    parts: [{ name: "Coolant Pump", probability: 72, estimatedWindow: "30-70 days", topSignal: "Coolant temp variance", topSignalShare: 40, riskTier: "red", rulCrossCheck: "31% component health, 16 days remaining", trend: [13,14,16,18,22,28,36,48,58,66,72], drivers: [{signal:"Coolant temp variance",value:40}], scoreNote: "Recommend pre-positioning a matched replacement part." }],
  },
  {
    vin: "MZ4A107889", model: "1217 Distribution", region: "South region", riskTier: "red",
    parts: [{ name: "Brake Discs", probability: 72, estimatedWindow: "30-70 days", topSignal: "Harsh braking frequency", topSignalShare: 38, riskTier: "red", rulCrossCheck: "31% component health, 16 days remaining", trend: [13,14,16,18,22,28,36,48,58,66,72], drivers: [{signal:"Harsh braking frequency",value:38}], scoreNote: "Recommend pre-positioning a matched replacement part." }],
  },
  {
    vin: "MZ4A100864", model: "1015 Light Truck", region: "West region", riskTier: "red",
    parts: [{ name: "Turbocharger", probability: 72, estimatedWindow: "30-70 days", topSignal: "High-RPM dwell time", topSignalShare: 35, riskTier: "red", rulCrossCheck: "31% component health, 16 days remaining", trend: [13,14,16,18,22,28,36,48,58,66,72], drivers: [{signal:"High-RPM dwell time",value:35}], scoreNote: "Recommend pre-positioning a matched replacement part." }],
  },
  {
    vin: "MZ4A102348", model: "2523 Rigid", region: "Central region", riskTier: "red",
    parts: [{ name: "Wheel Bearings", probability: 72, estimatedWindow: "30-70 days", topSignal: "Short-trip ratio", topSignalShare: 30, riskTier: "red", rulCrossCheck: "31% component health, 16 days remaining", trend: [13,14,16,18,22,28,36,48,58,66,72], drivers: [{signal:"Short-trip ratio",value:30}], scoreNote: "Recommend pre-positioning a matched replacement part." }],
  },
  {
    vin: "MZ4A100990", model: "3532 Construction", region: "North region", riskTier: "amber",
    parts: [{ name: "Shock Absorbers", probability: 71, estimatedWindow: "30-70 days", topSignal: "Overload duty share", topSignalShare: 33, riskTier: "amber", rulCrossCheck: "31% component health, 16 days remaining", trend: [13,14,16,18,22,28,36,48,58,66,71], drivers: [{signal:"Overload duty share",value:33}], scoreNote: "Below the action threshold; the vehicle stays on the weekly watch list." }],
  },
];

export const totalVinsMatching = 130;

// ---------------------------------------------------------------------------
// RUL EXPLORER — ranked by urgency (days to failure)
// ---------------------------------------------------------------------------
export const vinRulRankings = [
  {
    vin: "MZ4A108387", model: "1217 Distribution", region: "South region", riskTier: "green",
    parts: [
      {
        name: "Radiator Fan", days: 107, riskTier: "green",
        predictedKm: "12k km", designLife: "47k km design life",
        predictedDays: 107, usageRate: "114 km/day observed usage",
        modelConfidence: 93, degradationTrend: "-5.9/mo",
        pfeCrossCheck: "51% failure probability, window 31-46 days",
        curve: { solidEnd: 29000, values: [95, 92, 88, 82, 76, 68, 60, 52], dashedValues: [52, 46, 42, 38, 35], failureThreshold: 30, maxX: 42000 },
        modelNote: "At the current usage rate of 114 km/day, this component crosses the failure threshold in 107 days. No action required this cycle — the component remains comfortably above threshold.",
      },
      { name: "Timing Belt", days: 2282, riskTier: "green" },
    ],
  },
  {
    vin: "MZ4A107577", model: "4223 Long-Haul Tractor", region: "East region", riskTier: "red",
    parts: [
      {
        name: "Transmission Fluid", days: 7, riskTier: "red",
        predictedKm: "1k km", designLife: "68k km design life",
        predictedDays: 7, usageRate: "120 km/day observed usage",
        modelConfidence: 85, degradationTrend: "-4/mo",
        pfeCrossCheck: "72% failure probability, window 14-47 days",
        curve: { solidEnd: 62000, values: [95, 90, 82, 72, 62, 50, 38, 33], dashedValues: [33, 32, 31, 30, 30], failureThreshold: 30, maxX: 62000 },
        modelNote: "At the current usage rate of 120 km/day, this component crosses the failure threshold in 7 days. That is inside the standard parts lead time — recommend pre-positioning the replacement part at the dealer now.",
      },
      { name: "Clutch Assembly", days: 329, riskTier: "amber" },
    ],
  },
  {
    vin: "MZ4A109311", model: "1015 Light Truck", region: "West region", riskTier: "red",
    parts: [{ name: "Radiator Fan", days: 9, riskTier: "red", predictedKm: "1k km", designLife: "50k km design life", predictedDays: 9, usageRate: "110 km/day observed usage", modelConfidence: 82, degradationTrend: "-4.5/mo", pfeCrossCheck: "70% failure probability, window 9-40 days", curve: { solidEnd: 58000, values: [95,88,80,70,58,46,36,31], dashedValues: [31,30,30,29,29], failureThreshold: 30, maxX: 58000 }, modelNote: "Inside standard lead time — recommend pre-positioning the replacement part now." }],
  },
  {
    vin: "MZ4A111896", model: "4223 Long-Haul Tractor", region: "East region", riskTier: "red",
    parts: [{ name: "Alternator", days: 10, riskTier: "red", predictedKm: "1k km", designLife: "80k km design life", predictedDays: 10, usageRate: "112 km/day observed usage", modelConfidence: 80, degradationTrend: "-4.2/mo", pfeCrossCheck: "71% failure probability, window 10-40 days", curve: { solidEnd: 60000, values: [95,88,80,70,58,46,36,31], dashedValues: [31,30,30,29,29], failureThreshold: 30, maxX: 60000 }, modelNote: "Inside standard lead time — recommend pre-positioning the replacement part now." }],
  },
  {
    vin: "MZ4A109644", model: "2823 Tipper", region: "West region", riskTier: "red",
    parts: [
      {
        name: "Alternator", days: 11, riskTier: "red",
        predictedKm: "1k km", designLife: "83k km design life",
        predictedDays: 11, usageRate: "113 km/day observed usage",
        modelConfidence: 64, degradationTrend: "-2.8/mo",
        pfeCrossCheck: "73% failure probability, window 34-73 days",
        curve: { solidEnd: 82000, values: [95, 90, 84, 76, 66, 55, 44, 31], dashedValues: [31, 30, 30, 29, 29], failureThreshold: 30, maxX: 83000 },
        modelNote: "At the current usage rate of 113 km/day, this component crosses the failure threshold in 11 days. That is inside the standard parts lead time — recommend pre-positioning the replacement part at the dealer now.",
      },
      { name: "Transmission Fluid", days: 250, riskTier: "amber" },
      { name: "12V Auxiliary Battery", days: 297, riskTier: "green" },
    ],
  },
  { vin: "MZ4A103927", model: "2823 Tipper", region: "West region", riskTier: "amber", parts: [{ name: "Coolant Pump", days: 13, riskTier: "amber" }] },
  { vin: "MZ4A108414", model: "2523 Rigid", region: "Central region", riskTier: "red", parts: [{ name: "Alternator", days: 16, riskTier: "red" }] },
  { vin: "MZ4A102348", model: "2523 Rigid", region: "Central region", riskTier: "red", parts: [{ name: "Wheel Bearings", days: 16, riskTier: "red" }] },
  { vin: "MZ4A100216", model: "1015 Light Truck", region: "West region", riskTier: "amber", parts: [{ name: "Brake Discs", days: 16, riskTier: "amber" }] },
  { vin: "MZ4A113782", model: "2523 Rigid", region: "Central region", riskTier: "green", parts: [{ name: "Shock Absorbers", days: 19, riskTier: "green" }] },
];