/* Rangueil FC - API FFF : proxy, JSONP et lecture des competitions
   Partie 9/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
function fffApiUrl(path) {
    let base = (state.fffApiBase || "https://api-dofa.fff.fr/api").replace(/\/+$/, "");
    if (typeof location !== "undefined" && location.hostname.indexOf("vercel.app") !== -1) {
        base = "/fff";
    }
    if (String(path).startsWith("http")) return path;
    let p = String(path);
    if (base.endsWith("/api") && p.startsWith("/api/")) p = p.slice(4);
    return base + (p.startsWith("/") ? "" : "/") + p;
}

function fffVercelProxyUrl(path) {
    let p = String(path || "");
    if (!p.startsWith("/")) p = "/" + p;
    // Normalise : enlève le préfixe /api si présent car le proxy attend le path complet
    const params = new URLSearchParams();
    params.set("path", p);
    const isFile = typeof location !== "undefined" && location.protocol === "file:";
    if (isFile) {
        return "https://app-gestion-git-main-rangueil.vercel.app/api/fff?" + params.toString();
    }
    return "/api/fff?" + params.toString();
}

async function fffFetchJsonRaw(url, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(url, {
            headers: { "Accept": "application/json" },
            signal: controller.signal
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const text = await res.text();
        if (!text || !text.trim().startsWith("{")) {
            throw new Error("Réponse bloquée (page HTML reçue)");
        }
        return JSON.parse(text);
    } finally {
        clearTimeout(timer);
    }
}

function fffJsonp(url, callbackName, timeoutMs) {
    return new Promise(function (resolve, reject) {
        const cbName = callbackName || "__fffJsonp_" + Date.now();
        const script = document.createElement("script");
        let done = false;
        function cleanup() {
            if (done) return;
            done = true;
            clearTimeout(timer);
            try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
            if (script.parentNode) script.parentNode.removeChild(script);
        }
        const timer = setTimeout(function () {
            cleanup();
            reject(new Error("Timeout JSONP"));
        }, timeoutMs || 25000);
        window[cbName] = function (data) {
            cleanup();
            resolve(data);
        };
        script.onerror = function () {
            cleanup();
            reject(new Error("Erreur de chargement du script proxy"));
        };
        const sep = url.indexOf("?") === -1 ? "?" : "&";
        script.src = url + sep + "callback=" + cbName;
        document.head.appendChild(script);
    });
}

function fffProxyRouteFor(url) {
    const base = (state.fffProxyUrl || "").trim();
    if (!base) return "";
    const sep = base.includes("?") ? "&" : "?";
    return base + sep + "url=" + encodeURIComponent(url);
}

async function fffFetchJson(path) {
    // 1a) Proxy local Node — tente toujours localhost:3001 en premier (file:// ou http://localhost:3000)
    //     Lance `node proxy-local.js` et laisse-le ouvert. Si absent, on bascule sur Vercel/Google.
    try {
        const localUrl = "http://localhost:3001?path=" + encodeURIComponent(path);
        const lData = await fffFetchJsonRaw(localUrl, 12000);
        return lData;
    } catch (e) {
        console.warn("FFF local proxy (localhost:3001) échoué :", e.message);
    }
    // 1b) Vercel proxy (prioritaire sur http) — fonctionne sur vercel.app ET en file:// via URL absolue
    try {
        const vercelUrl = fffVercelProxyUrl(path);
        const vData = await fffFetchJsonRaw(vercelUrl, 20000);
        return vData;
    } catch (e) {
        console.warn("FFF Vercel proxy échoué :", e.message);
    }
    // 2) Google Apps Script proxy si configuré (fetch + fallback JSONP)
    const fullUrl = fffApiUrl(path);
    const gUrl = fffProxyRouteFor(fullUrl);
    if (gUrl) {
        try {
            const gData = await fffFetchJsonRaw(gUrl, 25000);
            return gData;
        } catch (e) {
            console.warn("FFF Google proxy fetch échoué, essai JSONP :", e.message);
            try {
                const gData2 = await fffJsonp(gUrl, null, 25000);
                return gData2;
            } catch (e2) {
                console.warn("FFF Google proxy JSONP échoué :", e2.message);
            }
        }
    }
    // 3) Dernier recours : direct (échouera en 403 sur file:// mais peut marcher sur vercel via rewrite /fff)
    try {
        const directUrl = fffApiUrl(path);
        return await fffFetchJsonRaw(directUrl, 15000);
    } catch (e) {
        console.warn("FFF direct échoué :", e.message);
        throw new Error("API FFF injoignable. Vérifiez le proxy Vercel (/api/fff) ou l'URL Google Apps Script. " + e.message);
    }
}

async function fetchFFFCalendar() {
    const clubNo = state.fffClubNo || 18707;
    const now = new Date();
    const seasonYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const seasonStart = seasonYear + "-06-01";

    const params = new URLSearchParams();
    params.set("ma_dat[after]", seasonStart);
    params.set("itemsPerPage", "1000");

    let currentPath = "/api/clubs/" + clubNo + "/calendrier?" + params.toString();
    let matches = [];
    let guard = 0;

    while (currentPath && guard < 20) {
        guard++;
        const data = await fffFetchJson(currentPath);
        matches = matches.concat(data["hydra:member"] || []);
        const view = data["hydra:view"] || {};
        currentPath = view["hydra:next"] || null;
    }

    return matches;
}

async function fetchFFFCompetitionMatches(cpNo) {
    const now = new Date();
    const seasonYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const seasonStart = seasonYear + "-06-01";
    const params = new URLSearchParams();
    params.set("competition.cp_no", String(cpNo));
    params.set("ma_dat[after]", seasonStart);
    params.set("itemsPerPage", "1000");
    let currentPath = "/api/match_entities?" + params.toString();
    let matches = [];
    let guard = 0;
    while (currentPath && guard < 20) {
        guard++;
        const data = await fffFetchJson(currentPath);
        matches = matches.concat(data["hydra:member"] || []);
        const view = data["hydra:view"] || {};
        currentPath = view["hydra:next"] || null;
    }
    return matches;
}



function fffTypeLabel(compType) {
    if (compType === "CP") return "Coupe";
    if (compType === "CH") return "Championnat";
    if (compType === "AC") return "Amical";
    return "Coupe";
}

// ============================================================
//  MODULE : DISTRICT HAUTE-GARONNE
//  Classements, calendrier et résultats officiels, calculés à
//  partir des matchs de la compétition renvoyés par l'API FFF.
// ============================================================

const DISTRICT_CACHE_TTL = 15 * 60 * 1000;
const DISTRICT_CACHE_PREFIX = "district_cache_v1_";

let districtState = {
    competitions: [],
    category: "",
    cpNo: "",
    matches: [],
    loading: false,
    error: "",
    source: "",
    phaseNo: "",
    pouleNo: "",
    standings: null,
    lastSync: 0,
    lastAttempt: 0
};

const DISTRICT_MANUAL_KEY = "district_manual_cps_v1";




// --- Extraction tolérante des réponses FFF (champs variables selon les endpoints) ---





function fffIsClubSide(side) {
    if (!side) return false;
    const club = side.club || (side.equipe && side.equipe.club);
    return !!(club && Number(club.cl_no) === Number(state.fffClubNo || 18707));
}









