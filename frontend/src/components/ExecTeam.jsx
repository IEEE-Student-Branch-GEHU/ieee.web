import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Reveal } from "./animations/Reveal";
import { BsInstagram, BsLinkedin } from "react-icons/bs";
import API_BASE_URL from '../config';

const ExecTeam = () => {
    const [teamData, setTeamData] = useState([]);

    const fallbackTeam = [
        { name: "Placeholder Name", role: "Chairperson" },
        { name: "Placeholder Name", role: "Vice-Chair" },
        { name: "Placeholder Name", role: "Secretary" },
        { name: "Placeholder Name", role: "Webmaster" },
    ];

    useEffect(() => {
        fetch(`${API_BASE_URL}/team?onLandingPage=true`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setTeamData(data);
                } else {
                    setTeamData(fallbackTeam);
                }
            })
            .catch(err => {
                console.error('Failed to fetch team data:', err);
                setTeamData(fallbackTeam);
            });
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
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 80, damping: 12 }
        }
    };

    return (
        <section id="team" className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-6 max-w-[1200px]">
                <div className="flex flex-col items-center mb-16">
                    <Reveal>
                        <h3 className="text-4xl md:text-5xl font-bold text-center uppercase text-primaryDark tracking-tight mb-4">
                            Executive Committee
                        </h3>
                    </Reveal>
                    <div className="w-24 h-1.5 bg-primary rounded-full" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10"
                >
                    {teamData.map((member, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card
                                className="group h-full flex flex-col items-center bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden"
                            >
                                <div className="aspect-[4/5] w-full relative overflow-hidden bg-gray-200">
                                    <img
                                        src={member.image || "https://via.placeholder.com/400x500"}
                                        alt={member.name}
                                        className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 ease-in-out"
                                    />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                        <a
                                            href={member.socials?.linkedin || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                                        >
                                            <BsLinkedin className="text-lg" />
                                        </a>
                                        <a
                                            href={member.socials?.instagram || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                                        >
                                            <BsInstagram className="text-lg" />
                                        </a>
                                    </div>
                                </div>

                                <div className="text-center p-8 space-y-2 flex-grow">
                                    <h4 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
                                        {member.name}
                                    </h4>
                                    <p className="text-primary/70 font-bold text-xs uppercase tracking-widest">{member.role}</p>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="flex justify-center mt-16">
                    <Button
                        asChild
                        className="px-10 py-7 bg-primaryDark/5 text-primaryDark border-2 border-primaryDark/10 rounded-2xl hover:bg-primaryDark hover:text-white hover:border-primaryDark transition-all duration-300 font-bold tracking-widest text-sm shadow-sm"
                    >
                        <Link to="/leadership">
                            VIEW FULL TEAM
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default ExecTeam;
