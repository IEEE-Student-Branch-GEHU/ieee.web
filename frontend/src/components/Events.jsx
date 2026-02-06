import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const events = [
    {
        id: 1,
        title: "AI & Future Tech Summit",
        date: "March 15, 2026",
        location: "Main Auditorium, GEHU",
        category: "Seminar",
        image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Explore the cutting-edge developments in Artificial Intelligence with industry experts."
    },
    {
        id: 2,
        title: "Robotics Workshop",
        date: "April 02, 2026",
        location: "Robotics Lab",
        category: "Workshop",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Hands-on session on building autonomous line-following robots."
    },
    {
        id: 3,
        title: "Hackathon 2026",
        date: "May 20-21, 2026",
        location: "Innovation Hub",
        category: "Competition",
        image: "https://images.unsplash.com/photo-1504384308090-c54be3855463?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "24-hour coding marathon to solve real-world problems. Great prizes to be won!"
    },
    {
        id: 4,
        title: "Cybersecurity Awareness",
        date: "June 10, 2026",
        location: "Virtual (Teams)",
        category: "Webinar",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Learn how to protect yourself and your organization from digital threats."
    },
];

const Events = () => {
    const scrollRef = useRef(null);

    return (
        <section id="events" className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl">
                        <span className="text-secondary font-bold tracking-wider uppercase text-sm">Calendar</span>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2 text-dark">Upcoming Events</h2>
                        <p className="mt-4 text-gray-600 text-lg">
                            Join us for technical workshops, inspiring talks, and competitive hackathons.
                        </p>
                    </div>
                    <button className="group flex items-center gap-2 text-primary font-bold hover:text-secondary transition-colors">
                        View All Events
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </button>
                </div>

                {/* Horizontal Scroll Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0"
                >
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            className="min-w-[300px] md:min-w-[400px] snap-center bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group cursor-pointer"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                        >
                            <div className="h-64 overflow-hidden relative">
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-dark uppercase tracking-wider shadow-sm">
                                        {event.category}
                                    </span>
                                </div>
                                <img
                                    src={event.image}
                                    alt={event.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent opacity-60"></div>
                            </div>

                            <div className="p-8 relative">
                                <div className="flex items-center gap-2 text-secondary font-medium mb-3">
                                    <Calendar size={18} />
                                    <span>{event.date}</span>
                                </div>
                                <h3 className="text-2xl font-bold text-dark mb-3 group-hover:text-primary transition-colors">
                                    {event.title}
                                </h3>
                                <p className="text-gray-600 mb-6 line-clamp-2">
                                    {event.description}
                                </p>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <MapPin size={16} />
                                        {event.location}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Events;
