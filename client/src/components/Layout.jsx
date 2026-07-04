import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import ToastContainer from './ToastContainer';
import { ROLES, useRole } from '../context/RoleContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true, roles: [ROLES.ADMIN] },
  { to: '/vendors', label: 'Vendors', roles: [ROLES.ADMIN] },
  { to: '/route-tester', label: 'Route Tester', clientLabel: 'Submit Request', roles: [ROLES.ADMIN, ROLES.CLIENT] },
  { to: '/metrics', label: 'Metrics', roles: [ROLES.ADMIN] },
  { to: '/logs', label: 'Routing Logs', roles: [ROLES.ADMIN] },
  { to: '/health', label: 'Health', roles: [ROLES.ADMIN] },
  { to: '/ai-rule-generator', label: 'AI Rule Generator', roles: [ROLES.ADMIN] },
];

function Brand() {
  return (
    <div className="px-2">
      <h1 className="text-lg font-semibold text-slate-900">Vendor Routing</h1>
      <p className="text-xs text-slate-500">Intelligent Routing Platform</p>
    </div>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useRole();

  return (
    <div className="px-2">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Viewing as</p>
      <div className="relative flex rounded-lg bg-slate-100 p-1">
        <span
          className={`absolute inset-y-1 w-1/2 rounded-md bg-white shadow-sm transition-transform duration-200 ease-out ${
            role === ROLES.CLIENT ? 'translate-x-full' : 'translate-x-0'
          }`}
        />
        {[ROLES.ADMIN, ROLES.CLIENT].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`relative z-10 flex-1 rounded-md py-1.5 text-xs font-medium capitalize transition-colors duration-200 ${
              role === r ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function Nav({ onNavigate }) {
  const { role } = useRole();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <nav className="space-y-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          {role === ROLES.CLIENT && item.clientLabel ? item.clientLabel : item.label}
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
          className="rounded-md border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-slate-900/40"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in-left overflow-y-auto bg-white px-4 py-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <RoleSwitcher />
            </div>
            <Nav onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 md:block">
        <div className="mb-6">
          <Brand />
        </div>
        <div className="mb-6">
          <RoleSwitcher />
        </div>
        <Nav />
      </aside>

      <main key={location.pathname} className="flex-1 animate-fade-in-up overflow-x-hidden px-4 py-6 md:px-10 md:py-8">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}
