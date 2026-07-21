/**
 * @file Footer.jsx
 * @description Minimal footer with navigation links and copyright notice.
 * Uses CSS variables for full dark/light theme support.
 */

/**
 * @typedef {Object} FooterLink
 * @property {string} label - Visible link text
 * @property {string} href  - Navigation target
 */

/**
 * @param {Object}       props
 * @param {FooterLink[]} props.links     - Navigation links to display
 * @param {string}       props.copyright - Copyright string
 */
function Footer({ links, copyright }) {
    return (
        <footer
            className="px-6 py-10"
            style={{
                backgroundColor: "var(--color-bg)",
                borderTop: "1px solid var(--color-card)",
            }}
        >
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Nav links */}
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                    {links.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-sm transition-colors duration-200"
                            style={{ color: "var(--color-secondary)" }}
                            onMouseEnter={e => e.currentTarget.style.color = "var(--color-primary)"}
                            onMouseLeave={e => e.currentTarget.style.color = "var(--color-secondary)"}
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                {/* Copyright */}
                <p className="text-xs" style={{ color: "var(--color-secondary)" }}>
                    {copyright}
                </p>

            </div>
        </footer>
    );
}

export default Footer;