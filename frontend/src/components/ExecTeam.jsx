import { motion } from 'framer-motion';
import { Linkedin, Mail, Twitter } from 'lucide-react';

const team = [
    {
        name: "Dr. Anamika Sharma",
        role: "Faculty Counselor",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Guiding the next generation of tech leaders with 15+ years of experience in AI research."
    },
    {
        name: "Rohan Mehta",
        role: "Chairperson",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Passionate about building communities and bridging the gap between academia and industry."
    },
    {
        name: "Priya Singh",
        role: "Vice-Chair",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Leading technical initiatives and ensuring impactful events for all members."
    },
    {
        name: "Amit Verma",
        role: "Secretary",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        bio: "Organizing seamless operations and documenting our journey towards excellence."
    }
];

const ExecTeam = () => {
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
                    {team.map((member, index) => (
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
