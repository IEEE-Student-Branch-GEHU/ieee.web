import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Search, SlidersHorizontal, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "../components/animations/Reveal";
import ArchiveNavbar from '../components/ArchiveNavbar';
import Footer from '../components/Footer';
import API_BASE_URL from '../config';
import emptyIllustration from '../assets/empty_events.png';

const EventsArchive = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = ['All', 'Workshop', 'Technical', 'Non-Technical', 'Social'];
    const itemsPerPage = 6;

    useEffect(() => {
        fetchEvents(currentPage, searchTerm, selectedCategory);
    }, [currentPage, searchTerm, selectedCategory]);

    const fetchEvents = async (page, search = '', category = 'All') => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/events?page=${page}&limit=${itemsPerPage}&search=${search}&category=${category}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const data = await response.json();
            
            if (data.events) {
                setEvents(data.events);
                setTotalPages(data.totalPages || 1);
            } else if (Array.isArray(data)) {
                setEvents(data);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('System connection failure. Retrying...');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 } 
        }
    };

    return (
        <div className="bg-mesh-dark min-h-screen text-white selection:bg-primary/30">
            <ArchiveNavbar />
            
            <main className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto max-w-7xl relative z-10">
                    {/* Hero Section */}
                    <header className="flex flex-col items-center text-center space-y-6 mb-20">
                        
                        <Reveal>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Innovation</span>
                            </h1>
                        </Reveal>
                        
                        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                            A curated timeline of workshops, seminars, and technical competitions organized by IEEE GEHU Student Branch.
                        </p>
                    </header>

                    {/* Filter Bar */}
                    <section className="glass-dark rounded-3xl p-4 mb-16 max-w-5xl mx-auto border border-white/10 shadow-2xl">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Search */}
                            <div className="flex-grow group">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors duration-300 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search events by title..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all duration-300 placeholder:text-gray-600"
                                    />
                                </div>
                            </div>
                            
                            {/* Categories */}
                            <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                                        className={`px-6 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 ${
                                            selectedCategory === category
                                                ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,98,155,0.4)]'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Content Grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div 
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col justify-center items-center py-32 space-y-4"
                            >
                                <Loader2 className="animate-spin text-primary w-12 h-12" />
                                <p className="text-gray-500 font-medium">Curating sessions...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div 
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-md mx-auto glass-dark border border-red-500/20 p-8 rounded-3xl text-center"
                            >
                                <div className="text-red-400 mb-2 font-bold uppercase tracking-wider">Connection Lost</div>
                                <p className="text-gray-400 text-sm">{error}</p>
                            </motion.div>
                        ) : events.length > 0 ? (
                            <motion.div
                                key="grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {events.map((event, idx) => (
                                    <motion.div key={event._id || idx} variants={cardVariants}>
                                        <Card className="group h-full bg-white/5 border border-white/10 hover:border-primary/50 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                                            <CardContent className="p-0 h-full flex flex-col">
                                                {/* Image Wrap */}
                                                <div className="relative aspect-[16/10] overflow-hidden">
                                                    <img
                                                        src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format"}
                                                        alt={event.title}
                                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent opacity-80" />
                                                    <div className="absolute top-6 left-6">
                                                        <span className="px-4 py-1.5 rounded-full glass-dark text-[10px] font-black tracking-widest uppercase border border-white/10">
                                                            {event.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                <div className="p-8 space-y-4 flex-grow">
                                                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                                                        <Calendar size={14} />
                                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-gray-500 line-clamp-3 text-sm leading-relaxed font-medium">
                                                        {event.description}
                                                    </p>
                                                </div>

                                                {/* Action */}
                                                <div className="px-8 pb-8 mt-auto">
                                                    <Button className="w-full bg-white/5 hover:bg-primary text-white border border-white/10 hover:border-primary rounded-2xl py-6 transition-all duration-300 font-bold tracking-tight">
                                                        View Highlights
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <img src={emptyIllustration} alt="No results" className="w-64 h-64 mb-8 opacity-60 mix-blend-screen" />
                                <h3 className="text-2xl font-bold mb-2">No Sessions Found</h3>
                                <p className="text-gray-500 max-w-sm">We couldn't find any events matching your search criteria. Try a different category.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {!loading && events.length > 0 && totalPages > 1 && (
                        <nav className="flex justify-center items-center gap-4 mt-20">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl glass-dark border border-white/10 disabled:opacity-30 hover:border-primary hover:text-primary transition-all duration-300"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            
                            <div className="flex gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all duration-300 ${
                                            currentPage === page
                                                ? 'bg-primary text-white shadow-[0_0_20px_rgba(0,98,155,0.4)]'
                                                : 'glass-dark border border-white/10 text-gray-500 hover:text-white hover:border-white/30'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl glass-dark border border-white/10 disabled:opacity-30 hover:border-primary hover:text-primary transition-all duration-300"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </nav>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EventsArchive;
