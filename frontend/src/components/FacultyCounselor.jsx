import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const FacultyCounselor = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    {/* Image Side */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="md:w-1/3 relative"
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Faculty Counselor"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        {/* Decor elements */}
                        <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-primary/20 rounded-2xl z-0"></div>
                        <div className="absolute -top-6 -left-6 w-24 h-24 bg-dots-pattern opacity-20"></div>
                    </motion.div>

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="md:w-2/3"
                    >
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-2 block">Faculty Counselor</span>
                        <h2 className="text-4xl font-bold text-dark mb-6">Message from the Desk</h2>

                        <div className="relative">
                            <Quote className="absolute -top-6 -left-4 text-primary/10 w-20 h-20 rotate-180" />
                            <blockquote className="relative z-10 text-xl md:text-2xl text-gray-600 leading-relaxed italic mb-8">
                                "Our mission at the IEEE Student Branch is to empower students with the technical skills and professional network they need to succeed in the rapidly evolving world of technology. We believe in learning by doing, and our events are designed to be hands-on, collaborative, and impactful."
                            </blockquote>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-dark">Dr. Anamika Sharma</h3>
                            <p className="text-primary font-medium">Faculty Counselor, IEEE SB GEHU</p>
                            <p className="text-gray-500 text-sm mt-1">Associate Professor, Dept. of Computer Science</p>
                        </div>

                        <div className="mt-8">
                            <button className="px-6 py-3 border border-gray-300 rounded-full text-dark hover:border-primary hover:text-primary transition-colors font-medium">
                                View Branch History
                            </button>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default FacultyCounselor;
