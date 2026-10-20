'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Send, Phone, MapPin, Mail, Loader2, CheckCircle } from 'lucide-react';

import { Reveal } from './animations/Reveal';
import { fetchHomepageJson } from '../lib/homepage-api';

const Contact = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const resetTimer = useRef(null);

    useEffect(() => () => clearTimeout(resetTimer.current), []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');
        try {
            const data = await fetchHomepageJson('/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (data?.success === false) {
                throw new Error(data.message || 'Unable to submit your message.');
            }

            setSuccessMessage(data.message || 'Your message was received.');
            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
            resetTimer.current = setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage(error.message || 'Unable to submit your message.');
            setStatus('error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <section id="contact" className="public-section py-24 overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center mb-20 text-center">
                    <Reveal>
                        <span className="text-secondary font-black tracking-[0.3em] uppercase text-[10px] mb-4 block">Connect with Us</span>
                    </Reveal>
                    <Reveal>
                        <h2 className="public-heading text-4xl md:text-6xl font-bold mt-2 tracking-tight">Get In Touch</h2>
                    </Reveal>
                    <div className="w-20 h-1.5 bg-primary/20 rounded-full mt-4" />
                </div>

                <Motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="flex flex-col lg:flex-row gap-16 max-w-6xl mx-auto"
                >
                    {/* Contact Info */}
                    <Motion.div variants={itemVariants} className="lg:w-1/3 space-y-10">
                        <div className="public-panel bg-primary/5 p-10 rounded-[3rem] border border-primary/10 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                            <h3 className="public-heading text-2xl font-bold mb-8 tracking-tight">IEEE Headquarters</h3>

                            <div className="space-y-8 relative z-10">
                                <div className="flex items-start gap-5">
                                    <div className="public-icon-surface p-4 text-primary rounded-[1.2rem] shadow-lg shadow-primary/5">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h4 className="public-subtle font-black text-[10px] uppercase tracking-widest mb-1">Location</h4>
                                        <p className="public-heading font-bold text-sm leading-relaxed">
                                            Graphic Era Hill University,<br />
                                            Dehradun, UK 248002
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="public-icon-surface p-4 text-primary rounded-[1.2rem] shadow-lg shadow-primary/5">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h4 className="public-subtle font-black text-[10px] uppercase tracking-widest mb-1">Email Support</h4>
                                        <p className="public-heading font-bold text-sm">ieee@gehu.ac.in</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="public-icon-surface p-4 text-primary rounded-[1.2rem] shadow-lg shadow-primary/5">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h4 className="public-subtle font-black text-[10px] uppercase tracking-widest mb-1">Chat hours</h4>
                                        <p className="public-heading font-bold text-sm">Mon - Sat: 9AM - 5PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Motion.div>

                    {/* Contact Form */}
                    <Motion.div variants={itemVariants} className="lg:w-2/3">
                        <form onSubmit={handleSubmit} className="public-card p-10 md:p-12 rounded-[3.5rem] shadow-2xl shadow-primary/5 border relative overflow-hidden">
                            {status === 'error' && (
                                <p role="alert" className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-600">
                                    {errorMessage}
                                </p>
                            )}

                            {status === 'success' && (
                                <Motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                        className="public-success-overlay absolute inset-0 backdrop-blur-md z-10 flex flex-col items-center justify-center text-green-600"
                                >
                                    <CheckCircle size={80} strokeWidth={1.5} className="mb-6 animate-bounce" />
                                    <h3 className="text-3xl font-black tracking-tight">Message Received.</h3>
                                     <p className="public-body font-medium mt-2">{successMessage}</p>
                                </Motion.div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                <div className="space-y-2">
                                     <label className="public-subtle text-[10px] font-black uppercase tracking-widest ml-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                         className="public-input w-full px-6 py-4 rounded-2xl border focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold shadow-sm"
                                        placeholder="John"
                                    />
                                </div>
                                <div className="space-y-2">
                                     <label className="public-subtle text-[10px] font-black uppercase tracking-widest ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                         className="public-input w-full px-6 py-4 rounded-2xl border focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold shadow-sm"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="mb-8 space-y-2">
                                 <label className="public-subtle text-[10px] font-black uppercase tracking-widest ml-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                     className="public-input w-full px-6 py-4 rounded-2xl border focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold shadow-sm"
                                    placeholder="john@ieee.org"
                                />
                            </div>

                            <div className="mb-10 space-y-2">
                                 <label className="public-subtle text-[10px] font-black uppercase tracking-widest ml-1">Inquiry Details</label>
                                <textarea
                                    rows={5}
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                     className="public-input w-full px-6 py-4 rounded-3xl border focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold resize-none shadow-sm"
                                    placeholder="How can we help your innovation journey?"
                                ></textarea>
                            </div>

                            <Motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest rounded-[2rem] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {status === 'submitting' ? (
                                    <>Transmitting <Loader2 size={18} className="animate-spin" /></>
                                ) : (
                                    <>Launch Message <Send size={18} /></>
                                )}
                            </Motion.button>
                        </form>
                    </Motion.div>
                </Motion.div>
            </div>
        </section>
    );
};

export default Contact;
