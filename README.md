# Fleet AI Frontend

A modern fleet operations dashboard for monitoring vehicle health, failure risk, predictive maintenance signals, and remaining useful life (RUL). Built with React, Vite, Tailwind CSS, and a suite of analytics components for high-signal maintenance decisions.

<p align="center">
  <img alt="Fleet AI dashboard" src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss" />
  <img alt="Recharts" src="https://img.shields.io/badge/Recharts-2.12-FF6B6B?style=for-the-badge&logo=react" />
</p>

## Overview

Fleet AI gives operations teams an at-a-glance view of fleet risk and the tools needed to investigate maintenance issues before they escalate. The app combines:

- Fleet health dashboards and risk distribution views
- AI-powered operational assistance
- Predictive Failure Engine monitoring
- Rule configuration and signal analysis
- Failure probability and RUL investigation by VIN and component

## Key features

### Fleet overview
- Total vehicles, high-risk vehicles, attention-needed components, and fleet health summaries
- Risk trend charts over time
- Distribution of low / medium / high risk vehicles
- Top-risk vehicle rankings and maintenance alerts

### Predictive Failure Engine
- Components under watch and signal precursor tracking
- Failure probability scoring by VIN and part
- Signal driver breakdown and probability trend visualization
- Calibration of ML rules and insights for maintenance prioritization

### RUL Explorer
- Sortable vehicle and component views by urgency
- Remaining useful life estimates in miles and days
- Degradation curves and part-level risk analysis
- Alignment between probability and RUL-driven tiering

### AI assistant
- Natural-language guidance for fleet operational questions
- Centralized access to fleet intelligence and maintenance insights

## Tech stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Recharts for analytics visuals
- Lucide React for interface icons
- Docker-ready frontend structure for local and hosted environments

## Project structure

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── pfe/
│   ├── lib/
│   ├── views/
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── components.json
└── index.html
```

## Application routes

The frontend uses route-based navigation for each fleet intelligence workflow:

```text
/                              -> Overview
/ai-assistant                  -> AI Assistant
/predictive-failure-engine     -> Predictive Failure Engine overview
/predictive-failure-engine/rule-builder
                              -> Rule Builder
/predictive-failure-engine/failure-probability
                              -> Failure Probability
/predictive-failure-engine/rul-explorer
                              -> RUL Explorer
```

## Getting started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A running backend API on localhost:8000 (the app currently targets that endpoint for fleet and prediction data)

### Install dependencies

```bash
cd frontend
npm install
```

### Start the development server

```bash
npm run dev
```

The app will typically run at:

```text
http://localhost:5173
```

### Production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Backend dependency

This frontend expects the Fleet AI backend to be running locally and serving data on:

```text
http://localhost:8000
```

If the backend is unavailable, the UI will show loading or error states for the fleet, predictions, and signal-related views.

## Notes

- Several views rely on the backend endpoints for fleet KPIs, predictions, precursor analysis, and maintenance alerts.
- The app is designed around maintenance operations workflows rather than generic dashboards, with a strong emphasis on predictive risk interpretation.
- Styling is driven by Tailwind utilities and component-level design patterns for quick iteration and clean presentation.

## License

This project is currently configured for internal or project-specific use. Please confirm licensing terms with the repository owner before commercial reuse or distribution.

## Contributing

1. Create a feature branch
2. Make focused, well-documented changes
3. Validate locally with lint/build checks
4. Open a pull request with a clear summary of the change

---

Built for operational intelligence, predictive maintenance, and fleet readiness.
