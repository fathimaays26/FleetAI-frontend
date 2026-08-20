# FleetAI Frontend

FleetAI Frontend is the user-facing dashboard for a predictive maintenance platform focused on fleet health, risk monitoring, and AI-assisted operations. The project includes a React + Vite frontend and a supporting agent layer for fleet intelligence workflows.

## Overview

This application helps operations teams:
- monitor fleet health and risk across vehicles
- review predictive failure insights
- explore failure probability and remaining useful life
- navigate vehicle and component-level risk summaries
- access a conversational AI workflow for fleet analysis

## Tech Stack

- React 19
- Vite
- JavaScript / JSX
- React Router
- Tailwind-style utility classes via custom design tokens
- Lucide React icons

## Repository Structure

```text
FleetAI-frontend/
├── frontend/          # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── types/
│   │   ├── views/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── agent/             # AI agent or automation logic
├── .gitignore
├── README.md
└── .git/
```

## Prerequisites

Before running the project, make sure you have:
- Node.js 18+
- npm or yarn

## Getting Started

1. Open a terminal in the project root.
2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the local Vite URL shown in the terminal to view the app.

## Available Scripts

Inside the frontend directory:

```bash
npm run dev      # start the app in development mode
npm run build    # create a production build
npm run preview  # preview the production build locally
npm run lint     # run ESLint checks
```

## Application Notes

The frontend is organized around a dashboard-style layout with:
- a left navigation sidebar
- a top application header
- stat cards and charts for fleet overview
- risk tables for vehicle and component monitoring
- predictive maintenance views for failure scoring and operational insights

## Notes

This project is currently structured as a frontend-first predictive maintenance dashboard and can be extended with API integrations, live data services, and backend or AI orchestration workflows.
