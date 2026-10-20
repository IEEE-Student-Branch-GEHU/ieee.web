'use client';

import { useEffect, useRef, useState } from 'react';
import { GOOGLE_CLIENT_ID, loadGoogleIdentity } from '../../lib/google-identity';
import { loginMemberWithGoogle } from '../../lib/member-api';

// Google sign-in for volunteers whose email an administrator authorized. The
// Google script loads only once the button scrolls into view.
const GoogleSignInButton = ({ theme = 'outline', width = 240, className = '', messageClassName = '' }) => {
  const containerRef = useRef(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!GOOGLE_CLIENT_ID || !container) return undefined;

    let cancelled = false;
    const handleCredential = async ({ credential }) => {
      setIsError(false);
      setMessage('Signing in...');
      try {
        const data = await loginMemberWithGoogle(credential);
        window.localStorage.setItem('memberToken', data.token);
        window.location.assign('/member/dashboard');
      } catch (error) {
        setIsError(true);
        setMessage(error.message || 'Unable to sign in with Google');
      }
    };

    const renderButton = () => {
      loadGoogleIdentity()
        .then((identity) => {
          if (cancelled) return;
          identity.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential, ux_mode: 'popup' });
          identity.renderButton(container, {
            type: 'standard',
            theme,
            size: 'large',
            text: 'signin_with',
            shape: 'pill',
            width,
          });
        })
        .catch(() => {
          if (cancelled) return;
          setIsError(true);
          setMessage('Google sign-in is unavailable right now.');
        });
    };

    if (typeof IntersectionObserver === 'undefined') {
      renderButton();
      return () => { cancelled = true; };
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      renderButton();
    }, { rootMargin: '200px' });
    observer.observe(container);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [theme, width]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className={className}>
      <div ref={containerRef} className="min-h-10" data-testid="google-sign-in" />
      {message && (
        <p role={isError ? 'alert' : 'status'} className={`mt-2 text-sm ${messageClassName}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default GoogleSignInButton;
