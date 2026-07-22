/**
 * @file Features.jsx
 * @description Renders a responsive 3-column grid of feature cards.
 * Section background is one shade darker than the page bg for contrast.
 * Cards have their own background + extra depth on hover.
 * All colors use CSS variables so dark/light mode works automatically.
 */

/**
 * @typedef {Object} Feature
 * @property {React.ElementType} icon        - React-icons component
 * @property {string}            title       - Feature name
 * @property {string}            description - One-sentence explanation
 */

/**
 * @param {Object}    props
 * @param {Feature[]} props.features - Array of feature objects from featuresData.js
 */
function Features({ features }) {
    return (
        // Section bg = --color-card (one tone darker than page bg, works in both themes)
        <section
            className="px-6 py-20 md:py-28"
            style={{ backgroundColor: "var(--color-card)" }}
        >
            {/* Section label */}
            <p
                className="text-center text-xs font-semibold tracking-widest uppercase mb-12"
                style={{ color: "var(--color-secondary)" }}
            >
                ¿Qué puedes hacer con Lexis?
            </p>

            {/* Feature grid: 1 col (mobile) → 3 cols (desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {features.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                ))}
            </div>
        </section>
    );
}

// ---------------------------------------------------------------------------
// FeatureCard — internal sub-component, not exported
// ---------------------------------------------------------------------------

/**
 * @param {Feature} props
 */
function FeatureCard({ icon: Icon, title, description }) {
    return (
        <div
            className="flex flex-col gap-5 p-10 rounded-xl transition-all duration-300 cursor-default"
            // Card base: slightly lighter than the section bg
            style={{ backgroundColor: "var(--color-bg)" }}
            onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = "var(--color-bg)";
                e.currentTarget.style.boxShadow = "0 4px 24px 0 rgba(0,0,0,0.10)";
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = "var(--color-bg)";
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            {/* Icon */}
            <span style={{ color: "var(--color-accent)" }}>
                <Icon size={26} />
            </span>

            {/* Title */}
            <h3
                className="text-base font-semibold"
                style={{ color: "var(--color-primary)" }}
            >
                {title}
            </h3>

            {/* Description */}
            <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-secondary)" }}
            >
                {description}
            </p>
        </div>
    );
}

export default Features;