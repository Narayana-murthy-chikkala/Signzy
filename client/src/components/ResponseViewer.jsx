import Badge from './Badge';
import { formatCost, formatMs } from '../utils/format';

export default function ResponseViewer({ result }) {
  if (!result) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Standard Response</h3>
        <Badge variant={result.status.toLowerCase()}>{result.status}</Badge>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-slate-500">Vendor Used</dt>
          <dd className="font-medium text-slate-900">{result.vendorUsed || '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Latency</dt>
          <dd className="font-medium text-slate-900">{formatMs(result.latencyMs)}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Cost</dt>
          <dd className="font-medium text-slate-900">{formatCost(result.cost)}</dd>
        </div>
        <div className="col-span-2 sm:col-span-3">
          <dt className="text-slate-500">Routing Reason</dt>
          <dd className="font-medium text-slate-900">{result.routingReason}</dd>
        </div>
      </dl>

      {result.failoverHistory?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">Failover History</p>
          <ul className="space-y-1">
            {result.failoverHistory.map((entry, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                <Badge variant={entry.status}>{entry.status}</Badge>
                <span className="font-medium">{entry.vendor}</span>
                <span>— {entry.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium text-slate-700">Raw Response</p>
        <pre className="max-h-64 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}
