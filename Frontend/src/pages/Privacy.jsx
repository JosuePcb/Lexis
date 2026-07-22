/**
 * @file Privacy.jsx
 * @description Privacy policy page — minimal, readable, themed.
 */

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/LandingPage/Footer";
import { FOOTER_LINKS, FOOTER_COPYRIGHT } from "../data/featuresData";

// ---------------------------------------------------------------------------
// Policy sections data — edit here without touching layout
// ---------------------------------------------------------------------------

const SECTIONS = [
    {
        title: "Información que recopilamos",
        body: "Recopilamos únicamente los datos necesarios para que la plataforma funcione: nombre, correo electrónico y datos de uso dentro de la aplicación. No solicitamos información sensible ni datos de pago.",
    },
    {
        title: "Cómo usamos tu información",
        body: "Tus datos se utilizan exclusivamente para gestionar tu cuenta, personalizar tu experiencia educativa y mejorar la plataforma. Nunca vendemos ni compartimos tu información con terceros con fines comerciales.",
    },
    {
        title: "Almacenamiento y seguridad",
        body: "Toda la información se almacena en servidores seguros con cifrado en tránsito y en reposo. Aplicamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado.",
    },
    {
        title: "Tus derechos",
        body: "Puedes solicitar en cualquier momento el acceso, corrección o eliminación de tus datos personales escribiéndonos directamente. Tu información te pertenece y respetamos tu privacidad.",
    },
    {
        title: "Cookies",
        body: "Lexis utiliza cookies estrictamente necesarias para mantener tu sesión activa y recordar tus preferencias de tema (claro/oscuro). No utilizamos cookies de rastreo ni publicidad.",
    },
    {
        title: "Cambios a esta política",
        body: "Si realizamos cambios relevantes a esta política, te notificaremos por correo electrónico o mediante un aviso visible dentro de la plataforma antes de que los cambios entren en vigor.",
    },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function Privacy() {
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
                    Política de Privacidad
                </h1>
                <p className="text-sm" style={{ color: "var(--color-secondary)" }}>
                    Última actualización: Julio 2026
                </p>
            </section>

            {/* Content */}
            <section className="px-6 pb-28">
                <div className="max-w-2xl mx-auto flex flex-col gap-12">
                    {SECTIONS.map((section) => (
                        <PolicySection key={section.title} {...section} />
                    ))}
                </div>
            </section>

            <Footer links={FOOTER_LINKS} copyright={FOOTER_COPYRIGHT} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// PolicySection — internal sub-component
// ---------------------------------------------------------------------------

/**
 * @param {Object} props
 * @param {string} props.title - Section heading
 * @param {string} props.body  - Section paragraph
 */
function PolicySection({ title, body }) {
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

export default Privacy;