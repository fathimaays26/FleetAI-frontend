import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header.jsx";
import Overview from "./views/Overview";
import AIAssistant from "./views/AIAssistant";
import PFEOverview from "./views/PFEOverview";
import RuleBuilder from "./views/RuleBuilder";

const pageMeta = {
  "/": {
    title: "Overview",
    subtitle: "Fleet health, risk distribution and maintenance signals",
  },
  "/ai-assistant": {
    title: "AI Assistant",
    subtitle: "Ask questions about your fleet",
  },
  "/predictive-failure-engine": {
    title: "Predictive Failure Engine",
    subtitle: "Rule builder, scoring, and RUL",
  },
  "/predictive-failure-engine/rule-builder": {
    title: "Rule Builder",
    subtitle: "Build failure probability rules from fleet signals",
  },
};

function Layout({ children }) {
  const location = useLocation();
  const meta = pageMeta[location.pathname] ?? {};

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 min-h-screen bg-gray-50">
        <Header title={meta.title} subtitle={meta.subtitle} />

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />

          <Route path="/ai-assistant" element={<AIAssistant />} />

          <Route path="/predictive-failure-engine" element={<PFEOverview />} />
          <Route
            path="/predictive-failure-engine/rule-builder"
            element={<RuleBuilder />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
