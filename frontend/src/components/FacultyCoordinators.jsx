'use client';

import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { BsLinkedin } from "react-icons/bs";
import { motion as Motion } from "framer-motion";
import { Reveal } from "./animations/Reveal";
import { fetchHomepageJson, normalizeTeamResponse } from "../lib/homepage-api";
import { getMemberProfilePath } from "../lib/public-site";

const FacultyCoordinators = () => {
    const [coordinators, setCoordinators] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        fetchHomepageJson('/team', { signal: controller.signal })
            .then(data => setCoordinators(normalizeTeamResponse(data).filter(member => member.category === 'faculty')))
            .catch(err => {
                if (err.name === 'AbortError') return;
                console.error('Failed to fetch coordinator data:', err);
            });

        return () => controller.abort();
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

    return (
        <section className="public-section-muted py-24 overflow-hidden">
            <div className="container mx-auto px-6 max-w-[1200px] space-y-16">
                <div className="flex flex-col items-center text-center">
                    <Reveal>
                        <h3 className="public-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
                            Faculty Coordinators
                        </h3>
                    </Reveal>
                    <div className="w-24 h-1.5 bg-primary rounded-full mb-6" />
                    <Reveal>
                        <p className="public-body max-w-2xl font-medium leading-relaxed">
                            Our dedicated faculty members who guide and support the student branch initiatives with technical expertise and leadership.
                        </p>
                    </Reveal>
                </div>

                <Motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-wrap justify-center gap-10"
                >
                    {coordinators.map((coordinator, index) => (
                        <Motion.div key={coordinator._id || index} variants={itemVariants} className="w-full max-w-[350px]">
                            <Card
                                 className="public-card group flex flex-col items-center border shadow-sm hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden p-2"
                            >
                                <div className="public-image-placeholder aspect-square w-full relative rounded-[2rem] overflow-hidden">
                                    <img
                                        src={coordinator.image || "https://via.placeholder.com/400x400"}
                                        alt={coordinator.name}
                                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                <div className="text-center p-8 space-y-3 flex-grow">
                                      <h4 className="public-heading text-2xl font-bold group-hover:text-primary transition-colors">
                                         <a href={getMemberProfilePath(coordinator._id)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary">{coordinator.name}</a>
                                    </h4>
                                    <p className="site-accent font-bold text-xs uppercase tracking-widest">
                                        {coordinator.role}
                                    </p>
                                    {coordinator.bio && (
                                         <p className="public-body text-sm font-medium leading-relaxed italic line-clamp-3">
                                            "{coordinator.bio}"
                                        </p>
                                    )}
                                </div>

                                {coordinator.linkedin && (
                                    <div className="pb-8">
                                        <a
                                            href={coordinator.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                              aria-label={`${coordinator.name} on LinkedIn`}
                                              className="site-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 shadow-sm transition-all hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
                                         >
                                             <BsLinkedin aria-hidden="true" className="text-xl" />
                                        </a>
                                    </div>
                                )}
                            </Card>
                        </Motion.div>
                    ))}
                </Motion.div>
            </div>
        </section >
    );
};

export default FacultyCoordinators;
