import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vendors from './pages/Vendors'
import RouteTester from './pages/RouteTester'
import Metrics from './pages/Metrics'
import Logs from './pages/Logs'
import Health from './pages/Health'
import AIRuleGenerator from './pages/AIRuleGenerator'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/route-tester" element={<RouteTester />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/health" element={<Health />} />
        <Route path="/ai-rule-generator" element={<AIRuleGenerator />} />
      </Route>
    </Routes>
  )
}

export default App
