import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/AppLayout";
import Overview from "./views/Overview";
import AIAssistant from "./views/AIAssistant";
import FailureProbability from "./views/FailureProbability";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />

        <Route element={<AppLayout />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/predictive-failure" element={<FailureProbability />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
