/**
 * @file Terms.jsx
 * @description Terms of service page — minimal, readable, themed.
 */

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/LandingPage/Footer";
import { FOOTER_LINKS, FOOTER_COPYRIGHT } from "../data/featuresData";

// ---------------------------------------------------------------------------
// Terms sections data — edit here without touching layout
// ---------------------------------------------------------------------------

const SECTIONS = [
    {
        title: "Aceptación de los términos",
        body: "Al crear una cuenta en Lexis, aceptas estos términos de uso en su totalidad. Si no estás de acuerdo con alguna parte, te pedimos que no utilices la plataforma.",
    },
    {
        title: "Uso permitido",
        body: "Lexis está diseñado para uso educativo por docentes y estudiantes. Está prohibido usar la plataforma para actividades ilegales, difundir contenido ofensivo o intentar vulnerar la seguridad del sistema.",
    },
    {
        title: "Cuentas de usuario",
        body: "Eres responsable de mantener la confidencialidad de tus credenciales. Notifícanos de inmediato si sospechas de acceso no autorizado a tu cuenta. Cada usuario debe registrarse con información verídica.",
    },
    {
        title: "Propiedad intelectual",
        body: "El código, diseño y marca de Lexis están protegidos bajo licencia MIT © 2026 Josué Hernandez. El contenido educativo que los docentes publican en la plataforma es propiedad de sus respectivos autores.",
    },
    {
        title: "Limitación de responsabilidad",
        body: "Lexis se provee «tal cual» sin garantías de disponibilidad continua. No somos responsables por pérdida de datos derivada de uso incorrecto de la plataforma o interrupciones del servicio fuera de nuestro control.",
    },
    {
        title: "Modificaciones",
        body: "Nos reservamos el derecho de actualizar estos términos en cualquier momento. Los cambios relevantes serán notificados a los usuarios con al menos 15 días de anticipación.",
    },
    {
        title: "Ley aplicable",
        body: "Estos términos se rigen por las leyes vigentes en la jurisdicción donde opera el equipo de Lexis. Cualquier disputa será resuelta de buena fe entre las partes.",
    },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function Terms() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>

            {/* Header */}
            <section className="px-6 py-24 md:py-32 text-center">
                <span
                    className="text-xs font-semibold tracking-widest uppercase mb-6 block"
                    style={{ color: "var(--color-secondary)" }}
                >
                    Legal
                </span>
                <h1
                    className="text-4xl md:text-5xl font-bold mb-4"
                    style={{ color: "var(--color-primary)" }}
                >
                    Términos de Uso
                </h1>
                <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
                    Última actualización: Julio 2026
                </p>
            </section>

            {/* Content */}
            <section className="px-6 pb-28">
                <div className="max-w-2xl mx-auto flex flex-col gap-12">
                    {SECTIONS.map((section) => (
                        <TermsSection key={section.title} {...section} />
                    ))}
                </div>
            </section>

            <Footer links={FOOTER_LINKS} copyright={FOOTER_COPYRIGHT} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// TermsSection — internal sub-component
// ---------------------------------------------------------------------------

/**
 * @param {Object} props
 * @param {string} props.title - Section heading
 * @param {string} props.body  - Section paragraph
 */
function TermsSection({ title, body }) {
    return (
        <div className="flex flex-col gap-3">
            <h2
                className="text-base font-semibold"
                style={{ color: "var(--color-primary)" }}
            >
                {title}
            </h2>
            <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-secondary)" }}
            >
                {body}
            </p>
        </div>
    );
}

export default Terms;