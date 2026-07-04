import { useState } from 'react';

const emptyForm = {
  name: '',
  priority: 1,
  weight: 1,
  costPerRequest: 0,
  timeoutMs: 3000,
  rateLimitPerMinute: 100,
  supportedFeatures: '',
  healthStatus: 'healthy',
  isActive: true,
};

const toFormState = (vendor) =>
  vendor
    ? {
        name: vendor.name,
        priority: vendor.priority,
        weight: vendor.weight,
        costPerRequest: vendor.costPerRequest,
        timeoutMs: vendor.timeoutMs,
        rateLimitPerMinute: vendor.rateLimitPerMinute,
        supportedFeatures: (vendor.supportedFeatures || []).join(', '),
        healthStatus: vendor.healthStatus,
        isActive: vendor.isActive,
      }
    : emptyForm;

export default function VendorFormModal({ vendor, onClose, onSubmit, submitting, error }) {
  const [form, setForm] = useState(() => toFormState(vendor));
  const isEdit = Boolean(vendor);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: form.name.trim(),
      priority: Number(form.priority),
      weight: Number(form.weight),
      costPerRequest: Number(form.costPerRequest),
      timeoutMs: Number(form.timeoutMs),
      rateLimitPerMinute: Number(form.rateLimitPerMinute),
      supportedFeatures: form.supportedFeatures
        .split(',')
        .map((f) => f.trim())
        .filter(Boolean),
      healthStatus: form.healthStatus,
      isActive: form.isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 animate-fade-in">
      <div className="w-full max-w-lg animate-fade-in-up rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">{isEdit ? 'Edit Vendor' : 'Add Vendor'}</h2>

        {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-4">
          <label className="col-span-2 text-sm font-medium text-slate-700">
            Name
            <input
              required
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Vendor A"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Priority
            <input
              type="number"
              required
              value={form.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Weight
            <input
              type="number"
              required
              value={form.weight}
              onChange={(e) => handleChange('weight', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Cost / Request ($)
            <input
              type="number"
              step="0.001"
              required
              value={form.costPerRequest}
              onChange={(e) => handleChange('costPerRequest', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Timeout (ms)
            <input
              type="number"
              required
              value={form.timeoutMs}
              onChange={(e) => handleChange('timeoutMs', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Rate Limit (/min)
            <input
              type="number"
              required
              value={form.rateLimitPerMinute}
              onChange={(e) => handleChange('rateLimitPerMinute', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <label className="col-span-2 text-sm font-medium text-slate-700">
            Supported Features (comma-separated)
            <input
              value={form.supportedFeatures}
              onChange={(e) => handleChange('supportedFeatures', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="PAN_VERIFICATION, OCR, SMS, PAYMENT_PROCESSING, DOCUMENT_VALIDATION"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Health Status
            <select
              value={form.healthStatus}
              onChange={(e) => handleChange('healthStatus', e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="healthy">Healthy</option>
              <option value="unhealthy">Unhealthy</option>
            </select>
          </label>

          <label className="flex items-center gap-2 self-end text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Active (not down)
          </label>

          <div className="col-span-2 mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
