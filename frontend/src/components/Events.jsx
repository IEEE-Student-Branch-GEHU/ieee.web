'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "./ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { Calendar, MapPin } from 'lucide-react';

import { motion as Motion } from "framer-motion";
import { Reveal } from "./animations/Reveal";
import { fetchHomepageJson, normalizeEventsResponse } from '../lib/homepage-api';
import EventHighlights from './EventHighlights';

const Events = () => {
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        fetchHomepageJson('/events?limit=12&onLandingPage=true', { signal: controller.signal })
            .then(data => setEventsData(normalizeEventsResponse(data)))
            .catch(err => {
                if (err.name === 'AbortError') return;
                console.error('Failed to fetch events:', err);
                setError('Unable to load events right now.');
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <section id="events" className="public-section py-24 overflow-hidden">
            <div className="container mx-auto max-w-[1200px] space-y-12 px-6 xl:px-0">
                <div className="flex flex-col items-center">
                    <Reveal>
                        <h3 className="public-heading text-4xl md:text-5xl font-bold text-center uppercase tracking-tighter mb-4">
                            LATEST EVENTS
                        </h3>
                    </Reveal>
                    <div className="w-24 h-1.5 bg-primary rounded-full" />
                </div>

                <Motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {loading ? (
                        <p className="public-body py-12 text-center">Loading events...</p>
                    ) : error ? (
                        <p role="alert" className="public-body py-12 text-center">{error}</p>
                    ) : eventsData.length === 0 ? (
                        <p className="public-body py-12 text-center">No events available yet.</p>
                    ) : (
                        <Carousel className="w-full">
                            <CarouselContent className="-ml-6">
                                {eventsData.map((event, index) => (
                                <CarouselItem
                                    key={index}
                                    className="pl-6 md:basis-1/2 lg:basis-1/3"
                                >
                                    <Motion.div variants={itemVariants}>
                                        <Card className="public-card h-[34rem] shadow-xl rounded-2xl overflow-hidden border flex flex-col group hover:shadow-2xl transition-all duration-500">
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
                                                         <h2 className="public-heading text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                                                            {event.title}
                                                        </h2>

                                                         <div className="site-accent-muted flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                                                             <Calendar size={14} className="site-accent" />
                                                            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>

                                                         <p className="public-body text-sm leading-relaxed line-clamp-4 font-medium">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="px-6 pb-6">
                                                    <Button type="button" aria-label={`View highlights for ${event.title}`} aria-haspopup="dialog" onClick={() => setSelectedEvent(event)}
                                                     className="public-event-action site-accent font-bold w-full bg-primary/10 border-2 border-primary/20 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 py-6"
                                                    >
                                                        View Highlights
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Motion.div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>

                            <div className="hidden xl:block">
                                 <CarouselPrevious className="public-control left-[-60px] border-2 border-primary/20 text-primary hover:bg-primary hover:text-white h-12 w-12" />
                                 <CarouselNext className="public-control right-[-60px] border-2 border-primary/20 text-primary hover:bg-primary hover:text-white h-12 w-12" />
                            </div>
                        </Carousel>
                    )}
                </Motion.div>
            </div>
            {selectedEvent && <EventHighlights key={selectedEvent._id || selectedEvent.id || selectedEvent.title} event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
        </section>
    );
};

export default Events;
