import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Mail, Twitter } from 'lucide-react';

const ExecTeam = () => {
    const [teamData, setTeamData] = React.useState([]);

    React.useEffect(() => {
        fetch('/api/team')
            .then(res => res.json())
            .then(data => setTeamData(data))
            .catch(err => console.error('Failed to fetch team data:', err));
    }, []);

    return (
        <section id="team" className="py-24 bg-light relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-primary font-bold tracking-wider uppercase text-sm bg-blue-50 px-4 py-1.5 rounded-full"
                    >
                        Leadership
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mt-6 text-dark"
                    >
                        Meet the Executive Committee
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        A dedicated team driving innovation and fostering a culture of learning.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {Array.isArray(teamData) && teamData.map((member, index) => (
                        <motion.div
                            key={member.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all group"
                        >
                            <div className="h-64 overflow-hidden relative bg-gray-100">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                />
                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                {/* Social Overlay */}
                                <div className="absolute bottom-4 left-0 w-full flex justify-center gap-4 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                    <a href="#" className="p-2 bg-white text-primary rounded-full hover:bg-primary hover:text-white transition-colors"><Linkedin size={18} /></a>
                                    <a href="#" className="p-2 bg-white text-primary rounded-full hover:bg-primary hover:text-white transition-colors"><Twitter size={18} /></a>
                                    <a href="#" className="p-2 bg-white text-primary rounded-full hover:bg-primary hover:text-white transition-colors"><Mail size={18} /></a>
                                </div>
                            </div>

                            <div className="p-6 text-center">
                                <h3 className="text-xl font-bold text-dark">{member.name}</h3>
                                <p className="text-primary font-medium text-sm mb-4">{member.role}</p>
                                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExecTeam;
