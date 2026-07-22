/**
 * @file About.jsx
 * @description "Sobre nosotros" page — team story and member cards.
 * Same visual language as the landing page.
 */

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/LandingPage/Footer";
import { FOOTER_LINKS, FOOTER_COPYRIGHT } from "../data/featuresData";

// ---------------------------------------------------------------------------
// Team data — edit here to update without touching the component
// ---------------------------------------------------------------------------

const TEAM = [
    {
        name: "Josué Hernandez",
        role: "Líder de proyecto & Backend",
        bio: "Arquitecto de la plataforma. Se encarga de que todo funcione bien bajo el capó.",
    },
    {
        name: "Jose Ball",
        role: "Frontend & UX",
        bio: "Transforma ideas en interfaces claras. Obsesionado con la experiencia del usuario.",
    },
    {
        name: "Aaron Duque",
        role: "Backend & Base de datos",
        bio: "Diseña la estructura de datos y garantiza que la información fluya de forma segura.",
    },
    {
        name: "Eddy Mora",
        role: "Frontend & Integración",
        bio: "Conecta el frontend con la API y asegura que cada pieza encaje correctamente.",
    },
    {
        name: "Wilmer Gil",
        role: "QA & DevOps",
        bio: "Prueba cada funcionalidad antes de que llegue al usuario y mantiene los servidores en pie.",
    },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function About() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>


            {/* Header */}
            <section className="px-6 py-24 md:py-32 text-center">
                <span
                    className="text-xs font-semibold tracking-widest uppercase mb-6 block"
                    style={{ color: "var(--color-secondary)" }}
                >
                    El equipo
                </span>
                <h1
                    className="text-4xl md:text-5xl font-bold mb-6 max-w-2xl mx-auto leading-tight"
                    style={{ color: "var(--color-primary)" }}
                >
                    Sobre nosotros
                </h1>
                <p
                    className="text-lg max-w-xl mx-auto leading-relaxed"
                    style={{ color: "var(--color-secondary)" }}
                >
                    Lexis nació en 2026 como un proyecto universitario con una meta clara:
                    hacer la gestión educativa más simple, humana y efectiva. Somos cinco
                    personas que creen que la tecnología debe ayudar a enseñar, no
                    complicarlo.
                </p>
            </section>

            {/* Team grid */}
            <section className="px-6 pb-24" style={{ backgroundColor: "var(--color-card)" }}>
                <div className="max-w-5xl mx-auto py-16 flex flex-wrap justify-center gap-6 items-stretch">
                    {TEAM.map((member) => (
                        <div key={member.name} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] flex">
                            <MemberCard {...member} />
                        </div>
                    ))}
                </div>
            </section>

            <Footer links={FOOTER_LINKS} copyright={FOOTER_COPYRIGHT} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// MemberCard — internal sub-component
// ---------------------------------------------------------------------------

/**
 * @param {Object} props
 * @param {string} props.name - Full name
 * @param {string} props.role - Role in the team
 * @param {string} props.bio  - Short bio
 */
function MemberCard({ name, role, bio }) {
    // Generate initials (max 2 letters) for the avatar
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            translate="no"
            className="w-full h-full flex flex-col gap-4 p-8 rounded-xl transition-all duration-300"
            style={{ backgroundColor: "var(--color-bg)" }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = "0 4px 24px 0 rgba(0,0,0,0.09)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            {/* Avatar */}
            <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ backgroundColor: "var(--color-accent)" }}
            >
                {initials}
            </div>

            {/* Name + role */}
            <div>
                <p className="font-semibold text-sm" style={{ color: "var(--color-primary)" }}>
                    {name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-accent)" }}>
                    {role}
                </p>
            </div>

            {/* Bio */}
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-secondary)" }}>
                {bio}
            </p>
        </div>
    );
}

export default About;