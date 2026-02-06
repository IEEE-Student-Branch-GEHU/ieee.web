import { Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, ExternalLink } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-3xl font-bold font-sans tracking-tight">IEEE</span>
                            <div className="h-8 w-[1px] bg-gray-600"></div>
                            <span className="text-sm font-medium text-gray-400 leading-tight">
                                GEHU<br />Dehradun
                            </span>
                        </div>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Thinking Forward, Moving Forward. We are a community of tech enthusiasts dedicated to advancing technology for humanity.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1"><Linkedin size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1"><Instagram size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1"><Twitter size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1"><Facebook size={18} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Home</a></li>
                            <li><a href="#events" className="text-gray-400 hover:text-white transition-colors">Upcoming Events</a></li>
                            <li><a href="#team" className="text-gray-400 hover:text-white transition-colors">Executive Team</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Membership</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-400">
                                <MapPin size={20} className="text-primary mt-1 shrink-0" />
                                <span>
                                    Graphic Era Hill University,<br />
                                    Clement Town, Dehradun,<br />
                                    Uttarakhand, India 248002
                                </span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail size={20} className="text-primary shrink-0" />
                                <a href="mailto:ieee@gehu.ac.in" className="hover:text-white transition-colors">ieee@gehu.ac.in</a>
                            </li>
                        </ul>
                    </div>

                    {/* vTools & Reports */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Member Resources</h3>
                        <ul className="space-y-4">
                            <li>
                                <a href="https://vtools.ieee.org/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-secondary transition-colors group">
                                    <ExternalLink size={16} />
                                    <span>IEEE vTools</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Branch Reports</a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Constitution</a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">Event Gallery</a>
                            </li>
                        </ul>

                        <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-xs text-gray-500 mb-2">Next Meeting</p>
                            <p className="font-bold text-white">General Body Meeting</p>
                            <p className="text-sm text-primary mt-1">March 01, 2026 • 2:00 PM</p>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} IEEE Student Branch GEHU Dehradun Campus. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
