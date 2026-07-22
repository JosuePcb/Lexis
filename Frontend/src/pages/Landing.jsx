/**
 * @file Landing.jsx
 * @description Root page for the marketing landing route ("/").
 * Acts as a pure composition layer — no logic, only layout.

 */

import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar/Navbar";
import Hero from "../components/LandingPage/Hero";
import Features from "../components/LandingPage/Features";
import Footer from "../components/LandingPage/Footer";

import {
    HERO_CONTENT,
    FEATURES,
    FOOTER_LINKS,
    FOOTER_COPYRIGHT,
} from "../data/featuresData";

function Landing() {
    const navigate = useNavigate();


    const handleCtaClick = () => navigate("/register");

    return (
        <div className="min-h-screen bg-[#F5F0E6]">

            <Hero
                title={HERO_CONTENT.title}
                subtitle={HERO_CONTENT.subtitle}
                ctaText={HERO_CONTENT.ctaText}
                onCtaClick={handleCtaClick}
            />

            <Features features={FEATURES} />

            <Footer links={FOOTER_LINKS} copyright={FOOTER_COPYRIGHT} />

        </div>
    );
}

export default Landing;