import { useMetrics } from '../hooks/useMetrics';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import Badge from '../components/Badge';
import { formatDateTime, formatMs, formatPercent } from '../utils/format';

export default function Metrics() {
  const { summary, vendors, loading, error, refresh } = useMetrics();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Vendor Metrics</h2>
          <p className="mt-1 text-sm text-slate-500">Per-vendor performance tracked across all routed requests.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-slate-500">Loading…</p>
      ) : summary ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Vendors" value={summary.totalVendors} />
            <StatCard label="Healthy Vendors" value={summary.healthyVendors} accent="emerald" />
            <StatCard label="Total Requests" value={summary.totalRequests} />
            <StatCard label="Overall Success Rate" value={formatPercent(summary.successRate)} accent="emerald" />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vendors.map((vendor) => (
              <div key={vendor._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-slate-900">{vendor.name}</h3>
                  <Badge variant={vendor.healthStatus}>{vendor.healthStatus}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-400">Last used: {formatDateTime(vendor.metrics.lastUsedTime)}</p>

                <div className="mt-4 space-y-3">
                  <ProgressBar label="Success Rate" value={vendor.metrics.successRate} />
                  <ProgressBar label="Availability" value={vendor.metrics.availabilityPercentage} />
                  <ProgressBar
                    label="Error Rate"
                    value={vendor.metrics.errorRate}
                    colorClass={vendor.metrics.errorRate > 30 ? 'bg-rose-500' : 'bg-slate-400'}
                  />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div>
                    <dt>Total</dt>
                    <dd className="font-medium text-slate-900">{vendor.metrics.totalRequests}</dd>
                  </div>
                  <div>
                    <dt>Successful</dt>
                    <dd className="font-medium text-slate-900">{vendor.metrics.successfulRequests}</dd>
                  </div>
                  <div>
                    <dt>Failed</dt>
                    <dd className="font-medium text-slate-900">{vendor.metrics.failedRequests}</dd>
                  </div>
                  <div>
                    <dt>Avg Latency</dt>
                    <dd className="font-medium text-slate-900">{formatMs(vendor.metrics.averageLatency)}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Vendor', 'Total', 'Successful', 'Failed', 'Avg Latency', 'Error Rate', 'Success Rate', 'Availability'].map(
                    (h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-500">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((vendor) => (
                  <tr key={vendor._id}>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{vendor.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{vendor.metrics.totalRequests}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{vendor.metrics.successfulRequests}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{vendor.metrics.failedRequests}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatMs(vendor.metrics.averageLatency)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatPercent(vendor.metrics.errorRate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatPercent(vendor.metrics.successRate)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatPercent(vendor.metrics.availabilityPercentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
