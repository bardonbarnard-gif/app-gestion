/**
 * Rangueil FC — site public : rendu des pages.
 * Vanilla JS, aucune dépendance de build.
 */
(function () {
    'use strict';

    const CFG = window.SITE_CONFIG || {};
    const CLUB = CFG.club || {};

    const COLORS = {
        sky: "#0284c7", skyDark: "#0369a1", blue: "#2563eb", blueDark: "#1e40af",
        indigo: "#4f46e5", indigoDark: "#3730a3", violet: "#7c3aed", purple: "#9333ea",
        purpleDark: "#6b21a8", fuchsia: "#c026d3", pink: "#db2777", rose: "#e11d48",
        red: "#dc2626", redDark: "#991b1b", orange: "#ea580c", orangeDark: "#9a3412",
        amber: "#d97706", yellow: "#ca8a04", lime: "#65a30d", green: "#16a34a",
        greenDark: "#15803d", emerald: "#059669", emeraldDark: "#047857", teal: "#0d9488",
        tealDark: "#0f766e", cyan: "#0891b2", slate: "#475569", gray: "#4b5563",
        zinc: "#52525b", neutral: "#525252", stone: "#57534e"
    };

    const NAV = [
        { page: "home", href: "index.html", label: "Accueil" },
        { page: "calendar", href: "calendrier.html", label: "Calendrier" },
        { page: "teams", href: "equipes.html", label: "Équipes" },
        { page: "news", href: "actus.html", label: "Actus" },
        { page: "infos", href: "infos.html", label: "Le club" }
    ];

    const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    const DAYS_SHORT = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
    const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    const MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin",
        "juil.", "août", "sept.", "oct.", "nov.", "déc."];

    const ROLE_LABELS = {
        admin: "Administrateur",
        coach: "Éducateur",
        responsable: "Responsable d'équipe",
        dirigeant: "Dirigeant",
        public: "Visiteur"
    };

    /* ======================================================================
       Utilitaires
       ====================================================================== */

    function $(selector, root) { return (root || document).querySelector(selector); }
    function $$(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function parseDate(value) {
        const raw = String(value || "").trim();
        if (!raw) return null;
        const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw + "T12:00:00" : raw);
        return isNaN(date.getTime()) ? null : date;
    }

    function fmtDateLong(value) {
        const date = parseDate(value);
        if (!date) return "";
        return DAYS[date.getDay()] + " " + date.getDate() + " " + MONTHS[date.getMonth()] + " " + date.getFullYear();
    }

    function fmtDateMedium(value) {
        const date = parseDate(value);
        if (!date) return "";
        return DAYS_SHORT[date.getDay()] + " " + date.getDate() + " " + MONTHS_SHORT[date.getMonth()];
    }

    function fmtMonthTitle(value) {
        const date = parseDate(value);
        if (!date) return "Date à confirmer";
        const month = MONTHS[date.getMonth()];
        return month.charAt(0).toUpperCase() + month.slice(1) + " " + date.getFullYear();
    }

    function startOfToday() {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function relativeLabel(value) {
        const date = parseDate(value);
        if (!date) return "";
        date.setHours(0, 0, 0, 0);
        const days = Math.round((date - startOfToday()) / 86400000);
        if (days === 0) return "Aujourd'hui";
        if (days === 1) return "Demain";
        if (days === -1) return "Hier";
        if (days > 1) return "Dans " + days + " jours";
        return "Il y a " + Math.abs(days) + " jours";
    }

    function teamOf(data, key) {
        const team = (data.teams && data.teams[key]) || {};
        return {
            name: team.name || String(key || "Équipe").toUpperCase(),
            color: team.color || "sky",
            category: team.category || "",
            coach: team.coach || ""
        };
    }

    function colorOf(team) {
        return COLORS[team && team.color] || COLORS.sky;
    }

    function teamKeys(data) {
        return Object.keys(data.teams || {}).sort(function (a, b) {
            return teamOf(data, a).name.localeCompare(teamOf(data, b).name, "fr", { numeric: true, sensitivity: "base" });
        });
    }

    function isPlayed(match) {
        return match
            && match.scoreHome !== "" && match.scoreHome != null
            && match.scoreAway !== "" && match.scoreAway != null;
    }

    function outcomeOf(match) {
        const home = parseInt(match.scoreHome, 10);
        const away = parseInt(match.scoreAway, 10);
        if (isNaN(home) || isNaN(away)) return "draw";
        if (home > away) return "win";
        if (home < away) return "loss";
        return "draw";
    }

    function upcomingMatches(data) {
        const today = startOfToday();
        return (data.matches || []).filter(function (match) {
            if (isPlayed(match)) return false;
            const date = parseDate(match.date);
            return !date || date >= today;
        });
    }

    function pastMatches(data) {
        return (data.matches || [])
            .filter(isPlayed)
            .sort(function (a, b) { return (b.date + b.heure).localeCompare(a.date + a.heure); });
    }

    function emptyState(text) {
        return '<div class="empty">' + esc(text) + "</div>";
    }

    function slotTiles(slots) {
        return (slots || []).map(function (slot) {
            return '<div class="info-tile">' +
                '<span class="info-tile__label">' + esc(slot.day) + "</span>" +
                '<span class="info-tile__value">' + esc(slot.time) + "</span>" +
                '<span class="info-tile__label" style="margin-top:6px">' + esc(slot.who) + " · " + esc(slot.place) + "</span>" +
            "</div>";
        }).join("");
    }

    /* ======================================================================
       Structure de page (en-tête, pied de page, bandeau)
       ====================================================================== */

    function renderHeader() {
        const host = $("#site-header");
        if (!host) return;

        const current = document.body.dataset.page;

        host.className = "site-header";
        host.innerHTML =
            '<div class="container site-header__inner">' +
                '<a class="brand" href="index.html">' +
                    '<img class="brand__logo" src="assets/logo.svg" alt="">' +
                    '<span class="brand__text">' +
                        '<span class="brand__name">' + esc(CLUB.name || "Rangueil FC") + "</span>" +
                        '<span class="brand__tag">' + esc(CLUB.city || "Toulouse") + " · Football</span>" +
                    "</span>" +
                "</a>" +
                '<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Ouvrir le menu">☰</button>' +
                '<nav class="site-nav" id="site-nav" aria-label="Navigation principale">' +
                    NAV.map(function (item) {
                        const active = item.page === current ? ' aria-current="page"' : "";
                        return '<a class="site-nav__link" href="' + item.href + '"' + active + ">" + esc(item.label) + "</a>";
                    }).join("") +
                    '<a class="site-nav__cta" href="espace-famille.html">Espace famille</a>' +
                "</nav>" +
            "</div>";

        const toggle = $(".nav-toggle", host);
        const nav = $("#site-nav", host);

        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                const open = nav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
                toggle.textContent = open ? "✕" : "☰";
            });
        }
    }

    function renderFooter() {
        const host = $("#site-footer");
        if (!host) return;

        const year = new Date().getFullYear();
        const appBase = CFG.appBaseUrl || "../";

        host.className = "site-footer";
        host.innerHTML =
            '<div class="container">' +
                '<div class="site-footer__grid">' +
                    "<div>" +
                        '<p class="site-footer__brand"><img src="assets/logo.svg" alt="">' + esc(CLUB.name || "Rangueil FC") + "</p>" +
                        "<p>" + esc(CLUB.address || "") + "</p>" +
                        (CLUB.email ? '<p><a href="mailto:' + esc(CLUB.email) + '">' + esc(CLUB.email) + "</a></p>" : "") +
                    "</div>" +
                    "<div>" +
                        "<h3>Le club</h3>" +
                        "<ul>" +
                            '<li><a href="calendrier.html">Calendrier &amp; résultats</a></li>' +
                            '<li><a href="equipes.html">Équipes &amp; effectifs</a></li>' +
                            '<li><a href="actus.html">Actualités</a></li>' +
                            '<li><a href="infos.html">Inscriptions &amp; contacts</a></li>' +
                        "</ul>" +
                    "</div>" +
                    "<div>" +
                        "<h3>Espaces</h3>" +
                        "<ul>" +
                            '<li><a href="espace-famille.html">Espace famille</a></li>' +
                            '<li><a href="' + esc(appBase) + 'index.html">Espace staff (convocations)</a></li>' +
                            '<li><a href="mentions-legales.html">Mentions légales &amp; RGPD</a></li>' +
                        "</ul>" +
                    "</div>" +
                    "<div>" +
                        "<h3>Liens officiels</h3>" +
                        "<ul>" +
                            '<li><a href="' + esc(CLUB.fffUrl || "https://www.fff.fr/") + '" target="_blank" rel="noopener">FFF</a></li>' +
                            '<li><a href="' + esc(CLUB.districtUrl || "https://haute-garonne.fff.fr/") + '" target="_blank" rel="noopener">District Haute-Garonne</a></li>' +
                            (CLUB.facebook ? '<li><a href="' + esc(CLUB.facebook) + '" target="_blank" rel="noopener">Facebook</a></li>' : "") +
                            (CLUB.instagram ? '<li><a href="' + esc(CLUB.instagram) + '" target="_blank" rel="noopener">Instagram</a></li>' : "") +
                        "</ul>" +
                    "</div>" +
                "</div>" +
                '<div class="site-footer__bottom">' +
                    "<span>© " + year + " " + esc(CLUB.name || "Rangueil FC") + " — Tous droits réservés.</span>" +
                    "<span>Site du club · Données sportives non contractuelles.</span>" +
                "</div>" +
            "</div>";
    }

    function renderBanner(result) {
        if (!result || result.source !== "demo") return;
        const main = $("#main");
        if (!main || $(".data-banner")) return;

        const banner = document.createElement("div");
        banner.className = "data-banner";
        banner.innerHTML =
            '<div class="container data-banner__inner">' +
                "<span>⚽ <strong>Site en démonstration.</strong> Les équipes, joueurs et résultats affichés sont fictifs. " +
                "Ils seront remplacés dès la première publication des données du club.</span>" +
                '<button class="data-banner__close" type="button" aria-label="Masquer le bandeau">✕</button>' +
            "</div>";

        main.insertBefore(banner, main.firstChild);

        const close = $(".data-banner__close", banner);
        if (close) close.addEventListener("click", function () { banner.remove(); });
    }

    /* ======================================================================
       Composants
       ====================================================================== */

    function matchCard(match, data) {
        const team = teamOf(data, match.team);
        const color = colorOf(team);
        const played = isPlayed(match);
        const scoreClass = played ? "score-pill--" + outcomeOf(match) : "score-pill--soon";
        const scoreText = played
            ? esc(match.scoreHome) + " – " + esc(match.scoreAway)
            : esc(match.heure || "À venir");

        const locationBadge = match.location === "Domicile"
            ? '<span class="badge badge--home">Domicile</span>'
            : '<span class="badge badge--away">Extérieur</span>';

        return '<a class="match-card" href="match.html?id=' + encodeURIComponent(match.id) + '" style="--team:' + color + '">' +
            '<div class="match-card__head">' +
                '<span class="team-tag"><i></i>' + esc(team.name) + "</span>" +
                '<span class="badge">' + esc(match.type || "Match") + "</span>" +
                locationBadge +
            "</div>" +
            '<div class="match-card__body">' +
                "<div>" +
                    '<p class="match-card__opp">' + esc(match.opponent) + "</p>" +
                    '<p class="match-card__date">' + esc(fmtDateLong(match.date)) +
                        (match.heure ? " · " + esc(match.heure) : "") + "</p>" +
                "</div>" +
                '<span class="score-pill ' + scoreClass + '">' + scoreText + "</span>" +
            "</div>" +
        "</a>";
    }

    function spotlight(match, data) {
        const team = teamOf(data, match.team);

        return '<div class="spotlight" style="--team:' + colorOf(team) + '">' +
            '<div class="spotlight__head">' +
                "<span>Prochain match · " + esc(team.name) + "</span>" +
                "<span>" + esc(relativeLabel(match.date)) + "</span>" +
            "</div>" +
            '<div class="spotlight__body">' +
                '<div class="spotlight__match">' +
                    '<div class="spotlight__team">' + esc(CLUB.shortName || "Rangueil") +
                        "<span>" + esc(team.name) + "</span></div>" +
                    '<div class="spotlight__vs">VS</div>' +
                    '<div class="spotlight__opponent">' + esc(match.opponent) + "</div>" +
                "</div>" +
                '<div class="spotlight__meta">' +
                    '<span class="pill">📅 ' + esc(fmtDateLong(match.date)) + "</span>" +
                    (match.heure ? '<span class="pill">🕐 ' + esc(match.heure) + "</span>" : "") +
                    '<span class="pill">📍 ' + esc(match.location || "Domicile") + "</span>" +
                    (match.competition ? '<span class="pill">🏆 ' + esc(match.competition) + "</span>" : "") +
                "</div>" +
                '<div class="spotlight__actions">' +
                    '<a class="btn btn--primary" href="match.html?id=' + encodeURIComponent(match.id) + '">Fiche du match</a>' +
                    '<a class="btn btn--ghost" href="calendrier.html">Tout le calendrier</a>' +
                "</div>" +
            "</div>" +
        "</div>";
    }

    function newsCard(item) {
        return '<div class="news-card">' +
            '<span class="news-card__date">' + esc(fmtDateMedium(item.date)) + "</span>" +
            '<h3 class="news-card__title">' + esc(item.title) + "</h3>" +
            '<p class="news-card__body">' + esc(item.body) + "</p>" +
            (item.link
                ? '<a class="news-card__link" href="' + esc(item.link) + '" target="_blank" rel="noopener">Lire la suite →</a>'
                : "") +
        "</div>";
    }

    /* ======================================================================
       Accueil
       ====================================================================== */

    async function initHome() {
        const result = await window.PubData.load();
        const data = result.data;
        renderBanner(result);

        const stats = $("#hero-stats");
        if (stats) {
            stats.innerHTML =
                '<div class="hero-stat"><span class="hero-stat__value">' + teamKeys(data).length + "</span>" +
                    '<span class="hero-stat__label">Équipes</span></div>' +
                '<div class="hero-stat"><span class="hero-stat__value">' + (data.players || []).length + "</span>" +
                    '<span class="hero-stat__label">Licenciés</span></div>' +
                '<div class="hero-stat"><span class="hero-stat__value">' + (data.matches || []).length + "</span>" +
                    '<span class="hero-stat__label">Matchs suivis</span></div>' +
                '<div class="hero-stat"><span class="hero-stat__value">' + esc(CLUB.city || "Toulouse") + "</span>" +
                    '<span class="hero-stat__label">Depuis ' + esc(CLUB.founded || 1974) + "</span></div>";
        }

        const nextHost = $("#home-next");
        if (nextHost) {
            const next = upcomingMatches(data).slice(0, 3);
            if (!next.length) {
                nextHost.innerHTML = emptyState("Aucun match programmé pour le moment. Le calendrier sera mis à jour prochainement.");
            } else {
                nextHost.innerHTML = spotlight(next[0], data) +
                    (next.length > 1
                        ? '<div class="grid" style="margin-top:14px">' +
                            next.slice(1).map(function (match) { return matchCard(match, data); }).join("") +
                          "</div>"
                        : "");
            }
        }

        const resultsHost = $("#home-results");
        if (resultsHost) {
            const results = pastMatches(data).slice(0, 3);
            resultsHost.innerHTML = results.length
                ? results.map(function (match) { return matchCard(match, data); }).join("")
                : emptyState("Pas encore de résultat enregistré cette saison.");
        }

        const newsHost = $("#home-news");
        if (newsHost) {
            newsHost.innerHTML = (data.news || []).length
                ? data.news.slice(0, 3).map(newsCard).join("")
                : emptyState("Les premières actualités du club arrivent bientôt.");
        }

        const teamsHost = $("#home-teams");
        if (teamsHost) {
            teamsHost.innerHTML = teamKeys(data).map(function (key) {
                const team = teamOf(data, key);
                const count = (data.players || []).filter(function (p) { return p.team === key; }).length;
                return '<a class="chip" href="equipes.html" style="--team:' + colorOf(team) + '">' +
                    esc(team.name) + (count ? " · " + count : "") + "</a>";
            }).join("");
        }

        const slotsHost = $("#home-slots");
        if (slotsHost) {
            slotsHost.innerHTML = slotTiles(CFG.trainingSlots);
        }
    }

    /* ======================================================================
       Calendrier
       ====================================================================== */

    async function initCalendar() {
        const result = await window.PubData.load();
        const data = result.data;
        renderBanner(result);

        const state = { team: "all", view: "upcoming" };

        const chipsHost = $("#calendar-chips");
        const tabsHost = $("#calendar-tabs");
        const listHost = $("#calendar-list");
        if (!listHost) return;

        function renderChips() {
            if (!chipsHost) return;

            const chips = teamKeys(data)
                .filter(function (key) {
                    return (data.matches || []).some(function (m) { return m.team === key; });
                })
                .map(function (key) {
                    const team = teamOf(data, key);
                    return '<button class="chip' + (state.team === key ? " is-active" : "") + '" data-team="' + esc(key) + '" type="button" style="--team:' + colorOf(team) + '">' +
                        esc(team.name) + "</button>";
                }).join("");

            chipsHost.innerHTML =
                '<button class="chip' + (state.team === "all" ? " is-active" : "") + '" data-team="all" type="button">Toutes</button>' +
                chips;
        }

        function renderTabs() {
            if (!tabsHost) return;
            tabsHost.innerHTML =
                '<button class="tab' + (state.view === "upcoming" ? " is-active" : "") + '" data-view="upcoming" type="button">À venir</button>' +
                '<button class="tab' + (state.view === "results" ? " is-active" : "") + '" data-view="results" type="button">Résultats</button>';
        }

        function renderList() {
            let matches = state.view === "results" ? pastMatches(data) : upcomingMatches(data);

            if (state.view === "results") {
                matches = matches.slice().reverse();
            }
            if (state.team !== "all") {
                matches = matches.filter(function (m) { return m.team === state.team; });
            }

            if (!matches.length) {
                listHost.innerHTML = emptyState(
                    state.view === "results"
                        ? "Aucun résultat pour cette sélection."
                        : "Aucun match à venir pour cette sélection."
                );
                return;
            }

            const groups = [];
            matches.forEach(function (match) {
                const key = String(match.date || "").slice(0, 7);
                let group = groups[groups.length - 1];
                if (!group || group.key !== key) {
                    group = { key: key, label: fmtMonthTitle(match.date), items: [] };
                    groups.push(group);
                }
                group.items.push(match);
            });

            listHost.innerHTML = groups.map(function (group) {
                return '<section class="month">' +
                    '<h2 class="month__title">' + esc(group.label) + "</h2>" +
                    '<div class="stack">' +
                        group.items.map(function (match) { return matchCard(match, data); }).join("") +
                    "</div>" +
                "</section>";
            }).join("");
        }

        document.addEventListener("click", function (event) {
            const chip = event.target.closest ? event.target.closest("[data-team]") : null;
            if (chip && chip.parentNode === chipsHost) {
                state.team = chip.getAttribute("data-team");
                renderChips();
                renderList();
                return;
            }
            const tab = event.target.closest ? event.target.closest("[data-view]") : null;
            if (tab && tab.parentNode === tabsHost) {
                state.view = tab.getAttribute("data-view");
                renderTabs();
                renderList();
            }
        });

        renderChips();
        renderTabs();
        renderList();
    }

    /* ======================================================================
       Fiche match
       ====================================================================== */

    function carpoolUrl(match) {
        if (!match.carpoolId) return "";
        return (CFG.appBaseUrl || "../") + "covoiturage.html?id=" + encodeURIComponent(match.carpoolId);
    }

    async function initMatch() {
        const result = await window.PubData.load();
        const data = result.data;
        renderBanner(result);

        const host = $("#match-content");
        const othersHost = $("#match-others");
        if (!host) return;

        const id = new URLSearchParams(window.location.search).get("id");
        const match = (data.matches || []).filter(function (m) { return m.id === id; })[0];

        if (!match) {
            host.innerHTML =
                '<div class="notice notice--warn">Match introuvable. Le lien est peut-être incomplet ou le calendrier a été mis à jour.</div>' +
                '<div class="actions"><a class="btn btn--brand" href="calendrier.html">Voir le calendrier</a></div>';
            if (othersHost) othersHost.innerHTML = "";
            return;
        }

        const team = teamOf(data, match.team);
        const color = colorOf(team);
        const played = isPlayed(match);
        const destination = (match.adresse || "").trim();

        const mapsUrl = destination
            ? "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(destination) + "&travelmode=driving&avoid=tolls"
            : "";

        const carpool = carpoolUrl(match);

        host.innerHTML =
            '<a class="back-link" href="calendrier.html">← Retour au calendrier</a>' +
            '<div class="match-hero" style="--team:' + color + '">' +
                '<div class="match-hero__top">' +
                    "<span>" + esc(team.name) + "</span>" +
                    "<span>·</span>" +
                    "<span>" + esc(match.competition || match.type || "Match") + "</span>" +
                "</div>" +
                '<div class="match-hero__teams">' +
                    "<span>" + esc(CLUB.shortName || "Rangueil") + "</span>" +
                    '<span class="match-hero__vs">VS</span>' +
                    "<span>" + esc(match.opponent) + "</span>" +
                "</div>" +
                '<div class="match-hero__meta">' +
                    '<span class="pill">📅 ' + esc(fmtDateLong(match.date)) + "</span>" +
                    (match.heure ? '<span class="pill">🕐 ' + esc(match.heure) + "</span>" : "") +
                    '<span class="pill">📍 ' + esc(match.location || "Domicile") + "</span>" +
                "</div>" +
                (played
                    ? '<div class="match-hero__score"><small>Score</small>' +
                        esc(match.scoreHome) + " – " + esc(match.scoreAway) + "</div>"
                    : '<div class="match-hero__score"><small>' + esc(relativeLabel(match.date)) + "</small></div>") +
            "</div>" +
            '<div class="info-grid">' +
                '<div class="info-tile"><span class="info-tile__label">Compétition</span>' +
                    '<span class="info-tile__value">' + esc(match.competition || match.type || "—") + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Journée / tour</span>' +
                    '<span class="info-tile__value">' + esc(match.journee || "—") + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Lieu</span>' +
                    '<span class="info-tile__value">' + esc(match.location || "Domicile") + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Terrain</span>' +
                    '<span class="info-tile__value">' + esc(match.pelouse || "—") + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Adresse</span>' +
                    '<span class="info-tile__value">' + esc(destination || "Stade du club") + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Statut</span>' +
                    '<span class="info-tile__value">' + (played ? "Match joué" : "À venir") + "</span></div>" +
            "</div>" +
            '<div class="actions">' +
                (mapsUrl ? '<a class="btn btn--brand" href="' + esc(mapsUrl) + '" target="_blank" rel="noopener">Itinéraire (sans péage)</a>' : "") +
                (carpool ? '<a class="btn btn--soft" href="' + esc(carpool) + '" target="_blank" rel="noopener">Covoiturage</a>' : "") +
                '<button class="btn btn--line" type="button" id="match-share">Partager</button>' +
            "</div>" +
            '<p id="match-share-status" style="margin-top:10px;font-size:11.5px;color:#64748b"></p>';

        const shareButton = $("#match-share");
        if (shareButton) {
            shareButton.addEventListener("click", async function () {
                const status = $("#match-share-status");
                const title = (CLUB.shortName || "Rangueil") + " – " + match.opponent;
                try {
                    if (navigator.share) {
                        await navigator.share({ title: title, text: title, url: window.location.href });
                        return;
                    }
                    await navigator.clipboard.writeText(window.location.href);
                    if (status) status.textContent = "Lien copié dans le presse-papiers.";
                } catch (error) {
                    if (status) status.textContent = "Copiez l'adresse de la page pour la partager.";
                }
            });
        }

        if (othersHost) {
            const others = (data.matches || []).filter(function (m) {
                return m.team === match.team && m.id !== match.id;
            }).slice(-4).reverse();

            othersHost.innerHTML = others.length
                ? '<div class="section-head"><div><h2>Autres matchs ' + esc(team.name) + "</h2>" +
                    "<p>Les dernières rencontres de l'équipe.</p></div></div>" +
                  '<div class="stack">' + others.map(function (m) { return matchCard(m, data); }).join("") + "</div>"
                : "";
        }
    }

    /* ======================================================================
       Équipes
       ====================================================================== */

    async function initTeams() {
        const result = await window.PubData.load();
        const data = result.data;
        renderBanner(result);

        const host = $("#teams-content");
        const search = $("#teams-search");
        if (!host) return;

        function render(filter) {
            const term = String(filter || "").trim().toLowerCase();

            const html = teamKeys(data).map(function (key) {
                const team = teamOf(data, key);
                const players = (data.players || [])
                    .filter(function (p) { return p.team === key; })
                    .filter(function (p) {
                        if (!term) return true;
                        return String(p.name || "").toLowerCase().indexOf(term) !== -1
                            || team.name.toLowerCase().indexOf(term) !== -1;
                    })
                    .sort(function (a, b) { return String(a.name).localeCompare(String(b.name), "fr"); });

                if (term && !players.length && team.name.toLowerCase().indexOf(term) === -1) {
                    return "";
                }

                return '<section class="team-card" style="--team:' + colorOf(team) + '">' +
                    '<div class="team-card__head">' +
                        "<div>" +
                            '<h2 class="team-card__name">' + esc(team.name) + "</h2>" +
                            '<p class="team-card__meta">' + esc(team.category || "Équipe du club") +
                                (team.coach ? " · " + esc(team.coach) : "") + "</p>" +
                        "</div>" +
                        '<span class="team-card__count">' + players.length + " joueur" + (players.length > 1 ? "s" : "") + "</span>" +
                    "</div>" +
                    (players.length
                        ? '<ul class="player-list">' + players.map(function (p) {
                            return "<li><i></i>" + esc(p.name) +
                                (p.number ? ' <span style="color:#94a3b8">· n°' + esc(p.number) + "</span>" : "") +
                                "</li>";
                        }).join("") + "</ul>"
                        : '<p style="font-size:12px;color:#94a3b8">Effectif non communiqué.</p>') +
                "</section>";
            }).join("");

            host.innerHTML = html || emptyState("Aucune équipe ne correspond à cette recherche.");
        }

        render("");

        if (search) {
            search.addEventListener("input", function () { render(search.value); });
        }
    }

    /* ======================================================================
       Actualités + revue de presse
       ====================================================================== */

    const RSS_CACHE_KEY = "rangueil_rss_v1";
    const RSS_TTL = 15 * 60 * 1000;

    function readRssCache() {
        try {
            const raw = sessionStorage.getItem(RSS_CACHE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (!parsed || Date.now() - (parsed.savedAt || 0) > RSS_TTL) return {};
            return parsed.feeds || {};
        } catch (e) {
            return {};
        }
    }

    function writeRssCache(feeds) {
        try {
            sessionStorage.setItem(RSS_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), feeds: feeds }));
        } catch (e) { /* ignore */ }
    }

    async function fetchFeed(feed, cache) {
        if (cache[feed.id]) return cache[feed.id];

        const response = await fetch(
            (CFG.rssEndpoint || "api/rss") + "?feed=" + encodeURIComponent(feed.id),
            { headers: { Accept: "application/json" } }
        );

        if (!response.ok) throw new Error("HTTP " + response.status);

        const json = await response.json();
        if (!json || !Array.isArray(json.items)) throw new Error("Réponse invalide");

        cache[feed.id] = json;
        return json;
    }

    function rssItem(item, feed) {
        const date = item.date ? new Date(item.date) : null;
        const dateLabel = date && !isNaN(date.getTime())
            ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
            : "";

        return '<a class="rss-item" href="' + esc(item.link || feed.site) + '" target="_blank" rel="noopener">' +
            '<p class="rss-item__title">' + esc(item.title) + "</p>" +
            '<div class="rss-item__meta"><span>' + esc(feed.label) + "</span>" +
                (dateLabel ? "<span>·</span><span>" + esc(dateLabel) + "</span>" : "") +
            "</div>" +
            (item.summary ? '<p class="rss-item__excerpt">' + esc(item.summary) + "</p>" : "") +
        "</a>";
    }

    async function initNews() {
        const result = await window.PubData.load();
        const data = result.data;
        renderBanner(result);

        const clubHost = $("#news-club");
        const pressHost = $("#news-press");
        const tabsHost = $("#news-tabs");

        if (clubHost) {
            clubHost.innerHTML = (data.news || []).length
                ? (data.news || []).map(newsCard).join("")
                : emptyState("Aucune actualité publiée pour le moment.");
        }

        if (tabsHost) {
            tabsHost.addEventListener("click", function (event) {
                const button = event.target.closest ? event.target.closest("[data-pane]") : null;
                if (!button) return;
                $$(".tab", tabsHost).forEach(function (tab) { tab.classList.remove("is-active"); });
                button.classList.add("is-active");

                $$("[data-pane-content]").forEach(function (pane) {
                    pane.style.display = pane.getAttribute("data-pane-content") === button.getAttribute("data-pane")
                        ? ""
                        : "none";
                });
            });
        }

        if (!pressHost) return;

        const cache = readRssCache();
        const failed = [];
        const blocks = [];

        // Ordre stable : on respecte l'ordre des flux de js/config.js,
        // quel que soit l'ordre d'arrivée des réponses.
        const results = await Promise.all((CFG.rss || []).map(async function (feed) {
            try {
                return { feed: feed, json: await fetchFeed(feed, cache) };
            } catch (error) {
                return { feed: feed, error: error };
            }
        }));

        results.forEach(function (entry) {
            if (entry.error) {
                failed.push(entry.feed);
                return;
            }

            blocks.push(
                '<section class="rss-block">' +
                    '<div class="rss-block__head">' +
                        "<h3>" + esc(entry.feed.label) + "</h3>" +
                        '<a href="' + esc(entry.feed.site) + '" target="_blank" rel="noopener">Voir le site →</a>' +
                    "</div>" +
                    '<div class="rss-list">' +
                        (entry.json.items || []).slice(0, 5).map(function (item) { return rssItem(item, entry.feed); }).join("") +
                    "</div>" +
                "</section>"
            );
        });

        writeRssCache(cache);

        pressHost.innerHTML = blocks.length
            ? '<div class="rss-grid">' + blocks.join("") + "</div>"
            : '<div class="notice notice--warn"><span>La revue de presse est momentanément indisponible. ' +
              "Les flux RSS nécessitent le proxy <code>api/rss.js</code> (fonction serveur).</span></div>";

        if (failed.length) {
            pressHost.insertAdjacentHTML(
                "beforeend",
                '<div class="notice" style="margin-top:14px"><span>Flux indisponible(s) : ' +
                failed.map(function (feed) {
                    return '<a href="' + esc(feed.site) + '" target="_blank" rel="noopener">' + esc(feed.label) + "</a>";
                }).join(", ") + "</span></div>"
            );
        }
    }

    /* ======================================================================
       Espace famille
       ====================================================================== */

    const FAMILY_KEY = "rangueil_family_v1";

    function readFamily() {
        try {
            const raw = sessionStorage.getItem(FAMILY_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function writeFamily(user) {
        try { sessionStorage.setItem(FAMILY_KEY, JSON.stringify(user)); } catch (e) { /* ignore */ }
    }

    function clearFamily() {
        try { sessionStorage.removeItem(FAMILY_KEY); } catch (e) { /* ignore */ }
    }

    async function initFamily() {
        const result = await window.PubData.load();
        const data = result.data;
        renderBanner(result);

        const gate = $("#family-gate");
        const app = $("#family-app");

        const user = readFamily();

        if (user) {
            showFamily(user, data, gate, app);
            return;
        }

        deleteFamilyView();

        const form = $("#family-form");
        const input = $("#family-pin");
        const error = $("#family-error");
        const button = $("#family-submit");

        if (!form) return;

        input.focus();

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            error.classList.remove("is-visible");
            button.disabled = true;
            button.textContent = "Vérification…";

            try {
                const found = await window.PubData.access(input.value);

                if (!found) {
                    error.textContent = "Code incorrect. Vérifiez le code à 4 chiffres transmis par le club.";
                    error.classList.add("is-visible");
                    input.value = "";
                    input.focus();
                    return;
                }

                const session = {
                    name: found.name || "",
                    role: found.role || "public",
                    scopes: found.scopes || [],
                    savedAt: Date.now()
                };

                writeFamily(session);
                showFamily(session, data, gate, app);

            } catch (err) {
                error.textContent = "Connexion impossible : " + (err.message || "réessayez plus tard.");
                error.classList.add("is-visible");
            } finally {
                button.disabled = false;
                button.textContent = "Accéder à mon espace";
            }
        });
    }

    function deleteFamilyView() {
        const app = $("#family-app");
        if (app) {
            app.style.display = "none";
            app.innerHTML = "";
        }
    }

    function showFamily(user, data, gate, app) {
        if (!app) return;
        if (gate) gate.style.display = "none";
        app.style.display = "";

        const scopes = user.scopes || [];
        const isStaff = user.role === "admin";
        const teamMatches = (data.matches || []).filter(function (match) {
            return isStaff || !scopes.length || scopes.indexOf(match.team) !== -1;
        });

        const next = teamMatches.filter(function (m) {
            if (isPlayed(m)) return false;
            const date = parseDate(m.date);
            return !date || date >= startOfToday();
        }).slice(0, 5);

        const appBase = CFG.appBaseUrl || "../";

        app.innerHTML =
            '<div class="family-head">' +
                "<div>" +
                    "<h2>Bonjour " + esc(user.name || "") + " 👋</h2>" +
                    "<p>" + esc(ROLE_LABELS[user.role] || "Membre du club") +
                        (scopes.length ? " · " + esc(scopes.join(", ")) : "") + "</p>" +
                "</div>" +
                '<button class="btn btn--ghost btn--sm" type="button" id="family-logout">Se déconnecter</button>' +
            "</div>" +
            '<div class="actions" style="margin-top:16px">' +
                '<a class="btn btn--brand" href="' + esc(appBase) + 'index.html">Ouvrir l\'application du club</a>' +
                '<a class="btn btn--line" href="calendrier.html">Calendrier complet</a>' +
            "</div>" +
            '<section class="section--tight">' +
                '<div class="section-head"><div><h2>Prochains matchs</h2>' +
                    "<p>" + (isStaff ? "Toutes les équipes." : "Les équipes rattachées à votre profil.") + "</p></div></div>" +
                '<div class="stack">' +
                    (next.length
                        ? next.map(function (match) {
                            const team = teamOf(data, match.team);
                            const link = carpoolUrl(match);
                            return '<div class="card card--pad" style="border-left:4px solid ' + colorOf(team) + '">' +
                                '<div class="match-card__head">' +
                                    '<span class="team-tag" style="--team:' + colorOf(team) + '"><i></i>' + esc(team.name) + "</span>" +
                                    '<span class="badge">' + esc(match.type || "Match") + "</span>" +
                                "</div>" +
                                '<p class="match-card__opp">' + esc(CLUB.shortName || "Rangueil") + " – " + esc(match.opponent) + "</p>" +
                                '<p class="match-card__date">' + esc(fmtDateLong(match.date)) +
                                    (match.heure ? " · " + esc(match.heure) : "") +
                                    " · " + esc(match.location || "Domicile") + "</p>" +
                                '<div class="actions" style="margin-top:12px">' +
                                    (link
                                        ? '<a class="btn btn--soft btn--sm" href="' + esc(link) + '" target="_blank" rel="noopener">Organiser le covoiturage</a>'
                                        : '<span class="badge">Covoiturage non ouvert</span>') +
                                    '<a class="btn btn--line btn--sm" href="match.html?id=' + encodeURIComponent(match.id) + '">Fiche du match</a>' +
                                "</div>" +
                            "</div>";
                        }).join("")
                        : emptyState("Aucun match à venir pour votre profil.")) +
                "</div>" +
            "</section>" +
            '<div class="notice" style="margin-top:10px"><span>🔒 Votre code donne accès aux informations de votre équipe. ' +
                "Ne le partagez pas. Les convocations et compositions restent dans l'application du club.</span></div>";

        const logout = $("#family-logout");
        if (logout) {
            logout.addEventListener("click", function () {
                clearFamily();
                window.location.reload();
            });
        }
    }

    /* ======================================================================
       Le club (infos pratiques)
       ====================================================================== */

    async function initInfos() {
        const result = await window.PubData.load();
        const data = result.data;
        renderBanner(result);

        const club = data.club || CLUB;

        const identity = $("#infos-identity");
        if (identity) {
            identity.innerHTML =
                '<div class="info-tile"><span class="info-tile__label">Club</span>' +
                    '<span class="info-tile__value">' + esc(club.name) + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Ville</span>' +
                    '<span class="info-tile__value">' + esc(club.city) + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Terrain</span>' +
                    '<span class="info-tile__value">' + esc(club.stadium) + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Couleurs</span>' +
                    '<span class="info-tile__value">' + esc(club.colors) + "</span></div>";
        }

        const contactHost = $("#infos-contacts");
        if (contactHost) {
            const list = [];
            (CFG.contacts || []).forEach(function (contact) {
                list.push(
                    "<li><strong>" + esc(contact.role) + "</strong>" +
                    "<span>" + esc(contact.name) + "</span>" +
                    (contact.email ? '<a href="mailto:' + esc(contact.email) + '">' + esc(contact.email) + "</a>" : "") +
                    (contact.phone ? "<span>" + esc(contact.phone) + "</span>" : "") +
                    "</li>"
                );
            });
            if (club.email) {
                list.push(
                    "<li><strong>Contact général</strong>" +
                    '<a href="mailto:' + esc(club.email) + '">' + esc(club.email) + "</a></li>"
                );
            }
            contactHost.innerHTML = '<ul class="contact-list">' + list.join("") + "</ul>";
        }

        const slotsHost = $("#infos-slots");
        if (slotsHost) {
            slotsHost.innerHTML = slotTiles(CFG.trainingSlots);
        }

        const mapLink = $("#infos-map");
        if (mapLink && club.address) {
            mapLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(club.address);
        }
    }

    /* ======================================================================
       Amorçage
       ====================================================================== */

    document.addEventListener("DOMContentLoaded", function () {
        renderHeader();
        renderFooter();

        const page = document.body.dataset.page;

        const init = {
            home: initHome,
            calendar: initCalendar,
            match: initMatch,
            teams: initTeams,
            news: initNews,
            family: initFamily,
            infos: initInfos
        }[page];

        if (init) {
            Promise.resolve(init()).catch(function (error) {
                console.error("Rangueil FC — erreur de rendu :", error);
            });
        }
    });
})();
