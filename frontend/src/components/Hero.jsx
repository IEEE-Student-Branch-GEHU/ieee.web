import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Users } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-white via-blue-50 to-white">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                <div className="absolute top-20 right-20 w-96 h-96 bg-primary rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
                <div className="absolute top-40 right-40 w-72 h-72 bg-secondary rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="md:w-1/2 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block px-4 py-2 bg-blue-100 text-primary rounded-full text-sm font-bold mb-6 tracking-wide uppercase">
                                Official Student Branch
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-dark tracking-tight">
                                Advancing Technology <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                    for Humanity.
                                </span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
                                Join a global community of innovators at Graphic Era Hill University.
                                We bridge the gap between theory and practice.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <button className="px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2 group">
                                    Explore Events
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </button>
                                <button className="px-8 py-4 border-2 border-primary text-primary rounded-full font-bold text-lg hover:bg-blue-50 transition-all">
                                    Meet the Team
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="mt-12 flex items-center justify-center md:justify-start gap-8 pt-8 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg text-primary">
                                        <Users size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-2xl font-bold text-dark">500+</p>
                                        <p className="text-sm text-gray-500">Members</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg text-primary">
                                        <Calendar size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-2xl font-bold text-dark">50+</p>
                                        <p className="text-sm text-gray-500">Events/Year</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Visual Content (3D/Illustration Placeholder) */}
                    <motion.div
                        className="md:w-1/2 w-full"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <div className="relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                            {/* Using a placeholder images for now, can be replaced with real event photos */}
                            <img
                                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                                alt="IEEE Workshop"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
