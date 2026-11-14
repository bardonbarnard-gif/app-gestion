/* Rangueil FC - Roles, permissions et console d'administration
   Partie 7/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
function applyPermissions() {

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';

    // --- MISE À JOUR DU TEXTE DU RÔLE ---
    const roleLabel = document.getElementById("user-role-label");
    if (roleLabel) {
        let roleName = window.currentUserName || "Public";
        
        if (role === "admin") {
            roleName = window.currentUserName ? `${window.currentUserName} (Admin)` : "Administrateur";
        } else if (role === "dirigeant") {
            roleName = window.currentUserName ? `${window.currentUserName} (Dirigeant)` : "Dirigeant";
        } else if (role === "responsable") {
            roleName = window.currentUserName ? `${window.currentUserName} (Responsable)` : "Responsable";
        }else if (role === "coach") {
    roleName = window.currentUserName
        ? `${window.currentUserName} (${userTeam.toUpperCase()})`
        : `Coach ${userTeam.toUpperCase()}`;
}

        roleLabel.textContent = roleName;
    }

    // --- RESTRICTIONS SELON LES RÔLES ---
   if (
    role === 'public' ||
    role === 'dirigeant'
) {

    document
        .querySelectorAll(
            '.admin-only, .adjoint-only, .coach-only'
        )
        .forEach(el => {
            el.style.display = 'none';
        });

    document
        .querySelectorAll(
            'select, input, button.status-btn'
        )
        .forEach(el => {

            if (
                !el.classList.contains(
                    'allow-public'
                )
            ) {
                el.disabled = true;
            }

        });

}
else if (
    role === 'coach' ||
    role === 'responsable'
) {

    document
        .querySelectorAll(
            '.admin-only'
        )
        .forEach(el => {
            el.style.display = 'none';
        });

}

// --- BOUTON AJOUT STAFF ---


// --- AFFICHAGE DU BOUTON ADMIN ---
if (typeof checkAdminAccessUI === "function") {
    checkAdminAccessUI();
}
    
    renderAll();

}


// --- 5. CONSOLE D'ADMINISTRATION & GESTION DES ACCÈS ---

// Affichage dynamique du bouton d'accès à la console Admin si l'utilisateur est admin
function checkAdminAccessUI() {
    const role = window.currentUserRole;
    let adminBtn = document.getElementById("open-admin-console-btn");
    
    if (role === "admin") {
        if (!adminBtn) {
            adminBtn = document.createElement("button");
            adminBtn.id = "open-admin-console-btn";
            adminBtn.innerHTML = '<i class="fa-solid fa-gear mr-1"></i> Gérer les accès';
            adminBtn.className = "fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-full shadow-2xl text-xs font-bold z-40 hover:bg-slate-800 transition flex items-center cursor-pointer";
            adminBtn.onclick = () => toggleAdminModal(true);
            document.body.appendChild(adminBtn);
        } else {
            adminBtn.style.display = "flex";
        }
    } else if (adminBtn) {
        adminBtn.style.display = "none";
    }
}

// Ouvrir ou fermer la modale admin

    window.toggleAdminModal = function(show) {

    const modal =
        document.getElementById(
            "admin-access-modal"
        );

    if (!modal) return;

    if (show) {
        modal.classList.remove("hidden");
    } else {
        modal.classList.add("hidden");
    }

};

function openNewAccountForm() {

    const form =
        document.getElementById(
            "coach-form"
        );

    if (form) {
        form.reset();
    }

    document.getElementById(
        "admin-old-pin"
    ).value = "";

    const functionsContainer =
        document.getElementById(
            "functions-container"
        );

    if (functionsContainer) {
        functionsContainer.innerHTML = "";
    }

    toggleAdminModal(true);

}


// Enregistrement ou mise à jour d'un compte dans Firebase
document.addEventListener("DOMContentLoaded", () => {
    const coachForm = document.getElementById("coach-form");
    if (coachForm) {
        coachForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const pin = document.getElementById("admin-pin").value.trim();

const oldPin =
    document.getElementById("admin-old-pin").value.trim();
   

const firstname =
    document.getElementById(
        "admin-firstname"
    ).value.trim();

const lastname =
    document.getElementById(
        "admin-lastname"
    ).value.trim();

const fullname =
    firstname +
    " " +
    lastname.toUpperCase();

const functions =
    collectFunctions();


const licence =
    document.getElementById("admin-licence").value.trim();

const phone =
    document.getElementById("admin-phone").value.trim();

const email =
    document.getElementById("admin-email").value.trim();

if (pin.length !== 4) {
    showToast("Le code PIN doit comporter exactement 4 chiffres.", "error");
    return;
}

try {

    if (
        oldPin &&
        oldPin !== pin
    ) {
        await firebase.database()
            .ref("rangueil_data/access/" + oldPin)
            .remove();
    }

   // Création du compte d'accès

  await firebase.database()
    .ref("rangueil_data/access/" + pin)
   .set({

    name: fullname,

    firstname: firstname,

    lastname: lastname,

    functions: functions,

    licence: licence,

    phone: phone,

    email: email

});


// Création automatique de la fiche staff


                showToast(`Compte "${fullname}" enregistré avec succès !`);

coachForm.reset();



renderAdminAccounts();
            } catch (error) {
                console.error("Erreur lors de l'enregistrement :", error);
                showToast("Erreur lors de l'enregistrement en base.", "error");
            }
        });
    }
});



// Supprimer un compte de Firebase
window.editCoachAccount = async function(pin) {

    try {

        const snapshot =
            await firebase.database()
                .ref("rangueil_data/access/" + pin)
                .once("value");

        if (!snapshot.exists()) return;

        const data = snapshot.val();

        document.getElementById("admin-pin").value = pin;

        document.getElementById("admin-old-pin").value = pin;

        document.getElementById("admin-firstname").value =
            data.firstname || "";

        document.getElementById("admin-lastname").value =
            data.lastname || "";

        document.getElementById("admin-licence").value =
            data.licence || "";

        document.getElementById("admin-phone").value =
            data.phone || "";

        document.getElementById("admin-email").value =
            data.email || "";

        const container =
    document.getElementById(
        "functions-container"
    );

if (container) {
    container.innerHTML = "";
}

(data.functions || [])
    .forEach(f => {

        addFunctionBlockWithData(
            f
        );

    });

        toggleAdminModal(true);

    } catch (error) {

        console.error(error);

        showToast("Impossible de charger ce compte", "error");

    }
};

// Afficher la liste des équipes dans l'admin et mettre à jour l'application
function renderAdminTeams(teamsData) {
    

    state.teams = teamsData || {};
    renderTeamFilters();
    renderAll();
    
    updateAllTeamDropdowns();
}

// 3. Supprimer une équipe
function deleteTeam(teamKey) {
    if (confirm(`Voulez-vous vraiment supprimer l'équipe ${teamKey} ?`)) {
        firebase.database().ref('teams/' + teamKey).remove();
    }
}

// 4. Mettre à jour dynamiquement tous les sélecteurs <select> d'équipes dans l'app
function updateAllTeamDropdowns() {
    // Cherche tous les éléments <select> qui ont la classe 'team-select' ou l'ID 'm-team', etc.
    const selects = document.querySelectorAll(
    '#m-team, #t-team, #admin-team-select, .team-select'

    );
    

    const keys = Object.keys(state.teams || {});

    selects.forEach(select => {
        if (!select) return;
        select.innerHTML = keys.map(tKey => {
            const team = state.teams[tKey];
            return `<option value="${tKey}">${team.name || tKey.toUpperCase()}</option>`;
        }).join('');
    });
}

// 5. Écouter les équipes en temps réel depuis Firebase (à placer dans votre initialisation globale)
firebase.database().ref('teams').on('value', (snapshot) => {
    const data = snapshot.val() || {};
    renderAdminTeams(data);
});

// ============================================================
// JOUEURS D'UN MATCH — source unique de vérité
// ------------------------------------------------------------
// Renvoie l'effectif concerné par un match : les joueurs de l'équipe
// + les surclassés (joueurs d'une autre équipe convoqués/invités).
//
// Un invité peut être stocké sous trois formes (compatibilité ascendante) :
//   - ID seul           : extraPlayers[id] === true        (nouveau format)
//   - ID + copie joueur : extraPlayers[id] = { ...player } (ancien format)
//   - aucune trace dans extraPlayers, mais présent dans convocations
//     ou slotAssignments (données historiques / matchs réparés)
//
// Dans tous les cas l'ID est résolu depuis l'effectif courant, pour que
// nom, poste et licence restent à jour. Si le joueur a été supprimé de
// l'effectif, on retombe sur la copie enregistrée dans le match.
//
// options.includeAll : true pour un admin/responsable (tout l'effectif
// est listé, afin de pouvoir convoquer n'importe quel joueur).
// Un match est considéré comme joué dès qu'un score est saisi
// ou que son coup d'envoi est déjà passé.
function matchHasBeenPlayed(m) {
    if (!m) return false;

    const hasScore = m.scoreHome !== undefined && m.scoreHome !== null && String(m.scoreHome).trim() !== ''
        && m.scoreAway !== undefined && m.scoreAway !== null && String(m.scoreAway).trim() !== '';
    if (hasScore) return true;

    if (!m.date) return false;
    const start = new Date(m.date + 'T' + (m.heure || '14:30'));
    return !isNaN(start.getTime()) && start < new Date();
}

// Une composition est figée dès que le match a déjà été joué (score saisi
// ou coup d'envoi passé) ou que la feuille de match a été verrouillée.
function getCompositionLock(m) {
    if (!m) return null;
    if (matchHasBeenPlayed(m)) return { type: 'played' };
    if (m.isValidated) return { type: 'validated' };
    return null;
}

function compositionLockMessage(lock) {
    if (!lock) return '';
    return lock.type === 'played'
        ? 'Ce match a déjà été joué : la composition ne peut plus être modifiée.'
        : 'La feuille de match est verrouillée : déverrouille-la pour modifier la composition.';
}

// ---------------------------------------------------------------------------
// Composition prévue (préparation de match)
// En plus du onze de départ (slotAssignments / currentFormation), un match peut
// porter un second onze « planifié » : celui envisagé en 2e mi-temps.
// Le plan est un instantané séparé : il ne modifie jamais le onze de départ.
// ---------------------------------------------------------------------------
// Quatre phases : le onze de départ et trois compositions prévues.
const COMPOSITION_PHASES = {
    start: { label: 'Départ', longLabel: 'Onze de départ', field: null, icon: 'fa-flag-checkered' },
    plan: { label: '2e MT', longLabel: '2e mi-temps', field: 'plannedComposition', icon: 'fa-wand-magic-sparkles' },
    end: { label: 'Fin', longLabel: 'Fin de match', field: 'plannedCompositionEnd', icon: 'fa-wand-magic-sparkles' },
    test: { label: 'Test', longLabel: 'Composition test', field: 'plannedCompositionTest', icon: 'fa-flask' }
};

// Clés des phases prévues (tout sauf le onze de départ), dans l'ordre d'affichage.
const COMPOSITION_PLAN_KEYS = Object.keys(COMPOSITION_PHASES).filter(key => COMPOSITION_PHASES[key].field);
const COMPOSITION_PLAN_FIELDS = COMPOSITION_PLAN_KEYS.map(key => COMPOSITION_PHASES[key].field);

let compositionViewPhase = 'start';
let compositionViewPhaseMatchId = null;

function normalizeCompositionPhaseKey(key) {
    return Object.prototype.hasOwnProperty.call(COMPOSITION_PHASES, key) ? key : 'start';
}

function getCompositionViewPhaseKey() {
    return normalizeCompositionPhaseKey(compositionViewPhase);
}

// Champ du match qui stocke la phase (null pour le onze de départ).
function compositionPhaseField(key) {
    const meta = COMPOSITION_PHASES[normalizeCompositionPhaseKey(key)];
    return meta ? meta.field : null;
}

// Données d'une phase, même forme que les champs historiques :
// { key, formation, slots, benchOrder }. null si la phase n'existe pas.
function getCompositionPhaseData(match, phaseKey) {
    if (!match) return { key: 'start', formation: '433', slots: {}, benchOrder: [] };

    const key = normalizeCompositionPhaseKey(phaseKey);
    const field = compositionPhaseField(key);

    if (field) {
        const plan = match[field];
        if (!plan) return null;
        if (!plan.slots) plan.slots = {};
        return {
            key: key,
            formation: plan.formation || match.currentFormation || '433',
            slots: plan.slots,
            benchOrder: Array.isArray(plan.benchOrder) ? plan.benchOrder : []
        };
    }

    if (!match.slotAssignments) match.slotAssignments = {};
    return {
        key: 'start',
        formation: match.currentFormation || '433',
        slots: match.slotAssignments,
        benchOrder: Array.isArray(match.benchOrder) ? match.benchOrder : []
    };
}

// Phase réellement affichée : retombe sur le départ si le plan a été supprimé.
function getActiveCompositionPhase(match) {
    return getCompositionPhaseData(match, getCompositionViewPhaseKey())
        || getCompositionPhaseData(match, 'start');
}

function setCompositionPhaseBenchOrder(match, phase, ids) {
    if (!match || !phase) return;
    const field = compositionPhaseField(phase.key);
    if (field) {
        if (match[field]) match[field].benchOrder = ids;
        return;
    }
    match.benchOrder = ids;
}

function prunePhaseSlots(match, phaseKey) {
    const data = getCompositionPhaseData(match, phaseKey);
    if (!data) return;
    const valid = new Set(getFormationSlots(data.formation).map(s => s.slot));
    Object.keys(data.slots || {}).forEach(slot => {
        if (!valid.has(slot)) delete data.slots[slot];
    });
}

// Banc d'une phase : convoqués non placés, triés selon l'ordre de cette phase.
function getPhaseBenchPlayers(match, phase) {
    if (!match || !phase) return [];
    const assigned = Object.values(phase.slots || {});
    const players = getMatchPlayers(match)
        .map(item => item.p)
        .filter(p => (match.convocations || {})[p.id] === 'convoke' && !assigned.includes(p.id));

    const rank = new Map((phase.benchOrder || []).map((id, i) => [id, i]));
    return players.sort((a, b) => {
        const ra = rank.has(a.id) ? rank.get(a.id) : Number.MAX_SAFE_INTEGER;
        const rb = rank.has(b.id) ? rank.get(b.id) : Number.MAX_SAFE_INTEGER;
        return ra - rb;
    });
}

function setCompositionPhase(key) {
    compositionViewPhase = normalizeCompositionPhaseKey(key);
    renderMatchComposition();
}
window.setCompositionPhase = setCompositionPhase;

// Chaque nouvelle phase part de la précédente : on n'ajuste ensuite que les
// joueurs qui sortent et ceux qui entrent.
function createCompositionPhase(key) {
    const match = state.matches[state.selectedMatchId];
    if (!match) return;

    const lock = getCompositionLock(match);
    if (lock) {
        showToast(compositionLockMessage(lock), 'error');
        return;
    }

    const phaseKey = normalizeCompositionPhaseKey(key);
    const field = compositionPhaseField(phaseKey);
    if (!field) return;

    if (!match[field]) {
        const order = Object.keys(COMPOSITION_PHASES);
        let previousKey = order[Math.max(0, order.indexOf(phaseKey) - 1)] || 'start';
        if (!getCompositionPhaseData(match, previousKey)) previousKey = 'start';
        const base = getCompositionPhaseData(match, previousKey) || getCompositionPhaseData(match, 'start');

        match[field] = {
            formation: base.formation,
            slots: Object.assign({}, base.slots),
            benchOrder: (base.benchOrder || []).slice(),
            createdAt: new Date().toISOString()
        };
        saveStateToFirebase();
        showToast(`${COMPOSITION_PHASES[phaseKey].longLabel} : composition créée depuis ${COMPOSITION_PHASES[previousKey].longLabel.toLowerCase()}`);
    }

    compositionViewPhase = phaseKey;
    compositionViewPhaseMatchId = match.id;
    renderMatchComposition();
}
window.createCompositionPhase = createCompositionPhase;

// Compatibilité avec les appels précédents (2e mi-temps).
function createPlannedComposition() {
    createCompositionPhase('plan');
}
window.createPlannedComposition = createPlannedComposition;

function deleteCompositionPhase(key) {
    const match = state.matches[state.selectedMatchId];
    if (!match) return;

    const phaseKey = normalizeCompositionPhaseKey(key);
    const field = compositionPhaseField(phaseKey);
    if (!field || !match[field]) return;

    const lock = getCompositionLock(match);
    if (lock) {
        showToast(compositionLockMessage(lock), 'error');
        return;
    }

    if (!confirm(`Supprimer la composition « ${COMPOSITION_PHASES[phaseKey].longLabel} » ? Le onze de départ ne change pas.`)) return;

    delete match[field];
    compositionViewPhase = 'start';
    saveStateToFirebase();
    renderMatchComposition();
    showToast(`${COMPOSITION_PHASES[phaseKey].longLabel} : composition supprimée`);
}
window.deleteCompositionPhase = deleteCompositionPhase;

function deletePlannedComposition() {
    deleteCompositionPhase('plan');
}
window.deletePlannedComposition = deletePlannedComposition;

function matchStartTimestamp(m) {
    if (!m || !m.date) return Number.MAX_SAFE_INTEGER;
    const t = new Date(m.date + 'T' + (m.heure || '14:30')).getTime();
    return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
}

// Non joués d'abord (ordre chronologique), puis déjà joués (ordre chronologique).
function sortMatchesUpcomingFirst(list) {
    return (list || []).slice().sort((a, b) => {
        const playedA = matchHasBeenPlayed(a) ? 1 : 0;
        const playedB = matchHasBeenPlayed(b) ? 1 : 0;
        if (playedA !== playedB) return playedA - playedB;
        return matchStartTimestamp(a) - matchStartTimestamp(b);
    });
}

function getMatchPlayers(m, options) {
    const opts = options || {};
    const includeAll = !!opts.includeAll;
    const teamKey = String((m && m.team) || '').toLowerCase();
    const all = Array.isArray(state.players) ? state.players : [];

    const byId = new Map();
    all.forEach(p => { if (p && p.id) byId.set(p.id, p); });

    const result = [];
    const seen = new Set();

    const push = (p, invite) => {
        if (!p || !p.id || seen.has(p.id)) return;
        seen.add(p.id);
        result.push({ p, invite: !!invite });
    };

    const belongsToTeam = p =>
        String(p.team || p.cat || '').toLowerCase() === teamKey;

    // 1) Effectif de l'équipe (ou effectif complet pour un admin/responsable)
    all.forEach(p => {
        if (!p || !p.id) return;
        if (includeAll || !teamKey || belongsToTeam(p)) push(p, false);
    });

    // 2) Joueurs référencés par le match mais hors effectif de l'équipe
    //    = les surclassés. On se base sur les champs qui font foi.
    const referenced = new Set();
    ['extraPlayers', 'convocations'].forEach(key => {
        Object.keys((m && m[key]) || {}).forEach(id => referenced.add(id));
    });
    Object.values((m && m.slotAssignments) || {}).forEach(id => {
        if (id) referenced.add(id);
    });
    (Array.isArray(m && m.benchOrder) ? m.benchOrder : []).forEach(id => {
        if (id) referenced.add(id);
    });

    referenced.forEach(id => {
        if (seen.has(id)) return;

        const live = byId.get(id);
        if (live) {
            // Joueur toujours dans l'effectif : données à jour
            push(live, true);
            return;
        }

        // Joueur supprimé de l'effectif : on garde la copie du match
        const snapshot = m && m.extraPlayers ? m.extraPlayers[id] : null;
        if (snapshot && typeof snapshot === 'object') {
            push(Object.assign({}, snapshot, { id: snapshot.id || id }), true);
        }
        // Sans copie, impossible de l'afficher : on l'ignore silencieusement.
    });

    return result;
}

// Joueurs convoqués d'un match (IDs résolus), pour les compteurs et les listes
function getMatchConvoked(m) {
    const conv = (m && m.convocations) || {};
    return getMatchPlayers(m)
        .filter(item => conv[item.p.id] === 'convoke')
        .map(item => item.p);
}

function buildCarpoolSummary(m, playersForMatch) {
    const carpoolResponses = state.carpoolResponses?.[m.carpoolId] || {};

    const convokedPlayers = (playersForMatch || [])
        .filter(p => m.convocations[p.id] === 'convoke');
    const totalConvoked = convokedPlayers.length;
    const convokedIds = new Set(convokedPlayers.map(p => p.id));

    // On ne compte que les réponses des joueurs réellement convoqués :
    // une réponse orpheline (joueur dé-convoqué) ne doit pas fausser le compteur.
    const responses = Object.keys(carpoolResponses)
        .filter(id => convokedIds.has(id)).length;

    // Résolution des noms : liste du match d'abord (contient les surclassés),
    // puis effectif complet pour les réponses hors liste.
    const playerById = new Map();
    (playersForMatch || []).forEach(p => { if (p && p.id) playerById.set(p.id, p); });
    (state.players || []).forEach(p => { if (p && p.id && !playerById.has(p.id)) playerById.set(p.id, p); });
    const nameOf = id => (playerById.get(id) || {}).name || id;

    let drivers = 0;
    let passengers = 0;
    let directs = 0;
    let absents = 0;
    let seats = 0;

    const driverList = [];
    const driverNoSeatList = [];
    const passengerList = [];
    const directList = [];
    const absentList = [];
    const driverAssignments = [];
    const placedIds = new Set();

    Object.entries(carpoolResponses)
        .forEach(([playerId, r]) => {

            const playerName = nameOf(playerId);

            if (r.status === 'driver') {

                if ((r.seats || 0) > 0) {

                    drivers++;
                    seats += r.seats || 0;

                    const passengerIds = Array.isArray(r.passengers)
                        ? r.passengers.slice(0, r.seats || 0)
                        : [];

                    passengerIds.forEach(id => placedIds.add(id));

                    driverList.push(
                        `${playerName} (${r.seats || 0} places)`
                    );

                    driverAssignments.push({
                        id: playerId,
                        name: playerName,
                        seats: r.seats || 0,
                        passengerIds,
                        passengerNames: passengerIds.map(
                            id => nameOf(id)
                        )
                    });

                } else {

                    driverNoSeatList.push(playerName);

                }

            }

            if (r.status === 'passenger') {

                passengers++;
                passengerList.push(playerName);

            }

            if (r.status === 'direct') {

                directs++;
                directList.push(playerName);

            }

            if (r.status === 'absent') {

                absents++;
                absentList.push(playerName);

            }

        });

    const toPlaceListIds = Object.entries(carpoolResponses)
        .filter(([playerId, r]) => r.status === 'passenger' && !placedIds.has(playerId))
        .map(([playerId]) => playerId);

    const toPlaceList = toPlaceListIds.map(
        id => nameOf(id)
    );

    const availablePassengers = toPlaceListIds
        .map(id => playerById.get(id))
        .filter(Boolean)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map(p => ({ id: p.id, name: p.name }));

    const pendingList = [];

    playersForMatch.forEach(p => {

        if (
            m.convocations[p.id] === 'convoke' &&
            !carpoolResponses[p.id]
        ) {

            pendingList.push(
                p.name
            );

        }

    });

    const pending = totalConvoked - responses;
    const missingSeats = passengers - seats;
    const closed = !!m.carpoolClosed;

    let transportStatus;
    let transportClass;

    if (closed) {

        transportStatus = '🔒 Covoiturage confirmé par le coach';
        transportClass = 'text-sky-700';

    } else if (toPlaceList.length > 0) {

        transportStatus = `🔴 ${toPlaceList.length} passager(s) à placer`;
        transportClass = 'text-red-700';

    } else if (missingSeats > 0) {

        transportStatus = `🔴 Il manque ${missingSeats} place(s)`;
        transportClass = 'text-red-700';

    } else if (responses === 0) {

        transportStatus = '⏳ Aucune réponse pour l\'instant';
        transportClass = 'text-amber-700';

    } else if (pendingList.length > 0) {

        transportStatus = `⏳ En attente de ${pendingList.length} réponse(s)`;
        transportClass = 'text-amber-700';

    } else {

        transportStatus = '🟢 Transport assuré — tout le monde a répondu';
        transportClass = 'text-emerald-700';

    }

    return {
        matchId: m.id,
        drivers,
        passengers,
        directs,
        absents,
        responses,
        pending,
        seats,
        totalConvoked,
        driverList,
        driverNoSeatList,
        passengerList,
        directList,
        absentList,
        pendingList,
        toPlaceList,
        driverAssignments,
        availablePassengers,
        missingSeats,
        transportStatus,
        transportClass,
        closed
    };
}

// --- Cartes visuelles de l'onglet Infos Match ---
