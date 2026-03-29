import React, { useState, useEffect } from "react";
import { Card, CardDescription, CardTitle } from "./ui/card";
import { BsLinkedin } from "react-icons/bs";

import { motion } from "framer-motion";
import { Reveal } from "./animations/Reveal";
import API_BASE_URL from "../config";

const FacultyCounselor = () => {
    const [counselors, setCounselors] = useState([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/team`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const filtered = data.filter(m =>
                        m.role.toLowerCase().includes('counselor')
                    );
                    setCounselors(filtered);
                }
            })
            .catch(err => console.error('Failed to fetch counselor data:', err));
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    if (counselors.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1200px] space-y-16">
                <div className="flex flex-col items-center">
                    <Reveal>
                        <h3 className="text-4xl md:text-5xl font-bold text-center uppercase text-primaryDark tracking-tight mb-4">
                            Student Branch Counselor
                        </h3>
                    </Reveal>
                    <div className="w-24 h-1.5 bg-primary rounded-full" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-wrap justify-center gap-10"
                >
                    {counselors.map((counsellor, index) => (
                        <motion.div key={index} variants={itemVariants} className="w-full max-w-[350px]">
                            <Card
                                className="group flex flex-col items-center bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden p-2"
                            >
                                <div className="aspect-square w-full relative rounded-[2rem] overflow-hidden">
                                    <img
                                        src={counsellor.image || "https://via.placeholder.com/400x400"}
                                        alt={counsellor.name}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                <div className="text-center p-8 space-y-3 flex-grow">
                                    <h4 className="text-2xl font-bold text-dark group-hover:text-primary transition-colors">
                                        {counsellor.name}
                                    </h4>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed italic line-clamp-3">
                                        "{counsellor.bio}"
                                    </p>
                                </div>

                                {counsellor.linkedin && (
                                    <div className="pb-8">
                                        <a
                                            href={counsellor.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                                        >
                                            <BsLinkedin className="text-xl" />
                                        </a>
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FacultyCounselor;
