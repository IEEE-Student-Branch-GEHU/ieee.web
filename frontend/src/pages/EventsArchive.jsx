import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar, Search } from 'lucide-react';
import { motion } from "framer-motion";
import { Reveal } from "../components/animations/Reveal";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import API_BASE_URL from '../config';

const EventsArchive = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const categories = ['All', 'Technical', 'Non-Technical', 'Workshop', 'Social'];
    const itemsPerPage = 6; // Reduced for better testing and visibility

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
                if (data.totalPages) setTotalPages(data.totalPages);
            } else if (Array.isArray(data)) {
                setEvents(data);
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch events:', err);
            setError('Failed to load events. Please check your connection.');
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Events are now pre-filtered from the server
    const filteredEvents = events;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <div className="bg-mesh min-h-screen">
            <Navbar />
            
            <div className="py-24 bg-gradient-to-b from-white to-gray-50">
                <div className="container mx-auto max-w-[1200px] space-y-12 px-6 xl:px-0">
                    {/* Header */}
                    <div className="flex flex-col items-center space-y-4">
                        <Reveal>
                            <h1 className="text-4xl md:text-5xl font-bold text-center uppercase text-primaryDark tracking-tighter">
                                EVENTS ARCHIVE
                            </h1>
                        </Reveal>
                        <div className="w-24 h-1.5 bg-primary rounded-full" />
                        <p className="text-gray-600 text-center max-w-2xl mt-4">
                            Explore the complete history of IEEE GEHU events, workshops, seminars, and competitions.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto w-full">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary/50 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search events by title or description..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-primary/20 focus:border-primary focus:outline-none transition-colors duration-300 text-sm md:text-base"
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => {
                                    setSelectedCategory(category);
                                    setCurrentPage(1);
                                }}
                                className={`px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                                    selectedCategory === category
                                        ? 'bg-primary text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Events Grid */}
                    {!loading && !error && (
                        <>
                            {filteredEvents.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: "-100px" }}
                                >
                                    {filteredEvents.map((event, index) => (
                                        <motion.div key={index} variants={itemVariants}>
                                            <Card className="h-full shadow-xl rounded-2xl overflow-hidden border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-500 bg-white">
                                                <CardContent className="flex flex-col p-0 gap-6 h-full relative">
                                                    <div className="w-full space-y-5 flex-grow">
                                                        <div className="aspect-[4/3] relative w-full overflow-hidden">
                                                            <img
                                                                src={event.image || "https://via.placeholder.com/400x300"}
                                                                alt={event.title}
                                                                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                                                            />
                                                            <div className="absolute top-4 right-4 bg-primary px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg uppercase tracking-widest">
                                                                {event.category}
                                                            </div>
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-500" />
                                                        </div>

                                                        <div className="px-6 flex flex-col gap-3">
                                                            <h2 className="text-xl font-bold text-dark leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                                                {event.title}
                                                            </h2>

                                                            <div className="flex items-center gap-2 text-primary/80 font-bold text-xs uppercase tracking-wider">
                                                                <Calendar size={14} className="text-primary" />
                                                                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                            </div>

                                                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 font-medium">
                                                                {event.description}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="px-6 pb-6">
                                                        <Button
                                                            className="font-bold w-full bg-primary/10 text-primary border-2 border-primary/20 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 py-6"
                                                        >
                                                            Learn More
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 text-lg">No events found matching your search criteria.</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {filteredEvents.length > 0 && totalPages > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-12">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 rounded-lg border-2 border-primary/20 text-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all duration-300"
                                    >
                                        Previous
                                    </button>

                                    <div className="flex gap-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-10 h-10 rounded-lg font-semibold transition-all duration-300 ${
                                                    currentPage === page
                                                        ? 'bg-primary text-white shadow-lg'
                                                        : 'border-2 border-primary/20 text-primary hover:bg-primary/10'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 rounded-lg border-2 border-primary/20 text-primary font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all duration-300"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default EventsArchive;
