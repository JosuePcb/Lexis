/**
 * @file featuresData.js
 * @description Static data for the Lexis landing page.
 * Edit this file to update content without touching components.
 */

import { FiBookOpen, FiUsers, FiBarChart2 } from "react-icons/fi";

// ---------------------------------------------------------------------------
// Hero section content
// ---------------------------------------------------------------------------

export const HERO_CONTENT = {
    title: "Gestión Educativa Inteligente",
    subtitle: "Centraliza alumnos, cursos y reportes en un solo lugar.",
    ctaText: "Comenzar ahora",
};

// ---------------------------------------------------------------------------
// Features section — each entry maps to one FeatureCard
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Feature
 * @property {React.ElementType} icon  - React-icons component
 * @property {string}            title - Short feature name
 * @property {string}            description - One-sentence explanation
 */

/** @type {Feature[]} */
export const FEATURES = [
    {
        icon: FiBookOpen,
        title: "Cursos organizados",
        description:
            "Crea y gestiona cursos con materiales, tareas y fechas límite en un flujo claro.",
    },
    {
        icon: FiUsers,
        title: "Seguimiento de alumnos",
        description:
            "Visualiza el progreso individual de cada estudiante y detecta quién necesita apoyo.",
    },
    {
        icon: FiBarChart2,
        title: "Reportes en tiempo real",
        description:
            "Accede a métricas actualizadas para tomar decisiones basadas en datos reales.",
    },
];

// ---------------------------------------------------------------------------
// Footer links + copyright
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} FooterLink
 * @property {string} label - Visible text
 * @property {string} href  - Navigation target
 */

/** @type {FooterLink[]} */
export const FOOTER_LINKS = [
    { label: "Sobre nosotros", href: "/about" },
    { label: "Privacidad", href: "/privacy" },
    { label: "Términos", href: "/terms" },
];

export const FOOTER_COPYRIGHT = `© ${new Date().getFullYear()} Lexis. Todos los derechos reservados.`;