import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Reveal } from "./animations/Reveal";
import MemberCard from "./ui/MemberCard";
import API_BASE_URL from '../config';
import { Skeleton } from './ui/skeleton';

const ExecTeam = () => {
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fallbackTeam = [
        { name: "Placeholder Name", role: "Chairperson", category: "Executive" },
        { name: "Placeholder Name", role: "Vice-Chair", category: "Executive" },
        { name: "Placeholder Name", role: "Secretary", category: "Executive" },
        { name: "Placeholder Name", role: "Webmaster", category: "Executive" },
    ];

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/team?onLandingPage=true`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const filtered = data.filter(m =>
                        !m.role.toLowerCase().includes('counselor') &&
                        m.category?.toLowerCase() !== 'faculty'
                    );
                    setTeamData(filtered);
                } else {
                    setTeamData(fallbackTeam);
                }
            })
            .catch(err => {
                console.error('Failed to fetch team data:', err);
                setTeamData(fallbackTeam);
            })
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

    return (
        <section id="team" className="py-24 bg-mesh">
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
                        <MemberCard key={index} member={member} />
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
