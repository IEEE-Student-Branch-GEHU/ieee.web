'use client';

import React, { useMemo } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "./ui/carousel";
import { Button } from "./ui/button";

// Assets (Using placeholders/assets that were copied)
// Assets (Using placeholders for now)
// import allExcom from "../assets/hero-images/full-excom.jpg"; // Removed as it does not exist

import { motion as Motion, useReducedMotion } from "framer-motion";

const Hero = () => {
    const prefersReducedMotion = useReducedMotion();
    const autoplay = useMemo(
        () => (prefersReducedMotion ? null : Autoplay({ delay: 6000, stopOnInteraction: false })),
        [prefersReducedMotion]
    );

    const cimages = [
        {
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82cd33d?q=80&w=1920&auto=format&fit=crop",
            text: "Discover a community where ideas meet innovation.",
            subheading: "Technical Events & Workshops",
        },
        {
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop",
            text: "Empowering students to shape the future.",
            subheading: "Research & Innovation",
        },
        {
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1920&auto=format&fit=crop",
            text: "Pushing boundaries, embracing challenges.",
            subheading: "Community & Networking",
        },
    ];

    const tagline = "A community of innovators, researchers, and leaders at GEHU Dehradun.";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 12 },
        },
    };

    return (
        <Carousel aria-label="IEEE GEHU highlights" plugins={autoplay ? [autoplay] : undefined} className="w-full">
            <CarouselContent className="h-full">
                {cimages.map((item, index) => (
                    <CarouselItem
                        key={index}
                        className="relative min-h-[65dvh] w-full overflow-hidden md:min-h-[100dvh]"
                    >
                        <div className="w-full h-full relative">
                            <Motion.img
                                initial={{ scale: 1.1 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 10, ease: "linear" }}
                                src={item.image}
                                alt={`carousel image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />

                            <div className="absolute inset-0 bg-black/40 z-10" />

                            <div
                                className={`absolute inset-0 flex flex-col justify-center items-center z-20`}
                            >
                                <Motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false }}
                                    className="container mx-auto max-w-5xl px-4 text-center sm:px-6"
                                >
                                    <Motion.h1
                                        variants={itemVariants}
                                         className="mb-4 font-bold tracking-tight text-white drop-shadow-2xl font-sans text-[clamp(2rem,8vw,4.5rem)]"
                                    >
                                        {item.subheading}
                                    </Motion.h1>

                                    <Motion.p
                                        variants={itemVariants}
                                         className="mx-auto mb-10 max-w-2xl text-sm font-medium italic leading-relaxed tracking-wide text-white/90 sm:text-lg"
                                    >
                                        {tagline}
                                    </Motion.p>

                                    <Motion.div
                                        variants={itemVariants}
                                         className="pointer-events-auto mt-6 flex flex-col justify-center gap-4 sm:flex-row sm:gap-6"
                                    >
                                        <Button asChild size="lg" className="bg-primary hover:bg-primaryDark text-white font-bold px-10 py-7 rounded-full shadow-2xl w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
                                            <a href="#contact">
                                                Become a Member
                                            </a>
                                        </Button>
                                        <Button asChild size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white hover:text-primary font-bold px-10 py-7 rounded-full shadow-2xl w-full sm:w-auto transition-all hover:scale-105 active:scale-95">
                                            <a href="#events">
                                                Upcoming Events
                                            </a>
                                        </Button>
                                    </Motion.div>
                                </Motion.div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
};

export default Hero;
