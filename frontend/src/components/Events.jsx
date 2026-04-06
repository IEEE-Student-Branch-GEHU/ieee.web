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

const Events = () => {
    const [eventsData, setEventsData] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/events?onLandingPage=true`)
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.events)) {
                    setEventsData(data.events);
                }
            })
            .catch(err => console.error('Failed to fetch events:', err));
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
            <div className="container mx-auto max-w-[1200px] space-y-12 px-6 xl:px-0">
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
                        <CarouselContent className="-ml-6">
                            {eventsData.map((event, index) => (
                                <CarouselItem
                                    key={index}
                                    className="pl-6 md:basis-1/2 lg:basis-1/3"
                                >
                                    <motion.div variants={itemVariants}>
                                        <Card className="h-[34rem] shadow-xl rounded-2xl overflow-hidden border border-gray-100 flex flex-col group hover:shadow-2xl transition-all duration-500 bg-white">
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
                                                        <h2 className="text-2xl font-bold text-dark leading-tight group-hover:text-primary transition-colors duration-300">
                                                            {event.title}
                                                        </h2>

                                                        <div className="flex items-center gap-2 text-primary/80 font-bold text-xs uppercase tracking-wider">
                                                            <Calendar size={14} className="text-primary" />
                                                            <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>

                                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 font-medium">
                                                            {event.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="px-6 pb-6">
                                                    <a href="#about" className="block w-full">
                                                        <Button
                                                            className="font-bold w-full bg-primary/10 text-primary border-2 border-primary/20 rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 py-6"
                                                        >
                                                            Discover More
                                                        </Button>
                                                    </a>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </CarouselItem>
                            ))}
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
