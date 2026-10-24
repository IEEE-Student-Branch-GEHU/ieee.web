'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Search, SlidersHorizontal, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Reveal } from "../components/animations/Reveal";
import ArchiveNavbar from '../components/ArchiveNavbar';
import Footer from '../components/Footer';
import { fetchHomepageJson, normalizeEventsResponse } from '../lib/homepage-api';
import emptyIllustration from '../assets/empty_events.png';
import EventHighlights from '../components/EventHighlights';

const categories = ['All', 'Workshop', 'Technical', 'Non-Technical', 'Social'];
const itemsPerPage = 6;

const EventsArchive = () => {
    const emptyIllustrationSource = typeof emptyIllustration === 'string'
        ? emptyIllustration
        : emptyIllustration.src;
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const query = new URLSearchParams({
            page: String(currentPage),
            limit: String(itemsPerPage),
            search: searchTerm,
            category: selectedCategory,
        });

        // The archive retains its loading state while each filter or page request is active.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        fetchHomepageJson(`/events?${query.toString()}`, { signal: controller.signal })
            .then(data => {
                if (controller.signal.aborted) return;
                setEvents(normalizeEventsResponse(data));
                setTotalPages(data?.totalPages || 1);
                setError(null);
            })
            .catch(err => {
                if (controller.signal.aborted || err.name === 'AbortError') return;
                console.error('Failed to fetch events:', err);
                setError('System connection failure. Retrying...');
                setEvents([]);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [currentPage, searchTerm, selectedCategory]);

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
        <div className="archive-page site-surface min-h-screen selection:bg-primary/30">
            <ArchiveNavbar />
            
            <main className="relative overflow-hidden px-4 pb-24 pt-36 sm:px-6 sm:pt-48">
                {/* Background Decoration */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="container mx-auto max-w-7xl relative z-10">
                    {/* Hero Section */}
                    <header className="mb-14 flex flex-col items-center space-y-6 text-center sm:mb-20">
                        
                        <Reveal>
                            <h1 className="archive-heading text-[clamp(2.5rem,10vw,4.5rem)] font-bold tracking-tight">
                                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Innovation</span>
                            </h1>
                        </Reveal>
                        
                        <p className="archive-muted text-lg max-w-2xl leading-relaxed">
                            A curated timeline of workshops, seminars, and technical competitions organized by IEEE GEHU Student Branch.
                        </p>
                    </header>

                    {/* Filter Bar */}
                    <section className="archive-filter-panel mx-auto mb-12 max-w-5xl rounded-3xl border p-3 shadow-2xl sm:mb-16 sm:p-4">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Search */}
                            <div className="flex-grow group">
                                <div className="archive-search relative">
                                    <Search className="archive-search-icon absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 w-5 h-5" />
                                    <input
                                        type="text"
                                        aria-label="Search events by title"
                                        placeholder="Search events by title..."
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        className="archive-input w-full border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-primary/50 transition-all duration-300"
                                    />
                                </div>
                            </div>
                            
                            {/* Categories */}
                            <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-2 no-scrollbar">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        aria-pressed={selectedCategory === category}
                                        onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                                        className={`archive-filter-button px-6 py-3 rounded-2xl whitespace-nowrap font-semibold text-sm transition-all duration-300 ${
                                            selectedCategory === category
                                                ? 'is-selected bg-primary text-white shadow-[0_0_20px_rgba(0,98,155,0.4)]'
                                                : ''
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
                            <Motion.div 
                                key="loader"
                                role="status"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col justify-center items-center py-32 space-y-4"
                            >
                                <Loader2 className="animate-spin text-primary w-12 h-12" />
                                 <p className="archive-muted font-medium">Curating sessions...</p>
                            </Motion.div>
                        ) : error ? (
                            <Motion.div 
                                key="error"
                                role="alert"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                 className="archive-error-panel max-w-md mx-auto border border-red-500/20 p-8 rounded-3xl text-center"
                            >
                                <div className="text-red-400 mb-2 font-bold uppercase tracking-wider">Connection Lost</div>
                                 <p className="archive-muted text-sm">{error}</p>
                            </Motion.div>
                        ) : events.length > 0 ? (
                            <Motion.div
                                key="grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {events.map((event, idx) => (
                                    <Motion.div key={event._id || idx} variants={cardVariants}>
                                         <Card className="archive-card group h-full border hover:border-primary/50 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
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
                                                         <span className="archive-badge px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border">
                                                            {event.category}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Body */}
                                                 <div className="flex-grow space-y-4 p-6 sm:p-8">
                                                    <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                                                        <Calendar size={14} />
                                                        {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                    <h3 className="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                                                        {event.title}
                                                    </h3>
                                                     <p className="archive-muted line-clamp-3 text-sm leading-relaxed font-medium">
                                                        {event.description}
                                                    </p>
                                                </div>

                                                {/* Action */}
                                                 <div className="mt-auto px-6 pb-6 sm:px-8 sm:pb-8">
                                                     <Button type="button" aria-label={`View highlights for ${event.title}`} aria-haspopup="dialog" onClick={() => setSelectedEvent(event)} className="archive-modal-trigger w-full border rounded-2xl py-6 transition-all duration-300 font-bold tracking-tight">
                                                        View Highlights
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Motion.div>
                                ))}
                            </Motion.div>
                        ) : (
                            <Motion.div 
                                key="empty"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                 <img src={emptyIllustrationSource} alt="No results" className="archive-empty-illustration w-64 h-64 mb-8 opacity-60" />
                                 <h3 className="archive-heading text-2xl font-bold mb-2">No Sessions Found</h3>
                                 <p className="archive-muted max-w-sm">We couldn't find any events matching your search criteria. Try a different category.</p>
                            </Motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pagination */}
                    {!loading && events.length > 0 && totalPages > 1 && (
                        <nav aria-label="Event pagination" className="mt-16 flex flex-wrap items-center justify-center gap-3 sm:mt-20 sm:gap-4">
                            <button
                                aria-label="Previous page"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                 className="archive-page-button w-12 h-12 flex items-center justify-center rounded-2xl border disabled:opacity-30 hover:border-primary hover:text-primary transition-all duration-300"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            
                             <div className="flex max-w-full flex-wrap justify-center gap-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        aria-current={currentPage === page ? 'page' : undefined}
                                        onClick={() => setCurrentPage(page)}
                                         className={`archive-page-button w-12 h-12 rounded-2xl font-bold text-sm transition-all duration-300 ${
                                            currentPage === page
                                                ? 'is-selected bg-primary text-white shadow-[0_0_20px_rgba(0,98,155,0.4)]'
                                                : ''
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                aria-label="Next page"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                 className="archive-page-button w-12 h-12 flex items-center justify-center rounded-2xl border disabled:opacity-30 hover:border-primary hover:text-primary transition-all duration-300"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </nav>
                    )}
                </div>
            </main>

            <Footer sectionLinkPrefix="/" />
            {selectedEvent && <EventHighlights key={selectedEvent._id || selectedEvent.id || selectedEvent.title} event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </div>
    );
};

export default EventsArchive;
