import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

// Assets
import JoinUsImage from "../assets/join-us.png"; // Corrected filename

const ShapeFuture = () => {
    // Fallback image if asset usually not present
    const imageSrc = JoinUsImage || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1742&auto=format&fit=crop";

    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto max-w-[1170px] px-5 xl:px-0">
                <div className="flex md:flex-row flex-col md:justify-start justify-center gap-16 items-center lg:items-start">
                    <div className="w-full md:w-1/2 relative">
                        <img
                            src={imageSrc}
                            alt="Join IEEE"
                            className="w-full h-auto rounded-tr-[80px] rounded-br-[80px] shadow-xl object-cover"
                        />
                    </div>

                    <div className="space-y-6 max-w-[520px] md:w-1/2 md:pt-10">
                        <h3 className="text-2xl md:text-4xl font-bold uppercase text-dark leading-tight">
                            SHAPE THE FUTURE <span className="text-primary">WITH US</span>
                        </h3>

                        <p className="font-medium text-gray-600 text-lg leading-relaxed">
                            Creating isn’t just what we do; it’s how we think. We’re a community
                            of creators, problem-solvers, and innovators, all eager to explore
                            new ideas together. Ready to make your mark with us?
                        </p>

                        <Link to="/#contact">
                            <Button className="font-bold min-w-[150px] bg-primary text-white hover:bg-primaryDark transition-all duration-300 shadow-md hover:shadow-lg mt-4 text-lg py-6">
                                JOIN US
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ShapeFuture;
