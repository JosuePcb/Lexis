/**
 * @file Hero.jsx
 * @description Landing hero section — headline, subtitle, and single CTA.
 * Uses CSS variables from index.css so it respects dark/light theme automatically.
 */

/**
 * @param {Object}   props
 * @param {string}   props.title      - Main headline text
 * @param {string}   props.subtitle   - Supporting subtitle text
 * @param {string}   props.ctaText    - Label for the primary CTA button
 * @param {Function} props.onCtaClick - Callback fired when CTA is clicked
 */
function Hero({ title, subtitle, ctaText, onCtaClick }) {
    return (
        <section
            className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-36"
            style={{ backgroundColor: "var(--color-bg)" }}
        >
            {/* Eyebrow label */}
            <span
                className="text-xs font-semibold tracking-widest uppercase mb-6"
                style={{ color: "var(--color-secondary)" }}
            >
                Plataforma educativa
            </span>

            {/* Main headline */}
            <h1
                className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mb-6"
                style={{ color: "var(--color-primary)" }}
            >
                {title}
            </h1>

            {/* Subtitle */}
            <p
                className="text-lg md:text-xl max-w-xl mb-10"
                style={{ color: "var(--color-secondary)" }}
            >
                {subtitle}
            </p>

            {/* Primary CTA — accent color is same in both themes */}
            <button
                onClick={onCtaClick}
                className="px-8 py-3 text-white text-sm font-semibold rounded-lg
                   active:scale-95 transition-all duration-200"
                style={{ backgroundColor: "var(--color-accent)" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
                {ctaText}
            </button>
        </section>
    );
}

export default Hero;