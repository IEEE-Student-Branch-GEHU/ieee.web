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

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Reveal } from "./animations/Reveal";
import API_BASE_URL from '../config';
import { Skeleton } from './ui/skeleton';

const Events = () => {
    const [eventsData, setEventsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/events?onLandingPage=true`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.events)) {
                    setEventsData(data.events);
                }
            })
            .catch(err => console.error('Failed to fetch events:', err))
            .finally(() => setLoading(false));
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
        <section id="events" className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
            <div className="container mx-auto max-w-[1200px] space-y-12 px-6">
                <div className="flex flex-col items-center">
                    <Reveal>
                        <h3 className="text-4xl md:text-5xl font-bold text-center uppercase text-primaryDark tracking-tighter mb-4">
                            LATEST EVENTS
                        </h3>
                    </Reveal>
                    <div className="w-24 h-1.5 bg-primary rounded-full" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-12"
                >
                    <Carousel className="w-full">
                        <CarouselContent className="-ml-2 md:-ml-4 py-8">
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <CarouselItem key={i} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <Card className="overflow-hidden border-none shadow-xl bg-white h-[400px]">
                                                <Skeleton className="w-full h-48 rounded-none" />
                                                <CardContent className="p-6 space-y-4">
                                                    <Skeleton className="h-6 w-20 rounded-full" />
                                                    <Skeleton className="h-8 w-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-3/4" />
                                                        <Skeleton className="h-4 w-1/2" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))
                            ) : (
                                eventsData.map((event, index) => (
                                    <CarouselItem key={event._id || index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                        <Reveal delay={index * 0.1}>
                                            <div className="p-1 group">
                                                <Link to="/events">
                                                    <Card className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white group-hover:-translate-y-2 h-[400px]">
                                                        <div className="relative h-48 overflow-hidden">
                                                            <img
                                                                src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80"}
                                                                alt={event.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                            <div className="absolute top-4 left-4">
                                                                <span className="px-4 py-1.5 bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                                                                    {event.category}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <CardContent className="p-6">
                                                            <div className="flex items-center gap-4 text-xs font-semibold text-primary mb-3">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar size={14} />
                                                                    {event.date}
                                                                </div>
                                                                {event.location && (
                                                                    <div className="flex items-center gap-1">
                                                                        <MapPin size={14} />
                                                                        {event.location}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-tight">
                                                                {event.title}
                                                            </h3>

                                                            <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                                                                {event.description}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            </div>
                                        </Reveal>
                                    </CarouselItem>
                                ))
                            )}
                        </CarouselContent>

                        <div className="hidden xl:block">
                            <CarouselPrevious className="left-[-60px] bg-white border-2 border-primary/20 text-primary hover:bg-primary hover:text-white h-12 w-12" />
                            <CarouselNext className="right-[-60px] bg-white border-2 border-primary/20 text-primary hover:bg-primary hover:text-white h-12 w-12" />
                        </div>
                    </Carousel>

                    <div className="flex justify-center pt-8">
                        <Link to="/events">
                            <Button
                                className="group px-10 py-7 bg-primary text-white font-bold rounded-2xl hover:bg-primaryDark transition-all duration-300 shadow-xl shadow-primary/20 flex items-center gap-3 uppercase tracking-widest text-xs"
                            >
                                View All Events
                                <motion.span
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                >
                                    →
                                </motion.span>
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Events;
