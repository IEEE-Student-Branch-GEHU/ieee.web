import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, MessageSquare } from 'lucide-react';
import ieeeLogo from '../assets/logo.png';

const ArchiveNavbar = () => {
    return (
        <nav className="fixed top-8 left-0 right-0 z-[100] px-6 pointer-events-none">
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="container mx-auto max-w-4xl"
            >
                <div className="glass-dark rounded-3xl border border-white/10 px-8 py-4 flex items-center justify-between shadow-2xl pointer-events-auto backdrop-blur-2xl">
                    {/* Brand */}
                    <Link to="/" className="group flex items-center gap-4">
                        <img 
                            src={ieeeLogo} 
                            alt="IEEE Logo" 
                            className="h-12 md:h-16 w-auto group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="hidden sm:block h-8 w-px bg-white/10" />
                        <span className="hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-primary transition-colors">
                            Archive Portal
                        </span>
                    </Link>

                    {/* Minimal Links */}
                    <div className="flex items-center gap-2 md:gap-6">
                        <Link 
                            to="/" 
                            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Home size={14} />
                            <span className="hidden md:inline">Home</span>
                        </Link>
                        
                        <a 
                            href="/#contact" 
                            className="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        >
                            <MessageSquare size={14} />
                            <span className="hidden md:inline">Connect</span>
                        </a>
                    </div>
                </div>
            </motion.div>
        </nav>
    );
};

export default ArchiveNavbar;
