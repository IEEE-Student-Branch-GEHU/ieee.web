import React from "react";
import { Link } from "react-router-dom";
import {
    BsFacebook,
    BsInstagram,
    BsLinkedin,
    BsTiktok,
    BsWhatsapp,
    BsYoutube,
} from "react-icons/bs";
import { MdEmail, MdOutlineLocationOn } from "react-icons/md";

// Assets
// import ieeeFooterLogo from "../assets/ieee-footer-logo.png";
import IeeeLogoWhite from "../assets/ieee-logo-white.png";

function Footer() {
    const footerLinks = [
        {
            icon: <BsFacebook />,
            link: "https://www.facebook.com/",
        },
        {
            icon: <BsLinkedin />,
            link: "https://www.linkedin.com/",
        },
        {
            icon: <BsTiktok />,
            link: "https://www.tiktok.com/",
        },
        {
            icon: <BsInstagram />,
            link: "https://www.instagram.com/",
        },
        {
            icon: <BsWhatsapp />,
            link: "https://whatsapp.com/",
        },
        {
            icon: <BsYoutube />,
            link: "https://youtube.com/",
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
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-opacity-0 hover:bg-opacity-10 bg-white duration-500 text-white"
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/6 p-6 lg:text-left">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-xl mb-2">Get Started</h3>
                        <div className="flex flex-col gap-2 text-sm font-light">
                            <Link to="/" className="hover:text-gray-300">HOME</Link>
                            <Link to="/#team" className="hover:text-gray-300">EXECUTIVE COMMITTEE</Link>
                            <Link to="/#contact" className="hover:text-gray-300">MEMBERSHIP</Link>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/4 p-6 lg:border-l lg:border-r lg:border-white/20 lg:text-left">
                    {/* Empty placeholder to keep spacing or remove entirely. 
                        Let's remove the column but keep the grid structure or adjust widths.
                        Actually, removing it entirely is better. 
                        We should probably adjust the widths of other columns if we remove this one.
                        The original has: 1/4 (logo), 1/6 (links), 1/4 (chapters), 1/3 (contact).
                        1/4 + 1/6 + 1/4 + 1/3 = 0.25 + 0.16 + 0.25 + 0.33 = ~1.0
                        If we remove 1/4, we have 0.75 left.
                        Let's make Contact wider or Links wider.
                        Let's change: 
                        Logo: 1/4 -> 3/12
                        Links: 1/6 -> 2/12 -> maybe 3/12
                        Contact: 1/3 -> 4/12 -> maybe 6/12
                    */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-xl mb-2">Links</h3>
                        <div className="flex flex-col gap-2 text-sm font-light">
                            <a href="https://www.ieee.org/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">IEEE.org</a>
                            <a href="https://ieeexplore.ieee.org/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">IEEE Xplore</a>
                            <a href="https://spectrum.ieee.org/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">IEEE Spectrum</a>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/3 p-6 lg:text-left">
                    <div className="flex flex-col gap-4">
                        <h3 className="font-bold text-xl mb-2">Contact Us</h3>
                        <div className="flex flex-col gap-4 text-sm font-light">
                            <a
                                href="mailto:ieee@gehu.ac.in"
                                className="flex gap-4 items-center hover:text-gray-300"
                            >
                                <MdEmail className="text-2xl" />
                                <span>ieee@gehu.ac.in</span>
                            </a>
                            <div className="flex gap-4 items-start">
                                <MdOutlineLocationOn className="text-3xl shrink-0" />
                                <address className="not-italic">
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
