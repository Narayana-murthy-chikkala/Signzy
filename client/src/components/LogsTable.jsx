import { Fragment, useState } from 'react';
import Badge from './Badge';
import { STRATEGY_LABELS, formatDateTime, formatMs } from '../utils/format';

export default function LogsTable({ logs }) {
  const [expandedId, setExpandedId] = useState(null);

  if (logs.length === 0) {
    return <p className="p-6 text-center text-sm text-slate-500">No routing logs match your filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {['Request ID', 'Timestamp', 'Capability', 'Vendor', 'Strategy', 'Status', 'Latency', ''].map((h) => (
              <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {logs.map((log) => (
            <Fragment key={log._id}>
              <tr>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
                  {log.requestId.slice(0, 8)}…
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDateTime(log.timestamp)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{log.capability || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{log.selectedVendor || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {STRATEGY_LABELS[log.routingStrategy] || log.routingStrategy}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <Badge variant={log.finalStatus.toLowerCase()}>{log.finalStatus}</Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatMs(log.latencyMs)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === log._id ? null : log._id)}
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {expandedId === log._id ? 'Hide' : 'Details'}
                  </button>
                </td>
              </tr>
              {expandedId === log._id && (
                <tr>
                  <td colSpan={8} className="bg-slate-50 px-4 py-4">
                    <p className="mb-2 text-sm text-slate-700">
                      <span className="font-medium">Routing Reason:</span> {log.routingReason}
                    </p>
                    <p className="mb-2 text-sm font-medium text-slate-700">Failover History:</p>
                    <ul className="space-y-1">
                      {log.failoverHistory.map((entry, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                          <Badge variant={entry.status}>{entry.status}</Badge>
                          <span className="font-medium">{entry.vendor}</span>
                          <span>— {entry.reason}</span>
                          {entry.latencyMs > 0 && <span className="text-slate-400">({formatMs(entry.latencyMs)})</span>}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
