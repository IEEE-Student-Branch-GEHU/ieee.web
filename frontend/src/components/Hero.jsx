import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "./ui/carousel";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

// Assets (Using placeholders/assets that were copied)
// Assets (Using placeholders for now)
// import allExcom from "../assets/hero-images/full-excom.jpg"; // Removed as it does not exist

import { motion, AnimatePresence } from "framer-motion";

const Hero = () => {
    const plugin = useRef(
        Autoplay({ delay: 6000, stopOnInteraction: false })
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
        <Carousel plugins={[plugin.current]} className="w-full">
            <CarouselContent className="h-full">
                {cimages.map((item, index) => (
                    <CarouselItem
                        key={index}
                        className="relative h-[65vh] md:h-screen w-full overflow-hidden"
                    >
                        <div className="w-full h-full relative">
                            <motion.img
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
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false }}
                                    className="container mx-auto px-6 text-center"
                                >
                                    <motion.h1
                                        variants={itemVariants}
                                        className="font-bold text-white text-4xl md:text-6xl lg:text-7xl mb-4 drop-shadow-2xl font-sans tracking-tight"
                                    >
                                        {item.subheading}
                                    </motion.h1>

                                    <motion.p
                                        variants={itemVariants}
                                        className="text-white/90 text-sm md:text-xl max-w-2xl mx-auto font-medium tracking-wide mb-10 leading-relaxed italic"
                                    >
                                        {tagline}
                                    </motion.p>

                                    <motion.div
                                        variants={itemVariants}
                                        className="flex flex-col sm:flex-row justify-center gap-6 mt-6 pointer-events-auto"
                                    >
                                        <a href="#contact">
                                            <Button size="lg" className="bg-primary hover:bg-primaryDark text-white font-bold px-10 py-7 rounded-full shadow-2xl w-full sm:w-auto transition-transform hover:scale-105 active:scale-95">
                                                Become a Member
                                            </Button>
                                        </a>
                                        <a href="#events">
                                            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white hover:text-primary font-bold px-10 py-7 rounded-full shadow-2xl w-full sm:w-auto transition-all hover:scale-105 active:scale-95">
                                                Upcoming Events
                                            </Button>
                                        </a>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
};

export default Hero;
