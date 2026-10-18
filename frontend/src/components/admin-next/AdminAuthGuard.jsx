'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { clearAdminToken, getAdminToken } from '../../lib/admin-api';

const AdminAuthGuard = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginRoute = pathname === '/admin/login';
  const [authResolved, setAuthResolved] = useState(isLoginRoute);
  const [authenticated, setAuthenticated] = useState(isLoginRoute);

  useEffect(() => {
    if (isLoginRoute) {
      return undefined;
    }

    // Auth state is intentionally resolved after hydration so localStorage is never read during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthResolved(false);
    const token = getAdminToken();

    if (!token) {
      setAuthenticated(false);
      setAuthResolved(true);
      router.replace('/admin/login');
      return undefined;
    }

    const handleUnauthorized = () => {
      clearAdminToken();
      setAuthenticated(false);
      router.replace('/admin/login');
    };

    window.addEventListener('admin-unauthorized', handleUnauthorized);
    setAuthenticated(true);
    setAuthResolved(true);

    return () => window.removeEventListener('admin-unauthorized', handleUnauthorized);
  }, [isLoginRoute, router, pathname]);

  if (isLoginRoute) return children;
  if (!authResolved || !authenticated) {
    return (
      <div className="site-surface admin-muted flex min-h-screen items-center justify-center text-sm font-bold">
        Checking administrator access...
      </div>
    );
  }

  return children;
};

export default AdminAuthGuard;
