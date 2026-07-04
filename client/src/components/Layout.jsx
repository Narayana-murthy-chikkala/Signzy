import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import ToastContainer from './ToastContainer';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/vendors', label: 'Vendors' },
  { to: '/route-tester', label: 'Route Tester' },
  { to: '/metrics', label: 'Metrics' },
  { to: '/logs', label: 'Routing Logs' },
  { to: '/health', label: 'Health' },
  { to: '/ai-rule-generator', label: 'AI Rule Generator' },
];

function Brand() {
  return (
    <div className="px-2">
      <h1 className="text-lg font-semibold text-slate-900">Vendor Routing</h1>
      <p className="text-xs text-slate-500">Intelligent Routing Platform</p>
    </div>
  );
}

function Nav({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation menu"
          className="rounded-md border border-slate-300 p-2 text-slate-600 hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-white px-4 py-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Nav onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block">
        <div className="mb-8">
          <Brand />
        </div>
        <Nav />
      </aside>

      <main className="flex-1 overflow-x-hidden px-4 py-6 md:px-10 md:py-8">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
