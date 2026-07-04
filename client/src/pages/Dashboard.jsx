import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMetrics } from '../hooks/useMetrics';
import { fetchRoutingLogs } from '../services/api';
import StatCard from '../components/StatCard';
import LogsTable from '../components/LogsTable';
import { formatMs, formatPercent } from '../utils/format';

const RECENT_LOGS_LIMIT = 5;

export default function Dashboard() {
  const { summary, loading, error } = useMetrics();
  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState(null);

  useEffect(() => {
    fetchRoutingLogs({ limit: RECENT_LOGS_LIMIT, page: 1 })
      .then((res) => setRecentLogs(res.data))
      .catch((err) => setLogsError(err.response?.data?.message || err.message))
      .finally(() => setLogsLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
      <p className="mt-1 text-sm text-slate-500">Live overview of the vendor routing platform.</p>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : summary ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Vendors" value={summary.totalVendors} />
          <StatCard label="Healthy Vendors" value={summary.healthyVendors} accent="emerald" />
          <StatCard label="Total Requests" value={summary.totalRequests} />
          <StatCard label="Success Rate" value={formatPercent(summary.successRate)} accent="emerald" />
          <StatCard label="Avg Latency" value={formatMs(summary.averageLatency)} accent="amber" />
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-900">Recent Routing Logs</h3>
          <Link to="/logs" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            View More →
          </Link>
        </div>

        {logsError && <p className="p-5 text-sm text-rose-700">{logsError}</p>}

        {!logsError && (logsLoading ? <p className="p-6 text-center text-sm text-slate-500">Loading…</p> : <LogsTable logs={recentLogs} />)}
      </div>
    </div>
  );
}
