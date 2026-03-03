import { useState, useEffect } from 'react';
import { Calendar, Users, MessageSquare, ArrowUpRight, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('/api/admin/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
                throw new Error(errorData.message || 'Failed to fetch metrics');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100">
                <h3 className="font-bold text-lg mb-2">Error Loading Dashboard</h3>
                <p>{errorMsg}</p>
                <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700">Try Again</button>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Events', value: stats?.eventsCount || 0, icon: <Calendar />, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Members', value: stats?.teamCount || 0, icon: <Users />, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Inquiries', value: stats?.messagesCount || 0, icon: <MessageSquare />, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-10">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Overview</h2>
                    <p className="text-gray-500 font-medium">Real-time metrics for IEEE GEHU Branch.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                </button>
            </header>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                {statCards.map((card, i) => (
                    <motion.div
                        key={i}
                        variants={item}
                        className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col gap-6 group hover:shadow-xl transition-all duration-500"
                    >
                        <div className={`w-14 h-14 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center`}>
                            {card.icon}
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{card.label}</span>
                            <div className="flex items-end gap-3">
                                <span className="text-5xl font-black text-gray-900 tracking-tight">{card.value}</span>
                                <span className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Live Data</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-10 space-y-8"
                >
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                            <Clock size={20} className="text-primary" /> Recent Updates
                        </h3>
                        <ArrowUpRight size={20} className="text-gray-300" />
                    </div>

                    <div className="space-y-6">
                        {stats?.recentActivity?.length > 0 ? (
                            stats.recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-start gap-4 group">
                                    <div className={`mt-1.5 w-2 h-2 rounded-full ${activity.type === 'event' ? 'bg-blue-500' : 'bg-green-500'} ring-4 ring-gray-50`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-700 leading-tight group-hover:text-primary transition-colors">
                                            {activity.text}
                                        </p>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 block">
                                            {new Date(activity.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 font-medium italic">No recent activity detected.</p>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-primaryDark rounded-[2.5rem] shadow-2xl p-10 flex flex-col justify-between overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative space-y-4">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Quick Tip</span>
                        <h3 className="text-2xl font-black text-white leading-tight">Manage branch content efficiently.</h3>
                        <p className="text-gray-400 text-sm font-medium">Use the sidebar to navigate between Events and Team management. All changes are reflected instantly on the main site.</p>
                    </div>
                    <button className="relative w-fit px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all">
                        View Docs
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;

