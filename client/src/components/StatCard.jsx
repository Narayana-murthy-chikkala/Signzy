export default function StatCard({ label, value, hint, accent = 'indigo' }) {
  const accentClasses = {
    indigo: 'text-indigo-600',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accentClasses[accent] || accentClasses.indigo}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
