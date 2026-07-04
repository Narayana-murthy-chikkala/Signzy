import { useEffect, useState } from 'react';
import {
  generateRoutingRule,
  saveRoutingConfig,
  fetchStrategyRecommendation,
  fetchFallbackSuggestions,
} from '../services/api';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import Badge from '../components/Badge';
import { STRATEGY_LABELS } from '../utils/format';

const EXAMPLE =
  'Use Vendor A for 70% traffic, Vendor B for 30%, but switch to Vendor C if latency crosses 2 seconds or error rate is above 5%.';

function StrategyRecommendation() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStrategyRecommendation();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Recommended Routing Strategy</h3>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Re-analyze'}
        </button>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {!error && data && (
        <>
          {data.recommendedStrategy ? (
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="success">{STRATEGY_LABELS[data.recommendedStrategy] || data.recommendedStrategy}</Badge>
              <span className="text-xs text-slate-400">based on {data.signals.vendorsAnalyzed} active vendor(s)</span>
            </div>
          ) : (
            <p className="mb-3 text-sm text-slate-500">No active, healthy vendors to analyze yet.</p>
          )}
          <p className="text-sm text-slate-600">{data.reason}</p>

          {data.signals && (
            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500 sm:grid-cols-4">
              <div>
                <dt>Total Requests</dt>
                <dd className="font-medium text-slate-900">{data.signals.totalRequests ?? '—'}</dd>
              </div>
              <div>
                <dt>Latency Spread</dt>
                <dd className="font-medium text-slate-900">{data.signals.latencySpreadPct ?? 0}%</dd>
              </div>
              <div>
                <dt>Cost Spread</dt>
                <dd className="font-medium text-slate-900">{data.signals.costSpreadPct ?? 0}%</dd>
              </div>
              <div>
                <dt>Health Spread</dt>
                <dd className="font-medium text-slate-900">{data.signals.healthSpreadPct ?? 0}%</dd>
              </div>
            </dl>
          )}
        </>
      )}
    </div>
  );
}

function FallbackSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFallbackSuggestions();
      setSuggestions(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Suggested Fallback Rules</h3>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Analyzing…' : 'Re-analyze'}
        </button>
      </div>

      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

      {!error && !loading && suggestions.length === 0 && (
        <p className="text-sm text-slate-500">No routing history yet - test a few requests in Route Tester first.</p>
      )}

      {!error && suggestions.length > 0 && (
        <div className="space-y-4">
          {suggestions.map((s) => (
            <div key={s.capability} className="border-t border-slate-100 pt-3 first:border-t-0 first:pt-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.capability}</span>
                <span className="text-xs text-slate-400">suggested order: {s.suggestedOrder.join(' → ') || '—'}</span>
              </div>
              <p className="text-sm text-slate-600">{s.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIRuleGenerator() {
  const { refreshVendors } = useAppContext();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setConfig(null);
    setApplyResult(null);
    setLoading(true);
    try {
      const { data } = await generateRoutingRule(text);
      setConfig(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    setApplyResult(null);
    setError(null);
    try {
      const { data } = await saveRoutingConfig(config);
      setApplyResult(data);
      await refreshVendors();
      const field = data.appliedAs === 'priority' ? 'priority order' : 'weights';
      showToast(
        data.appliedToVendors.length > 0
          ? `Config saved - applied ${field} to ${data.appliedToVendors.length} vendor(s)`
          : 'Config saved, but no matching vendor names were found to apply',
        data.appliedToVendors.length > 0 ? 'success' : 'info'
      );
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      showToast(message, 'error');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">AI Rule Generator</h2>
      <p className="mt-1 text-sm text-slate-500">
        Describe a routing rule in plain English, convert it into routing configuration JSON, then apply it
        to real vendor weights and use it from the Route Tester.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Rule description
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder={EXAMPLE}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setText(EXAMPLE)}
            className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Use example
          </button>

          {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Generating…' : 'Generate Routing Config'}
          </button>
        </form>

        <div>
          {config ? (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Generated Routing Config</h3>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying || !(config.weights?.length || config.vendorOrder?.length)}
                  title={
                    !(config.weights?.length || config.vendorOrder?.length)
                      ? 'No vendor names or weights were found to apply'
                      : ''
                  }
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {applying ? 'Applying…' : 'Save & Apply to Vendors'}
                </button>
              </div>
              <pre className="max-h-80 overflow-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(config, null, 2)}
              </pre>

              {applyResult && (
                <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Saved as config <span className="font-mono">{applyResult._id.slice(0, 8)}…</span>.{' '}
                  {applyResult.appliedToVendors.length > 0 ? (
                    <>
                      Applied {applyResult.appliedAs === 'priority' ? 'priority order' : 'weights'} to:{' '}
                      {applyResult.appliedToVendors.join(', ')}. It's now selectable from Route Tester.
                    </>
                  ) : (
                    <>No matching vendor names were found in your vendor list, so nothing was changed.</>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
              The generated JSON config will appear here.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StrategyRecommendation />
        <FallbackSuggestions />
      </div>
    </div>
  );
}
