/**
 * Rangueil FC — outil de publication du site public.
 *
 * Lit les données de l'application (matches, teams, players) et écrit une
 * projection publique dans rangueil_data/pub. Aucun fichier de l'application
 * n'est modifié : la publication se fait dans la base.
 *
 * Accès : code PIN de l'application (nœud rangueil_data/access).
 * Les données privées (licences, téléphones, blessures, convocations) ne
 * sont jamais recopiées dans le nœud public.
 */
(function () {
    'use strict';

    const CFG = window.SITE_CONFIG || {};
    const SESSION_KEY = "rangueil_publisher_v1";

    const DEFAULT_COLORS = {
        u6: "cyan", u7: "cyan", u8: "gray", u9: "green", u10: "violet", u11: "orange",
        u12: "amber", u13: "yellow", u14: "blue", u15: "emerald", u16: "teal",
        u17: "orangeDark", u18: "zinc", u19: "slate",
        senior: "sky", seniors: "sky", senior1: "sky", senior2: "indigo",
        feminines: "pink", feminine: "pink", futsal: "purple", veterans: "stone"
    };

    let db = null;
    let session = null;

    const state = {
        teams: {},
        players: [],
        matches: [],
        news: [],
        publishedAt: null
    };

    function $(selector) { return document.querySelector(selector); }

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    function fmtDateTime(timestamp) {
        if (!timestamp) return "jamais";
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "jamais";
        return date.toLocaleString("fr-FR", {
            day: "2-digit", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    }

    /* ------------------------------------------------------------------
       Découpage « NOM Prénom » / « Prénom Nom »
       ------------------------------------------------------------------ */

    function splitName(raw) {
        const name = String(raw || "").trim().replace(/\s+/g, " ");
        if (!name) return { first: "", last: "" };

        const words = name.split(" ");
        let cut = 0;

        while (cut < words.length && words[cut] === words[cut].toUpperCase() && /\p{Lu}/u.test(words[cut])) {
            cut++;
        }

        if (cut === 0) {
            if (words.length === 1) return { first: name, last: "" };
            return { first: words.slice(0, -1).join(" "), last: words[words.length - 1] };
        }

        if (cut >= words.length) return { first: "", last: name };

        return { first: words.slice(cut).join(" "), last: words.slice(0, cut).join(" ") };
    }

    function publicPlayerName(player) {
        const first = String(player.prenom || "").trim();
        const last = String(player.nom || "").trim();

        const parts = first || last ? { first: first, last: last } : splitName(player.name);

        const initial = parts.last ? parts.last.charAt(0).toUpperCase() + "." : "";
        return [parts.first, initial].filter(Boolean).join(" ") || "Joueur";
    }

    /* ------------------------------------------------------------------
       Projection publique
       ------------------------------------------------------------------ */

    function buildProjection(raw) {
        const teams = {};
        const rawTeams = raw.teams || {};

        Object.keys(rawTeams).forEach(function (key) {
            const team = rawTeams[key] || {};
            teams[key] = {
                name: team.name || String(key).toUpperCase(),
                color: team.color || DEFAULT_COLORS[String(key).toLowerCase()] || "sky",
                category: team.category || "",
                coach: team.coach || ""
            };
        });

        const players = (Array.isArray(raw.players) ? raw.players : [])
            .map(function (player) {
                const display = publicPlayerName(player);
                return {
                    id: player.id || display,
                    name: display,
                    team: player.team || player.cat || "",
                    poste: player.poste1 || "",
                    number: player.numero || player.number || ""
                };
            })
            .filter(function (player) { return !!player.name; });

        const matches = Object.keys(raw.matches || {})
            .map(function (key) {
                const match = raw.matches[key] || {};
                return {
                    id: match.id || key,
                    team: match.team || "",
                    opponent: match.opponent || "Adversaire",
                    date: match.date || "",
                    heure: match.heure || "",
                    location: match.location || "Domicile",
                    adresse: match.adresse || "",
                    pelouse: match.pelouse || "",
                    type: match.type || "Championnat",
                    competition: match.competitionName || match.competition || "",
                    journee: match.journee != null ? String(match.journee) : (match.tour || ""),
                    scoreHome: match.scoreHome != null ? match.scoreHome : "",
                    scoreAway: match.scoreAway != null ? match.scoreAway : "",
                    carpoolId: match.carpoolId || ""
                };
            })
            .filter(function (match) { return !!match.team && !!match.opponent; })
            .sort(function (a, b) {
                return (a.date + " " + a.heure).localeCompare(b.date + " " + b.heure);
            });

        return { teams: teams, players: players, matches: matches };
    }

    /* ------------------------------------------------------------------
       Session
       ------------------------------------------------------------------ */

    function readSession() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
        } catch (error) {
            return null;
        }
    }

    function writeSession(user) {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                pin: user.pin,
                name: user.name || "",
                role: user.role || "public"
            }));
        } catch (error) { /* ignore */ }
    }

    /* ------------------------------------------------------------------
       Interface
       ------------------------------------------------------------------ */

    function showError(message) {
        const host = $("#pub-error");
        if (!host) return;
        host.textContent = message;
        host.classList.add("is-visible");
    }

    function status(message, kind) {
        const host = $("#pub-status");
        if (!host) return;
        host.className = "notice " + (kind === "error" ? "notice--error" : kind === "warn" ? "notice--warn" : "notice--ok");
        host.innerHTML = "<span>" + esc(message) + "</span>";
    }

    async function unlock(user) {
        session = user;
        writeSession(user);

        const gate = $("#pub-gate");
        const app = $("#pub-app");
        if (gate) gate.style.display = "none";
        if (app) app.style.display = "";

        const who = $("#pub-who");
        if (who) {
            who.textContent = (user.name || "Membre du staff") +
                " · " + (user.role === "admin" ? "administrateur" : user.role);
        }

        await loadData();
    }

    async function loadData() {
        status("Lecture des données du club…", "info");

        try {
            db = await window.PubData.init();

            const snapshot = await db.ref("rangueil_data").once("value");
            const raw = snapshot.val() || {};

            const projection = buildProjection(raw);

            state.teams = projection.teams;
            state.players = projection.players;
            state.matches = projection.matches;
            state.news = Array.isArray((raw.pub || {}).news) ? raw.pub.news.slice() : [];
            state.publishedAt = (raw.pub || {}).publishedAt || null;

            render();
            status("Données prêtes. Vérifiez l'aperçu puis publiez.", "ok");

        } catch (error) {
            status("Impossible de lire la base : " + (error.message || "erreur inconnue"), "error");
        }
    }

    function render() {
        const published = $("#pub-last");
        if (published) published.textContent = fmtDateTime(state.publishedAt);

        const counters = $("#pub-counters");
        if (counters) {
            counters.innerHTML =
                '<div class="info-tile"><span class="info-tile__label">Équipes</span>' +
                    '<span class="info-tile__value">' + Object.keys(state.teams).length + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Joueurs publiés</span>' +
                    '<span class="info-tile__value">' + state.players.length + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Matchs</span>' +
                    '<span class="info-tile__value">' + state.matches.length + "</span></div>" +
                '<div class="info-tile"><span class="info-tile__label">Actualités</span>' +
                    '<span class="info-tile__value">' + state.news.length + "</span></div>";
        }

        renderTeams();
        renderNews();
    }

    function renderTeams() {
        const host = $("#pub-teams");
        if (!host) return;

        const rows = Object.keys(state.teams).map(function (key) {
            const team = state.teams[key];
            const players = state.players.filter(function (p) { return p.team === key; }).length;
            const matches = state.matches.filter(function (m) { return m.team === key; }).length;

            return "<tr>" +
                "<td><strong>" + esc(team.name) + "</strong></td>" +
                "<td>" + esc(team.color) + "</td>" +
                "<td>" + players + "</td>" +
                "<td>" + matches + "</td>" +
            "</tr>";
        }).join("");

        host.innerHTML = rows
            ? "<table class=\"table\"><thead><tr><th>Équipe</th><th>Couleur</th><th>Joueurs</th><th>Matchs</th></tr></thead><tbody>" +
              rows + "</tbody></table>"
            : '<p class="empty">Aucune équipe dans la base.</p>';
    }

    function renderNews() {
        const host = $("#pub-news");
        if (!host) return;

        host.innerHTML = state.news.length
            ? state.news.map(function (item) {
                return '<div class="card card--pad" style="margin-bottom:8px;text-align:left">' +
                    '<div class="match-card__head">' +
                        '<span class="badge">' + esc(item.date || "") + "</span>" +
                        '<button class="chip" type="button" data-news-delete="' + esc(item.id) + '">Supprimer</button>' +
                    "</div>" +
                    '<p class="match-card__opp">' + esc(item.title) + "</p>" +
                    '<p class="match-card__date" style="white-space:pre-wrap">' + esc(item.body) + "</p>" +
                "</div>";
            }).join("")
            : '<p class="empty">Aucune actualité. Ajoutez la première ci-dessous.</p>';
    }

    /* ------------------------------------------------------------------
       Actions
       ------------------------------------------------------------------ */

    async function publish() {
        if (!db) return status("Connexion à la base perdue, rechargez la page.", "error");

        const button = $("#pub-publish");
        if (button) {
            button.disabled = true;
            button.textContent = "Publication…";
        }

        try {
            const news = state.news.slice().sort(function (a, b) {
                return String(b.date).localeCompare(String(a.date));
            });

            await db.ref(CFG.dataPath || "rangueil_data/pub").set({
                publishedAt: Date.now(),
                publishedBy: session && session.name ? session.name : "",
                club: CFG.club || {},
                teams: state.teams,
                players: state.players,
                matches: state.matches,
                news: news
            });

            state.publishedAt = Date.now();
            window.PubData.clearCache();

            const published = $("#pub-last");
            if (published) published.textContent = fmtDateTime(state.publishedAt);

            status("Publication réussie. Le site public affiche désormais ces données.", "ok");

        } catch (error) {
            status("Échec de la publication : " + (error.message || "erreur inconnue"), "error");
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Publier sur le site";
            }
        }
    }

    function addNews() {
        const title = $("#news-title");
        const body = $("#news-body");
        const date = $("#news-date");
        const link = $("#news-link");

        if (!title || !body) return;

        if (!title.value.trim() || !body.value.trim()) {
            status("Renseignez un titre et un texte pour l'actualité.", "warn");
            return;
        }

        state.news.unshift({
            id: "N" + Date.now(),
            date: (date && date.value) || today(),
            title: title.value.trim(),
            body: body.value.trim(),
            link: (link && link.value.trim()) || ""
        });

        title.value = "";
        body.value = "";
        if (link) link.value = "";

        renderNews();
        status("Actualité ajoutée. Cliquez sur « Publier sur le site » pour la mettre en ligne.", "warn");
    }

    /* ------------------------------------------------------------------
       Amorçage
       ------------------------------------------------------------------ */

    function bind() {
        const form = $("#pub-form");
        if (form) {
            const input = $("#pub-pin");
            if (input) input.focus();

            form.addEventListener("submit", async function (event) {
                event.preventDefault();
                const button = $("#pub-submit");
                if (button) {
                    button.disabled = true;
                    button.textContent = "Vérification…";
                }

                try {
                    const user = await window.PubData.access(input.value);

                    if (!user) {
                        showError("Code incorrect.");
                        input.value = "";
                        input.focus();
                        return;
                    }

                    if (user.role !== "admin") {
                        const notice = $("#pub-role-warning");
                        if (notice) notice.style.display = "";
                    }

                    await unlock(user);

                } catch (error) {
                    showError("Connexion impossible : " + (error.message || "réessayez."));
                } finally {
                    if (button) {
                        button.disabled = false;
                        button.textContent = "Déverrouiller";
                    }
                }
            });
        }

        const publishButton = $("#pub-publish");
        if (publishButton) publishButton.addEventListener("click", publish);

        const reloadButton = $("#pub-reload");
        if (reloadButton) {
            reloadButton.addEventListener("click", function () { loadData(); });
        }

        const addButton = $("#news-add");
        if (addButton) addButton.addEventListener("click", addNews);

        const newsHost = $("#pub-news");
        if (newsHost) {
            newsHost.addEventListener("click", function (event) {
                const target = event.target.closest ? event.target.closest("[data-news-delete]") : null;
                if (!target) return;
                const id = target.getAttribute("data-news-delete");
                state.news = state.news.filter(function (item) { return item.id !== id; });
                renderNews();
                status("Actualité retirée de la liste. Publiez pour appliquer.", "warn");
            });
        }

        const logout = $("#pub-logout");
        if (logout) {
            logout.addEventListener("click", function () {
                try { sessionStorage.removeItem(SESSION_KEY); } catch (error) { /* ignore */ }
                window.location.reload();
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        bind();

        const saved = readSession();
        if (saved && saved.pin) {
            unlock(saved).catch(function (error) {
                showError("Session expirée : " + (error.message || "reconnectez-vous."));
            });
        }
    });
})();
