import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vendors from './pages/Vendors'
import RouteTester from './pages/RouteTester'
import Metrics from './pages/Metrics'
import Logs from './pages/Logs'
import Health from './pages/Health'
import AIRuleGenerator from './pages/AIRuleGenerator'
import { useRole } from './context/RoleContext'

// The client persona only ever gets the unified /route surface (Route
// Tester) - everything else is internal vendor/ops tooling it should never
// see, so a direct URL visit bounces back rather than silently rendering it.
function AdminOnly({ children }) {
  const { isAdmin } = useRole();
  return isAdmin ? children : <Navigate to="/route-tester" replace />;
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<AdminOnly><Dashboard /></AdminOnly>} />
        <Route path="/vendors" element={<AdminOnly><Vendors /></AdminOnly>} />
        <Route path="/route-tester" element={<RouteTester />} />
        <Route path="/metrics" element={<AdminOnly><Metrics /></AdminOnly>} />
        <Route path="/logs" element={<AdminOnly><Logs /></AdminOnly>} />
        <Route path="/health" element={<AdminOnly><Health /></AdminOnly>} />
        <Route path="/ai-rule-generator" element={<AdminOnly><AIRuleGenerator /></AdminOnly>} />
      </Route>
    </Routes>
  )
}

export default App
