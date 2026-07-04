import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useRole } from '../context/RoleContext';
import { fetchRoutingConfigs, routeRequest } from '../services/api';
import ResponseViewer from '../components/ResponseViewer';
import { STRATEGY_LABELS } from '../utils/format';
import { DEFAULT_PAYLOAD as DEFAULT_PAYLOAD_OBJ, examplePayloadFor } from '../utils/capabilityPayloads';

const DEFAULT_PAYLOAD = JSON.stringify(DEFAULT_PAYLOAD_OBJ, null, 2);

export default function RouteTester() {
  const { vendors } = useAppContext();
  const { showToast } = useToast();
  const { isAdmin } = useRole();
  const capabilities = useMemo(
    () => Array.from(new Set(vendors.flatMap((v) => v.supportedFeatures || []))).sort(),
    [vendors]
  );

  const [capability, setCapability] = useState('');
  const [payloadText, setPayloadText] = useState(DEFAULT_PAYLOAD);
  const [strategy, setStrategy] = useState('priority');
  const [maxLatencyMs, setMaxLatencyMs] = useState('');
  const [preferLowCost, setPreferLowCost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [savedConfigs, setSavedConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState('');

  useEffect(() => {
    fetchRoutingConfigs()
      .then((res) => setSavedConfigs(res.data))
      .catch(() => setSavedConfigs([]));
  }, []);

  const selectedConfig = savedConfigs.find((c) => c._id === selectedConfigId) || null;

  const handleSelectConfig = (id) => {
    setSelectedConfigId(id);
    const cfg = savedConfigs.find((c) => c._id === id);
    if (cfg) setStrategy(cfg.strategy);
  };

  const handleCapabilityChange = (value) => {
    setCapability(value);
    setPayloadText(JSON.stringify(examplePayloadFor(value), null, 2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    let payload;
    try {
      payload = payloadText.trim() ? JSON.parse(payloadText) : {};
    } catch {
      setError('Payload must be valid JSON');
      showToast('Payload must be valid JSON', 'error');
      return;
    }

    const requirements = {};
    if (maxLatencyMs !== '') requirements.maxLatencyMs = Number(maxLatencyMs);
    if (preferLowCost) requirements.preferLowCost = true;

    setLoading(true);
    try {
      const data = await routeRequest({
        capability: capability || undefined,
        payload,
        // The client persona only calls the unified endpoint - it never picks
        // a routing strategy or condition set, that's the router's decision.
        strategy: isAdmin ? strategy : undefined,
        requirements: Object.keys(requirements).length ? requirements : undefined,
        conditions: isAdmin && selectedConfig?.conditions?.length ? selectedConfig.conditions : undefined,
      });
      setResult(data);
    } catch (err) {
      // A routing FAILURE is a normal, expected outcome and already shown
      // prominently in ResponseViewer - this catch only fires for an actual
      // request error (bad JSON payload, network issue, 4xx/5xx), so a toast
      // here is genuinely "something went wrong" rather than noise.
      const message = err.response?.data?.message || err.message;
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">{isAdmin ? 'Route Tester' : 'Submit Request'}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {isAdmin
          ? 'Send a simulated request through the routing engine.'
          : 'Call the unified API - the router picks the best vendor for you behind the scenes.'}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200">
          {isAdmin && savedConfigs.length > 0 && (
            <label className="block text-sm font-medium text-slate-700">
              Saved AI Rule Config <span className="font-normal text-slate-400">(optional)</span>
              <select
                value={selectedConfigId}
                onChange={(e) => handleSelectConfig(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">None — pick strategy manually</option>
                {savedConfigs.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.sourceText.slice(0, 60)}
                    {c.sourceText.length > 60 ? '…' : ''}
                  </option>
                ))}
              </select>
              {selectedConfig?.conditions?.length > 0 && (
                <span className="mt-1 block text-xs text-slate-400">
                  {selectedConfig.conditions.length} condition(s) from this config will be applied during ranking.
                </span>
              )}
            </label>
          )}

          <label className={`block text-sm font-medium text-slate-700 ${isAdmin && savedConfigs.length > 0 ? 'mt-4' : ''}`}>
            Capability
            <select
              value={capability}
              onChange={(e) => handleCapabilityChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Any</option>
              {capabilities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          {isAdmin && (
            <label className="mt-4 block text-sm font-medium text-slate-700">
              Routing Strategy
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                {Object.entries(STRATEGY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="mt-4 block text-sm font-medium text-slate-700">
            Payload (JSON) <span className="font-normal text-slate-400">(auto-filled per capability, editable)</span>
            <textarea
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
          </label>

          <div className="mt-4 rounded-md border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Requirements <span className="font-normal normal-case text-slate-400">(optional, per-request overrides)</span>
            </p>
            <label className="block text-sm font-medium text-slate-700">
              Max Latency (ms)
              <input
                type="number"
                min="0"
                value={maxLatencyMs}
                onChange={(e) => setMaxLatencyMs(e.target.value)}
                placeholder="uses the global default if left blank"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={preferLowCost}
                onChange={(e) => setPreferLowCost(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              Prefer low cost (defaults the strategy to Lowest Cost when no strategy is explicitly needed)
            </label>
          </div>

          {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Routing…' : isAdmin ? 'Route Request' : 'Submit Request'}
          </button>
        </form>

        <div>
          {result ? (
            <ResponseViewer result={result} isAdmin={isAdmin} />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 transition-colors duration-200">
              Submit a request to see the standard response here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
