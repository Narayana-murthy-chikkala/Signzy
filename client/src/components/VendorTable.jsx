import Badge from './Badge';
import { formatCost, formatMs, formatPercent } from '../utils/format';

export default function VendorTable({ vendors, onEdit, onDelete }) {
  if (vendors.length === 0) {
    return <p className="p-6 text-center text-sm text-slate-500">No vendors yet. Add one to get started.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {['Name', 'Priority', 'Weight', 'Cost', 'Timeout', 'Rate Limit', 'Features', 'Status', 'Latency', 'Success Rate', 'Availability', ''].map(
              (h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-500">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {vendors.map((vendor) => (
            <tr key={vendor._id} className="transition-colors duration-150 hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{vendor.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{vendor.priority}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{vendor.weight}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatCost(vendor.costPerRequest)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatMs(vendor.timeoutMs)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{vendor.rateLimitPerMinute}/min</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                {vendor.supportedFeatures?.length ? vendor.supportedFeatures.join(', ') : '—'}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex gap-1.5">
                  <Badge variant={vendor.healthStatus}>{vendor.healthStatus}</Badge>
                  <Badge variant={vendor.isActive ? 'active' : 'down'}>{vendor.isActive ? 'up' : 'down'}</Badge>
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatMs(vendor.currentLatency)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatPercent(vendor.metrics?.successRate)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatPercent(vendor.metrics?.availabilityPercentage)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onEdit(vendor)}
                  className="mr-3 font-medium text-indigo-600 transition-colors hover:text-indigo-800"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(vendor)}
                  className="font-medium text-rose-600 transition-colors hover:text-rose-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
