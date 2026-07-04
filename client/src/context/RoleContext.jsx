import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const RoleContext = createContext(null);
const STORAGE_KEY = 'vendor-routing-role';

export const ROLES = { ADMIN: 'admin', CLIENT: 'client' };

const readStoredRole = () => {
  const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  return stored === ROLES.CLIENT ? ROLES.CLIENT : ROLES.ADMIN;
};

// Simulates two personas hitting the same dashboard: an internal Admin who
// can see and configure vendors, and an external Client who only ever sees
// the unified /route API surface - never which vendor answered it.
export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(readStoredRole);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, role);
  }, [role]);

  const setRole = useCallback((next) => {
    setRoleState(next === ROLES.CLIENT ? ROLES.CLIENT : ROLES.ADMIN);
  }, []);

  return <RoleContext.Provider value={{ role, isAdmin: role === ROLES.ADMIN, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}

// Read outside React (axios interceptors, etc.) without needing the context.
export const getStoredRole = readStoredRole;
