'use client';

import { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2, ShieldCheck, UserRound } from 'lucide-react';
import { ThemeToggle } from '../theme/ThemeToggle';
import { loginMember } from '../../lib/member-api';

const MemberLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginMember(username, password);
      window.localStorage.setItem('memberToken', data.token);
      window.location.assign('/member/dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="site-surface flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <a href="/community" className="site-accent inline-flex min-h-11 items-center gap-2 text-sm font-semibold hover:underline">
            <ArrowLeft size={16} aria-hidden="true" /> Community
          </a>
          <ThemeToggle />
        </div>
        <section className="site-panel site-border rounded-3xl border p-8 shadow-sm sm:p-10" aria-labelledby="member-login-title">
          <div className="mb-8 flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary"><ShieldCheck size={22} aria-hidden="true" /></div>
            <div>
              <p className="site-accent text-xs font-bold uppercase tracking-[0.18em]">Member portal</p>
              <h1 id="member-login-title" className="site-text mt-2 text-3xl font-bold tracking-tight">Sign in to your profile</h1>
              <p className="site-muted mt-3 text-sm leading-7">Use the account provided by the IEEE administrator. Public profiles do not require sign-in.</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
            <div>
              <label htmlFor="member-username" className="site-text block text-sm font-semibold">Username</label>
              <div className="relative mt-2">
                <UserRound className="site-muted absolute left-3 top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                <input id="member-username" name="username" autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} className="site-panel site-border site-text min-h-11 w-full rounded-xl border pl-10 pr-3" required />
              </div>
            </div>
            <div>
              <label htmlFor="member-password" className="site-text block text-sm font-semibold">Password</label>
              <div className="relative mt-2">
                <KeyRound className="site-muted absolute left-3 top-1/2 -translate-y-1/2" size={18} aria-hidden="true" />
                <input id="member-password" name="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} className="site-panel site-border site-text min-h-11 w-full rounded-xl border pl-10 pr-3" required />
              </div>
            </div>
            <button type="submit" disabled={loading} className="min-h-11 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primaryDark disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">
              {loading ? <span className="inline-flex items-center gap-2">Signing in <Loader2 size={16} className="animate-spin" aria-hidden="true" /></span> : 'Sign in'}
            </button>
          </form>
          <p className="site-muted mt-6 text-sm">Have a one-time activation secret? <a className="site-accent font-semibold hover:underline" href="/member/activate">Activate your account</a>.</p>
        </section>
      </div>
    </div>
  );
};

export default MemberLogin;
