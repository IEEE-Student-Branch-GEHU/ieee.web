'use client';

import { motion as Motion } from "framer-motion";
import { Reveal } from "./animations/Reveal.jsx";
import { FaEye } from "react-icons/fa";
import { TbTargetArrow } from "react-icons/tb";


const VisionMission = () => {
    const values = [
        {
            title: "Our Mission",
            description: "To advise the community on ethics policy and concerns, fostering awareness on ethical issues within the technology sector.",
            icon: <TbTargetArrow className="site-accent w-10 h-10" />,
            color: "primary",
            delay: 0.1
        },
        {
            title: "Our Vision",
            description: "A world where engineers and scientists are respected for exemplary ethical behavior, driven by standard of innovation rooted in integrity.",
            icon: <FaEye className="text-secondary w-10 h-10" />,
            color: "secondary",
            delay: 0.2
        }
    ];

    return (
        <section id="about" className="public-section py-24 relative overflow-hidden bg-white/30">
            {/* Background Accent */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 items-center">
                    {/* Content Left */}
                    <div className="lg:w-1/2 space-y-8">
                        <Reveal>
                            <span className="site-accent font-black tracking-[0.3em] uppercase text-[10px] block">Corporate Philosophy</span>
                        </Reveal>
                        <Reveal>
                            <h2 className="public-heading text-4xl md:text-6xl font-black leading-[1.1] tracking-tight">
                                Engineering a <br />
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Transparent Future.</span>
                            </h2>
                        </Reveal>
                        <Reveal>
                            <p className="public-body text-lg font-medium leading-relaxed max-w-xl">
                                We believe that true innovation is only possible when built on a foundation of integrity and responsibility. Our goal is to empower the next generation of technologists.
                            </p>
                        </Reveal>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div>
                                <h4 className="public-heading text-3xl font-black">500+</h4>
                                <p className="public-subtle text-xs font-bold uppercase tracking-widest mt-1">Active Members</p>
                            </div>
                            <div>
                                <h4 className="public-heading text-3xl font-black">50+</h4>
                                <p className="public-subtle text-xs font-bold uppercase tracking-widest mt-1">Annual Events</p>
                            </div>
                        </div>
                    </div>

                    {/* Cards Right */}
                    <div className="lg:w-1/2 grid grid-cols-1 gap-8">
                        {values.map((val, i) => (
                            <Motion.div
                                key={i}
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: val.delay, duration: 0.8 }}
                                viewport={{ once: true }}
                                className="public-card group relative p-10 rounded-[3rem] border shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${val.color}/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`} />

                                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                                    <div className="public-icon-surface p-5 rounded-3xl group-hover:bg-white group-hover:shadow-xl transition-all duration-500">
                                        {val.icon}
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="public-heading text-2xl font-black tracking-tight">{val.title}</h3>
                                        <p className="public-body font-medium leading-relaxed">{val.description}</p>
                                    </div>
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VisionMission;
