import { motion } from 'framer-motion';
import { Send, Phone, MapPin, Mail } from 'lucide-react';

const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <span className="text-secondary font-bold tracking-wider uppercase text-sm">Get in Touch</span>
                    <h2 className="text-4xl font-bold mt-2 text-dark font-sans">Contact Us</h2>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Have questions about membership, events, or collaboration? We'd love to hear from you.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">

                    {/* Contact Info */}
                    <div className="lg:w-1/3 space-y-8">
                        <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100">
                            <h3 className="text-xl font-bold mb-6 text-dark">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white text-primary rounded-xl shadow-sm">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-dark text-sm uppercase tracking-wide mb-1">Visit Us</h4>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            Graphic Era Hill University,<br />
                                            Clement Town, Dehradun,<br />
                                            Uttarakhand 248002
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white text-primary rounded-xl shadow-sm">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-dark text-sm uppercase tracking-wide mb-1">Email Us</h4>
                                        <p className="text-gray-600 text-sm">ieee@gehu.ac.in</p>
                                        <p className="text-gray-600 text-sm">contact@ieee-gehu.org</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-white text-primary rounded-xl shadow-sm">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-dark text-sm uppercase tracking-wide mb-1">Call Us</h4>
                                        <p className="text-gray-600 text-sm">+91 123 456 7890</p>
                                        <p className="text-gray-600 text-sm">Mon - Fri, 9am - 5pm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:w-2/3">
                        <form className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                    <input type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                <input type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all" placeholder="john@example.com" />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea rows={4} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                            </div>

                            <button className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                Send Message
                                <Send size={18} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default Contact;
