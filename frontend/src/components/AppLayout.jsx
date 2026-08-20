import { Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

const routeTitles = {
  "/overview": {
    title: "Overview",
    description: "Fleet health and operational snapshot",
  },
  "/ai-assistant": {
    title: "AI Assistant",
    description: "Fleet assistance and insights",
  },
  "/predictive-failure": {
    title: "Predictive Failure Engine",
    description: "Failure probability and risk evaluation",
  },
};

export function AppLayout() {
  const location = useLocation();
  const currentRoute =
    routeTitles[location.pathname] || routeTitles["/overview"];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <Sidebar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        <Header
          title={currentRoute.title}
          description={currentRoute.description}
        />
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
