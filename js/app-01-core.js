/* Rangueil FC - PIN, configuration, etat et synchronisation Firebase
   Partie 1/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
document.addEventListener("DOMContentLoaded", () => {
    const pinScreen = document.getElementById("pin-screen");
    const pinInput = document.getElementById("pin-input");
    const pinError = document.getElementById("pin-error");
   


    /// Vérifier si l'utilisateur s'est déjà authentifié durant cette session
    const savedUserStr = sessionStorage.getItem("currentUserData");
    if (savedUserStr) {
        try {
            const userData = JSON.parse(savedUserStr);
            window.currentUserPin =
    userData.pin || null;
            window.currentUserRole = userData.role; // On garde la compatibilité avec vos permissions
            window.currentUserName = userData.name; // Optionnel : pour stocker le nom du coach
            window.currentUserTeam = userData.team || 'all';

            if (pinScreen) pinScreen.style.display = "none";
            applyPermissions(); 
            return;
        } catch (e) {
            sessionStorage.removeItem("currentUserData");
        }
    }

    if (pinInput) {
        pinInput.focus();
        const pinDots = Array.from(document.querySelectorAll(".pin-dot"));
        const syncPinDots = () => {
            const len = pinInput.value.length;
            pinDots.forEach((dot, i) => dot.classList.toggle("filled", i < len));
        };
        pinInput.addEventListener("input", syncPinDots);
        pinInput.addEventListener("input", async (e) => {
            const enteredPin = e.target.value;

            if (enteredPin.length === 4) {
                try {
                    await window.authReady;
                    // Interrogation de Firebase Realtime Database
                    const pinRef = firebase.database().ref("rangueil_data/access/" + enteredPin);
                    const snapshot = await pinRef.once("value");

                    if (snapshot.exists()) {
                        const userData = snapshot.val(); 
                        userData.pin = enteredPin;

window.currentUserPin = enteredPin;
                        // userData contient par exemple : { name: "Thomas", role: "admin", team: "U14" }

                        // On mémorise les infos utilisateur
                        window.currentUserName =
    userData.name;

if (
    (userData.functions || []).length > 1
) {

    showFunctionSelector(
        userData
    );

    return;

}
if (userData.role === "admin") {

    window.currentUserRole =
        "admin";

    window.currentUserName =
        userData.name;

    window.currentUserTeam =
        "all";

    sessionStorage.setItem(
        "currentUserData",
        JSON.stringify(userData)
    );

    sessionStorage.setItem(
        "currentUserRole",
        "admin"
    );

    sessionStorage.setItem(
        "isUnlocked",
        "true"
    );

    if (pinScreen) {

        pinScreen.style.opacity = "0";

        pinScreen.style.transition =
            "opacity 0.3s ease";

        setTimeout(() => {

            pinScreen.remove();

            applyPermissions();

        }, 300);

    }

    return;

}

const selectedFunction =
    (userData.functions || [])[0];

let role = "public";

if (
    selectedFunction?.functionName ===
    "Administrateur système"
) {
    role = "admin";
}

const functionName =
    selectedFunction?.functionName || "";

if (functionName.startsWith("Responsable")) {
    role = "responsable";
}

if (
    selectedFunction?.functionName === "Éducateur principal" ||
    selectedFunction?.functionName === "Éducateur adjoint" ||
    selectedFunction?.functionName === "Coach Principal" ||
    selectedFunction?.functionName === "Coach Adjoint"
) {
    role = "coach";
}

window.currentUserRole =
    role;

window.currentUserName =
    userData.name;

window.currentUserTeam =
    (selectedFunction?.scopes || [])
        .join(",");

sessionStorage.setItem(
    "currentUserData",
    JSON.stringify({
        ...userData,
        role: role,
        team: window.currentUserTeam
    })
);

sessionStorage.setItem(
    "currentUserRole",
    role
);

sessionStorage.setItem(
    "isUnlocked",
    "true"
);


if (pinScreen) {

    pinScreen.style.opacity = "0";

    pinScreen.style.transition =
        "opacity 0.3s ease";

    setTimeout(() => {

        pinScreen.remove();

        applyPermissions();

    }, 300);

}
                    } else {
                        // Code incorrect trouvé dans Firebase
                        if (pinError) pinError.style.display = "block";
                        pinInput.value = "";
                    }
                } catch (error) {
                    console.error("Erreur de connexion à Firebase pour le PIN :", error);
                    if (pinError) {
                        pinError.textContent = "Erreur de connexion";
                        pinError.style.display = "block";
                    }
                    pinInput.value = "";
                }
            } else {
                if (pinError) pinError.style.display = "none";
            }
        });
    }
});


 // --- 1. CONFIGURATION & PWA ---
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
        }

        const firebaseConfig = window.firebaseConfig;

        try { firebase.initializeApp(firebaseConfig); } catch(e) {}
        window.authReady = firebase.auth().signInAnonymously().catch(function (err) {
            console.error("Auth anonyme indisponible :", err);
        });
        const db = firebase.database();

        // Données initiales par défaut (Effectif de base)
const defaultPlayers = [
            { id: "J001", name: "BAILLARIN Theo", licence: "9603227294", phonePere: "06 76 16 72 65", team: "u14", poste1: "AD", poste2: "BU", poste3: "MC", blessure: false, blessureDateDebut: null, blessureRetour: null },
            { id: "J002", name: "BAZABAS Mael", licence: "9604869553", phonePere: "06 48 62 75 80", team: "u14", poste1: "BU", poste2: "AG", poste3: "-", blessure: false, blessureDateDebut: null, blessureRetour: null },
            { id: "J003", name: "BEAULIEU Barthelemy", licence: "9602804942", phonePere: "06 61 53 24 85", team: "u14", poste1: "DC", poste2: "MDC", poste3: "-", blessure: false, blessureDateDebut: null, blessureRetour: null },
            { id: "J018", name: "BONNEFIS Antoine", licence: "9603191094", phonePere: "06 22 34 04 20", team: "u13", poste1: "AD", poste2: "DD", poste3: "-", blessure: false, blessureDateDebut: null, blessureRetour: null },
            { id: "J004", name: "BOUAJAJ Ibrahim", licence: "9605352704", phonePere: "06 95 84 64 94", team: "u14", poste1: "DC", poste2: "MDC", poste3: "-", blessure: false, blessureDateDebut: null, blessureRetour: null },
            { id: "J019", name: "FRESQUET Jules", licence: "9603971174", phonePere: "-", team: "u13", poste1: "MC", poste2: "MO", poste3: "-" }
        ];

        // --- 2. ÉTAT GLOBAL DE L'APPLICATION ---
   let state = {
    players: [],
    matches: {},
    trainings: {},
    cards: {},
    stats: {},
    staff: [],
    teams: {},
    events: {},
    carpoolResponses: {},
    settings: {},
    exerciseTemplates: [],
    fffClubNo: 18707,
    fffApiBase: "https://api-dofa.fff.fr/api",
    fffLinks: {},
    fffProxyUrl: "",
    fffCompJson: {},
};

// Variables d'interface uniquement
let selectedMatchId = null;
let currentCatFilter = 'all';
let currentEffectifTab = 'joueurs';
let effectifSortMode = 'default';
let activeSection = 'dashboard';

// Référence de comparaison pour l'écriture différentielle (voir saveStateToFirebase)
let _lastSaved = null;
// Empreinte des données de référence : évite de re-cloner tout l'état à chaque snapshot
let _lastSavedSig = null;
// Empreinte de la dernière donnée réellement affichée (voir scheduleRender)
let _renderSig = null;
// Rendu différé en cours : identifiant du minuteur
let _renderTimer = null;
// État du dernier enregistrement : "idle" | "pending" | "saved" | "error"
let _saveStatus = "idle";

        // --- 3. SYNCHRONISATION FIREBASE ---
        db.ref('rangueil_data').on('value', (snapshot) => {
            try {
                const data = snapshot.val();
                if (!data || !data.players || data.players.length === 0) {
                    state.players = defaultPlayers;
                    state.matches = (data && data.matches) || {};
                    state.trainings = (data && data.trainings) || {};
                    state.cards = (data && data.cards) || {};
                    state.stats = (data && data.stats) || {};
                    state.staff = (data && data.staff) || [];
                    state.settings = (data && data.settings) || { trainingDays: [2, 5] };
                    state.fffClubNo = (data && data.fffClubNo) || 18707;
                    state.fffApiBase = (data && data.fffApiBase) || "https://api-dofa.fff.fr/api";
                    state.fffLinks = (data && data.fffLinks) || {};
                    state.fffProxyUrl = (data && data.fffProxyUrl) || "";
                    state.fffCompJson = (data && data.fffCompJson) || {};
                    saveStateToFirebase();
                } else {
                    state.players = (data.players || []).map(p => {
                        // Migration : convertir cat → team si nécessaire
                        if (!p.team && p.cat) {
                            p.team = p.cat;
                        }
                        return p;
                    });
                    state.matches = data.matches || {};
                    state.cards = data.cards || {};
                    state.stats = data.stats || {};
                    state.events = data.events || {};
    state.staff = Object.values(
    data.staff || {}
);
state.carpoolResponses =
    data.carpoolResponses || {};
state.settings =
    data.settings || { trainingDays: [2, 5] };
state.exerciseTemplates =
    data.exerciseTemplates || [];
state.fffClubNo =
    data.fffClubNo || 18707;
state.fffApiBase =
    data.fffApiBase || "https://api-dofa.fff.fr/api";
state.fffLinks =
    data.fffLinks || {};
state.fffProxyUrl =
    data.fffProxyUrl || "";
state.fffCompJson =
    data.fffCompJson || {};
                    // Migration ancien format numérique → nouveau format objet
                    const rawTrainings = data.trainings || {};
                    if (Object.keys(rawTrainings).length > 0 && !isNaN(Object.keys(rawTrainings)[0])) {
                        state.trainings = {};
                        Object.entries(rawTrainings).forEach(([num, presData]) => {
                            const id = 'T_legacy_' + num;
                            state.trainings[id] = {
    id,
    title: 'Séance E' + String(num).padStart(2,'0'),
    date: '',
    heure: '18:00',
    theme: '',
    team: 'U14',
    presence: presData,
    pdfData: null,
    pdfName: null
};
                        });
                    } else {
                        state.trainings = rawTrainings;
                    }
                }
                
               const matchKeys = Object.keys(state.matches);

if (
    state.selectedMatchId &&
    !state.matches[state.selectedMatchId]
) {
    state.selectedMatchId = null;
} 

                applyPlayerNameDisplay();
                const syncPayload = collectStateForSave();
                const syncSig = syncSignature(syncPayload);
                // La référence de comparaison suit l'état du serveur — sauf
                // pendant une écriture ou après un échec : sinon une
                // modification non confirmée serait tenue pour enregistrée.
                // Le clone profond n'est refait que si les données ont bougé.
                if (_saveStatus === "idle" || _saveStatus === "saved") {
                    if (syncSig !== _lastSavedSig) {
                        _lastSaved = JSON.parse(JSON.stringify(syncPayload));
                        _lastSavedSig = syncSig;
                    }
                }
                // Rendu différé : l'écho local puis l'accusé serveur d'une même
                // écriture ne déclenchent plus qu'un seul rendu complet.
                scheduleRender();
            } catch(err) {
                console.error("Erreur de synchronisation :", err);
            }
        });

// --- Écriture différentielle -------------------------------------------------
// Avant : chaque enregistrement réécrivait TOUS les nœuds de rangueil_data.
// Firebase remplaçait alors les enfants par la copie du client, y compris
// ceux qu'il n'avait pas modifiés : le travail d'un autre éducateur connecté
// en même temps (convocation, réponse covoiturage, score) était écrasé.
// Désormais on n'envoie que les chemins réellement modifiés, en un seul
// update() multi-chemins atomique.

function isPlainObject(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}

// Comparaison stable (clés triées) : évite une écriture inutile quand
// Firebase renvoie les mêmes objets dans un ordre différent.
function stableStringify(value) {
    if (Array.isArray(value)) {
        return "[" + value.map(stableStringify).join(",") + "]";
    }
    if (isPlainObject(value)) {
        return "{" + Object.keys(value).sort()
            .map(key => JSON.stringify(key) + ":" + stableStringify(value[key]))
            .join(",") + "}";
    }
    return JSON.stringify(value === undefined ? null : value);
}

function collectStateForSave() {
    return {
        players: getPlayersForStorage(),
        matches: state.matches,
        trainings: state.trainings,
        cards: state.cards,
        stats: state.stats,
        staff: state.staff,
        teams: state.teams,
        events: state.events,
        carpoolResponses: state.carpoolResponses,
        exerciseTemplates: state.exerciseTemplates,
        settings: state.settings,
        fffClubNo: state.fffClubNo,
        fffApiBase: state.fffApiBase,
        fffLinks: state.fffLinks,
        fffProxyUrl: state.fffProxyUrl,
        fffCompJson: state.fffCompJson
    };
}

// --- Empreinte de synchronisation -------------------------------------------
// Firebase émet un snapshot à chaque changement, y compris l'écho de nos
// propres écritures (événement local, puis accusé serveur avec des données
// identiques) : sans garde-fou, un seul enregistrement relançait deux rendus
// complets de la section active. On compare donc une empreinte des données
// avant de redessiner.
// Les PDF encodés en base64 pèsent l'essentiel du volume : ils sont réduits à
// leur taille, sinon l'empreinte coûterait aussi cher que le clone qu'elle évite.
function syncSignature(payload) {
    const light = Object.assign({}, payload);
    if (light.trainings) {
        const trainings = {};
        Object.keys(light.trainings).forEach(id => {
            const training = Object.assign({}, light.trainings[id] || {});
            if ("pdfData" in training) {
                training.pdfData = training.pdfData
                    ? "[pdf:" + String(training.pdfData).length + "]"
                    : null;
            }
            trainings[id] = training;
        });
        light.trainings = trainings;
    }
    return stableStringify(light);
}

// Regroupe les rendus déclenchés coup sur coup et ignore ceux qui n'ont rien
// de nouveau à afficher (accusé serveur, snapshots identiques).
function scheduleRender() {
    if (_renderTimer) return;
    _renderTimer = setTimeout(() => {
        _renderTimer = null;
        // Empreinte recalculée au moment du rendu : l'état a pu changer
        // entre l'émission du snapshot et l'exécution du minuteur.
        const sig = syncSignature(collectStateForSave());
        if (sig === _renderSig) return;
        _renderSig = sig;
        renderSection(activeSection);
    }, 60);
}

// Retient l'état qui vient d'être écrit, pour que le prochain snapshot sache
// ce qui a réellement changé.
function rememberSaved(saved) {
    _lastSaved = saved;
    _lastSavedSig = syncSignature(saved);
}

// N'émet que les chemins dont la valeur a changé. Les tableaux (players,
// staff, exerciseTemplates) sont traités en bloc : un décalage d'index
// produirait un état incohérent.
function buildPatch(prev, next, path, patch) {
    if (isPlainObject(prev) && isPlainObject(next)) {
        const keys = new Set(Object.keys(prev).concat(Object.keys(next)));
        keys.forEach(key => {
            const childPath = path ? path + "/" + key : key;
            if (!(key in next)) patch[childPath] = null;              // suppression
            else if (!(key in prev)) patch[childPath] = next[key];    // ajout
            else buildPatch(prev[key], next[key], childPath, patch);  // on descend
        });
        return;
    }
    if (stableStringify(prev) !== stableStringify(next)) patch[path] = next;
}

// --- Retour visuel de l'enregistrement --------------------------------------
// Sans cela, une écriture refusée par Firebase (règles, quota, coupure) échouait
// en silence : l'utilisateur voyait son écran à jour et croyait avoir enregistré.
let _saveStatusTimer = null;

function setSaveStatus(state, label) {
    const el = document.getElementById("save-status");
    if (!el) return;
    if (_saveStatusTimer) { clearTimeout(_saveStatusTimer); _saveStatusTimer = null; }

    el.dataset.state = state;
    el.classList.toggle("is-visible", state !== "idle");

    const text = el.querySelector(".save-status__label");
    if (text) text.textContent = label || "";
    el.title = label || "";
    el.setAttribute("aria-label", label || "");
    el.onclick = (state === "error") ? retrySave : null;
    el.style.cursor = (state === "error") ? "pointer" : "";
}

function markSaved() {
    _saveStatus = "saved";
    setSaveStatus("saved", "Enregistré");
    _saveStatusTimer = setTimeout(() => setSaveStatus("idle", ""), 2500);
}

function markSaveError(err) {
    _saveStatus = "error";
    // _lastSaved n'est volontairement PAS mis à jour : la modification reste
    // en attente et sera renvoyée au prochain enregistrement ou au clic.
    setSaveStatus("error", "Non enregistré");
    console.error("Écriture Firebase refusée :", err);
    if (typeof showToast === "function") {
        showToast("Enregistrement impossible — clique sur l'indicateur pour réessayer", "error");
    }
}

function retrySave() {
    if (_saveStatus !== "error") return;
    _saveStatus = "idle";
    saveStateToFirebase();
}

function saveStateToFirebase() {

    recalculateGlobalStats();

    const next = collectStateForSave();
    const frozen = JSON.parse(JSON.stringify(next));

    // Premier enregistrement de la session : on écrit tout, puis on retient
    // la référence à laquelle comparer les prochaines modifications.
    if (!_lastSaved) {
        _saveStatus = "pending";
        setSaveStatus("pending", "Enregistrement…");
        db.ref('rangueil_data').update(next)
            .then(() => { rememberSaved(frozen); markSaved(); })
            .catch(markSaveError);
        return;
    }

    const patch = {};
    buildPatch(_lastSaved, next, "", patch);

    // Rien n'a changé : aucune écriture réseau.
    if (!Object.keys(patch).length) return;

    _saveStatus = "pending";
    setSaveStatus("pending", "Enregistrement…");

    db.ref('rangueil_data').update(patch)
        .then(() => { rememberSaved(frozen); markSaved(); })
        .catch(markSaveError);
}

        // --- 4. NAVIGATION & ONGLETS ---

        