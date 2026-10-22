'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { activateMember } from '../../lib/member-api';

const getInitialActivationToken = () => {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  const fragmentParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
  return fragmentParams.get('token') || '';
};

const MemberActivation = () => {
  const [token, setToken] = useState(getInitialActivationToken);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fragmentParams = new URLSearchParams(url.hash.startsWith('#') ? url.hash.slice(1) : url.hash);
    const fragmentToken = fragmentParams.get('token');

    // Activation secrets are accepted only in a URL fragment (#token=...),
    // which is never sent to the server. Remove the fragment and any
    // unsupported legacy query value from the visible URL immediately.
    if (fragmentToken || url.searchParams.has('token')) {
      url.searchParams.delete('token');
      url.hash = '';
      window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await activateMember(token, password);
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message || 'Unable to activate account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-surface flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <a href="/member/login" className="site-accent inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline"><ArrowLeft size={16} aria-hidden="true" /> Member sign in</a>
          <ThemeToggle />
        </div>
        <section className="site-panel site-border rounded-3xl border p-8 shadow-sm sm:p-10" aria-labelledby="member-activation-title">
          <p className="site-accent text-xs font-bold uppercase tracking-[0.18em]">Account activation</p>
          <h1 id="member-activation-title" className="site-text mt-3 text-3xl font-bold tracking-tight">Set your member password</h1>
          {success ? (
            <div className="mt-6 space-y-4" role="status">
              <p className="site-muted leading-7">Your member account is active. Sign in to manage your approved profile and certificates.</p>
              <a href="/member/login" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primaryDark">Continue to sign in</a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
              <div>
                <label htmlFor="member-activation-token" className="site-text block text-sm font-semibold">Activation secret</label>
                <input id="member-activation-token" value={token} onChange={event => setToken(event.target.value)} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3 font-mono text-sm" required />
              </div>
              <div>
                <label htmlFor="member-new-password" className="site-text block text-sm font-semibold">New password</label>
                <div className="relative mt-2"><KeyRound className="site-muted absolute left-3 top-1/2 -translate-y-1/2" size={18} aria-hidden="true" /><input id="member-new-password" type="password" minLength={12} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="site-panel site-border site-text min-h-11 w-full rounded-xl border pl-10 pr-3" required /></div>
              </div>
              <div>
                <label htmlFor="member-password-confirmation" className="site-text block text-sm font-semibold">Confirm password</label>
                <input id="member-password-confirmation" type="password" minLength={12} autoComplete="new-password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="site-panel site-border site-text mt-2 min-h-11 w-full rounded-xl border px-3" required />
              </div>
              <button type="submit" disabled={loading} className="min-h-11 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primaryDark disabled:opacity-70">{loading ? <span className="inline-flex items-center gap-2">Activating <Loader2 size={16} className="animate-spin" aria-hidden="true" /></span> : 'Activate account'}</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

export default MemberActivation;
