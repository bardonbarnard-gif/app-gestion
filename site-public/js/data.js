/**
 * Rangueil FC — couche de données du site public.
 *
 * Lit uniquement rangueil_data/pub (projection publique écrite depuis
 * publier.html). Ne lit jamais les licences, téléphones ou blessures.
 * En cas d'absence de données ou d'erreur réseau, bascule sur le jeu de
 * démonstration.
 */
(function () {
    'use strict';

    const CFG = window.SITE_CONFIG || {};
    const CACHE_KEY = 'rangueil_pub_v1';
    const CACHE_TTL = 5 * 60 * 1000;

    let dbPromise = null;

    /* ------------------------------------------------------------------
       Firebase
       ------------------------------------------------------------------ */

    function init() {
        if (dbPromise) return dbPromise;

        dbPromise = (async function () {
            if (typeof firebase === 'undefined') {
                throw new Error("SDK Firebase indisponible");
            }
            if (!firebase.apps.length) {
                firebase.initializeApp(CFG.firebase);
            }
            if (!firebase.auth().currentUser) {
                await firebase.auth().signInAnonymously();
            }
            return firebase.database();
        })();

        // Permet une nouvelle tentative après un échec.
        dbPromise.catch(function () { dbPromise = null; });

        return dbPromise;
    }

    function withTimeout(promise, ms, label) {
        return new Promise(function (resolve, reject) {
            const timer = setTimeout(function () {
                reject(new Error(label || "Délai dépassé"));
            }, ms);
            promise.then(function (value) {
                clearTimeout(timer);
                resolve(value);
            }, function (error) {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    /* ------------------------------------------------------------------
       Cache de session (navigation entre les pages)
       ------------------------------------------------------------------ */

    function readCache() {
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || !parsed.savedAt) return null;
            if (Date.now() - parsed.savedAt > CACHE_TTL) return null;
            if (!parsed.data) return null;
            return { source: parsed.source, data: parsed.data, error: null };
        } catch (e) {
            return null;
        }
    }

    function writeCache(payload) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                savedAt: Date.now(),
                source: payload.source,
                data: payload.data
            }));
        } catch (e) { /* stockage indisponible : sans conséquence */ }
    }

    function clearCache() {
        try { sessionStorage.removeItem(CACHE_KEY); } catch (e) { /* ignore */ }
    }

    /* ------------------------------------------------------------------
       Normalisation
       ------------------------------------------------------------------ */

    function normalize(raw) {
        raw = raw || {};

        const club = Object.assign({}, CFG.club || {}, raw.club || {});

        const teams = {};
        const rawTeams = raw.teams || {};
        Object.keys(rawTeams).forEach(function (key) {
            const team = rawTeams[key] || {};
            teams[key] = {
                name: team.name || String(key).toUpperCase(),
                color: team.color || "sky",
                category: team.category || "",
                coach: team.coach || ""
            };
        });

        const players = (Array.isArray(raw.players) ? raw.players : []).map(function (p) {
            p = p || {};
            const first = p.first || p.prenom || p.name || "";
            const last = p.last || p.nom || "";
            const name = p.name || [first, last].filter(Boolean).join(" ");
            return {
                id: p.id || name,
                name: name,
                first: first,
                team: p.team || p.cat || "",
                poste: p.poste || p.poste1 || "",
                number: p.number != null ? String(p.number) : ""
            };
        });

        const matches = (Array.isArray(raw.matches) ? raw.matches : []).map(function (m) {
            m = m || {};
            return {
                id: String(m.id || ""),
                team: m.team || "",
                opponent: m.opponent || "Adversaire",
                date: m.date || "",
                heure: m.heure || "",
                location: m.location || "Domicile",
                adresse: m.adresse || "",
                pelouse: m.pelouse || "",
                type: m.type || "Championnat",
                competition: m.competition || m.competitionName || "",
                journee: m.journee != null ? String(m.journee) : "",
                scoreHome: m.scoreHome != null ? m.scoreHome : "",
                scoreAway: m.scoreAway != null ? m.scoreAway : "",
                carpoolId: m.carpoolId || ""
            };
        }).sort(function (a, b) {
            return (a.date + " " + a.heure).localeCompare(b.date + " " + b.heure);
        });

        const news = (Array.isArray(raw.news) ? raw.news : []).map(function (n, index) {
            n = n || {};
            return {
                id: n.id || "N" + index,
                date: n.date || "",
                title: n.title || "Actualité",
                body: n.body || "",
                link: n.link || ""
            };
        }).sort(function (a, b) {
            return String(b.date).localeCompare(String(a.date));
        });

        return {
            club: club,
            teams: teams,
            players: players,
            matches: matches,
            news: news
        };
    }

    function demoPayload(reason) {
        return {
            source: "demo",
            data: normalize(window.DEMO_PUB || {}),
            error: reason || null
        };
    }

    /* ------------------------------------------------------------------
       Chargement
       ------------------------------------------------------------------ */

    async function load() {
        const cached = readCache();
        if (cached) return cached;

        if (CFG.dataMode === "demo") {
            return demoPayload("mode-demo");
        }

        let db;
        try {
            db = await withTimeout(init(), 9000, "Connexion Firebase trop lente");
        } catch (error) {
            return demoPayload(error.message);
        }

        try {
            const snapshot = await withTimeout(
                db.ref(CFG.dataPath).once("value"),
                9000,
                "Lecture des données du club trop lente"
            );

            const raw = snapshot.val();

            if (!raw || !Array.isArray(raw.matches) || !raw.matches.length) {
                return demoPayload("donnees-non-publiees");
            }

            const payload = {
                source: "firebase",
                data: normalize(raw),
                error: null
            };
            writeCache(payload);
            return payload;

        } catch (error) {
            return demoPayload(error.message);
        }
    }

    /* ------------------------------------------------------------------
       Accès par code PIN (espace famille / publication)
       ------------------------------------------------------------------ */

    async function access(pin) {
        const code = String(pin || "").trim();
        if (!/^\d{4}$/.test(code)) {
            throw new Error("Le code doit comporter 4 chiffres.");
        }

        const db = await withTimeout(init(), 9000, "Connexion Firebase trop lente");
        const snapshot = await withTimeout(
            db.ref(CFG.accessPath + "/" + code).once("value"),
            9000,
            "Vérification du code trop lente"
        );

        if (!snapshot.exists()) return null;

        const user = Object.assign({ pin: code }, snapshot.val());

        // Scopes éventuels portés par les fonctions
        const scopes = [];
        (user.functions || []).forEach(function (fn) {
            (fn.scopes || []).forEach(function (scope) {
                if (scope && scopes.indexOf(scope) === -1) scopes.push(scope);
            });
        });
        if (user.team) {
            String(user.team).split(",").forEach(function (scope) {
                scope = scope.trim();
                if (scope && scope !== "all" && scopes.indexOf(scope) === -1) scopes.push(scope);
            });
        }

        user.scopes = scopes;
        return user;
    }

    window.PubData = {
        load: load,
        init: init,
        access: access,
        normalize: normalize,
        clearCache: clearCache
    };
})();
