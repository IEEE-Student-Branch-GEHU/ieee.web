import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Separator } from "./ui/separator";
import { ROUTES } from "../constants/routes.constants";

// Assets (imported as per Vite)
import SightWhiteImage from "../assets/Sight logo-white.png";
import CsLogoImage from "../assets/ieee-cs-white-logo.png";
import IeeeLogoWhite from "../assets/ieee-logo-white.png";
import IeeeSbWhiteImage from "../assets/logo new white.png";
import WieLogoImage from "../assets/wie-white.png";

function GlobalNavItem({ last, ...anchorProps }) {
    return (
        <>
            <a {...anchorProps} className="hover:text-gray-300 transition-colors" />
            {!last && (
                <Separator
                    orientation="vertical"
                    className="bg-white last-of-type:hidden h-[20px] mx-4"
                />
            )}
        </>
    );
}

function LocalNavItem(props) {
    return (
        <Link {...props} className="hover:text-gray-200 transition-colors" />
    );
}

export function GlobalNav() {
    const navItems = [
        ROUTES.IEEE_HOME,
        ROUTES.IEEE_XPLORE,
        ROUTES.IEEE_STANDARDS,
        ROUTES.IEEE_SPECTRUM,
        ROUTES.IEEE_MORE_SITES,
        ROUTES.IEEE_JOIN,
    ];

    return (
        <div className="hidden md:flex justify-center w-full bg-grey xl:px-0 px-5 ">
            <div className="flex flex-row gap-2 justify-start items-center h-[50px] text-white max-w-[1170px] grow text-xs font-light">
                {navItems.map((item, i) => (
                    <GlobalNavItem
                        key={item.url}
                        href={item.url}
                        last={i === navItems.length - 1}
                    >
                        {item.label}
                    </GlobalNavItem>
                ))}
            </div>
        </div>
    );
}

export function LocalNav() {
    const navItems = [
        ROUTES.HOME,
        // ROUTES.EVENTS, 
        // ROUTES.BLOG,
        { label: "Events", url: "/#events" }, // Keep existing anchor links for now
        ROUTES.EXCOM,
        ROUTES.ABOUT_US,
        ROUTES.CONTACT_US,
        ROUTES.JOIN_US,
    ];

    const { pathname } = useLocation();

    const bgColor =
        {
            "/wie": "bg-pink-600", // Approximate colors for now
            "/cs": "bg-orange-500",
            "/sight": "bg-blue-500",
        }[pathname] || "bg-primary"; // Use our primary

    return (
        <div
            className={`hidden md:flex justify-center w-full z-50 sticky top-0 ${bgColor} shadow-lg`}
        >
            <nav className="flex flex-row gap-8 uppercase font-semibold justify-center items-center py-4 text-white max-w-[1170px] grow">
                {navItems.map((item) => (
                    item.url.startsWith('http') || item.url.includes('#') ?
                        <a key={item.label} href={item.url} className="hover:opacity-80 transition-opacity">{item.label}</a> :
                        <LocalNavItem key={item.label} to={item.url}>
                            {item.label}
                        </LocalNavItem>
                ))}
            </nav>
        </div>
    );
}

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(!menuOpen);
    const closeMenu = () => setMenuOpen(false);

    const { pathname } = useLocation();

    const bgColor =
        {
            "/wie": "bg-pink-600",
            "/cs": "bg-orange-500",
            "/sight": "bg-blue-500",
        }[pathname] || "bg-blue-900"; // Primary dark blue

    const getLogo = () => {
        switch (pathname) {
            case "/wie": return WieLogoImage;
            case "/cs": return CsLogoImage;
            case "/sight": return SightWhiteImage;
            default: return IeeeSbWhiteImage;
        }
    };

    return (
        <header className="font-sans">
            <GlobalNav />

            <div className={`flex justify-between items-center w-full p-4 md:p-0 ${bgColor}`}>
                <div className="md:hidden flex items-center">
                    <button
                        className="text-white text-3xl md:hidden mr-3"
                        onClick={toggleMenu}
                    >
                        &#9776;
                    </button>
                    <span className="text-white font-semibold text-lg">
                        IEEE SB GEHU
                    </span>
                </div>

                <div className="md:flex hidden flex-row gap-6 items-center mx-auto text-white max-w-[1170px] grow py-6 justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={IeeeLogoWhite}
                            alt="IEEE Logo"
                            className="h-16 object-contain"
                        />
                        <div className="flex flex-col border-l border-white/30 pl-4 justify-center">
                            <span className="font-bold text-xl tracking-wide uppercase leading-tight">IEEE Student Branch</span>
                            <span className="font-light text-sm tracking-wider leading-tight">Graphic Era Hill University</span>
                            <span className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Dehradun Campus</span>
                        </div>
                    </div>

                    {/* Secondary Logo (kept subtle) */}
                    <img
                        src={IeeeLogoWhite}
                        alt="IEEE Logo"
                        className="h-12 object-contain opacity-80"
                    />
                </div>
            </div>

            {/* Main Local Nav usually goes BELOW the logo section in the ref site, but let's stick to their structure. 
          In their code `Header` component includes `GlobalNav` then `LogoSection` then... wait.
          Ah, they seem to have `LocalNav` separate in `layout` or `page`? 
          Let's look at their `header.tsx` again. usage of `LocalNav` is exported but not used in `Header` component directly? 
          Ah, `Header` default export ONLY includes `GlobalNav` and `LogoSection`. 
          User likely places `LocalNav` under it. I will bundle them for simplicity or check their layout.
      */}
            <LocalNav />

            {/* Mobile Menu Sidebar */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                onClick={closeMenu}
            />
            <div
                className={`fixed left-0 top-0 h-full w-[280px] ${bgColor} text-white z-50 p-6 transform transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-6">
                    <img
                        src={IeeeLogoWhite}
                        alt="IEEE Logo"
                        className="h-12 object-contain mx-auto mb-4"
                    />
                    {[
                        ROUTES.HOME,
                        ROUTES.EXCOM,
                        ROUTES.ABOUT_US,
                        ROUTES.CONTACT_US,
                        ROUTES.JOIN_US,
                    ].map((item) => (
                        <Link
                            key={item.label}
                            to={item.url}
                            className="text-white text-lg font-medium hover:text-gray-200 border-b border-white/10 pb-2"
                            onClick={closeMenu}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}

export default Header;
