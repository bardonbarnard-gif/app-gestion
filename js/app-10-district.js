/* Rangueil FC - Pages District : competitions, poules et resultats
   Partie 10/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
function districtEsc(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


























// ============================================================
//  PAGE DISTRICT — accès direct par équipe
//  Chaque équipe du club est reliée à ses compétitions FFF
//  (Admin → Synchronisation FFF) et à leurs pages officielles :
//  calendrier, résultats et classement.
// ============================================================

const DISTRICT_SITE_URL = "https://haute-garonne.fff.fr/competitions/";
const DISTRICT_FFF_URL = "https://epreuves.fff.fr/competition/engagement/";
const DISTRICT_CLUB_URL = "https://epreuves.fff.fr/competition/club/537945-rangueil-f-c/club";
const DISTRICT_CLUB_PATH = "537945-rangueil-f-c";
const DISTRICT_TEAM_PAGE_PATHS = { u14: "18707_U15_7" };
const DISTRICT_TEAM_CHAMPIONSHIP_FALLBACKS = {
    u14: {
        cpNo: "u14-championnat",
        name: "Championnat U14 Territoire",
        type: "CH",
        phase: "1",
        poule: "2",
        pouleLabel: "POULE B",
        phaseKnown: true,
        pouleKnown: true,
        fixed: true
    }
};

let districtPageTeam = "";
const districtPagePouleHints = {};
const districtPagePouleTried = new Set();
const districtPageDiscovered = {};
const districtPageDiscoverTried = new Set();
let districtPageCalendarPromise = null;

function districtPageTeamKey(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
}

function districtPageSlug(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function districtPageFindTeam(key) {
    const wanted = districtPageTeamKey(key);
    return Object.entries(state.teams || {})
        .find(([teamKey]) => districtPageTeamKey(teamKey) === wanted) || null;
}

function districtPageTeamName(key) {
    const entry = districtPageFindTeam(key);
    return entry && entry[1] && entry[1].name ? entry[1].name : String(key || "").toUpperCase();
}

function districtPageTeamScope() {
    // Un coach ne voit que son équipe, un responsable les équipes de son
    // périmètre, les autres rôles l'ensemble du club.
    const role = window.currentUserRole || "public";
    const scope = String(window.currentUserTeam || "")
        .split(",")
        .map(districtPageTeamKey)
        .filter(Boolean);

    // Clés d'équipe dédupliquées sans tenir compte de la casse ("U14" / "u14").
    const keys = new Map();
    const remember = key => {
        const raw = String(key == null ? "" : key).trim();
        if (!raw) return;
        const normalized = districtPageTeamKey(raw);
        const isTeamKey = !!(state.teams && state.teams[raw]);
        if (!keys.has(normalized) || isTeamKey) keys.set(normalized, raw);
    };
    Object.keys(state.teams || {}).forEach(remember);
    Object.values(state.matches || {}).forEach(match => {
        if (match && match.team) remember(match.team);
    });
    Object.values(state.fffLinks || {}).forEach(link => {
        if (link && link.team) remember(link.team);
    });

    let teams = [...keys.values()];
    if ((role === "coach" || role === "responsable") && scope.length) {
        teams = teams.filter(key => scope.includes(districtPageTeamKey(key)));
    }

    return teams.sort((a, b) => districtPageTeamName(a).localeCompare(
        districtPageTeamName(b), "fr", { numeric: true }
    ));
}

function districtPageNumber(obj, keys) {
    if (!obj || typeof obj !== "object") return "";
    for (const key of keys) {
        const value = obj[key];
        if (value === null || value === undefined || value === "") continue;
        const num = Number(value);
        if (isFinite(num) && num > 0) return String(num);
    }
    return "";
}

function districtPageLabelNumber(label, prefix) {
    // "POULE B" → "2", "PHASE 2" → "2", "B" → "2".
    const text = String(label == null ? "" : label).trim();
    if (!text) return "";
    if (/^[A-Z]$/i.test(text)) return String(text.toUpperCase().charCodeAt(0) - 64);
    const letter = text.match(new RegExp("\\b" + prefix + "\\s*([A-Z])\\b", "i"));
    if (letter) return String(letter[1].toUpperCase().charCodeAt(0) - 64);
    const digits = text.match(new RegExp(prefix + "\\s*(\\d+)", "i"));
    if (digits) return String(Number(digits[1]));
    return "";
}

function districtPageNumbersFromMatch(match) {
    const phaseLabel = (match && match.phase && (match.phase.name || match.phase.label)) || "";
    const pouleLabel = (match && match.poule && (match.poule.name || match.poule.label)) || "";
    const phase = districtPageNumber(match && match.phase, ["phase_no", "no", "numero", "number"])
        || districtPageLabelNumber(phaseLabel, "phase");
    const poule = districtPageNumber(match && match.poule, ["poule_no", "no", "numero", "number"])
        || districtPageLabelNumber(pouleLabel, "poule");
    return { phase: phase, poule: poule, phaseLabel: phaseLabel, pouleLabel: pouleLabel };
}

function districtPageDateDelta(match) {
    const raw = String((match && match.date) || "").slice(0, 10);
    const time = new Date(raw + "T12:00:00").getTime();
    return isNaN(time) ? Infinity : Math.abs(time - Date.now());
}

function districtPageNumbersFromMatches(list) {
    // Le match le plus proche d'aujourd'hui donne la phase et la poule en cours.
    const sorted = (list || []).slice().sort((a, b) =>
        districtPageDateDelta(a) - districtPageDateDelta(b)
    );

    for (const match of sorted) {
        const numbers = districtPageNumbersFromMatch(match);
        if (numbers.phase || numbers.poule) return numbers;
    }

    return { phase: "", poule: "", phaseLabel: "", pouleLabel: "" };
}

function districtPagePhasePoule(cpNo) {
    const key = String(cpNo);
    const hint = districtPagePouleHints[key];
    if (hint) return hint;

    let matches = [];

    // 1) JSON de compétition collé depuis l'admin.
    const raw = (state.fffCompJson || {})[key];
    if (raw && String(raw).trim()) {
        try {
            const parsed = JSON.parse(raw);
            const list = Array.isArray(parsed) ? parsed : (parsed && parsed["hydra:member"]);
            matches = Array.isArray(list) ? list : [];
        } catch (e) {
            matches = [];
        }
    }

    const clubNumbers = districtPageNumbersFromMatches(matches.filter(match =>
        fffIsClubSide(match && match.home) || fffIsClubSide(match && match.away)
    ));
    if (clubNumbers.phase || clubNumbers.poule) return clubNumbers;

    const otherNumbers = districtPageNumbersFromMatches(matches);
    if (otherNumbers.phase || otherNumbers.poule) return otherNumbers;

    // 2) Repli : phase et poule enregistrées sur les matchs déjà importés.
    const imported = Object.values(state.matches || {}).filter(match =>
        match && match.fff && String(match.fff.cp_no) === key
    );

    const nearest = imported.slice().sort((a, b) =>
        districtPageDateDelta(a) - districtPageDateDelta(b)
    );

    for (const match of nearest) {
        const phaseLabel = match.fff.phase || "";
        const pouleLabel = match.fff.poule || "";
        const phase = districtPageLabelNumber(phaseLabel, "phase");
        const poule = districtPageLabelNumber(pouleLabel, "poule");
        if (phase || poule) return { phase: phase, poule: poule, phaseLabel: phaseLabel, pouleLabel: pouleLabel };
    }

    return { phase: "", poule: "", phaseLabel: "", pouleLabel: "" };
}

async function districtPageResolvePoule(cpNo) {
    // Aucune phase/poule enregistrée pour cette compétition : on la retrouve
    // dans les matchs du club (calendrier FFF), sinon dans la compétition entière.
    const key = String(cpNo);
    if (!key || districtPagePouleTried.has(key)) return;
    districtPagePouleTried.add(key);

    const apply = numbers => {
        if (!numbers || (!numbers.phase && !numbers.poule)) return false;
        districtPagePouleHints[key] = numbers;
        renderDistrictPage();
        return true;
    };

    try {
        if (!districtPageCalendarPromise) {
            districtPageCalendarPromise = fetchFFFCalendar().catch(() => []);
        }
        const calendar = await districtPageCalendarPromise;
        const clubEvents = (calendar || []).filter(match =>
            match && match.competition && String(match.competition.cp_no) === key
        );
        if (apply(districtPageNumbersFromMatches(clubEvents))) return;

        const allMatches = await fetchFFFCompetitionMatches(Number(key));
        const clubMatches = (allMatches || []).filter(match =>
            fffIsClubSide(match && match.home) || fffIsClubSide(match && match.away)
        );
        apply(districtPageNumbersFromMatches(clubMatches.length ? clubMatches : allMatches));
    } catch (e) {
        console.warn("District : poule introuvable pour la compétition " + key, e && e.message);
    }
}

function districtPageDiscoverMatchesTeam(compName, teamKey) {
    const normalize = value => String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const haystack = normalize(compName);
    if (!haystack) return false;

    const labels = [districtPageTeamName(teamKey), teamKey]
        .map(normalize)
        .filter(Boolean);

    return labels.some(label => haystack.includes(label));
}

async function districtPageDiscoverCompetitions(teamKey) {
    // Retrouve les compétitions de l'équipe (championnat, coupe…) dans le
    // calendrier FFF du club, pour afficher leur pavé même sans liaison admin.
    const key = districtPageTeamKey(teamKey);
    if (!key || districtPageDiscoverTried.has(key)) return;
    districtPageDiscoverTried.add(key);

    try {
        if (!districtPageCalendarPromise) {
            districtPageCalendarPromise = fetchFFFCalendar().catch(() => []);
        }
        const calendar = await districtPageCalendarPromise;
        const byCompetition = new Map();

        (calendar || []).forEach(match => {
            const competition = match && match.competition;
            const cpNo = competition && competition.cp_no;
            if (!cpNo) return;
            if (!districtPageDiscoverMatchesTeam(competition.name, teamKey)) return;

            const id = String(cpNo);
            if (!byCompetition.has(id)) {
                byCompetition.set(id, {
                    cpNo: id,
                    name: competition.name || "",
                    type: competition.type || "",
                    matches: []
                });
            }
            byCompetition.get(id).matches.push(match);
        });

        if (!byCompetition.size) return;

        districtPageDiscovered[key] = [...byCompetition.values()].map(comp => {
            const numbers = districtPageNumbersFromMatches(comp.matches);
            if (numbers.phase || numbers.poule) districtPagePouleHints[comp.cpNo] = numbers;
            return { cpNo: comp.cpNo, name: comp.name, type: comp.type };
        });

        renderDistrictPage();
    } catch (e) {
        console.warn("District : compétitions indisponibles pour " + teamKey, e && e.message);
    }
}

function districtPagePouleLabel(label, poule) {
    const match = String(label || "").match(/poule\s+([A-Z0-9]+)/i);
    return match ? "Poule " + match[1].toUpperCase() : "Poule " + poule;
}

function districtPageCompetitions(teamKey) {
    const wanted = districtPageTeamKey(teamKey);
    const competitions = new Map();

    const add = (cpNo, name, type) => {
        const key = String(cpNo || "").trim();
        if (!key) return;
        const current = competitions.get(key) || { cpNo: key, name: "", type: "" };
        if (!current.name && name) current.name = String(name);
        if (!current.type && type) current.type = String(type);
        competitions.set(key, current);
    };

    // 1) Compétitions liées à l'équipe depuis l'admin FFF.
    Object.entries(state.fffLinks || {}).forEach(([cpNo, link]) => {
        if (!link || districtPageTeamKey(link.team) !== wanted) return;
        add(cpNo, link.competitionName, link.competitionType);
    });

    // 2) Compétitions des matchs déjà importés pour cette équipe.
    Object.values(state.matches || {}).forEach(match => {
        if (!match || !match.fff || !match.fff.cp_no) return;
        if (districtPageTeamKey(match.team) !== wanted) return;
        add(match.fff.cp_no, match.fff.competitionName, match.fff.competitionType);
    });

    // 3) Compétitions trouvées dans le calendrier FFF pour cette équipe
    //    (championnat par exemple, même sans liaison dans l'admin).
    (districtPageDiscovered[wanted] || []).forEach(comp => {
        add(comp.cpNo, comp.name, comp.type);
    });

    const list = [...competitions.values()];
    const fallback = DISTRICT_TEAM_CHAMPIONSHIP_FALLBACKS[wanted];
    const hasChampionship = list.some(comp => districtPageIsChampionship(comp));
    if (!hasChampionship && fallback) list.push(Object.assign({}, fallback));

    return list.map(comp => {
        if (comp.fixed) return Object.assign({}, comp);
        const numbers = districtPagePhasePoule(comp.cpNo);
        return Object.assign({}, comp, {
            phase: numbers.phase || "1",
            poule: numbers.poule || "1",
            pouleLabel: numbers.pouleLabel || "",
            phaseKnown: !!numbers.phase,
            pouleKnown: !!numbers.poule
        });
    }).sort((a, b) => String(a.name || "").localeCompare(
        String(b.name || ""), "fr", { numeric: true }
    ));
}

function districtPageUrl(comp, tab) {
    const slug = districtPageSlug(comp.name || "");
    const id = comp.cpNo + (slug ? "-" + slug : "");
    const url = DISTRICT_FFF_URL + id + "/phase/" + comp.phase + "/" + comp.poule;
    return tab === "classement" ? url + "/classement" : url;
}

function districtPageIsChampionship(comp) {
    if (!comp) return false;
    if (comp.type) return String(comp.type).toUpperCase() === "CH";
    return !/coupe/i.test(String(comp.name || ""));
}

function districtPageTeamPageUrl(teamKey, tab) {
    const path = DISTRICT_TEAM_PAGE_PATHS[districtPageTeamKey(teamKey)];
    if (!path) return "";
    const now = new Date();
    const seasonYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return "https://epreuves.fff.fr/competition/club/" + DISTRICT_CLUB_PATH
        + "/equipe/" + seasonYear + "_" + path
        + (tab === "classement" ? "/classement" : "/resultat-calendrier");
}

function districtPageEmpty(title, hint) {
    return `
        <div class="bg-white p-4 rounded-xl card-shadow border border-slate-100 text-center">
            <p class="text-sm font-bold text-slate-700">${districtEsc(title)}</p>
            <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">${districtEsc(hint)}</p>
            <div class="flex flex-wrap justify-center gap-2 mt-3">
                <a href="${DISTRICT_CLUB_URL}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold">Fiche du club FFF</a>
                <a href="${DISTRICT_SITE_URL}" target="_blank" rel="noopener noreferrer" class="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">Site du district</a>
            </div>
        </div>`;
}

function districtPageCard(comp, teamName, teamKey) {
    const name = comp.name || ("Compétition " + comp.cpNo);
    const championship = districtPageIsChampionship(comp);
    const calendarUrl = championship
        ? (districtPageTeamPageUrl(teamKey, "calendrier") || districtPageUrl(comp, "calendrier"))
        : districtPageUrl(comp, "calendrier");
    const classementUrl = championship
        ? (districtPageTeamPageUrl(teamKey, "classement") || districtPageUrl(comp, "classement"))
        : districtPageUrl(comp, "classement");
    const meta = [
        comp.type ? fffTypeLabel(comp.type) : "",
        comp.phaseKnown && comp.phase !== "1" ? "Phase " + comp.phase : "",
        comp.pouleKnown
            ? districtPagePouleLabel(comp.pouleLabel, comp.poule)
            : "Poule " + comp.poule + " (à confirmer)"
    ].filter(Boolean).join(" · ");

    // Poule inconnue : la fiche du club permet de retrouver l'équipe sans choisir de poule.
    const clubFallback = comp.pouleKnown ? "" : `
                <a href="${DISTRICT_CLUB_URL}" target="_blank" rel="noopener noreferrer"
                   class="sm:col-span-2 flex items-center gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800">
                    <i class="fa-solid fa-shield-halved"></i>
                    <span>Poule à confirmer — ouvrir la fiche du club sur FFF</span>
                </a>`;

    return `
        <div class="bg-white rounded-xl card-shadow border border-slate-100 overflow-hidden">
            <div class="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-2">
                <div class="min-w-0">
                    <p class="text-sm font-bold text-slate-800">${districtEsc(name)}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">${districtEsc(meta)}</p>
                </div>
                <span class="shrink-0 px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">${districtEsc(teamName)}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                <a href="${districtEsc(calendarUrl)}" target="_blank" rel="noopener noreferrer"
                   class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700">
                    <i class="fa-regular fa-calendar-days text-sky-600"></i>
                    <span>Calendrier &amp; résultats</span>
                </a>
                <a href="${districtEsc(classementUrl)}" target="_blank" rel="noopener noreferrer"
                   class="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700">
                    <i class="fa-solid fa-ranking-star text-emerald-600"></i>
                    <span>Classement</span>
                </a>
                ${clubFallback}
            </div>
        </div>`;
}

function setDistrictTeam(value) {
    districtPageTeam = String(value || "");
    renderDistrictPage();
}

function renderDistrictPage() {
    const teams = districtPageTeamScope();
    if (!teams.some(key => districtPageTeamKey(key) === districtPageTeamKey(districtPageTeam))) {
        districtPageTeam = teams.length ? String(teams[0]) : "";
    }

    const filter = document.getElementById("district-team-filter");
    if (filter) {
        filter.innerHTML = teams.map(key => {
            const active = districtPageTeamKey(key) === districtPageTeamKey(districtPageTeam);
            return `
                <button type="button" data-team="${districtEsc(key)}" onclick="setDistrictTeam(this.dataset.team)"
                        class="px-3 py-1.5 rounded-lg border text-xs font-bold transition ${active
                            ? "bg-sky-600 border-sky-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}">
                    ${districtEsc(districtPageTeamName(key))}
                </button>`;
        }).join("");
    }

    const teamName = districtPageTeam ? districtPageTeamName(districtPageTeam) : "";
    const subtitle = document.getElementById("district-subtitle");
    if (subtitle) {
        subtitle.textContent = teamName
            ? "Calendriers et classements officiels · " + teamName
            : "Calendriers et classements officiels par équipe";
    }

    const container = document.getElementById("district-competitions");
    if (!container) return;

    if (!districtPageTeam) {
        container.innerHTML = districtPageEmpty(
            "Aucune équipe disponible",
            "Créez vos équipes dans Administration → Équipes pour retrouver leurs compétitions officielles."
        );
        return;
    }

    const competitions = districtPageCompetitions(districtPageTeam);
    if (!competitions.length) {
        container.innerHTML = districtPageEmpty(
            "Aucune compétition liée à " + teamName,
            "Liez la compétition de cette équipe dans Administration → Synchronisation FFF : ses pages calendrier et classement apparaîtront ici."
        );
        return;
    }

    container.innerHTML = competitions.map(comp => districtPageCard(comp, teamName, districtPageTeam)).join("");
    competitions
        .filter(comp => !comp.pouleKnown)
        .forEach(comp => districtPageResolvePoule(comp.cpNo));
    districtPageDiscoverCompetitions(districtPageTeam);
}

