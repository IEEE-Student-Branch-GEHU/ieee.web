'use client';

import { motion as Motion } from 'framer-motion';
import { ArrowLeft, Home, MessageSquare } from 'lucide-react';
import ieeeLogo from '../assets/logo.png';
import { ThemeToggle } from './theme/ThemeToggle';

const ArchiveNavbar = () => {
    const logoSource = typeof ieeeLogo === 'string' ? ieeeLogo : ieeeLogo.src;

    return (
        <nav className="fixed top-8 left-0 right-0 z-[100] px-6 pointer-events-none">
            <Motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="container mx-auto max-w-4xl"
            >
                <div className="archive-navbar-panel rounded-3xl border px-4 py-4 sm:px-8 flex items-center justify-between shadow-2xl pointer-events-auto">
                    {/* Brand */}
                     <a href="/" aria-label="IEEE homepage" className="group flex items-center gap-4">
                        <img 
                            src={logoSource}
                            alt="IEEE Logo" 
                            className="h-12 md:h-16 w-auto group-hover:scale-105 transition-transform duration-500" 
                        />
                         <div className="archive-nav-divider hidden sm:block h-8 w-px" />
                         <span className="archive-nav-label hidden sm:block text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
                            Archive Portal
                        </span>
                     </a>

                    {/* Minimal Links */}
                    <div className="flex items-center gap-2 md:gap-6">
                         <ThemeToggle />
                         <a
                             href="/"
                             aria-label="Home"
                             className="archive-nav-icon p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Home size={14} />
                            <span className="hidden md:inline">Home</span>
                         </a>
                        
                        <a 
                            href="/#contact" 
                            aria-label="Connect"
                            className="px-6 py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        >
                            <MessageSquare size={14} />
                            <span className="hidden md:inline">Connect</span>
                        </a>
                    </div>
                </div>
            </Motion.div>
        </nav>
    );
};

export default ArchiveNavbar;
