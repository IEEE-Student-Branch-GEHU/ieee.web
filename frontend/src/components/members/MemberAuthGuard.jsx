'use client';

import { useEffect, useState } from 'react';
import { clearMemberToken, getMemberToken } from '../../lib/member-api';

const MemberAuthGuard = ({ children }) => {
  const [resolved, setResolved] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearMemberToken();
      setAuthenticated(false);
      window.location.replace('/member/login');
    };

    const token = getMemberToken();
    if (!token) {
      handleUnauthorized();
      return undefined;
    }

    // Auth state is resolved after hydration so localStorage is never read
    // during SSR. The synchronous updates are intentional for this guard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthenticated(true);
    setResolved(true);
    window.addEventListener('member-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('member-unauthorized', handleUnauthorized);
  }, []);

  if (!resolved || !authenticated) {
    return <div className="site-surface flex min-h-screen items-center justify-center text-sm font-semibold site-muted">Checking member access...</div>;
  }
  return children;
};

export default MemberAuthGuard;
