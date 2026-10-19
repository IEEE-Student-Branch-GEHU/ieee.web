/* eslint-disable no-unused-vars */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader2, Lock, ShieldCheck, User } from 'lucide-react';
import { Button } from '../ui/button';
import { loginAdmin } from '../../lib/admin-api';
import ieeeLogo from '../../assets/logo.png';

const AdminLoginNext = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const logoSource = typeof ieeeLogo === 'string' ? ieeeLogo : ieeeLogo.src;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginAdmin(username, password);
      if (!data?.token) throw new Error('Authentication response did not include a token.');
      localStorage.setItem('adminToken', data.token);
      router.replace('/admin');
    } catch (requestError) {
      setError(requestError.message || 'System connection failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login site-surface relative flex min-h-screen items-center justify-center overflow-hidden font-sans">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[160px]" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-xl px-6">
        <div className="mb-10 flex items-center justify-between px-2">
          <button type="button" onClick={() => router.push('/')} className="admin-login-top-link flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors hover:text-primary">
            <ArrowLeft size={16} /> Home
          </button>
          <div className="flex items-center gap-3">
            <img src={logoSource} alt="IEEE" className="h-8 w-auto" />
            <div className="admin-login-divider h-6 w-px" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Portal</span>
          </div>
        </div>

        <div className="admin-login-card relative overflow-hidden rounded-[3rem] border p-8 shadow-3xl md:p-14">
          <div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="relative space-y-10">
            <header className="space-y-3">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary"><ShieldCheck size={12} /> Secure Access</div>
              <h2 className="admin-login-title text-4xl font-black tracking-tight">Administrative <br />Authentication</h2>
              <p className="admin-muted text-sm font-medium">Verify your credentials to manage branch assets.</p>
            </header>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && <motion.div role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="admin-status-error flex items-center gap-3 rounded-2xl border p-4 text-sm font-bold"><AlertCircle size={18} /> {error}</motion.div>}
              </AnimatePresence>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="admin-username" className="admin-label ml-1 text-[10px] font-black uppercase tracking-widest">Username</label>
                  <div className="group relative"><User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-primary" size={18} /><input id="admin-username" type="text" value={username} onChange={event => setUsername(event.target.value)} className="admin-input w-full rounded-2xl border py-5 pl-14 pr-6 font-bold outline-none transition-all" placeholder="System Identifier" required /></div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="admin-password" className="admin-label ml-1 text-[10px] font-black uppercase tracking-widest">Security Key</label>
                  <div className="group relative"><Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-primary" size={18} /><input id="admin-password" type="password" value={password} onChange={event => setPassword(event.target.value)} className="admin-input w-full rounded-2xl border py-5 pl-14 pr-6 font-bold outline-none transition-all" placeholder="••••••••••••" required /></div>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full rounded-2xl bg-primary py-8 font-black uppercase tracking-[0.2em] text-white shadow-2xl shadow-primary/20 transition-all hover:bg-primaryDark disabled:opacity-70">
                {loading ? <span className="flex items-center gap-3">Validating <Loader2 size={18} className="animate-spin" /></span> : 'Initialize Portal'}
              </Button>
            </form>
          </div>
        </div>
        <p className="admin-login-footer mt-10 text-center text-[10px] font-bold uppercase tracking-[0.3em]">IEEE Student Branch • GEHU Dehradun • 2026</p>
      </motion.div>
    </div>
  );
};

export default AdminLoginNext;
