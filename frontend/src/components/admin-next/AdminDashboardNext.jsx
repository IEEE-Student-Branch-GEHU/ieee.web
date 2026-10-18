/* eslint-disable no-unused-vars */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Calendar, Clock, MessageSquare, RefreshCw, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminFetchJson } from '../../lib/admin-api';

const AdminDashboardNext = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      setStats(await adminFetchJson('/admin/stats'));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return <div role="status" className="flex h-64 items-center justify-center"><RefreshCw className="animate-spin text-primary" size={32} /></div>;
  }

  if (errorMessage) {
    return <div role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-8 text-red-600"><h3 className="mb-2 text-lg font-bold">Error Loading Dashboard</h3><p>{errorMessage}</p><button type="button" onClick={fetchStats} className="mt-4 rounded bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">Try Again</button></div>;
  }

  const statCards = [
    { label: 'Total Events', value: stats?.eventsCount || 0, icon: <Calendar />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Members', value: stats?.teamCount || 0, icon: <Users />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Inquiries', value: stats?.messagesCount || 0, icon: <MessageSquare />, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div><h2 className="text-3xl font-black tracking-tight text-gray-900">System Overview</h2><p className="font-medium text-gray-500">Real-time metrics for IEEE GEHU Branch.</p></div>
        <button type="button" aria-label="Refresh dashboard" onClick={fetchStats} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"><RefreshCw size={20} className={loading ? 'animate-spin' : ''} /></button>
      </header>

      <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {statCards.map((card) => <motion.div key={card.label} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="group flex flex-col gap-6 rounded-[2rem] border border-gray-50 bg-white p-8 shadow-sm transition-all duration-500 hover:shadow-xl"><div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg} ${card.color}`}>{card.icon}</div><div className="space-y-1"><span className="text-xs font-black uppercase tracking-widest text-gray-400">{card.label}</span><div className="flex items-end gap-3"><span className="text-5xl font-black tracking-tight text-gray-900">{card.value}</span><span className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Live Data</span></div></div></motion.div>)}
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <section className="space-y-8 rounded-[2.5rem] border border-gray-50 bg-white p-10 shadow-sm"><div className="flex items-center justify-between"><h3 className="flex items-center gap-3 text-xl font-black text-gray-900"><Clock size={20} className="text-primary" /> Recent Updates</h3><ArrowUpRight size={20} className="text-gray-300" /></div><div className="space-y-6">{stats?.recentActivity?.length ? stats.recentActivity.map((activity, index) => <div key={`${activity.type}-${activity.date}-${index}`} className="group flex items-start gap-4"><div className={`mt-1.5 h-2 w-2 rounded-full ${activity.type === 'event' ? 'bg-blue-500' : 'bg-green-500'} ring-4 ring-gray-50`} /><div className="flex-1"><p className="text-sm font-bold leading-tight text-gray-700 transition-colors group-hover:text-primary">{activity.text}</p><span className="mt-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">{new Date(activity.date).toLocaleDateString()}</span></div></div>) : <p className="text-sm font-medium italic text-gray-400">No recent activity detected.</p>}</div></section>
        <section className="relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] bg-primaryDark p-10 shadow-2xl"><div className="absolute right-0 top-0 -mr-32 -mt-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl" /><div className="relative space-y-4"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Quick Tip</span><h3 className="text-2xl font-black leading-tight text-white">Manage branch content efficiently.</h3><p className="text-sm font-medium text-gray-400">Use the sidebar to navigate between Events and Team management. All changes are reflected instantly on the main site.</p></div><button type="button" className="relative w-fit rounded-xl border border-white/10 bg-white/10 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-white/20">View Docs</button></section>
      </div>
    </div>
  );
};

export default AdminDashboardNext;
