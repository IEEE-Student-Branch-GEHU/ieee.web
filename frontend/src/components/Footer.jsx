import React from "react";
import { Link } from "react-router-dom";
import {
    BsGithub,
    BsInstagram,
    BsLinkedin,
} from "react-icons/bs";
import { MdEmail, MdOutlineLocationOn } from "react-icons/md";

// Assets
// import ieeeFooterLogo from "../assets/ieee-footer-logo.png";
import IeeeLogoWhite from "../assets/ieee-logo-white.png";

function Footer() {
    const footerLinks = [
        {
            icon: <BsLinkedin />,
            link: "https://www.linkedin.com/company/ieeesb-gehu/",
        },
        {
            icon: <BsInstagram />,
            link: "https://www.instagram.com/ieee_gehu?igsh=MW1teDJyOGRtNHh5eQ==",
        },
        {
            icon: <BsGithub />,
            link: "https://github.com/YZO-BIT/IEEE-website",
        },
    ];

    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-primaryDark text-white text-center mt-20 font-sans">
            <div className="w-full lg:flex">
                <div className="w-full lg:w-1/4 flex justify-center">
                    <div className="bg-primaryLight min-w-[300px] w-full max-w-[350px] py-8 rounded-b-3xl mb-8 flex flex-col gap-4 items-center px-6">
                        {/* <img src={ieeeFooterLogo} width={250} alt="logo" className="px-4" /> */}

                        <div className="flex flex-col items-center text-center">
                            <span className="font-bold text-2xl tracking-wide uppercase leading-tight">IEEE Student Branch</span>
                            <span className="font-light text-base tracking-wider leading-tight mt-1">Graphic Era Hill University</span>
                            <span className="text-xs text-white/80 uppercase tracking-widest mt-2 border-t border-white/20 pt-2 w-full">Dehradun Campus</span>
                        </div>

                        <div className="flex p-2 justify-center text-[20px] gap-2">
                            {footerLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 text-white shadow-sm"
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div className="w-full lg:w-3/12 p-6 lg:text-left">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Quick Links</h3>
                        <div className="flex flex-col gap-3 text-sm font-light">
                            <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
                            <a href="#events" className="hover:text-gray-300 transition-colors">Events</a>
                            <a href="#team" className="hover:text-gray-300 transition-colors">Executive Committee</a>
                            <a href="#contact" className="hover:text-gray-300 transition-colors">Join Us</a>
                        </div>
                    </div>
                </div>

                {/* Column 3: IEEE Links */}
                <div className="w-full lg:w-3/12 p-6 lg:text-left">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">IEEE Portals</h3>
                        <div className="flex flex-col gap-3 text-sm font-light">
                            <a href="https://www.ieee.org/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">IEEE.org</a>
                            <a href="https://ieeexplore.ieee.org/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">IEEE Xplore</a>
                            <a href="https://spectrum.ieee.org/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">IEEE Spectrum</a>
                        </div>
                    </div>
                </div>

                {/* Column 4: Contact Information */}
                <div className="w-full lg:w-3/12 p-6 lg:text-left">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-lg mb-2 uppercase tracking-wide">Contact Us</h3>
                        <div className="flex flex-col gap-4 text-sm font-light">
                            <a
                                href="mailto:ieee@gehu.ac.in"
                                className="flex gap-4 items-center hover:text-gray-300 transition-colors"
                            >
                                <MdEmail className="text-2xl" />
                                <span>ieee@gehu.ac.in</span>
                            </a>
                            <div className="flex gap-4 items-start text-left">
                                <MdOutlineLocationOn className="text-3xl shrink-0" />
                                <address className="not-italic leading-relaxed">
                                    Graphic Era Hill University<br />
                                    Clement Town, Dehradun<br />
                                    Uttarakhand, India
                                </address>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:flex justify-end items-end">
                <div className="w-full lg:w-1/3 max-md:mb-2 max-md:mt-4 text-sm text-gray-400 pb-2">
                    {`© Copyright ${currentYear} | All rights reserved`}
                </div>
                <div className="w-full lg:w-1/3 flex justify-end">
                    <div
                        className="w-full md:w-[90%] bg-primaryLight md:rounded-tl-3xl p-4 flex justify-center items-center font-medium text-sm leading-snug"
                    >
                        Developed by IEEE Student Branch — GEHU
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
