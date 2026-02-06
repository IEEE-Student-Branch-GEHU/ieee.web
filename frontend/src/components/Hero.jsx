import React, { useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "./ui/carousel";

// Assets (Using placeholders/assets that were copied)
// Assets (Using placeholders for now)
// import allExcom from "../assets/hero-images/full-excom.jpg"; // Removed as it does not exist

const Hero = () => {
    const plugin = useRef(
        Autoplay({ delay: 5000, stopOnInteraction: false })
    );

    // Fallback data if images are missing
    const cimages = [
        {
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82cd33d?q=80&w=1920&auto=format&fit=crop",
            text: "Discover a community where ideas meet innovation.",
        },
        {
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1920&auto=format&fit=crop",
            text: "Empowering students to shape the future.",
        },
        {
            image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1920&auto=format&fit=crop",
            text: "Pushing boundaries, embracing challenges.",
        },
    ];

    const gradient = "from-primaryLight via-primaryLight"; // Start color for gradient overlay
    const title = "Welcome to IEEE Student Branch of GEHU";

    return (
        <Carousel plugins={[plugin.current]} className="w-full">
            <CarouselContent className="h-full">
                {cimages.map((item, index) => (
                    <CarouselItem
                        key={index}
                        className="relative h-[60vh] md:h-screen w-full"
                    >
                        <div className="w-full h-full relative">
                            <img
                                src={item.image}
                                alt={`carousel image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Gradient Overlay */}
                            <div
                                className={`absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-primaryDark/90 to-transparent flex flex-col justify-end pb-12 transition-all duration-300`}
                            >
                                <div className="container mx-auto px-6 text-center">
                                    <h1 className="font-bold text-white text-3xl md:text-5xl lg:text-6xl mb-4 drop-shadow-lg font-sans">
                                        {title}
                                    </h1>
                                    <p className="text-white/90 text-sm md:text-lg max-w-3xl mx-auto font-light tracking-wide">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
};

export default Hero;
