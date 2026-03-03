import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, User, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import ieeeLogo from '../../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('adminToken', data.token);
                navigate('/admin');
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('System connection failure');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-mesh-dark overflow-hidden font-sans">
            {/* Ambient Background Accents */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl px-6 relative z-10"
            >
                {/* Logo & Navigation */}
                <div className="flex justify-between items-center mb-10 px-2">
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Home
                    </motion.button>

                    <div className="flex items-center gap-3">
                        <img src={ieeeLogo} alt="IEEE" className="h-8 w-auto" />
                        <div className="h-6 w-px bg-white/20" />
                        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Portal</span>
                    </div>
                </div>

                {/* Login Card */}
                <div className="glass-dark rounded-[3rem] p-8 md:p-14 border border-white/10 shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="relative space-y-10">
                        <header className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-primary text-[9px] font-black uppercase tracking-widest mb-4">
                                <ShieldCheck size={12} /> Secure Access
                            </div>
                            <h2 className="text-4xl font-black text-white tracking-tight">Administrative <br />Authentication</h2>
                            <p className="text-gray-400 text-sm font-medium">Verify your credentials to manage branch assets.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode='wait'>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"
                                    >
                                        <AlertCircle size={18} /> {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Username</label>
                                    <div className="relative group">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600"
                                            placeholder="System Identifier"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Security Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-bold placeholder:text-gray-600"
                                            placeholder="••••••••••••"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-8 bg-primary hover:bg-primaryDark text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 group"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-3">Validating <Loader2 size={18} className="animate-spin" /></span>
                                ) : (
                                    "Initialize Portal"
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Footer Credits */}
                <p className="mt-10 text-center text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
                    IEEE Student Branch • GEHU Dehradun • 2026
                </p>
            </motion.div>
        </div>
    );
};

export default Login;

