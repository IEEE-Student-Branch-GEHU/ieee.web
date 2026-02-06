import { motion } from 'framer-motion';
import { Target, Lightbulb, Users } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-24 bg-light relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    <div className="md:w-1/2">
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm">About Us</span>
                        <h2 className="text-4xl font-bold mt-2 mb-6 text-dark font-sans">Empowering Innovation Since 2011</h2>
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            The IEEE Student Branch at Graphic Era Hill University is a vibrant community of tech enthusiasts, innovators, and future leaders. We bridge the gap between academic theory and industry practice through hands-on workshops, seminars, and collaborative projects.
                        </p>
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Our mission is to foster technical excellence and professional growth among students, preparing them to solve real-world challenges with technology.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <Target className="text-primary mb-4" size={32} />
                                <h3 className="font-bold text-lg mb-2">Our Mission</h3>
                                <p className="text-gray-500 text-sm">To advance technology for humanity through innovation and collaboration.</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <Lightbulb className="text-secondary mb-4" size={32} />
                                <h3 className="font-bold text-lg mb-2">Our Vision</h3>
                                <p className="text-gray-500 text-sm">To be a leading student chapter globally recognized for technical excellence.</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-1/2 relative">
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6 }}
                                className="space-y-4 pt-12"
                            >
                                <img src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Collaboration" className="rounded-2xl shadow-lg w-full h-48 object-cover" />
                                <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Teamwork" className="rounded-2xl shadow-lg w-full h-64 object-cover" />
                            </motion.div>
                            <motion.div
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="space-y-4"
                            >
                                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Workshop" className="rounded-2xl shadow-lg w-full h-64 object-cover" />
                                <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Conference" className="rounded-2xl shadow-lg w-full h-48 object-cover" />
                            </motion.div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default About;
