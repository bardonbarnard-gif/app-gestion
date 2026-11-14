/**
 * Configuration Tailwind compilée en amont (voir css/tailwind.src.css).
 *
 * L'application utilisait jusqu'ici le CDN « tailwindcss.com », qui embarque le
 * compilateur et génère les styles dans le navigateur à chaque chargement.
 * Le build local produit un fichier CSS statique, mis en cache normalement.
 */

const TEAM_COLORS = [
    "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
    "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
    "cyan", "slate", "gray", "zinc", "neutral", "stone"
];

/**
 * getTeamColorClasses() dans js/app.js construit ses classes par interpolation
 * (`bg-${name}-50`) : le scanner ne peut pas les voir. Sans cette liste, les
 * couleurs d'équipe disparaîtraient au build.
 */
const TEAM_SHADES = {
    bg: [50, 100, 200, 500, 600],
    border: [300, 400],
    text: [600, 800, 900]
};

const safelist = [];
TEAM_COLORS.forEach(color => {
    Object.keys(TEAM_SHADES).forEach(prefix => {
        TEAM_SHADES[prefix].forEach(shade => {
            safelist.push(prefix + "-" + color + "-" + shade);
        });
    });
});

module.exports = {
    content: ["./*.html", "./js/**/*.js"],
    safelist,
    theme: {
        extend: {}
    },
    plugins: []
};
