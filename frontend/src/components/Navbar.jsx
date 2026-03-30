import { useState, useEffect } from 'react';
import { Menu, X, Instagram, Linkedin, Github, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

// Assets
import ieeeLogo from '../assets/logo.png';

const Navbar = () => {
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
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', href: '/', id: '01', isRoute: true },
        { name: 'Events', href: '/events', id: '02', isRoute: true },
        { name: 'Team', href: '/#team', id: '03', isRoute: false },
        { name: 'About', href: '/#about', id: '04', isRoute: false },
        { name: 'Contact', href: '/#contact', id: '05', isRoute: false },
    ];

    const socialLinks = [
        { icon: <Instagram size={18} />, href: 'https://www.instagram.com/ieee_gehu' },
        { icon: <Linkedin size={18} />, href: 'https://www.linkedin.com/company/ieeesb-gehu' },
        { icon: <Github size={18} />, href: 'https://github.com/IEEE-Student-Branch-GEHU/ieee.web' },
    ];

    return (
        <>
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
                style={{ scaleX }}
            />

            <nav
                className={`fixed w-full z-50 transition-all duration-700 ${scrolled
                    ? 'glass-dark py-4'
                    : 'bg-transparent py-8'
                    }`}
            >
                {/* Backlight Glow when scrolled */}
                {scrolled && (
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
                )}

                <div className="container mx-auto px-6 flex justify-between items-center">
                    {/* Premium Branding Badge */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-6 group"
                    >
                        <Link to="/" className="relative">
                            <img
                                src={ieeeLogo}
                                alt="IEEE Logo"
                                className="h-14 md:h-24 w-auto group-hover:scale-105 transition-transform duration-500 py-1"
                            />
                        </Link>
                    </motion.div>

                    {/* Scientific Desktop Menu */}
                    <div className="hidden md:flex items-center gap-12">
                        <div className="flex items-center gap-10">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={link.name}
                                >
                                    {link.isRoute ? (
                                        <Link
                                            to={link.href}
                                            className="group relative flex items-center gap-2"
                                        >
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${scrolled ? 'text-gray-300 group-hover:text-white' : 'text-primaryDark/80 group-hover:text-primary'}`}>
                                                {link.name}
                                            </span>
                                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className="group relative flex items-center gap-2"
                                        >
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${scrolled ? 'text-gray-300 group-hover:text-white' : 'text-primaryDark/80 group-hover:text-primary'}`}>
                                                {link.name}
                                            </span>
                                            <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-secondary rounded-full group-hover:w-full transition-all duration-500" />
                                        </a>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                    </div>

                    {/* Mobile Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="md:hidden z-50 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X size={20} /> : <Menu size={20} />}
                    </motion.button>
                </div>

                {/* Full Screen Mobile Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: '-100%' }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed inset-0 w-full h-screen bg-primaryDark/95 backdrop-blur-3xl flex flex-col pt-32 px-10 md:hidden z-40"
                        >
                            <div className="space-y-8">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 + 0.3 }}
                                        key={link.name}
                                    >
                                        {link.isRoute ? (
                                            <Link
                                                to={link.href}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center gap-6 group"
                                            >
                                                <span className="text-4xl font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                                                    {link.name}
                                                </span>
                                            </Link>
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
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-auto pb-12 space-y-10">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="h-px bg-white/10 w-full"
                                />
                                <div className="flex justify-between items-end">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Social Networks</h4>
                                        <div className="flex gap-6">
                                            {socialLinks.map((social, i) => (
                                                <motion.a
                                                    key={i}
                                                    href={social.href}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    whileHover={{ y: -3 }}
                                                    className="text-white/60 hover:text-secondary transition-colors"
                                                >
                                                    {social.icon}
                                                </motion.a>
                                            ))}
                                        </div>
                                    </div>
                                    <a href="mailto:ieee@gehu.ac.in" className="text-[10px] font-black text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                                        Get in touch
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default Navbar;

