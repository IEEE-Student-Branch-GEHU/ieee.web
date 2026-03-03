import { motion } from "framer-motion";
import { Reveal } from "./animations/Reveal";
import { ArrowRight } from "lucide-react";

const ShapeFuture = () => {
    const imageSrc = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1742&auto=format&fit=crop";

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[140px] -z-10 -translate-y-1/2" />

            <div className="container mx-auto px-6">
                <div className="bg-primaryDark rounded-[4rem] overflow-hidden relative group">
                    {/* Animated Background Mesh */}
                    <div className="absolute inset-0 bg-mesh-dark opacity-40" />
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[160px] -mr-1/4 -mt-1/4 group-hover:bg-primary/30 transition-colors duration-1000" />

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 p-12 lg:p-24">
                        <div className="lg:w-1/2 space-y-8">
                            <Reveal>
                                <span className="text-secondary font-black tracking-[0.4em] uppercase text-[10px] block">Join the movement</span>
                            </Reveal>
                            <Reveal>
                                <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1] tracking-tight">
                                    Shape the Future <br />
                                    <span className="text-secondary">with IEEE.</span>
                                </h2>
                            </Reveal>
                            <Reveal>
                                <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-xl">
                                    Creating isn’t just what we do; it’s how we think. We’re a community
                                    of global innovators eager to explore new frontiers together.
                                    Are you ready to leave your mark?
                                </p>
                            </Reveal>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap gap-6 pt-4"
                            >
                                <a
                                    href="#contact"
                                    className="px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all"
                                >
                                    Join Our Branch <ArrowRight size={20} />
                                </a>
                                <a
                                    href="https://www.ieee.org"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-10 py-5 glass-dark text-white rounded-[2rem] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    IEEE Global
                                </a>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/10">
                                <img
                                    src={imageSrc}
                                    alt="Collaborative Innovation"
                                    className="w-full h-[400px] object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/80 via-transparent to-transparent" />
                            </div>

                            {/* Floating Stats Card */}
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -bottom-10 -left-10 glass-dark p-8 rounded-[2rem] border border-white/10 hidden md:block z-20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-xl">
                                        ⚡
                                    </div>
                                    <div>
                                        <h4 className="text-white font-black text-xl tracking-tight">Active Tech</h4>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Innovation Hub</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};


export default ShapeFuture;
