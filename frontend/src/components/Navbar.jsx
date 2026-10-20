'use client';

import { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { FaInstagram, FaLinkedinIn, FaGithub } from 'react-icons/fa6';
import { motion as Motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { ThemeToggle } from './theme/ThemeToggle';

// Assets
import ieeeLogo from '../assets/logo.png';

const Navbar = ({ surface = false }) => {
    const logoSource = typeof ieeeLogo === 'string' ? ieeeLogo : ieeeLogo.src;
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/', id: '01', isRoute: true },
        { name: 'Events', href: '/events', id: '02', isRoute: true },
        { name: 'Community', href: '/community', id: '03', isRoute: true },
        { name: 'Team', href: '/leadership', id: '04', isRoute: true },
        { name: 'About', href: '/#about', id: '05', isRoute: false },
        { name: 'Contact', href: '/#contact', id: '06', isRoute: false },
    ];

    const socialLinks = [
        { icon: <FaInstagram size={18} />, href: 'https://www.instagram.com/ieee_gehu' },
        { icon: <FaLinkedinIn size={18} />, href: 'https://www.linkedin.com/company/ieeesb-gehu' },
        { icon: <FaGithub size={18} />, href: 'https://github.com/IEEE-Student-Branch-GEHU/ieee.web' },
    ];

    return (
        <>
            {/* Scroll Progress Bar */}
            <Motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
                style={{ scaleX }}
            />

            <nav
                aria-label="Primary navigation"
                className={`site-navbar fixed w-full z-50 transition-all duration-700 ${surface || scrolled
                    ? 'is-scrolled py-4'
                    : 'bg-transparent py-8'
                    }`}
            >
                {/* Backlight Glow when scrolled */}
                {(surface || scrolled) && (
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
                )}

                <div className="container mx-auto px-6 flex justify-between items-center">
                    {/* Premium Branding Badge */}
                     <Motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6 group"
                    >
                        <a href="/" className="relative">
                            <img
                                src={logoSource}
                                alt="IEEE Logo"
                                className="h-14 md:h-24 w-auto group-hover:scale-105 transition-transform duration-500 py-1"
                            />
                        </a>
                    </Motion.div>

                    {/* Scientific Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-12">
                        <div className="flex items-center gap-10">
                            {navLinks.map((link, i) => (
                                <Motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={link.name}
                                >
                                    {link.isRoute ? (
                                         <a
                                             href={link.href}
                                            className="group relative flex items-center gap-2"
                                        >
                                             <span className="site-nav-link text-[11px] font-black uppercase tracking-[0.2em] transition-all">
                                                {link.name}
                                            </span>
                                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
                                         </a>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className="group relative flex items-center gap-2"
                                        >
                                             <span className="site-nav-link text-[11px] font-black uppercase tracking-[0.2em] transition-all">
                                                {link.name}
                                            </span>
                                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
                                        </a>
                                    )}
                                </Motion.div>
                            ))}
                        </div>

                        <Motion.a
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href={surface ? '/#contact' : '#contact'}
                            className="relative group px-8 py-3.5 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Join Now <ArrowUpRight size={14} />
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        </Motion.a>
                    </div>

                     <ThemeToggle className="site-nav-theme-toggle" />

                    {/* Mobile Toggle */}
                    <div className="lg:hidden z-50 flex items-center gap-2">
                         <Motion.button
                             type="button"
                             whileTap={{ scale: 0.9 }}
                             className="site-nav-toggle w-12 h-12 flex items-center justify-center rounded-2xl border"
                             aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                             aria-expanded={isOpen}
                             aria-controls="mobile-navigation"
                             onClick={() => setIsOpen(!isOpen)}
                         >
                             {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
                        </Motion.button>
                    </div>
                </div>

                {/* Full Screen Mobile Overlay */}
                <AnimatePresence>
                    {isOpen && (
                         <Motion.div
                            initial={{ opacity: 0, y: '-100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                             id="mobile-navigation"
                             role="dialog"
                             aria-label="Mobile navigation"
                             className="site-mobile-menu fixed inset-0 w-full h-screen bg-primaryDark/95 backdrop-blur-3xl flex flex-col pt-32 px-10 lg:hidden z-40"
                        >
                            <div className="space-y-8">
                                {navLinks.map((link, i) => (
                                     <Motion.div
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 + 0.3 }}
                                        key={link.name}
                                    >
                                        {link.isRoute ? (
                                             <a
                                                 href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-6 group"
                                            >
                                                <span className="text-4xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                                                    {link.name}
                                                </span>
                                             </a>
                                        ) : (
                                            <a
                                                href={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-6 group"
                                            >
                                                <span className="text-4xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                                                    {link.name}
                                                </span>
                                            </a>
                                        )}
                                    </Motion.div>
                                ))}
                            </div>

                            <div className="mt-auto pb-12 space-y-10">
                                 <Motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="h-px bg-white/10 w-full"
                                />
                                <div className="flex justify-between items-end">
                                    <div className="space-y-4">
                                         <h4 className="site-mobile-muted text-[10px] font-black uppercase tracking-[0.3em]">Social Networks</h4>
                                        <div className="flex gap-6">
                                            {socialLinks.map((social, i) => (
                                                 <Motion.a
                                                    key={i}
                                                    href={social.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    whileHover={{ y: -3 }}
                                                    className="text-white/60 hover:text-secondary transition-colors"
                                                >
                                                    {social.icon}
                                                </Motion.a>
                                            ))}
                                        </div>
                                    </div>
                                    <a href="mailto:ieee@gehu.ac.in" className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                        Get in touch
                                    </a>
                                </div>
                            </div>
                         </Motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default Navbar;

