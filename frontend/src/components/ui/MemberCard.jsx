import { motion, useReducedMotion } from "framer-motion";
import { BsInstagram, BsLinkedin, BsGithub, BsTwitterX } from "react-icons/bs";
import { cn } from "../../lib/utils";

const MemberCard = ({ member, className }) => {
    const shouldReduceMotion = useReducedMotion();

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
            }
        },
        hover: {
            y: -10,
            transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
            }
        }
    };

    const imageVariants = {
        idle: { 
            filter: "grayscale(100%)",
            scale: 1,
            transition: { duration: 0.5 }
        },
        hover: { 
            filter: "grayscale(0%)",
            scale: 1.05,
            transition: { duration: 0.5 }
        }
    };

    const socialContainerVariants = {
        hover: {
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        }
    };

    const socialItemVariants = {
        idle: { opacity: 0, y: 20, clipPath: "inset(100% 0% 0% 0%)" },
        hover: { 
            opacity: 1, 
            y: 0, 
            clipPath: "inset(0% 0% 0% 0%)",
            transition: { type: "spring", stiffness: 300, damping: 20 }
        }
    };

    const socials = [
        { icon: <BsLinkedin />, href: member.socials?.linkedin, label: "LinkedIn" },
        { icon: <BsGithub />, href: member.socials?.github, label: "GitHub" },
        { icon: <BsInstagram />, href: member.socials?.instagram, label: "Instagram" },
        { icon: <BsTwitterX />, href: member.socials?.twitter, label: "Twitter" }
    ].filter(s => s.href);

    return (
        <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true, margin: "-50px" }}
            className={cn(
                "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A1128]/80 backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_0_30px_rgba(0,98,155,0.4)]",
                className
            )}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden">
                <motion.img
                    src={member.image || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=800&auto=format&fit=crop"}
                    alt={member.name}
                    variants={imageVariants}
                    animate="idle"
                    whileHover="hover"
                    className="h-full w-full object-cover"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1128] via-transparent to-transparent opacity-60" />

                {/* Social Icons - Staggered Slide Up */}
                <motion.div 
                    variants={socialContainerVariants}
                    className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4"
                >
                    {socials.map((social, idx) => (
                        <motion.a
                            key={idx}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            variants={socialItemVariants}
                            whileHover={{ scale: 1.1, backgroundColor: "var(--color-primary)" }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors"
                            aria-label={social.label}
                        >
                            {social.icon}
                        </motion.a>
                    ))}
                </motion.div>
            </div>

            {/* Content Area */}
            <div className="p-6 text-center">
                <motion.h4 
                    className="text-xl font-bold tracking-tight text-white transition-colors group-hover:text-secondary"
                >
                    {member.name}
                </motion.h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {member.role}
                </p>
                
                {/* Subtle Decorative Line */}
                <motion.div 
                    initial={{ width: 0 }}
                    whileHover={{ width: "40%" }}
                    className="mx-auto mt-4 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
                />
            </div>
        </motion.div>
    );
};

export default MemberCard;
