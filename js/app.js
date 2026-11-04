// Ajouter les styles CSS pour la feuille de match
const feuilleStyles = `
    .feuille-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        overflow: auto;
    }
    
    .feuille-modal.open {
        opacity: 1;
    }
    
    .feuille-toolbar {
        position: sticky;
        top: 0;
        background: white;
        padding: 10px;
        display: flex;
        gap: 10px;
        border-bottom: 1px solid #ccc;
        z-index: 10000;
    }
    
    .feuille-toolbar button {
        padding: 8px 15px;
        background: #0284c7;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        font-size: 13px;
    }
    
    .feuille-toolbar button:hover {
        background: #0369a1;
    }
    
    .feuille-toolbar .btn-print {
        background: #16a34a;
    }
    
    .feuille-toolbar .btn-print:hover {
        background: #15803d;
    }
    
    .a4-sheet {
        width: 210mm;
        height: 297mm;
        padding: 10mm;
        margin: 20px auto;
        background: white;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    
    @media print {
        body, html {
            margin: 0;
            padding: 0;
            background: white;
            width: 100%;
            height: 100%;
        }
        
        .feuille-modal {
            position: static;
            background: white;
            display: block;
            opacity: 1;
            overflow: visible;
        }
        
        .feuille-toolbar {
            display: none;
        }
        
        .a4-sheet {
            width: 100%;
            height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none;
            page-break-after: always;
        }
        
        #feuille-print {
            width: 100%;
            height: auto;
        }
    }
`;

const styleElement = document.createElement('style');
styleElement.textContent = feuilleStyles;
document.head.appendChild(styleElement);

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
    fffLastSync: null,
    fffAutoSync: true,
    fffProxyUrl: "",
    fffManualJson: "",
    fffCompJson: {},
};

// Variables d'interface uniquement
let selectedMatchId = null;
let currentCatFilter = 'all';
let currentEffectifTab = 'joueurs';
let activeSection = 'dashboard';

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
                    state.fffLastSync = (data && data.fffLastSync) || null;
                    state.fffAutoSync = (data && data.fffAutoSync) !== false;
                    state.fffProxyUrl = (data && data.fffProxyUrl) || "";
                    state.fffManualJson = (data && data.fffManualJson) || "";
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
state.fffLastSync =
    data.fffLastSync || null;
state.fffAutoSync =
    data.fffAutoSync !== false;
state.fffProxyUrl =
    data.fffProxyUrl || "";
state.fffManualJson =
    data.fffManualJson || "";
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
                renderSection(activeSection);
                maybeAutoSyncFFF();
            } catch(err) {
                console.error("Erreur de synchronisation :", err);
            }
        });

function saveStateToFirebase() {

    recalculateGlobalStats();

 const dataToSave = {
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
    fffLastSync: state.fffLastSync,
    fffAutoSync: state.fffAutoSync,
    fffProxyUrl: state.fffProxyUrl,
    fffManualJson: state.fffManualJson,
    fffCompJson: state.fffCompJson
};

db.ref('rangueil_data').update(dataToSave);
        }

        // --- 4. NAVIGATION & ONGLETS ---

        function logoutUser() {

    sessionStorage.removeItem("currentUserData");
    sessionStorage.removeItem("currentUserRole");
    sessionStorage.removeItem("isUnlocked");

    window.currentUserRole = null;
    window.currentUserName = null;
    window.currentUserTeam = null;

    location.reload();
}

        window.logoutUser = logoutUser;

        function renderAll() {
            applyPlayerNameDisplay();
            renderDashboard();
            renderTeamFilters();
            renderEffectif();
            populateMatchSelector();
            renderMatchDetail();
            renderMatchesResultsList();
            renderEntrainements();
            renderStaffV2();
            renderCalendar();
            
        }

        function renderSection(tabId) {
            switch (tabId) {
                case 'dashboard':
                    renderDashboard();
                    break;
                case 'effectif':
                    renderTeamFilters();
                    renderEffectif();
                    break;
                case 'matchs':
                    renderTeamFilters();
                    populateMatchSelector();
                    renderMatchesResultsList();
                    renderMatchDetail();
                    break;
                case 'entrainements':
                    renderTeamFilters();
                    renderEntrainements();
                    break;
                case 'district':
                    // Accès direct aux sites officiels : aucun import automatique.
                    break;
                case 'calendrier':
                    renderCalendar();
                    break;
                case 'staff':
                    renderStaffV2();
                    break;
                case 'admin':
                    break;
            }
        }

        // === FONCTION GLOBALE : Couleurs d'équipe ===
        function getTeamColorClasses(teamKey) {
            // Récupère la couleur stockée en Firebase pour cette équipe
            const colorName = state.teams?.[teamKey]?.color || 'slate';
            
           const createColor = (name) => ({
    bg: `bg-${name}-50`,
    bgDark: `bg-${name}-100`,
    bgButton: `bg-${name}-500`,
    border: `border-${name}-300`,
    borderDark: `border-${name}-400`,
    text: `text-${name}-800`,
    textBold: `text-${name}-900`,
    textLight: `text-${name}-600`,
    badge: `bg-${name}-200 text-${name}-900`,
    badgeDark: `bg-${name}-600 text-white`
});

const colorMap = {
    sky: createColor('sky'),
    blue: createColor('blue'),
    indigo: createColor('indigo'),
    violet: createColor('violet'),
    purple: createColor('purple'),
    fuchsia: createColor('fuchsia'),
    pink: createColor('pink'),
    rose: createColor('rose'),

    red: createColor('red'),
    orange: createColor('orange'),
    amber: createColor('amber'),
    yellow: createColor('yellow'),
    lime: createColor('lime'),

    green: createColor('green'),
    emerald: createColor('emerald'),
    teal: createColor('teal'),
    cyan: createColor('cyan'),

    slate: createColor('slate'),
    gray: createColor('gray'),
    zinc: createColor('zinc'),
    neutral: createColor('neutral'),
    stone: createColor('stone'),

    skyDark: {
        bg: 'bg-sky-100',
        bgDark: 'bg-sky-200',
        bgButton: 'bg-sky-700',
        border: 'border-sky-500',
        borderDark: 'border-sky-600',
        text: 'text-sky-900',
        textBold: 'text-sky-950',
        textLight: 'text-sky-700',
        badge: 'bg-sky-300 text-sky-950',
        badgeDark: 'bg-sky-700 text-white'
    },

    blueDark: {
        bg: 'bg-blue-100',
        bgDark: 'bg-blue-200',
        bgButton: 'bg-blue-700',
        border: 'border-blue-500',
        borderDark: 'border-blue-600',
        text: 'text-blue-900',
        textBold: 'text-blue-950',
        textLight: 'text-blue-700',
        badge: 'bg-blue-300 text-blue-950',
        badgeDark: 'bg-blue-700 text-white'
    },

    indigoDark: {
        bg: 'bg-indigo-100',
        bgDark: 'bg-indigo-200',
        bgButton: 'bg-indigo-700',
        border: 'border-indigo-500',
        borderDark: 'border-indigo-600',
        text: 'text-indigo-900',
        textBold: 'text-indigo-950',
        textLight: 'text-indigo-700',
        badge: 'bg-indigo-300 text-indigo-950',
        badgeDark: 'bg-indigo-700 text-white'
    },

    greenDark: {
        bg: 'bg-green-100',
        bgDark: 'bg-green-200',
        bgButton: 'bg-green-700',
        border: 'border-green-500',
        borderDark: 'border-green-600',
        text: 'text-green-900',
        textBold: 'text-green-950',
        textLight: 'text-green-700',
        badge: 'bg-green-300 text-green-950',
        badgeDark: 'bg-green-700 text-white'
    },

    emeraldDark: {
        bg: 'bg-emerald-100',
        bgDark: 'bg-emerald-200',
        bgButton: 'bg-emerald-700',
        border: 'border-emerald-500',
        borderDark: 'border-emerald-600',
        text: 'text-emerald-900',
        textBold: 'text-emerald-950',
        textLight: 'text-emerald-700',
        badge: 'bg-emerald-300 text-emerald-950',
        badgeDark: 'bg-emerald-700 text-white'
    },

    purpleDark: {
        bg: 'bg-purple-100',
        bgDark: 'bg-purple-200',
        bgButton: 'bg-purple-700',
        border: 'border-purple-500',
        borderDark: 'border-purple-600',
        text: 'text-purple-900',
        textBold: 'text-purple-950',
        textLight: 'text-purple-700',
        badge: 'bg-purple-300 text-purple-950',
        badgeDark: 'bg-purple-700 text-white'
    },

    redDark: {
        bg: 'bg-red-100',
        bgDark: 'bg-red-200',
        bgButton: 'bg-red-700',
        border: 'border-red-500',
        borderDark: 'border-red-600',
        text: 'text-red-900',
        textBold: 'text-red-950',
        textLight: 'text-red-700',
        badge: 'bg-red-300 text-red-950',
        badgeDark: 'bg-red-700 text-white'
    },

    orangeDark: {
        bg: 'bg-orange-100',
        bgDark: 'bg-orange-200',
        bgButton: 'bg-orange-700',
        border: 'border-orange-500',
        borderDark: 'border-orange-600',
        text: 'text-orange-900',
        textBold: 'text-orange-950',
        textLight: 'text-orange-700',
        badge: 'bg-orange-300 text-orange-950',
        badgeDark: 'bg-orange-700 text-white'
    },

    tealDark: {
        bg: 'bg-teal-100',
        bgDark: 'bg-teal-200',
        bgButton: 'bg-teal-700',
        border: 'border-teal-500',
        borderDark: 'border-teal-600',
        text: 'text-teal-900',
        textBold: 'text-teal-950',
        textLight: 'text-teal-700',
        badge: 'bg-teal-300 text-teal-950',
        badgeDark: 'bg-teal-700 text-white'
    }
};

            if (!colorMap[colorName]) {
    console.warn(
        "Couleur inconnue pour l'équipe :",
        teamKey,
        colorName
    );
}

return colorMap[colorName] || colorMap.slate;
        }

       function switchTab(tabId) {

    if (tabId === 'matchs') {
        state.selectedMatchId = null;

        const selector = document.getElementById('match-selector');
        if (selector) {
            selector.value = '';
        }
    }

    ['dashboard', 'dashboard-cards', 'dashboard-bilan', 'dashboard-stats', 'effectif', 'matchs', 'entrainements', 'calendrier','district','staff','admin'].forEach(t => {
                const sec = document.getElementById(`sec-${t}`);
                if(sec) sec.classList.add('hidden');
                const btn = document.getElementById(`tab-${t}`);
                if (btn) btn.classList.remove('bg-white/20', 'text-white');
                const mobBtn = document.getElementById(`mob-tab-${t}`);
                if (mobBtn) mobBtn.classList.remove('active');
            });

            const targetSec = document.getElementById(`sec-${tabId}`);
            if(targetSec) targetSec.classList.remove('hidden');
            const activeBtn = document.getElementById(`tab-${tabId}`);
            if (activeBtn) activeBtn.classList.add('bg-white/20', 'text-white');
            const activeMobBtn = document.getElementById(`mob-tab-${tabId}`);
            if (activeMobBtn) activeMobBtn.classList.add('active');
            activeSection = tabId;
            renderSection(tabId);
        }

    function switchMatchSubTab(subTabId) {

    if (!subTabId) {
        subTabId = 'results';
    }

    const tabs = [
        'results',
        'infos',
        'convocations',
        'transport',
        'composition'
    ];

    tabs.forEach(tab => {
        const section = document.getElementById(`subtab-${tab}`);
        if (section) {
            section.classList.add('hidden');
        }

        const button = document.getElementById(`subtab-${tab}-btn`);
        if (button) {
            button.className =
                "pb-2 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-1.5 transition";
        }
    });

    const activeSection =
        document.getElementById(`subtab-${subTabId}`);

    if (activeSection) {
        activeSection.classList.remove('hidden');
    }

    const activeButton =
        document.getElementById(`subtab-${subTabId}-btn`);

    if (activeButton) {
        activeButton.className =
            "pb-2 text-xs font-bold border-b-2 border-sky-600 text-sky-600 flex items-center space-x-1.5 transition";
    }

    // Toute ouverture manuelle de la composition annule le retour vers la séance
    if (subTabId === 'composition') {
        window.compositionReturnTrainingId = null;
    }

    if (subTabId === 'results') {
        renderMatchesResultsList();
    }

    if (
    subTabId === 'infos' ||
    subTabId === 'convocations' ||
    subTabId === 'transport'
) {
    renderMatchDetail();
}

if (subTabId === 'composition') {
    renderMatchComposition();
}
}

        // --- 5. MODULES D'AFFICHAGE & RENDU ---
        
        // Utilitaires de calculs & badges
        function getPlayerPostesList(p) {
            const p1 = p.poste1 || '-';
            const p2 = p.poste2 || '-';
            const p3 = p.poste3 || '-';
            return [p1, p2, p3].filter(x => x && x !== '-');
        }

        // --- Ordre d'affichage des noms (Prénom avant Nom) ---
        // Le nom reste stocké au format « NOM Prénom » : seul l'affichage change.
        function splitPlayerName(rawName) {
            const name = String(rawName || '').trim().replace(/\s+/g, ' ');
            if (!name) return { prenom: '', nom: '' };

            const words = name.split(' ');
            let cut = 0;
            // Le nom s'arrête au premier mot qui n'est pas entièrement en majuscules
            while (cut < words.length && words[cut] === words[cut].toUpperCase() && /\p{Lu}/u.test(words[cut])) cut++;

            if (cut === 0) {
                if (words.length === 1) return { prenom: name, nom: '' };
                return { prenom: words.slice(0, -1).join(' '), nom: words[words.length - 1] };
            }
            if (cut >= words.length) return { prenom: '', nom: name };
            return { prenom: words.slice(cut).join(' '), nom: words.slice(0, cut).join(' ') };
        }

        function getPlayerNameParts(p) {
            if (!p) return { prenom: '', nom: '' };
            const prenom = String(p.prenom || '').trim();
            const nom = String(p.nom || '').trim();
            if (prenom || nom) return { prenom, nom };
            return splitPlayerName(p.nameCanonical || p.name || '');
        }

        function isFirstNameFirst(teamKey) {
            const key = String(teamKey || '').trim();
            if (!key) return false;
            const team = state.teams?.[key] || state.teams?.[key.toLowerCase()];
            return !!(team && team.nameOrder === 'first');
        }

        function formatPlayerName(p) {
            if (!p) return '';
            const { prenom, nom } = getPlayerNameParts(p);
            if (!prenom && !nom) return p.nameCanonical || p.name || '';
            const firstFirst = isFirstNameFirst(p.team || p.cat);
            return firstFirst
                ? [prenom, nom].filter(Boolean).join(' ')
                : [nom, prenom].filter(Boolean).join(' ');
        }

        // Nom affiché sur le terrain : prénom usuel (champ « Prénom usuel » de la fiche),
        // sinon le prénom, sinon le nom complet
        function getPitchDisplayName(p) {
            if (!p) return '';
            const nick = String(p.nickname || '').trim();
            if (nick) return nick;
            const { prenom } = getPlayerNameParts(p);
            if (prenom) return prenom;
            return formatPlayerName(p);
        }

        // Recalcule le nom affiché sans toucher au nom de stockage
        function applyPlayerNameDisplay() {
            (state.players || []).forEach(p => {
                if (!p) return;
                if (typeof p.nameCanonical !== 'string' || !p.nameCanonical) {
                    p.nameCanonical = p.name || '';
                }
                p.name = formatPlayerName(p);
            });
        }

        // À l'enregistrement, on réécrit le nom canonique « NOM Prénom »
        function getPlayersForStorage() {
            return (state.players || []).map(p => {
                const copy = { ...p };
                if (copy.nameCanonical) copy.name = copy.nameCanonical;
                delete copy.nameCanonical;
                return copy;
            });
        }

        // Garde les joueurs groupés par équipe, en triant par prénom là où l'option est active
        function sortPlayersForDisplay(players) {
            const groups = new Map();
            const order = [];

            (players || []).forEach(p => {
                const key = String(p.team || p.cat || '').toLowerCase();
                if (!groups.has(key)) {
                    groups.set(key, []);
                    order.push(key);
                }
                groups.get(key).push(p);
            });

            const result = [];
            order.forEach(key => {
                const list = groups.get(key);
                if (isFirstNameFirst(key)) {
                    list.sort((a, b) => formatPlayerName(a).localeCompare(formatPlayerName(b), 'fr', { sensitivity: 'base' }));
                }
                result.push(...list);
            });

            return result;
        }

        function getTotalTeamCards() {
            let yellows = 0, reds = 0;
            if (state.cards) {
                Object.values(state.cards).forEach(matchCards => {
                    Object.values(matchCards).forEach(cardType => {
                        if (cardType === 'yellow') yellows++;
                        if (cardType === 'red') reds++;
                    });
                });
            }
            return { yellows, reds };
        }

        function getPlayerCardsCount(playerId) {
            let yellows = 0, reds = 0;
            if (state.cards) {
                Object.values(state.cards).forEach(matchCards => {
                    if (matchCards[playerId] === 'yellow') yellows++;
                    if (matchCards[playerId] === 'red') reds++;
                });
            }
            return { yellows, reds };
        }

        // --- Discipline : 3 cartons jaunes sur 3 mois glissants = suspension du match suivant ---
        const CARD_SUSPENSION_THRESHOLD = 3;
        const CARD_WINDOW_MONTHS = 3;

        // Toujours à minuit local : une date de carton et une date de match doivent
        // être comparées au jour près, sinon le match du jour du carton passe pour le suivant.
        function parseCardMatchDate(value) {
            if (!value) return null;
            const parts = String(value).split('-');
            if (parts.length < 3) return null;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (!y || !m || !d) return null;
            const date = new Date(y, m - 1, d);
            return isNaN(date.getTime()) ? null : date;
        }

        function atStartOfDay(date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }

        function addDaysToDate(date, days) {
            const d = atStartOfDay(date);
            d.setDate(d.getDate() + days);
            return d;
        }

        // Ajoute des mois en bloquant le jour sur la fin du mois cible (31/11 + 3 mois → 28/02)
        function addMonthsClamped(date, months) {
            const d = atStartOfDay(date);
            const day = d.getDate();
            d.setDate(1);
            d.setMonth(d.getMonth() + months);
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(day, lastDay));
            return d;
        }

        function formatCardDate(date) {
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        function shortCardDate(date) {
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        // Seuls le championnat et la coupe comptent pour la suspension (pas les amicaux)
        function isSuspensionMatch(match) {
            const type = ((match && match.type) || '').toLowerCase();
            return type === 'championnat' || type === 'coupe';
        }

        function getCardsByPlayerIndex() {
            const index = new Map();

            Object.entries(state.cards || {}).forEach(([matchId, matchCards]) => {
                if (!matchCards) return;
                const match = state.matches ? state.matches[matchId] : null;
                const date = match ? parseCardMatchDate(match.date) : null;

                Object.entries(matchCards).forEach(([playerId, cardType]) => {
                    if (cardType !== 'yellow' && cardType !== 'red') return;
                    if (!index.has(playerId)) index.set(playerId, []);
                    index.get(playerId).push({
                        type: cardType,
                        matchId,
                        date,
                        team: match ? (match.team || '') : '',
                        opponent: match ? (match.opponent || '') : '',
                        official: isSuspensionMatch(match)
                    });
                });
            });

            return index;
        }

        // Prochain match officiel de l'équipe, strictement après la date du 3e jaune
        function getNextOfficialMatchForTeam(team, afterDate) {
            if (!team) return null;
            const teamKey = team.toLowerCase();
            let best = null;

            Object.values(state.matches || {}).forEach(match => {
                if (!match || !isSuspensionMatch(match)) return;
                if ((match.team || '').toLowerCase() !== teamKey) return;
                const date = parseCardMatchDate(match.date);
                if (!date || date <= afterDate) return;
                if (!best || date < best.date) {
                    best = { date, opponent: match.opponent || '', type: match.type || '', id: match.id };
                }
            });

            return best;
        }

        // À chaque carton, on regarde les 3 mois qui précèdent :
        // au 3e jaune la suspension tombe sur le match officiel suivant et le compteur repart à zéro.
        function computePlayerDiscipline(playerId, cardsIndex, referenceDate) {
            const today = atStartOfDay(referenceDate || new Date());
            const index = cardsIndex || getCardsByPlayerIndex();
            const entries = (index.get(playerId) || []).filter(e => e.official && e.date);

            const yellowEvents = entries
                .filter(e => e.type === 'yellow')
                .sort((a, b) => a.date - b.date);

            const redCards = entries
                .filter(e => e.type === 'red' && today <= addMonthsClamped(e.date, CARD_WINDOW_MONTHS))
                .sort((a, b) => b.date - a.date);

            let counted = [];
            let lastSuspension = null;

            yellowEvents.forEach(event => {
                const windowStart = addMonthsClamped(event.date, -CARD_WINDOW_MONTHS);
                counted = counted.filter(card => card.date >= windowStart);
                counted.push(event);

                if (counted.length >= CARD_SUSPENSION_THRESHOLD) {
                    lastSuspension = {
                        trigger: event,
                        target: getNextOfficialMatchForTeam(event.team, event.date)
                    };
                    // Les 3 cartons sont consommés par la suspension
                    counted = [];
                }
            });

            // Cartons encore actifs aujourd'hui (le carton sort le lendemain de son anniversaire 3 mois)
            const activeCards = counted
                .filter(card => today <= addMonthsClamped(card.date, CARD_WINDOW_MONTHS))
                .sort((a, b) => a.date - b.date);

            let suspension = null;
            if (lastSuspension) {
                const target = lastSuspension.target;
                if (!target) {
                    suspension = { pendingCalendar: true, trigger: lastSuspension.trigger, target: null };
                } else if (target.date >= today) {
                    suspension = { pendingCalendar: false, trigger: lastSuspension.trigger, target };
                }
            }

            const oldestActive = activeCards[0] || null;

            return {
                activeCards,
                count: activeCards.length,
                suspension,
                redCards,
                atRisk: !suspension && activeCards.length >= CARD_SUSPENSION_THRESHOLD - 1,
                expiresOn: oldestActive ? addMonthsClamped(oldestActive.date, CARD_WINDOW_MONTHS) : null
            };
        }

        function disciplineGaugeHTML(count, tone) {
            const capped = Math.min(count, CARD_SUSPENSION_THRESHOLD);
            const onClass = tone === 'danger' ? 'bg-red-600' : tone === 'warning' ? 'bg-orange-500' : 'bg-slate-400';
            return [0, 1, 2].map(i =>
                `<span class="inline-block w-2 h-2 rounded-full ${i < capped ? onClass : 'bg-slate-200'}"></span>`
            ).join('');
        }

        // Repère compact affiché dans les listes (convocations, banc)
        function renderDisciplineChip(disc, short) {
            if (!disc) return '';

            if (disc.suspension) {
                const target = disc.suspension.target;
                const title = disc.suspension.pendingCalendar || !target
                    ? 'Suspendu : aucun match à venir programmé'
                    : `Suspendu pour le match du ${formatCardDate(target.date)}${target.opponent ? ' vs ' + target.opponent : ''}`;
                return short
                    ? `<span class="ml-1 align-middle text-[10px]" title="${title}">🚫</span>`
                    : `<span class="ml-1 inline-flex items-center align-middle px-1.5 py-0.5 rounded border border-red-200 bg-red-100 text-red-800 text-[9px] font-extrabold uppercase" title="${title}">🚫 Suspendu</span>`;
            }

            if (disc.redCards.length > 0) {
                const last = disc.redCards[0];
                const title = `Carton rouge le ${formatCardDate(last.date)}${last.opponent ? ' (' + last.opponent + ')' : ''} — durée de suspension fixée par la commission`;
                return short
                    ? `<span class="ml-1 align-middle text-[10px]" title="${title}">🟥</span>`
                    : `<span class="ml-1 inline-flex items-center align-middle px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 text-[9px] font-extrabold uppercase" title="${title}">🟥 À vérifier</span>`;
            }

            if (disc.atRisk) {
                const dates = disc.activeCards.map(c => `${shortCardDate(c.date)} ${c.opponent}`).join(', ');
                const title = `${disc.count} jaune(s) sur 3 mois${dates ? ' — ' + dates : ''} — un 3e jaune = suspension du match suivant`;
                return short
                    ? `<span class="ml-1 align-middle text-[10px]" title="${title}">⚠️ ${disc.count}/3</span>`
                    : `<span class="ml-1 inline-flex items-center align-middle px-1.5 py-0.5 rounded border border-orange-200 bg-orange-100 text-orange-800 text-[9px] font-extrabold uppercase" title="${title}">⚠️ ${disc.count}/3</span>`;
            }

            return '';
        }

        // --- Vue détaillée des cartons (depuis la carte du tableau de bord) ---
        // Périmètre identique au compteur du tableau de bord :
        //  - coach : uniquement les cartons de ses matchs
        //  - autres rôles : tous les matchs (comme getTotalTeamCards)
        function getDashboardCardsLeaderboard() {
            const role = window.currentUserRole || 'public';
            const userTeam = (window.currentUserTeam || 'all').toLowerCase();
            const coachMode = role === 'coach';

            const playersById = new Map(state.players.map(p => [p.id, p]));
            const totals = new Map();

            Object.entries(state.cards || {}).forEach(([matchId, matchCards]) => {
                if (!matchCards) return;

                if (coachMode) {
                    const match = state.matches[matchId];
                    if (!match) return;
                    if ((match.team || '').toLowerCase() !== userTeam) return;
                }

                Object.entries(matchCards).forEach(([playerId, cardType]) => {
                    if (cardType !== 'yellow' && cardType !== 'red') return;

                    if (!totals.has(playerId)) {
                        totals.set(playerId, { yellows: 0, reds: 0 });
                    }

                    const counts = totals.get(playerId);
                    if (cardType === 'yellow') counts.yellows++;
                    else counts.reds++;
                });
            });

            const rows = [...totals.entries()].map(([playerId, counts]) => {
                const player = playersById.get(playerId);
                return {
                    id: playerId,
                    name: player ? player.name : 'Joueur supprimé',
                    deleted: !player,
                    team: player ? (player.team || player.cat || '') : '',
                    yellows: counts.yellows,
                    reds: counts.reds,
                    total: counts.yellows + counts.reds
                };
            });

            // Du plus sanctionné au moins sanctionné, puis les rouges d'abord à égalité
            rows.sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                if (b.reds !== a.reds) return b.reds - a.reds;
                return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
            });

            // Les totaux sont la somme exacte de la liste : cohérence garantie avec la carte
            const yellows = rows.reduce((sum, r) => sum + r.yellows, 0);
            const reds = rows.reduce((sum, r) => sum + r.reds, 0);

            return { rows, yellows, reds };
        }

        function renderDisciplineAlertHTML(row, kind) {
            const d = row.discipline;
            const today = atStartOfDay(new Date());
            const gauge = kind === 'suspended'
                ? disciplineGaugeHTML(CARD_SUSPENSION_THRESHOLD, 'danger')
                : kind === 'risk'
                    ? disciplineGaugeHTML(d.count, 'warning')
                    : disciplineGaugeHTML(CARD_SUSPENSION_THRESHOLD, 'danger');

            const countLabel = kind === 'suspended'
                ? '<span class="text-[10px] font-extrabold text-red-700">3/3</span>'
                : kind === 'risk'
                    ? `<span class="text-[10px] font-extrabold text-orange-700">${d.count}/3</span>`
                    : '<span class="text-[10px] font-extrabold text-red-700">🟥</span>';

            let body = '';

            if (kind === 'suspended') {
                const target = d.suspension.target;
                const when = d.suspension.pendingCalendar || !target
                    ? 'Aucun match à venir programmé : suspension en attente de calendrier'
                    : `Absent du match du ${formatCardDate(target.date)}${target.opponent ? ' vs ' + target.opponent : ''}`;
                body = `<p class="text-[11px] font-bold text-red-700">${when}</p>
                        <p class="text-[10px] text-slate-500">3e jaune le ${formatCardDate(d.suspension.trigger.date)} · compteur remis à zéro après ce match</p>`;
            } else if (kind === 'risk') {
                // Un 3e jaune tomberait sur le prochain match : la suspension viserait celui d'après
                const team = row.team || '';
                const upcoming = getNextOfficialMatchForTeam(team, addDaysToDate(today, -1));
                const afterNext = upcoming ? getNextOfficialMatchForTeam(team, upcoming.date) : null;

                let consequence;
                if (upcoming && afterNext) {
                    consequence = `Un 3e jaune le ${formatCardDate(upcoming.date)} (${upcoming.opponent}) = absent le ${formatCardDate(afterNext.date)} (${afterNext.opponent})`;
                } else if (upcoming) {
                    consequence = `Un 3e jaune le ${formatCardDate(upcoming.date)} = absent du match suivant`;
                } else {
                    consequence = 'Un 3e jaune = absent du match suivant (aucun match programmé)';
                }

                body = `<p class="text-[11px] text-slate-600">${d.activeCards.map(c => `${shortCardDate(c.date)} ${c.opponent}`).join(' · ')}</p>
                        <p class="text-[11px] font-bold text-orange-700">${consequence}</p>
                        ${d.expiresOn ? `<p class="text-[10px] text-slate-500">Le 1er carton sort des comptes le ${formatCardDate(addDaysToDate(d.expiresOn, 1))}</p>` : ''}`;
            } else {
                const last = d.redCards[0];
                body = `<p class="text-[11px] text-slate-600">Rouge le ${formatCardDate(last.date)}${last.opponent ? ' (' + last.opponent + ')' : ''}</p>
                        <p class="text-[11px] font-bold text-red-700">Durée de suspension fixée par la commission</p>`;
            }

            const borderClass = kind === 'suspended' ? 'border-red-200' : kind === 'risk' ? 'border-orange-200' : 'border-slate-200';

            return `<div class="bg-white rounded-lg border ${borderClass} p-2.5 space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <p class="font-bold text-xs text-slate-800 truncate">${row.name}</p>
                    <span class="shrink-0 inline-flex items-center gap-1">${gauge}${countLabel}</span>
                </div>
                ${body}
            </div>`;
        }

        function renderDashboardCards() {
            const listEl = document.getElementById('dashboard-cards-list');
            if (!listEl) return;

            const { rows, yellows, reds } = getDashboardCardsLeaderboard();
            const total = yellows + reds;

            const cardsIndex = getCardsByPlayerIndex();
            rows.forEach(row => {
                row.discipline = computePlayerDiscipline(row.id, cardsIndex);
            });

            const suspendedRows = rows.filter(r => r.discipline.suspension);
            const atRiskRows = rows.filter(r => r.discipline.atRisk && !r.discipline.suspension);
            const redRows = rows.filter(r => r.discipline.redCards.length > 0 && !r.discipline.suspension);

            const totalEl = document.getElementById('dashboard-cards-total');
            if (totalEl) totalEl.innerText = total;

            const detailEl = document.getElementById('dashboard-cards-detail');
            if (detailEl) detailEl.innerHTML = `${yellows} 🟨 · ${reds} 🟥`;

            const subtitleEl = document.getElementById('dashboard-cards-subtitle');
            if (subtitleEl) {
                if (rows.length === 0) {
                    subtitleEl.innerText = 'Aucun joueur sanctionné';
                } else {
                    const parts = [`${rows.length} joueur${rows.length > 1 ? 's' : ''} sanctionné${rows.length > 1 ? 's' : ''}`];
                    if (suspendedRows.length) parts.push(`${suspendedRows.length} suspendu${suspendedRows.length > 1 ? 's' : ''}`);
                    if (atRiskRows.length) parts.push(`${atRiskRows.length} sous la menace`);
                    subtitleEl.innerText = parts.join(' · ');
                }
            }

            // Bandeau d'alerte : suspendus, joueurs à 2/3, rouges à vérifier
            const alertsEl = document.getElementById('dashboard-cards-alerts');
            if (alertsEl) {
                const blocks = [];

                if (suspendedRows.length) {
                    blocks.push(`
                        <div class="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
                            <p class="text-[10px] font-extrabold uppercase tracking-wider text-red-700"><i class="fa-solid fa-ban mr-1" aria-hidden="true"></i>Suspendu${suspendedRows.length > 1 ? 's' : ''} pour le prochain match</p>
                            ${suspendedRows.map(r => renderDisciplineAlertHTML(r, 'suspended')).join('')}
                        </div>`);
                }

                if (atRiskRows.length) {
                    blocks.push(`
                        <div class="rounded-xl border border-orange-200 bg-orange-50 p-3 space-y-2">
                            <p class="text-[10px] font-extrabold uppercase tracking-wider text-orange-700"><i class="fa-solid fa-triangle-exclamation mr-1" aria-hidden="true"></i>Sous la menace · 2 jaunes sur 3</p>
                            ${atRiskRows.map(r => renderDisciplineAlertHTML(r, 'risk')).join('')}
                        </div>`);
                }

                if (redRows.length) {
                    blocks.push(`
                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                            <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-600"><i class="fa-solid fa-square text-red-600 mr-1" aria-hidden="true"></i>Cartons rouges à vérifier</p>
                            ${redRows.map(r => renderDisciplineAlertHTML(r, 'red')).join('')}
                        </div>`);
                }

                alertsEl.innerHTML = blocks.join('');
            }

            if (rows.length === 0) {
                listEl.innerHTML = `
                    <div class="p-6 text-center">
                        <i class="fa-solid fa-square-check text-emerald-500 text-2xl" aria-hidden="true"></i>
                        <p class="mt-2 text-xs font-bold text-slate-700">Aucun carton enregistré</p>
                        <p class="mt-1 text-[11px] text-slate-500">Les cartons saisis dans le bilan d'un match apparaîtront ici.</p>
                    </div>`;
                return;
            }

            listEl.innerHTML = rows.map((r, i) => {
                const d = r.discipline;
                const distinctCards = [
                    r.yellows > 0 ? `<span class="text-amber-600">${r.yellows}🟨</span>` : '',
                    r.reds > 0 ? `<span class="text-red-600">${r.reds}🟥</span>` : ''
                ].filter(Boolean).join(' ');

                const tone = d.suspension ? 'danger' : d.atRisk ? 'warning' : 'neutral';
                const rankClass = d.suspension ? 'bg-red-600' : d.atRisk ? 'bg-orange-500' : 'bg-slate-700';
                const countClass = d.suspension ? 'text-red-700' : d.atRisk ? 'text-orange-700' : 'text-slate-500';
                const gaugeCount = d.suspension ? CARD_SUSPENSION_THRESHOLD : d.count;
                const teamLabel = r.team ? `<span class="uppercase">${r.team}</span>` : '';
                const datesLine = d.activeCards.length
                    ? d.activeCards.map(c => `${shortCardDate(c.date)} ${c.opponent}`).join(' · ')
                    : '';

                return `
                    <div class="flex items-center justify-between gap-2 px-3 py-2.5 ${d.suspension ? 'bg-red-50' : ''}">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 shrink-0 rounded-full ${rankClass} text-white text-[11px] font-extrabold flex items-center justify-center" title="Rang ${i + 1}">${i + 1}</span>
                            <div class="min-w-0">
                                <p class="font-bold text-xs truncate ${r.deleted ? 'text-slate-400 italic' : 'text-slate-800'}">${r.name}</p>
                                <p class="text-[10px] text-slate-400">${distinctCards}${teamLabel ? ' · ' + teamLabel : ''}</p>
                                ${datesLine ? `<p class="text-[10px] text-slate-500">${datesLine}</p>` : ''}
                            </div>
                        </div>
                        <div class="shrink-0 text-right space-y-0.5">
                            <div class="flex items-center justify-end gap-1">
                                ${disciplineGaugeHTML(gaugeCount, tone)}
                                <span class="text-[10px] font-extrabold ${countClass}">${gaugeCount}/3</span>
                            </div>
                            <p class="text-[10px] font-bold text-slate-400">${r.total} au total</p>
                        </div>
                    </div>`;
            }).join('');
        }

        function openDashboardCards() {
            renderDashboardCards();

            const dashboardSec = document.getElementById('sec-dashboard');
            const cardsSec = document.getElementById('sec-dashboard-cards');

            if (dashboardSec) dashboardSec.classList.add('hidden');
            if (!cardsSec) return;

            cardsSec.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function closeDashboardCards() {
            const dashboardSec = document.getElementById('sec-dashboard');
            const cardsSec = document.getElementById('sec-dashboard-cards');

            if (cardsSec) cardsSec.classList.add('hidden');
            if (dashboardSec) dashboardSec.classList.remove('hidden');

            renderDashboard();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.openDashboardCards = openDashboardCards;
        window.closeDashboardCards = closeDashboardCards;

        // --- Écran Bilan (depuis la tuile V-N-D du tableau de bord) ---
        const BILAN_COMPETITIONS = ['Championnat', 'Coupe', 'Amical'];
        // null = pas encore choisi : l'écran s'ouvrira sur l'équipe par défaut
        let bilanTeamFilter = null;
        let bilanFilterOwner = null;

        const BILAN_RESULT_STYLE = {
            V: { soft: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600', bar: 'bg-emerald-500' },
            N: { soft: 'bg-slate-200 text-slate-700', text: 'text-slate-600', bar: 'bg-slate-400' },
            D: { soft: 'bg-red-100 text-red-700', text: 'text-red-600', bar: 'bg-red-500' }
        };

        function normalizeBilanType(type) {
            const t = (type || '').toLowerCase();
            if (t === 'championnat') return 'Championnat';
            if (t === 'coupe') return 'Coupe';
            if (t === 'amical') return 'Amical';
            return 'Autre';
        }

        function isMatchPlayed(match) {
            if (!match) return false;
            const h = match.scoreHome;
            const a = match.scoreAway;
            if (h === undefined || h === null || h === '' || a === undefined || a === null || a === '') return false;
            return !isNaN(parseInt(h)) && !isNaN(parseInt(a));
        }

        // scoreHome = buts de notre équipe, scoreAway = buts de l'adversaire
        function computeBilanStats(matches) {
            const played = (matches || [])
                .filter(isMatchPlayed)
                .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

            let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;

            const results = played.map(match => {
                const scored = parseInt(match.scoreHome);
                const conceded = parseInt(match.scoreAway);
                goalsFor += scored;
                goalsAgainst += conceded;

                const result = scored > conceded ? 'V' : scored === conceded ? 'N' : 'D';
                if (result === 'V') wins++;
                else if (result === 'N') draws++;
                else losses++;

                return { match, result, scored, conceded };
            });

            const count = played.length;

            return {
                played: count,
                results,
                wins, draws, losses,
                goalsFor, goalsAgainst,
                diff: goalsFor - goalsAgainst,
                winPct: count ? Math.round((wins / count) * 100) : null,
                avgFor: count ? goalsFor / count : null,
                avgAgainst: count ? goalsAgainst / count : null,
                streak: results.slice(-5).map(r => r.result)
            };
        }

        function formatOneDecimal(value) {
            if (value === null || value === undefined) return '—';
            return value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        }

        function formatDiff(value) {
            return value > 0 ? '+' + value : String(value);
        }

        // Uniquement les équipes qui ont réellement des matchs en base
        function getBilanTeamOptions() {
            const keys = new Set();
            Object.values(state.matches || {}).forEach(m => { if (m && m.team) keys.add(m.team); });
            return [...keys].sort((a, b) => getBilanTeamLabel(a).localeCompare(getBilanTeamLabel(b), 'fr'));
        }

        function getBilanTeamLabel(teamKey) {
            return state.teams?.[teamKey]?.name || String(teamKey || '').toUpperCase();
        }

        // Équipe affichée à l'ouverture : celle du compte, sinon la plus active
        function getDefaultBilanTeam() {
            const options = getBilanTeamOptions();
            const userTeam = window.currentUserTeam;

            if (userTeam && userTeam !== 'all' && options.includes(userTeam)) return userTeam;

            let best = 'all';
            let bestPlayed = 0;
            options.forEach(team => {
                const played = Object.values(state.matches || {})
                    .filter(m => (m.team || '') === team && isMatchPlayed(m)).length;
                if (played > bestPlayed) {
                    bestPlayed = played;
                    best = team;
                }
            });

            return best;
        }

        function bilanBarHTML(stats) {
            if (!stats.played) return '<div class="h-2 rounded-full bg-slate-100"></div>';
            const width = (n) => Math.round((n / stats.played) * 100);
            return `<div class="h-2 rounded-full overflow-hidden flex bg-slate-100">
                ${stats.wins ? `<span class="${BILAN_RESULT_STYLE.V.bar}" style="width:${width(stats.wins)}%"></span>` : ''}
                ${stats.draws ? `<span class="${BILAN_RESULT_STYLE.N.bar}" style="width:${width(stats.draws)}%"></span>` : ''}
                ${stats.losses ? `<span class="${BILAN_RESULT_STYLE.D.bar}" style="width:${width(stats.losses)}%"></span>` : ''}
            </div>`;
        }

        function bilanStreakHTML(stats, dark) {
            if (!stats.streak.length) return '';
            const pills = stats.streak.map(r =>
                `<span class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${dark ? 'bg-white/25 text-white' : BILAN_RESULT_STYLE[r].soft}">${r}</span>`
            ).join('');
            const label = stats.streak.length > 1 ? `${stats.streak.length} derniers` : 'dernier';
            return `<div class="flex items-center gap-1">
                <span class="text-[9px] font-extrabold uppercase mr-1 ${dark ? 'opacity-90' : 'text-slate-400'}">${label}</span>
                ${pills}
            </div>`;
        }

        function renderBilanGlobal(stats, title) {
            const cell = (value, label) => `<div class="bg-white/20 rounded-lg py-1.5 text-center">
                <p class="text-base font-extrabold drop-shadow-sm">${value}</p>
                <p class="text-[9px] font-bold uppercase opacity-90">${label}</p>
            </div>`;

            return `
            <div class="grad-card grad-card-emerald">
                <div class="grad-card-content space-y-2.5">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-[10px] font-extrabold uppercase tracking-wider opacity-90">${title || 'Global'}</p>
                            <p class="text-2xl font-extrabold drop-shadow-sm">${stats.played} <span class="text-xs font-bold opacity-90">match${stats.played > 1 ? 's' : ''} joué${stats.played > 1 ? 's' : ''}</span></p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-xl font-extrabold drop-shadow-sm">${stats.winPct === null ? '—' : stats.winPct + '%'}</p>
                            <p class="text-[9px] font-bold uppercase opacity-90">victoires</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-1.5">
                        ${cell(stats.wins, 'Victoires')}
                        ${cell(stats.draws, 'Nuls')}
                        ${cell(stats.losses, 'Défaites')}
                    </div>

                    <div class="grid grid-cols-3 gap-1.5">
                        ${cell(stats.goalsFor + ' ⚽', 'Marqués')}
                        ${cell(stats.goalsAgainst + ' 🥅', 'Encaissés')}
                        ${cell(formatDiff(stats.diff), 'Différence')}
                    </div>

                    <p class="text-[10px] font-bold opacity-90">Moyenne : ${formatOneDecimal(stats.avgFor)} marqués · ${formatOneDecimal(stats.avgAgainst)} encaissés par match</p>
                    ${bilanStreakHTML(stats, true)}
                </div>
            </div>`;
        }

        function renderBilanCompetitionCard(type, stats, totalMatches) {
            const tile = (value, label, classes) => `<div class="${classes} rounded-lg py-1 text-center">
                <p class="text-sm font-extrabold">${value}</p>
                <p class="text-[9px] font-bold uppercase opacity-80">${label}</p>
            </div>`;

            const diffClass = stats.diff > 0 ? 'text-emerald-600' : stats.diff < 0 ? 'text-red-600' : 'text-slate-600';
            const remaining = totalMatches - stats.played;

            return `
            <div class="bg-white rounded-xl card-shadow border border-slate-100 p-3 space-y-2">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                        <p class="text-sm font-bold text-slate-800 truncate">${type}</p>
                        <p class="text-[10px] text-slate-400">${stats.played} joué${stats.played > 1 ? 's' : ''}${remaining > 0 ? ` sur ${totalMatches} programmé${totalMatches > 1 ? 's' : ''}` : ''}</p>
                    </div>
                    <span class="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${stats.winPct === null ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}">${stats.winPct === null ? '—' : stats.winPct + '% V'}</span>
                </div>

                ${stats.played ? `
                <div class="grid grid-cols-3 gap-1.5">
                    ${tile(stats.wins, 'V', 'bg-emerald-50 border border-emerald-100 text-emerald-700')}
                    ${tile(stats.draws, 'N', 'bg-slate-50 border border-slate-200 text-slate-700')}
                    ${tile(stats.losses, 'D', 'bg-red-50 border border-red-100 text-red-700')}
                </div>
                ${bilanBarHTML(stats)}
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-600">
                    <span>${stats.goalsFor} ⚽</span>
                    <span>${stats.goalsAgainst} 🥅</span>
                    <span class="${diffClass}">${formatDiff(stats.diff)}</span>
                    <span class="text-slate-400 font-semibold">moy. ${formatOneDecimal(stats.avgFor)} / ${formatOneDecimal(stats.avgAgainst)}</span>
                </div>
                ${bilanStreakHTML(stats, false)}
                ` : `<p class="text-[11px] text-slate-400 italic py-1">Aucun match joué dans cette compétition.</p>`}
            </div>`;
        }

        function renderBilanMatches(matches, showTeam) {
            const container = document.getElementById('bilan-matches');
            if (!container) return;

            const played = (matches || [])
                .filter(isMatchPlayed)
                .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

            if (!played.length) {
                container.innerHTML = `<p class="p-6 text-center text-xs text-slate-400 italic">Aucun match joué pour ce filtre.</p>`;
                return;
            }

            const groups = {};
            played.forEach(match => {
                const key = normalizeBilanType(match.type);
                (groups[key] = groups[key] || []).push(match);
            });

            const order = BILAN_COMPETITIONS.concat('Autre').filter(t => groups[t] && groups[t].length);

            container.innerHTML = order.map(type => {
                const rows = groups[type].map(match => {
                    const scored = parseInt(match.scoreHome);
                    const conceded = parseInt(match.scoreAway);
                    const result = scored > conceded ? 'V' : scored === conceded ? 'N' : 'D';
                    const style = BILAN_RESULT_STYLE[result];
                    const dateValue = parseCardMatchDate(match.date);
                    const dateLabel = dateValue ? formatCardDate(dateValue) : '--/--/----';
                    const where = (match.location || '').toLowerCase().startsWith('ext') ? 'extérieur' : 'domicile';

                    return `<div class="flex items-center justify-between gap-2 px-3 py-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 shrink-0 rounded-lg ${style.soft} text-[10px] font-extrabold flex items-center justify-center">${result}</span>
                            <div class="min-w-0">
                                <p class="font-bold text-xs text-slate-800 truncate">${match.opponent || 'Adversaire'}</p>
                                <p class="text-[10px] text-slate-400">${dateLabel} · ${where}${showTeam ? ' · ' + getBilanTeamLabel(match.team) : ''}</p>
                            </div>
                        </div>
                        <p class="shrink-0 text-xs font-extrabold ${style.text}">${scored} - ${conceded}</p>
                    </div>`;
                }).join('');

                return `<div class="flex items-center gap-2 px-3 pt-3 pb-1">
                    <span class="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">${type} (${groups[type].length})</span>
                    <span class="flex-1 h-px bg-slate-200"></span>
                </div>${rows}`;
            }).join('');
        }

        function renderDashboardBilan() {
            const role = window.currentUserRole || 'public';

            // Changement de compte (rôle ou équipe) : on repart de l'équipe du compte
            const owner = `${role}|${window.currentUserTeam || 'all'}`;
            if (bilanFilterOwner !== owner) {
                bilanFilterOwner = owner;
                bilanTeamFilter = null;
            }

            // Premier affichage : on part sur l'équipe du compte plutôt que sur un total club
            if (bilanTeamFilter === null) bilanTeamFilter = getDefaultBilanTeam();

            // Un coach ne voit que son équipe : filtre forcé sans écraser le choix des autres rôles
            const activeFilter = role === 'coach' ? (window.currentUserTeam || 'all') : bilanTeamFilter;

            const allMatches = Object.values(state.matches || {});

            // Filtre par équipe (masqué pour un coach, qui ne voit que la sienne)
            const filterEl = document.getElementById('bilan-team-filter');
            if (filterEl) {
                if (role === 'coach') {
                    filterEl.innerHTML = '';
                } else {
                    const options = [{ key: 'all', label: 'Toutes' }]
                        .concat(getBilanTeamOptions().map(t => ({ key: t, label: getBilanTeamLabel(t) })));
                    filterEl.innerHTML = options.map(option => {
                        const active = activeFilter === option.key;
                        return `<button onclick="setBilanTeamFilter('${option.key}')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:bg-slate-100'}">${option.label}</button>`;
                    }).join('');
                }
            }

            const scoped = activeFilter === 'all'
                ? allMatches
                : allMatches.filter(m => (m.team || '') === activeFilter);

            const globalEl = document.getElementById('bilan-global');
            if (globalEl) {
                const title = activeFilter === 'all' ? 'Global' : getBilanTeamLabel(activeFilter);
                globalEl.innerHTML = renderBilanGlobal(computeBilanStats(scoped), title);
            }

            const competitionsEl = document.getElementById('bilan-competitions');
            if (competitionsEl) {
                const byType = {};
                scoped.forEach(match => {
                    const key = normalizeBilanType(match.type);
                    (byType[key] = byType[key] || []).push(match);
                });

                const types = BILAN_COMPETITIONS.concat('Autre').filter(t => byType[t] && byType[t].length);
                competitionsEl.innerHTML = types.length
                    ? types.map(t => renderBilanCompetitionCard(t, computeBilanStats(byType[t]), byType[t].length)).join('')
                    : `<div class="bg-white rounded-xl card-shadow border border-slate-100 p-4 text-center text-xs text-slate-400 italic">Aucun match pour cette équipe.</div>`;
            }

            renderBilanMatches(scoped, activeFilter === 'all');
        }

        function setBilanTeamFilter(teamKey) {
            bilanTeamFilter = teamKey;
            renderDashboardBilan();
        }

        function openDashboardBilan() {
            renderDashboardBilan();

            const dashboardSec = document.getElementById('sec-dashboard');
            const bilanSec = document.getElementById('sec-dashboard-bilan');

            if (dashboardSec) dashboardSec.classList.add('hidden');
            if (!bilanSec) return;

            bilanSec.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function closeDashboardBilan() {
            const dashboardSec = document.getElementById('sec-dashboard');
            const bilanSec = document.getElementById('sec-dashboard-bilan');

            if (bilanSec) bilanSec.classList.add('hidden');
            if (dashboardSec) dashboardSec.classList.remove('hidden');

            renderDashboard();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.openDashboardBilan = openDashboardBilan;
        window.closeDashboardBilan = closeDashboardBilan;
        window.setBilanTeamFilter = setBilanTeamFilter;

       function getMatchTypeBadge(type) {

    if (type === 'Championnat') {
        return `
            <span class="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 shadow-sm">
                <i class="fa-solid fa-trophy mr-1"></i>
                Championnat
            </span>
        `;
    }

    if (type === 'Coupe') {
        return `
            <span class="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 shadow-sm">
                <i class="fa-solid fa-shield-halved mr-1"></i>
                Coupe
            </span>
        `;
    }

    return `
        <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
            <i class="fa-solid fa-handshake mr-1"></i>
            Amical
        </span>
    `;
}

        function getMatchResultBadge(scoreHome, scoreAway) {
            if (scoreHome === undefined || scoreAway === undefined || scoreHome === "" || scoreAway === "") {
                return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-500">À jouer</span>';
            }
            const h = parseInt(scoreHome), a = parseInt(scoreAway);
            if (h > a) return '<span class="px-2.5 py-1 rounded text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">VICTOIRE 🟢</span>';
            if (h < a) return '<span class="px-2.5 py-1 rounded text-xs font-black bg-red-100 text-red-800 border border-red-300">DÉFAITE 🔴</span>';
            return '<span class="px-2.5 py-1 rounded text-xs font-black bg-slate-900 text-white border border-slate-700">MATCH NUL ⬛</span>';
        }


function renderDashboard() {
           
            const role = window.currentUserRole || 'public';
const userTeam = window.currentUserTeam || 'all';

// Joueurs filtrés
const dashboardPlayers = role === 'coach'
    ? state.players.filter(p =>
        (p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase()
      )
    : state.players;

// Matchs filtrés
const dashboardMatches = role === 'coach'
    ? Object.values(state.matches).filter(m =>
        (m.team || '').toLowerCase() === userTeam.toLowerCase()
      )
    : Object.values(state.matches);
            document.getElementById('stat-effectif').innerText =
    dashboardPlayers.length;
            document.getElementById('stat-matchs').innerText =
    dashboardMatches.length;
            
            let wins = 0;
let draws = 0;
let losses = 0;

dashboardMatches.forEach(m => {
    if (
        m.scoreHome !== undefined &&
        m.scoreHome !== "" &&
        m.scoreAway !== undefined &&
        m.scoreAway !== ""
    ) {
        const h = parseInt(m.scoreHome);
        const a = parseInt(m.scoreAway);

        if (h > a) wins++;
        else if (h === a) draws++;
        else losses++;
    }
});
            document.getElementById('stat-bilan-vdn').innerHTML =
    `<span class="text-emerald-100">${wins}V</span><span class="opacity-50 px-1">·</span><span class="text-white">${draws}N</span><span class="opacity-50 px-1">·</span><span class="text-rose-100">${losses}D</span>`;

            
            const teamCards =
    role === 'coach'
        ? getTeamCards(dashboardMatches)
        : getTotalTeamCards();
document.getElementById('stat-total-cards').innerHTML = `<span>${teamCards.yellows}🟨</span> <span>${teamCards.reds}🟥</span>`;

            // Alerte Licences
            const missingLicences = dashboardPlayers.filter(
    p => !p.licence ||
    p.licence.trim() === '' ||
    p.licence.trim() === '-'
);
            const alertBanner = document.getElementById('licences-alert-banner');
            if (missingLicences.length > 0) {
                alertBanner.innerHTML = `
                    <div class="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start space-x-3 text-xs text-red-900 card-shadow">
                        <div class="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0 mt-0.5"><i class="fa-solid fa-triangle-exclamation"></i></div>
                        <div class="flex-1 space-y-1">
                            <p class="font-bold text-sm text-red-800">Attention : Licences manquantes (${missingLicences.length})</p>
                            <div class="flex flex-wrap gap-1.5 pt-1">${missingLicences.map(p => `<span class="bg-white px-2 py-0.5 rounded border border-red-200 font-bold text-red-800">${p.name}</span>`).join('')}</div>
                        </div>
                    </div>`;
            } else {
                alertBanner.innerHTML = `<div class="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center space-x-3 text-xs text-emerald-900"><div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0"><i class="fa-solid fa-circle-check"></i></div><p class="font-bold text-emerald-800">Parfait ! Tous les joueurs ont un numéro de licence.</p></div>`;
            }

            // Prochain Entraînement

const today = new Date();
today.setHours(0,0,0,0);

const selectedTeam =
    document.getElementById(
        'calendar-team-filter'
    )?.value || "all";

const trainingsSource = role === 'coach'
    ? Object.values(state.trainings || {}).filter(t =>
        (t.team || '').toLowerCase() === userTeam.toLowerCase()
      )
    : Object.values(state.trainings || {});

const nextTraining = trainingsSource
  
    .filter(t => {
        if (!t.date) return false;

        const d = new Date(t.date + 'T12:00:00');
        d.setHours(0,0,0,0);

        return d >= today;
    })
    .sort((a,b) => new Date(a.date) - new Date(b.date))[0];

if (nextTraining) {

    const formattedDate = new Date(
        nextTraining.date + 'T12:00:00'
    ).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

        document.getElementById('dashboard-next-training-content').innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
            <div>
                <h4 class="font-bold text-slate-800 text-sm">
                    ${nextTraining.title || 'Entraînement'}
                </h4>

                <p class="text-[11px] text-slate-600">
                    📅 <time datetime="${nextTraining.date}">${formattedDate}</time>
                </p>

                <p class="text-[11px] text-slate-600">
                    ⏰ ${nextTraining.heure || '18:00'}
                </p>

                <p class="text-[11px] text-sky-700 font-semibold">
                    🎯 ${nextTraining.theme || 'Thème non défini'}
                </p>
            </div>

            <button onclick="switchTab('entrainements')" class="bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold px-3 py-1.5 rounded-lg border border-sky-200 transition" aria-label="Gérer les entraînements">
                Gérer <i class="fa-solid fa-arrow-right ml-1" aria-hidden="true"></i>
            </button>
        </div>`;
}
else {

    document.getElementById('dashboard-next-training-content').innerHTML = `
        <p class="text-slate-400 italic">
            Aucun entraînement programmé
        </p>`;
}

            // Forme (5 derniers matchs)
            const matchesArr = dashboardMatches.sort((a,b) => new Date(a.date) - new Date(b.date));
            const pastMatches = matchesArr.filter(m => m.scoreHome !== undefined && m.scoreHome !== "").slice(-5);
            const streakContainer = document.getElementById('dashboard-form-streak');
            streakContainer.innerHTML = pastMatches.length > 0 ? pastMatches.map(m => {
                const h = parseInt(m.scoreHome), a = parseInt(m.scoreAway);
                if (h > a) return '<div class="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">V</div>';
                if (h === a) return '<div class="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs shadow-sm">N</div>';
                return '<div class="w-7 h-7 rounded-lg bg-red-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">D</div>';
            }).join('') : '<span class="text-xs text-slate-400 italic">Aucun match joué</span>';

            renderTopScorersAndPassers();

            // Dernier / Prochain Match
            const todayStr = new Date().toISOString().split('T')[0];
            const past = matchesArr.filter(m => m.date <= todayStr && m.scoreHome !== undefined && m.scoreHome !== "");
            const future = matchesArr.filter(m => m.date >= todayStr && (m.scoreHome === undefined || m.scoreHome === ""));
            const lastMatch = past.length > 0 ? past[past.length - 1] : matchesArr[0];
            const nextMatch = future.length > 0 ? future[0] : (matchesArr.length > 1 ? matchesArr[1] : null);

            const lastBadge = document.getElementById('last-match-badge');
            const lastCont = document.getElementById('dashboard-last-match-content');
            if (lastMatch && lastMatch.scoreHome !== undefined && lastMatch.scoreHome !== "") {
                const lastMatchDate = lastMatch.date ? new Date(lastMatch.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : '--/--/--';
                lastBadge.innerHTML = getMatchResultBadge(lastMatch.scoreHome, lastMatch.scoreAway);
                lastCont.innerHTML = `<div class="space-y-1.5 pt-1"><div class="flex justify-between items-center font-bold text-slate-800 text-sm"><span>${lastMatch.team || 'Équipe'} vs ${lastMatch.opponent}</span><span class="bg-slate-100 px-2 py-0.5 rounded text-xs font-extrabold text-slate-700">${lastMatch.scoreHome} - ${lastMatch.scoreAway}</span></div><p class="text-[11px] text-slate-500">Joué le ${lastMatchDate}</p>${lastMatch.debrief ? `<p class="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border mt-1">📝 ${lastMatch.debrief}</p>` : ''}</div>`;
            } else {
                lastBadge.innerHTML = ""; lastCont.innerHTML = `<p class="text-slate-400 italic py-2">Aucun match récent.</p>`;
            }

            const nextBadge = document.getElementById('next-match-badge');
           const nextTeamName =
    nextMatch
        ? (state.teams?.[nextMatch.team]?.name ||
           nextMatch.team ||
           'Équipe')
        : 'Équipe';
            const nextCont = document.getElementById('dashboard-next-match-content');
            if (nextMatch) {
                const nextMatchDate = nextMatch.date ? new Date(nextMatch.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : '--/--/--';
                nextBadge.innerHTML = getMatchTypeBadge(nextMatch.type || 'Championnat');
                nextCont.innerHTML = `<div class="space-y-1.5 pt-1"><div class="flex justify-between items-center font-bold text-slate-800 text-sm"><span>${nextTeamName} vs ${nextMatch.opponent}</span><span class="text-sky-600 font-bold">${nextMatch.location || 'Domicile'}</span></div><p class="text-[11px] text-slate-500">📅 ${nextMatchDate} à ${nextMatch.heure || '14:30'}</p></div>`;
            } else {
                nextBadge.innerHTML = ""; nextCont.innerHTML = `<p class="text-slate-400 italic py-2">Aucun match programmé.</p>`;
            }

            // Si la vue détaillée des cartons est ouverte, la garder à jour
            const cardsView = document.getElementById('sec-dashboard-cards');
            if (cardsView && !cardsView.classList.contains('hidden')) {
                renderDashboardCards();
            }

            // Idem pour la vue Bilan
            const bilanView = document.getElementById('sec-dashboard-bilan');
            if (bilanView && !bilanView.classList.contains('hidden')) {
                renderDashboardBilan();
            }
        }

        function getTeamCards(matches) {

    let yellows = 0;
    let reds = 0;

    matches.forEach(match => {

        const cards = state.cards[match.id];

        if (!cards) return;

        Object.values(cards).forEach(card => {
            if (card === 'yellow') yellows++;
            if (card === 'red') reds++;
        });
    });

    return { yellows, reds };
}


        // Périmètre des statistiques du tableau de bord :
        //  - coach : uniquement son équipe
        //  - responsable : ses équipes
        //  - autres rôles : tout le club
        function getDashboardStatsRows() {
            const role = window.currentUserRole || 'public';
            const userTeam = window.currentUserTeam || 'all';

            let playersSource = state.players;

            if (role === 'coach') {

                playersSource = state.players.filter(
                    p =>
                        (p.team || p.cat || '').toLowerCase() ===
                        userTeam.toLowerCase()
                );

            } else if (role === 'responsable') {

                const teams = userTeam
                    .split(',')
                    .map(t => t.trim().toLowerCase());

                playersSource = state.players.filter(
                    p =>
                        teams.includes(
                            (p.team || p.cat || '').toLowerCase()
                        )
                );
            }

            return playersSource.map(p => {
                const s = state.stats[p.id] || { goals: 0, assists: 0 };
                const goals = s.goals || 0;
                const assists = s.assists || 0;

                return {
                    id: p.id,
                    name: p.name,
                    team: p.team || p.cat || '',
                    goals,
                    assists,
                    total: goals + assists
                };
            });
        }

        // Classements complets : buts, passes décisives, efficacité (buts + passes)
        const DASHBOARD_STATS_KINDS = {
            scorers: {
                label: 'Buteurs',
                icon: 'fa-futbol',
                key: 'goals',
                unit: '⚽',
                totalLabel: 'buts marqués',
                badge: 'bg-amber-100 text-amber-800',
                hero: 'grad-card-blue'
            },
            passers: {
                label: 'Passeurs',
                icon: 'fa-handshake',
                key: 'assists',
                unit: '🎯',
                totalLabel: 'passes décisives',
                badge: 'bg-sky-100 text-sky-800',
                hero: 'grad-card-sky'
            },
            efficiency: {
                label: 'Efficacité',
                icon: 'fa-bolt',
                key: 'total',
                unit: '⚡',
                totalLabel: 'buts + passes',
                badge: 'bg-emerald-100 text-emerald-800',
                hero: 'grad-card-emerald'
            }
        };

        let dashboardStatsKind = 'scorers';

        function dashboardStatsSortedRows(kind) {
            const key = (DASHBOARD_STATS_KINDS[kind] || DASHBOARD_STATS_KINDS.scorers).key;

            return getDashboardStatsRows().sort((a, b) =>
                b[key] - a[key]
                || b.goals - a.goals
                || b.assists - a.assists
                || String(a.name || '').localeCompare(String(b.name || ''), 'fr', { sensitivity: 'base' })
            );
        }

        function dashboardTopRowHTML(p, i, key, badgeClass, unit) {
            return `
                <div class="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs"><span class="font-bold text-slate-700 truncate">${i+1}. ${p.name}</span><span class="shrink-0 ml-2 ${badgeClass} font-extrabold px-2 py-0.5 rounded">${p[key]} ${unit}</span></div>`;
        }

        function renderTopScorersAndPassers() {
            const scorersEl = document.getElementById('dashboard-top-scorers');
            if (scorersEl) {
                scorersEl.innerHTML = dashboardStatsSortedRows('scorers')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'goals', 'bg-amber-100 text-amber-800', '⚽'))
                    .join('');
            }

            const passersEl = document.getElementById('dashboard-top-passers');
            if (passersEl) {
                passersEl.innerHTML = dashboardStatsSortedRows('passers')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'assists', 'bg-sky-100 text-sky-800', '🎯'))
                    .join('');
            }

            const efficiencyEl = document.getElementById('dashboard-top-efficiency');
            if (efficiencyEl) {
                efficiencyEl.innerHTML = dashboardStatsSortedRows('efficiency')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'total', 'bg-emerald-100 text-emerald-800', '⚡'))
                    .join('');
            }
        }

        // --- Vue détaillée des classements (depuis les cartes du tableau de bord) ---
        function setDashboardStatsKind(kind) {
            if (!DASHBOARD_STATS_KINDS[kind]) return;
            dashboardStatsKind = kind;
            renderDashboardStats();
        }

        function renderDashboardStatsTabs() {
            const tabsEl = document.getElementById('dashboard-stats-tabs');
            if (!tabsEl) return;

            tabsEl.innerHTML = Object.entries(DASHBOARD_STATS_KINDS).map(([kind, meta]) => {
                const active = kind === dashboardStatsKind;
                return `<button onclick="setDashboardStatsKind('${kind}')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:bg-slate-100'}"><i class="fa-solid ${meta.icon} mr-1" aria-hidden="true"></i>${meta.label}</button>`;
            }).join('');
        }

        function renderDashboardStats() {
            renderDashboardStatsTabs();

            const meta = DASHBOARD_STATS_KINDS[dashboardStatsKind] || DASHBOARD_STATS_KINDS.scorers;
            const rows = dashboardStatsSortedRows(dashboardStatsKind);
            const ranked = rows.filter(r => r[meta.key] > 0);
            const total = rows.reduce((sum, r) => sum + r[meta.key], 0);

            const heroEl = document.getElementById('dashboard-stats-hero');
            if (heroEl) {
                const heroDetail = dashboardStatsKind === 'efficiency'
                    ? `${rows.reduce((sum, r) => sum + r.goals, 0)} ⚽ + ${rows.reduce((sum, r) => sum + r.assists, 0)} 🎯`
                    : meta.totalLabel;

                heroEl.innerHTML = `
                    <div class="grad-card ${meta.hero}">
                        <div class="grad-card-content flex items-center justify-between gap-3">
                            <div class="min-w-0">
                                <h2 class="text-lg font-extrabold drop-shadow-sm">Top ${meta.label.toLowerCase()}</h2>
                                <p class="text-[11px] font-medium opacity-90">${ranked.length} joueur${ranked.length > 1 ? 's' : ''} classé${ranked.length > 1 ? 's' : ''} · tous les matchs</p>
                            </div>
                            <div class="text-right shrink-0">
                                <p class="text-2xl font-extrabold drop-shadow-sm tabular-nums">${total}</p>
                                <p class="text-[11px] font-bold opacity-90">${heroDetail}</p>
                            </div>
                        </div>
                    </div>`;
            }

            const titleEl = document.getElementById('dashboard-stats-title');
            if (titleEl) {
                titleEl.innerHTML = `<i class="fa-solid ${meta.icon} text-slate-600 mr-1"></i>Classement des ${meta.label.toLowerCase()}`;
            }

            const subtitleEl = document.getElementById('dashboard-stats-subtitle');
            if (subtitleEl) {
                subtitleEl.innerText = ranked.length
                    ? `${ranked.length} joueur${ranked.length > 1 ? 's' : ''} · ${total} ${meta.totalLabel}`
                    : 'Aucune statistique enregistrée pour le moment';
            }

            const listEl = document.getElementById('dashboard-stats-list');
            if (!listEl) return;

            if (!ranked.length) {
                listEl.innerHTML = `
                    <div class="p-6 text-center">
                        <i class="fa-solid fa-chart-simple text-slate-300 text-2xl" aria-hidden="true"></i>
                        <p class="mt-2 text-xs font-bold text-slate-700">Aucune statistique enregistrée</p>
                        <p class="mt-1 text-[11px] text-slate-500">Les buts et les passes saisis dans le bilan d'un match apparaîtront ici.</p>
                    </div>`;
                return;
            }

            listEl.innerHTML = ranked.map((r, i) => {
                const detail = dashboardStatsKind === 'scorers'
                    ? `${r.goals} ⚽ · ${r.assists} 🎯`
                    : dashboardStatsKind === 'passers'
                        ? `${r.assists} 🎯 · ${r.goals} ⚽`
                        : `${r.goals} ⚽ + ${r.assists} 🎯`;

                const rankClass = i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-700' : 'bg-slate-700';

                return `
                    <div class="flex items-center justify-between gap-2 px-3 py-2.5">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 shrink-0 rounded-full ${rankClass} text-white text-[11px] font-extrabold flex items-center justify-center" title="Rang ${i + 1}">${i + 1}</span>
                            <div class="min-w-0">
                                <p class="font-bold text-xs truncate text-slate-800">${r.name}</p>
                                <p class="text-[10px] text-slate-400">${detail}${r.team ? ' · <span class="uppercase">' + r.team + '</span>' : ''}</p>
                            </div>
                        </div>
                        <span class="shrink-0 ${meta.badge} font-extrabold px-2 py-0.5 rounded text-xs">${r[meta.key]} ${meta.unit}</span>
                    </div>`;
            }).join('');
        }

        function openDashboardStats(kind) {
            if (DASHBOARD_STATS_KINDS[kind]) dashboardStatsKind = kind;

            renderDashboardStats();

            const dashboardSec = document.getElementById('sec-dashboard');
            const statsSec = document.getElementById('sec-dashboard-stats');

            if (dashboardSec) dashboardSec.classList.add('hidden');
            if (!statsSec) return;

            statsSec.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function closeDashboardStats() {
            const dashboardSec = document.getElementById('sec-dashboard');
            const statsSec = document.getElementById('sec-dashboard-stats');

            if (statsSec) statsSec.classList.add('hidden');
            if (dashboardSec) dashboardSec.classList.remove('hidden');

            renderDashboard();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.openDashboardStats = openDashboardStats;
        window.closeDashboardStats = closeDashboardStats;
        window.setDashboardStatsKind = setDashboardStatsKind;

        // Rendu Effectif
        function renderEffectif() {
            

                const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';

    let playersToDisplay = state.players;

if (role === 'responsable') {

    const allowedTeams = userTeam
        .split(',')
        .map(t => t.trim().toLowerCase());

    playersToDisplay = state.players.filter(
        p =>
            allowedTeams.includes(
                (p.team || p.cat || '').toLowerCase()
            )
    );

} else if (role === 'coach') {

    const allowedTeams = userTeam
        .split(',')
        .map(t => t.trim().toLowerCase());

    playersToDisplay = state.players.filter(
        p =>
            allowedTeams.includes(
                (p.team || p.cat || '').toLowerCase()
            )
    );
}
    

            // Tri par prénom pour les équipes en affichage « Prénom Nom »
            playersToDisplay = sortPlayersForDisplay(playersToDisplay);

            // Bilan de convocations par équipe (calculé une seule fois par équipe)
            const convocHistoryCache = {};
            const getConvocationHistoryForTeam = (teamKey) => {
                const key = String(teamKey || '').toLowerCase();
                if (!convocHistoryCache[key]) {
                    convocHistoryCache[key] = buildConvocationHistory(key);
                }
                return convocHistoryCache[key];
            };

            const container = document.getElementById('effectif-full-container');
            container.innerHTML = playersToDisplay.map(p => {
                const p1 = p.poste1 || '-', p2 = p.poste2 || '-', p3 = p.poste3 || '-';
                const niveau = p.niveau || 2;

const niveauBadge =
    niveau === 3
        ? '<span class="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">🟢 Niveau 3</span>'
        : niveau === 2
        ? '<span class="font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">🟡 Niveau 2</span>'
        : '<span class="font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">🔴 Niveau 1</span>';
                const hasLicence = p.licence && p.licence.trim() !== '' && p.licence.trim() !== '-';
                const hasBlessure = p.blessure === true;
                const cards = getPlayerCardsCount(p.id);
                const pStats = state.stats[p.id] || { goals: 0, assists: 0 };
                const teamKey = p.team || p.cat; 
                const teamName = state.teams?.[teamKey]?.name || "Sans équipe";
                const teamColors = getTeamColorClasses(teamKey);
                const catBadge =`<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${teamColors.badge}">
        ${teamName}
    </span>`;


                // Badge blessure
                const blessureBadge = hasBlessure ?
                    `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500 text-purple-100">🤕 Blessé</span>` :
                    '';


                // Calcul présences entraînements (nouveau format)
                const today = new Date();
today.setHours(0,0,0,0);

let presences = 0;
let totalSessions = 0;

Object.values(state.trainings).forEach(session => {
    if (!session.date) return;

    const sessionDate = new Date(session.date + 'T12:00:00');
    sessionDate.setHours(0,0,0,0);

    if (sessionDate >= today) return;

    // Ne compter que les séances de l'équipe du joueur
    if (
        (session.team || '').toLowerCase() !==
        (p.team || p.cat || '').toLowerCase()
    ) {
        return;
    }

    const presence = session.presence || {};

    // Ignorer les séances dont l'appel n'a pas été rempli
    if (Object.keys(presence).length === 0) {
        return;
    }

    totalSessions++;

    if (
        presence[p.id] === 'present' ||
        presence[p.id] === 'retard'
    ) {
        presences++;
    }
});
                const presencePct = totalSessions > 0 ? Math.round((presences / totalSessions) * 100) : null;
                const attendanceBadge = presencePct !== null && presencePct < 50 ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">⚠️ Assiduité faible</span>' : '';
                const presenceColor = presencePct === null ? 'text-slate-400' : presencePct >= 75 ? 'text-emerald-600' : presencePct >= 50 ? 'text-amber-600' : 'text-red-600';

                // Covoiturage : trajets conduits et autonomie
                const carpoolStats = getPlayerCarpoolStats(p.id);
                const carpoolAnswers = carpoolStats.answered - carpoolStats.absents;
                const autoBadge = (carpoolAnswers >= 2 && carpoolStats.rides === 0)
                    ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-700" title="Jamais passager sur les matchs renseignés">🔑 Autonome</span>'
                    : '';
                const carpoolHint = carpoolStats.answered
                    ? `${carpoolStats.withPassengers} conduite(s) avec passagers, ${carpoolStats.withoutSeats} sans place, ${carpoolStats.seatsOffered} place(s) offerte(s)`
                    : 'Aucune réponse covoiturage enregistrée';

                // Bilan convocations sur les matchs passés de son équipe
                const convocHistory = getConvocationHistoryForTeam(p.team || p.cat);
                const matchStats = convocHistory.history[p.id] || emptyConvocationStats();
                const matchPct = matchStats.total > 0 ? Math.round((matchStats.played / matchStats.total) * 100) : null;
                const matchColor = matchPct === null ? 'text-slate-400' : matchPct >= 75 ? 'text-emerald-600' : matchPct >= 50 ? 'text-amber-600' : 'text-red-600';

                                const initials = (p.name || '?')
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(w => w.charAt(0).toUpperCase())
                    .join('');

                const matchHint = matchPct !== null
                    ? `${matchStats.played} convoqué(s) sur ${matchStats.total} match(s)`
                    : (convocHistory.matches.length ? 'Aucun statut enregistré' : 'Aucun match passé');

                return `
                <article class="player-row border-slate-200">
                    <div class="player-avatar ${teamColors.badge}" aria-hidden="true">${initials}</div>

                    <div class="min-w-0 flex-1">
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <h3 class="player-name truncate">${p.name}</h3>
                                <p class="player-meta truncate">
                                    ${p1 !== '-' ? p1 : 'Poste non défini'}
                                    <span class="text-slate-300 px-1">·</span>
                                    <span class="${hasLicence ? '' : 'text-amber-700 font-bold'}">${hasLicence ? 'Lic. ' + p.licence : '⚠️ Licence manquante'}</span>
                                </p>
                            </div>

                            <div class="flex items-center gap-1 shrink-0">
                                <span class="hidden sm:inline px-2 py-0.5 rounded-full text-[10px] font-extrabold ${teamColors.badge}">${teamName}</span>
                                <button onclick="openModalPlayer('${p.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition" aria-label="Modifier le joueur ${p.name}"><i class="fa-solid fa-pen-to-square text-xs" aria-hidden="true"></i></button>
                                <button onclick="deletePlayer('${p.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" aria-label="Supprimer le joueur ${p.name}"><i class="fa-solid fa-trash-can text-xs" aria-hidden="true"></i></button>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-2.5">
                            <div class="metric" title="${matchHint}">
                                <span class="metric-label">Matchs</span>
                                <span class="metric-value ${matchColor}">${matchPct !== null ? matchPct + '%' : '—'}</span>
                            </div>
                            <div class="metric" title="${presencePct !== null ? presences + ' présence(s) sur ' + totalSessions + ' séance(s)' : 'Aucune séance passée'}">
                                <span class="metric-label">Séances</span>
                                <span class="metric-value ${presenceColor}">${presencePct !== null ? presencePct + '%' : '—'}</span>
                            </div>
                            <div class="metric" title="${pStats.goals} but(s), ${pStats.assists} passe(s) décisive(s)">
                                <span class="metric-label">Buts</span>
                                <span class="metric-value">${pStats.goals}⚽ ${pStats.assists}🎯</span>
                            </div>
                            <div class="metric" title="${cards.yellows} jaune(s), ${cards.reds} rouge(s)">
                                <span class="metric-label">Cartons</span>
                                <span class="metric-value"><span class="text-amber-600">${cards.yellows}🟨</span> <span class="text-red-600">${cards.reds}🟥</span></span>
                            </div>
                            <div class="metric" title="${carpoolHint}">
                                <span class="metric-label">Trajets</span>
                                <span class="metric-value ${carpoolStats.withPassengers ? 'text-sky-700' : 'text-slate-400'}">${carpoolStats.withPassengers ? carpoolStats.withPassengers + '🚗' : '—'}</span>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-1 mt-2">
                            ${niveauBadge}
                            ${blessureBadge}
                            ${attendanceBadge}
                            ${autoBadge}
                        </div>

                        <details class="player-details mt-2">
                            <summary><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>Détails et postes</summary>
                            <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                <div class="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[11.5px]">
                                    <span class="text-slate-500">Postes :</span>
                                    <span class="font-bold text-slate-800">${p1}${p2 !== '-' ? ' · ' + p2 : ''}${p3 !== '-' ? ' · ' + p3 : ''}</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[11.5px]">
                                    <span class="text-slate-500">Convocations :</span>
                                    <span class="font-bold text-slate-800">${matchStats.total > 0 ? `${matchStats.played} retenu(s) · ${matchStats.choix} choix · ${matchStats.indispo} indispo` : '—'}</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[11.5px]">
                                    <span class="text-slate-500">Entraînements :</span>
                                    <span class="font-bold text-slate-800">${presencePct !== null ? `${presences}/${totalSessions} séances` : '—'}</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[11.5px]">
                                    <span class="text-slate-500">Covoiturage :</span>
                                    <span class="font-bold text-slate-800">${carpoolStats.answered ? `${carpoolStats.withPassengers} avec passagers${carpoolStats.withoutSeats ? ` (dont ${carpoolStats.withoutSeats} sans place)` : ''} · ${carpoolStats.rides} passager · ${carpoolStats.directs} direct` : '—'}</span>
                                </div>
                                <div class="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 text-[11.5px]">
                                    <span class="text-slate-500">Équipe :</span>
                                    <span class="font-bold text-slate-800">${teamName}</span>
                                </div>
                            </div>
                        </details>
                    </div>
                </article>`;
            }).join('');

            renderStaffEffectif();
            renderCarpoolRanking();
        }

        window.renderEffectif = renderEffectif;

        // Statistiques covoiturage d'un joueur, calculees sur les matchs existants
        // (une reponse orpheline, sans match, n'est pas comptee)
        function getPlayerCarpoolStats(playerId) {

            const stats = {
                answered: 0,
                withPassengers: 0,
                withoutSeats: 0,
                seatsOffered: 0,
                rides: 0,
                directs: 0,
                absents: 0
            };

            if (!playerId) return stats;

            const responses = state.carpoolResponses || {};

            Object.values(state.matches || {}).forEach(m => {

                if (!m || !m.carpoolId) return;

                const r = (responses[m.carpoolId] || {})[playerId];

                if (!r || !r.status) return;

                stats.answered++;

                if (r.status === 'driver') {

                    const seats = parseInt(r.seats) || 0;

                    if (seats > 0) {
                        stats.withPassengers++;
                        stats.seatsOffered += seats;
                    } else {
                        stats.withoutSeats++;
                    }

                } else if (r.status === 'passenger') {
                    stats.rides++;
                } else if (r.status === 'direct') {
                    stats.directs++;
                } else if (r.status === 'absent') {
                    stats.absents++;
                }
            });

            return stats;
        }

        window.getPlayerCarpoolStats = getPlayerCarpoolStats;

        // Rendu Matchs & Convocations
        function populateMatchSelector() {
    const selector = document.getElementById('match-selector');

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';

    let matches = Object.values(state.matches);

    if (
    role === 'coach' ||
    role === 'responsable'
) {

    const allowedTeams = userTeam
        .split(',')
        .map(t => t.trim().toLowerCase());

    matches = matches.filter(m =>
        allowedTeams.includes(
            (m.team || '').toLowerCase()
        )
    );
}

    // Tri par date
    matches.sort((a, b) => {
        const dateA = a.date
            ? new Date(a.date + 'T12:00:00')
            : new Date('9999-12-31');

        const dateB = b.date
            ? new Date(b.date + 'T12:00:00')
            : new Date('9999-12-31');

        return dateA - dateB;
    });

    if (matches.length === 0) {
        selector.innerHTML =
            '<option value="">Aucun match</option>';
        return;
    }

    selector.innerHTML =
        '<option value="">-- Sélectionner un match --</option>' +
        matches.map(m => {

            const formattedDate = m.date
                ? new Date(m.date + 'T12:00:00').toLocaleDateString(
                    'fr-FR',
                    {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }
                )
                : '--/--/--';

            return `
                <option value="${m.id}">
                    ${m.opponent} (${formattedDate})
                </option>
            `;

        }).join('');

    // Aucune sélection automatique
    selector.value = state.selectedMatchId || '';
}
        function onMatchSelectorChange(matchId) {
            state.selectedMatchId = matchId;
            renderMatchDetail();
        }

        function setConvocViews(hasMatch) {
            const rows = document.getElementById('convoc-rows');
            const empty = document.getElementById('convoc-empty-state');

            if (rows) rows.classList.toggle('hidden', !hasMatch);
            if (empty) empty.classList.toggle('hidden', hasMatch);

            if (!hasMatch) {
                const tbody = document.getElementById('match-convocation-tbody');
                if (tbody) tbody.innerHTML = '';
                ['convoc-history-panel', 'bench-order-panel'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerHTML = '';
                });
            }
        }

        function renderMatchDetail() {
            const role = window.currentUserRole || 'public';
const userTeam = window.currentUserTeam || 'all';

            // Bouton « page covoiturage » : visible dès qu'un match est sélectionné
            updateTransportCarpoolLink(
                state.selectedMatchId ? state.matches?.[state.selectedMatchId] : null
            );
            const selector = document.getElementById('match-selector');
            const tbody = document.getElementById('match-convocation-tbody');
            const infoCard = document.getElementById('match-info-card');
            const counterBanner = document.getElementById('convocation-counter-banner');
            const carpoolBanner = document.getElementById('carpooling-counter-banner');
            const validationStatus = document.getElementById('match-validation-status');
            const inviteSearchBlock = document.getElementById('invite-search-block');

           if (!state.selectedMatchId) {

    setConvocViews(false);

    infoCard.style.display = 'none';
    counterBanner.style.display = 'none';
    if (carpoolBanner) {
    carpoolBanner.style.display = 'none';
}
    if (inviteSearchBlock) inviteSearchBlock.classList.add('hidden');

    return;
}

            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) {
                // Éviter d'afficher les panneaux du match précédent
                ['convoc-history-panel', 'bench-order-panel'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.innerHTML = '';
                });
                setConvocViews(false);
              if (infoCard) infoCard.style.display = 'none';
if (counterBanner) counterBanner.style.display = 'none';
if (carpoolBanner) carpoolBanner.style.display = 'none';  
                if(validationStatus) validationStatus.innerHTML = '';
                if (inviteSearchBlock) inviteSearchBlock.classList.add('hidden');
                return;
            }

            selector.value = state.selectedMatchId;
            if (infoCard) infoCard.style.display = 'flex';
if (counterBanner) counterBanner.style.display = 'block';
if (carpoolBanner) carpoolBanner.style.display = 'block';
            const m = state.matches[state.selectedMatchId];
            if (
    role === 'coach' &&
    m &&
    (m.team || '').toLowerCase() !== userTeam.toLowerCase()
) {
    updateTransportCarpoolLink(null);
    if (inviteSearchBlock) inviteSearchBlock.classList.add('hidden');
    return;
}

            // Liste des joueurs du match via le sélecteur unique :
            // effectif de l'équipe + surclassés (résolus depuis l'effectif).
            // Un coach ne voit que son équipe et ses invités ; un admin voit
            // tout l'effectif pour pouvoir convoquer n'importe qui.
            const playerItems = getMatchPlayers(m, { includeAll: role !== 'coach' });
            const playersForMatch = playerItems.map(item => item.p);

            const teamName = state.teams?.[m.team]?.name || m.team || 'Équipe';
            const teamColors = getTeamColorClasses(m.team);
            const formattedDate = m.date ? new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }) : '--/--/--';

            if (!m.convocations) m.convocations = {};
            if (!m.positions) m.positions = {};
            if (!m.jerseys) m.jerseys = {};
            if (!m.carpool) m.carpool = {};

            // Bilan des convocations sur les matchs passés de cette équipe
            const convocHistory = buildConvocationHistory(m.team);
            const cardsIndex = getCardsByPlayerIndex();
            const jerseysForMatch = computeMatchJerseys(m);

            if (inviteSearchBlock) {
                inviteSearchBlock.classList.toggle('hidden', role !== 'coach' && role !== 'responsable');
                const inviteInput = document.getElementById('invite-search-input');
                if (inviteInput) inviteInput.value = '';
                const inviteResults = document.getElementById('invite-search-results');
                if (inviteResults) inviteResults.innerHTML = '';
            }

            infoCard.innerHTML = `
                <div class="flex items-start space-x-3 w-full">
                    <div class="w-10 h-10 rounded-lg ${teamColors.bg} ${teamColors.textBold} flex items-center justify-center font-bold text-base shrink-0 mt-0.5"><i class="fa-solid fa-futbol"></i></div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <div class="flex items-center space-x-2">
    <p class="font-bold ${teamColors.textBold} text-sm">
        ${teamName} vs ${m.opponent}
    </p>
    ${getMatchTypeBadge(m.type || 'Championnat')}
</div>

<div class="flex flex-wrap gap-2 justify-end">

    <button
        onclick="openModalMatch('${m.id}')"
        class="${teamColors.textLight} font-bold text-xs ${teamColors.bg} px-2.5 py-1 rounded-lg border ${teamColors.border}">
        <i class="fa-solid fa-pen-to-square mr-1"></i>
        Modifier
    </button>

    <button
        onclick="duplicateMatch('${m.id}')"
        class="text-indigo-600 font-bold text-xs bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
        <i class="fa-solid fa-copy mr-1"></i>
        Dupliquer
    </button>

    <button
        onclick="resetMatch('${m.id}')"
        class="text-amber-600 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
        <i class="fa-solid fa-rotate-left mr-1"></i>
        Réinitialiser
    </button>

    <button
        onclick="deleteMatch('${m.id}')"
        class="text-red-600 font-bold text-xs bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
        <i class="fa-solid fa-trash mr-1"></i>
        Supprimer
    </button>

</div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5 text-[11px] ${teamColors.textLight}">
                            <div>📍 ${m.location || 'Domicile'} (${m.adresse || 'Stade non défini'})</div>
                            <div>📅 ${formattedDate} à ${m.heure || '14:30'}</div>
                            <div>🌿 ${m.pelouse || 'Synthétique'}</div>
                        </div>
                        <div class="mt-1.5 text-[11px] font-bold text-sky-700">🕐 Rendez-vous : ${getRdvHeure(m) || '--'}${m.meetingPlace ? ' — ' + m.meetingPlace : ''}</div>
                    </div>
                </div>`;

            if (validationStatus) {
                validationStatus.innerHTML = m.isValidated ? `<span class="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs"><i class="fa-solid fa-lock mr-1"></i> Feuille verrouillée</span>` : `<span class="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold text-xs"><i class="fa-solid fa-lock-open mr-1"></i> Brouillon</span>`;
            }

            const validateBtnZone = document.getElementById('match-validate-btn');
            if (validateBtnZone) {
                validateBtnZone.innerHTML = m.isValidated
                    ? `<button onclick="unlockCurrentMatchSheet()" class="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"><i class="fa-solid fa-lock-open"></i><span>Déverrouiller la feuille</span></button>`
                    : `<button onclick="validateCurrentMatchSheet()" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-sm"><i class="fa-solid fa-circle-check"></i><span>Valider et verrouiller</span></button>`;
            }

            let convokedCount = 0;
            const targetConvoked = parseInt(state.teams?.[m.team]?.targetConvocations) || 14;
            playerItems.forEach(({ p }) => {
                if (m.convocations[p.id] === 'convoke') convokedCount++;
            });

            counterBanner.className = 'bg-white p-4 rounded-xl border border-slate-100 card-shadow';
            counterBanner.innerHTML = renderConvocationOverviewCard(m, playerItems, convokedCount, targetConvoked);

    const summary = buildCarpoolSummary(m, playerItems.map(it => it.p));

// (statuts et compteurs calculés par buildCarpoolSummary)

if (carpoolBanner) {

    carpoolBanner.className = 'bg-white p-4 rounded-xl border border-slate-100 card-shadow';

    carpoolBanner.innerHTML = renderCarpoolOverviewCard(summary, m, role);
}

renderTransportTab(summary);

renderMatchSummary(m);


            // 1. Rendu des Joueurs : Séparation claire Mobile (Cartes) / PC (Tableau)
            let htmlMobileCards = '';
            let htmlTableRows = '';

            // Pastille d'etat transport dans la liste de convocation
            const carpoolResp = state.carpoolResponses?.[m.carpoolId] || {};

            const carpoolChip = (pid) => {

                if (m.convocations[pid] !== 'convoke') return '';

                const r = carpoolResp[pid];

                if (!r) return '<span class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-extrabold" title="Pas de reponse covoiturage">⏳</span>';

                if (r.status === 'driver') return `<span class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 text-[9px] font-extrabold" title="Conducteur">🚗 ${r.seats || 0}</span>`;

                if (r.status === 'passenger') return '<span class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[9px] font-extrabold" title="Passager">👤</span>';

                if (r.status === 'direct') return '<span class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-extrabold" title="Va directement au stade">📍</span>';

                if (r.status === 'absent') return '<span class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[9px] font-extrabold" title="Absent">❌</span>';

                return '';
            };

            // Liste triée par ordre alphabétique des prénoms
            // (cartes mobile et tableau PC de l'onglet Convocations)
            const firstNameSortKey = (p) => {
                const { prenom, nom } = getPlayerNameParts(p);
                return String(prenom || nom || p.name || '');
            };

            playerItems.sort((a, b) =>
                firstNameSortKey(a.p).localeCompare(firstNameSortKey(b.p), 'fr', { sensitivity: 'base' })
                || String(a.p.name || '').localeCompare(String(b.p.name || ''), 'fr', { sensitivity: 'base' })
            );

            playerItems.forEach(({ p, invite }) => {
                const currentStatus = m.convocations[p.id] || 'none';
                const selectedPosition = m.positions[p.id] || p.poste1 || '-';
                const jerseyNumber = jerseysForMatch[p.id]?.number ?? '';
                const disciplineChip = renderDisciplineChip(computePlayerDiscipline(p.id, cardsIndex));
                const postes = getPlayerPostesList(p);
                const hasLicence = p.licence && p.licence.trim() !== '' && p.licence.trim() !== '-';

                // --- HTML POUR MOBILE (Cartes) ---
                htmlMobileCards += `
                    <div class="bg-white border ${currentStatus === 'convoke' ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200'} rounded-xl p-3.5 shadow-sm space-y-2.5 mb-2.5">
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <div class="font-bold text-slate-800 text-[13px]">${p.name}${invite ? ' <span class="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">Invité</span>' : ''}${disciplineChip}${carpoolChip(p.id)}</div>
                                <div class="text-[10px] text-slate-400">Poste favori : <span class="font-semibold text-slate-600">${p.poste1 || '-'}</span></div>
                                ${convocationBadgeHtml(convocHistory.history[p.id])}
                            </div>
                            ${invite ? `<button onclick="retirerInviteJoueur('${m.id}', '${p.id}')" class="text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg shrink-0" title="Retirer l'invité"><i class="fa-solid fa-xmark text-xs"></i></button>` : ''}
                        </div>

                        <div class="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-0.5">
                            <button onclick="setMatchStatus('${m.id}', '${p.id}', 'convoke')" class="status-btn status-convoke text-center ${currentStatus === 'convoke' ? 'active-convoke' : ''}">Conv.</button>
                            <button onclick="setMatchStatus('${m.id}', '${p.id}', 'nonconvoke')" class="status-btn status-nonconvoke text-center ${currentStatus === 'nonconvoke' ? 'active-nonconvoke' : ''}">Non</button>
                            <button onclick="setMatchStatus('${m.id}', '${p.id}', 'indisponible')" class="status-btn status-indisponible text-center ${currentStatus === 'indisponible' ? 'active-indisponible' : ''}">Indispo</button>
                        </div>

                        <div class="grid grid-cols-1 gap-1.5 text-xs pt-2 border-t border-slate-100">
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-[10px] text-slate-500 uppercase font-bold">Licence</span>
                                <div class="flex items-center space-x-1.5">
                                    <span class="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border text-xs">${hasLicence ? p.licence : '⚠️ Manquante'}</span>
                                    ${hasLicence ? `<button onclick="copyLicence('${p.licence}')" class="p-1.5 bg-white hover:bg-sky-50 text-slate-500 rounded border" aria-label="Copier la licence"><i class="fa-solid fa-copy text-xs"></i></button>` : ''}
                                </div>
                            </div>
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-[10px] text-slate-500 uppercase font-bold">Poste</span>
                                <select onchange="setMatchPosition('${m.id}', '${p.id}', this.value)" class="bg-white border border-sky-300 font-bold text-xs text-sky-900 py-1 px-2 rounded-lg">
                                    ${postes.map(pos => `<option value="${pos}" ${pos === selectedPosition ? 'selected' : ''}>${pos}</option>`).join('')}
                                    <option value="Gardien" ${selectedPosition === 'Gardien' ? 'selected' : ''}>Gardien</option>
                                    <option value="Remplaçant" ${selectedPosition === 'Remplaçant' ? 'selected' : ''}>Remplaçant</option>
                                </select>
                            </div>
                            <div class="flex items-center justify-between gap-2">
                                <span class="text-[10px] text-slate-500 uppercase font-bold">Maillot</span>
                                <input type="number" min="1" max="99" value="${jerseyNumber}" placeholder="N°" onchange="setMatchJersey('${m.id}', '${p.id}', this.value)" class="w-16 p-1 border rounded text-center font-bold text-xs bg-white">
                            </div>
                        </div>
                    </div>
                `;

                // --- HTML POUR PC (Lignes de tableau classiques) ---
                htmlTableRows += `
                    <tr class="${currentStatus === 'convoke' ? 'bg-sky-50/30' : ''} border-b border-slate-100 hover:bg-slate-50/50">
                        <td class="p-3 pl-4">
                            <div class="font-bold text-slate-800">${p.name}${invite ? ' <span class="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">Invité</span>' : ''}${disciplineChip}${carpoolChip(p.id)}</div>
                            <div class="text-[10px] text-slate-400">Poste favori : ${p.poste1 || '-'}</div>
                            ${convocationBadgeHtml(convocHistory.history[p.id])}
                        </td>
                        <td class="p-3">
                            <div class="flex items-center space-x-1.5">
                                <span class="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border text-xs">${hasLicence ? p.licence : '⚠️'}</span>
                                ${hasLicence ? `<button onclick="copyLicence('${p.licence}')" class="p-1 bg-slate-100 hover:bg-sky-100 text-slate-500 rounded"><i class="fa-solid fa-copy text-xs"></i></button>` : ''}
                            </div>
                        </td>
                        <td class="p-3">
                            <select onchange="setMatchPosition('${m.id}', '${p.id}', this.value)" class="bg-white border border-sky-300 font-bold text-xs text-sky-900 py-1 px-2 rounded-lg">
                                ${postes.map(pos => `<option value="${pos}" ${pos === selectedPosition ? 'selected' : ''}>${pos}</option>`).join('')}
                                <option value="Gardien" ${selectedPosition === 'Gardien' ? 'selected' : ''}>Gardien</option>
                                <option value="Remplaçant" ${selectedPosition === 'Remplaçant' ? 'selected' : ''}>Remplaçant</option>
                            </select>
                        </td>
                        <td class="p-3 text-center">
                            <input type="number" min="1" max="99" value="${jerseyNumber}" placeholder="N°" onchange="setMatchJersey('${m.id}', '${p.id}', this.value)" class="w-14 p-1 border rounded text-center font-bold text-xs bg-white">
                        </td>
                        
<td class="p-3 text-center">
                             <div class="inline-flex rounded-lg border p-0.5 bg-slate-50">
                                 <button onclick="setMatchStatus('${m.id}', '${p.id}', 'convoke')" class="status-btn status-convoke ${currentStatus === 'convoke' ? 'active-convoke' : ''}">Conv.</button>
                                 <button onclick="setMatchStatus('${m.id}', '${p.id}', 'nonconvoke')" class="status-btn status-nonconvoke ${currentStatus === 'nonconvoke' ? 'active-nonconvoke' : ''}">Non</button>
                                 <button onclick="setMatchStatus('${m.id}', '${p.id}', 'indisponible')" class="status-btn status-indisponible ${currentStatus === 'indisponible' ? 'active-indisponible' : ''}">Indispo</button>
                             </div>
                            ${invite ? `<button onclick="retirerInviteJoueur('${m.id}', '${p.id}')" class="ml-1 text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg" title="Retirer l'invité"><i class="fa-solid fa-xmark text-xs"></i></button>` : ''}
                        </td>
                    </tr>
                `;
            });

            // 2. Rendu de l'Entourage (Coachs + Dirigeants) pour Mobile et PC
            const entourage = buildEntourageHtml(m);
            const staffTableRows = entourage.table;
            const staffMobileCards = entourage.mobile;

            // Injection finale propre dans les deux conteneurs
            const mobileContainer = document.getElementById('mobile-players-container');
            if (mobileContainer) {
                mobileContainer.innerHTML = htmlMobileCards + staffMobileCards;
            }
            
            if (tbody) {
                tbody.innerHTML = htmlTableRows + staffTableRows;
            }

            setConvocViews(true);

            // Panneau récapitulatif des convocations (matchs passés)
            renderConvocationHistory(m, playerItems, convocHistory);

            // Classement des remplaçants (banc)
            renderBenchOrderPanel(m);
}

        // ============================================================
        // MODULE ENTRAÎNEMENTS — REFONTE COMPLÈTE
        // ============================================================

        let currentTrainingId = null;

        let trainingSearchQuery = '';
        let trainingTeamFilter = 'all';
        let trainingStatusFilter = 'all';

        function getTrainingScopeTeams() {
            const role = window.currentUserRole || 'public';
            const scopes = String(window.currentUserTeam || '')
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(Boolean);
            return role === 'coach' && scopes.length ? scopes : null;
        }

        function getTrainingSessionsForUser() {
            let all = Object.values(state.trainings || {});
            const scope = getTrainingScopeTeams();
            if (scope) all = all.filter(t => scope.includes((t.team || '').toLowerCase()));
            return all;
        }

        function getTrainingSessionStats(s) {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const sDate = s.date ? new Date(s.date + 'T12:00:00') : null;
            const isPast = !!(sDate && sDate < today);
            const presences = Object.values(s.presence || {});
            const nbPresent = presences.filter(v => v === 'present' || v === 'retard').length;
            const nbTotal = state.players.filter(p =>
                (p.team || p.cat || '').toLowerCase() === (s.team || '').toLowerCase()
            ).length;
            const pct = nbTotal > 0 ? Math.round((nbPresent / nbTotal) * 100) : 0;
            const isComplete = nbTotal > 0 && presences.length >= nbTotal;
            return { isPast, presences, nbPresent, nbTotal, pct, isComplete };
        }

        function matchTrainingStatus(s, status) {
            if (status === 'all') return true;
            const stats = getTrainingSessionStats(s);
            if (status === 'upcoming') return !stats.isPast;
            if (status === 'past') return stats.isPast;
            if (status === 'tocomplete') return stats.isPast && !stats.isComplete;
            return true;
        }

        function trainingSessionMatches(s) {
            if (trainingTeamFilter !== 'all' && (s.team || '') !== trainingTeamFilter) return false;
            if (!matchTrainingStatus(s, trainingStatusFilter)) return false;
            const query = trainingSearchQuery.trim().toLowerCase();
            if (!query) return true;
            return [s.title, s.theme, s.lieu, s.team, state.teams?.[s.team]?.name]
                .filter(Boolean).join(' ').toLowerCase().includes(query);
        }

        function setTrainingStatusFilter(status) {
            trainingStatusFilter = status;
            renderEntrainements();
        }

        function filterTrainingSessions(value) {
            if (typeof value === 'string') trainingSearchQuery = value;
            const select = document.getElementById('training-team-filter');
            if (select) trainingTeamFilter = select.value;
            renderEntrainements();
        }

        function resetTrainingFilters() {
            trainingSearchQuery = '';
            trainingTeamFilter = 'all';
            trainingStatusFilter = 'all';
            const input = document.getElementById('training-search');
            if (input) input.value = '';
            const select = document.getElementById('training-team-filter');
            if (select) select.value = 'all';
            renderEntrainements();
        }

        window.setTrainingStatusFilter = setTrainingStatusFilter;
        window.filterTrainingSessions = filterTrainingSessions;
        window.resetTrainingFilters = resetTrainingFilters;

        function renderTrainingToolbar() {
            const wrapper = document.getElementById('training-toolbar');
            if (!wrapper) return;

            const allSessions = getTrainingSessionsForUser();
            wrapper.classList.toggle('hidden', allSessions.length === 0);

            const select = document.getElementById('training-team-filter');
            if (select) {
                const teamKeys = [...new Set(allSessions.map(s => s.team).filter(Boolean))];
                if (trainingTeamFilter !== 'all' && !teamKeys.includes(trainingTeamFilter)) {
                    trainingTeamFilter = 'all';
                }
                select.innerHTML = '<option value="all">Toutes les équipes</option>' + teamKeys
                    .map(key => `<option value="${key}" ${trainingTeamFilter === key ? 'selected' : ''}>${state.teams?.[key]?.name || String(key).toUpperCase()}</option>`)
                    .join('');
                select.classList.toggle('hidden', teamKeys.length < 2);
            }

            const statusEl = document.getElementById('training-status-filters');
            if (!statusEl) return;
            const counts = { all: allSessions.length, upcoming: 0, tocomplete: 0, past: 0 };
            allSessions.forEach(s => {
                const stats = getTrainingSessionStats(s);
                if (stats.isPast) {
                    counts.past++;
                    if (!stats.isComplete) counts.tocomplete++;
                } else {
                    counts.upcoming++;
                }
            });
            const chips = [
                { key: 'all', label: 'Toutes', count: counts.all },
                { key: 'upcoming', label: 'À venir', count: counts.upcoming },
                { key: 'tocomplete', label: 'À compléter', count: counts.tocomplete },
                { key: 'past', label: 'Passées', count: counts.past }
            ];
            statusEl.innerHTML = chips.map(c => {
                const active = trainingStatusFilter === c.key;
                return `<button type="button" onclick="setTrainingStatusFilter('${c.key}')" class="px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:bg-slate-100'}">${c.label}<span class="ml-1 ${active ? 'text-white/60' : 'text-slate-400'}">${c.count}</span></button>`;
            }).join('');
        }

        function renderEntrainements() {
            renderTrainingStatsBar();
            renderTrainingToolbar();
            const daysLabelEl = document.getElementById('training-days-label');
            if (daysLabelEl) daysLabelEl.textContent = trainingDaysLabel() + ' · 18h00 – 20h00';
            const today = new Date(); today.setHours(0,0,0,0);

            const all = getTrainingSessionsForUser().filter(trainingSessionMatches);
            const future = all.filter(s => s.date && new Date(s.date + 'T12:00:00') >= today)
                              .sort((a, b) => new Date(a.date) - new Date(b.date));
            const past   = all.filter(s => !s.date || new Date(s.date + 'T12:00:00') < today)
                              .sort((a, b) => new Date(b.date) - new Date(a.date));
            const sessions = [...future, ...past];
            const nextUpcomingId = future.length ? future[0].id : null;

            const container = document.getElementById('training-sessions-list');
            if (!container) return;

            if (sessions.length === 0) {
                const hasAnySession = getTrainingSessionsForUser().length > 0;
                container.innerHTML = hasAnySession
                    ? `<div class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i class="fa-solid fa-filter-circle-xmark text-4xl mb-3 opacity-30" aria-hidden="true"></i>
                    <p class="text-sm font-semibold">Aucune séance ne correspond</p>
                    <p class="text-xs mt-1">Modifiez la recherche ou les filtres</p>
                    <button type="button" onclick="resetTrainingFilters()" class="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">Réinitialiser les filtres</button>
                </div>`
                    : `<div class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i class="fa-solid fa-person-running text-4xl mb-3 opacity-30"></i>
                    <p class="text-sm font-semibold">Aucune séance enregistrée</p>
                    <p class="text-xs mt-1">Créez votre première séance avec le bouton ci-dessus</p>
                </div>`;
                return;
            }

            // Séparateurs
            let html = '';
            let shownUpcoming = false, shownPast = false;

            sessions.forEach((s, i) => {
                const sDate = s.date ? new Date(s.date + 'T12:00:00') : null;
                const isPast = !!(sDate && sDate < today);
                const isNext = s.id === nextUpcomingId;

                if (!isPast) {
                    if (isNext) {
                        html += `<p class="text-[10px] font-extrabold uppercase tracking-widest text-sky-500 mb-1 mt-1">⚡ Prochain entraînement</p>`;
                    } else if (!shownUpcoming) {
                        html += `<p class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 mt-3">📅 À venir · ${future.length - 1}</p>`;
                        shownUpcoming = true;
                    }
                } else if (!shownPast) {
                    html += `<p class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 mt-4">🕓 Séances passées · ${past.length}</p>`;
                    shownPast = true;
                }

                const presences = Object.values(s.presence || {});
                const nbPresent = presences.filter(v =>
    v === 'present' || v === 'retard'
).length;
                const playersForTraining = state.players.filter(p =>
    (p.team || p.cat || '').toLowerCase() ===
    (s.team || '').toLowerCase()
);

const nbTotal = playersForTraining.length;
                const pct = nbTotal > 0 ? Math.round((nbPresent / nbTotal) * 100) : 0;
                const pctColor = pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
                const dayName = s.date ? new Date(s.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—';
                const hasPdf = !!s.pdfData;
                const isComplete = presences.length >= nbTotal && nbTotal > 0;

                const statusDot = isPast
                    ? (isComplete ? '<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>' : '<span class="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>')
                    : (isNext ? '<span class="w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse"></span>' : '<span class="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>');

                const cardBg = isNext
                    ? 'bg-sky-50 border-sky-200 hover:border-sky-400'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-200';

                    const teamColors = getTeamColorClasses(s.team);

                html += `<div onclick="openTrainingDetail('${s.id}')"
     class="p-3.5 ${cardBg} border ${teamColors.border} border-l-4 rounded-xl cursor-pointer transition-all group">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-9 h-9 shrink-0 rounded-xl ${isPast ? 'bg-slate-100 text-slate-500' : 'bg-gradient-to-br from-sky-500 to-sky-700 text-white'} flex items-center justify-center">
                                <i class="fa-solid fa-person-running text-sm" aria-hidden="true"></i>
                            </div>
                            <div>
                                <div class="flex items-center space-x-2">
                                    ${statusDot}
                                    <div>
    <p class="font-bold text-slate-800 text-xs capitalize">
        ${s.title || 'Séance sans titre'}
    </p>

    <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${teamColors.badge}">
        ⚽ ${state.teams?.[s.team]?.name || s.team || 'Équipe'}
    </span>
</div>
                                    ${hasPdf ? '<span class="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded"><i class="fa-solid fa-file-pdf mr-0.5"></i>PDF</span>' : ''}
                                </div>
                                <p class="text-[11px] text-slate-500 mt-0.5 capitalize">${dayName} · ${s.heure || '18:00'} – 20:00</p>
                                <p class="text-[11px] text-sky-600 font-semibold">${s.theme || 'Thème non défini'}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-3 shrink-0">
                            ${isPast
                                ? (isComplete
                                    ? '<span class="hidden sm:inline px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-extrabold whitespace-nowrap">Saisie complète</span>'
                                    : '<span class="hidden sm:inline px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-extrabold whitespace-nowrap">À compléter</span>')
                                : '<span class="hidden sm:inline px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-extrabold whitespace-nowrap">À venir</span>'}
                            <div class="text-right">
                                <p class="font-extrabold text-sm ${pctColor}">${nbPresent}/${nbTotal}</p>
                                <p class="text-[10px] text-slate-400">présents</p>
                            </div>
                            <i class="fa-solid fa-chevron-right text-slate-300 group-hover:text-sky-400 transition text-xs"></i>
                        </div>
                    </div>
                </div>`;
            });

            container.innerHTML = html;
        }

        function renderTrainingStatsBar() {

    const today = new Date();
    today.setHours(0,0,0,0);

    const sessions = Object.values(state.trainings || {}).filter(s => {

        if (!s.date) return false;

        const sessionDate = new Date(s.date + 'T12:00:00');
        sessionDate.setHours(0,0,0,0);

        return sessionDate < today;

    });
            const nbSessions = sessions.length;

            // Ne compter que les séances dont l'appel a réellement été rempli :
            // une séance sans présence ({} ) ne doit pas faire baisser la moyenne.
            const filledSessions = sessions.filter(s =>
                (s.presence && Object.keys(s.presence).length > 0)
            );
            let totalPresences = 0, totalPossible = 0;
            filledSessions.forEach(s => {
                const playersForTraining = state.players.filter(p =>
    (p.team || p.cat || '').toLowerCase() ===
    (s.team || '').toLowerCase()
);
                    const possible = playersForTraining.length;
                    if (possible === 0) return;
                    const vals = Object.values(s.presence || {});
                    totalPresences += vals.filter(v =>
    v === 'present' || v === 'retard'
).length;
                    totalPossible += possible;
                });
            const avgPct = totalPossible > 0 ? Math.round((totalPresences / totalPossible) * 100) : null;
            const avgColor = avgPct === null ? 'text-slate-400' : avgPct >= 75 ? 'text-emerald-600' : avgPct >= 50 ? 'text-amber-600' : 'text-red-500';

            const bar = document.getElementById('training-stats-bar');
            if (!bar) return;
            bar.innerHTML = `
                <div class="card p-3 text-center">
                    <p class="text-2xl font-extrabold text-sky-600">${nbSessions}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Séances</p>
                </div>
                <div class="card p-3 text-center">
                    <p class="text-2xl font-extrabold ${avgColor}">${avgPct === null ? '—' : avgPct + '%'}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Présence moy.</p>
                </div>
                <div class="card p-3 text-center">
                    <p class="text-2xl font-extrabold text-slate-700">${totalPresences}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Présences tot.</p>
                </div>`;
        }

        window.renderTrainingStatsBar = renderTrainingStatsBar;

        function openTrainingDetail(tId) {
            currentTrainingId = tId;
            const s = state.trainings[tId];
            if (!s) return;
            document.getElementById('training-list-view').classList.add('hidden');
            document.getElementById('training-detail-view').classList.remove('hidden');

            const dayName = s.date ? new Date(s.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—';
            document.getElementById('detail-session-title').textContent = s.title || 'Séance sans titre';
            document.getElementById('detail-session-meta').textContent = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} · ${s.heure || '18:00'} – 20:00`;
            document.getElementById('detail-session-theme').textContent = s.theme || '—';

            const matchLabel = document.getElementById('training-match-link-label');
            if (matchLabel) {
                matchLabel.textContent = formatTrainingMatchLabel(findTrainingWeekMatch(s));
            }

            // PDF
            if (s.pdfData) {
                document.getElementById('detail-pdf-zone').classList.remove('hidden');
                document.getElementById('detail-no-pdf-zone').classList.add('hidden');
                document.getElementById('detail-pdf-name').textContent = s.pdfName || 'plan-seance.pdf';
            } else {
                document.getElementById('detail-pdf-zone').classList.add('hidden');
                document.getElementById('detail-no-pdf-zone').classList.remove('hidden');
            }

            renderSessionPresenceStats(s);
            renderAppel(s);
            renderAttendanceBars();
            renderGeneratedTeams();

        }

        function backToTrainingList() {
            currentTrainingId = null;
            document.getElementById('training-list-view').classList.remove('hidden');
            document.getElementById('training-detail-view').classList.add('hidden');
            renderEntrainements();
        }

        // --- Lien séance d'entraînement <-> composition du match de la semaine ---

        // Cherche le match de la semaine pour une séance : d'abord le prochain
        // match de la même équipe dans les 7 jours, sinon un match joué dans
        // les 2 jours précédents.
        function findTrainingWeekMatch(training) {
            if (!training || !training.date) return null;

            const ref = new Date(training.date + 'T12:00:00').getTime();
            if (isNaN(ref)) return null;

            const team = String(training.team || '').toLowerCase();

            const candidates = Object.values(state.matches || {})
                .filter(m => m && m.date)
                .filter(m => !team || String(m.team || '').toLowerCase() === team)
                .map(m => ({
                    match: m,
                    diff: (new Date(m.date + 'T12:00:00').getTime() - ref) / 86400000
                }))
                .filter(c => !isNaN(c.diff));

            const after = candidates
                .filter(c => c.diff >= 0 && c.diff <= 7)
                .sort((a, b) => a.diff - b.diff);

            if (after.length) return after[0].match;

            const before = candidates
                .filter(c => c.diff < 0 && c.diff >= -2)
                .sort((a, b) => b.diff - a.diff);

            return before.length ? before[0].match : null;
        }

        function formatTrainingMatchLabel(match) {
            if (!match) return 'Aucun match programmé autour de cette séance';

            const date = match.date
                ? new Date(match.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                    weekday: 'short', day: 'numeric', month: 'short'
                })
                : '';

            return `${match.opponent || 'Match'}${date ? ' · ' + date : ''}`;
        }

        function openMatchCompositionFromTraining() {
            const training = state.trainings?.[currentTrainingId];
            if (!training) return;

            const match = findTrainingWeekMatch(training);

            if (!match) {
                alert(
                    "Aucun match n'est programmé cette semaine pour " +
                    (state.teams?.[training.team]?.name || training.team || 'cette équipe') +
                    ".\nCrée d'abord le match dans l'onglet Matchs."
                );
                return;
            }

            switchTab('matchs');
            state.selectedMatchId = match.id;

            const selector = document.getElementById('match-selector');
            if (selector) selector.value = match.id;

            switchMatchSubTab('composition');

            window.compositionReturnTrainingId = training.id;
            renderMatchComposition();
        }

        function backToTrainingFromComposition() {
            const trainingId = window.compositionReturnTrainingId;
            window.compositionReturnTrainingId = null;

            switchTab('entrainements');

            if (trainingId && state.trainings?.[trainingId]) {
                openTrainingDetail(trainingId);
            }
        }

        window.openMatchCompositionFromTraining = openMatchCompositionFromTraining;
        window.backToTrainingFromComposition = backToTrainingFromComposition;

        function renderSessionPresenceStats(s) {
            const presence = s.presence || {};
            const counts = { present: 0, absent: 0, retard: 0, blesse: 0, none: 0 };
            state.players.forEach(p => { counts[presence[p.id] || 'none']++; });
            const configs = [
                { key: 'present', label: 'Présents',  icon: '✅', bg: 'bg-emerald-50 border-emerald-100', val: 'text-emerald-600' },
                { key: 'absent',  label: 'Absents',   icon: '❌', bg: 'bg-red-50 border-red-100',         val: 'text-red-600' },
                { key: 'retard',  label: 'Retards',   icon: '⏰', bg: 'bg-amber-50 border-amber-100',     val: 'text-amber-600' },
                { key: 'blesse',  label: 'Blessés',   icon: '🤕', bg: 'bg-purple-50 border-purple-100',   val: 'text-purple-600' },
            ];
            document.getElementById('session-presence-stats').innerHTML = configs.map(c => `
                <div class="p-3 rounded-xl border ${c.bg} text-center">
                    <p class="text-xl font-extrabold ${c.val}">${counts[c.key]}</p>
                    <p class="text-[10px] text-slate-500">${c.icon} ${c.label}</p>
                </div>`).join('');
        }

        function renderAppel(s) {
            const presence = s.presence || {};
            const container = document.getElementById('entrainements-tbody');
            if (!container) return;
            
            const role = window.currentUserRole || 'public';
            const userTeam = window.currentUserTeam || 'all';
            
            // Filtrer les joueurs par équipe du coach (multi-scopes possibles)
            const userScopes = String(userTeam || '')
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(Boolean);

            let playersToShow = state.players;
            if (role === 'coach') {
                playersToShow = state.players.filter(p =>
                    userScopes.includes(
                        (p.team || p.cat || '').toLowerCase()
                    )
                );
            }
            
            container.innerHTML = playersToShow.map(p => {
                const status = presence[p.id] || 'none';
                const statuses = ['present', 'absent', 'retard', 'blesse', 'none'];
                const labels = {
                    present: { icon: '✅', label: 'Présent',  color: 'bg-emerald-500 text-white' },
                    absent:  { icon: '❌', label: 'Absent',   color: 'bg-red-500 text-white' },
                    retard:  { icon: '⏰', label: 'Retard',   color: 'bg-amber-400 text-white' },
                    blesse:  { icon: '🤕', label: 'Blessé',   color: 'bg-purple-500 text-white' },
                    none:    { icon: '—',  label: 'Annuler',  color: 'bg-slate-200 text-slate-500' }
                };
                const buttons = statuses.map(st => {
                    const cfg = labels[st];
                    const isActive = status === st;
                    // masquer le bouton "Annuler" si déjà à none
                    if (st === 'none' && status === 'none') return '';
                    return `<button onclick="setTrainingStatus('${p.id}','${st}')" class="px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition ${isActive ? cfg.color : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">${cfg.icon} ${cfg.label}</button>`;
                }).join('');
                return `<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div>
                        <p class="font-bold text-xs text-slate-800">${p.name}</p>
                        <p class="text-[10px] text-slate-400">${p.team || ''}</p>
                    </div>
                    <div class="flex flex-wrap gap-1.5">${buttons}</div>
                </div>`;
            }).join('');
        }

        function renderAttendanceBars() {
            const today = new Date(); today.setHours(0,0,0,0);
            
            const role = window.currentUserRole || 'public';
            const userTeam = window.currentUserTeam || 'all';
            
            let pastSessions = Object.values(state.trainings || {}).filter(s => {
                if (!s.date) return false;
                const d = new Date(s.date + 'T12:00:00'); d.setHours(0,0,0,0);
                return d < today;
            });
            
            // Filtrer les séances de l'équipe du coach (multi-scopes possibles)
            const userScopes = String(userTeam || '')
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(Boolean);

            if (role === 'coach') {
                pastSessions = pastSessions.filter(s =>
                    userScopes.includes((s.team || '').toLowerCase())
                );
            }

            // Ignorer les séances dont l'appel n'a pas été rempli
            pastSessions = pastSessions.filter(s => {
                const presence = s.presence || {};
                return Object.keys(presence).length > 0;
            });
            
            const container = document.getElementById('training-attendance-bars');
            if (!container) return;
            if (pastSessions.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Aucune séance passée pour calculer les stats.</p>';
                return;
            }
            
            // Filtrer les joueurs par équipe du coach (multi-scopes possibles)
            let playersToShow = state.players;
            if (role === 'coach') {
                playersToShow = state.players.filter(p =>
                    userScopes.includes(
                        (p.team || p.cat || '').toLowerCase()
                    )
                );
            }
            
            const rows = playersToShow.map(p => {
                let present = 0, total = 0;
                pastSessions.forEach(s => {
                    if (
                        (s.team || '').toLowerCase() !==
                        (p.team || p.cat || '').toLowerCase()
                    ) {
                        return;
                    }
                    total++;
                    const status = (s.presence || {})[p.id];

                    if (
                        status === 'present' ||
                        status === 'retard'
                    ) {
                        present++;
                    }
                });
                const pct = total > 0 ? Math.round((present / total) * 100) : 0;
                const barColor = pct >= 75 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400';
                const textColor = pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500';
                return { pct, html: `<div class="flex items-center space-x-3">
                    <p class="text-xs font-semibold text-slate-700 w-32 shrink-0 truncate">${p.name}</p>
                    <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div class="${barColor} h-2 rounded-full transition-all" style="width:${pct}%"></div>
                    </div>
                    <p class="text-xs font-bold ${textColor} w-16 text-right shrink-0">${present}/${total} (${pct}%)</p>
                </div>` };
            }).sort((a, b) => b.pct - a.pct);
            container.innerHTML = rows.map(r => r.html).join('');
        }

        window.renderAttendanceBars = renderAttendanceBars;

        // Classement des familles qui conduisent (saison), dans l'onglet Effectif
        function renderCarpoolRanking() {

            const container = document.getElementById('carpool-ranking-bars');
            if (!container) return;

            const role = window.currentUserRole || 'public';
            const userTeam = window.currentUserTeam || 'all';

            const scopes = String(userTeam || '')
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(Boolean);

            let playersToShow = state.players || [];

            if (role === 'coach' || role === 'responsable') {
                playersToShow = playersToShow.filter(p =>
                    scopes.includes((p.team || p.cat || '').toLowerCase())
                );
            }

            const rows = playersToShow.map(p => {

                const stats = getPlayerCarpoolStats(p.id);
                const autonomous = (stats.answered - stats.absents) >= 2 && stats.rides === 0;

                return { p, stats, autonomous };

            }).sort((a, b) => {

                if (b.stats.withPassengers !== a.stats.withPassengers) {
                    return b.stats.withPassengers - a.stats.withPassengers;
                }

                if (b.stats.seatsOffered !== a.stats.seatsOffered) {
                    return b.stats.seatsOffered - a.stats.seatsOffered;
                }

                return String(a.p.name || '').localeCompare(String(b.p.name || ''), 'fr', { sensitivity: 'base' });
            });

            if (!rows.length) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Aucun joueur a classer.</p>';
                return;
            }

            const max = rows.reduce((m, r) => Math.max(m, r.stats.withPassengers), 0);

            container.innerHTML = rows.map(r => {

                const count = r.stats.withPassengers;
                const pct = max > 0 ? Math.round((count / max) * 100) : 0;
                const barColor = count > 0 ? 'bg-sky-400' : 'bg-slate-200';
                const textColor = count > 0 ? 'text-sky-700' : 'text-slate-400';

                const detail = count
                    ? `${count} trajet${count > 1 ? 's' : ''}${r.stats.seatsOffered ? ` · ${r.stats.seatsOffered} place${r.stats.seatsOffered > 1 ? 's' : ''}` : ''}`
                    : '—';

                const autonomousBadge = r.autonomous
                    ? '<span class="px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[9px] font-extrabold shrink-0" title="Jamais passager sur les matchs renseignes">🔑</span>'
                    : '';

                return `<div class="flex items-center space-x-3">
                    <p class="text-xs font-semibold text-slate-700 w-32 shrink-0 truncate">${formatPlayerName(r.p)}</p>
                    <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div class="${barColor} h-2 rounded-full transition-all" style="width:${pct}%"></div>
                    </div>
                    <p class="text-xs font-bold ${textColor} w-28 text-right shrink-0">${detail}</p>
                    ${autonomousBadge}
                </div>`;
            }).join('');
        }

        window.renderCarpoolRanking = renderCarpoolRanking;

        function setTrainingStatus(pId, status) {
            if (!currentTrainingId) return;
            if (!state.trainings[currentTrainingId].presence) state.trainings[currentTrainingId].presence = {};
            state.trainings[currentTrainingId].presence[pId] = status;

            // Un joueur absent ou blesse sort du groupe de travail
            if (status === 'absent' || status === 'blesse') {
                removePlayerFromSquadSilently(pId);
            }
            
            // Mise à jour du champ blessure sur l'objet joueur (pour l'effetif)
            const player = state.players.find(p => p.id === pId);
            if (status === 'blesse') {
                player.blessure = true;
                player.blessureDateDebut = new Date().toISOString().split('T')[0];
                player.blessureRetour = null;
            } else if (status === 'present' || status === 'absent' || status === 'retard') {
                player.blessure = false;
                player.blessureDateDebut = null;
                player.blessureRetour = new Date().toISOString().split('T')[0];
            }
            
            saveStateToFirebase();
            renderSessionPresenceStats(state.trainings[currentTrainingId]);
            renderAppel(state.trainings[currentTrainingId]);
            renderAttendanceBars();
        }

        function setAllTrainingPresent() {

    if (!currentTrainingId) return;

    if (!state.trainings[currentTrainingId].presence) {
        state.trainings[currentTrainingId].presence = {};
    }

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';
    
    let playersToMark = state.players;
    if (role === 'coach') {
        playersToMark = state.players.filter(p =>
            (p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase()
        );
    }

    playersToMark.forEach(player => {
        state.trainings[currentTrainingId].presence[player.id] = 'present';
    });

    saveStateToFirebase();

    renderSessionPresenceStats(state.trainings[currentTrainingId]);
    renderAppel(state.trainings[currentTrainingId]);
    renderAttendanceBars();

    showToast("Tous les joueurs sont marqués présents");
}

function setAllTrainingAbsent() {

    if (!currentTrainingId) return;

    if (!state.trainings[currentTrainingId].presence) {
        state.trainings[currentTrainingId].presence = {};
    }

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';
    
    let playersToMark = state.players;
    if (role === 'coach') {
        playersToMark = state.players.filter(p =>
            (p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase()
        );
    }

    playersToMark.forEach(player => {
        state.trainings[currentTrainingId].presence[player.id] = 'absent';
    });

    // Tous absents : le groupe de travail se vide aussi
    state.trainings[currentTrainingId].squad = [];

    saveStateToFirebase();

    renderSessionPresenceStats(state.trainings[currentTrainingId]);
    renderAppel(state.trainings[currentTrainingId]);
    renderAttendanceBars();

    showToast("Tous les joueurs sont marqués absents");
}

function resetTrainingAttendance() {

    if (!currentTrainingId) return;

    if (
        !confirm(
            "Réinitialiser complètement l'appel de cette séance ?"
        )
    ) return;

    state.trainings[currentTrainingId].presence = {};

    saveStateToFirebase();

    renderSessionPresenceStats(state.trainings[currentTrainingId]);
    renderAppel(state.trainings[currentTrainingId]);
    renderAttendanceBars();

    showToast("Appel réinitialisé");
}

function duplicateTraining() {

    if (!currentTrainingId) return;

    const source = state.trainings[currentTrainingId];

    const newId = 'T_' + Date.now();

    state.trainings[newId] = {
        id: newId,
        title: source.title,
        date: '',
        heure: source.heure || '18:00',
        theme: source.theme || '',
        lieu: source.lieu || 'Complexe Sportif de Rangueil',
        presence: {},
        pdfData: source.pdfData || null,
        pdfName: source.pdfName || null
    };

    saveStateToFirebase();

    renderEntrainements();

                showToast("Séance dupliquée");
}

        function openModalTraining(tId = null) {
            document.getElementById('t-id').value = tId || '';
            document.getElementById('modal-training-title').textContent = tId ? 'Modifier la Séance' : 'Nouvelle Séance';
            if (tId && state.trainings[tId]) {
                const s = state.trainings[tId];
                document.getElementById('t-team').value =
    s.team || '';
                document.getElementById('t-title').value = s.title || '';
                document.getElementById('t-date').value = s.date || '';
                document.getElementById('t-heure').value = s.heure || '18:00';
                document.getElementById('t-theme').value = s.theme || '';
                document.getElementById('t-lieu').value = (s.lieu === 'Stade Struxiano' || s.lieu === 'Complexe Sportif de Rangueil') ? s.lieu : tLieuForDay(s.date);
            } else {
                document.getElementById('t-title').value = '';
                document.getElementById('t-date').value = new Date().toISOString().split('T')[0];
                document.getElementById('t-heure').value = '18:00';
                document.getElementById('t-theme').value = '';
                document.getElementById('t-lieu').value = tLieuForDay(document.getElementById('t-date').value);
            }
            toggleModal('modal-training', true);
        }

        function tLieuForDay(dateStr) {
            if (!dateStr) return 'Complexe Sportif de Rangueil';
            const wd = new Date(dateStr + 'T12:00:00').getDay();
            return wd === 2 ? 'Stade Struxiano' : 'Complexe Sportif de Rangueil';
        }

        function autoFillTrainingLieu() {
            const lieuEl = document.getElementById('t-lieu');
            if (!lieuEl) return;
            lieuEl.value = tLieuForDay(document.getElementById('t-date').value);
        }

        function handleSaveTraining() {
            const tId = document.getElementById('t-id').value;
            const id = tId || 'T_' + Date.now();
            const themeVal = document.getElementById('t-theme').value;
            const theme = themeVal === 'Autre' ? (document.getElementById('t-theme-autre').value || 'Autre') : themeVal;
            const existing = state.trainings[id] || {};
            state.trainings[id] = {
                ...existing,
                id,
                title: document.getElementById('t-title').value || `Séance du ${document.getElementById('t-date').value}`,
                date: document.getElementById('t-date').value,
                heure: document.getElementById('t-heure').value || '18:00',
                team: document.getElementById('t-team').value,
                theme: theme,
                lieu: document.getElementById('t-lieu').value || 'Complexe Sportif de Rangueil',
                presence: existing.presence || {},
                pdfData: existing.pdfData || null,
                pdfName: existing.pdfName || null
            };
            saveStateToFirebase();
            toggleModal('modal-training', false);
            if (tId) {
                openTrainingDetail(id);
            } else {
                renderEntrainements();
                showToast('Séance créée avec succès !');
            }
        }

        function getTrainingDays() {
            const d = state.settings && Array.isArray(state.settings.trainingDays) && state.settings.trainingDays.length
                ? state.settings.trainingDays
                : [2, 5];
            return d;
        }

        function trainingDaysLabel() {
            const names = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            const days = getTrainingDays().map(d => names[d]).filter(Boolean);
            return days.length ? days.join(' · ') : 'Mardi · Vendredi';
        }

        function nextRecurringTrainingDate() {
            const days = getTrainingDays();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (let i = 0; i < 7; i++) {
                const d = new Date(today);
                d.setDate(d.getDate() + i);
                if (days.includes(d.getDay())) return d;
            }
            return today;
        }

        function openModalTrainingSettings() {
            const days = getTrainingDays();
            const picker = document.getElementById('training-days-picker');
            const dayNames = [
                { v: 1, label: 'Lu' }, { v: 2, label: 'Ma' }, { v: 3, label: 'Me' },
                { v: 4, label: 'Je' }, { v: 5, label: 'Ve' }, { v: 6, label: 'Sa' }, { v: 0, label: 'Di' }
            ];
            picker.innerHTML = dayNames.map(d =>
                `<label class="flex flex-col items-center p-2 rounded-xl cursor-pointer border transition ${days.includes(d.v) ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                    <input type="checkbox" class="hidden day-check" value="${d.v}" ${days.includes(d.v) ? 'checked' : ''}>
                    <span class="font-bold text-xs">${d.label}</span>
                </label>`
            ).join('');
            toggleModal('modal-settings-training', true);
        }

        function handleSaveTrainingSettings() {
            const checks = document.querySelectorAll('.day-check:checked');
            const days = Array.from(checks).map(c => parseInt(c.value));
            if (!days.length) {
                showToast('Sélectionnez au moins un jour', 'error');
                return;
            }
            if (!state.settings) state.settings = {};
            state.settings.trainingDays = days;
            saveStateToFirebase();
            toggleModal('modal-settings-training', false);
            renderEntrainements();
            showToast("Jours d'entraînement enregistrés !");
        }

        function openModalRecur() {
            const select = document.getElementById('recur-model');
            const options = Object.values(state.trainings || {})
                .filter(s => s.title || s.theme)
                .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            select.innerHTML = options.length
                ? options.map(s =>
                    `<option value="${s.id}">${s.title || 'Séance'} — ${s.date ? new Date(s.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' }) : 'sans date'} — ${s.theme || 'thème non défini'}</option>`
                  ).join('')
                : '<option value="">Aucune séance existante — créez-en une d\'abord</option>';
            updateRecurPreview();
            toggleModal('modal-recur', true);
        }

        function updateRecurPreview() {
            const id = document.getElementById('recur-model').value;
            const s = state.trainings[id];
            const preview = document.getElementById('recur-preview');
            if (!s) {
                preview.innerHTML = '<i class="fa-solid fa-circle-info text-sky-500 mr-1"></i>Choisissez une séance à reproduire.';
                return;
            }
            const d = nextRecurringTrainingDate();
            const heure = s.heure || '18:00';
            preview.innerHTML =
                `🗓 <b>${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</b> à <b>${heure}</b>` +
                `<div class="mt-1 text-slate-600">${s.title || 'Séance'} · ${state.teams?.[s.team]?.name || s.team || 'Équipe'}<br>🎯 ${s.theme || 'Thème non défini'}${s.pdfName ? '<br>📎 ' + s.pdfName : ''}</div>` +
                `<div class="mt-1 text-[10px] text-slate-500">Les présences seront remises à zéro.</div>`;
        }

        function handleSaveRecur() {
            const id = document.getElementById('recur-model').value;
            const source = state.trainings[id];
            if (!source) {
                showToast('Choisissez une séance à reproduire', 'error');
                return;
            }
            const dateObj = nextRecurringTrainingDate();
            const dateStr = dateObj.toISOString().split('T')[0];
            const newId = 'T_' + Date.now();
            state.trainings[newId] = {
                id: newId,
                title: source.title || 'Séance type',
                date: dateStr,
                heure: source.heure || '18:00',
                theme: source.theme || '',
                lieu: source.lieu || 'Complexe Sportif de Rangueil',
                team: source.team || '',
                presence: {},
                pdfData: source.pdfData || null,
                pdfName: source.pdfName || null
            };
            saveStateToFirebase();
            toggleModal('modal-recur', false);
            renderEntrainements();
            showToast(`Séance du ${dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} créée`);
        }

        window.openModalRecur = openModalRecur;
        window.handleSaveRecur = handleSaveRecur;
        window.updateRecurPreview = updateRecurPreview;
        window.openModalTrainingSettings = openModalTrainingSettings;
        window.handleSaveTrainingSettings = handleSaveTrainingSettings;
        window.autoFillTrainingLieu = autoFillTrainingLieu;
        window.tLieuForDay = tLieuForDay;

        function editCurrentTraining() {
            if (currentTrainingId) openModalTraining(currentTrainingId);
        }

        function deleteCurrentTraining() {
            if (!currentTrainingId) return;
            if (confirm('Supprimer cette séance et toutes ses données ?')) {
                delete state.trainings[currentTrainingId];
                saveStateToFirebase();
                backToTrainingList();
                showToast('Séance supprimée.');
            }
        }

        function handlePdfUpload(event) {
            const file = event.target.files[0];
            if (!file || !currentTrainingId) return;
            if (file.size > 4 * 1024 * 1024) { showToast('PDF trop volumineux (max 4 Mo)', 'error'); return; }
            const reader = new FileReader();
            reader.onload = function(e) {
                state.trainings[currentTrainingId].pdfData = e.target.result;
                state.trainings[currentTrainingId].pdfName = file.name;
                saveStateToFirebase();
                openTrainingDetail(currentTrainingId);
                showToast('PDF ajouté avec succès !');
            };
            reader.readAsDataURL(file);
        }

        function viewSessionPdf() {
            if (!currentTrainingId) return;
            const s = state.trainings[currentTrainingId];
            if (!s || !s.pdfData) return;
            const win = window.open();
            win.document.write(`<iframe src="${s.pdfData}" style="width:100%;height:100vh;border:none;"></iframe>`);
        }

        function deleteSessionPdf() {
            if (!currentTrainingId) return;
            if (confirm('Supprimer le PDF de cette séance ?')) {
                state.trainings[currentTrainingId].pdfData = null;
                state.trainings[currentTrainingId].pdfName = null;
                saveStateToFirebase();
                openTrainingDetail(currentTrainingId);
                showToast('PDF supprimé.');
            }
        }

      function renderMatchesResultsList() {

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';

    const container = document.getElementById('matches-results-list');

    let matches = Object.values(state.matches);

    // Coach : seulement les matchs de son équipe
    if (
    role === 'coach' ||
    role === 'responsable'
) {

    const allowedTeams = userTeam
        .split(',')
        .map(t => t.trim().toLowerCase());

    matches = matches.filter(m =>
        allowedTeams.includes(
            (m.team || '').toLowerCase()
        )
    );
}

    // Trier les matchs par date (prochain d'abord)
    matches.sort((a, b) => {
        const dateA = a.date ? new Date(a.date + 'T12:00:00') : new Date('9999-12-31');
        const dateB = b.date ? new Date(b.date + 'T12:00:00') : new Date('9999-12-31');
        return dateA - dateB;
    });

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="p-4 text-center text-slate-400 text-xs">
                Aucun match enregistré.
            </div>`;
        return;
    }

    container.innerHTML = matches.map(m => {
                const teamName = state.teams?.[m.team]?.name || m.team || 'Équipe';
                const teamColors = getTeamColorClasses(m.team);
                const scoreH = m.scoreHome !== undefined && m.scoreHome !== "" ? m.scoreHome : "-";
                const scoreA = m.scoreAway !== undefined && m.scoreAway !== "" ? m.scoreAway : "-";
                
                // Format date en DD-MM-YYYY
                let formattedDate = '--/--/--';
                if (m.date) {
                    const dateParts = m.date.split('-');
                    if (dateParts.length === 3) {
                        formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    }
                }

                // Vérifier si le match est passé
                const matchDateTime = m.date && m.heure 
                    ? new Date(m.date + 'T' + (m.heure || '14:30'))
                    : new Date('9999-12-31');
                const now = new Date();
                const isMatchPassed = matchDateTime < now;

                // Déterminer si l'équipe joue à domicile ou à l'extérieur
                const isHome = m.location?.toLowerCase().includes('domicile') || m.location?.toLowerCase().includes('home');
                
                // Construire l'affichage du match: "Équipe - Opponent" ou "Opponent - Équipe"
                let matchTitle = '';
                if (isHome) {
                    // Domicile: "U14 Territoire - Lyon"
                    matchTitle = `${teamName} - ${m.opponent}`;
                } else {
                    // Extérieur: "Lyon - U14 Territoire"
                    matchTitle = `${m.opponent} - ${teamName}`;
                }
                
                // Layout toujours normal (équipe toujours à gauche)
                let matchIcon = 'fa-trophy';

if (m.type === 'Coupe') {
    matchIcon = 'fa-shield-halved';
}
else if (m.type === 'Amical') {
    matchIcon = 'fa-handshake';
}
                let matchContentHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg ${teamColors.bgButton} text-white flex items-center justify-center font-extrabold text-sm shadow-sm"><i class="fa-solid ${matchIcon}"></i></div>
                        <div>
                            <div class="flex items-center space-x-2"><span class="font-bold ${teamColors.textBold} text-sm">${matchTitle}</span>${getMatchTypeBadge(m.type || 'Championnat')}</div>
                            <div class="text-[11px] ${teamColors.textLight} mt-0.5">📍 ${m.location || 'Domicile'} • 📅 ${formattedDate} à ${m.heure || '14:30'}</div>
                        </div>
                    </div>`;

                // Bouton Bilan - uniquement si le match est passé
                const bilanButtonHTML = isMatchPassed 
                    ? `<button onclick="openMatchBilanModal('${m.id}')" class="${teamColors.bgButton} hover:opacity-90 text-white px-3 py-2 rounded-lg font-bold flex items-center space-x-1.5 transition whitespace-nowrap"><i class="fa-solid fa-pen-to-square"></i><span>Bilan</span></button>`
                    : `<button disabled class="bg-slate-300 text-slate-500 px-3 py-2 rounded-lg font-bold flex items-center space-x-1.5 cursor-not-allowed whitespace-nowrap" title="Accessible après le match"><i class="fa-solid fa-clock"></i><span>Bilan</span></button>`;

                return `
    <div
        onclick="openMatchWorkspace('${m.id}')"
        class="p-3.5 ${teamColors.bg} rounded-xl border ${teamColors.border}
        flex flex-col sm:flex-row items-start sm:items-center
        justify-between gap-3 text-xs cursor-pointer hover:shadow-lg transition">

        ${matchContentHTML}
                        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3">
                            <div class="flex items-center space-x-2">
                                ${getMatchResultBadge(m.scoreHome, m.scoreAway)}
                                <div class="bg-white px-3 py-1.5 rounded-lg border font-bold text-slate-700 text-sm"><span class="${teamColors.textLight}">${scoreH}</span> - <span class="text-red-600">${scoreA}</span></div>
                            </div>
                            ${bilanButtonHTML}
                        </div>
                    </div>`;
            }).join('');
        }

        function deleteMatch(matchId) {
    const match = state.matches[matchId];

    if (!match) return;

    let warning = `Supprimer le match contre ${match.opponent} ?`;

    if (
        match.scoreHome !== undefined &&
        match.scoreHome !== ""
    ) {
        warning =
            `⚠️ Ce match contient déjà des données :\n\n` +
            `• score\n` +
            `• buteurs\n` +
            `• passeurs\n` +
            `• cartons\n` +
            `• convocations\n\n` +
            `Confirmer la suppression définitive ?`;
    }

    if (!confirm(warning)) return;

    // Supprimer le match
    delete state.matches[matchId];

    // Supprimer les cartons liés
    if (state.cards[matchId]) {
        delete state.cards[matchId];
    }

    // Recalcul complet des stats
    recalculateGlobalStats();

    // Réinitialiser la sélection si nécessaire
    if (state.selectedMatchId === matchId) {
        state.selectedMatchId = null;
    }

    saveStateToFirebase();

    renderAll();

    showToast("✅ Match supprimé et statistiques mises à jour");
}

        function duplicateMatch(matchId) {
            const source = state.matches[matchId];
            if (!source) return;
            const newId = 'M_' + Date.now();
            state.matches[newId] = {
                id: newId,
                // Chaque match doit avoir son propre lien de covoiturage
                carpoolId: 'CP_' + newId,
                opponent: source.opponent,
                adresse: source.adresse,
                date: source.date,
                heure: source.heure,
                type: source.type,
                location: source.location,
                pelouse: source.pelouse,
                scoreHome: "",
                scoreAway: "",
                convocations: {},
                positions: {},
                jerseys: {},
                carpool: {},
                matchStats: {},
                debrief: "",
                isValidated: false
            };
            state.selectedMatchId = newId;
            saveStateToFirebase();
            renderAll();
            showToast("Match dupliqué");
        }

        function resetMatch(matchId) {
    const match = state.matches[matchId];

    if (!match) return;

    if (
        !confirm(
            "Réinitialiser le match ?\n\n" +
            "Le score, les buteurs, les passeurs, les cartons et les convocations seront supprimés."
        )
    ) {
        return;
    }

    // Score
    match.scoreHome = "";
    match.scoreAway = "";

    // Convocations
    match.convocations = {};

    // Feuille de match
    match.positions = {};
    match.jerseys = {};
    match.carpool = {};

    // Stats du match
    match.matchStats = {};

    // Debrief
    match.debrief = "";

    // Verrouillage
    match.isValidated = false;

    // Cartons
    if (state.cards[matchId]) {
        delete state.cards[matchId];
    }

    // Recalcul global buts/passes
    recalculateGlobalStats();

    saveStateToFirebase();

    renderAll();

    showToast("✅ Match réinitialisé");
}

        function copyLicence(licence) {
            navigator.clipboard.writeText(licence).then(() => showToast(`Licence ${licence} copiée !`));
        }
function formatDateFr(dateString) {

    if (!dateString) return '';

    const formatted =
        new Date(dateString + 'T12:00:00')
            .toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

    return formatted.charAt(0).toUpperCase() +
           formatted.slice(1);
}

function openFeuilleDeMatch() {
    const m = state.matches[state.selectedMatchId];
    if (!m) {
        showToast("Sélectionnez un match pour générer la feuille", "error");
        return;
    }

    const now = new Date();
    const annee = now.getFullYear();
    const saison = now.getMonth() >= 6 ? annee + '/' + (annee + 1) : (annee - 1) + '/' + annee;

    // Données du formulaire
    const clubNom = 'RANGUEIL FC';
    const teamLabel = state.teams?.[m.team]?.name || m.team || '';
    const compet = m.competitionName || '';
    const poule = m.poule || '';
    const journee = m.journee || m.tour || '';
    const dateStr = m.date
        ? new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';
    const dateTab = m.date 
        ? new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).split('/') 
        : ['', '', ''];
    const heure = m.heure || '';
    const stade = m.adresse || m.location || '';
    const terrain = m.pelouse || '';
    const opponent = m.opponent || '';

    const convoques = getMatchConvoked(m)
        .slice()
        .sort((a, b) => {
            const ja = parseInt(m.jerseys?.[a.id], 10) || 0;
            const jb = parseInt(m.jerseys?.[b.id], 10) || 0;
            if (ja && jb) return ja - jb;
            if (ja) return -1;
            if (jb) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });

    function ligneJoueur(p, i) {
        const parts = (p.name || ' ').split(' ');
        const nom = (parts[0] || '').toUpperCase();
        const prenom = parts.slice(1).join(' ');
        return `
            <tr>
                <td class="col-num">${i + 1}</td>
                <td class="col-lic">${p.licence || ''}</td>
                <td class="col-nom">${nom}</td>
                <td class="col-prn">${prenom}</td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-motif"></td>
            </tr>`;
    }

    function ligneVide(i) {
        return `
            <tr>
                <td class="col-num">${i + 1}</td>
                <td class="col-lic"></td>
                <td class="col-nom"></td>
                <td class="col-prn"></td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-mk"></td>
                <td class="col-motif"></td>
            </tr>`;
    }

    const targetConvoked = parseInt(state.teams?.[m.team]?.targetConvocations) || 14;
    const mesLignes = convoques.map(ligneJoueur).join('') + Array.from({ length: Math.max(0, targetConvoked - convoques.length) }, (_, i) => ligneVide(convoques.length + i)).join('');
    const lignesVides = Array.from({ length: targetConvoked }, (_, i) => ligneVide(i)).join('');

    const sheetHtml = `
<style>
    #feuille-print { 
        font-family: Arial, Helvetica, sans-serif; 
        font-size: 9pt;
        line-height: 1;
        margin: 0;
        padding: 0;
    }
    #feuille-print table { 
        border-collapse: collapse; 
        width: 100%;
        margin: 0;
        padding: 0;
    }
    #feuille-print td, #feuille-print th { 
        border: 0.5pt solid #000; 
        padding: 0.8pt 1.5pt;
        margin: 0;
        line-height: 1.2;
    }
    
    /* Entête */
    #feuille-print .fm-header { font-size: 6.5pt; vertical-align: top; }
    #feuille-print .fm-header-label { font-weight: bold; background-color: #e8e8e8; width: 25%; }
    #feuille-print .fm-header-value { font-size: 6.5pt; }
    
    /* Titre central */
    #feuille-print .fm-title { font-weight: bold; text-align: center; font-size: 7.5pt; padding: 2pt; background-color: #000; color: #fff; }
    #feuille-print .fm-title-main { font-size: 8pt; font-weight: 900; }
    #feuille-print .fm-title-sub { font-size: 6pt; font-weight: bold; }
    
    /* Colonnes des tableaux de joueurs */
    #feuille-print .col-num { width: 3%; text-align: center; font-size: 6.5pt; }
    #feuille-print .col-lic { width: 10%; font-size: 6.5pt; }
    #feuille-print .col-nom { width: 17%; font-size: 6.5pt; }
    #feuille-print .col-prn { width: 14%; font-size: 6.5pt; }
    #feuille-print .col-mk { width: 3%; text-align: center; font-size: 6pt; }
    #feuille-print .col-motif { width: 32%; font-size: 6pt; }
    
    /* Tableau de joueurs */
    #feuille-print .fm-player-table { table-layout: fixed; font-size: 6.5pt; }
    #feuille-print .fm-player-table th { background-color: #e8e8e8; font-weight: bold; text-align: center; font-size: 6pt; padding: 1pt; }
    #feuille-print .fm-player-table td { height: 5.5mm; vertical-align: top; padding: 0.5pt 1pt; font-size: 6.5pt; }
    
    /* Banc */
    #feuille-print .fm-bench { height: 4mm; padding: 0; }
    #feuille-print .fm-bench-label { writing-mode: vertical-rl; transform: rotate(180deg); font-weight: bold; text-align: center; font-size: 7pt; padding: 1pt; }
    
    /* Signatures */
    #feuille-print .fm-sig-box { height: 8mm; vertical-align: bottom; font-size: 6pt; padding: 0.5pt; }
    
    /* Annexe */
    #feuille-print .fm-annexe { page-break-before: always; margin: 0; padding: 0; }
    #feuille-print .fm-annexe-title { font-weight: bold; text-align: center; background-color: #e8e8e8; font-size: 7pt; padding: 1pt; }
    #feuille-print .fm-annexe-box { border: 0.5pt solid #000; }
    #feuille-print .fm-annexe-content { height: 32mm; border-bottom: 0.5pt solid #000; }
    
    @media print {
        * { margin: 0; padding: 0; }
        body { margin: 0; padding: 0; height: 100vh; }
        html { margin: 0; padding: 0; height: 100vh; }
        #feuille-print { margin: 0; padding: 0; }
        .feuille-modal { margin: 0; padding: 0; }
        .a4-sheet { margin: 0; padding: 5mm; }
    }
</style>

<!-- PAGE 1 : FEUILLE PRINCIPALE -->

<!-- ENTÊTE COMPACTE -->
<table style="margin-bottom: 0.5pt; width: 100%; border-collapse: collapse;">
    <tr>
        <td style="width: 35%; vertical-align: top; padding: 0;">
            <table class="fm-header" style="width: 100%; margin: 0;">
                <tr><td class="fm-header-label" style="padding: 0.5pt;">N° Match :</td><td class="fm-header-value" style="padding: 0.5pt;">...................</td></tr>
                <tr><td class="fm-header-label" style="padding: 0.5pt;">Compétition :</td><td class="fm-header-value" style="padding: 0.5pt;">${compet || '.......'}</td></tr>
                <tr><td class="fm-header-label" style="padding: 0.5pt;">Journée :</td><td class="fm-header-value" style="padding: 0.5pt;">${journee || '.......'}</td></tr>
                <tr><td class="fm-header-label" style="padding: 0.5pt;">Terrain :</td><td class="fm-header-value" style="padding: 0.5pt;">${terrain || stade || '...'}</td></tr>
                <tr><td class="fm-header-label" style="padding: 0.5pt;">Date :</td><td class="fm-header-value" style="padding: 0.5pt;">${dateTab[0]||'..'} / ${dateTab[1]||'..'} / ${dateTab[2]||'..'} à ${heure || '..'}</td></tr>
            </table>
        </td>
        <td style="width: 30%; vertical-align: top; padding: 0; text-align: center;">
            <div style="background-color: #000; color: #fff; padding: 2pt 1pt;">
                <div class="fm-title-main" style="margin: 0; font-size: 8pt;">FEUILLE DE MATCH</div>
                <div style="font-size: 5.5pt; font-weight: bold;">LIGUE DE FOOTBALL D'OCCITANIE</div>
                <div style="font-size: 5pt;">Saison ${saison}</div>
            </div>
        </td>
        <td style="width: 35%; vertical-align: top; padding: 0;">
            <table class="fm-header" style="width: 100%; margin: 0; font-size: 6.5pt;">
                <!-- En-tête -->
                <tr style="background-color: #e8e8e8;">
                    <td style="padding: 0.5pt; width: 50%; border-right: 0.5pt solid #000; font-weight: bold;">N° Licence ou CI</td>
                    <td style="padding: 0.5pt; width: 10%; text-align: center; border-right: 0.5pt solid #000; font-weight: bold; font-size: 5.5pt;">Ben.</td>
                    <td style="padding: 0.5pt; width: 10%; text-align: center; border-right: 0.5pt solid #000; font-weight: bold; font-size: 5.5pt;">Off.</td>
                    <td style="padding: 0.5pt; width: 30%; font-weight: bold;">NOM Prénom</td>
                </tr>
                <!-- Arbitre -->
                <tr>
                    <td style="padding: 0.5pt; border-right: 0.5pt solid #000;">Arbitre : 2548062598</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt;">BENTAHAR Soheib</td>
                </tr>
                <!-- Arbitre Assistant 1 -->
                <tr>
                    <td style="padding: 0.5pt; border-right: 0.5pt solid #000;">Arbitre Asst 1 : 2543210918</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☑</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt;">TURAN Yusuf</td>
                </tr>
                <!-- Arbitre Assistant 2 -->
                <tr>
                    <td style="padding: 0.5pt; border-right: 0.5pt solid #000;">Arbitre Asst 2 : 9605327226</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☑</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt;">GRECO Paolo</td>
                </tr>
                <!-- Arbitre remplaçant -->
                <tr>
                    <td style="padding: 0.5pt; border-right: 0.5pt solid #000;">Arbitre remplaçant :</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt;">...................</td>
                </tr>
                <!-- Délégué(s) -->
                <tr>
                    <td style="padding: 0.5pt; border-right: 0.5pt solid #000;">Délégué(s)</td>
                    <td colspan="2" style="padding: 0.5pt; border-right: 0.5pt solid #000;"></td>
                    <td style="padding: 0.5pt;">...................</td>
                </tr>
                <!-- Délégué ligne 2 -->
                <tr>
                    <td style="padding: 0.5pt; border-right: 0.5pt solid #000;">1856518106</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☑</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt;">EON Lionel</td>
                </tr>
                <!-- Délégué ligne 3 vide -->
                <tr>
                    <td style="padding: 0.5pt; border-right: 0.5pt solid #000;"></td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt; text-align: center; border-right: 0.5pt solid #000;">☐</td>
                    <td style="padding: 0.5pt;"></td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<!-- ÉQUIPES -->
<table style="width: 100%; margin-bottom: 0.5pt; border-collapse: collapse;">
    <tr>
        <td style="width: 50%; text-align: center; background-color: #e8e8e8; font-weight: bold; font-size: 7.5pt; padding: 1pt;">
            ${clubNom} (RECEVANT)
        </td>
        <td style="width: 50%; text-align: center; background-color: #e8e8e8; font-weight: bold; font-size: 7.5pt; padding: 1pt;">
            ${(opponent || 'ÉQUIPE VISITEUSE').toUpperCase()} (VISITEUR)
        </td>
    </tr>
</table>

<!-- TABLEAUX DE JOUEURS COMPACTS -->
<table style="width: 100%; border-collapse: collapse;">
    <tr>
        <td style="width: 50%; vertical-align: top; padding: 0;">
            <table class="fm-player-table" style="width: 100%;">
                <tr>
                    <th class="col-num">N°</th>
                    <th class="col-lic">Licence</th>
                    <th class="col-nom">NOM</th>
                    <th class="col-prn">Prénom</th>
                    <th class="col-mk">E</th>
                    <th class="col-mk">A</th>
                    <th class="col-mk">B</th>
                    <th class="col-mk">R</th>
                    <th class="col-mk">D</th>
                    <th class="col-motif">Motif</th>
                </tr>
                ${mesLignes}
            </table>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 0;">
            <table class="fm-player-table" style="width: 100%;">
                <tr>
                    <th class="col-num">N°</th>
                    <th class="col-lic">Licence</th>
                    <th class="col-nom">NOM</th>
                    <th class="col-prn">Prénom</th>
                    <th class="col-mk">E</th>
                    <th class="col-mk">A</th>
                    <th class="col-mk">B</th>
                    <th class="col-mk">R</th>
                    <th class="col-mk">D</th>
                    <th class="col-motif">Motif</th>
                </tr>
                ${lignesVides}
            </table>
        </td>
    </tr>
</table>

<!-- BANC RÉDUIT -->
<table style="width: 100%; border-collapse: collapse; margin-bottom: 0.5pt;">
    <tr>
        <td style="width: 50%; vertical-align: top; padding: 0;">
            <table style="width: 100%;">
                <tr>
                    <td rowspan="2" class="fm-bench-label" style="width: 10mm; padding: 0.5pt;">BANC REC.</td>
                    <th class="col-mk" style="padding: 0.5pt;">E</th><th class="col-mk" style="padding: 0.5pt;">A</th><th class="col-mk" style="padding: 0.5pt;">B</th><th class="col-mk" style="padding: 0.5pt;">R</th><th class="col-mk" style="padding: 0.5pt;">D</th>
                </tr>
                <tr><td class="fm-bench"></td><td class="fm-bench"></td><td class="fm-bench"></td><td class="fm-bench"></td><td class="fm-bench"></td></tr>
            </table>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 0;">
            <table style="width: 100%;">
                <tr>
                    <td rowspan="2" class="fm-bench-label" style="width: 10mm; padding: 0.5pt;">BANC VIS.</td>
                    <th class="col-mk" style="padding: 0.5pt;">E</th><th class="col-mk" style="padding: 0.5pt;">A</th><th class="col-mk" style="padding: 0.5pt;">B</th><th class="col-mk" style="padding: 0.5pt;">R</th><th class="col-mk" style="padding: 0.5pt;">D</th>
                </tr>
                <tr><td class="fm-bench"></td><td class="fm-bench"></td><td class="fm-bench"></td><td class="fm-bench"></td><td class="fm-bench"></td></tr>
            </table>
        </td>
    </tr>
</table>

<!-- SIGNATURES COMPACTES -->
<table style="width: 100%; border-collapse: collapse;">
    <tr>
        <td style="width: 50%; vertical-align: top; padding: 0;">
            <table style="width: 100%; font-size: 6pt;">
                <tr><td colspan="2" style="font-weight: bold; background-color: #e8e8e8; padding: 0.5pt;">Capitaine REC. : ......................</td></tr>
                <tr>
                    <td style="width: 50%; height: 8mm; vertical-align: bottom; padding: 0.5pt; border-top: 0.5pt solid #000;">Avant</td>
                    <td style="height: 8mm; vertical-align: bottom; padding: 0.5pt; border-top: 0.5pt solid #000; border-left: 0.5pt solid #000;">Après</td>
                </tr>
            </table>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 0;">
            <table style="width: 100%; font-size: 6pt;">
                <tr><td colspan="2" style="font-weight: bold; background-color: #e8e8e8; padding: 0.5pt;">Capitaine VIS. : ......................</td></tr>
                <tr>
                    <td style="width: 50%; height: 8mm; vertical-align: bottom; padding: 0.5pt; border-top: 0.5pt solid #000;">Avant</td>
                    <td style="height: 8mm; vertical-align: bottom; padding: 0.5pt; border-top: 0.5pt solid #000; border-left: 0.5pt solid #000;">Après</td>
                </tr>
            </table>
        </td>
    </tr>
</table>

<div style="font-size: 5.5pt; text-align: center; border-top: 0.5pt solid #000; padding-top: 0.5pt;">
    D:Dirigeant — E:Éducateur — M:Encadrement Médical — R:Responsable
</div>

${buildFeuilleEntourageHtml(m)}

<!-- PAGE 2 : ANNEXE COMPACTE -->
<div class="fm-annexe" style="margin: 0; padding: 0;">

<table style="width: 100%; margin-bottom: 0.5pt; font-size: 6pt; border-collapse: collapse;">
    <tr>
        <td class="fm-header-label" style="padding: 0.5pt;">N° Match :</td><td class="fm-header-value" style="width: 12%; padding: 0.5pt;">.........</td>
        <td class="fm-header-label" style="padding: 0.5pt;">Compét. :</td><td class="fm-header-value" style="width: 18%; padding: 0.5pt;">${compet || '......'}</td>
        <td class="fm-header-label" style="padding: 0.5pt;">Poule :</td><td class="fm-header-value" style="padding: 0.5pt;">${poule || '......'}</td>
    </tr>
    <tr>
        <td class="fm-header-label" style="padding: 0.5pt;">Journée :</td><td class="fm-header-value" style="padding: 0.5pt;">.........</td>
        <td class="fm-header-label" style="padding: 0.5pt;">Date :</td><td colspan="3" class="fm-header-value" style="padding: 0.5pt;">${dateTab[0]||'..'} / ${dateTab[1]||'..'} / ${dateTab[2]||'..'}</td>
    </tr>
</table>

<div style="text-align: center; font-weight: bold; font-size: 8pt; letter-spacing: 1px; margin: 1pt 0; padding: 0.5pt 0;">ANNEXE FEUILLE DE MATCH</div>

<table style="width: 100%; border-collapse: collapse;">
    <tr>
        <td style="width: 50%; vertical-align: top; padding: 0;">
            <div class="fm-annexe-title" style="padding: 0.5pt;">RÉSERVES AVANT</div>
            <div class="fm-annexe-content" style="height: 28mm;"></div>
            <table style="width: 100%; font-size: 6pt; border-collapse: collapse;">
                <tr><td style="height: 6mm; vertical-align: bottom; border: 0.5pt solid #000; padding: 0.5pt; font-size: 5pt;">Sign. Cap./Dirgeants</td></tr>
                <tr><td style="height: 6mm; vertical-align: bottom; border: 0.5pt solid #000; padding: 0.5pt; font-size: 5pt;">Sign. Arbitre</td></tr>
            </table>
        </td>
        <td style="width: 50%; vertical-align: top; padding: 0; border-left: 0.5pt solid #000;">
            <div class="fm-annexe-title" style="padding: 0.5pt; border-left: none;">OBSERVATIONS APRÈS</div>
            <div class="fm-annexe-content" style="height: 28mm;"></div>
            <table style="width: 100%; font-size: 6pt; border-collapse: collapse;">
                <tr><td style="height: 6mm; vertical-align: bottom; border: 0.5pt solid #000; border-left: none; padding: 0.5pt; font-size: 5pt;">Sign. Cap./Dirgeants</td></tr>
                <tr><td style="height: 6mm; vertical-align: bottom; border: 0.5pt solid #000; border-left: none; padding: 0.5pt; font-size: 5pt;">Sign. Arbitre</td></tr>
            </table>
        </td>
    </tr>
</table>

<div style="margin-top: 1pt;">
    <div class="fm-annexe-title" style="padding: 0.5pt;">RÉSERVES TECHNIQUES À TRANSCRIRE</div>
    <div style="height: 40mm; border: 0.5pt solid #000; margin-bottom: 0.5pt;"></div>
    <table style="width: 100%; font-size: 6pt; border-collapse: collapse;">
        <tr>
            <td style="width: 33.33%; height: 6mm; vertical-align: bottom; border: 0.5pt solid #000; padding: 0.5pt; font-size: 5pt;">Sign. Cap./Dirgeants</td>
            <td style="width: 33.33%; height: 6mm; vertical-align: bottom; border: 0.5pt solid #000; border-left: none; padding: 0.5pt; font-size: 5pt;">Sign. Assistant</td>
            <td style="width: 33.34%; height: 6mm; vertical-align: bottom; border: 0.5pt solid #000; border-left: none; padding: 0.5pt; font-size: 5pt;">Sign. Arbitre</td>
        </tr>
    </table>
</div>

</div>`;

    const modal = document.createElement('div');
    modal.className = 'feuille-modal';
    modal.id = 'feuille-modal';
    modal.innerHTML = `
        <div class="feuille-toolbar">
            <button class="btn-print" onclick="imprimerFeuille()"><i class="fa-solid fa-print"></i> Imprimer</button>
            <button class="btn-pdf" onclick="telechargerFeuillePDF()"><i class="fa-solid fa-file-pdf"></i> PDF officiel</button>
            <button onclick="fermerFeuille()"><i class="fa-solid fa-xmark"></i> Fermer</button>
        </div>
        <div id="feuille-print" class="a4-sheet">${sheetHtml}</div>
    `;
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fermerFeuille();
    });
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('open'));
}

function imprimerFeuille() {
    window.print();
}

function fermerFeuille() {
    const el = document.getElementById('feuille-modal');
    if (!el) return;
    el.classList.remove('open');
    setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 250);
}

function getResponseDeadline(dateString) {

    if (!dateString) return '--';

    const matchDate = new Date(dateString);

    const day = matchDate.getDay();

    let deadline = new Date(matchDate);

    if (day === 6 || day === 0) {

        while (deadline.getDay() !== 5) {
            deadline.setDate(
                deadline.getDate() - 1
            );
        }

    } else {

        deadline.setDate(
            deadline.getDate() - 1
        );

    }

    const formatted =
        deadline.toLocaleDateString(
            'fr-FR',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }
        );

    return (
        formatted.charAt(0).toUpperCase() +
        formatted.slice(1) +
        ' - 18h00'
    );

}
function formatDeadlineFr(deadlineText) {

    if (!deadlineText || deadlineText === '--') {
        return '--';
    }

    const [datePart, hourPart] =
        deadlineText.split(' - ');

    const [day, month, year] =
        datePart.split('/');

    const date = new Date(
        year,
        month - 1,
        day
    );

    const formattedDate =
        date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

    return (
        formattedDate.charAt(0).toUpperCase() +
        formattedDate.slice(1) +
        ' - ' +
        hourPart.replace(':', 'h')
    );
}
       function generateWhatsAppMessage() {

    if (
        !state.selectedMatchId ||
        !state.matches[state.selectedMatchId]
    ) return;

    const m =
        state.matches[state.selectedMatchId];

    const squad = getMatchPlayers(m).map(item => item.p);

    const convoked =
        squad.filter(
            p => m.convocations[p.id] === 'convoke'
        );

    const indisponibles =
        squad.filter(
            p => m.convocations[p.id] === 'indisponible'
        );

    let text =
        `🔵⚪ *RANGUEIL FC - CONVOCATION* ⚪🔵\n\n`;

    text +=
        `🏆 *${m.type || 'Championnat'}*\n`;

    text +=
        `🆚 *${m.opponent}*\n\n`;

    text +=
    `📅 *Date :* ${formatDateFr(m.date)}\n`;

    text +=
        `🚗 *Covoiturage — répondez en 30 secondes chrono :*\n`;

    text +=
        `https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${m.carpoolId}\n\n`;

    if (
        m.location === 'Domicile'
    ) {

        text +=
            `🏠 *MATCH À DOMICILE*\n\n`;

        text +=
            `📍 *Lieu de rendez-vous :*\n`;

        text +=
            `${m.meetingPlace || 'COMPLEXE SPORTIF RANGUEIL'}\n\n`;

    } else {

        text +=
            `🚍 *DÉPLACEMENT*\n\n`;

        text +=
            `📍 *Rendez-vous :*\n`;

        text +=
            `${m.meetingPlace || 'COSEC Rangueil'}\n\n`;

        if (m.adresse) {

            text +=
               `📍 *Stade :*\n`;

            text +=
                `${m.adresse}\n\n`;
}
         text +=
    `🚗 *ORGANISATION DU DÉPLACEMENT*\n\n`;

text +=
    `👉 *Lien de réponse en haut du message ☝️*\n\n`;


text +=
`Merci d'indiquer votre situation :

🚗 Je conduis
👤 Je suis passager
📍 J'y vais directement
❌ Absent

`;

    }

    text +=
        `🕐 *Rendez-vous :* ${getRdvHeure(m) || '--'}\n`;

    text +=
        `⚽ *Coup d'envoi :* ${m.heure || '--'}\n\n`;

    text +=
    `⏳ *Merci de confirmer votre présence avant :*\n\n`;
text +=
    `${getResponseDeadline(m.date)}\n\n`;

    const targetConvocations =
        parseInt(state.teams?.[m.team]?.targetConvocations) || 14;

    text +=
        (convoked.length < targetConvocations)
        ? `📋 *Joueurs convoqués pour l'instant (${convoked.length}/${targetConvocations})*\n\n`
        : `📋 *Joueurs convoqués (${convoked.length})*\n\n`;

    convoked.forEach((p, idx) => {

        text +=
            `${idx + 1}. ${p.name}\n`;

    });

    if (indisponibles.length > 0) {
        text += `\n🟠 *Indisponibles (${indisponibles.length})*\n\n`;
        indisponibles.forEach((p, idx) => {
            text += `${idx + 1}. ${p.name}\n`;
        });
    }

    text +=
        `\n💙 Allez Rangueil ! ⚽`;

    text += buildEntourageWhatsAppText(m);

    navigator.clipboard
        .writeText(text)
        .then(() => {

            showToast(
                "Message WhatsApp copié !"
            );

        });

}

function generateCarpoolReminder() {

    const m =
        state.matches[state.selectedMatchId];

    if (!m) return;

    const summary = buildCarpoolSummary(m, getMatchPlayers(m).map(item => item.p));

    const target =
        parseInt(state.teams?.[m.team]?.targetConvocations) || 14;

    // Base du calcul transport : objectif équipe (inclut les futurs convoqués)
    const base = Math.max(target, summary.totalConvoked);
    const covered = summary.drivers + summary.seats;
    const need = base - summary.directs - summary.absents;
    const missing = need - covered;
    const freeSeats = summary.seats - summary.passengers;
    const pendingCount = summary.pendingList.length;

    const link =
        `https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${m.carpoolId}`;

    const pl = (n, s) => n + ' ' + s + (n > 1 ? 's' : '');

    // "NOM Prénom" → "Prénom N." (court, convivial, sans ambiguïté malgré les doublons)
    const shortFirst = (full) => {
        const w = String(full || '').trim().split(/\s+/).filter(Boolean);
        if (w.length <= 1) return w[0] || '';
        return w.slice(1).join(' ') + ' ' + (w[0][0] || '').toUpperCase() + '.';
    };

    // Libellé par joueur : surnom ("Prénom usuel" de la fiche) prioritaire,
    // sinon "Prénom N." — unicité globale au message (collision → nom complet)
    const byId = {};
    (state.players || []).forEach(p => { if (p && p.id) byId[p.id] = p; });

    const rawFor = (id, full) => {
        const p = id ? byId[id] : null;
        const nick = p && p.nickname ? String(p.nickname).trim() : '';
        if (nick) return nick;
        const nm = (p && p.name) || full || '';
        return shortFirst(nm);
    };
    const canonFor = (id, full) => {
        const p = id ? byId[id] : null;
        return String((p && p.name) || full || '').trim();
    };

    const respMapAll = state.carpoolResponses?.[m.carpoolId] || {};
    const pendingIdsAll = getMatchConvoked(m)
        .filter(p => !respMapAll[p.id])
        .map(p => p.id);
    const passengerIdsAll = Object.entries(respMapAll)
        .filter(([id, r]) => r && r.status === 'passenger')
        .map(([id]) => id);
    const nameOf = (id) => (byId[id] && byId[id].name) || id;

    const labelSlots = []
        .concat(summary.driverAssignments.map(a => ({ id: a.id, full: a.name })))
        .concat(summary.driverAssignments.flatMap(a => (a.passengerIds || []).map(pid => ({ id: pid, full: nameOf(pid) }))))
        .concat(passengerIdsAll.map(id => ({ id, full: nameOf(id) })))
        .concat(pendingIdsAll.map(id => ({ id, full: nameOf(id) })));
    const rawCounts = {};
    labelSlots.forEach(s => {
        const r = rawFor(s.id, s.full);
        rawCounts[r] = (rawCounts[r] || 0) + 1;
    });
    const fmtSlot = (s) => {
        const r = rawFor(s.id, s.full);
        return rawCounts[r] > 1 ? canonFor(s.id, s.full) : r;
    };

    const driverShorts = summary.driverAssignments.map(a => fmtSlot({ id: a.id, full: a.name }));

    const driverLines = summary.driverAssignments.map((a, i) =>
        `• ${driverShorts[i]} — ${pl(a.seats, 'place')}`
    ).join('\n');

    const driverDetailLines = summary.driverAssignments.map((a, i) => {
        const px = (a.passengerIds || []).map(pid => fmtSlot({ id: pid, full: nameOf(pid) }));
        return `• ${driverShorts[i]} → ${px.length ? px.join(', ') : '—'}`;
    }).join('\n');

    const pendingShort = pendingIdsAll.map(id => fmtSlot({ id, full: nameOf(id) })).join(', ');
    const passengersShort = passengerIdsAll.map(id => fmtSlot({ id, full: nameOf(id) })).join(', ');
    const driversShort = driverShorts.join(' et ');

    // Version URGENTE si match aujourd'hui ou demain et transport non bouclé
    const todayD = new Date();
    todayD.setHours(0, 0, 0, 0);
    const matchD = m.date ? new Date(m.date + 'T12:00:00') : null;
    if (matchD) matchD.setHours(0, 0, 0, 0);
    const diffDays = matchD
        ? Math.round((matchD - todayD) / 86400000)
        : 99;
    const isUrgent =
        diffDays <= 1 && (pendingCount > 0 || missing > 0);

    let text = '';

    if (pendingCount === 0 && missing <= 0) {

        // === VERSION COMPLÈTE : pur remerciement ===
        text =
`🔵⚪ RANGUEIL FC ⚪🔵

✅ ${base}/${base} — TOUT LE MONDE A RÉPONDU, MERCI !

🚗 Merci tout particulier à nos conducteurs :
${driverDetailLines}

🟢 Transport assuré. Bon match à tous 💙⚽`;

    } else if (isUrgent) {

        // === VERSION URGENTE (J-1 / jour J) ===
        text =
`🔵⚪ RANGUEIL FC — ⏰ DERNIER APPEL COVOITURAGE

🙏 Merci aux parents qui ont répondu et à nos conducteurs ${driversShort || '—'} qui prennent leur voiture.

🧮 Transport : ${summary.drivers} conducteurs — ${summary.seats} places → ${covered}/${base} joueurs couverts${missing > 0 ? `
🔎 Il manque ${missing} place(s) !` : ''}

❌ Sans réponse avant ce soir 18h, votre enfant sera noté SANS TRANSPORT et ne pourra pas être du déplacement.

Il manque : ${pendingShort}

👉 C'est ici : ${link}

Merci de votre réactivité 💙`;

    } else {

        // === VERSION STANDARD ===
        text =
`🔵⚪ RANGUEIL FC ⚪🔵

⏳ RELANCE COVOITURAGE
`;

        if (summary.totalConvoked < target) {
            text += `
📋 Liste encore provisoire : ${summary.totalConvoked} convoqués pour l'instant, ${pl(target - summary.totalConvoked, 'nom')} à venir.
`;
        }

        text += `
✅ ${summary.responses}/${summary.totalConvoked} ont déjà répondu — merci !
`;

        if (summary.drivers > 0) {
            text += `
🚗 Un grand merci à nos ${pl(summary.drivers, 'conducteur')} :
${driverLines}
`;
        }

        if (summary.passengers > 0) {
            text += `
👤 Merci aussi à ${passengersShort} qui ont répondu passagers —
vos places sont réservées ✅ (${pl(freeSeats, 'place')} encore ${freeSeats > 1 ? 'libres' : 'libre'})
`;
        }

        text += `
🧮 Transport : ${pl(summary.drivers, 'conducteur')} — ${pl(summary.seats, 'place')} → ${covered}/${base} joueurs couverts
${missing > 0 ? `🔎 Il manque ${pl(missing, 'place')} !` : `✅ Assez de places pour tout le monde.`}
`;

        text += `
⚠️ MÊME LES PASSAGERS doivent répondre : sans votre clic,
aucune place n'est réservée pour votre enfant.
Un passager non déclaré = un enfant sans siège prévu.
`;

        if (pendingCount > 0) {
            text += `
⏳ Il manque encore la réponse de : ${pendingShort}
`;
        }

        text += `
👉 Répondre ici (30 secondes) : ${link}

💙 Allez Rangueil !
`;

    }

    navigator.clipboard
        .writeText(text)
        .then(() => {
            showToast("Relance copiée !");
        });

}

        function validateCurrentMatchSheet() {
            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) return;
            state.matches[state.selectedMatchId].isValidated = true;
            saveStateToFirebase();
            renderMatchDetail();
            showToast("Feuille de match verrouillée !");
        }

        function unlockCurrentMatchSheet() {
            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) return;
            const m = state.matches[state.selectedMatchId];
            if (!m.isValidated) return;
            if (!confirm("Déverrouiller cette feuille de match ? Les convocations et la composition redeviendront modifiables.")) return;
            m.isValidated = false;
            saveStateToFirebase();
            renderMatchDetail();
            showToast("Feuille déverrouillée");
        }

        window.validateCurrentMatchSheet = validateCurrentMatchSheet;
        window.unlockCurrentMatchSheet = unlockCurrentMatchSheet;

        function openMatchBilanModal(mId) {
            const m = state.matches[mId];
            if (!m) return;
            const teamName = state.teams?.[m.team]?.name || m.team || 'Équipe';
            document.getElementById('modal-bilan-title').innerText =
            `Bilan : ${teamName} vs ${m.opponent}`;
            const container = document.getElementById('modal-bilan-content');
            if (!m.convocations) m.convocations = {};
            if (!state.cards[m.id]) state.cards[m.id] = {};
            if (!m.matchStats) m.matchStats = {};
            const convokedPlayers = getMatchConvoked(m);
            container.innerHTML = `
                <div class="bg-slate-50 p-3 rounded-lg border space-y-3">
                    <p class="font-bold text-slate-700">Scores Finaux :</p>
                    <div class="grid grid-cols-2 gap-3">
                        <div><label class="block text-slate-500 text-[11px] mb-1">Rangueil</label><input type="number" id="bilan-score-home" min="0" value="${m.scoreHome !== undefined ? m.scoreHome : ''}" class="w-full p-2 border rounded font-bold bg-white"></div>
                        <div><label class="block text-slate-500 text-[11px] mb-1">${m.opponent}</label><input type="number" id="bilan-score-away" min="0" value="${m.scoreAway !== undefined ? m.scoreAway : ''}" class="w-full p-2 border rounded font-bold bg-white"></div>
                    </div>
                    <button onclick="saveMatchScores('${m.id}')" class="w-full py-2 bg-sky-600 text-white font-bold rounded-lg">Enregistrer le score</button>
                </div>
                <div class="bg-slate-50 p-3 rounded-lg border space-y-2">
                    <p class="font-bold text-slate-700">📝 Debrief du Coach :</p>
                    <textarea id="bilan-debrief" rows="2" class="w-full p-2 border rounded bg-white text-xs">${m.debrief || ''}</textarea>
                    <button onclick="saveMatchDebrief('${m.id}')" class="w-full py-1.5 bg-slate-700 text-white font-bold rounded-lg">Enregistrer le debrief</button>
                </div>
                <div class="space-y-2 pt-2">
                    <p class="font-bold text-slate-700">Buteurs, Passes & Cartons :</p>
                    <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
                        ${convokedPlayers.map(p => {
                            const pMatchStat = m.matchStats[p.id] || { goals: 0, assists: 0 };
                            const card = state.cards[m.id][p.id] || 'none';
                            const jersey = m.jerseys && m.jerseys[p.id] ? ` (N°${m.jerseys[p.id]})` : '';
                            return `
                                <div class="p-2.5 bg-slate-50 rounded-lg border flex flex-col sm:flex-row justify-between items-center gap-2">
                                    <span class="font-bold text-slate-700">${p.name}${jersey}</span>
                                    <div class="flex items-center space-x-2 flex-wrap">
                                        <div class="flex items-center space-x-1"><span class="text-[10px]">Buts:</span><input type="number" min="0" value="${pMatchStat.goals}" onchange="updatePlayerMatchStat('${m.id}', '${p.id}', 'goals', this.value)" class="w-12 p-1 border rounded text-center bg-white font-bold"></div>
                                        <div class="flex items-center space-x-1"><span class="text-[10px]">Passes:</span><input type="number" min="0" value="${pMatchStat.assists}" onchange="updatePlayerMatchStat('${m.id}', '${p.id}', 'assists', this.value)" class="w-12 p-1 border rounded text-center bg-white font-bold"></div>
                                        <div class="inline-flex space-x-1">
                                            <button onclick="toggleCardModal('${m.id}', '${p.id}', 'yellow')" class="px-2 py-0.5 rounded font-bold text-[11px] ${card === 'yellow' ? 'bg-amber-400 text-slate-900 ring-2' : 'bg-slate-200 text-slate-600'}">🟨</button>
                                            <button onclick="toggleCardModal('${m.id}', '${p.id}', 'red')" class="px-2 py-0.5 rounded font-bold text-[11px] ${card === 'red' ? 'bg-red-600 text-white ring-2' : 'bg-slate-200 text-slate-600'}">🟥</button>
                                        </div>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>`;
            toggleModal('modal-match-bilan', true);
        }

        function saveMatchScores(mId) {
            if (!state.matches[mId]) return;
            state.matches[mId].scoreHome = document.getElementById('bilan-score-home').value;
            state.matches[mId].scoreAway = document.getElementById('bilan-score-away').value;
            saveStateToFirebase();
            showToast("Score enregistré !");
            renderMatchesResultsList();
            renderDashboard();
        }

        function saveMatchDebrief(mId) {
            if (!state.matches[mId]) return;
            state.matches[mId].debrief = document.getElementById('bilan-debrief').value;
            saveStateToFirebase();
            showToast("Debrief enregistré !");
            renderDashboard();
        }

        function updatePlayerMatchStat(mId, pId, type, val) {
            if (!state.matches[mId].matchStats) state.matches[mId].matchStats = {};
            if (!state.matches[mId].matchStats[pId]) state.matches[mId].matchStats[pId] = { goals: 0, assists: 0 };
            state.matches[mId].matchStats[pId][type] = parseInt(val) || 0;
            recalculateGlobalStats();
            saveStateToFirebase();
            renderDashboard();
            renderEffectif();
        }

        function recalculateGlobalStats() {
            state.stats = {};
            Object.values(state.matches).forEach(m => {
                if (m.matchStats) {
                    Object.keys(m.matchStats).forEach(pId => {
                        if (!state.stats[pId]) state.stats[pId] = { goals: 0, assists: 0 };
                        state.stats[pId].goals += m.matchStats[pId].goals || 0;
                        state.stats[pId].assists += m.matchStats[pId].assists || 0;
                    });
                }
            });
        }

        function toggleCardModal(mId, pId, cardType) {
            if (!state.cards[mId]) state.cards[mId] = {};
            state.cards[mId][pId] = state.cards[mId][pId] === cardType ? 'none' : cardType;
            saveStateToFirebase();
            openMatchBilanModal(mId);
            renderDashboard();
            renderEffectif();
        }

        // ============================================================
        // BILAN DES CONVOCATIONS — matchs passés de l'équipe
        //   played  = convoqué
        //   choix   = disponible mais non retenu (choix du coach)
        //   indispo = s'était signalé indisponible
        // ============================================================
        function getTodayStr() {
            return new Date().toISOString().split('T')[0];
        }

        function emptyConvocationStats() {
            return { played: 0, choix: 0, indispo: 0, total: 0 };
        }

        function buildConvocationHistory(teamKey) {
            const todayStr = getTodayStr();
            const team = String(teamKey || '').toLowerCase();

            const pastMatches = Object.values(state.matches || {}).filter(m =>
                m && m.date && m.date <= todayStr &&
                String(m.team || '').toLowerCase() === team
            );

            const history = {};
            pastMatches.forEach(m => {
                Object.entries(m.convocations || {}).forEach(([pId, status]) => {
                    let bucket = null;
                    if (status === 'convoke') bucket = 'played';
                    else if (status === 'nonconvoke') bucket = 'choix';
                    else if (status === 'indisponible') bucket = 'indispo';
                    if (!bucket) return;
                    if (!history[pId]) history[pId] = emptyConvocationStats();
                    history[pId][bucket]++;
                    history[pId].total++;
                });
            });

            return { matches: pastMatches, history };
        }

        function convocationBadgeHtml(stats) {
            const s = stats || emptyConvocationStats();
            if (!s.total) {
                return `<div class="mt-1 text-[10px] text-slate-400 italic" title="Aucun match passé avec cette équipe">— aucun match</div>`;
            }
            const pct = Math.round((s.played / s.total) * 100);
            return `<div class="flex flex-wrap items-center gap-1 mt-1" title="${s.played} convoqué(s) · ${s.choix} choix du coach · ${s.indispo} indisponible(s) sur ${s.total} match(s) passé(s)">
                        <span class="px-1.5 py-0.5 rounded border border-sky-100 bg-sky-50 text-sky-700 font-bold">✅ ${s.played}</span>
                        <span class="px-1.5 py-0.5 rounded border border-orange-100 bg-orange-50 text-orange-700 font-bold">🟠 ${s.indispo}</span>
                        <span class="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 font-bold">⚪ ${s.choix}</span>
                        <span class="text-[10px] font-extrabold text-slate-400">${pct}%</span>
                    </div>`;
        }

        function renderConvocationHistory(m, playerItems, convocHistory) {
            const container = document.getElementById('convoc-history-panel');
            if (!container) return;

            const data = convocHistory || buildConvocationHistory(m.team);
            const teamName = state.teams?.[m.team]?.name || (m.team ? String(m.team).toUpperCase() : 'Équipe');

            const teamKey = String(m.team || '').toLowerCase();

            const rows = (playerItems || [])
                // On garde les joueurs de l'équipe + les surclassés déjà convoqués
                .filter(({ p }) => {
                    const ownTeam = String(p.team || p.cat || '').toLowerCase() === teamKey;
                    const s = data.history[p.id];
                    return ownTeam || (s && s.total > 0);
                })
                .map(({ p, invite }) => ({ p, invite, s: data.history[p.id] || emptyConvocationStats() }))
                .sort((a, b) =>
                    (b.s.played - a.s.played) ||
                    (a.s.choix - b.s.choix) ||
                    a.p.name.localeCompare(b.p.name)
                );

            if (!data.matches.length) {
                container.innerHTML = `
                <div class="card card-pad">
                    <h3 class="card-title"><i class="fa-solid fa-chart-simple"></i>Bilan des convocations</h3>
                    <p class="card-sub">Aucun match passé pour ${teamName} : le bilan apparaîtra dès le premier match joué.</p>
                </div>`;
                return;
            }

            const rowsHtml = rows.map(({ p, invite, s }) => {
                const pct = s.total ? Math.round((s.played / s.total) * 100) : 0;
                const originTeam = invite
                    ? (state.teams?.[p.team]?.name || String(p.team || p.cat || '').toUpperCase())
                    : '';
                const originLabel = originTeam ? ` · prêté par ${originTeam}` : '';
                return `<div class="flex items-center justify-between gap-2 px-4 py-2">
                        <div class="min-w-0">
                            <p class="font-bold text-xs text-slate-800 truncate">${p.name}</p>
                            <p class="text-[10px] text-slate-400">${p.poste1 || '-'}${originLabel}</p>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="px-1.5 py-0.5 rounded border border-sky-100 bg-sky-50 text-sky-700 text-[10px] font-bold" title="Convoqué">✅ ${s.played}</span>
                            <span class="px-1.5 py-0.5 rounded border border-orange-100 bg-orange-50 text-orange-700 text-[10px] font-bold" title="Indisponible">🟠 ${s.indispo}</span>
                            <span class="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 text-[10px] font-bold" title="Non retenu (choix)">⚪ ${s.choix}</span>
                            <div class="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block" title="${pct}% de convocations">
                                <div class="h-full bg-sky-500" style="width:${pct}%"></div>
                            </div>
                            <span class="w-8 text-right text-[10px] font-extrabold text-slate-500">${pct}%</span>
                        </div>
                    </div>`;
            }).join('');

            container.innerHTML = `
            <div class="card overflow-hidden">
                <details class="group">
                    <summary class="list-none cursor-pointer p-4 flex items-start justify-between gap-2 hover:bg-slate-50 transition-colors">
                        <div>
                            <h3 class="card-title"><i class="fa-solid fa-chart-simple"></i>Bilan des convocations</h3>
                            <p class="card-sub">${teamName} · ${data.matches.length} match(s) passé(s) · ✅ convoqué · 🟠 indispo · ⚪ choix</p>
                        </div>
                        <span class="flex items-center gap-2 shrink-0">
                            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">${rows.length} joueurs</span>
                            <i class="fa-solid fa-chevron-down text-xs text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true"></i>
                        </span>
                    </summary>
                    <div class="divide-y divide-slate-100 border-t border-slate-100 max-h-[60vh] overflow-y-auto">${rowsHtml}</div>
                </details>
            </div>`;
        }

        // ============================================================
        // ORDRE DES REMPLAÇANTS (banc) — classement par flèches
        // ============================================================
        function sortByBenchOrder(m, players) {
            const saved = Array.isArray(m && m.benchOrder) ? m.benchOrder : [];
            const rank = new Map();
            saved.forEach((id, i) => rank.set(id, i));
            return (players || []).slice().sort((a, b) => {
                const ra = rank.has(a.id) ? rank.get(a.id) : Number.MAX_SAFE_INTEGER;
                const rb = rank.has(b.id) ? rank.get(b.id) : Number.MAX_SAFE_INTEGER;
                return ra - rb;
            });
        }

        function getMatchSubstitutePlayers(m) {
            if (!m) return [];
            const positions = m.positions || {};
            const subs = getMatchPlayers(m)
                .map(item => item.p)
                .filter(p => positions[p.id] === 'Remplaçant');

            return sortByBenchOrder(m, subs);
        }

        function moveBenchPlayer(mId, pId, dir) {
            const m = state.matches[mId];
            if (!m) return;

            const ids = getMatchSubstitutePlayers(m).map(p => p.id);
            const from = ids.indexOf(pId);
            if (from === -1) return;

            const to = dir === 'up' ? from - 1 : from + 1;
            if (to < 0 || to >= ids.length) return;

            ids.splice(to, 0, ids.splice(from, 1)[0]);
            m.benchOrder = ids;

            saveStateToFirebase();
            renderMatchDetail();
        }

        // Banc de l'onglet Composition = joueurs convoqués non placés sur le terrain
        function getCompositionBenchPlayers(m) {
            if (!m) return [];
            const assigned = Object.values(m.slotAssignments || {});
            const bench = getMatchPlayers(m)
                .map(item => item.p)
                .filter(p =>
                    (m.convocations || {})[p.id] === 'convoke' &&
                    !assigned.includes(p.id)
                );
            return sortByBenchOrder(m, bench);
        }

        function moveCompositionBenchPlayer(mId, pId, dir) {
            const m = state.matches[mId];
            if (!m) return;

            const ids = getCompositionBenchPlayers(m).map(p => p.id);
            const from = ids.indexOf(pId);
            if (from === -1) return;

            const to = dir === 'up' ? from - 1 : from + 1;
            if (to < 0 || to >= ids.length) return;

            ids.splice(to, 0, ids.splice(from, 1)[0]);
            m.benchOrder = ids;

            saveStateToFirebase();
            renderMatchComposition();
        }

        function renderBenchOrderPanel(m) {
            const container = document.getElementById('bench-order-panel');
            if (!container || !m) return;

            const subs = getMatchSubstitutePlayers(m);
            const benchCardsIndex = getCardsByPlayerIndex();

            if (!subs.length) {
                container.innerHTML = `
                <div class="bg-white p-4 rounded-xl card-shadow border border-slate-100">
                    <h3 class="text-sm font-bold text-slate-800"><i class="fa-solid fa-list-ol mr-1 text-sky-600"></i>Ordre des remplaçants</h3>
                    <p class="text-xs text-slate-500 mt-1">Aucun remplaçant pour ce match : passez un joueur en « Remplaçant » dans la colonne Poste pour définir l'ordre d'entrée.</p>
                </div>`;
                return;
            }

            const statusCfg = {
                convoke: ['Conv.', 'bg-sky-100 text-sky-700 border-sky-200'],
                nonconvoke: ['Non', 'bg-slate-100 text-slate-500 border-slate-200'],
                indisponible: ['Indispo', 'bg-orange-100 text-orange-700 border-orange-200'],
                none: ['—', 'bg-slate-50 text-slate-400 border-slate-200']
            };

            const targetConvoked = parseInt(state.teams?.[m.team]?.targetConvocations) || 14;
            const maxSubsOnSheet = Math.max(0, targetConvoked - 11);

            const rows = subs.map((p, i) => {
                const status = (m.convocations || {})[p.id] || 'none';
                const cfg = statusCfg[status] || statusCfg.none;
                const isFirst = i === 0;
                const isLast = i === subs.length - 1;
                const horsFeuille = i >= maxSubsOnSheet;

                const divider = (i === maxSubsOnSheet && subs.length > maxSubsOnSheet)
                    ? `<div class="flex items-center gap-2 px-3 pt-3 pb-1">
                           <span class="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Hors feuille de match</span>
                           <span class="flex-1 h-px bg-slate-200"></span>
                       </div>`
                    : '';

                return `${divider}<div class="flex items-center justify-between gap-2 px-3 py-2 ${horsFeuille ? 'opacity-60' : ''}">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 shrink-0 rounded-full bg-sky-600 text-white text-[11px] font-extrabold flex items-center justify-center" title="Position ${i + 1} sur le banc">${i + 1}</span>
                            <div class="min-w-0">
                                <p class="font-bold text-xs text-slate-800 truncate">${p.name}${renderDisciplineChip(computePlayerDiscipline(p.id, benchCardsIndex), true)}</p>
                                <p class="text-[10px] text-slate-400">${p.poste1 || '-'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                            <span class="px-1.5 py-0.5 rounded border text-[10px] font-bold ${cfg[1]}">${cfg[0]}</span>
                            <button onclick="moveBenchPlayer('${m.id}', '${p.id}', 'up')" ${isFirst ? 'disabled' : ''}
                                class="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center text-[13px] font-bold ${isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                aria-label="Monter ${p.name}" title="Monter">▲</button>
                            <button onclick="moveBenchPlayer('${m.id}', '${p.id}', 'down')" ${isLast ? 'disabled' : ''}
                                class="w-9 h-9 rounded-lg border border-slate-200 text-slate-600 flex items-center justify-center text-[13px] font-bold ${isLast ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                aria-label="Descendre ${p.name}" title="Descendre">▼</button>
                        </div>
                    </div>`;
            }).join('');

            container.innerHTML = `
            <div class="bg-white rounded-xl card-shadow border border-slate-100">
                <div class="flex items-start justify-between gap-2 p-4 pb-2">
                    <div>
                        <h3 class="text-sm font-bold text-slate-800"><i class="fa-solid fa-list-ol mr-1 text-sky-600"></i>Ordre des remplaçants</h3>
                        <p class="text-[11px] text-slate-500">Ordre d'entrée · ${maxSubsOnSheet} sur la feuille · ▲ ▼ pour classer · reprise dans Composition</p>
                    </div>
                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">${subs.length}</span>
                </div>
                <div class="divide-y divide-slate-100">
                    ${subs.length > maxSubsOnSheet ? `<div class="flex items-center gap-2 px-3 pt-2 pb-1">
                        <span class="text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">Sur la feuille (${maxSubsOnSheet})</span>
                        <span class="flex-1 h-px bg-emerald-100"></span>
                    </div>` : ''}
                    ${rows}
                </div>
            </div>`;
        }

        function setMatchStatus(mId, pId, status) {
            if (!state.matches[mId].convocations) state.matches[mId].convocations = {};
            state.matches[mId].convocations[pId] = status;
            saveStateToFirebase();
            renderMatchDetail();
        }

        function setMatchPosition(mId, pId, position) {
            if (!state.matches[mId].positions) state.matches[mId].positions = {};
            state.matches[mId].positions[pId] = position;
            saveStateToFirebase();
            // Rafraîchit aussitôt le bloc « Ordre des remplaçants »
            renderMatchDetail();
        }

        function setMatchJersey(mId, pId, jersey) {
            const match = state.matches[mId];
            if (!match) return;

            if (!match.jerseys) match.jerseys = {};

            const value = String(jersey == null ? '' : jersey).trim();
            const auto = computeAutoJerseyMap(match)[pId];

            // Vide ou identique au numéro automatique : aucune surcharge stockée
            if (!value || (auto != null && parseInt(value, 10) === auto)) {
                delete match.jerseys[pId];
                saveStateToFirebase();
                return;
            }

            const number = parseInt(value, 10);
            const isStarter = Object.values(match.slotAssignments || {}).includes(pId);
            const min = isStarter ? 1 : 12;
            const max = isStarter ? 11 : 14;

            if (!number || number < min || number > max) {
                showToast(
                    isStarter
                        ? 'Un titulaire prend un numéro de 1 à 11'
                        : 'Un remplaçant prend un numéro de 12 à 14',
                    'error'
                );
                return;
            }

            const clash = Object.entries(computeMatchJerseys(match))
                .find(([id, j]) => id !== pId && j.number === number);

            if (clash) {
                showToast('Le numéro ' + number + ' est déjà pris', 'error');
                return;
            }

            match.jerseys[pId] = String(number);
            saveStateToFirebase();
        }

        function onInviteSearchInput(value) {
            const resultsEl = document.getElementById('invite-search-results');
            if (!resultsEl) return;

            const query = (value || '').trim().toLowerCase();
            if (query.length < 2) {
                resultsEl.innerHTML = '';
                return;
            }

            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) {
                resultsEl.innerHTML = '';
                return;
            }

            const m = state.matches[state.selectedMatchId];
            const role = window.currentUserRole || 'public';
            const userTeam = window.currentUserTeam || 'all';
            const tokens = query.split(/\s+/);

            const present = new Set(Object.keys(m.convocations || {}));
            Object.keys(m.extraPlayers || {}).forEach(id => present.add(id));

            const ownIds = new Set();
            if (role === 'coach' || role === 'responsable') {
                state.players.forEach(p => {
                    if (present.has(p.id)) return;
                    if ((p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase()) ownIds.add(p.id);
                });
            }

            const matches = state.players.filter(p => {
                if (present.has(p.id)) return false;
                if (ownIds.has(p.id)) return false;
                const hay = ((p.name || '') + ' ' + (p.licence || '') + ' ' + (p.team || '') + ' ' + (p.cat || '')).toLowerCase();
                return tokens.every(t => hay.includes(t));
            }).slice(0, 12);

            if (!matches.length) {
                resultsEl.innerHTML = '<div class="text-[11px] text-slate-400 py-1.5">Aucun joueur trouvé (ou déjà ajouté).</div>';
                return;
            }

            resultsEl.innerHTML = matches.map(p => {
                const teamName = state.teams?.[p.team]?.name || p.team || p.cat || 'Équipe';
                return `
                    <div class="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                        <div>
                            <div class="font-bold text-slate-800 text-xs">${p.name}</div>
                            <div class="text-[10px] text-slate-400">${teamName}${p.licence ? ' · ' + p.licence : ''}</div>
                        </div>
                        <button onclick="ajouterInviteJoueur('${m.id}', '${p.id}')" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold">Ajouter</button>
                    </div>
                `;
            }).join('');
        }

        function ajouterInviteJoueur(mId, playerId) {
            const m = state.matches[mId];
            if (!m) return;
            const p = state.players.find(pp => pp.id === playerId);
            if (!p) return;

            // Modèle canonique : on ne stocke que l'ID. Le joueur est résolu
            // à l'affichage depuis l'effectif (nom/poste/licence à jour).
            if (!m.extraPlayers) m.extraPlayers = {};
            m.extraPlayers[playerId] = true;
            saveStateToFirebase();
            renderMatchDetail();
        }

        function retirerInviteJoueur(mId, playerId) {
            const m = state.matches[mId];
            if (!m) return;

            if (m.extraPlayers) delete m.extraPlayers[playerId];
            if (m.convocations) delete m.convocations[playerId];
            if (m.positions) delete m.positions[playerId];
            if (m.jerseys) delete m.jerseys[playerId];
            if (m.carpool) delete m.carpool[playerId];

            // Nettoyage des références au joueur retiré
            Object.keys(m.slotAssignments || {}).forEach(slot => {
                if (m.slotAssignments[slot] === playerId) delete m.slotAssignments[slot];
            });
            if (Array.isArray(m.benchOrder)) {
                m.benchOrder = m.benchOrder.filter(id => id !== playerId);
            }

            saveStateToFirebase();
            renderMatchDetail();
        }

// Calcule l'heure de RDV : coup d'envoi - arrivée - (trajet + sécurité si extérieur)
function computeRdvHeure(heureStr, location, travel, arrival, security) {
    if (!heureStr || !String(heureStr).includes(':')) return '';
    const parts = String(heureStr).split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const arr = parseInt(arrival) || 60;
    let totalMinutes;
    if (location === 'Domicile') {
        totalMinutes = (hours * 60) + minutes - arr;
    } else {
        totalMinutes = (hours * 60) + minutes - arr - (parseInt(travel) || 0) - (parseInt(security) || 0);
    }
    if (totalMinutes < 0) totalMinutes = 0;
    const rdvHours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const rdvMinutes = String(totalMinutes % 60).padStart(2, '0');
    return rdvHours + ':' + rdvMinutes;
}

// Heure RDV d'un match : champ persisté si présent, sinon recalculé depuis les marges
// (couvre les matchs créés avant l'ajout du champ rdvHeure)
function getRdvHeure(m) {
    if (!m) return '';
    if (m.rdvHeure) return m.rdvHeure;
    return computeRdvHeure(
        m.heure,
        m.location,
        m.travelTime != null ? m.travelTime : 25,
        m.arrivalMargin != null ? m.arrivalMargin : 60,
        m.securityMargin != null ? m.securityMargin : 10
    );
}

function updateMeetingPreview() {

    const matchTime =
        document.getElementById('m-heure')?.value;

    if (!matchTime) return;

    const travel =
        parseInt(
            document.getElementById('m-travel-time')?.value
        ) || 0;

    const security =
        parseInt(
            document.getElementById('m-security-margin')?.value
        ) || 0;

    const location =
        document.getElementById('m-location').value;

    const arrival =
    parseInt(
        document.getElementById('m-arrival-margin').value
    ) || 60;

    document.getElementById('m-rdv-preview').innerText =
        computeRdvHeure(matchTime, location, travel, arrival, security) || '--';
}

function updateMatchLocationUI() {

    const location =
        document.getElementById('m-location')?.value;

    const travel =
        document.getElementById(
            'travel-time-container'
        );

    const security =
        document.getElementById(
            'security-margin-container'
        );

    const meetingPlace =
        document.getElementById(
            'm-meeting-place'
        );

    if (!travel || !security) return;

    if (location === 'Domicile') {

        travel.style.display = 'none';
        security.style.display = 'none';

        if (meetingPlace) {
            meetingPlace.value =
                'COMPLEXE SPORTIF RANGUEIL';
        }

    } else {

        travel.style.display = '';
        security.style.display = '';

        if (meetingPlace) {
            meetingPlace.value =
                'COSEC Rangueil';
        }

    }

}

        function openModalMatch(matchId = null) {
            document.getElementById('form-match').reset();
            if (matchId) {
                const m = state.matches[matchId];
                if (m) {
                    document.getElementById('modal-match-title').innerText = "Modifier le Match";
                    document.getElementById('m-id').value = m.id;
                    document.getElementById('m-opponent').value = m.opponent || '';
                    document.getElementById('m-adresse').value = m.adresse || '';
                    document.getElementById('m-date').value = m.date || '';
                    document.getElementById('m-heure').value = m.heure || '14:30';
                    document.getElementById('m-type').value = m.type || 'Championnat';
                    document.getElementById('m-location').value = m.location || 'Domicile';
                    document.getElementById('m-pelouse').value = m.pelouse || 'Synthétique';
                    document.getElementById('m-team').value = m.team || '';
                    document.getElementById('m-meeting-place').value = m.meetingPlace || 'COSEC Rangueil';
                    document.getElementById('m-travel-time').value = m.travelTime || 25;
                    document.getElementById('m-security-margin').value = m.securityMargin || 10;
                    document.getElementById('m-arrival-margin').value = m.arrivalMargin || 60;
                }
            } else {
                document.getElementById('modal-match-title').innerText = "Nouveau Match";
                document.getElementById('m-id').value = '';
                document.getElementById('m-team').value = '';
                document.getElementById('m-meeting-place').value = 'COSEC Rangueil';
                document.getElementById('m-travel-time').value = 25;
                document.getElementById('m-security-margin').value = 10;
                document.getElementById('m-arrival-margin').value = 60;
            }
            updateMeetingPreview();
            updateDeadlinePreview();
            updateMatchLocationUI();
            toggleModal('modal-match', true);
        }

   function handleSaveMatch(event) {
    event.preventDefault();
    
    // Validation du champ team
    const teamValue = document.getElementById('m-team').value;
    if (!teamValue) {
        showToast("❌ Veuillez sélectionner une équipe !");
        return;
    }
    
    const matchId = document.getElementById('m-id').value || 'M' + Date.now();
    const existingMatch =
    state.matches[matchId] || {};
    const saveHeure = document.getElementById('m-heure').value;
    const saveLocation = document.getElementById('m-location').value;
    const saveTravel = parseInt(document.getElementById('m-travel-time').value) || 25;
    const saveArrival = parseInt(document.getElementById('m-arrival-margin').value) || 60;
    const saveSecurity = parseInt(document.getElementById('m-security-margin').value) || 10;
    // On repart de l'objet existant et on écrase seulement les champs du formulaire.
    // Sinon tout champ non listé est perdu : extraPlayers (invités/surclassés),
    // entourage, benchOrder, carpoolClosed, fff, currentFormation…
    const matchData = Object.assign({}, existingMatch, {
        id: matchId,
        opponent: document.getElementById('m-opponent').value,
        adresse: document.getElementById('m-adresse').value,
        date: document.getElementById('m-date').value,
        heure: saveHeure,
        type: document.getElementById('m-type').value,
        location: saveLocation,
        pelouse: document.getElementById('m-pelouse').value,
        team: teamValue,

carpoolId:
    (state.matches[matchId]?.carpoolId)
    || ('CP_' + Date.now()),

meetingPlace:
    document.getElementById('m-meeting-place').value,


travelTime: saveTravel,

 arrivalMargin: saveArrival,

securityMargin: saveSecurity,

// Heure de RDV calculée et persistée (affichée page covoiturage + WhatsApp)
rdvHeure: computeRdvHeure(saveHeure, saveLocation, saveTravel, saveArrival, saveSecurity),
        // Conserver les scores existants (ne pas les effacer à l'édition)
        scoreHome: existingMatch.scoreHome != null ? existingMatch.scoreHome : "",
        scoreAway: existingMatch.scoreAway != null ? existingMatch.scoreAway : "",
        convocations: existingMatch.convocations || {},
positions: existingMatch.positions || {},
jerseys: existingMatch.jerseys || {},
carpool: existingMatch.carpool || {},
matchStats: existingMatch.matchStats || {},
debrief: existingMatch.debrief || "",
composition: existingMatch.composition || {},
slotAssignments:
    existingMatch.slotAssignments || {},
isValidated: existingMatch.isValidated || false

    });

    // Mise à jour de l'état local
    state.matches[matchId] = matchData;
    

state.selectedMatchId = matchId;


    
    // Sauvegarde unique dans Firebase via le système d'état central
    saveStateToFirebase();
    
    // Affichage de confirmation
    showToast("✅ Match enregistré avec succès !");
    
    // Rafraîchissement de l'interface
    toggleModal('modal-match', false);
    renderAll();
}

        function openModalPlayer(playerId = null) {
            document.getElementById('form-player').reset();
            if (playerId) {
                const player = state.players.find(p => p.id === playerId);
                if (player) {
                    document.getElementById('modal-player-title').innerText = "Modifier le Joueur";
                    document.getElementById('p-id').value = player.id;
                    const nameParts = getPlayerNameParts(player);
                    document.getElementById('p-prenom').value = nameParts.prenom || '';
                    document.getElementById('p-nom').value = nameParts.nom || '';
                    document.getElementById('p-nickname').value = player.nickname || '';
                    document.getElementById('p-licence').value = player.licence !== '-' ? player.licence : '';
                    document.getElementById('p-team').value = player.team || 'U14';
                    document.getElementById('p-poste1').value = (player.poste1 || '').replace('-', '');
                    document.getElementById('p-poste2').value = (player.poste2 || '').replace('-', '');
                    document.getElementById('p-poste3').value = (player.poste3 || '').replace('-', '');
                    document.getElementById('p-niveau').value = player.niveau || 2;
                    document.getElementById('p-phone-pere').value = player.phonePere !== '-' ? player.phonePere : '';
                    document.getElementById('p-phone-mere').value = player.phoneMere !== '-' ? player.phoneMere : '';
                    document.getElementById('p-phone-joueur').value = player.phoneJoueur !== '-' ? player.phoneJoueur : '';
                }
            } else {
                document.getElementById('modal-player-title').innerText = "Ajouter un Joueur";
                document.getElementById('p-id').value = '';
            }
            const role = window.currentUserRole || 'public';
const userTeam = window.currentUserTeam || '';

if (role === 'responsable') {

    const teamSelect =
        document.getElementById('p-team');

    const scopes = userTeam
        .split(',')
        .map(t => t.trim());

    Array.from(teamSelect.options)
        .forEach(option => {

            option.hidden =
                !scopes.includes(option.value);

        });
}
            toggleModal('modal-player', true);
        }

        function handleSavePlayer(e) {
            e.preventDefault();
            const pId = document.getElementById('p-id').value;
            const existingPlayer = pId ? state.players.find(p => p.id === pId) : null;

            const prenom = document.getElementById('p-prenom').value.trim().replace(/\s+/g, ' ');
            const nom = document.getElementById('p-nom').value.trim().replace(/\s+/g, ' ').toUpperCase();

            if (!prenom && !nom) {
                alert("Renseignez au moins le prénom ou le nom du joueur.");
                return;
            }

            // Stockage toujours au format « NOM Prénom »
            const canonicalName = [nom, prenom].filter(Boolean).join(' ');

            const playerData = {
    ...(existingPlayer || {}),
    id: pId || 'J_' + Date.now(),
    name: canonicalName,
    prenom: prenom,
    nom: nom,
    nickname: document.getElementById('p-nickname').value.trim(),
    licence: document.getElementById('p-licence').value.trim() || '-',
    team: document.getElementById('p-team').value,
    poste1: document.getElementById('p-poste1').value.trim() || '-',
    poste2: document.getElementById('p-poste2').value.trim() || '-',
    poste3: document.getElementById('p-poste3').value.trim() || '-',

    niveau: parseInt(document.getElementById('p-niveau').value) || 2,

    phonePere: document.getElementById('p-phone-pere').value || '-',
    phoneMere: document.getElementById('p-phone-mere').value || '-',
    phoneJoueur: document.getElementById('p-phone-joueur').value || '-'
};
            // Le nom canonique vient d'être recalculé : on écarte l'ancien cache d'affichage
            delete playerData.nameCanonical;

            if (pId) {
                const idx = state.players.findIndex(p => p.id === pId);
                if (idx !== -1) state.players[idx] = playerData;
            } else {
                state.players.push(playerData);
            }
            saveStateToFirebase();
            toggleModal('modal-player', false);
            renderAll();
        }

        function deletePlayer(playerId) {
            if (confirm("Supprimer ce joueur de l'effectif ?")) {
                state.players = state.players.filter(p => p.id !== playerId);
                saveStateToFirebase();
                renderAll();
            }
        }

        /* ============================================================
           GESTION DU STAFF & DIRIGEANTS
           ============================================================ */

        function getStaffRole(s) {
            return (s && (s.role || s.functionName)) || "Dirigeant d'équipe";
        }

        function getStaffTeam(s) {
            if (s && s.team) return s.team;
            if (s && Array.isArray(s.scope)) return s.scope[0] || '';
            if (s && typeof s.scope === 'string') return s.scope;
            return '';
        }

        function staffHash(text) {
            let h = 0;
            for (let i = 0; i < text.length; i++) h = ((h << 5) - h + text.charCodeAt(i)) | 0;
            return Math.abs(h).toString(36);
        }

        function staffId(s) {
            if (!s) return '';
            if (!s.id) s.id = 'ST_' + staffHash(((s.name || '') + '|' + (s.licence || '') + '|' + getStaffRole(s)).toLowerCase());
            return s.id;
        }

        function normalizeStaff() {
            if (!Array.isArray(state.staff)) state.staff = [];
            state.staff.forEach(s => {
                if (!s.team) s.team = getStaffTeam(s) || '';
                if (!s.role && s.functionName) s.role = s.functionName;
                staffId(s);
            });
        }

        function setEffectifTab(tab) {
            currentEffectifTab = tab;
            const active = tab === 'staff';
            const playersTab = document.getElementById('effectif-tab-joueurs');
            const staffTab = document.getElementById('effectif-tab-staff');
            const playersGrid = document.getElementById('effectif-full-container');
            const staffGrid = document.getElementById('staff-effectif-container');
            const searchPlayer = document.getElementById('search-player');
            const addBtn = document.getElementById('effectif-add-btn');

            if (playersTab) playersTab.className = active ? 'px-3 py-1.5 rounded-md text-slate-600 transition' : 'px-3 py-1.5 rounded-md bg-sky-600 text-white transition';
            if (staffTab) staffTab.className = active ? 'px-3 py-1.5 rounded-md bg-sky-600 text-white transition' : 'px-3 py-1.5 rounded-md text-slate-600 hover:text-slate-800 transition';
            if (playersGrid) playersGrid.classList.toggle('hidden', active);
            if (staffGrid) staffGrid.classList.toggle('hidden', !active);
            if (searchPlayer) searchPlayer.classList.toggle('hidden', active);
            if (addBtn) {
                addBtn.innerHTML = active
                    ? '<i class="fa-solid fa-user-tie"></i><span>Ajouter</span>'
                    : '<i class="fa-solid fa-user-plus"></i><span>Ajouter</span>';
            }
            if (active) renderStaffEffectif();
        }

        function openEffectifAdd() {
            if (currentEffectifTab === 'staff') {
                openModalStaff();
                renderStaffEffectif();
            } else {
                openModalPlayer();
            }
        }

        function renderStaffEffectif() {
            const container = document.getElementById('staff-effectif-container');
            if (!container) return;
            normalizeStaff();

            const roleBadge = r => {
                if (r === 'Coach Principal') return 'bg-sky-100 text-sky-800';
                if (r === 'Coach Adjoint') return 'bg-indigo-100 text-indigo-800';
                if (r === "Dirigeant d'équipe") return 'bg-amber-100 text-amber-800';
                return 'bg-slate-100 text-slate-700';
            };

            const list = state.staff || [];

            container.innerHTML = list.length ? list.map(s => {
                const role = getStaffRole(s);
                const teamKey = getStaffTeam(s);
                const teamName = state.teams?.[teamKey]?.name || teamKey || 'Toutes équipes';
                const hasLic = s.licence && String(s.licence).trim() && String(s.licence).trim() !== '-';
                return `
                    <div class="p-3 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-3">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="font-bold text-xs text-slate-800">${s.name || '—'}</h3>
                                <span class="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${roleBadge(role)}">${role}</span>
                                <p class="text-[11px] text-slate-500 mt-1">Équipe : ${teamName}</p>
                            </div>
                            <div class="flex items-center space-x-1.5">
                                <button onclick="openModalStaff('${staffId(s)}')" class="p-1 text-sky-600 hover:bg-sky-100 rounded" aria-label="Modifier"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
                                <button onclick="deleteStaffMember('${staffId(s)}')" class="p-1 text-slate-400 hover:text-red-600 rounded" aria-label="Supprimer"><i class="fa-solid fa-trash-can text-xs"></i></button>
                            </div>
                        </div>
                        <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                            <span class="text-[10px] text-slate-500 uppercase font-bold">Licence :</span>
                            <span class="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border text-xs ${hasLic ? '' : 'text-amber-700'}">${hasLic ? s.licence : '⚠️ Manquante'}</span>
                        </div>
                    </div>`;
            }).join('') : `
                <div class="col-span-full text-center text-slate-400 text-xs py-8">
                    <i class="fa-solid fa-user-tie text-2xl mb-2 opacity-30"></i>
                    <p class="font-bold">Aucun membre de staff</p>
                    <p>Ajoutez coaches et dirigeants avec le bouton « Ajouter ».</p>
                </div>`;
        }

        function openModalStaff(staffToEdit = null) {
            const form = document.getElementById('form-staff');
            if (form) form.reset();

            const teamSel = document.getElementById('s-team');
            if (teamSel && (teamSel.options.length === 0 || document.getElementById('s-id').value !== staffToEdit)) {
                const keys = Object.keys(state.teams || {});
                teamSel.innerHTML = keys.map(k => `<option value="${k}">${state.teams[k].name || k.toUpperCase()}</option>`).join('');
            }

            if (staffToEdit) {
                const s = (state.staff || []).find(x => staffId(x) === staffToEdit);
                if (s) {
                    document.getElementById('modal-staff-title').innerText = 'Modifier un membre du Staff';
                    document.getElementById('s-id').value = staffId(s);
                    document.getElementById('s-name').value = s.name || '';
                    document.getElementById('s-licence').value = s.licence && s.licence !== '-' ? s.licence : '';
                    const roleV = getStaffRole(s);
                    const inList = ['Coach Principal', 'Coach Adjoint', "Dirigeant d'équipe"].indexOf(roleV) !== -1;
                    document.getElementById('s-role').value = inList ? roleV : 'Autre';
                    const tV = getStaffTeam(s);
                    if (teamSel && tV && Object.keys(state.teams || {}).indexOf(tV) !== -1) teamSel.value = tV;
                }
            } else {
                document.getElementById('modal-staff-title').innerText = 'Ajouter un membre du Staff';
                document.getElementById('s-id').value = '';
            }
            toggleModal('modal-staff', true);
        }

        function handleSaveStaff(e) {
            e.preventDefault();
            const sId = document.getElementById('s-id').value;
            const roleVal = document.getElementById('s-role').value;
            const staffData = {
                id: sId || 'ST_' + Date.now(),
                name: document.getElementById('s-name').value,
                licence: document.getElementById('s-licence').value.trim() || '-',
                role: roleVal === 'Autre' ? "Dirigeant d'équipe" : roleVal,
                team: document.getElementById('s-team').value || ''
            };

            if (sId) {
                const idx = (state.staff || []).findIndex(x => staffId(x) === sId);
                if (idx !== -1) {
                    state.staff[idx] = Object.assign({}, state.staff[idx], staffData);
                } else {
                    if (!Array.isArray(state.staff)) state.staff = [];
                    state.staff.push(staffData);
                }
            } else {
                if (!Array.isArray(state.staff)) state.staff = [];
                state.staff.push(staffData);
            }

            saveStateToFirebase();
            toggleModal('modal-staff', false);
            renderAll();
        }

        function deleteStaffMember(sid) {
            const target = (state.staff || []).find(x => staffId(x) === sid);
            if (!target) return;
            if (confirm("Supprimer « " + (target.name || 'ce membre') + " » du staff ?")) {
                state.staff = (state.staff || []).filter(x => staffId(x) !== sid);
                saveStateToFirebase();
                renderAll();
            }
        }

        function copierTexte(t) {
            if (!t) return;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(String(t)).then(() => { try { showToast('Copié !'); } catch (e) {} }).catch(() => {});
            } else {
                try { showToast('Copie non disponible', 'error'); } catch (e) {}
            }
        }

        /* ============================================================
           ENTOURAGE DU MATCH (Coach principal, adjoint, dirigeants)
           ============================================================ */

        function matchEntourageGuard(m) {
            if (!m.entourage) m.entourage = { principalId: null, adjointId: null, dirigeants: {} };
            if (!m.entourage.dirigeants) m.entourage.dirigeants = {};
            if (!m.entourage.principalId) m.entourage.principalId = null;
            if (!m.entourage.adjointId) m.entourage.adjointId = null;
            return m.entourage;
        }

        function staffByEntourageId(id) {
            if (!id) return null;
            return (state.staff || []).find(s => staffId(s) === id) || null;
        }

        function staffSelectOptions(sortedStaff, selectedId, withEmpty) {
            const parts = [];
            if (withEmpty) parts.push('<option value="">— Aucun —</option>');
            sortedStaff.forEach(s => {
                const tid = getStaffTeam(s);
                const tname = state.teams?.[tid]?.name || tid || '';
                const sel = staffId(s) === selectedId ? ' selected' : '';
                parts.push('<option value="' + staffId(s) + '"' + sel + '>' + (s.name || '—') + ' — ' + getStaffRole(s) + (tname ? ' (' + tname + ')' : '') + '</option>');
            });
            return parts.join('');
        }

        function entourageLicenceChip(s) {
            if (!s) return '<span class="text-[10px] text-slate-400 italic">Aucun membre sélectionné</span>';
            const lic = s.licence && String(s.licence).trim() && String(s.licence).trim() !== '-' ? s.licence : null;
            const val = lic || '⚠️ Licence manquante';
            const cls = lic ? '' : ' text-amber-700';
            return '<div class="flex items-center space-x-1.5">'
                + '<span class="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border text-xs' + cls + '">' + val + '</span>'
                + (lic ? '<button onclick="copierTexte(\'' + lic + '\')" class="p-1 bg-slate-100 hover:bg-sky-100 text-sky-600 rounded text-xs border" title="Copier la licence"><i class="fa-regular fa-copy"></i></button>' : '')
                + '</div>';
        }

        function buildEntourageHtml(m) {
            normalizeStaff();
            const ent = matchEntourageGuard(m);
            const staff = state.staff || [];

            const principal = staffByEntourageId(ent.principalId);
            const adjoint = staffByEntourageId(ent.adjointId);

            const sortedStaff = staff.slice().sort((a, b) =>
                getStaffRole(a).localeCompare(getStaffRole(b)) || (a.name || '').localeCompare(b.name || '')
            );

            let table = '';
            let mobile = '';

            table += '<tr class="bg-slate-100 text-slate-700 font-bold text-xs"><td colspan="6" class="p-2 pl-4 uppercase tracking-wider">🎽 Encadrement & Dirigeants</td></tr>';
            mobile += '<div class="bg-slate-100 text-slate-700 font-bold text-xs p-2.5 rounded-lg my-3 uppercase tracking-wider">🎽 Encadrement & Dirigeants</div>';

            if (staff.length === 0) {
                const hint = 'Ajoutez d\'abord coaches et dirigeants dans Effectif → Staff & Dirigeants.';
                table += '<tr><td colspan="6" class="p-2 pl-4 text-[10px] text-slate-400 italic">' + hint + '</td></tr>';
                mobile += '<div class="text-[10px] text-slate-400 italic mb-2">' + hint + '</div>';
            } else {
                const coachRow = (label, field, current) => `
                    <tr class="border-b border-slate-100 bg-slate-50/40">
                        <td class="p-2 pl-4 font-bold text-slate-700 text-xs">${label}</td>
                        <td colspan="5" class="p-2">
                            <div class="flex flex-wrap items-center gap-1.5">
                                <select id="entourage-coach-select-${m.id}-${field}-table" class="bg-white border border-slate-300 font-bold text-xs text-slate-700 py-1 px-2 rounded-lg">
                                    ${staffSelectOptions(sortedStaff, current ? staffId(current) : '', true)}
                                </select>
                                <button onclick="ajouterCoach('${m.id}','${field}','table')" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold">Assigner</button>
                                ${entourageLicenceChip(current)}
                                ${current ? `<button onclick="retirerCoach('${m.id}','${field}')" class="ml-1 text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg" title="Retirer"><i class="fa-solid fa-xmark text-xs"></i></button>` : ''}
                            </div>
                        </td>
                    </tr>`;

                table += coachRow('Coach principal', 'principal', principal);
                table += coachRow('Coach adjoint', 'adjoint', adjoint);

                const mobileCoach = (label, field, current) => `
                    <div class="bg-white border border-slate-200 rounded-xl p-3 mb-2 space-y-2">
                        <div class="font-bold text-slate-700 text-xs">${label}</div>
                        <div class="flex items-center space-x-2">
                            <select id="entourage-coach-select-${m.id}-${field}-mobile" class="bg-white border border-slate-300 font-bold text-xs text-slate-700 py-1 px-2 rounded-lg flex-1 min-w-0">
                                ${staffSelectOptions(sortedStaff, current ? staffId(current) : '', true)}
                            </select>
                            <button onclick="ajouterCoach('${m.id}','${field}','mobile')" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold shrink-0">OK</button>
                        </div>
                        <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                            <span class="text-[10px] text-slate-500 uppercase font-bold">Licence</span>
                            <div class="flex items-center space-x-1.5">
                                ${entourageLicenceChip(current)}
                                ${current ? `<button onclick="retirerCoach('${m.id}','${field}')" class="text-red-500 hover:bg-red-50 border border-red-200 p-1 rounded-lg" title="Retirer"><i class="fa-solid fa-xmark text-xs"></i></button>` : ''}
                            </div>
                        </div>
                    </div>`;

                mobile += mobileCoach('Coach principal', 'principal', principal);
                mobile += mobileCoach('Coach adjoint', 'adjoint', adjoint);
            }

            table += '<tr class="bg-slate-100 text-slate-700 font-bold text-xs"><td colspan="6" class="p-2 pl-4 uppercase tracking-wider">👥 Dirigeants convoqués</td></tr>';

            table += `
                <tr class="border-b border-slate-100">
                    <td class="p-2 pl-4 font-bold text-slate-700 text-xs">Ajouter</td>
                    <td colspan="5" class="p-2">
                        <div class="flex flex-wrap items-center gap-1.5">
                            <select id="entourage-dirigeant-select-${m.id}-table" class="bg-white border border-slate-300 font-bold text-xs text-slate-700 py-1 px-2 rounded-lg">
                                ${staffSelectOptions(sortedStaff, '', false)}
                            </select>
                            <button onclick="addMatchDirigeant('${m.id}','table')" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold">Ajouter</button>
                        </div>
                    </td>
                </tr>`;

            mobile += `
                <div class="bg-white border border-slate-200 rounded-xl p-3 mb-2 space-y-2">
                    <div class="font-bold text-slate-700 text-xs">Ajouter un dirigeant</div>
                    <div class="flex items-center space-x-2">
                        <select id="entourage-dirigeant-select-${m.id}-mobile" class="bg-white border border-slate-300 font-bold text-xs text-slate-700 py-1 px-2 rounded-lg flex-1 min-w-0">
                            ${staffSelectOptions(sortedStaff, '', false)}
                        </select>
                        <button onclick="addMatchDirigeant('${m.id}','mobile')" class="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[11px] font-bold shrink-0">Ajouter</button>
                    </div>
                </div>`;

            Object.keys(ent.dirigeants).forEach(id => {
                const s = staffByEntourageId(id);
                if (!s) return;
                const d = ent.dirigeants[id] || { role: 'Juge de touche', convoked: true };

                table += `
                    <tr class="border-b border-slate-100 bg-slate-50/30">
                        <td class="p-2 pl-4">
                            <div class="font-bold text-slate-800 text-xs">${s.name}</div>
                            <div class="text-[10px] text-slate-400">${getStaffRole(s)}</div>
                        </td>
                        <td class="p-2">${entourageLicenceChip(s)}</td>
                        <td class="p-2">
                            <select onchange="setMatchDirigeantRole('${m.id}','${id}',this.value)" class="bg-white border border-slate-300 font-bold text-xs text-slate-700 py-1 px-2 rounded-lg">
                                <option value="Juge de touche" ${d.role === 'Juge de touche' ? 'selected' : ''}>🚩 Juge de touche</option>
                                <option value="Délégué" ${d.role === 'Délégué' ? 'selected' : ''}>📋 Délégué</option>
                            </select>
                        </td>
                        <td class="p-2 text-center">
                            <div class="inline-flex rounded-lg border p-0.5 bg-slate-50">
                                <button onclick="setMatchDirigeantStatus('${m.id}','${id}','convoque')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${d.convoked ? 'active-convoke bg-sky-600 text-white' : 'text-slate-600'}">Oui</button>
                                <button onclick="setMatchDirigeantStatus('${m.id}','${id}','non')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${d.convoked ? 'text-slate-600' : 'active-nonconvoke bg-slate-600 text-white'}">Non</button>
                            </div>
                        </td>
                        <td class="p-2 text-center">
                            <button onclick="retirerMatchDirigeant('${m.id}','${id}')" class="text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg" title="Retirer"><i class="fa-solid fa-xmark text-xs"></i></button>
                        </td>
                    </tr>`;

                mobile += `
                    <div class="bg-white border border-slate-200 rounded-xl p-3 mb-2 space-y-2">
                        <div class="flex items-center justify-between">
                            <div>
                                <div class="font-bold text-slate-800 text-xs">${s.name}</div>
                                <div class="text-[10px] text-slate-400">${getStaffRole(s)}</div>
                            </div>
                            <button onclick="retirerMatchDirigeant('${m.id}','${id}')" class="text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg" title="Retirer"><i class="fa-solid fa-xmark text-xs"></i></button>
                        </div>
                        <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                            <span class="text-[10px] text-slate-500 uppercase font-bold">Licence</span>
                            ${entourageLicenceChip(s)}
                        </div>
                        <div class="flex items-center justify-between gap-2">
                            <select onchange="setMatchDirigeantRole('${m.id}','${id}',this.value)" class="bg-white border border-slate-300 font-bold text-xs text-slate-700 py-1 px-2 rounded-lg flex-1">
                                <option value="Juge de touche" ${d.role === 'Juge de touche' ? 'selected' : ''}>🚩 Juge de touche</option>
                                <option value="Délégué" ${d.role === 'Délégué' ? 'selected' : ''}>📋 Délégué</option>
                            </select>
                            <div class="inline-flex rounded-lg border p-0.5 bg-slate-50 shrink-0">
                                <button onclick="setMatchDirigeantStatus('${m.id}','${id}','convoque')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${d.convoked ? 'active-convoke bg-sky-600 text-white' : 'text-slate-600'}">Oui</button>
                                <button onclick="setMatchDirigeantStatus('${m.id}','${id}','non')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${d.convoked ? 'text-slate-600' : 'active-nonconvoke bg-slate-600 text-white'}">Non</button>
                            </div>
                        </div>
                    </div>`;
            });

            return { table, mobile };
        }

        function ajouterCoach(mId, field, suffix) {
            normalizeStaff();
            const m = state.matches[mId];
            if (!m) return;
            const sel = document.getElementById('entourage-coach-select-' + mId + '-' + field + '-' + suffix);
            const val = sel ? sel.value : '';
            if (!val) { showToast('Choisissez un coach dans la liste', 'error'); return; }
            matchEntourageGuard(m);
            if (field === 'adjoint') m.entourage.adjointId = val; else m.entourage.principalId = val;
            saveStateToFirebase();
            renderMatchDetail();
        }

        function retirerCoach(mId, field) {
            const m = state.matches[mId];
            if (!m) return;
            matchEntourageGuard(m);
            if (field === 'adjoint') m.entourage.adjointId = null; else m.entourage.principalId = null;
            saveStateToFirebase();
            renderMatchDetail();
        }

        function addMatchDirigeant(mId, suffix) {
            const m = state.matches[mId];
            if (!m) return;
            const sel = document.getElementById('entourage-dirigeant-select-' + mId + '-' + suffix);
            const val = sel ? sel.value : '';
            if (!val) { showToast('Choisissez un dirigeant dans la liste', 'error'); return; }
            matchEntourageGuard(m);
            m.entourage.dirigeants[val] = { role: 'Juge de touche', convoked: true };
            saveStateToFirebase();
            renderMatchDetail();
        }

        function setMatchDirigeantRole(mId, staffSel, role) {
            const m = state.matches[mId];
            if (!m || !m.entourage || !m.entourage.dirigeants || !m.entourage.dirigeants[staffSel]) return;
            m.entourage.dirigeants[staffSel].role = role;
            saveStateToFirebase();
            renderMatchDetail();
        }

        function setMatchDirigeantStatus(mId, staffSel, status) {
            const m = state.matches[mId];
            if (!m || !m.entourage || !m.entourage.dirigeants || !m.entourage.dirigeants[staffSel]) return;
            m.entourage.dirigeants[staffSel].convoked = status === 'convoque';
            saveStateToFirebase();
            renderMatchDetail();
        }

        function retirerMatchDirigeant(mId, staffSel) {
            const m = state.matches[mId];
            if (!m || !m.entourage || !m.entourage.dirigeants) return;
            delete m.entourage.dirigeants[staffSel];
            saveStateToFirebase();
            renderMatchDetail();
        }

        function buildEntourageWhatsAppText(m) {
            normalizeStaff();
            const ent = matchEntourageGuard(m);
            const parts = [];

            const principal = staffByEntourageId(ent.principalId);
            const adjoint = staffByEntourageId(ent.adjointId);

            if (principal) parts.push('👔 *Entraîneur :* ' + principal.name + (principal.licence && principal.licence !== '-' ? ' (' + principal.licence + ')' : ''));
            if (adjoint) parts.push('👔 *Entraîneur adjoint :* ' + adjoint.name + (adjoint.licence && adjoint.licence !== '-' ? ' (' + adjoint.licence + ')' : ''));

            Object.keys(ent.dirigeants || {}).forEach(id => {
                const s = staffByEntourageId(id);
                const d = ent.dirigeants[id];
                if (!s || !d.convoked) return;
                parts.push('📋 *Dirigeant (' + (d.role || 'Juge de touche') + ') :* ' + s.name);
            });

            if (!parts.length) return '';
            return '\n🎽 *ENCADREMENT*\n' + parts.join('\n');
        }

        function buildFeuilleEntourageHtml(m) {
            normalizeStaff();
            const ent = matchEntourageGuard(m);

            const principal = staffByEntourageId(ent.principalId);
            const adjoint = staffByEntourageId(ent.adjointId);

            const dirList = Object.keys(ent.dirigeants || {})
                .map(id => ({ s: staffByEntourageId(id), d: ent.dirigeants[id] }))
                .filter(x => x.s && x.d.convoked);

            if (!principal && !adjoint && !dirList.length) return '';

            const nomLic = s => (s ? (s.name || '—') + (s.licence && s.licence !== '-' ? ' (' + s.licence + ')' : '') : '—');

            let rows = '';
            if (principal) rows += '<tr><td style="width: 24%; padding: 0.5pt;">Entraîneur principal</td><td style="padding: 0.5pt;">' + nomLic(principal) + '</td></tr>';
            if (adjoint) rows += '<tr><td style="width: 24%; padding: 0.5pt;">Entraîneur adjoint</td><td style="padding: 0.5pt;">' + nomLic(adjoint) + '</td></tr>';
            dirList.forEach(x => rows += '<tr><td style="width: 24%; padding: 0.5pt;">Dirigeant (' + (x.d.role || 'Juge de touche') + ')</td><td style="padding: 0.5pt;">' + nomLic(x.s) + '</td></tr>');

            return `
                <table style="width: 100%; border-collapse: collapse; margin-top: 1pt; font-size: 6pt;">
                    <tr>
                        <td colspan="2" style="background-color: #e8e8e8; font-weight: bold; padding: 0.5pt;">
                            ENCADREMENT & DIRIGEANTS
                        </td>
                    </tr>
                    ${rows}
                </table>`;
        }

        function setFilterCat(cat) {
            currentCatFilter = cat;

            document
                .querySelectorAll('.team-chip')
                .forEach(btn => btn.classList.remove('active'));

            const active =
                document.getElementById(
                    'filter-' + cat
                );

            if (active) {
                active.classList.add('active');

                const row = active.parentElement;

                if (row && row.scrollWidth > row.clientWidth) {
                    const offset =
                        active.getBoundingClientRect().left -
                        row.getBoundingClientRect().left +
                        row.scrollLeft -
                        12;

                    row.scrollLeft = Math.max(0, offset);
                }
            }

            const select = document.getElementById('effectif-team-select');
            if (select) select.value = cat;

            filterPlayers();
        }

        function toggleModal(modalId, show) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            modal.classList.toggle('hidden', !show);
            if (show) {
                modal._previouslyFocused = document.activeElement;
                const focusable = modal.querySelector('button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])');
                if (focusable) focusable.focus();
            } else {
                const el = modal._previouslyFocused;
                if (el && typeof el.focus === 'function') el.focus();
            }
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
            if (!openModals.length) return;
            const openModal = openModals[openModals.length - 1];
            if (openModal.id === 'modal-event') {
                closeEventModal();
            } else if (openModal.id === 'admin-access-modal') {
                toggleAdminModal(false);
            } else {
                toggleModal(openModal.id, false);
            }
        });

        function showToast(message, type = 'success') {
            const existing = document.getElementById('toast-notification');
            if (existing) existing.remove();
            const colors = type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-sky-600';
            const toast = document.createElement('div');
            toast.id = 'toast-notification';
            toast.className = `fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] ${colors} text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 transition-all`;
            toast.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}"></i><span>${message}</span>`;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        window.showToast = showToast;

        


function updateDeadlinePreview() {

    const dateValue =
        document.getElementById('m-date')?.value;

    if (!dateValue) {
        document.getElementById(
            'm-deadline-preview'
        ).innerText = '--';
        return;
    }

    const matchDate = new Date(dateValue);

    const day = matchDate.getDay();

    let deadline = new Date(matchDate);

    // Samedi ou Dimanche
    if (day === 6 || day === 0) {

        while (deadline.getDay() !== 5) {
            deadline.setDate(
                deadline.getDate() - 1
            );
        }

    } else {

        deadline.setDate(
            deadline.getDate() - 1
        );

    }

    const formattedDate =
        deadline.toLocaleDateString('fr-FR');

    document.getElementById(
        'm-deadline-preview'
    ).innerText =
        formattedDate + ' - 18:00';
}

function filterPlayers(query = "") {

    const q =
        query.toLowerCase() ||
        document.getElementById('search-player').value.toLowerCase();

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';

    let playersSource = state.players;

if (role === 'responsable') {

    const allowedTeams = userTeam
        .split(',')
        .map(t => t.trim().toLowerCase());

    playersSource = state.players.filter(
        p =>
            allowedTeams.includes(
                (p.team || p.cat || '').toLowerCase()
            )
    );

} else if (role === 'coach') {

    playersSource = state.players.filter(
        p =>
            (p.team || p.cat || '').toLowerCase() ===
            userTeam.toLowerCase()
    );
}

    const container = document.getElementById('effectif-full-container');
    const cards = Array.from(container.children);

    let visibleCount = 0;

    cards.forEach((card, i) => {

        const player = playersSource[i];

        if (!player) return;

        const matchText =
            player.name.toLowerCase().includes(q) ||
            (player.licence && player.licence.toLowerCase().includes(q));

        const matchCat =
            currentCatFilter === 'all' ||
            player.team === currentCatFilter;

        const visible = matchText && matchCat;

        if (visible) visibleCount++;

        // Une chaîne vide restaure le display défini par la feuille de styles
        card.style.display = visible ? '' : 'none';
    });

    const countEl = document.getElementById('effectif-total-count');
    if (countEl) {
        countEl.textContent = `${visibleCount} joueur${visibleCount > 1 ? 's' : ''}`;
    }
}

function renderTeamFilters() {
    const container = document.getElementById('team-filters');
    if (!container) return;

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || '';

    let teamsToDisplay = Object.entries(state.teams || {});

    // Coach
    if (role === 'coach') {
        teamsToDisplay = teamsToDisplay.filter(
            ([key]) => key === userTeam
        );
    }

    // Responsable
    if (role === 'responsable') {
        const scopes = userTeam
            .split(',')
            .map(t => t.trim());

        teamsToDisplay = teamsToDisplay.filter(
            ([key]) => scopes.includes(key)
        );
    }

    const visibleTeamKeys = new Set(
        teamsToDisplay.map(([key]) => String(key).toLowerCase())
    );

    const totalPlayers = state.players.filter(p =>
        visibleTeamKeys.has(String(p.team || p.cat || '').toLowerCase())
    ).length;

    const countEl = document.getElementById('effectif-total-count');
    if (countEl) {
        countEl.textContent = `${totalPlayers} joueur${totalPlayers > 1 ? 's' : ''}`;
    }

    function getGroup(teamName) {

    const name = teamName.toLowerCase();

    // Féminines
    if (name.includes('fem')) {
        return 'FÉMININES';
    }

    // Seniors
    if (name.includes('senior')) {
        return 'SENIORS';
    }

    // École de foot
    if (
        name === 'u6' ||
        name === 'u7' ||
        name === 'u8' ||
        name === 'u9' ||
        name === 'u10' ||
        name === 'u11'
    ) {
        return 'ÉCOLE DE FOOT';
    }

    // Départemental
    if (
        name.includes('départemental')
    ) {
        return 'JEUNES DÉPARTEMENTAL';
    }

    // Territoire
    if (
        name.includes('territoire') ||
        name === 'u14' ||
        name === 'u15' ||
        name === 'u16' ||
        name === 'u17' ||
        name === 'u18'
    ) {
        return 'JEUNES TERRITOIRE';
    }

    return 'AUTRES';
}
        

    const groups = {
        'FÉMININES': [],
        'SENIORS': [],
        'JEUNES TERRITOIRE': [],
        'JEUNES DÉPARTEMENTAL': [],
        'ÉCOLE DE FOOT': [],
        'AUTRES': []
    };

    teamsToDisplay.forEach(([key, team]) => {
        const count = state.players.filter(
            p => (p.team || '').toLowerCase() === key.toLowerCase()
        ).length;

        groups[getGroup(team.name || key)].push({
            key,
            name: team.name || key,
            count
        });
    });

    let html = `
        <div class="flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto sm:overflow-visible no-scrollbar pb-1 -mb-1">
            <button
                onclick="setFilterCat('all')"
                id="filter-all"
                class="team-chip${currentCatFilter === 'all' ? ' active' : ''}">
                <i class="fa-solid fa-users" aria-hidden="true"></i>
                Toutes
                <span class="count">${totalPlayers}</span>
            </button>
    `;

    Object.entries(groups).forEach(([groupName, teams]) => {

        if (!teams.length) return;

        teams
            .sort((a, b) => {

    const numA = parseInt(a.name.match(/\d+/)?.[0] || 999);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || 999);

    return numA - numB;
})
            .forEach(team => {

                const isActive =
                    String(currentCatFilter).toLowerCase() ===
                    String(team.key).toLowerCase();

                html += `
                    <button
                        onclick="setFilterCat('${team.key}')"
                        id="filter-${team.key}"
                        title="${groupName}"
                        class="team-chip cat-filter-btn${isActive ? ' active' : ''}">

                        ${team.name}

                        <span class="count">
                            ${team.count}
                        </span>

                    </button>
                `;
            });
    });

    html += `</div>`;

    container.innerHTML = html;

    // Garde le filtre actif visible dans la rangée horizontale du mobile
    const row = container.firstElementChild;
    const activeChip = container.querySelector('.team-chip.active');

    if (row && activeChip && row.scrollWidth > row.clientWidth) {
        const offset =
            activeChip.getBoundingClientRect().left -
            row.getBoundingClientRect().left +
            row.scrollLeft -
            12;

        row.scrollLeft = Math.max(0, offset);
    }
}
// --- 4. GESTION DES RÔLES ET PERMISSIONS MISE À JOUR ---
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
function infoChipTone(tone) {
    const tones = {
        sky: 'bg-sky-50 border-sky-200 text-sky-700',
        emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        red: 'bg-red-50 border-red-200 text-red-700',
        slate: 'bg-slate-50 border-slate-200 text-slate-600'
    };
    return tones[tone] || tones.slate;
}

function infoNameChip(name, tone) {
    return `<span class="inline-flex items-center px-2 py-1 rounded-lg border text-[11px] font-bold ${infoChipTone(tone)}">${name}</span>`;
}

// Trie des joueurs par prénom (accents et casse ignorés) et renvoie leurs noms affichés.
// On s'appuie sur les parties du nom pour rester juste quel que soit l'ordre d'affichage
// choisi pour l'équipe (« NOM Prénom » ou « Prénom NOM »).
function infoSortByFirstName(players) {
    const firstNameKey = (p) => {
        const { prenom, nom } = getPlayerNameParts(p);
        return String(prenom || nom || p.name || '');
    };

    return players
        .slice()
        .sort((a, b) =>
            firstNameKey(a).localeCompare(firstNameKey(b), 'fr', { sensitivity: 'base' })
            || String(a.name || '').localeCompare(String(b.name || ''), 'fr', { sensitivity: 'base' })
        )
        .map(p => p.name);
}

function infoNameGroup(title, icon, names, tone) {
    if (!names || !names.length) return '';
    return `
        <div>
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">${icon} ${title} (${names.length})</p>
            <div class="flex flex-wrap gap-1">${names.map(n => infoNameChip(n, tone)).join('')}</div>
        </div>`;
}

function infoStatTile(value, label, tone) {
    const tones = {
        sky: 'bg-sky-50 border-sky-100 text-sky-900',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-900',
        amber: 'bg-amber-50 border-amber-100 text-amber-900',
        red: 'bg-red-50 border-red-100 text-red-900',
        slate: 'bg-slate-50 border-slate-200 text-slate-700'
    };
    return `<div class="rounded-lg border px-1.5 py-2 text-center ${tones[tone] || tones.slate}">
        <div class="text-base font-extrabold leading-none">${value}</div>
        <div class="mt-1 text-[9px] font-bold uppercase tracking-wide opacity-70 leading-tight">${label}</div>
    </div>`;
}

function renderConvocationOverviewCard(m, playerItems, convokedCount, targetConvoked) {
    const convoked = [];
    const indisponibles = [];
    const nonConvoked = [];

    playerItems.forEach(({ p }) => {
        const status = m.convocations[p.id] || 'none';
        if (status === 'convoke') convoked.push(p);
        else if (status === 'indisponible') indisponibles.push(p);
        else if (status === 'nonconvoke') nonConvoked.push(p);
    });

    const target = targetConvoked > 0 ? targetConvoked : 0;
    const pct = target ? Math.min(100, Math.round((convokedCount / target) * 100)) : 0;
    const isOver = convokedCount > target;
    const isUnder = convokedCount < target;
    const barColor = isOver ? 'bg-red-500' : isUnder ? 'bg-amber-500' : 'bg-sky-500';
    const pillClass = isOver ? 'bg-red-100 text-red-700' : isUnder ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-700';
    const pillLabel = isOver ? '⚠️ Trop de convoqués' : isUnder ? '⏳ Incomplet' : '✅ Complet';

    return `
        <div class="flex items-start justify-between gap-2">
            <div>
                <h3 class="text-sm font-extrabold text-slate-800">📋 Convocations</h3>
                <p class="text-[11px] text-slate-500">Répartition de l'effectif pour ce match</p>
            </div>
            <span class="text-[10px] font-extrabold px-2 py-1 rounded-lg whitespace-nowrap ${pillClass}">${pillLabel}</span>
        </div>

        <div class="mt-3 flex items-end justify-between">
            <p class="text-2xl font-extrabold text-slate-800 leading-none">${convokedCount}<span class="text-xs font-bold text-slate-400"> / ${target}</span></p>
            <p class="text-[11px] font-bold text-slate-400">${pct}% de l'objectif</p>
        </div>
        <div class="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full ${barColor} transition-all" style="width:${pct}%"></div>
        </div>

        <div class="mt-3 space-y-2">
            ${convoked.length ? infoNameGroup('Convoqués', '✅', infoSortByFirstName(convoked), 'sky') : '<p class="text-[11px] italic text-slate-400">Aucun joueur convoqué pour l\'instant.</p>'}
            ${infoNameGroup('Indisponibles', '🟠', infoSortByFirstName(indisponibles), 'orange')}
            ${infoNameGroup('Non convoqués', '⚪', infoSortByFirstName(nonConvoked), 'slate')}
        </div>`;
}

function renderCarpoolOverviewCard(summary, m, role) {
    const answered = summary.responses;
    const pct = summary.totalConvoked ? Math.round((answered / summary.totalConvoked) * 100) : 0;
    const barColor = pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-sky-500' : 'bg-amber-500';

    return `
        <div class="flex items-start justify-between gap-2">
            <div>
                <h3 class="text-sm font-extrabold text-slate-800">🚗 Réponses covoiturage</h3>
                <p class="text-[11px] text-slate-500">Réponses des joueurs convoqués</p>
            </div>
            <span class="text-[10px] font-extrabold px-2 py-1 rounded-lg whitespace-nowrap ${summary.closed ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}">${summary.closed ? '🔒 Confirmé' : '⏳ En cours'}</span>
        </div>

        <div class="mt-3 flex items-end justify-between">
            <p class="text-2xl font-extrabold text-slate-800 leading-none">${answered}<span class="text-xs font-bold text-slate-400"> / ${summary.totalConvoked} réponses</span></p>
            <p class="text-[11px] font-bold text-slate-400">${pct}%</p>
        </div>
        <div class="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full ${barColor} transition-all" style="width:${pct}%"></div>
        </div>
        <p class="mt-2 text-[11px] font-bold ${summary.transportClass}">${summary.transportStatus}</p>

        <div class="mt-3 grid grid-cols-3 gap-2">
            ${infoStatTile(summary.drivers, 'Conducteurs', 'sky')}
            ${infoStatTile(summary.passengers, 'Passagers', 'emerald')}
            ${infoStatTile(summary.directs, 'Direct', 'amber')}
            ${infoStatTile(summary.absents, 'Absents', 'red')}
            ${infoStatTile(summary.seats, 'Places', 'sky')}
            ${infoStatTile(summary.pending, 'En attente', 'slate')}
        </div>

        <details class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <summary class="cursor-pointer select-none text-[11px] font-bold text-slate-600">Détail des réponses par joueur</summary>
            <div class="mt-2 space-y-2">
                ${infoNameGroup('Conducteurs', '🚗', summary.driverList, 'sky')}
                ${infoNameGroup('Conducteurs sans place', '🚙', summary.driverNoSeatList, 'slate')}
                ${infoNameGroup('Attribution', '🚗→👤', summary.driverAssignments.map(a => `${a.name} → ${a.passengerNames.length ? a.passengerNames.join(', ') : '—'}`), 'emerald')}
                ${infoNameGroup('À placer', '🚫', summary.toPlaceList, 'red')}
                ${infoNameGroup('Passagers', '👤', summary.passengerList, 'emerald')}
                ${infoNameGroup('Direct', '📍', summary.directList, 'amber')}
                ${infoNameGroup('Absents', '❌', summary.absentList, 'red')}
                ${infoNameGroup('En attente', '⏳', summary.pendingList, 'slate')}
            </div>
        </details>

        ${m.carpoolId ? `
        <div class="mt-3 flex flex-wrap gap-2">
            <button onclick="openCarpoolQR('${m.id}')" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-lg">🏷️ QR & lien</button>
            ${(role === 'coach' || role === 'admin' || role === 'responsable') ? (summary.closed ? `<button onclick="setCarpoolClosed('${m.id}', false)" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg">🔓 Rouvrir</button>` : `<button onclick="setCarpoolClosed('${m.id}', true)" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg"><i class="fa-solid fa-lock mr-1"></i>Clôturer le covoiturage</button>`) : ''}
            <button onclick="copyCarpoolRecap('${m.id}')" class="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg">📤 Récap WhatsApp</button>
        </div>` : ''}
    `;
}

// Affiche (ou masque) le bouton d'ouverture de la page covoiturage publique
// depuis l'en-tête de l'onglet Transport.
function updateTransportCarpoolLink(m) {
    const link = document.getElementById('transport-covoiturage-link');
    if (!link) return;

    if (!m) {
        link.style.display = 'none';
        link.removeAttribute('href');
        return;
    }

    // Certains matchs (anciens ou dupliqués) n'ont pas encore d'identifiant de
    // covoiturage : on en crée un stable et on le sauvegarde pour que la page
    // publique puisse retrouver le match.
    if (!m.carpoolId) {
        m.carpoolId = 'CP_' + String(m.id || Date.now()).replace(/[^A-Za-z0-9_-]/g, '_');
        try { saveStateToFirebase(); } catch (err) { console.error('carpoolId', err); }
    }

    link.href = `covoiturage.html?id=${encodeURIComponent(m.carpoolId)}`;
    link.style.display = 'inline-flex';
}

function renderTransportTab(data) {

    const container =
        document.getElementById(
            'transport-summary-container'
        );

    if (!container) return;

    const respondedCount = data.totalConvoked ? data.totalConvoked - data.pending : 0;
    const responsePct = data.totalConvoked ? Math.round((respondedCount / data.totalConvoked) * 100) : 0;

    container.innerHTML = `

        <div class="bg-white border border-slate-200 rounded-xl p-3 mb-4">

            <div class="flex items-center justify-between text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <span>Réponses covoiturage</span>
                <span>${respondedCount} / ${data.totalConvoked}</span>
            </div>

            <div class="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                <div class="h-full bg-sky-500" style="width:${responsePct}%"></div>
            </div>

            <div class="mt-1 text-[11px] font-bold text-slate-500">
                🚘 ${data.seats} places proposées · ${data.passengers} passager(s)
            </div>

            <div class="mt-1 font-bold ${data.transportClass}">
                ${data.transportStatus}
            </div>

        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">

            <div class="bg-sky-50 p-3 rounded-xl text-center">
                <div class="text-xl font-bold">
                    ${data.drivers}
                </div>
                <div class="text-xs">
                    🚗 Conducteurs
                </div>
            </div>

            <div class="bg-emerald-50 p-3 rounded-xl text-center">
                <div class="text-xl font-bold">
                    ${data.passengers}
                </div>
                <div class="text-xs">
                    👤 Passagers
                </div>
            </div>

            <div class="bg-amber-50 p-3 rounded-xl text-center">
                <div class="text-xl font-bold">
                    ${data.directs}
                </div>
                <div class="text-xs">
                    📍 Direct
                </div>
            </div>

            <div class="bg-red-50 p-3 rounded-xl text-center">
                <div class="text-xl font-bold">
                    ${data.absents}
                </div>
                <div class="text-xs">
                    ❌ Absents
                </div>
            </div>

        </div>

        <div class="grid md:grid-cols-2 gap-3 mb-3">

            <div class="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 mb-1">
                    📍 En direct (${data.directs})
                </p>
                <p class="text-sm font-semibold text-amber-900">
                    ${data.directList.join(', ') || 'Aucun'}
                </p>
            </div>

            <div class="bg-red-50 border border-red-200 rounded-xl p-3">
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-red-700 mb-1">
                    ❌ Absents (${data.absents})
                </p>
                <p class="text-sm font-semibold text-red-800">
                    ${data.absentList.join(', ') || 'Aucun'}
                </p>
            </div>

        </div>

        ${data.driverNoSeatList.length ? `
        <div class="mb-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                🚙 Conducteur(s) sans place (${data.driverNoSeatList.length})
            </p>
            <p class="text-sm font-semibold text-slate-600">${data.driverNoSeatList.join(', ')}</p>
        </div>` : ''}

        <div class="mt-1">

            <h3 class="font-bold mb-2 text-slate-700">
                🚗 Les voitures
            </h3>

            ${data.driverAssignments.length ? data.driverAssignments.map(a => {

                const filled = a.passengerNames.length;
                const dots = Array.from({ length: a.seats }).map((_, i) =>
                    `<span class="inline-block w-3.5 h-3.5 rounded-full ${i < filled ? 'bg-sky-500' : 'bg-slate-200'}"></span>`
                ).join('');

                return `
                <div class="bg-white border border-sky-200 rounded-xl p-3 mb-2">

                    <div class="flex items-center justify-between gap-2">
                        <p class="font-bold text-slate-800 text-sm">${a.name}</p>
                        <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full ${filled < a.seats ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">
                            ${filled}/${a.seats} places
                        </span>
                    </div>

                    <div class="mt-1.5 flex items-center gap-1">${dots}</div>

                    <div class="mt-1.5 flex flex-wrap gap-1">
                        ${a.passengerNames.map((pn, i) => `
                            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                                ${pn}
                                <button onclick="carpoolRemovePassenger('${data.matchId}','${a.id}','${a.passengerIds[i]}')" class="text-emerald-600 hover:text-red-600" title="Retirer">✕</button>
                            </span>
                        `).join('')}
                        ${filled ? '' : '<span class="text-[11px] text-slate-400">Personne pour le moment</span>'}
                    </div>

                    <select
                        onchange="carpoolAssignPassenger('${data.matchId}','${a.id}', this.value); this.value=''"
                        class="mt-2 w-full p-1.5 text-xs border rounded-lg bg-white">
                        <option value="">
                            ➕ Ajouter un passager (${filled}/${a.seats})
                        </option>
                        ${data.availablePassengers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>

                </div>`;
            }).join('') : '<p class="text-xs text-slate-400">Aucun conducteur avec places pour le moment.</p>'}

            ${data.toPlaceList.length ? `
            <div class="mt-2 bg-red-50 border border-red-200 rounded-xl p-3">
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-red-700 mb-1">
                    🚫 Sans voiture (${data.toPlaceList.length})
                </p>
                <p class="text-sm font-semibold text-red-900">${data.toPlaceList.join(', ')}</p>
            </div>` : '<div class="mt-2 text-xs text-slate-400">Tous les passagers sont placés ✅</div>'}

        </div>

        <div class="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">

            <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                ⏳ Sans réponse (${data.pendingList.length})
            </p>

            <p class="text-sm font-semibold text-slate-600">
                ${data.pendingList.join(', ') || 'Tout le monde a répondu ✅'}
            </p>

        </div>

    `;
}

function carpoolAssignPassenger(matchId, driverId, passengerId) {

    if (!passengerId) return;

    const match = state.matches[matchId];

    if (!match) return;

    const responsesMap =
        state.carpoolResponses[match.carpoolId] || {};

    const driverResponse = responsesMap[driverId];

    if (
        !driverResponse ||
        driverResponse.status !== 'driver' ||
        (driverResponse.seats || 0) <= 0
    ) {
        showToast('Ce conducteur n\'a pas de place disponible');
        return;
    }

    const passenger = state.players.find(p => p.id === passengerId);

    if (!passenger) return;

    const current = Array.isArray(driverResponse.passengers)
        ? driverResponse.passengers.slice()
        : [];

    if (current.includes(passengerId)) {
        showToast('Ce passager est déjà dans ce véhicule');
        return;
    }

    if (current.length >= (driverResponse.seats || 0)) {

        showToast('Plus de place dans ce véhicule');
        return;

    }

    Object.entries(responsesMap).forEach(([id, r]) => {

        if (r.status === 'driver' && Array.isArray(r.passengers)) {

            r.passengers = r.passengers.filter(pid => pid !== passengerId);

        }

    });

    current.push(passengerId);
    driverResponse.passengers = current;

    state.carpoolResponses[match.carpoolId] = responsesMap;

    saveStateToFirebase();
    showToast(`${passenger.name} placé ✅`);
    renderMatchDetail();

}

function carpoolRemovePassenger(matchId, driverId, passengerId) {

    const match = state.matches[matchId];

    if (!match) return;

    const responsesMap =
        state.carpoolResponses[match.carpoolId] || {};

    const driverResponse = responsesMap[driverId];

    if (!driverResponse || !Array.isArray(driverResponse.passengers)) return;

    driverResponse.passengers = driverResponse.passengers.filter(pid => pid !== passengerId);

    state.carpoolResponses[match.carpoolId] = responsesMap;

    saveStateToFirebase();
    showToast('Passager retiré');
    renderMatchDetail();

}

function setCarpoolClosed(matchId, closed) {

    const match = state.matches[matchId];

    if (!match) return;

    match.carpoolClosed = !!closed;

    saveStateToFirebase();

    showToast(
        closed
            ? 'Covoiturage clôturé : la page publique passe en lecture seule 🔒'
            : 'Covoiturage rouvert 🔓'
    );

    renderMatchDetail();

}

function buildCarpoolRecapText(matchId) {

    const match = state.matches[matchId];

    if (!match) return '';

    const matchPlayers = getMatchConvoked(match);

    const s = buildCarpoolSummary(match, matchPlayers);

    const matchLabel =
        (match.opponent || 'Match') +
        (match.date ? ` (${match.date})` : '');

    const rows = [];
    rows.push(`🚗 Covoiturage — ${matchLabel}`);
    rows.push('');
    rows.push(`✅ Réponses : ${s.responses}/${s.totalConvoked}`);
    rows.push(`🚗 Conducteurs : ${s.drivers}  🚘 Places : ${s.seats}`);
    rows.push(`👤 Passagers : ${s.passengers}  📍 Direct : ${s.directs}  ❌ Absents : ${s.absents}`);
    rows.push(s.pending > 0 ? `⏳ En attente : ${s.pending}` : '⏳ Tout le monde a répondu ✅');
    rows.push('');

    if (s.driverAssignments.length) {

        rows.push('👤 → 🚗 Attribution :');

        s.driverAssignments.forEach(a => {
            rows.push(`• ${a.name} → ${a.passengerNames.length ? a.passengerNames.join(', ') : 'pas encore de passager'}`);
        });

        if (s.toPlaceList.length) {

            rows.push('');
            rows.push(`🚫 À placer : ${s.toPlaceList.join(', ')}`);

        }

    }

    if (s.closed) {
        rows.push('');
        rows.push('🔒 Covoiturage confirmé par le coach');
    }

    if (s.transportStatus && !s.closed) {
        rows.push('');
        rows.push(s.transportStatus);
    }

    if (match.carpoolId) {

        rows.push('');
        rows.push(`🔗 Répondre : https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${match.carpoolId}`);

    }

    return rows.join('\n');

}

function copyCarpoolRecap(matchId) {

    const text = buildCarpoolRecapText(matchId);

    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(text)
            .then(() => showToast('Récap copié 📋 à coller dans WhatsApp'))
            .catch(() => fallbackCopy(text));

    } else {

        fallbackCopy(text);

    }

}

function fallbackCopy(text) {

    const ta = document.createElement('textarea');

    ta.value = text;

    ta.style.position = 'fixed';

    ta.style.opacity = '0';

    document.body.appendChild(ta);

    ta.select();

    try {

        document.execCommand('copy');

        showToast('Récap copié 📋 à coller dans WhatsApp');

    } catch (e) {

        showToast('Impossible de copier automatiquement');

    }

    document.body.removeChild(ta);

}

function openCarpoolQR(matchId) {

    const match = state.matches[matchId];

    if (!match || !match.carpoolId) return;

    const url = `https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${match.carpoolId}`;

    window.__carpoolUrl = url;

    const urlEl = document.getElementById('carpool-qr-url');

    if (urlEl) urlEl.textContent = url;

    const canvas = document.getElementById('carpool-qr-canvas');

    if (canvas) {

        canvas.innerHTML = '';

        if (typeof QRCode !== 'undefined') {

            new QRCode(canvas, {
                text: url,
                width: 180,
                height: 180
            });

        } else {

            canvas.innerHTML = '<span class="text-xs text-slate-500">QR Code : le lien reste disponible ci-dessus.</span>';

        }

    }

    toggleModal('modal-carpool-qr', true);

}

function copyCarpoolUrl() {

    let url = window.__carpoolUrl || '';

    if (!url) {

        const match = state.matches[state.selectedMatchId];

        url = match?.carpoolId ? `https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${match.carpoolId}` : '';

    }

    if (!url) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {

        navigator.clipboard.writeText(url)
            .then(() => showToast('Lien copié 📋'))
            .catch(() => fallbackCopy(url));

    } else {

        fallbackCopy(url);

    }

}

window.carpoolAssignPassenger = carpoolAssignPassenger;
window.carpoolRemovePassenger = carpoolRemovePassenger;
window.setCarpoolClosed = setCarpoolClosed;
window.buildCarpoolRecapText = buildCarpoolRecapText;
window.copyCarpoolRecap = copyCarpoolRecap;
window.openCarpoolQR = openCarpoolQR;
window.copyCarpoolUrl = copyCarpoolUrl;
window.buildCarpoolSummary = buildCarpoolSummary;
window.openMatchWorkspace = openMatchWorkspace;

function openMatchWorkspace(matchId) {

    state.selectedMatchId = matchId;

    switchMatchSubTab('infos');

    renderMatchDetail();

}

function renderMatchSummary(match) {

    const container =
        document.getElementById(
            'match-bilan-summary'
        );

    if (!container || !match) return;

    const score =
        (
            match.scoreHome !== undefined &&
            match.scoreHome !== ""
        )
        ? `${match.scoreHome} - ${match.scoreAway}`
        : "Match non joué";

    let scorers = [];
    let assists = [];

    Object.entries(
        match.matchStats || {}
    ).forEach(([playerId, stat]) => {

        const player =
            state.players.find(
                p => p.id === playerId
            );

        const name =
            player?.name || playerId;

        if ((stat.goals || 0) > 0) {
            scorers.push(
                `${name} (${stat.goals})`
            );
        }

        if ((stat.assists || 0) > 0) {
            assists.push(
                `${name} (${stat.assists})`
            );
        }

    });

    container.innerHTML = `
        <div class="space-y-4">

            <div>
                <span class="font-bold">
                    ⚽ Score :
                </span>
                ${score}
            </div>

            <div>
                <span class="font-bold">
                    ⚽ Buteurs :
                </span>

                ${scorers.length
                    ? scorers.join(', ')
                    : 'Aucun'}
            </div>

            <div>
                <span class="font-bold">
                    🎯 Passeurs :
                </span>

                ${assists.length
                    ? assists.join(', ')
                    : 'Aucun'}
            </div>

            <div>
                <span class="font-bold">
                    📝 Débrief :
                </span>

                <div class="mt-2 text-sm">
                    ${match.debrief || 'Aucun commentaire'}
                </div>
            </div>

            <div class="pt-3 border-t">
                <button
                    onclick="openMatchBilanModal('${match.id}')"
                    class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-xs font-bold">

                    Modifier le bilan

                </button>
            </div>

        </div>
    `;
}
let calendarDate = new Date();

function renderCalendar() {

    populateCalendarTeamFilter();

    const selectedTeam =
        document.getElementById(
            'calendar-team-filter'
        )?.value || "all";

    const title =
        document.getElementById(
            'calendar-month-title'
        );

    if (!title) return;


    title.innerText =
        calendarDate.toLocaleDateString(
            'fr-FR',
            {
                month: 'long',
                year: 'numeric'
            }
        );

    const grid =
        document.getElementById(
            'calendar-grid'
        );

    if (!grid) return;

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();

    const firstDay =
        new Date(year, month, 1);

    const lastDay =
        new Date(year, month + 1, 0);

    let html = `

    <div class="grid grid-cols-7 gap-1 mb-2 text-center font-bold text-xs">

        <div>Lun</div>
        <div>Mar</div>
        <div>Mer</div>
        <div>Jeu</div>
        <div>Ven</div>
        <div>Sam</div>
        <div>Dim</div>

    </div>

    <div class="grid grid-cols-7 gap-1">

    `;

    let startDay =
        (firstDay.getDay() + 6) % 7;

    for(let i = 0; i < startDay; i++) {

        html += `
            <div class="h-24"></div>
        `;

    }

    for(let d = 1; d <= lastDay.getDate(); d++) {

    const currentDate =
        `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const matches =
    Object.values(state.matches || {})
    .filter(m => {

        if (m.date !== currentDate)
            return false;

        if (
            selectedTeam !== "all" &&
            m.team !== selectedTeam
        )
            return false;

        return true;

    });

        const events =
    Object.values(state.events || {})
    .filter(e => {

        if (e.date !== currentDate)
            return false;

        if (selectedTeam !== "all") {

            if (
                !e.teams ||
                (
                    !e.teams.includes("all") &&
                    !e.teams.includes(selectedTeam)
                )
            ) {
                return false;
            }

        }

        return true;

    });

    const trainings =
    Object.values(state.trainings || {})
    .filter(t => {

        if (t.date !== currentDate)
            return false;

        if (
            selectedTeam !== "all" &&
            t.team !== selectedTeam
        )
            return false;

        return true;

    });

    html += `

    <div
    onclick="showEventsForDate('${currentDate}')"
    class="h-24 border rounded-lg p-1 bg-white hover:bg-sky-50 cursor-pointer overflow-hidden">

        <div class="font-bold text-xs mb-1">
            ${d}
        </div>

        ${matches.map(match => `
            <div class="bg-blue-500 text-white text-[10px] rounded px-1 mb-1 truncate">
                ⚽ ${match.opponent}
            </div>
        `).join('')}

        
        ${trainings.map(training => `
            <div class="bg-emerald-500 text-white text-[10px] rounded px-1 mb-1 truncate">
                🏃 ${training.heure || ''}
            </div>
        `).join('')}

        ${events.map(event => {

    let color = "bg-purple-500";
    let icon = "👥";

    if(event.type === "tournament") {

        color = "bg-orange-500";
        icon = "🏆";

    }

    if(event.type === "club") {

        color = "bg-pink-500";
        icon = "🎉";

    }

    return `
        <div class="${color} text-white text-[10px] rounded px-1 mb-1 truncate">
            ${icon} ${event.title}
        </div>
    `;

}).join('')}

    </div>

    `;
}

    html += `
    </div>
    `;

    grid.innerHTML = html;
}

function previousMonth() {

    calendarDate.setMonth(
        calendarDate.getMonth() - 1
    );

    renderCalendar();
}

function nextMonth() {

    calendarDate.setMonth(
        calendarDate.getMonth() + 1
    );

    renderCalendar();
}
function showEventsForDate(date) {

    const container =
        document.getElementById(
            'calendar-events-list'
        );

    const selectedTeam =
    document.getElementById(
        'calendar-team-filter'
    )?.value || "all";

const matches =
    Object.values(state.matches || {})
    .filter(m => {

        if (m.date !== date)
            return false;

        if (
            selectedTeam !== "all" &&
            m.team !== selectedTeam
        )
            return false;

return true;

    });


    const trainings =
    Object.values(state.trainings || {})
    .filter(t => {

        if (t.date !== date)
            return false;

        if (
            selectedTeam !== "all" &&
            t.team !== selectedTeam
        )
            return false;

        return true;

    });

        const events =
    Object.values(state.events || {})
    .filter(e => {

        if (e.date !== date)
            return false;

        if (selectedTeam !== "all") {

            if (
                !e.teams ||
                (
                    !e.teams.includes("all") &&
                    !e.teams.includes(selectedTeam)
                )
            ) {
                return false;
            }

        }

        return true;

    });

    let html = `
        <div class="font-bold text-sm mb-3">
            📅 ${date}
        </div>
    `;

    matches.forEach(match => {

        html += `
            <div class="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-2">

                <div class="font-bold text-blue-800">
                    ⚽ ${match.opponent}
                </div>

                <div class="text-xs text-slate-600">
                    ${match.heure || '--'}
                </div>

              <div class="mt-2">
    ${
        getTeamColorClasses(match.team).badge
            ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${getTeamColorClasses(match.team).badge}">
                ${state.teams?.[match.team]?.name || match.team}
              </span>`
            : ''
    }
</div>  

            </div>
        `;

    });

    trainings.forEach(training => {

        html += `
            <div class="
    ${getTeamColorClasses(training.team).bg}
    border
    ${getTeamColorClasses(training.team).border}
    border-l-4
    p-3
    rounded-lg
    mb-2
">

                <div class="flex items-center gap-2 flex-wrap">

                    <div class="font-bold">
                        ${training.title || ''}
                    </div>

                <div class="text-xs text-slate-600">
                    ${training.heure || '--'}
                </div>

                <div class="text-xs text-slate-500">
                    ${training.theme || ''}
                </div>

             <div class="mt-2">

    <span class="
    px-3
    py-1
    rounded-full
    text-xs
    font-bold
    ${getTeamColorClasses(training.team).badge}
">
    ⚽ ${state.teams?.[training.team]?.name || training.team}
</span>

            </div>

            </div>
        `;

    });

  
events.forEach(event => {

    let icon = "👥";
    let bgClass = "bg-purple-50 border-purple-200";
    let textClass = "text-purple-800";

    if(event.type === "tournament") {

        icon = "🏆";
        bgClass = "bg-orange-50 border-orange-200";
        textClass = "text-orange-800";

    }

    if(event.type === "club") {

        icon = "🎉";
        bgClass = "bg-pink-50 border-pink-200";
        textClass = "text-pink-800";

    }

    html += `
        <div class="${bgClass} border p-3 rounded-lg mb-2">

            <div class="flex justify-between items-start">

    <div class="font-bold ${textClass}">
        ${icon} ${event.title}
    </div>

    <div class="flex gap-2">

    <button
        onclick="openEventModal('${event.id}')"
        class="text-sky-600 hover:text-sky-800">

        ✏️

    </button>

    <button
        onclick="deleteEvent('${event.id}')"
        class="text-red-600 hover:text-red-800">

        🗑️

    </button>

</div>

</div>

            <div class="text-xs text-slate-600">
                ${event.heure || ''}
            </div>

            <div class="text-xs text-slate-500">
                ${event.lieu || ''}
            </div>

            <div class="mt-2">
    ${event.teams?.join(" • ") || ""}

</div>

        </div>
    `;

});

  if (
    matches.length === 0 &&
    trainings.length === 0 &&
    events.length === 0
) {

        html += `
            <div class="text-slate-400 italic">
                Aucun événement
            </div>
        `;

    }
    container.innerHTML = html;
}
function openEventModal(eventId = null) {

    populateEventTeams();

    document
        .getElementById('modal-event')
        .classList
        .remove('hidden');

    document.getElementById('modal-event')._previouslyFocused =
        document.activeElement;

    const firstField =
        document.querySelector('#modal-event input, #modal-event select, #modal-event button');
    if (firstField) firstField.focus();

    if (!eventId) {

        document.getElementById('e-id').value = '';

        return;

    }

    const event =
        state.events[eventId];

    if (!event) return;

    document.getElementById('e-id').value =
        event.id;

    document.getElementById('e-type').value =
        event.type || "meeting";

    document.getElementById('e-title').value =
        event.title || '';

    document.getElementById('e-date').value =
        event.date || '';

    document.getElementById('e-heure').value =
        event.heure || '';

    document.getElementById('e-lieu').value =
        event.lieu || '';

        // Remise à zéro
document.getElementById('e-team-all').checked = false;

document
    .querySelectorAll('.event-team-checkbox')
    .forEach(cb => cb.checked = false);

// Rechargement des équipes enregistrées
if (event.teams) {

    if (event.teams.includes("all")) {

        document.getElementById(
            'e-team-all'
        ).checked = true;

    }

    document
        .querySelectorAll('.event-team-checkbox')
        .forEach(cb => {

            if (
                event.teams.includes(cb.value)
            ) {

                cb.checked = true;

            }

        });

}

}

function closeEventModal() {

    const modal =
        document
        .getElementById('modal-event');

    if (!modal) return;

    modal.classList.add('hidden');

    const el = modal._previouslyFocused;
    if (el && typeof el.focus === 'function') el.focus();

}

function saveEvent() {

    const existingId =
    document.getElementById('e-id').value;

const id =
    existingId || ('EVT_' + Date.now());

        const allTeams =
    document.getElementById(
        'e-team-all'
    ).checked;

let selectedTeams = [];

if (allTeams) {

    selectedTeams = ["all"];

}
else {

    selectedTeams =
        Array.from(
            document.querySelectorAll(
                '.event-team-checkbox:checked'
            )
        )
        .map(cb => cb.value);

}

    state.events[id] = {

        id: id,

        type:
            document.getElementById('e-type').value,

            teams: selectedTeams,

        title:
            document.getElementById('e-title').value,

        date:
            document.getElementById('e-date').value,

        heure:
            document.getElementById('e-heure').value,

        lieu:
            document.getElementById('e-lieu').value

    };

    saveStateToFirebase();

    renderCalendar();

    closeEventModal();

    showToast('Évènement créé');

}

function generateWeeklyPlanning() {

    const today = new Date();

    const selectedTeam =
    document.getElementById(
        'calendar-team-filter'
    )?.value || "all";

    const start = new Date(today);

    start.setDate(
        today.getDate() - today.getDay() + 1
    );

    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setDate(
        start.getDate() + 6
    );

    end.setHours(23, 59, 59, 999);

const teamLabel =
    selectedTeam === "all"
        ? "TOUTES ÉQUIPES"
        : (
            (state.teams?.[selectedTeam]?.name ||
            selectedTeam).toUpperCase()
        );

    const cap = (str) =>
        str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

    const teamName = (team) =>
        state.teams?.[team]?.name || team || '';

    const dayNum = (d) => d.getDate();

    const monthUp = (d) =>
        d.toLocaleDateString('fr-FR', { month: 'long' }).toUpperCase();

    const accents = {
        'Coupe': { emoji: '🏆', week: 'SEMAINE DE COUPE', phrase: 'Go pour la coupe !' },
        'Championnat': { emoji: '🏅', week: 'SEMAINE CHAMPIONNAT', phrase: 'Retour au championnat !' },
        'Amical': { emoji: '🤝', week: 'SEMAINE AMICAL', phrase: 'Match amical' }
    };

    const weekTypes = [];

    Object.values(state.matches || {})
        .forEach(match => {

            if (!match.date || !match.type) return;

            if (
    selectedTeam !== "all" &&
    match.team !== selectedTeam
) {
    return;
}

            const d =
                new Date(
                    match.date + "T12:00:00"
                );

            if (
                d >= start &&
                d <= end
            ) {

                if (weekTypes.indexOf(match.type) === -1) {
                    weekTypes.push(match.type);
                }

            }

        });

    weekTypes.sort();

    const matchBanner =
        weekTypes.length === 1
            ? `${accents[weekTypes[0]]?.emoji || '⚽'} ${accents[weekTypes[0]]?.week || `SEMAINE ${weekTypes[0].toUpperCase()}`}`
            : weekTypes.length > 1
                ? `📌 SEMAINE MIXTE : ${weekTypes.join(' + ').toUpperCase()}`
                : '';

let text =
`👋 Bonjour à tous !

${matchBanner ? `*${matchBanner}*\n\n` : ''}🔵⚪ RANGUEIL FC — ${teamLabel} ⚪🔵

📅 SEMAINE DU ${dayNum(start)} AU ${dayNum(end)} ${monthUp(end)}

`;

    const items = [];

    const matchLocation = (m) => {
        const loc = (m.location || '').trim();
        if (!loc) return '';
        return ` 📍 ${/domicile|home/i.test(loc) ? 'Domicile' : cap(loc)}`;
    };

    Object.values(state.matches || {})
        .forEach(match => {

            if (!match.date) return;

            if (
    selectedTeam !== "all" &&
    match.team !== selectedTeam
) {
    return;
}

            const d =
                new Date(
                    match.date + "T12:00:00"
                );

            if (
                d >= start &&
                d <= end
            ) {

                const teamRef =
                    selectedTeam === "all" && teamName(match.team)
                        ? ` (match ${teamName(match.team)})`
                        : '';

                const parts = [`🆚 *${match.opponent}*${teamRef}`];

                const accents = {
                    'Coupe': { emoji: '🏆', phrase: 'Go pour la coupe !' },
                    'Championnat': { emoji: '🏅', phrase: 'Retour au championnat !' },
                    'Amical': { emoji: '🤝', phrase: 'Match amical' }
                };

                const accent = match.type ? accents[match.type] : null;

                if (accent) parts.push(`${accent.emoji} *${match.type}*`);
                else if (match.type) parts.push(`*${match.type}*`);

                if (match.heure) parts.push(match.heure);

                const loc = matchLocation(match);

                if (loc) parts.push(loc.trim());

                items.push({
                    date: match.date,
                    message: parts.join(' · ') + (accent ? `\n_${accent.phrase}_` : '')
                });

            }

        });

    Object.values(state.trainings || {})
        .forEach(training => {

            if (!training.date) return;

            if (
    selectedTeam !== "all" &&
    training.team !== selectedTeam
) {
    return;
}

            const d =
                new Date(
                    training.date + "T12:00:00"
                );

            if (
                d >= start &&
                d <= end
            ) {

                const lieu =
                    (training.lieu || '').trim()
                        ? ` 📍 ${training.lieu.trim()}`
                        : '';

                items.push({
                    date: training.date,
                    message:
`🏃 ${training.title || "Entraînement"} · ${training.heure || "18:00"} – 20:00${lieu}`
                });

            }

        });

    Object.values(state.events || {})
        .forEach(event => {

            if (!event.date) return;

            if (selectedTeam !== "all") {

    if (
        !event.teams ||
        (
            !event.teams.includes("all") &&
            !event.teams.includes(selectedTeam)
        )
    ) {
        return;
    }

}

            const d =
                new Date(
                    event.date + "T12:00:00"
                );

            if (
                d >= start &&
                d <= end
            ) {

                const lieu =
                    (event.lieu || '').trim()
                        ? ` 📍 ${event.lieu.trim()}`
                        : '';

                const parts = [`👥 ${event.title}`];

                if (event.heure) parts.push(event.heure);

                if (lieu) parts.push(lieu.trim());

                items.push({
                    date: event.date,
                    message: parts.join(' · ')
                });

            }

        });

    items.sort((a,b) =>
        a.date.localeCompare(b.date)
    );

    let currentDate = "";

    items.forEach(item => {

        const d =
            new Date(item.date + "T12:00:00");

        const dateFr =
            cap(
                d.toLocaleDateString(
                    "fr-FR",
                    {
                        weekday: "long"
                    }
                )
            ) + " " + dayNum(d);

        if (currentDate !== dateFr) {

            if (currentDate !== "") text += "\n";

            text += `🗓 *${dateFr}*\n`;

            currentDate = dateFr;

        }

        text += `${item.message}\n`;

    });

text += `
💙 Bonne semaine à tous !
`;
    navigator.clipboard
        .writeText(text)
        .then(() => {

            showToast(
                "Planning copié dans le presse-papiers"
            );

        });

}

let calendarTeamDefaultedFor = null;

function getDefaultCalendarTeam() {

    const userTeam =
        window.currentUserTeam || 'all';

    if (userTeam === 'all') return 'all';

    const scopes =
        String(userTeam)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

    for (const scope of scopes) {

        if (
            state.teams &&
            state.teams[scope]
        ) {
            return scope;
        }

    }

    return 'all';

}

function populateCalendarTeamFilter() {

    const select =
        document.getElementById(
            'calendar-team-filter'
        );

    if (!select) return;

    const hasTeams =
        state.teams &&
        Object.keys(state.teams).length > 0;

    const userTeam =
        window.currentUserTeam || 'all';

    let current;

    if (
        hasTeams &&
        calendarTeamDefaultedFor !== userTeam
    ) {

        current = getDefaultCalendarTeam();

        calendarTeamDefaultedFor = userTeam;

    } else {

        current =
            select.value ||
            getDefaultCalendarTeam();

    }

    select.innerHTML = `
        <option value="all">
            🌍 Toutes les équipes
        </option>
    `;

    Object.entries(state.teams || {})
        .forEach(([key, team]) => {

            select.innerHTML += `
                <option value="${key}">
                    ${team.name}
                </option>
            `;

        });

    select.value = current;

}
function populateEventTeams() {

    const container =
        document.getElementById(
            'event-teams-container'
        );

    if (!container) return;

    container.innerHTML = '';

    Object.entries(state.teams || {})
        .forEach(([key, team]) => {

            container.innerHTML += `

                <label class="flex items-center gap-2">

                    <input
                        type="checkbox"
                        class="event-team-checkbox"
                        value="${key}">

                    ${team.name}

                </label>

            `;

        });

}
function deleteEvent(eventId) {

    if (
        !confirm(
            "Supprimer cet évènement ?"
        )
    ) {
        return;
    }

    delete state.events[eventId];

    saveStateToFirebase();

    renderCalendar();

    const selectedDate =
        document.getElementById(
            'calendar-events-list'
        );

    showToast(
        "Évènement supprimé"
    );

}
function addFunctionBlock() {

    const template =
        document.getElementById(
            "function-template"
        );

    const container =
        document.getElementById(
            "functions-container"
        );

    if (!template || !container) {
        return;
    }

    const clone =
        template.content.cloneNode(true);

    const block =
        clone.querySelector(
            ".function-block"
        );

    const select =
        clone.querySelector(
            ".account-function"
        );

        const fonctionsSansEquipe = [
    "Président",
    "Vice-président",
    "Secrétaire Général",
    "Secrétaire",
    "Trésorier",
    "Trésorier adjoint",
    "Gestionnaire des accès",
    "Administrateur système",
    "Administrateur adjoint"
];

select.addEventListener("change", () => {

    const equipesBloc =
        clone.querySelector(".scope-container").parentElement;

    equipesBloc.style.display =
        fonctionsSansEquipe.includes(select.value)
            ? "none"
            : "block";
});

    const scopeContainer =
        clone.querySelector(
            ".scope-container"
        );

const functions = [

    // Administration
    "Super Administrateur",
    "Administrateur système",
    "Administrateur adjoint",
    "Gestionnaire des accès",
    "Correspondant Footclubs",

    // Direction
    "Président",
    "Vice-président",
    "Secrétaire Général",
    "Secrétaire",
    "Trésorier",
    "Trésorier adjoint",

    // Pôle sportif
    "Directeur Sportif",
    "Responsable Technique",
    "Responsable Catégorie",
    "Responsable École de Foot",
    "Responsable Jeunes",
    "Responsable Seniors",
    "Responsable Féminines",
    "Responsable Arbitrage",
    "Responsable Gardiens",

    // Encadrement
    "Éducateur principal",
    "Éducateur adjoint",
    "Coach Principal",
    "Coach Adjoint",
    "Dirigeant d'équipe",
    "Préparateur Physique",
    "Analyste Vidéo",
    "Référent Parents",

    // Arbitrage
    "Arbitre Officiel",
    "Arbitre Bénévole",
    "Délégué Match",

    // Santé
    "Médecin",
    "Kinésithérapeute",
    "Référent Santé",

    // Logistique
    "Responsable Équipements",
    "Responsable Terrains",
    "Responsable Tournois",
    "Responsable Transport",
    "Responsable Buvette",
    "Responsable Manifetations",
    "Intendant",

    // Communication
    "Responsable Communication",
    "Community Manager",
    "Photographe",
    "Responsable Réseaux Sociaux",
    "Responsable Partenaires",

    // Référents FFF
    "Référent PEF",
    "Référent Féminines",
    "Référent Handicap",
    "Référent Protection des Mineurs",

    // Autres
    "Parent"
];

    select.innerHTML =
        functions.map(f =>
            `<option value="${f}">
                ${f}
            </option>`
        ).join('');

    Object.entries(state.teams || {})
        .forEach(([key, team]) => {

            scopeContainer.innerHTML += `
                <label
                    class="flex items-center gap-2 text-xs mb-1">

                    <input
                        type="checkbox"
                        class="scope-checkbox"
                        value="${key}">

                    ${team.name}

                </label>
            `;

        });

    block.insertAdjacentHTML(
        "beforeend",
        `
        <div class="mt-3 text-right">

            <button
                type="button"
                class="text-red-600 text-xs font-bold remove-function-btn">

                🗑 Supprimer

            </button>

        </div>
        `
    );

    block
        .querySelector(
            ".remove-function-btn"
        )
        .addEventListener(
            "click",
            () => block.remove()
        );

    container.appendChild(block);

}

function addFunctionBlockWithData(functionData) {

    addFunctionBlock();

    const blocks =
        document.querySelectorAll(
            ".function-block"
        );

    const block =
        blocks[blocks.length - 1];

    if (!block) return;

    const select =
        block.querySelector(
            ".account-function"
        );

    if (select) {
        select.value =
            functionData.functionName || "";
    }

    const scopes =
        functionData.scopes || [];

    block
        .querySelectorAll(
            ".scope-checkbox"
        )
        .forEach(cb => {

            cb.checked =
                scopes.includes(
                    cb.value
                );

        });

}

function collectFunctions() {

    const functions = [];

    document
        .querySelectorAll('.function-block')
        .forEach(block => {

            const functionName =
                block.querySelector(
                    '.account-function'
                )?.value || '';

            const scopes = [];

            block
                .querySelectorAll(
                    '.scope-checkbox:checked'
                )
                .forEach(cb => {
                    scopes.push(cb.value);
                });

            functions.push({
                functionName,
                scopes
            });

        });

    return functions;

}


function openAdminModule(module) {

    const container =
        document.getElementById(
            "admin-module-container"
        );

    if (!container) return;

    container.classList.remove("hidden");

    if (module === "access") {

  renderAdminAccounts();  
  } 
  
  if (module === "teams") {

    renderAdminTeamsModule();

}

if (module === "fff") {

    renderAdminFFFModule();

    if (!window.__fffCalendar) refreshFFFCompetitions();

}
}

function renderAdminTeamsModule() {

    const container =
        document.getElementById(
            "admin-module-container"
        );

    if (!container) return;

    container.classList.remove("hidden");

    let html = `

    <div class="flex justify-between items-center mb-4">

        <h2 class="text-lg font-bold text-slate-800">
            ⚽ Équipes
        </h2>

        <div class="flex gap-2">

            <button
                onclick="openModalTeam()"
                class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-xs font-bold">

                ➕ Nouvelle équipe

            </button>

            <button
                onclick="closeAdminModule()"
                class="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-bold">

                ← Retour

            </button>

        </div>

    </div>

`;

    Object.entries(state.teams || {})
        .forEach(([key, team]) => {

            html += `

                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-2">

                    <div class="flex justify-between items-center">

                        <div>

                            <div class="font-bold">
                                ${key}
                            </div>

                            <div class="text-xs text-slate-500">
                                ${team.name}
                            </div>

                            <div class="mt-1.5 inline-flex items-center gap-1.5 bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                <i class="fa-solid fa-clipboard-list"></i>
                                Feuille : ${team.targetConvocations || 14} joueurs
                            </div>

                        </div>

                        <div class="flex gap-2">

    <button
        onclick="editTeam('${key}')"
        class="bg-sky-100 hover:bg-sky-200 text-sky-700 px-3 py-1 rounded-lg text-xs">

        ✏️

    </button>

    <button
        onclick="deleteTeam('${key}')"
        class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs">

        🗑️

    </button>

</div>

                    </div>

                </div>

            `;
        });

    container.innerHTML = html;
}

async function renderAdminAccounts() {

    const container =
        document.getElementById(
            "admin-module-container"
        );

    if (!container) return;

    const snapshot =
        await firebase.database()
            .ref("rangueil_data/access")
            .once("value");

    const accounts =
        snapshot.val() || {};

    const accountsList =
    Object.entries(accounts || {})
        .sort(([, a], [, b]) =>
            (a.name || "").localeCompare(
                b.name || "",
                "fr",
                { sensitivity: "base" }
            )
        );

let html = `
    <div class="flex justify-between items-center mb-4">

        <h2 class="text-lg font-bold text-slate-800">
            🪪 Comptes d'accès
            <span class="text-slate-500 text-sm">
                (${accountsList.length})
            </span>
        </h2>

        <div class="flex gap-2">

            <button
                onclick="openNewAccountForm()"
                class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-xs font-bold">
                ➕ Nouveau compte
            </button>

            <button
                onclick="closeAdminModule()"
                class="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-bold">
                ← Retour
            </button>

        </div>

    </div>

    <div class="mb-4">
        <input
            type="text"
            id="account-search"
            placeholder="🔍 Rechercher un nom, une fonction ou un PIN..."
            oninput="renderAdminAccounts()"
            class="w-full border rounded-xl p-3">
    </div>
`;

const search =
    (
        document.getElementById(
            "account-search"
        )?.value || ""
    ).toLowerCase();

            

       
    accountsList
    .filter(([pin, user]) => {

        const text = `
            ${pin}
            ${user.name || ""}
            ${(user.functions || [])
                .map(f => f.functionName)
                .join(" ")}
        `.toLowerCase();

        return text.includes(search);

    })
    .forEach(([pin, user]) => {

            html += `

<div class="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">

    <div class="flex justify-between items-start">

        <div>

            <div class="font-bold text-slate-800 text-lg">
                ${user.name || ""}
            </div>

            <div class="text-xs text-slate-500 mt-2">

                ${
    (user.functions || [])
        .map(f => {

            const scopes =
                (f.scopes || [])
                .map(scope =>
                    state.teams?.[scope]?.name || scope
                )
                .join(", ");

            return `
                👔 ${f.functionName}
                ${scopes ? `<br><span class="ml-6 text-slate-400">📍 ${scopes}</span>` : ""}
            `;

        })
        .join("<br><br>")
}

            </div>

        </div>

        <div class="flex gap-2 mt-3">

            <button
                onclick="editCoachAccount('${pin}')"
                class="bg-sky-100 hover:bg-sky-200 text-sky-700 px-3 py-1 rounded-lg text-xs font-bold">

                ✏️ Modifier

            </button>

            <button
                onclick="deleteCoachAccount('${pin}')"
                class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-bold">

                🗑️ Supprimer

            </button>

        </div>

    </div>

</div>

            `;

        }
    );

    container.innerHTML = html;

}

function closeAdminModule() {

    const container =
        document.getElementById(
            "admin-module-container"
        );

    if (!container) return;

    container.classList.add("hidden");

    container.innerHTML = "";
}


// ============================================================
//  MODULE : SYNCHRONISATION FFF (api-dofa.fff.fr)
//  Importe automatiquement les matchs officiels du club
//  (calendrier FFF de Rangueil FC) et les scores.
// ============================================================

function fffNormalize(s) {
    return String(s || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

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
    state.fffApiBaseLastUrl = fullUrl;
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

function fffGroupCompetitions(matches) {
    const clubNo = state.fffClubNo || 18707;
    const map = new Map();
    (matches || []).forEach(m => {
        const comp = m.competition;
        if (!comp) return;
        const cpNo = comp.cp_no;
        if (!map.has(cpNo)) {
            map.set(cpNo, {
                cp_no: cpNo,
                name: comp.name,
                tipo: comp.type,
                level: comp.level,
                season: comp.season || null,
                matches: 0,
                poule: "",
                categories: []
            });
        }
        const row = map.get(cpNo);
        row.matches++;
        if (!row.poule && m.poule && m.poule.name) row.poule = m.poule.name;
        [m.home, m.away].forEach(side => {
            if (side && side.club && side.club.cl_no === clubNo && side.category_label) {
                if (!row.categories.includes(side.category_label)) {
                    row.categories.push(side.category_label);
                }
            }
        });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function parseFFFTime(t) {
    if (!t) return "";
    const m = String(t).match(/(\d{1,2})H(\d{2})?/);
    if (!m) return "";
    const hh = String(parseInt(m[1], 10)).padStart(2, "0");
    const mm = (m[2] || "00").padStart(2, "0");
    return hh + ":" + mm;
}

function fffPelouseLabel(surface) {
    const s = String(surface || "").toLowerCase();
    if (s.includes("synth")) return "Synthétique";
    if (s.includes("herbe")) return "Herbe";
    if (s.includes("stabilis")) return "Stabilisé";
    return surface || "";
}

function fffTypeLabel(compType) {
    if (compType === "CP") return "Coupe";
    if (compType === "CH") return "Championnat";
    if (compType === "AC") return "Amical";
    return "Coupe";
}

function fffOpponentName(side) {
    if (!side) return "";
    return side.short_name
        || side.short_name_federation
        || side.short_name_ligue
        || "";
}

function fffFormatDate(ts) {
    return new Date(ts).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function buildFFFMatch(evt) {
    const clubNo = state.fffClubNo || 18707;
    const isHome = evt.home && evt.home.club && evt.home.club.cl_no === clubNo;
    const oppSide = isHome ? evt.away : evt.home;
    const link = state.fffLinks && state.fffLinks[evt.competition.cp_no];
    const teamKey = link ? link.team : "";
    const homeScore = (evt.home_score !== null && evt.home_score !== undefined) ? String(evt.home_score) : "";
    const awayScore = (evt.away_score !== null && evt.away_score !== undefined) ? String(evt.away_score) : "";
    const scoreHome = isHome ? homeScore : awayScore;
    const scoreAway = isHome ? awayScore : homeScore;

    const fffBuilt = {
        id: "fff-" + evt.ma_no,
        opponent: fffOpponentName(oppSide),
        adresse: [
            evt.terrain && evt.terrain.address,
            [evt.terrain && evt.terrain.zip_code, evt.terrain && evt.terrain.city].filter(Boolean).join(" ")
        ].filter(Boolean).join(", "),
        date: (evt.date || "").slice(0, 10),
        heure: parseFFFTime(evt.time),
        type: fffTypeLabel(evt.competition && evt.competition.type),
        location: isHome ? "Domicile" : "Extérieur",
        pelouse: fffPelouseLabel(evt.terrain && evt.terrain.libelle_surface),
        team: teamKey,
        carpoolId: "CP_FFF_" + evt.ma_no,
        meetingPlace: "",
        travelTime: 25,
        arrivalMargin: 60,
        securityMargin: 10,
        scoreHome: scoreHome,
        scoreAway: scoreAway,
        convocations: {},
        positions: {},
        jerseys: {},
        carpool: {},
        matchStats: {},
        debrief: "",
        composition: {},
        slotAssignments: {},
        isValidated: false,
        fff: {
            ma_no: evt.ma_no,
            cp_no: evt.competition ? evt.competition.cp_no : null,
            competitionName: evt.competition ? evt.competition.name : "",
            competitionType: evt.competition ? evt.competition.type : "",
            poule: evt.poule ? evt.poule.name : "",
            journee: evt.poule_journee ? ("Journée " + evt.poule_journee.number) : "",
            phase: evt.phase ? evt.phase.name : "",
            isHome: isHome
        }
    };
    fffBuilt.rdvHeure = computeRdvHeure(
        fffBuilt.heure,
        fffBuilt.location,
        fffBuilt.travelTime,
        fffBuilt.arrivalMargin,
        fffBuilt.securityMargin
    );
    return fffBuilt;
}

function applyFFFToExisting(existing, fffMatch) {
    // Ne jamais écraser un match Amical manuel en Type coupe/championnat
    const wasAmical = existing.type === "Amical" && !existing.fff;
    existing.opponent = fffMatch.opponent;
    existing.adresse = fffMatch.adresse;
    existing.date = fffMatch.date;
    existing.heure = fffMatch.heure;
    if (!wasAmical) existing.type = fffMatch.type;
    existing.location = fffMatch.location;
    existing.pelouse = fffMatch.pelouse;
    existing.team = fffMatch.team;
    if (fffMatch.scoreHome !== "" && fffMatch.scoreAway !== "") {
        existing.scoreHome = fffMatch.scoreHome;
        existing.scoreAway = fffMatch.scoreAway;
    }
    existing.fff = fffMatch.fff;
    existing.rdvHeure = fffMatch.rdvHeure;
    existing.carpoolId = existing.carpoolId || fffMatch.carpoolId;
    existing.convocations = existing.convocations || {};
    existing.positions = existing.positions || {};
    existing.jerseys = existing.jerseys || {};
    existing.carpool = existing.carpool || {};
    existing.matchStats = existing.matchStats || {};
    existing.slotAssignments = existing.slotAssignments || {};
    existing.composition = existing.composition || {};
    existing.debrief = existing.debrief || "";
}

function findLinkedManualMatch(evt, teamKey) {
    const clubNo = state.fffClubNo || 18707;
    const isHome = evt.home && evt.home.club && evt.home.club.cl_no === clubNo;
    const fffOpp = fffNormalize(fffOpponentName(isHome ? evt.away : evt.home));
    if (!fffOpp) return null;
    // Tolérant aux changements de date : on matche sur équipe + adversaire normalisé
    // même si la date a bougé (report). On évite les Amicaux.
    const candidates = Object.values(state.matches).filter(m =>
        !m.fff
        && m.team === teamKey
        && m.type !== "Amical"
        && fffNormalize(m.opponent) === fffOpp
    );
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];
    // Si plusieurs homonymes (même adversaire 2x dans la saison), prend le plus proche en date
    const fffDate = (evt.date || "").slice(0, 10);
    candidates.sort((a, b) => {
        const da = a.date ? Math.abs(new Date(a.date) - new Date(fffDate)) : 9999;
        const db = b.date ? Math.abs(new Date(b.date) - new Date(fffDate)) : 9999;
        return da - db;
    });
    return candidates[0];
}

async function refreshFFFCompetitions() {
    const btn = document.getElementById("fff-scan-btn");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyse en cours...';
    }
    try {
        let calendar;
        if (state.fffManualJson && state.fffManualJson.trim()) {
            const obj = JSON.parse(state.fffManualJson);
            calendar = Array.isArray(obj) ? obj : (obj["hydra:member"] || []);
            if (calendar.length === 0) throw new Error("Le JSON collé ne contient aucun match");
        } else {
            calendar = await fetchFFFCalendar();
        }
        window.__fffCalendar = calendar;
        window.__fffCompetitions = fffGroupCompetitions(calendar);
        renderAdminFFFModule();
    } catch (err) {
        console.error("FFF analyse error:", err);
        showToast("❌ Analyse FFF impossible : " + err.message, "error");
        const statusEl = document.getElementById("fff-sync-status");
        if (statusEl) statusEl.textContent = "❌ " + err.message;
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Analyser le calendrier';
        }
    }
}

function syncFFFMatches(opts) {
    opts = opts || {};
    return (async () => {
        if (window.__fffSyncing) return;
        window.__fffSyncing = true;
        const isManual = !!opts.manual;

        const setSyncBtn = (html, disabled) => {
            const b = document.getElementById("fff-sync-btn");
            if (b) {
                b.disabled = !!disabled;
                if (html) b.innerHTML = html;
            }
        };

        try {
            if (isManual) setSyncBtn('<i class="fa-solid fa-spinner fa-spin"></i> Synchronisation en cours...', true);

            const links = state.fffLinks || {};
            const linkedEntries = Object.entries(links).filter(e => e[1] && e[1].team);
            if (linkedEntries.length === 0) {
                if (isManual) showToast("ℹ️ Liez d'abord vos équipes aux compétitions FFF", "info");
                return;
            }

            let clubCalendar = window.__fffCalendar || [];
            if (clubCalendar.length === 0) {
                try {
                    clubCalendar = await fetchFFFCalendar();
                } catch (e) {
                    console.warn("FFF: calendrier club indisponible, on utilisera uniquement les JSON collés par compétition", e);
                }
            }

            const compJsonMap = {};
            Object.entries(state.fffCompJson || {}).forEach(([cpNo, raw]) => {
                if (!raw || !raw.trim()) return;
                try {
                    const obj = JSON.parse(raw);
                    const arr = Array.isArray(obj) ? obj : (obj["hydra:member"] || []);
                    if (Array.isArray(arr) && arr.length) compJsonMap[cpNo] = arr;
                } catch (e) {
                    console.warn("FFF: JSON collé ignoré pour la compétition " + cpNo, e);
                }
            });

            let created = 0;
            let updated = 0;
            const missingComps = [];

            for (const [cpNoStr, link] of linkedEntries) {
                const cpNo = Number(cpNoStr);
                const teamKey = link.team;
                let compMatches = null;

                // 1) Live FFF : saison complète (passés + à venir) par compétition
                try {
                    const live = await fetchFFFCompetitionMatches(cpNo);
                    if (live && live.length) compMatches = live;
                } catch (e) {
                    console.warn("FFF live cp_no " + cpNo + " échoué :", e.message);
                }
                // 2) Fallback JSON collé par compétition (📥 Matchs)
                if (!compMatches || !compMatches.length) {
                    compMatches = compJsonMap[cpNoStr] || null;
                }
                // 3) Fallback calendrier club (prochains seulement)
                if (!compMatches || !compMatches.length) {
                    compMatches = (clubCalendar || []).filter(e => e && e.competition && Number(e.competition.cp_no) === cpNo);
                }

                if (!compMatches || !compMatches.length) {
                    missingComps.push(link.competitionName || ("Compétition " + cpNo));
                    continue;
                }

                for (const evt of compMatches) {
                    const clubNoNow = state.fffClubNo || 18707;
                    const involvesClub = evt && (
                        (evt.home && evt.home.club && evt.home.club.cl_no === clubNoNow)
                        || (evt.away && evt.away.club && evt.away.club.cl_no === clubNoNow)
                    );
                    if (!involvesClub) continue;
                    const maNo = evt.ma_no;
                    const fffMatch = buildFFFMatch(evt);

                    let existing = Object.values(state.matches).find(m => m.fff && m.fff.ma_no === maNo);
                    if (!existing && teamKey) existing = findLinkedManualMatch(evt, teamKey);

                    if (existing) {
                        applyFFFToExisting(existing, fffMatch);
                        updated++;
                    } else if (teamKey) {
                        state.matches[fffMatch.id] = fffMatch;
                        created++;
                    }
                }
            }

            state.fffLastSync = Date.now();
            saveStateToFirebase();
            renderAll();

            if (isManual) {
                const warnMsg = missingComps.length ? " · ⚠️ " + missingComps.length + " compétition(s) sans matchs (collez leur JSON : 📥 Matchs)" : "";
                showToast("✅ " + created + " match(s) ajouté(s), " + updated + " mis à jour" + warnMsg, missingComps.length ? "info" : "success");
            }
            const statusEl = document.getElementById("fff-sync-status");
            if (statusEl) statusEl.textContent = "Dernière synchro : " + fffFormatDate(new Date()) + " · " + created + " nouveau(x) · " + updated + " mis à jour" + (missingComps.length ? " · ⚠️ " + missingComps.length + " compétition(s) sans matchs" : "");
            renderAdminFFFModule();
        } catch (err) {
            console.error("FFF sync error:", err);
            if (isManual) showToast("❌ Sync FFF impossible : " + err.message, "error");
            const statusEl = document.getElementById("fff-sync-status");
            if (statusEl) statusEl.textContent = "❌ " + err.message;
        } finally {
            window.__fffSyncing = false;
            if (isManual) setSyncBtn('<i class="fa-solid fa-arrows-rotate"></i> Synchroniser maintenant', false);
        }
    })();
}

function onFFFLinkChange(cpNo, teamKey) {
    const compInfo = (window.__fffCompetitions || []).find(c => String(c.cp_no) === String(cpNo));
    if (teamKey) {
        state.fffLinks[cpNo] = {
            team: teamKey,
            competitionName: compInfo ? compInfo.name : "",
            competitionType: compInfo ? compInfo.tipo : ""
        };
        showToast("🔗 Compétition liée à l'équipe");
    } else {
        delete state.fffLinks[cpNo];
        showToast("🔓 Lien supprimé");
    }
    saveStateToFirebase();
    renderAdminFFFModule();
}

function onFFFAutoSyncToggle(checked) {
    state.fffAutoSync = !!checked;
    saveStateToFirebase();
    showToast(checked ? "✅ Synchronisation automatique activée" : "🛑 Synchronisation automatique désactivée");
}

function onFFFSaveProxy() {
    const input = document.getElementById("fff-proxy-url");
    const value = (input && input.value || "").trim();
    state.fffProxyUrl = value;
    window.__fffBestRoute = null;
    saveStateToFirebase();
    showToast(value ? "✅ Proxy enregistré" : "ℹ️ Proxy retiré, retour à l'accès direct");
    renderAdminFFFModule();
}

function onFFFSaveManualJson() {
    const ta = document.getElementById("fff-manual-json");
    const value = (ta && ta.value || "").trim();
    if (value) {
        try {
            const obj = JSON.parse(value);
            const list = obj && (Array.isArray(obj) ? obj : obj["hydra:member"]);
            if (!list || !Array.isArray(list)) throw new Error("Ce n'est pas le calendrier FFF attendu");
        } catch (err) {
            showToast("❌ JSON invalide : " + err.message, "error");
            return;
        }
    }
    state.fffManualJson = value;
    saveStateToFirebase();
    showToast(value ? "✅ JSON FFF enregistré" : "ℹ️ JSON manuel retiré");
}

function onFFFManualJsonClear() {
    state.fffManualJson = "";
    saveStateToFirebase();
    showToast("ℹ️ JSON manuel effacé");
    renderAdminFFFModule();
}

function onFFFToggleCompJson(cpNo) {
    const box = document.getElementById("fff-comp-json-box-" + cpNo);
    if (!box) return;
    const willShow = box.classList.contains("hidden");
    box.classList.toggle("hidden");
    if (willShow) {
        const ta = document.getElementById("fff-comp-json-" + cpNo);
        if (ta) ta.focus();
    }
}

function onFFFSaveCompJson(cpNo) {
    const ta = document.getElementById("fff-comp-json-" + cpNo);
    const value = (ta && ta.value || "").trim();
    if (value) {
        try {
            const obj = JSON.parse(value);
            const list = obj && (Array.isArray(obj) ? obj : obj["hydra:member"]);
            if (!list || !Array.isArray(list) || list.length === 0) throw new Error("Aucun match dans ce JSON");
        } catch (err) {
            showToast("❌ JSON invalide : " + err.message, "error");
            return;
        }
    }
    state.fffCompJson = state.fffCompJson || {};
    state.fffCompJson[cpNo] = value;
    saveStateToFirebase();
    renderAdminFFFModule();
    showToast(value ? "✅ Matchs de la compétition enregistrés" : "ℹ️ JSON de la compétition retiré");
}

function renderAdminFFFModule() {
    const container = document.getElementById("admin-module-container");
    if (!container) return;
    if (container.classList.contains("hidden")) return;
    container.classList.remove("hidden");

    const comps = window.__fffCompetitions || [];
    const linkedCount = Object.keys(state.fffLinks || {}).length;
    const lastSync = state.fffLastSync ? fffFormatDate(state.fffLastSync) : "Jamais";
    const emptyTeamRow = Object.entries(state.teams || {}).length === 0;

    let html = `
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
            <h2 class="text-lg font-bold text-slate-800">🌐 Synchronisation FFF</h2>
            <p class="text-xs text-slate-500 mt-1">Importe automatiquement les matchs officiels du club (n° ${state.fffClubNo || 18707}) depuis la Fédération Française de Football.</p>
        </div>
        <div class="flex gap-2">
            <button onclick="refreshFFFCompetitions()" id="fff-scan-btn" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold">
                <i class="fa-solid fa-magnifying-glass"></i> Analyser le calendrier
            </button>
            <button onclick="closeAdminModule()" class="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-bold">← Retour</button>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div class="bg-sky-50 border border-sky-200 rounded-xl p-3">
            <div class="text-[11px] text-slate-500 font-semibold">Dernière synchro</div>
            <div id="fff-sync-status" class="text-sm font-bold text-sky-800 mt-0.5">${lastSync}</div>
        </div>
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <div class="text-[11px] text-slate-500 font-semibold">Compétitions détectées</div>
            <div class="text-sm font-bold text-emerald-800 mt-0.5">${comps.length}</div>
        </div>
        <div class="bg-violet-50 border border-violet-200 rounded-xl p-3">
            <div class="text-[11px] text-slate-500 font-semibold">Liens équipe ↔ compétition</div>
            <div class="text-sm font-bold text-violet-800 mt-0.5">${linkedCount}</div>
        </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 mb-4">
        <button onclick="syncFFFMatches({manual:true})" id="fff-sync-btn" class="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow">
            <i class="fa-solid fa-arrows-rotate"></i> Synchroniser maintenant
        </button>
        <label class="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input type="checkbox" id="fff-auto-sync-toggle" ${state.fffAutoSync !== false ? "checked" : ""} onchange="onFFFAutoSyncToggle(this.checked)" class="w-4 h-4 accent-sky-600">
            Synchronisation automatique au chargement
        </label>
    </div>

    <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
        <div class="flex flex-wrap items-center gap-2">
            <div class="flex-1 min-w-[220px]">
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">URL du petit proxy (optionnel, en cas d'accès bloqué)</label>
                <input type="text" id="fff-proxy-url" value="${state.fffProxyUrl || ""}" placeholder="https://script.google.com/macros/s/.../exec?url=" class="w-full border rounded-lg p-2 text-xs">
            </div>
            <div class="pt-4">
                <button onclick="onFFFSaveProxy()" class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg text-xs font-bold">Enregistrer</button>
            </div>
        </div>
        <div class="text-[11px] text-slate-500 mt-2">
            💡 L'API FFF bloque parfois les navigateurs (Akamai). Sans proxy, l'appli essaie 4 itinéraires automatiquement. Si tout échoue, collez ici l'URL d'un mini-proxy Google Apps Script (instructions à la demande) pour garantir l'accès.
        </div>
    </div>

    <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
        <div class="flex items-center justify-between gap-2 mb-1">
            <label class="block text-[11px] font-semibold text-emerald-800">JSON FFF collé à la main — la méthode 100% fiable (Aucune protection ne bloque votre navigateur)</label>
            <div class="flex gap-2 flex-shrink-0">
                <button onclick="onFFFSaveManualJson()" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Enregistrer</button>
                <button onclick="onFFFManualJsonClear()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold">Effacer</button>
            </div>
        </div>
        <textarea id="fff-manual-json" rows="5" placeholder="Collez ici le contenu de la page (voir le mode d'emploi ci-dessous)" class="w-full border rounded-lg p-2 text-xs font-mono">${(state.fffManualJson || "").replace(/</g, "\\u003c")}</textarea>
        <div class="text-[11px] text-emerald-800 mt-2">
            📋 <b>Mode d'emploi :</b> ① ouvrez l'URL ci-dessous dans un onglet → ② <b>Ctrl+A</b> puis <b>Ctrl+C</b> → ③ collez ici → ④ <b>Enregistrer</b> → ⑤ <b>Analyser</b> → ⑥ liez vos équipes → ⑦ <b>⚠️ Important :</b> cette page ne montre que les <b>prochains</b> matchs. Pour un <b>championnat au complet</b>, cliquez sur <b>📥 Matchs</b> d'une compétition liée et collez le JSON de <b>son</b> URL dédiée (l'API compétition contient toute la saison) → ⑧ <b>Synchroniser maintenant</b>.
            <br>🔗 URL de détection (calendrier club) : <code class="break-all">https://api-dofa.fff.fr/api/clubs/${state.fffClubNo || 18707}/calendrier?itemsPerPage=1000</code>
        </div>
    </div>
`;

    if (comps.length === 0) {
        html += `
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <i class="fa-solid fa-circle-info mr-1"></i>
            Aucune compétition chargée pour le moment. Cliquez sur <b>« Analyser le calendrier »</b> pour détecter les compétitions officielles du club. Aucune donnée ne sera importée tant qu'aucun lien n'est créé.
        </div>
        `;
    } else {
        html += `<div class="text-xs font-bold text-slate-600 mb-2">🎯 Liez une compétition FFF à votre équipe :</div>`;
        if (emptyTeamRow) {
            html += `
            <div class="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800 mb-3">
                ⚠️ Créez d'abord vos équipes dans le module <b>Équipes</b> avant de les lier.
            </div>
            `;
        }
        comps.forEach(c => {
            const link = state.fffLinks && state.fffLinks[c.cp_no];
            const linked = link ? link.team : "";
            const teamName = linked && state.teams && state.teams[linked] ? state.teams[linked].name : (linked || "");
            const catLabel = c.categories.length ? c.categories[0] : "";
            const typeBadge = c.tipo === "CH" ? "bg-blue-100 text-blue-700"
                : c.tipo === "CP" ? "bg-fuchsia-100 text-fuchsia-700"
                : "bg-amber-100 text-amber-700";
            const compJsonRaw = ((state.fffCompJson || {})[c.cp_no] || "").trim();
            let compJsonCount = 0;
            if (compJsonRaw) {
                try {
                    const cj = JSON.parse(compJsonRaw);
                    compJsonCount = Array.isArray(cj) ? cj.length : ((cj && cj["hydra:member"]) || []).length;
                } catch (e) { compJsonCount = 0; }
            }

            html += `
            <div class="bg-slate-50 border ${linked ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200"} rounded-xl p-3 mb-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="min-w-0">
                        <div class="font-bold text-sm text-slate-800">
                            <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mr-1.5 ${typeBadge}">${fffTypeLabel(c.tipo)}</span>
                            ${c.name}
                        </div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${catLabel} · ${c.matches} match(s)${c.poule ? " · " + c.poule : ""}${compJsonRaw ? " · 📥 JSON collé" : ""}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${linked ? `<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-bold">✓ ${teamName}</span>` : ""}
                        <select onchange="onFFFLinkChange('${c.cp_no}', this.value)" class="border rounded-lg p-2 text-xs ${linked ? "border-emerald-300" : "border-slate-200"}">
                            <option value="">— Ne pas lier —</option>
                            ${Object.entries(state.teams || {}).map(([k, t]) => `<option value="${k}" ${linked === k ? "selected" : ""}>${t.name || k.toUpperCase()}</option>`).join("")}
                        </select>
                        ${linked ? `<button onclick="onFFFToggleCompJson('${c.cp_no}')" class="border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 px-2.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap">📥 Matchs</button>` : ""}
                    </div>
                </div>
                ${linked ? `
                <div id="fff-comp-json-box-${c.cp_no}" class="hidden mt-2 border-t border-violet-100 pt-2">
                    <div class="text-[11px] text-slate-600 mb-1">
                        <b>Compétition au complet :</b> collez ici le JSON de ses matchs (l'API club ne montre que les prochains matchs). Ouvrez l'URL ci-dessous dans un onglet, <b>Ctrl+A</b> puis <b>Ctrl+C</b>, et collez le tout.
                    </div>
                    <div class="text-[10px] bg-white rounded-lg p-2 mb-2 border border-violet-100 break-all font-mono">
                        https://api-dofa.fff.fr/api/match_entities?competition.cp_no=${c.cp_no}&amp;ma_dat[after]=2026-06-01
                    </div>
                    <textarea id="fff-comp-json-${c.cp_no}" rows="4" placeholder="Collez ici le contenu de la page (voir l'URL ci-dessus)" class="w-full border rounded-lg p-2 text-xs font-mono">${(compJsonRaw || "").replace(/</g, "\\u003c")}</textarea>
                    <div class="flex items-center gap-2 mt-1.5">
                        <button onclick="onFFFSaveCompJson('${c.cp_no}')" class="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Enregistrer</button>
                        ${compJsonCount ? `<span class="text-[11px] font-bold text-emerald-700">✓ ${compJsonCount} match(s) prêt(s) à importer</span>` : `<span class="text-[11px] text-slate-400">Aucun JSON collé pour l'instant</span>`}
                    </div>
                </div>
                ` : ""}
            </div>
            `;
        });
    }

    container.innerHTML = html;
}

function maybeAutoSyncFFF() {
    if (window.__fffSyncing) return;
    if (window.__fffAutoSynced) return;
    if (state.fffAutoSync === false) return;
    if (!state.fffLinks || Object.keys(state.fffLinks).length === 0) return;
    window.__fffAutoSynced = true;
    setTimeout(() => {
        syncFFFMatches({ manual: false });
    }, 2000);
}


// ============================================================
//  MODULE : DISTRICT HAUTE-GARONNE
//  Classements, calendrier et résultats officiels, calculés à
//  partir des matchs de la compétition renvoyés par l'API FFF
//  (même source que la synchronisation FFF).
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

function districtManualCpList() {
    try {
        const raw = sessionStorage.getItem(DISTRICT_MANUAL_KEY);
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list.map(String) : [];
    } catch (e) {
        return [];
    }
}

function districtAddManualCp(ref) {
    const key = [String(ref.cpNo), ref.phaseNo || "", ref.pouleNo || ""].join(":");
    const list = new Set(districtManualCpList());
    list.add(key);
    try {
        sessionStorage.setItem(DISTRICT_MANUAL_KEY, JSON.stringify([...list]));
    } catch (e) {
        // Stockage indisponible : la compétition reste en mémoire pour la session.
    }
}

function districtParseCompetitionRef(value) {
    const text = String(value || "").trim();
    const cpMatch = text.match(/engagement\/(\d+)/i) || text.match(/\b(\d{4,7})\b/);
    const phaseMatch = text.match(/\/phase\/(\d+)(?:\/(\d+))?/i);

    return {
        cpNo: cpMatch ? cpMatch[1] : "",
        phaseNo: phaseMatch ? phaseMatch[1] : "",
        pouleNo: phaseMatch && phaseMatch[2] ? phaseMatch[2] : ""
    };
}

// --- Extraction tolérante des réponses FFF (champs variables selon les endpoints) ---

function fffCollectObjects(root, predicate, limit) {
    const found = [];
    const seen = new Set();

    const walk = (node, depth) => {
        if (!node || depth > 10 || found.length >= limit) return;
        if (Array.isArray(node)) {
            node.forEach(item => walk(item, depth + 1));
            return;
        }
        if (typeof node !== "object") return;
        if (seen.has(node)) return;
        seen.add(node);
        if (predicate(node)) {
            found.push(node);
            return;
        }
        Object.keys(node).forEach(key => walk(node[key], depth + 1));
    };

    walk(root, 0);
    return found;
}

function fffObjName(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj.trim();

    const candidates = [
        obj.nom, obj.name, obj.label, obj.libelle,
        obj.short_name, obj.shortName,
        obj.equipe && (obj.equipe.nom || obj.equipe.name || obj.equipe.short_name),
        obj.club && (obj.club.nom || obj.club.name || obj.club.short_name)
    ];

    for (const value of candidates) {
        if (typeof value === "string" && value.trim()) return value.trim();
    }
    return "";
}

function fffNum(obj, keys, fallback) {
    if (!obj) return fallback === undefined ? 0 : fallback;
    for (const key of keys) {
        const value = obj[key];
        if (value === null || value === undefined || value === "") continue;
        const num = Number(value);
        if (isFinite(num)) return num;
    }
    return fallback === undefined ? 0 : fallback;
}

function fffSide(obj, keys) {
    if (!obj) return null;
    for (const key of keys) {
        const value = obj[key];
        if (value && typeof value === "object" && !Array.isArray(value)) return value;
    }
    return null;
}

function fffIsClubSide(side) {
    if (!side) return false;
    const club = side.club || (side.equipe && side.equipe.club);
    return !!(club && Number(club.cl_no) === Number(state.fffClubNo || 18707));
}

function fffExtractStandings(data) {
    const clubNo = Number(state.fffClubNo || 18707);

    const rows = fffCollectObjects(data, obj => {
        const points = fffNum(obj, ["points", "pts", "nb_points", "point"], null);
        const played = fffNum(obj, ["joue", "j", "matchs_joues", "nb_matchs", "journees"], null);
        const team = fffObjName(obj.equipe) || fffObjName(obj.club) || fffObjName(obj);
        return !!team && (points !== null || played !== null);
    }, 60);

    return rows.map(row => {
        const teamObj = row.equipe || row.club || row;
        const club = row.club || (teamObj && teamObj.club) || null;
        const goalsFor = fffNum(row, ["buts_pour", "bp", "buts_marques", "buts_equipe"], 0);
        const goalsAgainst = fffNum(row, ["buts_contre", "bc", "buts_encaisses"], 0);

        return {
            name: fffObjName(teamObj) || fffObjName(row) || "—",
            isClub: !!(club && Number(club.cl_no) === clubNo),
            points: fffNum(row, ["points", "pts", "nb_points", "point"], 0),
            played: fffNum(row, ["joue", "j", "matchs_joues", "nb_matchs", "journees"], 0),
            wins: fffNum(row, ["gagne", "g", "victoires", "nb_gagnes"], 0),
            draws: fffNum(row, ["nul", "n", "nuls", "nb_nuls"], 0),
            losses: fffNum(row, ["perdu", "p", "defaites", "nb_perdus"], 0),
            goalsFor: goalsFor,
            goalsAgainst: goalsAgainst,
            diff: goalsFor - goalsAgainst
        };
    }).sort((a, b) =>
        b.points - a.points
        || b.diff - a.diff
        || b.goalsFor - a.goalsFor
        || a.name.localeCompare(b.name, "fr")
    );
}

function fffExtractMatches(data) {
    const raw = fffCollectObjects(data, obj => {
        const home = fffSide(obj, ["home", "equipe1", "equipe_recevante", "recevant", "equipe_domicile"]);
        const away = fffSide(obj, ["away", "equipe2", "equipe_visiteuse", "visiteur", "equipe_exterieur"]);
        return !!(home && away);
    }, 150);

    const seen = new Set();
    const matches = [];

    raw.forEach(obj => {
        const home = fffSide(obj, ["home", "equipe1", "equipe_recevante", "recevant", "equipe_domicile"]);
        const away = fffSide(obj, ["away", "equipe2", "equipe_visiteuse", "visiteur", "equipe_exterieur"]);
        if (!home || !away) return;

        const date = obj.date || obj.ma_dat || obj.date_match || obj.date_rencontre || "";
        const key = String(obj.ma_no || obj.id || (date + "|" + fffObjName(home) + "|" + fffObjName(away)));
        if (seen.has(key)) return;
        seen.add(key);

        matches.push({
            ma_no: obj.ma_no || obj.id || key,
            date: date,
            time: obj.time || obj.heure || obj.ma_heure || "",
            home: home,
            away: away,
            home_score: fffNum(obj, ["home_score", "score1", "buts1", "score_home", "buts_equipe1"], null),
            away_score: fffNum(obj, ["away_score", "score2", "buts2", "score_away", "buts_equipe2"], null),
            poule: obj.poule || null,
            poule_journee: obj.poule_journee || obj.journee || null,
            phase: obj.phase || null,
            competition: obj.competition || null
        });
    });

    return matches;
}

function fffExtractEngagements(data) {
    const items = fffCollectObjects(data, obj => {
        return !!(obj.cp_no || (obj.competition && obj.competition.cp_no));
    }, 150);

    const map = new Map();

    items.forEach(obj => {
        const comp = obj.competition || obj;
        const cpNo = comp.cp_no || comp.cpNo;
        if (!cpNo) return;

        const key = String(cpNo);
        if (map.has(key)) return;

        const category = obj.categorie || obj.category || obj.category_label
            || (obj.equipe && (obj.equipe.categorie || obj.equipe.category))
            || "";

        map.set(key, {
            cp_no: key,
            name: fffObjName(comp) || ("Compétition " + key),
            categories: category ? [String(category)] : [],
            poule: "",
            matches: 0,
            phaseNo: String(obj.phase_no || (obj.phase && (obj.phase.numero || obj.phase.no)) || ""),
            pouleNo: String(obj.poule_no || (obj.poule && (obj.poule.numero || obj.poule.no)) || ""),
            local: true
        });
    });

    return [...map.values()];
}

async function fetchDistrictOfficial(ref) {
    const cpNo = ref.cpNo;
    const phaseNo = ref.phaseNo || "1";
    const poules = ref.pouleNo ? [String(ref.pouleNo)] : ["1", "2", "3"];

    let standings = null;
    let matches = [];
    let usedPoule = ref.pouleNo || "";

    const safeJson = async (path) => {
        try {
            return await fffFetchJson(path);
        } catch (err) {
            console.warn("FFF " + path + " :", err.message);
            return null;
        }
    };

    for (const pouleNo of poules) {
        if (!standings) {
            const data = await safeJson("/api/compets/" + cpNo + "/phases/" + phaseNo + "/poules/" + pouleNo + "/classement_journees");
            if (data) {
                const rows = fffExtractStandings(data);
                if (rows.length) {
                    standings = { name: "Poule " + pouleNo, rows: rows };
                    usedPoule = pouleNo;
                }
            }
        }

        if (!matches.length) {
            const result = await safeJson("/api/compets/" + cpNo + "/phases/" + phaseNo + "/poules/" + pouleNo + "/resultat");
            const agenda = await safeJson("/api/compets/" + cpNo + "/phases/" + phaseNo + "/poules/" + pouleNo + "/calendrier");
            matches = fffExtractMatches(result).concat(fffExtractMatches(agenda));
            if (matches.length && !usedPoule) usedPoule = pouleNo;
        }

        if (standings && matches.length) break;
    }

    return { standings: standings, matches: matches, phaseNo: phaseNo, pouleNo: usedPoule };
}

async function fetchFFFClubEngagements() {
    const clubNo = state.fffClubNo || 18707;
    const data = await fffFetchJson("/api/clubs/" + clubNo + "/equipes.json?filter=");
    return fffExtractEngagements(data);
}

function districtLocalCompetitions() {
    const list = [];
    const seen = new Set();

    const push = (cpNo, name, manual, phaseNo, pouleNo) => {
        const key = String(cpNo || "");
        if (!key || seen.has(key)) return;
        seen.add(key);
        list.push({
            cp_no: key,
            name: name || ("Compétition " + key),
            categories: [],
            poule: "",
            matches: 0,
            local: true,
            manual: !!manual,
            phaseNo: String(phaseNo || ""),
            pouleNo: String(pouleNo || "")
        });
    };

    Object.entries(state.fffLinks || {}).forEach(([cpNo, link]) => {
        push(cpNo, link && link.competitionName, false);
    });

    Object.keys(state.fffCompJson || {}).forEach(cpNo => {
        if (cpNo && String(state.fffCompJson[cpNo] || "").trim()) push(cpNo, "", false);
    });

    districtManualCpList().forEach(item => {
        const parts = String(item).split(":");
        push(parts[0], "", true, parts[1], parts[2]);
    });

    return list;
}

function districtMergeCompetitions(primary, secondary, previous) {
    const merged = [];
    const seen = new Set();

    [...(primary || []), ...(previous || []), ...(secondary || [])].forEach(comp => {
        if (!comp) return;
        const key = String(comp.cp_no || "");
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.push({ ...comp, cp_no: key });
    });

    return merged.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), "fr", { numeric: true })
    );
}

function addDistrictCompetitionFromInput() {
    const input = document.getElementById("district-cp-input");
    const ref = districtParseCompetitionRef(input ? input.value : "");

    if (!ref.cpNo) {
        showToast("⚠️ Colle l'URL de la compétition (epreuves.fff.fr/…/engagement/454584-…/phase/1/7) ou son numéro", "error");
        return;
    }

    districtAddManualCp(ref);

    districtState.competitions = districtMergeCompetitions([], [{
        cp_no: ref.cpNo,
        name: "Compétition " + ref.cpNo,
        categories: [],
        poule: "",
        matches: 0,
        local: true,
        manual: true,
        phaseNo: ref.phaseNo,
        pouleNo: ref.pouleNo
    }], districtState.competitions || []);

    if (input) input.value = "";

    districtState.cpNo = ref.cpNo;
    districtState.phaseNo = ref.phaseNo;
    districtState.pouleNo = ref.pouleNo;
    districtState.matches = [];
    districtState.standings = null;
    districtState.error = "";
    renderDistrict();
    loadDistrictMatches(false);
}

function districtEsc(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function districtCacheRead(cpNo) {
    try {
        const raw = sessionStorage.getItem(DISTRICT_CACHE_PREFIX + cpNo);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        if (!cached || !Array.isArray(cached.matches)) return null;
        if (Date.now() - (cached.at || 0) > DISTRICT_CACHE_TTL) return null;
        return cached;
    } catch (e) {
        return null;
    }
}

function districtCacheWrite(cpNo, matches, extra) {
    try {
        sessionStorage.setItem(DISTRICT_CACHE_PREFIX + cpNo, JSON.stringify(
            Object.assign({ at: Date.now(), matches: matches }, extra || {})
        ));
    } catch (e) {
        // Quota ou navigation privée : le cache reste optionnel.
    }
}

function districtCategories() {
    const set = new Set();
    (districtState.competitions || []).forEach(comp => {
        (comp.categories || []).forEach(cat => {
            if (cat) set.add(String(cat));
        });
    });
    return [...set].sort((a, b) => a.localeCompare(b, "fr", { numeric: true }));
}

function districtCompetitionsForCategory() {
    const all = districtState.competitions || [];
    const category = districtState.category;
    if (!category) return all;
    return all.filter(comp => {
        if (comp && comp.manual) return true;
        const haystack = ((comp.categories || []).join(" ") + " " + String(comp.name || "")).toUpperCase();
        return haystack.indexOf(category.toUpperCase()) !== -1;
    });
}

function districtSideName(side) {
    if (!side) return "—";
    return side.short_name
        || side.short_name_federation
        || side.short_name_ligue
        || side.name
        || side.nom
        || (side.equipe && (side.equipe.short_name || side.equipe.nom || side.equipe.name))
        || "—";
}

function districtSideKey(side) {
    if (!side) return "";
    const club = side.club || (side.equipe && side.equipe.club) || null;
    const clubNo = club && club.cl_no ? club.cl_no : "";
    const teamNo = side.equipe && side.equipe.eq_no ? side.equipe.eq_no : "";
    return String(clubNo) + "|" + String(teamNo || side.short_name || side.name || side.nom || districtSideName(side));
}

function districtIsClubSide(side) {
    return fffIsClubSide(side);
}

function districtScore(evt) {
    if (!evt) return null;
    const rawHome = evt.home_score;
    const rawAway = evt.away_score;
    if (rawHome === null || rawHome === undefined || rawHome === "") return null;
    if (rawAway === null || rawAway === undefined || rawAway === "") return null;
    const home = Number(rawHome);
    const away = Number(rawAway);
    if (!isFinite(home) || !isFinite(away)) return null;
    return [home, away];
}

function districtMatchDate(evt) {
    return evt && evt.date ? String(evt.date).slice(0, 10) : "";
}

function districtFormatDate(evt) {
    const raw = districtMatchDate(evt);
    if (!raw) return "Date à confirmer";
    const date = new Date(raw + "T12:00:00");
    if (isNaN(date.getTime())) return raw;
    return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function districtMatchLabel(evt) {
    return districtSideName(evt && evt.home) + " — " + districtSideName(evt && evt.away);
}

function computeDistrictStandings(matches) {
    const poules = new Map();

    (matches || []).forEach(evt => {
        const score = districtScore(evt);
        if (!score) return;

        const phaseName = evt.phase && evt.phase.name ? String(evt.phase.name) : "";
        const pouleName = (evt.poule && evt.poule.name) || "Poule unique";
        const groupName = phaseName ? phaseName + " · " + pouleName : pouleName;
        if (!poules.has(groupName)) poules.set(groupName, new Map());
        const table = poules.get(groupName);

        const addTeam = (side, goalsFor, goalsAgainst) => {
            const key = districtSideKey(side);
            if (!key) return;

            let row = table.get(key);
            if (!row) {
                row = {
                    key: key,
                    name: districtSideName(side),
                    isClub: districtIsClubSide(side),
                    played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goalsFor: 0,
                    goalsAgainst: 0
                };
                table.set(key, row);
            }

            row.played++;
            row.goalsFor += goalsFor;
            row.goalsAgainst += goalsAgainst;

            if (goalsFor > goalsAgainst) row.wins++;
            else if (goalsFor === goalsAgainst) row.draws++;
            else row.losses++;

            if (districtIsClubSide(side)) row.isClub = true;
        };

        addTeam(evt.home, score[0], score[1]);
        addTeam(evt.away, score[1], score[0]);
    });

    return [...poules.entries()].map(([name, table]) => {
        const rows = [...table.values()].map(row => ({
            ...row,
            diff: row.goalsFor - row.goalsAgainst,
            // Barème FFF amateur : victoire 4, nul 2, défaite 1.
            points: row.wins * 4 + row.draws * 2 + row.losses
        }));

        rows.sort((a, b) =>
            b.points - a.points
            || b.diff - a.diff
            || b.goalsFor - a.goalsFor
            || a.name.localeCompare(b.name, "fr")
        );

        return { name: name, rows: rows };
    }).sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function districtStatusText() {
    if (districtState.error) return "❌ " + districtState.error;
    if (districtState.loading) return "⏳ Chargement des données du district…";
    if (!(districtState.competitions || []).length) {
        return "Aucune compétition détectée pour le moment. Cliquez sur « Actualiser ».";
    }
    if (!districtState.cpNo) return "";
    const when = districtState.lastSync
        ? " · Mis à jour le " + new Date(districtState.lastSync).toLocaleString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        })
        : "";
    const source = districtState.source === "official"
        ? " · classement officiel" + (districtState.pouleNo ? " (poule " + districtState.pouleNo + ")" : "")
        : districtState.source === "manual"
            ? " · JSON FFF collé"
            : districtState.source === "live"
                ? " · résultats FFF"
                : "";
    return "Source officielle FFF · " + (districtState.matches || []).length + " match(s)" + source + when;
}

function updateDistrictStatus(text) {
    const el = document.getElementById("district-status");
    if (el) el.textContent = text || "";
}

function renderDistrict() {
    const categorySelect = document.getElementById("district-category-filter");
    const competitionSelect = document.getElementById("district-competition-filter");
    if (!categorySelect || !competitionSelect) return;

    districtState.competitions = districtMergeCompetitions([], districtLocalCompetitions(), districtState.competitions || []);

    const categories = districtCategories();
    if (!districtState.category && categories.length) {
        const u14 = categories.find(cat => cat.toUpperCase().indexOf("U14") !== -1);
        districtState.category = u14 || categories[0];
    }

    categorySelect.innerHTML = categories.length
        ? categories.map(cat => `<option value="${districtEsc(cat)}" ${cat === districtState.category ? "selected" : ""}>${districtEsc(cat)}</option>`).join("")
        : `<option value="">Toutes les catégories</option>`;

    const competitions = districtCompetitionsForCategory();
    if (!districtState.cpNo && competitions.length) {
        const linked = competitions.find(comp => state.fffLinks && state.fffLinks[comp.cp_no]);
        districtState.cpNo = String((linked || competitions[0]).cp_no);
    }

    competitionSelect.innerHTML = competitions.length
        ? competitions.map(comp => {
            const label = comp.name + (comp.poule ? " · " + comp.poule : "");
            return `<option value="${comp.cp_no}" ${String(comp.cp_no) === String(districtState.cpNo) ? "selected" : ""}>${districtEsc(label)}</option>`;
        }).join("")
        : `<option value="">— Aucune compétition —</option>`;

    const subtitle = document.getElementById("district-subtitle");
    if (subtitle) {
        const comp = competitions.find(c => String(c.cp_no) === String(districtState.cpNo));
        subtitle.textContent = comp
            ? comp.name + (comp.poule ? " · " + comp.poule : "")
            : "Classements, calendrier et résultats officiels";
    }

    const urlEl = document.getElementById("district-json-url");
    if (urlEl) {
        if (districtState.cpNo) {
            const now = new Date();
            const seasonYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
            urlEl.textContent = "https://api-dofa.fff.fr/api/match_entities?competition.cp_no="
                + districtState.cpNo
                + "&ma_dat[after]=" + seasonYear + "-06-01";
        } else {
            urlEl.textContent = "Choisis d'abord une compétition";
        }
    }

    updateDistrictStatus(districtStatusText());
    renderDistrictStandings();
    renderDistrictCalendar();
    renderDistrictResults();
}

function renderDistrictStandings() {
    const container = document.getElementById("district-standings");
    if (!container) return;

    const official = districtState.standings;
    const tables = official && Array.isArray(official.rows) && official.rows.length
        ? [{ name: official.name || "Classement officiel", rows: official.rows, official: true }]
        : computeDistrictStandings(districtState.matches);

    if (!tables.length) {
        container.innerHTML = `
            <div class="bg-white p-4 rounded-xl card-shadow border border-slate-100 text-center">
                <p class="text-sm font-bold text-slate-700">Classement indisponible</p>
                <p class="text-xs text-slate-500 mt-1">Les résultats officiels de cette compétition ne sont pas encore publiés.</p>
            </div>`;
        return;
    }

    container.innerHTML = tables.map(table => {
        const rows = table.rows.map((row, index) => `
            <tr class="${row.isClub ? "bg-sky-50" : ""}">
                <td class="px-2 py-2 text-center font-bold text-slate-500">${index + 1}</td>
                <td class="px-2 py-2 font-semibold ${row.isClub ? "text-sky-800" : "text-slate-700"}">
                    ${districtEsc(row.name)}${row.isClub ? ' <span class="text-[9px] font-extrabold uppercase text-sky-600">nous</span>' : ""}
                </td>
                <td class="px-2 py-2 text-center font-extrabold text-slate-800">${row.points}</td>
                <td class="px-2 py-2 text-center text-slate-600">${row.played}</td>
                <td class="px-2 py-2 text-center text-slate-600">${row.wins}</td>
                <td class="px-2 py-2 text-center text-slate-600">${row.draws}</td>
                <td class="px-2 py-2 text-center text-slate-600">${row.losses}</td>
                <td class="px-2 py-2 text-center text-slate-600">${row.goalsFor}</td>
                <td class="px-2 py-2 text-center text-slate-600">${row.goalsAgainst}</td>
                <td class="px-2 py-2 text-center font-semibold ${row.diff > 0 ? "text-emerald-600" : row.diff < 0 ? "text-red-500" : "text-slate-500"}">${row.diff > 0 ? "+" : ""}${row.diff}</td>
            </tr>
        `).join("");

        return `
            <div class="bg-white rounded-xl card-shadow border border-slate-100 overflow-hidden">
                <div class="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-2">
                    <h3 class="text-sm font-bold text-slate-800">🏅 ${districtEsc(table.name)}</h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${table.official ? "Classement officiel" : "Barème 4-2-1"}</span>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-xs">
                        <thead class="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                            <tr>
                                <th class="px-2 py-2 text-center">#</th>
                                <th class="px-2 py-2 text-left">Équipe</th>
                                <th class="px-2 py-2 text-center">Pts</th>
                                <th class="px-2 py-2 text-center">J</th>
                                <th class="px-2 py-2 text-center">G</th>
                                <th class="px-2 py-2 text-center">N</th>
                                <th class="px-2 py-2 text-center">P</th>
                                <th class="px-2 py-2 text-center">BP</th>
                                <th class="px-2 py-2 text-center">BC</th>
                                <th class="px-2 py-2 text-center">Diff</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">${rows}</tbody>
                    </table>
                </div>
            </div>`;
    }).join("");
}

function districtMatchCard(evt, withScore) {
    const score = districtScore(evt);
    const isHome = districtIsClubSide(evt && evt.home);
    const isAway = districtIsClubSide(evt && evt.away);
    const highlight = isHome || isAway;
    const journee = evt && evt.poule_journee && evt.poule_journee.number
        ? "Journée " + evt.poule_journee.number
        : "";
    const time = evt && evt.time ? (parseFFFTime(evt.time) || evt.time) : "";

    return `
        <div class="p-3 rounded-xl border ${highlight ? "border-sky-200 bg-sky-50" : "border-slate-100 bg-slate-50"}">
            <div class="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>${districtEsc(districtFormatDate(evt))}${journee ? " · " + districtEsc(journee) : ""}</span>
                <span>${highlight ? (isHome ? "Domicile" : "Extérieur") : ""}</span>
            </div>
            <div class="mt-1 flex items-center justify-between gap-2">
                <p class="text-xs font-bold text-slate-800 min-w-0">${districtEsc(districtMatchLabel(evt))}</p>
                ${withScore && score
                    ? `<span class="shrink-0 text-sm font-extrabold text-slate-900 tabular-nums">${score[0]} - ${score[1]}</span>`
                    : (time ? `<span class="shrink-0 text-xs font-bold text-slate-600">${districtEsc(time)}</span>` : "")}
            </div>
        </div>`;
}

function renderDistrictCalendar() {
    const container = document.getElementById("district-calendar");
    if (!container) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = (districtState.matches || [])
        .filter(evt => {
            if (districtScore(evt)) return false;
            const raw = districtMatchDate(evt);
            if (!raw) return false;
            const date = new Date(raw + "T12:00:00");
            return !isNaN(date.getTime()) && date >= today;
        })
        .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
        .slice(0, 8);

    container.innerHTML = upcoming.length
        ? upcoming.map(evt => districtMatchCard(evt, false)).join("")
        : `<p class="text-xs text-slate-500">Aucun match à venir pour cette compétition.</p>`;
}

function renderDistrictResults() {
    const container = document.getElementById("district-results");
    if (!container) return;

    const played = (districtState.matches || [])
        .filter(evt => !!districtScore(evt))
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
        .slice(0, 10);

    container.innerHTML = played.length
        ? played.map(evt => districtMatchCard(evt, true)).join("")
        : `<p class="text-xs text-slate-500">Aucun résultat publié pour cette compétition.</p>`;
}

function districtManualMatches(cpNo) {
    const raw = (state.fffCompJson || {})[String(cpNo)];
    if (!raw || !String(raw).trim()) return [];
    try {
        const obj = JSON.parse(raw);
        const list = Array.isArray(obj) ? obj : (obj && obj["hydra:member"]);
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

async function loadDistrictMatches(force) {
    const cpNo = districtState.cpNo;
    if (!cpNo) {
        districtState.matches = [];
        districtState.standings = null;
        districtState.error = "";
        renderDistrict();
        return;
    }

    if (!force) {
        const cached = districtCacheRead(cpNo);
        if (cached) {
            districtState.matches = cached.matches || [];
            districtState.standings = cached.standings || null;
            districtState.lastSync = cached.at || Date.now();
            districtState.source = cached.source || "";
            districtState.phaseNo = cached.phaseNo || districtState.phaseNo;
            districtState.pouleNo = cached.pouleNo || districtState.pouleNo;
            districtState.error = "";
            renderDistrict();
            return;
        }
    }

    districtState.loading = true;
    districtState.error = "";
    renderDistrict();

    try {
        let matches = [];
        let standings = null;
        let source = "";
        let usedPhase = districtState.phaseNo || "";
        let usedPoule = districtState.pouleNo || "";

        const selected = (districtState.competitions || []).find(c => String(c.cp_no) === String(cpNo));
        if (!usedPhase && selected && selected.phaseNo) usedPhase = String(selected.phaseNo);
        if (!usedPoule && selected && selected.pouleNo) usedPoule = String(selected.pouleNo);

        // 1) Nouveaux endpoints officiels par phase/poule (données à jour).
        if (usedPhase || usedPoule) {
            const official = await fetchDistrictOfficial({
                cpNo: cpNo,
                phaseNo: usedPhase,
                pouleNo: usedPoule
            });

            matches = official.matches || [];
            standings = official.standings || null;
            usedPhase = official.phaseNo || usedPhase;
            usedPoule = official.pouleNo || usedPoule;
            if (matches.length || standings) source = "official";
        }

        // 2) Ancien endpoint global de la compétition, puis JSON collé.
        if (!matches.length) {
            let liveError = null;
            let fromManual = false;

            try {
                matches = await fetchFFFCompetitionMatches(Number(cpNo));
            } catch (liveErr) {
                liveError = liveErr;
            }

            if (!matches.length) {
                matches = districtManualMatches(cpNo);
                fromManual = matches.length > 0;
            }

            if (!matches.length && liveError) throw liveError;
            source = fromManual ? "manual" : "live";
        }

        districtState.matches = Array.isArray(matches) ? matches : [];
        districtState.standings = standings;
        districtState.source = source;
        districtState.phaseNo = usedPhase;
        districtState.pouleNo = usedPoule;
        districtState.lastSync = Date.now();
        districtCacheWrite(cpNo, districtState.matches, {
            standings: standings,
            source: source,
            phaseNo: usedPhase,
            pouleNo: usedPoule
        });
    } catch (err) {
        console.error("District : récupération des matchs impossible", err);
        districtState.matches = [];
        districtState.standings = null;
        districtState.error = "Données de la compétition inaccessibles (" + err.message + "). Colle son JSON ci-dessous.";
    } finally {
        districtState.loading = false;
        renderDistrict();
    }
}

async function refreshDistrict(force) {
    if (districtState.loading) return;

    // Évite de relancer une tentative réseau à chaque synchronisation Firebase
    // quand l'API est bloquée et qu'aucune compétition n'est connue.
    if (!force && !(districtState.competitions || []).length) {
        if (districtState.lastAttempt && Date.now() - districtState.lastAttempt < 60000) return;
    }
    districtState.lastAttempt = Date.now();

    districtState.loading = true;
    districtState.error = "";
    updateDistrictStatus("⏳ Connexion au district…");

    let remoteCompetitions = [];
    let calendarError = null;

    try {
        if (force || !(districtState.competitions || []).length) {
            try {
                const calendar = await fetchFFFCalendar();
                remoteCompetitions = remoteCompetitions.concat(fffGroupCompetitions(calendar));
            } catch (calendarErr) {
                calendarError = calendarErr;
            }

            try {
                remoteCompetitions = remoteCompetitions.concat(await fetchFFFClubEngagements());
            } catch (engErr) {
                calendarError = calendarError || engErr;
            }
        }
    } catch (err) {
        calendarError = err;
        console.warn("District : calendrier/engagements inaccessibles, utilisation des données locales", err);
    }

    districtState.competitions = districtMergeCompetitions(
        remoteCompetitions,
        districtLocalCompetitions(),
        districtState.competitions || []
    );

    if (!districtState.competitions.length) {
        districtState.error = "API FFF inaccessible depuis ce poste. Renseigne le n° de compétition ci-dessous, ou lance « node proxy-local.js ».";
        if (calendarError) console.warn("District : " + calendarError.message);
        districtState.loading = false;
        renderDistrict();
        return;
    }

    districtState.loading = false;

    const categories = districtCategories();
    if (!districtState.category && categories.length) {
        const u14 = categories.find(cat => cat.toUpperCase().indexOf("U14") !== -1);
        districtState.category = u14 || categories[0];
    }

    const previousCp = districtState.cpNo;
    const competitions = districtCompetitionsForCategory();
    if (!districtState.cpNo || !competitions.some(comp => String(comp.cp_no) === String(districtState.cpNo))) {
        const linked = competitions.find(comp => state.fffLinks && state.fffLinks[comp.cp_no]);
        districtState.cpNo = competitions.length ? String((linked || competitions[0]).cp_no) : "";
    }

    if (String(previousCp) !== String(districtState.cpNo)) {
        districtState.phaseNo = "";
        districtState.pouleNo = "";
    }

    const selectedComp = competitions.find(comp => String(comp.cp_no) === String(districtState.cpNo));
    if (selectedComp && selectedComp.phaseNo) districtState.phaseNo = String(selectedComp.phaseNo);
    if (selectedComp && selectedComp.pouleNo) districtState.pouleNo = String(selectedComp.pouleNo);

    await loadDistrictMatches(!!force);
}

function saveDistrictJson() {
    const textarea = document.getElementById("district-json-input");
    const value = (textarea && textarea.value || "").trim();

    if (!districtState.cpNo) {
        showToast("⚠️ Choisis d'abord une compétition", "error");
        return;
    }

    if (!value) {
        showToast("⚠️ Colle le JSON de la compétition", "error");
        return;
    }

    let matches = [];

    try {
        const obj = JSON.parse(value);
        const list = Array.isArray(obj) ? obj : (obj && obj["hydra:member"]);
        if (!Array.isArray(list) || list.length === 0) throw new Error("Aucun match dans ce JSON");
        matches = list;
    } catch (err) {
        showToast("❌ JSON invalide : " + err.message, "error");
        return;
    }

    state.fffCompJson = state.fffCompJson || {};
    state.fffCompJson[districtState.cpNo] = value;
    saveStateToFirebase();

    if (textarea) textarea.value = "";

    // Affichage immédiat : pas besoin d'attendre l'API (qui peut être bloquée).
    districtState.matches = matches;
    districtState.standings = null;
    districtState.source = "manual";
    districtState.lastSync = Date.now();
    districtState.error = "";
    districtCacheWrite(districtState.cpNo, matches);
    renderDistrict();

    showToast("✅ JSON enregistré : classement et résultats mis à jour");
}

function onDistrictCategoryChange(value) {
    districtState.category = value || "";
    districtState.cpNo = "";
    districtState.phaseNo = "";
    districtState.pouleNo = "";
    districtState.matches = [];
    districtState.standings = null;
    districtState.error = "";

    const competitions = districtCompetitionsForCategory();
    if (competitions.length) {
        const linked = competitions.find(comp => state.fffLinks && state.fffLinks[comp.cp_no]);
        districtState.cpNo = String((linked || competitions[0]).cp_no);
    }

    renderDistrict();
    if (districtState.cpNo) loadDistrictMatches(false);
}

function onDistrictCompetitionChange(value) {
    const comp = (districtState.competitions || []).find(c => String(c.cp_no) === String(value));

    districtState.cpNo = value || "";
    districtState.phaseNo = comp && comp.phaseNo ? String(comp.phaseNo) : "";
    districtState.pouleNo = comp && comp.pouleNo ? String(comp.pouleNo) : "";
    districtState.matches = [];
    districtState.standings = null;
    districtState.error = "";
    renderDistrict();
    if (districtState.cpNo) loadDistrictMatches(false);
}

function openModalTeam(teamId = null) {

    const titleEl = document.getElementById('modal-team-title');
    const idHidden = document.getElementById('team-id');
    const keyInput = document.getElementById('team-key');
    const nameInput = document.getElementById('team-name');
    const targetInput = document.getElementById('team-target');
    const form = document.getElementById('form-team');

    if (form) form.reset();

    if (teamId && state.teams?.[teamId]) {

        const team = state.teams[teamId];

        if (titleEl) titleEl.textContent = "Modifier l'équipe";
        if (idHidden) idHidden.value = teamId;
        if (keyInput) {
            keyInput.value = teamId;
            keyInput.disabled = true;
        }
        if (nameInput) nameInput.value = team.name || '';
        if (targetInput) targetInput.value = team.targetConvocations || 14;
        const orderInputTeam = document.getElementById('team-name-order');
        if (orderInputTeam) orderInputTeam.checked = team.nameOrder === 'first';

    } else {

        if (titleEl) titleEl.textContent = 'Nouvelle équipe';
        if (idHidden) idHidden.value = '';
        if (keyInput) {
            keyInput.value = '';
            keyInput.disabled = false;
        }
        if (targetInput) targetInput.value = 14;
        const orderInputNew = document.getElementById('team-name-order');
        if (orderInputNew) orderInputNew.checked = false;

    }

    toggleModal('modal-team', true);
}
function editTeam(teamId) {
    openModalTeam(teamId);
}

function handleSaveTeamModal(event) {
    event.preventDefault();

    const existingId = document.getElementById('team-id').value;
    const keyInput = document.getElementById('team-key');
    const nameInput = document.getElementById('team-name');
    const targetInput = document.getElementById('team-target');

    const key = existingId || (keyInput.value.trim().toLowerCase());
    const name = nameInput.value.trim();
    const target = parseInt(targetInput.value) || 14;

    if (!key || !name) return;

    const orderInputSave = document.getElementById('team-name-order');
    const nameOrder = orderInputSave && orderInputSave.checked ? 'first' : 'last';

    firebase.database().ref('teams/' + key).set({
        ...(state.teams?.[key] || {}),
        name: name,
        targetConvocations: target,
        nameOrder: nameOrder
    }, (error) => {
        if (error) {
            showToast("Erreur lors de l'enregistrement de l'équipe.", "error");
            return;
        }
        toggleModal('modal-team', false);
        showToast("✅ Équipe enregistrée");
    });
}

window.openModalTeam = openModalTeam;
window.editTeam = editTeam;
window.deleteTeam = deleteTeam;
window.handleSaveTeamModal = handleSaveTeamModal;

function showFunctionSelector(userData) {

    const screen =
        document.getElementById(
            "function-selector-screen"
        );

    const list =
        document.getElementById(
            "function-selector-list"
        );

    const pinScreen =
        document.getElementById(
            "pin-screen"
        );

    if (pinScreen) {
        pinScreen.style.display = "none";
    }

    if (!screen || !list) return;

    list.innerHTML = "";

    const nameEl =
        document.getElementById(
            "fs-user-name"
        );

    if (nameEl && userData.name) {
        nameEl.textContent = userData.name;
    }

    const iconFor = (name = "") => {
        if (name.includes("Administrateur")) {
            return '<i class="fa-solid fa-shield-halved"></i>';
        }
        if (name.startsWith("Responsable")) {
            return '<i class="fa-solid fa-user-gear"></i>';
        }
        if (name.includes("Éducateur")) {
            return '<i class="fa-solid fa-graduation-cap"></i>';
        }
        if (name.toLowerCase().includes("coach")) {
            return '<i class="fa-solid fa-chalkboard-user"></i>';
        }
        if (name.includes("Dirigeant")) {
            return '<i class="fa-solid fa-handshake"></i>';
        }
        return '<i class="fa-solid fa-circle-user"></i>';
    };

    (userData.functions || [])
    .forEach((func, index) => {

            const scopes =
                (func.scopes || [])
                .map(scope =>
                    state.teams?.[scope]?.name ||
                    scope
                )
                .join(", ");

            const scopeLine = scopes
                ? `<i class="fa-solid fa-location-dot"></i> ${scopes}`
                : `<i class="fa-solid fa-earth-europe"></i> Accès global`;

            list.innerHTML += `

                <button
                    type="button"
                    class="fs-option"
                    onclick="selectFunction('${userData.pin}', ${index})">

                    <span class="fs-option-icon">
                        ${iconFor(func.functionName)}
                    </span>

                    <span class="fs-option-text">
                        <span class="fs-option-title">
                            ${func.functionName}
                        </span>
                        <span class="fs-option-scope">
                            ${scopeLine}
                        </span>
                    </span>

                    <i class="fa-solid fa-chevron-right fs-option-arrow"></i>

                </button>

            `;

        });

        screen.classList.remove("hidden");

}

function hideFunctionSelector() {

    document
        .getElementById(
            "function-selector-screen"
        )
        ?.classList.add("hidden");

}

window.selectFunction = function (
    pin,
    functionIndex
) {

    firebase.database()
        .ref("rangueil_data/access/" + pin)
        .once("value")
        .then(snapshot => {

            if (!snapshot.exists()) {
                return;
            }

            const userData =
                snapshot.val();
if (userData.role === "admin") {

    window.currentUserRole = "admin";

    window.currentUserName =
        userData.name;

    window.currentUserTeam = "all";

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
    (userData.functions || [])
    [functionIndex];

            if (!selectedFunction) {
                return;
            }

            let role = "public";

            if (
    selectedFunction.functionName ===
    "Administrateur système"
) {
    role = "admin";
}

            const functionName =
    selectedFunction.functionName || "";

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

            window.currentUserPin =
                pin;

            window.currentUserRole =
                role;

            window.currentUserName =
                userData.name;

            window.currentUserTeam =
                (selectedFunction.scopes || [])
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

            hideFunctionSelector();

            const pinScreen =
                document.getElementById(
                    "pin-screen"
                );

            if (pinScreen) {

                pinScreen.style.opacity =
                    "0";

                setTimeout(() => {

                    pinScreen.remove();

                    applyPermissions();
                }, 300);

            }

        });

};

function buildStaffFromAccounts(accounts) {

    const technicalFunctions = [
        "Administrateur système",
        "Administrateur adjoint"
    ];

    const staff = [];

    Object.values(accounts || {})
        .forEach(user => {

            (user.functions || [])
                .forEach(func => {

                    if (
                        technicalFunctions.includes(
                            func.functionName
                        )
                    ) {
                        return;
                    }

                    staff.push({
                        name: user.name,
                        licence: user.licence || "",
                        functionName:
                            func.functionName,
                        scopes:
                            func.scopes || []
                    });

                });

        });

    return staff;

}

function getTeamFamily(teamKey) {
    const teamName =
        (state.teams?.[teamKey]?.name || "")
        .toLowerCase();

    if (
        ["u6","u7","u8","u9","u10","u11"]
        .some(age => teamName.includes(age))
    ) {
        return "École de Foot";
    }

    if (
        ["u12","u13","u14","u15","u16","u17","u18"]
        .some(age => teamName.includes(age))
    ) {
        return "Jeunes";
    }

    return "Seniors";
}
async function renderStaffV2() {

    const container =
        document.getElementById(
            "staff-full-container"
        );

     const directionContainer =
    document.getElementById("staff-direction");

const functionsContainer =
    document.getElementById("staff-functions");

    

const teamsContainer =
    document.getElementById("staff-teams");   

    if (!container) return;

    const snapshot =
        await firebase.database()
            .ref("rangueil_data/access")
            .once("value");

    const accounts =
        snapshot.val() || {};

    const staff =
        buildStaffFromAccounts(
            accounts
        );

       const direction = [];
const clubFunctions = [];
const sportManagement = [];
const directionRoles = [
    "Président",
    "Vice-président",
    "Secrétaire",
    "Secrétaire Général",
    "Trésorier",
    "Trésorier adjoint",
    "Directeur Sportif",
    "Responsable Technique"

];

const sportRoles = [
    "Directeur Sportif",
    "Responsable École de Foot",
    "Responsable Seniors",
    "Responsable Catégorie"
];

const clubRoles = [
    "Correspondant Footclubs",
    "Community Manager",
    "Intendant",
    "Responsable Communication",
    "Responsable Partenaires",
    "Responsable Arbitrage",
    "Responsable Équipements",
    "Responsable Terrains",
    "Responsable Tournois",
    "Responsable Transport",
    "Responsable Buvette",
    "Responsable Manifetations",
    "Référent PEF",
    "Référent Féminines",
    "Référent Handicap",
    "Référent Protection des Mineurs"
];
const teamGroups = {
    "École de Foot": {},
    "Jeunes": {},
    "Seniors": {}
};


    directionContainer.innerHTML = "";
functionsContainer.innerHTML = "";
teamsContainer.innerHTML = "";

   staff.forEach(member => {

    if (
        directionRoles.includes(
            member.functionName
        )
    ) {
        direction.push(member);
        return;
    }

    if (
    sportRoles.includes(
        member.functionName
    )
) {
    sportManagement.push(member);
    return;
}

    if (
        clubRoles.includes(
            member.functionName
        )
    ) {
        clubFunctions.push(member);
        return;
    }

    member.scopes.forEach(scope => {

        const family =
            getTeamFamily(scope);

        if (!teamGroups[family][scope]) {
            teamGroups[family][scope] = [];
        }
        const exists =
    teamGroups[family][scope]
        .some(m =>
            m.name === member.name &&
            m.functionName === member.functionName
        );

if (!exists) {
    teamGroups[family][scope].push(member);
}

    });

});
 
directionContainer.innerHTML += `

<div class="col-span-full">

    <h2 class="text-xl font-bold mb-4">

        👔 Direction

    </h2>

</div>

`;
const directionOrder = {
    "Président": 1,
    "Vice-président": 2,
    "Secrétaire Général": 3,
    "Trésorier": 4,
    "Secrétaire": 5,
    "Trésorier adjoint": 6
};

direction.sort((a, b) =>
    (directionOrder[a.functionName] || 99)
    - (directionOrder[b.functionName] || 99)
);
direction.forEach(member => {

    directionContainer.innerHTML += `

    <div class="bg-white p-4 rounded-xl border">

        <div class="font-bold">

            ${member.name}

        </div>

        <div class="text-sky-700 mt-1">

            👔 ${member.functionName}

        </div>

    </div>

    `;

});

functionsContainer.innerHTML += `
<div class="col-span-full mt-6">
    <h2 class="text-xl font-bold mb-4">
        ⚽ Organisation Sportive
    </h2>
</div>
`;

const sportOrder = {
    "Directeur Sportif": 1,
    "Responsable École de Foot": 2,
    "Responsable Seniors": 3,
    "Responsable Catégorie": 4
};

sportManagement.sort((a, b) =>
    (sportOrder[a.functionName] || 99) -
    (sportOrder[b.functionName] || 99)
);

sportManagement.forEach(member => {

    functionsContainer.innerHTML += `
        <div class="bg-white p-4 rounded-xl border">

            <div class="font-bold text-slate-800">
                ${member.name}
            </div>

            <div class="text-sm text-sky-700 mt-1">
                ⚽ ${member.functionName}
            </div>

        </div>
    `;

});


functionsContainer.innerHTML += `
<div class="col-span-full mt-6">
    <h2 class="text-xl font-bold mb-4">
        ⚙️ Fonctions Club
    </h2>
</div>
`;

clubFunctions.forEach(member => {


    const scopes =
        member.scopes
            .map(scope =>
                state.teams?.[scope]?.name
                || scope
            )
            .join(", ");

    functionsContainer.innerHTML += `

    <div class="bg-white p-4 rounded-xl border">

        <div class="font-bold text-slate-800">

            ${member.name}

        </div>

        <div class="text-sm text-sky-700 mt-1">

           👔 ${member.functionName}

        </div>

        <div class="text-xs text-slate-500 mt-1">

            📍 ${scopes}

        </div>

    </div>

    `;

});

Object.entries(teamGroups).forEach(([poleName, teams]) => {

    let teamsHtml = "";

    Object.entries(teams)
.sort(([a], [b]) => {

    const nameA =
        state.teams?.[a]?.name || a;

    const nameB =
        state.teams?.[b]?.name || b;

    const numA =
        parseInt(
            (nameA.match(/U(\d+)/i) || [])[1]
        ) || 999;

    const numB =
        parseInt(
            (nameB.match(/U(\d+)/i) || [])[1]
        ) || 999;

    return numA - numB;

})
.forEach(([teamKey, members]) => {

        const teamName =
            state.teams?.[teamKey]?.name || teamKey;

        

        let membersHtml = "";

members
    .filter(member =>
        member.functionName !== "Responsable Catégorie" &&
        member.functionName !== "Responsable catégorie"
    )
    .forEach(member => {

        membersHtml += `
            <div class="bg-slate-50 p-3 rounded-lg">

                <div class="font-bold text-slate-800">
                    ${member.name}
                </div>

                <div class="text-sm text-sky-700">
                    ${member.functionName}
                </div>

            </div>
        `;

    });

teamsHtml += `
    <div class="ml-4 border-l-4 border-sky-200 pl-4">

        <details class="bg-white border rounded-xl overflow-hidden">

            <summary class="cursor-pointer p-3 font-semibold text-slate-800">
                ⚽ ${teamName}
            </summary>

            <div class="p-4 border-t flex flex-col gap-2">
                ${membersHtml}
            </div>

        </details>

    </div>
`;
    

    });

   teamsContainer.innerHTML += `
    <div class="mt-6">

        <details open class="bg-slate-100 rounded-xl overflow-hidden">

            <summary class="cursor-pointer p-4 font-bold text-slate-900">
                ⚽ ${poleName}
            </summary>

            <div class="p-4 flex flex-col gap-4">
                ${teamsHtml}
            </div>

        </details>

    </div>
`;

});

}
const POSTE_LIBELLES = {
    AD: 'Ailier droit',
    AG: 'Ailier gauche',
    BU: 'Buteur',
    DC: 'Défenseur central',
    DD: 'Défenseur droit',
    DG: 'Défenseur gauche',
    MC: 'Milieu central',
    MDC: 'Milieu défensif',
    MD: 'Milieu défensif',
    MO: 'Milieu offensif',
    MOC: 'Milieu offensif central',
    GB: 'Gardien',
    Gardien: 'Gardien',
    Remplaçant: 'Remplaçant'
};

function getPosteLabel(code) {
    if (!code) return '';
    const key = String(code).trim();
    return POSTE_LIBELLES[key] || key;
}

function getFirstName(player) {
    if (!player) return '';
    return (player.name || '').split(' ').pop();
}

    /* ============================================================
       TERRAIN DE COMPOSITION — tracé, joueurs, numérotation
       ============================================================ */

    const PITCH_W = 68;   // largeur, touche à touche (m)
    const PITCH_L = 105;  // longueur, but à but (m)

    const SLOT_LABELS = {
        GB: 'Gardien',
        DG: 'Latéral gauche',
        DD: 'Latéral droit',
        DC1: 'Défenseur central gauche',
        DC2: 'Défenseur central',
        DC3: 'Défenseur central droit',
        MG: 'Milieu gauche',
        MD: 'Milieu droit',
        MC1: 'Milieu central',
        MC2: 'Milieu central',
        MC3: 'Milieu central',
        MDF: 'Milieu défensif',
        MDF1: 'Milieu défensif gauche',
        MDF2: 'Milieu défensif droit',
        MOG: 'Ailier gauche',
        MOD: 'Ailier droit',
        MOC: 'Meneur offensif',
        AT1: 'Attaquant gauche',
        AT2: 'Attaquant droit',
        BU: 'Buteur',
        AG: 'Ailier gauche',
        AD: 'Ailier droit'
    };

    function getSlotLabel(slot) {
        return SLOT_LABELS[slot] || slot;
    }

    const TEAM_HEX = {
        sky: '#0ea5e9', blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6',
        purple: '#a855f7', fuchsia: '#d946ef', pink: '#ec4899', rose: '#f43f5e',
        red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
        lime: '#84cc16', green: '#22c55e', emerald: '#10b981', teal: '#14b8a6',
        cyan: '#06b6d4', slate: '#64748b', gray: '#6b7280', zinc: '#71717a',
        neutral: '#737373', stone: '#78716c',
        skyDark: '#0369a1', blueDark: '#1d4ed8'
    };

    function getTeamHex(teamKey) {
        const color = state.teams?.[teamKey]?.color || 'slate';
        return TEAM_HEX[color] || TEAM_HEX[String(color).replace(/Dark$/, '')] || '#475569';
    }

    // Tracé du terrain : dessiné dans un repère « longueur verticale »
    // (x = largeur 68 m, y = longueur 105 m), puis pivoté pour l'affichage PC.
    function buildPitchSVG(orientation) {
        const W = PITCH_W;
        const L = PITCH_L;
        const isPortrait = orientation === 'portrait';
        const uid = isPortrait ? 'p' : 'l';
        const line = 'rgba(255,255,255,.82)';
        const sw = 0.3;

        let stripes = '';
        const bands = 12;
        for (let i = 0; i < bands; i++) {
            const h = L / bands;
            stripes += '<rect x="0" y="' + (i * h).toFixed(2) + '" width="' + W + '" height="' + (h + 0.06).toFixed(2) + '" fill="' + (i % 2 ? '#37b24d' : '#2f9e44') + '"/>';
        }

        const boxW = 40.32;
        const boxD = 16.5;
        const goalW = 18.32;
        const goalD = 5.5;
        const spot = 11;
        const bx = (W - boxW) / 2;
        const gx = (W - goalW) / 2;
        const mouth = (W - 7.32) / 2;

        const body =
            stripes +
            '<g fill="none" stroke="' + line + '" stroke-width="' + sw + '">' +
                '<rect x="' + (sw / 2) + '" y="' + (sw / 2) + '" width="' + (W - sw) + '" height="' + (L - sw) + '"/>' +
                '<line x1="0" y1="' + (L / 2) + '" x2="' + W + '" y2="' + (L / 2) + '"/>' +
                '<circle cx="' + (W / 2) + '" cy="' + (L / 2) + '" r="9.15"/>' +
                '<rect x="' + bx + '" y="0" width="' + boxW + '" height="' + boxD + '"/>' +
                '<rect x="' + bx + '" y="' + (L - boxD) + '" width="' + boxW + '" height="' + boxD + '"/>' +
                '<rect x="' + gx + '" y="0" width="' + goalW + '" height="' + goalD + '"/>' +
                '<rect x="' + gx + '" y="' + (L - goalD) + '" width="' + goalW + '" height="' + goalD + '"/>' +
                '<path d="M0 1 A1 1 0 0 1 1 0"/>' +
                '<path d="M' + (W - 1) + ' 0 A1 1 0 0 1 ' + W + ' 1"/>' +
                '<path d="M' + W + ' ' + (L - 1) + ' A1 1 0 0 1 ' + (W - 1) + ' ' + L + '"/>' +
                '<path d="M1 ' + L + ' A1 1 0 0 1 0 ' + (L - 1) + '"/>' +
            '</g>' +
            '<circle cx="' + (W / 2) + '" cy="' + (L / 2) + '" r="0.42" fill="' + line + '"/>' +
            '<circle cx="' + (W / 2) + '" cy="' + spot + '" r="0.42" fill="' + line + '"/>' +
            '<circle cx="' + (W / 2) + '" cy="' + (L - spot) + '" r="0.42" fill="' + line + '"/>' +
            '<defs>' +
                '<clipPath id="pc-' + uid + '-a"><rect x="0" y="' + boxD + '" width="' + W + '" height="' + (L - boxD) + '"/></clipPath>' +
                '<clipPath id="pc-' + uid + '-b"><rect x="0" y="0" width="' + W + '" height="' + (L - boxD) + '"/></clipPath>' +
            '</defs>' +
            '<g fill="none" stroke="' + line + '" stroke-width="' + sw + '">' +
                '<circle cx="' + (W / 2) + '" cy="' + spot + '" r="9.15" clip-path="url(#pc-' + uid + '-a)"/>' +
                '<circle cx="' + (W / 2) + '" cy="' + (L - spot) + '" r="9.15" clip-path="url(#pc-' + uid + '-b)"/>' +
            '</g>' +
            '<g fill="rgba(255,255,255,.12)" stroke="' + line + '" stroke-width="' + sw + '">' +
                '<rect x="' + mouth + '" y="0" width="7.32" height="1.7"/>' +
                '<rect x="' + mouth + '" y="' + (L - 1.7) + '" width="7.32" height="1.7"/>' +
            '</g>' +
            // Filets des buts
            '<g stroke="rgba(255,255,255,.45)" stroke-width="0.16">' +
            Array.from({ length: 7 }, (_, i) => {
                const x = mouth + (i * 7.32) / 6;
                return '<line x1="' + x + '" y1="0" x2="' + x + '" y2="1.7"/>' +
                       '<line x1="' + x + '" y1="' + (L - 1.7) + '" x2="' + x + '" y2="' + L + '"/>';
            }).join('') +
            Array.from({ length: 2 }, (_, i) => {
                const y = (i + 1) * 0.56;
                return '<line x1="' + mouth + '" y1="' + y + '" x2="' + (mouth + 7.32) + '" y2="' + y + '"/>' +
                       '<line x1="' + mouth + '" y1="' + (L - y) + '" x2="' + (mouth + 7.32) + '" y2="' + (L - y) + '"/>';
            }).join('') +
            '</g>';

        if (isPortrait) {
            return '<svg class="pitch-svg md:hidden" viewBox="0 0 ' + W + ' ' + L + '" preserveAspectRatio="none" aria-hidden="true">' + body + '</svg>';
        }

        return '<svg class="pitch-svg hidden md:block" viewBox="0 0 ' + L + ' ' + W + '" preserveAspectRatio="none" aria-hidden="true">' +
            '<g transform="translate(' + L + ',0) rotate(90)">' + body + '</g>' +
            '</svg>';
    }

    // Numérotation classique : un numéro par poste, selon le système de jeu.
    const FORMATION_JERSEYS = {
        // 4-3-3 : meneur offensif (le plus haut) 10, relayeur 8, milieu défensif 6
        '433':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MC1: 6, MC2: 10, MC3: 8, AG: 11, BU: 9, AD: 7 },
        '442':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MG: 11, MC1: 6, MC2: 8, MD: 7, AT1: 9, AT2: 10 },
        '352':  { GB: 1, DC1: 4, DC2: 5, DC3: 6, MG: 2, MC1: 8, MC2: 10, MC3: 11, MD: 3, AT1: 9, AT2: 7 },
        '4231': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MDF1: 6, MDF2: 8, MOG: 11, MOC: 10, MOD: 7, BU: 9 },
        '4141': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MDF: 6, MG: 11, MC1: 8, MC2: 10, MD: 7, BU: 9 },
        '451':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MG: 11, MC1: 6, MC2: 10, MC3: 8, MD: 7, BU: 9 },
        '343':  { GB: 1, DC1: 4, DC2: 5, DC3: 6, MG: 2, MC1: 8, MC2: 10, MD: 3, AG: 11, BU: 9, AD: 7 },
        '532':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DC3: 6, DD: 2, MC1: 8, MC2: 10, MC3: 7, AT1: 9, AT2: 11 },
        '541':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DC3: 6, DD: 2, MG: 11, MC1: 8, MC2: 10, MD: 7, BU: 9 },
        '4312': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MC1: 6, MC2: 8, MC3: 11, MOC: 10, AT1: 9, AT2: 7 },
        '4222': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MDF1: 6, MDF2: 8, MOG: 11, MOD: 7, AT1: 9, AT2: 10 }
    };

    // Utilisé seulement si un poste inconnu apparaît dans une formation
    const SLOT_JERSEY = {
        GB: 1, DD: 2, DG: 3, DC1: 4, DC2: 5, DC3: 6,
        MDF: 6, MDF1: 6, MDF2: 8, MC1: 6, MC2: 10, MC3: 8,
        MOC: 10, MD: 7, MG: 11, MOD: 7, MOG: 11, AD: 7, AG: 11,
        BU: 9, AT1: 9, AT2: 10
    };

    // Numéros automatiques : titulaires selon leur poste, banc 12-14
    function computeAutoJerseyMap(match) {
        const map = {};
        if (!match) return map;

        const formationKey = match.currentFormation || '433';
        const slots = getFormationSlots(formationKey);
        const table = FORMATION_JERSEYS[formationKey] || FORMATION_JERSEYS['433'];
        const assigned = match.slotAssignments || {};
        const used = new Set();

        const firstFree = () => {
            for (let n = 1; n <= 11; n++) if (!used.has(n)) return n;
            return null;
        };

        slots.forEach(s => {
            const pid = assigned[s.slot];
            if (!pid || map[pid] != null) return;

            let number = table[s.slot];
            if (!number || used.has(number)) number = SLOT_JERSEY[s.slot];
            if (!number || used.has(number)) number = firstFree();
            if (number == null) return;

            used.add(number);
            map[pid] = number;
        });

        // Trois remplaçants au maximum sur la feuille : 12, 13 puis 14,
        // dans l'ordre du banc. Au-delà, pas de numéro.
        const targetConvoked = parseInt(state.teams?.[match.team]?.targetConvocations) || 14;
        const maxSubs = Math.min(3, Math.max(0, targetConvoked - 11));

        getCompositionBenchPlayers(match).forEach((p, i) => {
            map[p.id] = i < maxSubs ? 12 + i : null;
        });

        return map;
    }

    // Numéros affichés : titulaires 1-11, remplaçants 12-14, surcharge manuelle encadrée
    function computeMatchJerseys(match) {
        const autoMap = computeAutoJerseyMap(match);
        const out = {};

        Object.entries(autoMap).forEach(([pid, number]) => {
            out[pid] = { number: number, auto: true, duplicate: false, ignored: false };
        });

        const assigned = Object.values(match?.slotAssignments || {});
        const used = new Set(
            Object.values(out).map(j => j.number).filter(n => n != null)
        );

        Object.entries(match?.jerseys || {}).forEach(([pid, value]) => {
            const n = parseInt(value, 10);
            if (!n) return;

            const starter = assigned.includes(pid);
            const min = starter ? 1 : 12;
            const max = starter ? 11 : 14;

            if (!out[pid]) out[pid] = { number: null, auto: false, duplicate: false, ignored: false };

            // Le numéro déjà attribué automatiquement : on garde l'automatique
            if (out[pid].number === n) return;

            // Hors de la plage du rôle, ou déjà pris ailleurs : on ignore la surcharge
            if (n < min || n > max || used.has(n)) {
                out[pid].ignored = true;
                return;
            }

            if (out[pid].number != null) used.delete(out[pid].number);

            out[pid].number = n;
            out[pid].auto = false;
            used.add(n);
        });

        const counts = {};
        Object.values(out).forEach(j => {
            if (j.number != null) counts[j.number] = (counts[j.number] || 0) + 1;
        });
        Object.values(out).forEach(j => {
            j.duplicate = j.number != null && counts[j.number] > 1;
        });

        return out;
    }

    function getJerseyNumber(match, playerId) {
        const jersey = computeMatchJerseys(match)[playerId];
        return jersey && jersey.number != null ? jersey.number : '';
    }

    const FORMATIONS = [
        { key: '433', label: '4-3-3' },
        { key: '442', label: '4-4-2' },
        { key: '352', label: '3-5-2' },
        { key: '4231', label: '4-2-3-1' },
        { key: '4141', label: '4-1-4-1' },
        { key: '451', label: '4-5-1' },
        { key: '343', label: '3-4-3' },
        { key: '532', label: '5-3-2' },
        { key: '541', label: '5-4-1' },
        { key: '4312', label: '4-3-1-2' },
        { key: '4222', label: '4-2-2-2' }
    ];

    const JERSEY_PATH = 'M25 6 Q32 12 39 6 L52 13 L58 29 L46 35 L46 58 Q46 62 42 62 L22 62 Q18 62 18 58 L18 35 L6 29 L12 13 Z';

    // Un numéro doit rester lisible : on choisit blanc ou encre selon la clarté du maillot
    function isLightColor(hex) {
        const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
        if (!m) return false;
        const n = parseInt(m[1], 16);
        const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
    }

    function jerseyMarkup(teamHex, number, duplicate) {
        const ink = isLightColor(teamHex) ? '#0f172a' : '#ffffff';
        return `
            <span class="jersey-box" style="color:${teamHex}" data-ink="${ink}">
                <svg viewBox="0 0 64 64" class="jersey-svg" aria-hidden="true">
                    <defs>
                        <linearGradient id="jersey-light" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stop-color="#ffffff" stop-opacity=".32"/>
                            <stop offset=".55" stop-color="#ffffff" stop-opacity="0"/>
                            <stop offset="1" stop-color="#000000" stop-opacity=".22"/>
                        </linearGradient>
                        <clipPath id="jersey-clip"><path d="${JERSEY_PATH}"/></clipPath>
                    </defs>
                    <path d="${JERSEY_PATH}" fill="currentColor" stroke="rgba(15,23,42,.35)" stroke-width="2"/>
                    <path d="${JERSEY_PATH}" fill="url(#jersey-light)"/>
                    <g clip-path="url(#jersey-clip)" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width="1.6">
                        <path d="M25 7 Q32 14 39 7"/>
                        <path d="M18 34 L18 60"/>
                        <path d="M46 34 L46 60"/>
                    </g>
                    <path d="${JERSEY_PATH}" fill="none" stroke="rgba(255,255,255,.28)" stroke-width=".8"/>
                </svg>
                <span class="jersey-num" style="color:${ink};text-shadow:0 1px 2px ${ink === '#ffffff' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.45)'}">${number != null && number !== '' ? number : ''}</span>
                ${duplicate ? '<span class="jersey-dup" title="Numéro en double">!</span>' : ''}
            </span>`;
    }

    // Une place qui n'existe plus dans la formation courante doit renvoyer le joueur au banc
    function pruneSlotAssignments(match) {
        if (!match) return;

        const valid = new Set(
            getFormationSlots(match.currentFormation || '433').map(s => s.slot)
        );

        Object.keys(match.slotAssignments || {}).forEach(slot => {
            if (!valid.has(slot)) delete match.slotAssignments[slot];
        });
    }

    function renderMatchComposition() {

        const container = document.getElementById('match-composition-container');
        if (!container) return;

        if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) {
            container.innerHTML = `
                <div class="card card-pad text-center py-10">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                        <i class="fa-solid fa-chess-board text-lg" aria-hidden="true"></i>
                    </div>
                    <p class="font-bold text-slate-800 text-sm">Aucun match sélectionné</p>
                    <p class="screen-sub max-w-sm mx-auto">Choisis un match pour composer l'équipe.</p>
                </div>`;
            return;
        }

        const match = state.matches[state.selectedMatchId];
        if (!match.slotAssignments) match.slotAssignments = {};
        pruneSlotAssignments(match);

        const formation = match.currentFormation || '433';
        const slots = getFormationSlots(formation);
        const jerseys = computeMatchJerseys(match);
        const teamHex = getTeamHex(match.team);

        const squad = getMatchPlayers(match).map(item => item.p);
        const squadById = new Map(squad.map(p => [p.id, p]));
        const convoked = squad.filter(p => (match.convocations || {})[p.id] === 'convoke');
        const bench = getCompositionBenchPlayers(match);
        const targetConvoked = parseInt(state.teams?.[match.team]?.targetConvocations) || 14;
        const maxSubs = Math.min(3, Math.max(0, targetConvoked - 11));
        const placedCount = slots.filter(s => match.slotAssignments[s.slot]).length;

        const returnTraining = window.compositionReturnTrainingId
            ? state.trainings?.[window.compositionReturnTrainingId]
            : null;

        const returnBanner = returnTraining ? `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-sky-200 bg-sky-50">
                <div class="flex items-center gap-2 min-w-0">
                    <i class="fa-solid fa-person-running text-sky-600" aria-hidden="true"></i>
                    <p class="text-[11.5px] text-slate-700 truncate">
                        Composition ouverte depuis la séance
                        <strong>${returnTraining.title || 'sans titre'}</strong>
                    </p>
                </div>
                <button type="button" onclick="backToTrainingFromComposition()"
                        class="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 text-[11px] font-bold hover:bg-sky-100 flex items-center gap-1.5">
                    <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
                    Retour à la séance
                </button>
            </div>` : '';

        const duplicates = Object.entries(jerseys)
            .filter(([, j]) => j.duplicate)
            .map(([id]) => squadById.get(id))
            .filter(Boolean)
            .map(p => formatPlayerName(p));

        const slotHTML = (pos) => {
            const playerId = match.slotAssignments[pos.slot];
            const player = playerId ? squadById.get(playerId) : null;
            const jersey = player ? jerseys[player.id] : null;
            const label = getSlotLabel(pos.slot);
            const style = `--px:${pos.x}%;--py:${pos.y}%;--lx:${(100 - pos.y).toFixed(2)}%;--ly:${pos.x}%;`;

            if (!player) {
                return `
                <button type="button" class="pitch-slot" style="${style}"
                        onclick="openPlayerPicker('${pos.slot}')"
                        aria-label="Placer un joueur : ${label}">
                    <span class="slot-empty"><i class="fa-solid fa-plus" aria-hidden="true"></i></span>
                    <span class="pitch-name">${label}</span>
                </button>`;
            }

            return `
                <button type="button" class="pitch-slot" style="${style}"
                        onclick="openPlayerPicker('${pos.slot}')"
                        title="${formatPlayerName(player)}"
                        aria-label="Changer ${formatPlayerName(player)} : ${label}">
                    ${jerseyMarkup(teamHex, jersey ? jersey.number : null, jersey && jersey.duplicate)}
                    <span class="pitch-name">${getPitchDisplayName(player)}</span>
                </button>`;
        };

        const benchHTML = bench.length
            ? bench.map((p, i) => {
                const off = i >= maxSubs;
                const jersey = jerseys[p.id] || {};
                const number = jersey.number;
                const divider = (i === maxSubs && bench.length > maxSubs)
                    ? `<div class="flex items-center gap-2 pt-2">
                           <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hors feuille</span>
                           <span class="flex-1 h-px bg-slate-200"></span>
                       </div>`
                    : '';

                return `${divider}
                <div class="flex items-center gap-2 ${off ? 'opacity-60' : ''}">
                    <span class="bench-num ${number ? '' : 'is-off'}" ${number ? 'style="background:' + teamHex + '"' : ''}>${number || '—'}</span>
                    <div class="min-w-0 flex-1">
                        <p class="font-bold text-[12.5px] text-slate-800 truncate">${formatPlayerName(p)}${jersey.duplicate ? ' <span class="text-red-600">!</span>' : ''}</p>
                        <p class="text-[10.5px] text-slate-500 truncate">${getPosteLabel(p.poste1)}</p>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <button onclick="moveCompositionBenchPlayer('${match.id}', '${p.id}', 'up')" ${i === 0 ? 'disabled' : ''}
                                class="w-7 h-7 rounded-md border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] ${i === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                aria-label="Monter ${formatPlayerName(p)}">▲</button>
                        <button onclick="moveCompositionBenchPlayer('${match.id}', '${p.id}', 'down')" ${i === bench.length - 1 ? 'disabled' : ''}
                                class="w-7 h-7 rounded-md border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] ${i === bench.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                aria-label="Descendre ${formatPlayerName(p)}">▼</button>
                    </div>
                </div>`;
            }).join('')
            : '<p class="text-xs text-slate-400 italic">Aucun remplaçant : tous les convoqués sont sur le terrain.</p>';

        container.innerHTML = `
        <div class="space-y-3">

            ${returnBanner}

            <div class="flex flex-wrap items-center gap-1.5">
                ${FORMATIONS.map(f => `
                    <button onclick="applyFormation('${f.key}')"
                            class="formation-btn ${formation === f.key ? 'is-active' : ''}">${f.label}</button>
                `).join('')}
                <button onclick="resetComposition()"
                        class="formation-btn ml-auto"
                        style="border-color:#fecaca;color:#b91c1c">
                    <i class="fa-solid fa-rotate-left mr-1" aria-hidden="true"></i>Tout au banc
                </button>
            </div>

            ${duplicates.length ? `
                <div class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-800 flex items-start gap-2">
                    <i class="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true"></i>
                    <span>Numéro en double : <strong>${duplicates.join(', ')}</strong>. Ouvre le joueur pour changer son numéro.</span>
                </div>` : ''}

            <div class="grid lg:grid-cols-4 gap-3">

                <div class="lg:col-span-3">
                    <div class="pitch-wrap" id="composition-terrain">
                        ${buildPitchSVG('portrait')}
                        ${buildPitchSVG('landscape')}
                        ${slots.map(slotHTML).join('')}
                    </div>
                    <div class="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-500">
                        <i class="fa-solid fa-hand-pointer" aria-hidden="true"></i>
                        <span>Touche une position pour y placer un joueur.</span>
                        <span class="ml-auto font-bold text-slate-600">${placedCount}/11 titulaires</span>
                    </div>
                </div>

                <aside class="card card-pad space-y-3">
                    <div>
                        <h3 class="card-title"><i class="fa-solid fa-arrows-up-down"></i>Banc</h3>
                        <p class="card-sub" ${convoked.length > targetConvoked ? 'style="color:#dc2626;font-weight:700"' : ''}>
                            ${convoked.length} convoqué(s) / ${targetConvoked} · ${maxSubs} remplaçant(s)
                        </p>
                    </div>
                    <div class="space-y-1.5">${benchHTML}</div>
                </aside>

            </div>
        </div>`;
    }

    /* ---- Choix du joueur pour une position ---- */

    let pickingSlot = null;

    function openPlayerPicker(slot) {
        const match = state.matches[state.selectedMatchId];
        if (!match) return;
        pickingSlot = slot;

        const sub = document.getElementById('pick-player-slot');
        if (sub) sub.textContent = getSlotLabel(slot);

        renderPlayerPicker();
        toggleModal('modal-pick-player', true);
    }

    function renderPlayerPicker() {
        const match = state.matches[state.selectedMatchId];
        if (!match || !pickingSlot) return;

        const list = document.getElementById('pick-player-list');
        const current = document.getElementById('pick-player-current');
        const jerseys = computeMatchJerseys(match);
        const teamHex = getTeamHex(match.team);

        const assigned = match.slotAssignments || {};
        const currentId = assigned[pickingSlot];
        const takenIds = Object.values(assigned).filter(id => id !== currentId);

        const squad = getMatchPlayers(match).map(item => item.p);
        const squadById = new Map(squad.map(p => [p.id, p]));

        const currentPlayer = currentId ? squadById.get(currentId) : null;

        const candidates = squad
            .filter(p => (match.convocations || {})[p.id] === 'convoke' && !takenIds.includes(p.id))
            .sort((a, b) => {
                const na = jerseys[a.id]?.number;
                const nb = jerseys[b.id]?.number;
                return (na == null ? 99 : na) - (nb == null ? 99 : nb);
            });

        if (current) {
            current.innerHTML = currentPlayer ? `
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                    <div class="flex items-center gap-2">
                        <span class="bench-num" style="background:${teamHex}">${jerseys[currentPlayer.id]?.number || '—'}</span>
                        <div class="min-w-0 flex-1">
                            <p class="font-bold text-[13px] text-slate-800 truncate">${formatPlayerName(currentPlayer)}</p>
                            <p class="text-[11px] text-slate-500">${getPosteLabel(currentPlayer.poste1)}</p>
                        </div>
                    </div>
                    <div class="flex items-end gap-2">
                        <label class="flex-1">
                            <span class="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Numéro de maillot</span>
                            <input type="number" min="1" max="99" value="${jerseys[currentPlayer.id]?.number || ''}"
                                   onchange="setSlotJersey('${currentPlayer.id}', this.value)"
                                   class="w-full p-1.5 border border-slate-200 rounded-lg text-center font-bold text-sm bg-white">
                        </label>
                        <button onclick="setSlotJersey('${currentPlayer.id}', '')"
                                class="px-2.5 py-2 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-white"
                                title="Revenir au numéro automatique">Auto</button>
                        <button onclick="clearPlayerFromSlot()"
                                class="px-2.5 py-2 rounded-lg border border-red-200 text-[11px] font-bold text-red-600 hover:bg-red-50">Retirer</button>
                    </div>
                </div>` : '';
        }

        if (list) {
            list.innerHTML = candidates.length
                ? candidates.map(p => {
                    const jersey = jerseys[p.id] || {};
                    return `
                    <button type="button" class="pick-row" onclick="choosePlayerForSlot('${p.id}')">
                        <span class="bench-num ${jersey.number ? '' : 'is-off'}" ${jersey.number ? 'style="background:' + teamHex + '"' : ''}>${jersey.number || '—'}</span>
                        <span class="min-w-0 flex-1">
                            <span class="block font-bold text-[12.5px] text-slate-800 truncate">${formatPlayerName(p)}</span>
                            <span class="block text-[10.5px] text-slate-500 truncate">${getPosteLabel(p.poste1)}</span>
                        </span>
                        ${p.id === currentId
                            ? '<i class="fa-solid fa-check text-sky-600 text-xs" aria-hidden="true"></i>'
                            : '<i class="fa-solid fa-plus text-slate-300 text-xs" aria-hidden="true"></i>'}
                    </button>`;
                }).join('')
                : '<p class="text-xs text-slate-400 italic">Aucun joueur convoqué disponible.</p>';
        }
    }

    function choosePlayerForSlot(playerId) {
        const match = state.matches[state.selectedMatchId];
        if (!match || !pickingSlot) return;

        if (!match.slotAssignments) match.slotAssignments = {};
        match.slotAssignments[pickingSlot] = playerId;

        saveStateToFirebase();
        toggleModal('modal-pick-player', false);
        renderMatchComposition();
    }

    function clearPlayerFromSlot() {
        const match = state.matches[state.selectedMatchId];
        if (!match || !pickingSlot) return;

        delete match.slotAssignments[pickingSlot];

        saveStateToFirebase();
        toggleModal('modal-pick-player', false);
        renderMatchComposition();
    }

    function setSlotJersey(playerId, value) {
        setMatchJersey(state.selectedMatchId, playerId, value);
        renderMatchComposition();
        renderPlayerPicker();
    }

function startDragPlayer(event, playerId) {

    draggedPlayerId = playerId;

}

function allowDrop(event) {

    event.preventDefault();

}

function dropPlayer(event) {

    event.preventDefault();

    if (!draggedPlayerId) return;

    const terrain =
        document.getElementById(
            'composition-terrain'
        );

    const rect =
        terrain.getBoundingClientRect();

    const x =
        ((event.clientX - rect.left)
        / rect.width) * 100;

    const y =
        ((event.clientY - rect.top)
        / rect.height) * 100;

    const match =
        state.matches[
            state.selectedMatchId
        ];

    match.composition[
        draggedPlayerId
    ] = {
        x,
        y
    };

    saveStateToFirebase();

    draggedPlayerId = null;

    renderMatchComposition();
}

function removePlayerFromComposition(playerId) {

    const match =
        state.matches[state.selectedMatchId];

    delete match.composition[playerId];

    saveStateToFirebase();

    renderMatchComposition();
}

function applyFormation(system) {

    if (
        !state.selectedMatchId ||
        !state.matches[state.selectedMatchId]
    ) {
        return;
    }

    const match =
        state.matches[state.selectedMatchId];

    // Une ancienne couche « composition libre » a existé : on la retire pour
    // qu'il ne reste qu'un seul système de placement.
    if (match.composition) {
        delete match.composition;
    }

    match.currentFormation = system;

    // Les joueurs dont la place n'existe plus dans le nouveau système
    // repartent automatiquement sur le banc.
    pruneSlotAssignments(match);

    saveStateToFirebase();

    renderMatchComposition();

    showToast(`Système ${FORMATIONS.find(f => f.key === system)?.label || system} appliqué`);
}

function getFormationSlots(system = "433") {
    const formations = {

        "433": [
            { slot:"GB", x:50, y:88 },
            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            // Milieu à 3 : 6 en sentinelle, 8 en relayeur, 10 en meneur (le plus haut)
            { slot:"MC1", x:30, y:53 },
            { slot:"MC3", x:70, y:47 },
            { slot:"MC2", x:50, y:32 },

            { slot:"AG", x:20, y:18 },
            { slot:"BU", x:50, y:10 },
            { slot:"AD", x:80, y:18 }
        ],

        "442": [
            { slot:"GB", x:50, y:88 },
            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MG", x:12, y:45 },
            { slot:"MC1", x:37, y:48 },
            { slot:"MC2", x:63, y:48 },
            { slot:"MD", x:88, y:45 },

            { slot:"AT1", x:35, y:15 },
            { slot:"AT2", x:65, y:15 }
        ],

        "352": [
            { slot:"GB", x:50, y:88 },

            { slot:"DC1", x:25, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:75, y:72 },

            { slot:"MG", x:10, y:45 },
            { slot:"MC1", x:35, y:48 },
            { slot:"MC2", x:50, y:42 },
            { slot:"MC3", x:65, y:48 },
            { slot:"MD", x:90, y:45 },

            { slot:"AT1", x:38, y:15 },
            { slot:"AT2", x:62, y:15 }
        ],

        "4231": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MDF1", x:40, y:55 },
            { slot:"MDF2", x:60, y:55 },

            { slot:"MOG", x:20, y:30 },
            { slot:"MOC", x:50, y:25 },
            { slot:"MOD", x:80, y:30 },

            { slot:"BU", x:50, y:10 }
        ],

        "4141": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MDF", x:50, y:58 },

            { slot:"MG", x:12, y:40 },
            { slot:"MC1", x:37, y:42 },
            { slot:"MC2", x:63, y:42 },
            { slot:"MD", x:88, y:40 },

            { slot:"BU", x:50, y:12 }
        ],

        "451": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MG", x:10, y:42 },
            { slot:"MC1", x:30, y:45 },
            { slot:"MC2", x:50, y:40 },
            { slot:"MC3", x:70, y:45 },
            { slot:"MD", x:90, y:42 },

            { slot:"BU", x:50, y:12 }
        ],

        "343": [
            { slot:"GB", x:50, y:88 },

            { slot:"DC1", x:25, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:75, y:72 },

            { slot:"MG", x:12, y:45 },
            { slot:"MC1", x:37, y:48 },
            { slot:"MC2", x:63, y:48 },
            { slot:"MD", x:88, y:45 },

            { slot:"AG", x:20, y:18 },
            { slot:"BU", x:50, y:10 },
            { slot:"AD", x:80, y:18 }
        ],

        "532": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:10, y:68 },
            { slot:"DC1", x:30, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:70, y:72 },
            { slot:"DD", x:90, y:68 },

            { slot:"MC1", x:30, y:45 },
            { slot:"MC2", x:50, y:40 },
            { slot:"MC3", x:70, y:45 },

            { slot:"AT1", x:38, y:15 },
            { slot:"AT2", x:62, y:15 }
        ],

        "541": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:10, y:68 },
            { slot:"DC1", x:30, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:70, y:72 },
            { slot:"DD", x:90, y:68 },

            { slot:"MG", x:12, y:45 },
            { slot:"MC1", x:37, y:48 },
            { slot:"MC2", x:63, y:48 },
            { slot:"MD", x:88, y:45 },

            { slot:"BU", x:50, y:12 }
        ],

        "4312": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MC1", x:25, y:48 },
            { slot:"MC2", x:50, y:44 },
            { slot:"MC3", x:75, y:48 },

            { slot:"MOC", x:50, y:28 },

            { slot:"AT1", x:38, y:12 },
            { slot:"AT2", x:62, y:12 }
        ],

        "4222": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MDF1", x:40, y:55 },
            { slot:"MDF2", x:60, y:55 },

            { slot:"MOG", x:35, y:30 },
            { slot:"MOD", x:65, y:30 },

            { slot:"AT1", x:38, y:12 },
            { slot:"AT2", x:62, y:12 }
        ]
    };

    return formations[system] || formations["433"];
}

let selectedBenchPlayer = null;

function selectBenchPlayer(playerId) {

    selectedBenchPlayer = playerId;

    const player =
        state.players.find(
            p => p.id === playerId
        );

    showToast(
        `${player.name} sélectionné`
    );
}

function assignPlayerToSlot(slot) {

    if (!selectedBenchPlayer) {

        showToast(
            "Sélectionnez un joueur du banc"
        );

        return;
    }

    const match =
        state.matches[
            state.selectedMatchId
        ];

    if (!match.slotAssignments) {

        match.slotAssignments = {};

    }

    match.slotAssignments[slot] =
        selectedBenchPlayer;

    selectedBenchPlayer = null;

    saveStateToFirebase();

    renderMatchComposition();

}

function resetComposition() {

    if (
        !confirm(
            "Remettre tous les joueurs sur le banc ?"
        )
    ) {
        return;
    }

    const match =
        state.matches[
            state.selectedMatchId
        ];

    match.slotAssignments = {};

    match.composition = {};

    saveStateToFirebase();

    renderMatchComposition();

    showToast(
        "Tous les joueurs ont été remis au banc"
    );
}

function getNiveauIcon(niveau) {
    if (niveau === 3) return '🟢';
    if (niveau === 2) return '🟡';
    return '🔴';
}

function generateBalancedTeams() {

    const session = state.trainings[currentTrainingId];
    if (!session) return;

    const existingTeams = session.generatedTeams;
    const hasComposition = !!(existingTeams && (
        (existingTeams.teamA || []).length ||
        (existingTeams.teamB || []).length ||
        (existingTeams.gardiens || []).length
    ));

    if (hasComposition && !confirm('Une composition existe déjà pour cette séance. La remplacer ? Les ajustements manuels seront perdus.')) {
        return;
    }

    showToast("Génération lancée");

    const presents = state.players.filter(p =>
    session.presence?.[p.id] === 'present' ||
    session.presence?.[p.id] === 'retard'
);

const gardiens = presents.filter(
    p => (p.poste1 || '').toUpperCase() === 'GB'
);

const joueursChamp = presents.filter(
    p => (p.poste1 || '').toUpperCase() !== 'GB'
);

    const categories = {
        DEF: [],
        MIL: [],
        ATT: [],
        AUTRE: []
    };

    joueursChamp.forEach(player => {

        const poste = posteCategory((player.poste1 || '').toUpperCase());

        if (poste === 'DEF')
            categories.DEF.push(player);

        else if (poste === 'MIL')
            categories.MIL.push(player);

        else if (poste === 'ATT')
            categories.ATT.push(player);

        else
            categories.AUTRE.push(player);
    });

    const teamA = [];
    const teamB = [];

    Object.values(categories).forEach(group => {

        group.sort((a, b) =>
            (b.niveau || 2) - (a.niveau || 2)
        );

        let scoreA = teamA.reduce((s, p) => s + (p.niveau || 2), 0);
let scoreB = teamB.reduce((s, p) => s + (p.niveau || 2), 0);

group.forEach(player => {

    if (teamA.length < teamB.length) {
        teamA.push(player);
        scoreA += player.niveau || 2;
    }
    else if (teamB.length < teamA.length) {
        teamB.push(player);
        scoreB += player.niveau || 2;
    }
    else {

        if (scoreA <= scoreB) {
            teamA.push(player);
            scoreA += player.niveau || 2;
        } else {
            teamB.push(player);
            scoreB += player.niveau || 2;
        }

    }

});

});

    session.generatedTeams = {
    gardiens: gardiens.map(p => p.id),
    teamA: teamA.map(p => p.id),
    teamB: teamB.map(p => p.id)
};

    saveStateToFirebase();

    renderGeneratedTeams();
}

function movePlayerToOtherTeam(playerId) {

    const session = state.trainings[currentTrainingId];

    if (!session || !session.generatedTeams) return;

    if (!session.generatedTeams.teamA) {
        session.generatedTeams.teamA = [];
    }

    if (!session.generatedTeams.teamB) {
        session.generatedTeams.teamB = [];
    }

    let teamA = [...session.generatedTeams.teamA];
    let teamB = [...session.generatedTeams.teamB];

    if (teamA.includes(playerId)) {

        teamA = teamA.filter(id => id !== playerId);

        if (!teamB.includes(playerId)) {
            teamB.push(playerId);
        }

    } else if (teamB.includes(playerId)) {

        teamB = teamB.filter(id => id !== playerId);

        if (!teamA.includes(playerId)) {
            teamA.push(playerId);
        }
    }

    session.generatedTeams.teamA = teamA;
    session.generatedTeams.teamB = teamB;

    saveStateToFirebase();
    renderGeneratedTeams();
}

let teamsSquadSelectMode = false;

function toggleTeamsSquadMode() {

    teamsSquadSelectMode = !teamsSquadSelectMode;

    renderGeneratedTeams();
}

let teamDragPlayerId = null;

function getTeamListKey(playerId, session) {

    const gen = session && session.generatedTeams;

    if (!gen || !playerId) return null;

    if ((gen.gardiens || []).includes(playerId)) return 'gardiens';
    if ((gen.teamA || []).includes(playerId)) return 'teamA';
    if ((gen.teamB || []).includes(playerId)) return 'teamB';

    return null;
}

function moveTeamPlayer(playerId, dir) {

    const session = state.trainings[currentTrainingId];
    const key = getTeamListKey(playerId, session);

    if (!key) return;

    const list = session.generatedTeams[key] || [];
    const i = list.indexOf(playerId);
    const j = i + (dir === 'up' ? -1 : 1);

    if (i < 0 || j < 0 || j >= list.length) return;

    list[i] = list[j];
    list[j] = playerId;

    saveStateToFirebase();
    renderGeneratedTeams();
}

function teamRowDragStart(event, playerId) {

    teamDragPlayerId = playerId;

    if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        try { event.dataTransfer.setData('text/plain', playerId); } catch (e) { }
    }

    if (event.currentTarget) event.currentTarget.style.opacity = '.45';
}

function teamRowDragOver(event) {

    if (!teamDragPlayerId) return;

    event.preventDefault();

    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
}

function teamRowDragEnd() {

    teamDragPlayerId = null;

    renderGeneratedTeams();
}

function teamRowDrop(event, targetId) {

    event.preventDefault();

    const sourceId = teamDragPlayerId || (event.dataTransfer && event.dataTransfer.getData('text/plain'));

    teamDragPlayerId = null;

    if (!sourceId || sourceId === targetId) return;

    const session = state.trainings[currentTrainingId];
    const sourceKey = getTeamListKey(sourceId, session);
    const targetKey = getTeamListKey(targetId, session);

    // Le glisser sert a ordonner a l'interieur d'une meme liste
    if (!sourceKey || sourceKey !== targetKey) return;

    const list = session.generatedTeams[sourceKey];
    const from = list.indexOf(sourceId);

    if (from < 0) return;

    list.splice(from, 1);

    let to = list.indexOf(targetId);

    if (to < 0) to = list.length;

    list.splice(to, 0, sourceId);

    saveStateToFirebase();
    renderGeneratedTeams();
}

let teamsInviteOpen = false;
let teamsInviteQuery = '';

function isSessionInvite(player, sessionArg) {

    if (!player) return false;

    const session = sessionArg || state.trainings[currentTrainingId];
    const playerTeam = String(player.team || '').toLowerCase();
    const sessionTeam = String((session && session.team) || '').toLowerCase();

    return !!playerTeam && !!sessionTeam && playerTeam !== sessionTeam;
}

function toggleTeamsInvitePanel() {

    teamsInviteOpen = !teamsInviteOpen;

    if (!teamsInviteOpen) teamsInviteQuery = '';

    renderGeneratedTeams();

    if (teamsInviteOpen) focusTeamsInviteInput();
}

function focusTeamsInviteInput() {

    const input = document.getElementById('teams-invite-input');

    if (!input) return;

    input.focus();

    try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) { }
}

function onTeamsInviteInput(value) {

    teamsInviteQuery = value || '';

    renderTeamsInviteResults();
}

function renderTeamsInviteResults() {

    const el = document.getElementById('teams-invite-results');

    if (!el) return;

    const session = state.trainings[currentTrainingId];
    const query = String(teamsInviteQuery || '').trim().toLowerCase();

    if (!session || query.length < 2) {
        el.innerHTML = '';
        return;
    }

    const gen = session.generatedTeams || {};
    const placed = new Set([...(gen.gardiens || []), ...(gen.teamA || []), ...(gen.teamB || [])]);

    const results = state.players
        .filter(p => !placed.has(p.id))
        .filter(p => {
            const haystack = [p.name, p.team, state.teams?.[p.team]?.name, p.poste1, p.licence]
                .filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(query);
        })
        .slice(0, 8);

    if (!results.length) {
        el.innerHTML = '<p class="text-[11px] text-slate-400 italic">Aucun joueur trouve.</p>';
        return;
    }

    el.innerHTML = results.map(p => `
        <div class="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-white border border-slate-200">
            <span class="min-w-0 text-[11px] font-bold text-slate-700 truncate">
                ${getNiveauIcon(p.niveau)} ${formatFirstName(playerFirstName(p))}
                <span class="font-normal text-slate-400">${p.name || ''}</span>
                <span class="ml-1 text-[9px] font-extrabold text-purple-700">${state.teams?.[p.team]?.name || String(p.team || '').toUpperCase()}</span>
            </span>
            <span class="flex items-center gap-1 shrink-0">
                <button onclick="addInviteToTeam('${p.id}', 'A')"
                    class="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-bold">+ A</button>
                <button onclick="addInviteToTeam('${p.id}', 'B')"
                    class="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold">+ B</button>
            </span>
        </div>`).join('');
}

function addInviteToTeam(playerId, teamKey) {

    const session = state.trainings[currentTrainingId];

    if (!session || !session.generatedTeams || !playerId) return;

    const gen = session.generatedTeams;

    gen.gardiens = (gen.gardiens || []).filter(id => id !== playerId);
    gen.teamA = (gen.teamA || []).filter(id => id !== playerId);
    gen.teamB = (gen.teamB || []).filter(id => id !== playerId);

    const key = teamKey === 'B' ? 'teamB' : 'teamA';

    gen[key] = [...(gen[key] || []), playerId];

    saveStateToFirebase();
    renderGeneratedTeams();
    focusTeamsInviteInput();

    showToast(`Invité ajouté à l'équipe ${teamKey === 'B' ? 'B' : 'A'}`);
}

function renderGeneratedTeams() {

    const session = state.trainings[currentTrainingId];
    const container = document.getElementById('training-teams-zone');

    if (!container) return;

    if (!session || !session.generatedTeams) {
        container.innerHTML = '';
        return;
    }

    const gardiens = (session.generatedTeams.gardiens || [])
        .map(id => state.players.find(p => p.id === id))
        .filter(Boolean);

    const teamA = (session.generatedTeams.teamA || [])
        .map(id => state.players.find(p => p.id === id))
        .filter(Boolean);

    const teamB = (session.generatedTeams.teamB || [])
        .map(id => state.players.find(p => p.id === id))
        .filter(Boolean);

    const reserve = getReserveTrainingPlayers(session);

    const squadSet = new Set(getSessionSquad(session));

    const inviteTag = (p) => isSessionInvite(p, session)
        ? '<span class="ml-1 px-1 py-0.5 rounded bg-purple-100 border border-purple-200 text-purple-700 text-[9px] font-extrabold">invité</span>'
        : '';

    const squadMark = (p) => {

        const inSquad = squadSet.has(p.id);

        // En mode selection, chaque joueur a un bouton C pour tagger / detagger
        if (teamsSquadSelectMode) {
            return `<button onclick="toggleSquadPlayer('${p.id}')"
                title="${inSquad ? 'Retirer des convoqués' : 'Marquer comme convoqué'}"
                class="inline-flex items-center justify-center w-[17px] h-[17px] rounded-full text-[10px] font-black leading-none shrink-0 border transition ${inSquad ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-emerald-300 text-emerald-500 hover:bg-emerald-50'}">C</button>`;
        }

        // Hors selection : seul un joueur convoque porte la pastille verte "C"
        return inSquad
            ? '<span class="inline-flex items-center justify-center w-[17px] h-[17px] rounded-full bg-emerald-500 border border-emerald-600 text-white text-[10px] font-black leading-none shrink-0" title="Convoqué">C</span>'
            : '';
    };

    let html = '';

    if (gardiens.length > 0) {

        html += `
            <div class="mb-4 p-4 rounded-xl border bg-emerald-50">
                <h3 class="font-bold text-emerald-700 mb-2">
                    🧤 Gardien
                </h3>

                ${gardiens.map(p => `
                    <div class="flex items-center justify-between gap-2 py-1">
                        <span class="flex items-center gap-1.5 min-w-0">
                            ${squadMark(p)}
                            <span class="truncate">${getNiveauIcon(p.niveau)} ${p.name}${inviteTag(p)}</span>
                        </span>
                        ${sessionPosteSelect(p)}
                    </div>
                `).join('')}
            </div>
        `;
    }

    html += `
        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">

            <span class="text-[11px] font-bold text-slate-500">
                🎯 ${getSessionSquad(session).length} convoqué(s)
            </span>

            <div class="flex items-center gap-2">

                <button onclick="toggleTeamsInvitePanel()"
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${teamsInviteOpen ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-sky-300 text-sky-700 hover:bg-sky-50'}">
                    ➕ Invité
                </button>

                <button onclick="toggleTeamsSquadMode()"
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${teamsSquadSelectMode ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50'}">
                    ${teamsSquadSelectMode ? '✓ Terminer' : 'C Sélectionner les convoqués'}
                </button>

            </div>

        </div>

        ${teamsInviteOpen ? `
        <div class="mb-2 bg-sky-50 border border-sky-200 rounded-xl p-2">
            <input id="teams-invite-input" type="text" oninput="onTeamsInviteInput(this.value)" value="${escapeExerciseValue(teamsInviteQuery || '')}"
                placeholder="Ajouter un joueur extérieur (U13, autre équipe…)"
                class="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <div id="teams-invite-results" class="mt-1.5 space-y-1"></div>
        </div>` : ''}

        <div class="grid md:grid-cols-2 gap-4">

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">

                <h3 class="font-bold text-blue-700 mb-3">
                    🔵 Équipe A (${teamA.length})
                </h3>

                ${teamA.map((p, i) => `

                    <div draggable="true" ondragstart="teamRowDragStart(event, '${p.id}')" ondragover="teamRowDragOver(event)" ondrop="teamRowDrop(event, '${p.id}')" ondragend="teamRowDragEnd()"
                        title="Glisse ou utilise les flèches pour réordonner"
                        class="flex justify-between items-center gap-2 py-1 border-b border-blue-100 text-sm cursor-grab">

                        <span class="flex items-center gap-1.5 min-w-0">
                            ${squadMark(p)}
                            <span class="truncate">${getNiveauIcon(p.niveau)} ${p.name}${inviteTag(p)}</span>
                        </span>

                        <div class="flex items-center gap-2">

                            <div class="flex flex-col gap-0.5">
                                <button onclick="moveTeamPlayer('${p.id}', 'up')" ${i === 0 ? 'disabled' : ''}
                                    class="w-6 h-5 rounded border border-slate-200 text-slate-600 flex items-center justify-center text-[8px] ${i === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                    aria-label="Monter ${p.name}">▲</button>
                                <button onclick="moveTeamPlayer('${p.id}', 'down')" ${i === teamA.length - 1 ? 'disabled' : ''}
                                    class="w-6 h-5 rounded border border-slate-200 text-slate-600 flex items-center justify-center text-[8px] ${i === teamA.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                    aria-label="Descendre ${p.name}">▼</button>
                            </div>

                            ${sessionPosteSelect(p)}

                            <button
                                onclick="movePlayerToOtherTeam('${p.id}')"
                                class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs">
                                ➡️
                            </button>

                            <button
                                onclick="removePlayerFromGeneratedTeam('${p.id}')"
                                class="px-2 py-1 rounded bg-white hover:bg-red-50 text-red-500 text-xs"
                                title="Retirer de l'équipe (le joueur reste présent)">
                                ✕
                            </button>

                        </div>

                    </div>

                `).join('')}

            </div>

            <div class="bg-red-50 border border-red-200 rounded-xl p-4">

                <h3 class="font-bold text-red-700 mb-3">
                    🔴 Équipe B (${teamB.length})
                </h3>

                ${teamB.map((p, i) => `

                    <div draggable="true" ondragstart="teamRowDragStart(event, '${p.id}')" ondragover="teamRowDragOver(event)" ondrop="teamRowDrop(event, '${p.id}')" ondragend="teamRowDragEnd()"
                        title="Glisse ou utilise les flèches pour réordonner"
                        class="flex justify-between items-center gap-2 py-1 border-b border-red-100 text-sm cursor-grab">

                        <span class="flex items-center gap-1.5 min-w-0">
                            ${squadMark(p)}
                            <span class="truncate">${getNiveauIcon(p.niveau)} ${p.name}${inviteTag(p)}</span>
                        </span>

                        <div class="flex items-center gap-2">

                            <button
                                onclick="movePlayerToOtherTeam('${p.id}')"
                                class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs">
                                ⬅️
                            </button>

                            <button
                                onclick="removePlayerFromGeneratedTeam('${p.id}')"
                                class="px-2 py-1 rounded bg-white hover:bg-red-50 text-red-500 text-xs"
                                title="Retirer de l'équipe (le joueur reste présent)">
                                ✕
                            </button>

                            <div class="flex flex-col gap-0.5">
                                <button onclick="moveTeamPlayer('${p.id}', 'up')" ${i === 0 ? 'disabled' : ''}
                                    class="w-6 h-5 rounded border border-slate-200 text-slate-600 flex items-center justify-center text-[8px] ${i === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                    aria-label="Monter ${p.name}">▲</button>
                                <button onclick="moveTeamPlayer('${p.id}', 'down')" ${i === teamB.length - 1 ? 'disabled' : ''}
                                    class="w-6 h-5 rounded border border-slate-200 text-slate-600 flex items-center justify-center text-[8px] ${i === teamB.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100 active:bg-slate-200'}"
                                    aria-label="Descendre ${p.name}">▼</button>
                            </div>

                            ${sessionPosteSelect(p)}

                        </div>

                    </div>

                `).join('')}

            </div>

        </div>

        <div class="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4">

            <h3 class="font-bold text-slate-700 mb-1">
                🪑 En réserve (${reserve.length})
            </h3>

            <p class="text-[10px] text-slate-400 mb-2">
                Présents non affectés · retire un joueur d'une équipe ou marque-le présent dans l'appel pour le retrouver ici
            </p>

            ${reserve.length ? reserve.map(p => `

                <div class="flex justify-between items-center gap-2 py-1 border-b border-slate-200 text-sm">

                    <span class="flex items-center gap-1.5 min-w-0">
                        ${squadMark(p)}
                        <span class="truncate">${getNiveauIcon(p.niveau)} ${p.name}${inviteTag(p)}</span>
                    </span>

                    <div class="flex items-center gap-2">

                        ${sessionPosteSelect(p)}

                        <button
                            onclick="addPlayerToGeneratedTeam('${p.id}', 'A')"
                            class="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 text-[11px] font-bold">
                            + A
                        </button>

                        <button
                            onclick="addPlayerToGeneratedTeam('${p.id}', 'B')"
                            class="px-2 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold">
                            + B
                        </button>

                    </div>

                </div>

            `).join('') : '<p class="text-xs text-slate-400 italic">Aucun joueur en réserve.</p>'}

        </div>

        <div class="mt-4 text-center">

            <button
                onclick="openExerciseBoard()"
                class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold">
                ⚽ Créer un exercice
            </button>

        </div>
    `;

    container.innerHTML = html;

    if (teamsInviteOpen) renderTeamsInviteResults();
}

function getGeneratedTeamIds(session) {

    const gen = (session && session.generatedTeams) || {};

    return new Set([
        ...(gen.gardiens || []),
        ...(gen.teamA || []),
        ...(gen.teamB || [])
    ]);
}

function getReserveTrainingPlayers(session) {

    if (!session) return [];

    const assigned = getGeneratedTeamIds(session);

    return state.players.filter(p => {

        const status = session.presence && session.presence[p.id];

        if (status !== 'present' && status !== 'retard') return false;

        return !assigned.has(p.id);
    });
}

function removePlayerFromGeneratedTeam(playerId) {

    const session = state.trainings[currentTrainingId];

    if (!session || !session.generatedTeams) return;

    let removed = false;

    ['teamA', 'teamB'].forEach(key => {

        const ids = session.generatedTeams[key] || [];

        if (ids.includes(playerId)) {
            session.generatedTeams[key] = ids.filter(id => id !== playerId);
            removed = true;
        }
    });

    if (!removed) return;

    saveStateToFirebase();
    renderGeneratedTeams();

    showToast('Joueur placé en réserve');
}

function addPlayerToGeneratedTeam(playerId, teamKey) {

    const session = state.trainings[currentTrainingId];

    if (!session || !session.generatedTeams || !playerId) return;

    const targetKey = teamKey === 'B' ? 'teamB' : 'teamA';
    const gen = session.generatedTeams;

    // Un joueur ne peut figurer que dans une seule liste
    gen.teamA = (gen.teamA || []).filter(id => id !== playerId);
    gen.teamB = (gen.teamB || []).filter(id => id !== playerId);
    gen.gardiens = (gen.gardiens || []).filter(id => id !== playerId);

    gen[targetKey] = [...(gen[targetKey] || []), playerId];

    saveStateToFirebase();
    renderGeneratedTeams();

    showToast(`Joueur ajouté à l'équipe ${targetKey === 'teamB' ? 'B' : 'A'}`);
}

window.removePlayerFromGeneratedTeam = removePlayerFromGeneratedTeam;
window.toggleTeamsSquadMode = toggleTeamsSquadMode;
window.moveTeamPlayer = moveTeamPlayer;
window.toggleTeamsInvitePanel = toggleTeamsInvitePanel;
window.onTeamsInviteInput = onTeamsInviteInput;
window.addInviteToTeam = addInviteToTeam;
window.teamRowDragStart = teamRowDragStart;
window.teamRowDragOver = teamRowDragOver;
window.teamRowDragEnd = teamRowDragEnd;
window.teamRowDrop = teamRowDrop;
window.addPlayerToGeneratedTeam = addPlayerToGeneratedTeam;

var exerciseUI = {
    selected: null,
    tool: 'move',
    selProp: null,
    zoneP1: null,
    slotMove: false,
    holdSlot: null,
    drag: null,
    suppressClickUntil: 0,
    squadQuery: ''
};

let exerciseResizeBound = false;

function bindExerciseResize() {

    if (exerciseResizeBound) return;

    exerciseResizeBound = true;

    let timer = null;

    window.addEventListener('resize', () => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            const board = document.getElementById('training-exercise-board');
            const session = state.trainings[currentTrainingId];

            if (board && !board.classList.contains('hidden') && session && session.generatedTeams) {
                renderExercise();
            }
        }, 150);
    });
}

const EXERCISE_FORMATS = {
    '4v4': {
        label: '4 vs 4',
        positions: [
            { name: 'DC', x: 50, y: 28 },
            { name: 'MC', x: 35, y: 42 },
            { name: 'MC', x: 65, y: 42 },
            { name: 'BU', x: 50, y: 50 }
        ]
    },
    '5v5': {
        label: '5 vs 5',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DC', x: 50, y: 26 },
            { name: 'MC', x: 35, y: 40 },
            { name: 'MC', x: 65, y: 40 },
            { name: 'BU', x: 50, y: 50 }
        ]
    },
    '6v6': {
        label: '6 vs 6',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DC', x: 30, y: 24 },
            { name: 'DC', x: 70, y: 24 },
            { name: 'MC', x: 40, y: 38 },
            { name: 'MC', x: 60, y: 38 },
            { name: 'BU', x: 50, y: 48 }
        ]
    },
    '7v7': {
        label: '7 vs 7',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DC', x: 33, y: 24 },
            { name: 'DC', x: 67, y: 24 },
            { name: 'MC', x: 25, y: 38 },
            { name: 'MC', x: 50, y: 38 },
            { name: 'MC', x: 75, y: 38 },
            { name: 'BU', x: 50, y: 50 }
        ]
    },
    '8v8': {
        label: '8 vs 8',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DG', x: 25, y: 24 },
            { name: 'DC', x: 50, y: 24 },
            { name: 'DD', x: 75, y: 24 },
            { name: 'MC', x: 35, y: 37 },
            { name: 'MC', x: 65, y: 37 },
            { name: 'AG', x: 30, y: 48 },
            { name: 'BU', x: 70, y: 50 }
        ]
    },
    '8v8_232': {
        label: '8v8 2-3-2',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DC', x: 35, y: 25 },
            { name: 'DC', x: 65, y: 25 },
            { name: 'MC', x: 25, y: 38 },
            { name: 'MC', x: 50, y: 38 },
            { name: 'MC', x: 75, y: 38 },
            { name: 'BU', x: 35, y: 48 },
            { name: 'BU', x: 65, y: 50 }
        ]
    },
    '8v8_331': {
        label: '8v8 3-3-1',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DC', x: 25, y: 24 },
            { name: 'DC', x: 50, y: 24 },
            { name: 'DC', x: 75, y: 24 },
            { name: 'MC', x: 30, y: 37 },
            { name: 'MC', x: 50, y: 37 },
            { name: 'MC', x: 70, y: 37 },
            { name: 'BU', x: 50, y: 49 }
        ]
    },
    '8v8_241': {
        label: '8v8 2-4-1',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DC', x: 35, y: 24 },
            { name: 'DC', x: 65, y: 24 },
            { name: 'MC', x: 20, y: 36 },
            { name: 'MC', x: 40, y: 36 },
            { name: 'MC', x: 60, y: 36 },
            { name: 'MC', x: 80, y: 36 },
            { name: 'BU', x: 50, y: 48 }
        ]
    },
    '9v9': {
        label: '9 vs 9',
        positions: [
            { name: 'GB', x: 50, y: 12 },
            { name: 'DC', x: 35, y: 24 },
            { name: 'DC', x: 65, y: 24 },
            { name: 'MC', x: 20, y: 36 },
            { name: 'MC', x: 40, y: 36 },
            { name: 'MC', x: 60, y: 36 },
            { name: 'MC', x: 80, y: 36 },
            { name: 'AG', x: 35, y: 48 },
            { name: 'BU', x: 65, y: 48 }
        ]
    },
    '10v10': {
        label: '10 vs 10',
        positions: [
            { name: 'GB', x: 50, y: 10 },
            { name: 'DC', x: 32, y: 22 },
            { name: 'DC', x: 68, y: 22 },
            { name: 'MC', x: 18, y: 34 },
            { name: 'MC', x: 40, y: 34 },
            { name: 'MC', x: 60, y: 34 },
            { name: 'MC', x: 82, y: 34 },
            { name: 'AG', x: 28, y: 46 },
            { name: 'MOC', x: 50, y: 46 },
            { name: 'BU', x: 72, y: 46 }
        ]
    },
    '11v11': {
        label: '11 vs 11',
        positions: [
            { name: 'GB', x: 50, y: 10 },
            { name: 'DG', x: 15, y: 22 },
            { name: 'DC', x: 38, y: 22 },
            { name: 'DC', x: 62, y: 22 },
            { name: 'DD', x: 85, y: 22 },
            { name: 'MC', x: 28, y: 36 },
            { name: 'MC', x: 50, y: 36 },
            { name: 'MC', x: 72, y: 36 },
            { name: 'MOC', x: 50, y: 44 },
            { name: 'AG', x: 30, y: 50 },
            { name: 'BU', x: 70, y: 50 }
        ]
    }
};

// Postes simplifies : tous les postes de champ sont ramenes a DEF / MIL / ATT
Object.keys(EXERCISE_FORMATS).forEach(k => {
    (EXERCISE_FORMATS[k].positions || []).forEach(p => {
        const cat = posteCategory(p.name);
        if (cat !== 'AUTRE') p.name = cat;
    });
});

function exerciseIsLandscape() {
    return window.matchMedia('(min-width: 768px)').matches;
}

function exerciseTeamPlayerIds(teamKey) {

    const session = state.trainings[currentTrainingId];
    const gen = session && session.generatedTeams;

    if (!gen) return [];

    return teamKey === 'A'
        ? [...(gen.teamA || []), ...(gen.gardiens || [])]
        : (gen.teamB || []);
}

function getExercisePositions(setup, teamKey) {

    const fmt = EXERCISE_FORMATS[setup && setup.format] || EXERCISE_FORMATS['8v8'];

    return (fmt.positions || [])
        .map((pos, idx) => ({ name: pos.name, x: pos.x, y: pos.y, idx: idx }))
        .filter(p => teamKey === 'A' || p.name !== 'GB');
}

function exerciseTeamKeys(setup, teamKey) {
    return new Set(getExercisePositions(setup, teamKey).map(p => teamKey + ':' + p.idx));
}

function getAutoExerciseFormat() {

    const sizeA = exerciseTeamPlayerIds('A').length;
    const sizeB = exerciseTeamPlayerIds('B').length;

    if (!sizeA && !sizeB) return null;

    // Le cote B n'a pas de poste gardien : il lui faut un poste de champ libre
    const need = Math.max(sizeA, sizeB + 1);

    const keys = Object.keys(EXERCISE_FORMATS)
        .filter(k => (EXERCISE_FORMATS[k].positions || []).length >= need)
        .sort((a, b) => EXERCISE_FORMATS[a].positions.length - EXERCISE_FORMATS[b].positions.length);

    return keys[0] || '11v11';
}

function applyAutoExerciseFormat(setup) {

    if (!setup || setup.autoFormatApplied) return null;

    const hasPlayers = Object.keys((setup.byTeam && setup.byTeam.A) || {}).length +
        Object.keys((setup.byTeam && setup.byTeam.B) || {}).length > 0;

    setup.autoFormatApplied = true;

    if (hasPlayers) return null;

    const suggested = getAutoExerciseFormat();

    if (!suggested || suggested === setup.format) return null;

    setup.format = suggested;

    return suggested;
}

function exerciseScreenToStored(x, y) {
    return exerciseIsLandscape() ? { x: y, y: x } : { x: x, y: y };
}

function exercisePropPoint(x, y) {
    return exerciseIsLandscape() ? { left: y, top: x } : { left: x, top: y };
}

function getSessionSquad(session) {

    if (!session) return [];

    const ids = Array.isArray(session.squad) ? session.squad : [];

    return ids.filter(id => state.players.some(p => p.id === id));
}

const SESSION_POSTES = ['GB', 'DEF', 'MIL', 'ATT'];

function getSessionPoste(player, sessionArg) {

    if (!player) return '-';

    const session = sessionArg || state.trainings[currentTrainingId];
    const override = session && session.roles ? session.roles[player.id] : null;

    if (override && SESSION_POSTES.includes(override)) return override;

    const cat = posteCategory(player.poste1);

    return SESSION_POSTES.includes(cat) ? cat : '-';
}

function setSessionPoste(playerId, value) {

    const session = state.trainings[currentTrainingId];

    if (!session || !playerId) return;

    if (!session.roles) session.roles = {};

    const v = String(value || '').toUpperCase();

    if (SESSION_POSTES.includes(v)) session.roles[playerId] = v;
    else delete session.roles[playerId];

    saveStateToFirebase();

    renderGeneratedTeams();

    const board = document.getElementById('training-exercise-board');

    if (board && !board.classList.contains('hidden')) renderExercise();
}

function sessionPosteSelect(player) {

    const session = state.trainings[currentTrainingId];
    const current = getSessionPoste(player);
    const overridden = !!(session && session.roles && session.roles[player.id]);
    const known = SESSION_POSTES.includes(current);
    const options = known ? SESSION_POSTES : [''].concat(SESSION_POSTES);
    const selectedValue = known ? current : '';

    return `<select onchange="setSessionPoste('${player.id}', this.value)"
        title="Poste pour cette seance uniquement - la fiche du joueur n'est pas modifiee"
        class="px-1 py-0.5 text-[11px] font-bold rounded border ${overridden ? 'border-slate-400 bg-white text-slate-800' : 'border-slate-200 bg-transparent text-slate-500'}">
        ${options.map(v => `<option value="${v}" ${v === selectedValue ? 'selected' : ''}>${v || '—'}</option>`).join('')}
    </select>`;
}

function getSquadTarget(session) {

    const fallback = parseInt(state.teams?.[(session && session.team) || '']?.targetConvocations) || 14;
    const value = parseInt(session && session.squadTarget);

    return value > 0 ? value : fallback;
}

function removePlayerFromSquadSilently(playerId) {

    const session = state.trainings[currentTrainingId];

    if (!session || !Array.isArray(session.squad)) return;

    const i = session.squad.indexOf(playerId);

    if (i >= 0) session.squad.splice(i, 1);
}

function toggleSquadPlayer(playerId) {

    const session = state.trainings[currentTrainingId];

    if (!session || !playerId) return;

    if (!Array.isArray(session.squad)) session.squad = [];

    if (session.squad.includes(playerId)) removePlayerFromSquadSilently(playerId);
    else session.squad.push(playerId);

    saveStateToFirebase();

    renderGeneratedTeams();

    const board = document.getElementById('training-exercise-board');

    if (board && !board.classList.contains('hidden')) renderExercise();
}

function addPlayerToSquad(playerId) {

    const session = state.trainings[currentTrainingId];

    if (!session || !playerId) return;

    if (!Array.isArray(session.squad)) session.squad = [];

    if (!session.squad.includes(playerId)) session.squad.push(playerId);

    saveStateToFirebase();
    renderGeneratedTeams();
    renderExercise();
    focusSquadSearch();
}

function removePlayerFromSquad(playerId) {

    const session = state.trainings[currentTrainingId];

    if (!session) return;

    removePlayerFromSquadSilently(playerId);

    saveStateToFirebase();
    renderGeneratedTeams();
    renderExercise();
    focusSquadSearch();
}

function setSquadTarget(value) {

    const session = state.trainings[currentTrainingId];
    const target = parseInt(value);

    if (!session || !target || target < 1) return;

    session.squadTarget = target;

    saveStateToFirebase();
    renderExercise();
}

function focusSquadSearch() {

    const input = document.getElementById('squad-search');

    if (!input) return;

    input.focus();

    try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) { }
}

function onSquadSearchInput(value) {

    exerciseUI.squadQuery = value || '';

    renderSquadSearchResults();
}

function renderSquadSearchResults() {

    const el = document.getElementById('squad-search-results');

    if (!el) return;

    const session = state.trainings[currentTrainingId];
    const query = String(exerciseUI.squadQuery || '').trim().toLowerCase();

    if (!session || query.length < 2) {
        el.innerHTML = '';
        return;
    }

    const squad = getSessionSquad(session);

    const results = state.players
        .filter(p => !squad.includes(p.id))
        .filter(p => {
            const haystack = [p.name, p.team, state.teams?.[p.team]?.name, p.poste1]
                .filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(query);
        })
        .slice(0, 8);

    if (!results.length) {
        el.innerHTML = '<p class="text-[11px] text-slate-400 italic">Aucun joueur trouve.</p>';
        return;
    }

    el.innerHTML = results.map(p => `
        <button onclick="addPlayerToSquad('${p.id}')"
            class="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left">
            <span class="min-w-0 text-[11px] font-bold text-slate-700 truncate">
                ${getNiveauIcon(p.niveau)} ${formatFirstName(playerFirstName(p))}
                <span class="font-normal text-slate-400">${p.name || ''}</span>
            </span>
            <span class="text-[10px] font-extrabold text-amber-700 whitespace-nowrap">+ Ajouter</span>
        </button>`).join('');
}

function renderExerciseSquad() {

    const session = state.trainings[currentTrainingId];
    const el = document.getElementById('exercise-squad');

    if (!el || !session) return;

    const squad = getSessionSquad(session);
    const target = getSquadTarget(session);
    const count = squad.length;

    const badge = count > target
        ? 'bg-red-50 text-red-700 border-red-200'
        : (count === target ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200');

    const players = squad.map(id => state.players.find(p => p.id === id)).filter(Boolean);

    const gen = session.generatedTeams || {};

    const fieldGroups = [
        { label: '🧤 Gardien', ids: gen.gardiens || [] },
        { label: '🔵 Équipe A', ids: gen.teamA || [] },
        { label: '🔴 Équipe B', ids: gen.teamB || [] }
    ]
        .map(g => ({ label: g.label, players: g.ids.map(id => state.players.find(p => p.id === id)).filter(Boolean) }))
        .filter(g => g.players.length);

    const fieldIds = new Set(fieldGroups.reduce((acc, g) => acc.concat(g.players.map(p => p.id)), []));

    const outside = players.filter(p => !fieldIds.has(p.id));

    const squadChip = (p) => {

        const inSquad = squad.includes(p.id);

        return `<button onclick="toggleSquadPlayer('${p.id}')" title="${inSquad ? 'Retirer du groupe' : 'Ajouter au groupe'}"
            class="px-2 py-1 rounded-lg border text-[11px] font-bold transition ${inSquad ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200'}">
            ${inSquad ? '<span style="color:#047857;font-weight:900;">C</span> ' : ''}${getNiveauIcon(p.niveau)} ${formatFirstName(playerFirstName(p))}
        </button>`;
    };

    el.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-xl p-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                    <h3 class="text-xs font-bold text-slate-800">🎯 Groupe de travail</h3>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge}">${count} / ${target}</span>
                </div>
                <div class="flex items-center gap-2">
                    <label for="squad-target" class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cible</label>
                    <input id="squad-target" type="number" min="1" max="30" value="${target}" onchange="setSquadTarget(this.value)"
                        class="w-14 px-2 py-1 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <button onclick="pushSquadToNextMatch()"
                        class="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold whitespace-nowrap">
                        ➡️ Convocation
                    </button>
                </div>
            </div>
            <div class="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                    Sur le terrain · tape un joueur pour le tagger
                </p>
                ${fieldGroups.length ? fieldGroups.map(g => `
                    <div class="flex items-start gap-2 py-0.5">
                        <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap pt-1.5 w-[70px]">${g.label}</span>
                        <div class="flex flex-wrap gap-1 min-w-0">
                            ${g.players.map(squadChip).join('')}
                        </div>
                    </div>`).join('') : `<p class="text-[11px] text-slate-400 italic">Génère les équipes pour tagger les joueurs présents d'un simple tap.</p>`}
            </div>
            ${outside.length ? `<div class="mt-2 flex flex-wrap items-center gap-1.5">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Hors terrain</span>
                ${outside.map(p => `
                    <button onclick="removePlayerFromSquad('${p.id}')" title="Retirer du groupe"
                        class="px-2 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 text-[11px] font-bold">
                        C ${getNiveauIcon(p.niveau)} ${formatFirstName(playerFirstName(p))} ✕
                    </button>`).join('')}
            </div>` : ''}
            ${!players.length ? '<p class="text-[11px] text-slate-400 italic mt-2">Aucun joueur dans le groupe.</p>' : ''}
            <div class="relative mt-2">
                <input id="squad-search" type="text" oninput="onSquadSearchInput(this.value)" value="${escapeExerciseValue(exerciseUI.squadQuery || '')}"
                    placeholder="Ajouter un joueur (U13, autre equipe...)"
                    class="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
                <span class="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>
            <div id="squad-search-results" class="mt-1.5 space-y-1"></div>
        </div>`;

    renderSquadSearchResults();
}

function getNextSessionMatch(session) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const teamKey = String((session && session.team) || '');

    return Object.values(state.matches || {})
        .filter(m => m && m.date && new Date(m.date + 'T12:00:00') >= today)
        .filter(m => !teamKey || String(m.team || '') === teamKey)
        .sort((a, b) => new Date(a.date + 'T12:00:00') - new Date(b.date + 'T12:00:00'))[0] || null;
}

function pushSquadToNextMatch() {

    const session = state.trainings[currentTrainingId];

    if (!session) return;

    const squad = getSessionSquad(session);

    if (!squad.length) {
        showToast('Le groupe est vide', 'error');
        return;
    }

    const match = getNextSessionMatch(session);

    if (!match) {
        showToast('Aucun match a venir pour cette equipe', 'error');
        return;
    }

    const label = new Date(match.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    if (!confirm(`Remplacer la convocation du match du ${label} par ces ${squad.length} joueurs ?`)) return;

    match.convocations = {};

    squad.forEach(id => { match.convocations[id] = 'convoke'; });

    saveStateToFirebase();
    showToast('Convocation du match mise a jour');
}

window.toggleSquadPlayer = toggleSquadPlayer;
window.addPlayerToSquad = addPlayerToSquad;
window.removePlayerFromSquad = removePlayerFromSquad;
window.setSquadTarget = setSquadTarget;
window.setSessionPoste = setSessionPoste;
window.onSquadSearchInput = onSquadSearchInput;
window.pushSquadToNextMatch = pushSquadToNextMatch;

function makeExerciseTemplate(name) {

    return {
        id: 'e' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        name: name || 'Exo',
        format: '8v8',
        team: 'A',
        byTeam: { A: {}, B: {} },
        props: [],
        area: 'full',
        mode: 'users',
        posOverrides: { full: {}, half: {} },
        duration: 0,
        series: '',
        note: '',
        done: false
    };
}

function getCurrentExerciseIndex(session) {

    if (!session.exercises || !session.exercises.length) return 0;

    const i = (session.currentEx === undefined || session.currentEx === null) ? 0 : session.currentEx;

    return Math.max(0, Math.min(i, session.exercises.length - 1));
}

function getExerciseSetup(session) {

    session.exercises = session.exercises || [];

    if (session.exerciseSetup && !session.exercises.length) {

        const legacy = JSON.parse(JSON.stringify(session.exerciseSetup));

        session.exercises.push(Object.assign(makeExerciseTemplate('Exo 1'), legacy));

        delete session.exerciseSetup;

        session.currentEx = 0;
    }

    if (!session.exercises.length) session.exercises.push(makeExerciseTemplate('Exo 1'));

    session.currentEx = getCurrentExerciseIndex(session);

    const s = session.exercises[session.currentEx];

    s.format = s.format || '8v8';

    s.team = s.team || 'A';

    s.byTeam = s.byTeam || { A: {}, B: {} };

    s.byTeam.A = s.byTeam.A || {};

    s.byTeam.B = s.byTeam.B || {};

    s.props = s.props || [];

    s.area = s.area || 'full';

    s.mode = s.mode || 'users';

    s.posOverrides = s.posOverrides || { full: {}, half: {} };

    s.posOverrides.full = s.posOverrides.full || {};

    s.posOverrides.half = s.posOverrides.half || {};

    return s;
}

function openExerciseBoard() {

    const session =
        state.trainings[currentTrainingId];

    if (!session?.generatedTeams) return;

    const container =
        document.getElementById(
            "training-exercise-board"
        );

    container.classList.remove("hidden");

    exerciseUI.squadQuery = '';

    const setup = getExerciseSetup(session);

    if (applyAutoExerciseFormat(setup)) saveStateToFirebase();

    bindExerciseResize();

    const fmtKeys = Object.keys(EXERCISE_FORMATS);

    container.innerHTML = `

        <style>
            #exercise-timer-overlay.done { animation: timerFlash 0.8s 3; }
            @keyframes timerFlash { 0%,100% { background: rgba(220,38,38,.93); } 50% { background: rgba(220,38,38,.5); } }
        </style>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <div class="flex items-center gap-2">
                <h3 class="font-bold text-slate-800">⚽ Exercices</h3>
                <button onclick="toggleExerciseTemplates()"
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white">
                    💾 Modèles
                </button>
            </div>
            <span id="exercise-info" class="text-xs font-semibold text-slate-500"></span>
        </div>

        <div id="exercise-templates-panel" class="hidden mb-3 bg-violet-50 border border-violet-200 rounded-xl p-3"></div>

        <div id="exercise-strip" class="flex gap-1.5 overflow-x-auto pb-1 mb-3"></div>

        <div id="exercise-board-options" class="flex flex-wrap items-center gap-2 mb-3">
            <button data-area="full" onclick="setExerciseArea('full')"
                class="px-3 py-1.5 rounded-lg text-[11px] font-bold border">⛹️ Terrain complet</button>
            <button data-area="half" onclick="setExerciseArea('half')"
                class="px-3 py-1.5 rounded-lg text-[11px] font-bold border">✂️ Demi-terrain</button>
            <span class="flex-1"></span>
            <button data-mode="users" onclick="setExerciseMode('users')"
                class="px-3 py-1.5 rounded-lg text-[11px] font-bold border">👥 Joueurs</button>
            <button data-mode="edit" onclick="setExerciseMode('edit')"
                class="px-3 py-1.5 rounded-lg text-[11px] font-bold border">✏️ Édition</button>
        </div>

        <div id="exercise-formats" class="flex flex-wrap gap-1.5 mb-3">
            ${fmtKeys.map(k => `
                <button data-format="${k}" onclick="chooseExercise('${k}')"
                    class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-semibold ${setup.format === k ? 'ring-2 ring-amber-300' : ''}">
                    ${EXERCISE_FORMATS[k].label}
                </button>`).join('')}
        </div>

        <div id="exercise-fiche" class="mb-2"></div>

        <div id="exercise-team-toggle" class="flex flex-wrap items-center gap-2 mb-2"></div>

        <div id="exercise-edit-tools" class="hidden"></div>

        <div
            id="exercise-field"
            style="
                position:relative;
                width:100%;
                height:clamp(440px, 105vw, 680px);
                background:#2E7D32;
                border:1px solid rgba(255,255,255,.25);
                border-radius:12px;
                overflow:hidden;
                box-shadow:0 8px 20px rgba(0,0,0,.18);
                touch-action:manipulation;
            ">
        </div>

        <p id="exercise-hint" class="text-[11px] text-slate-400 mt-1.5"></p>

        <div id="exercise-squad" class="mt-3"></div>

        <div id="exercise-bench" class="mt-3"></div>

        <div id="exercise-timer-overlay" class="hidden fixed inset-0 z-[100] bg-slate-900/85 flex-col flex items-center justify-center gap-5" style="display:none;">
            <div id="exercise-timer-name" class="text-white font-bold text-lg px-6 text-center"></div>
            <div id="exercise-timer-time" class="text-white text-7xl font-black tabular-nums"></div>
            <div class="flex gap-3">
                <button onclick="pauseExerciseTimer()" id="exercise-timer-pause"
                    class="px-5 py-3 rounded-xl bg-white text-slate-800 text-sm font-bold">⏸ Pause</button>
                <button onclick="stopExerciseTimer()"
                    class="px-5 py-3 rounded-xl bg-red-500 text-white text-sm font-bold">✋ Stop</button>
            </div>
        </div>

    `;

    renderExercise();
}

function buildExercisePitchSVG(area, landscape) {

    const half = area === 'half';
    const L = half ? 52.5 : 105;
    const W = 68;
    const vbW = landscape ? L : W;
    const vbH = landscape ? W : L;

    const stroke = 'rgba(255,255,255,.85)';
    const SW = 0.5;

    // along (0 = ligne de but) / across (0..W) -> coordonnees SVG
    const pt = (a, b) => landscape
        ? { x: a, y: b }
        : { x: b, y: half ? (L - a) : a };

    const line = (a1, b1, a2, b2) => {
        const p1 = pt(a1, b1);
        const p2 = pt(a2, b2);
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${stroke}" stroke-width="${SW}" stroke-linecap="round"/>`;
    };

    const rectBox = (a1, b1, a2, b2) => {
        const p1 = pt(a1, b1);
        const p2 = pt(a2, b2);
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        return `<rect x="${x}" y="${y}" width="${Math.abs(p2.x - p1.x)}" height="${Math.abs(p2.y - p1.y)}" fill="none" stroke="${stroke}" stroke-width="${SW}"/>`;
    };

    const arc = (ca, cb, r, from, to) => {
        const pts = [];
        for (let i = 0; i <= 24; i++) {
            const ang = from + (to - from) * (i / 24);
            const p = pt(ca + Math.cos(ang) * r, cb + Math.sin(ang) * r);
            pts.push(p.x.toFixed(2) + ',' + p.y.toFixed(2));
        }
        return `<polyline points="${pts.join(' ')}" fill="none" stroke="${stroke}" stroke-width="${SW}" stroke-linecap="round"/>`;
    };

    const goal = (aLine, dir) => {
        const aNet = aLine + dir * 1.8;
        const p1 = pt(Math.min(aNet, aLine), 30.34);
        const p2 = pt(Math.max(aNet, aLine), 37.66);
        const x = Math.min(p1.x, p2.x);
        const y = Math.min(p1.y, p2.y);
        const w = Math.abs(p2.x - p1.x);
        const h = Math.abs(p2.y - p1.y);
        return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.92)" stroke-width="${SW}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#ex-net)" stroke="none"/></g>`;
    };

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;">`;
    svg += `<defs><pattern id="ex-net" width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="1.6" stroke="rgba(255,255,255,.30)" stroke-width=".16"/></pattern></defs>`;

    svg += rectBox(2, 1, L - 2, W - 1);
    svg += line(half ? L - 2 : L / 2, 1, half ? L - 2 : L / 2, W - 1);

    if (!half) {
        const c = pt(L / 2, 34);
        svg += `<circle cx="${c.x}" cy="${c.y}" r="9.15" fill="none" stroke="${stroke}" stroke-width="${SW}"/>`;
        svg += `<circle cx="${c.x}" cy="${c.y}" r=".55" fill="rgba(255,255,255,.95)"/>`;
    }

    svg += rectBox(2, 13.84, 18.5, 54.16);
    svg += rectBox(2, 24.84, 7.5, 43.16);

    if (!half) {
        svg += rectBox(L - 18.5, 13.84, L - 2, 54.16);
        svg += rectBox(L - 7.5, 24.84, L - 2, 43.16);
    }

    const spotA = pt(13, 34);
    svg += `<circle cx="${spotA.x}" cy="${spotA.y}" r=".55" fill="rgba(255,255,255,.95)"/>`;

    if (!half) {
        const spotB = pt(L - 13, 34);
        svg += `<circle cx="${spotB.x}" cy="${spotB.y}" r=".55" fill="rgba(255,255,255,.95)"/>`;
    }

    const arcAngle = Math.acos(5.5 / 9.15);

    svg += arc(13, 34, 9.15, -arcAngle, arcAngle);

    if (!half) {
        svg += arc(L - 13, 34, 9.15, Math.PI - arcAngle, Math.PI + arcAngle);
        svg += arc(L - 2, 1, 1, Math.PI / 2, Math.PI);
        svg += arc(L - 2, W - 1, 1, Math.PI, Math.PI * 1.5);
    }

    svg += arc(2, 1, 1, 0, Math.PI / 2);
    svg += arc(2, W - 1, 1, -Math.PI / 2, 0);

    svg += goal(2, -1);

    if (!half) svg += goal(L - 2, 1);

    svg += `</svg>`;

    return svg;
}

function buildFieldLinesHTML(landscape) {
    return buildExercisePitchSVG('full', landscape);
}

function playerFirstName(player) {

    if (!player) return '?';

    // Même priorité que getPitchDisplayName : prénom usuel, puis prénom
    const nickname = String(player.nickname || '').trim();

    if (nickname) return nickname;

    const prenom = String(player.prenom || '').trim();

    if (prenom) return prenom;

    const full = String(player.name || '').trim();

    if (!full) return '?';

    const parts = full.split(/\s+/);

    if (parts.length === 1) return parts[0];

    const looksUppercase = (s) => s.length > 1 && s === s.toUpperCase() && /[A-ZÀ-ÖØ-Þ]/.test(s);

    // "NOM Prénom" -> dernier mot ; "Prénom NOM" -> premier mot
    return looksUppercase(parts[0]) && !looksUppercase(parts[parts.length - 1])
        ? parts[parts.length - 1]
        : parts[0];
}

function formatFirstName(name) {

    const value = String(name || '').trim();

    if (!value) return '?';

    return value.toLowerCase().replace(/(^|[\s'-])([a-zà-öø-ÿ])/g, (m, sep, ch) => sep + ch.toUpperCase());
}

function playerShortName(player) {

    const first = formatFirstName(playerFirstName(player));
    const parts = String((player && player.name) || '').trim().split(/\s+/);

    if (parts.length < 2) return first;

    const raw = playerFirstName(player);
    const other = parts.find(p => p !== raw) || '';

    return first + (other ? ' ' + other.charAt(0).toUpperCase() + '.' : '');
}

function renderExerciseSlot(teamKey, key, playerId, point, editable, isSquad) {

    const player = state.players.find(p => p.id === playerId);

    const selected = exerciseUI.selected === key;

    const held = exerciseUI.holdSlot === key;

    const isGK = !!(player && getSessionPoste(player) === 'GB');

    const color = isGK ? '#059669' : (teamKey === 'A' ? '#2563eb' : '#dc2626');

    const filled = !!player;

    const glow = held
        ? 'drop-shadow(0 0 6px #22d3ee) drop-shadow(0 0 2px #22d3ee)'
        : (selected ? 'drop-shadow(0 0 5px #fbbf24)' : 'drop-shadow(0 2px 2px rgba(0,0,0,.35))');

    const dragHandlers = editable
        ? ` onpointerdown="slotDragStart(event,'${key}')" onpointermove="slotDragMove(event,'${key}')" onpointerup="slotDragEnd(event,'${key}')"`
        : '';

    return `
        <div ${editable ? `onclick="pickExerciseSlot('${key}')"` : ''}
            ${dragHandlers}
            data-key="${key}"
            ${filled ? `title="${player.name}${player.poste1 ? ' · ' + player.poste1 : ''}"` : ''}
            style="position:absolute;left:${point.left}%;top:${point.top}%;
                width:58px;
                ${selected ? 'z-index:3;' : ''}
                ${editable ? '' : 'pointer-events:none;'}
                touch-action:${editable ? 'none' : 'auto'};
                transform:translate(-50%,-50%);
                display:flex;
                flex-direction:column;
                align-items:center;
                gap:1px;
                user-select:none;
                -webkit-user-select:none;
                ${editable ? 'cursor:grab;' : ''}">
            <div style="position:relative;width:44px;height:46px;filter:${glow};">
                <svg viewBox="0 0 40 42" width="44" height="46" style="display:block;overflow:visible;" aria-hidden="true">
                    <path d="M14 3 L5 8 L1 18 L9 21 L9 36 Q9 39 12 39 L28 39 Q31 39 31 36 L31 21 L39 18 L35 8 L26 3 Q20 8 14 3 Z"
                        fill="${filled ? color : 'rgba(255,255,255,.10)'}"
                        stroke="${filled ? 'rgba(255,255,255,.95)' : 'rgba(255,255,255,.6)'}"
                        stroke-width="${isSquad ? 2.2 : 1.5}"
                        stroke-linejoin="round"
                        ${filled ? '' : 'stroke-dasharray="4 3"'} />
                </svg>
                ${filled
                    ? `<span style="position:absolute;top:-3px;right:-6px;font-size:9px;line-height:1;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5));">${getNiveauIcon(player.niveau)}</span>`
                    : `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:rgba(255,255,255,.85);">${point.name}</span>`}
                ${isSquad ? `<span style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:14px;height:14px;border-radius:9999px;background:${isGK ? '#ecfdf5' : '#10b981'};border:1px solid #047857;display:flex;align-items:center;justify-content:center;font-size:8.5px;font-weight:900;line-height:1;color:${isGK ? '#047857' : '#fff'};box-shadow:0 1px 2px rgba(0,0,0,.3);">C</span>` : ''}
            </div>
            ${filled ? `<span style="display:block;max-width:58px;background:rgba(255,255,255,.94);color:#0f172a;font-size:9px;font-weight:800;line-height:13px;border-radius:6px;padding:0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 2px rgba(0,0,0,.25);">${formatFirstName(playerFirstName(player))}</span>` : ''}
        </div>
    `;
}

function effPos(setup, teamKey, idx, pos) {

    const ov = (setup.posOverrides || {})[setup.area] || {};

    // Cle par equipe : deplacer un poste de A ne doit jamais bouger le poste de B
    const o = ov[setup.format + ':' + teamKey + ':' + idx];

    return o ? { x: o.x, y: o.y } : pos;
}

function exerciseTeamSize(teamKey) {
    return exerciseTeamPlayerIds(teamKey).length;
}

function posteCategory(name) {

    const n = String(name || '').toUpperCase().trim();

    if (n === 'GB' || n === 'G') return 'GB';

    if (n === 'DEF' || ['DC', 'DG', 'DD', 'LAT'].includes(n)) return 'DEF';

    if (n === 'MIL' || ['MC', 'MOC', 'MDC', 'MO'].includes(n)) return 'MIL';

    if (n === 'ATT' || ['AD', 'AG', 'BU', 'AT'].includes(n)) return 'ATT';

    return 'AUTRE';
}

function renderExercise() {

    closeExercisePicker();

    const session = state.trainings[currentTrainingId];

    if (!session || !session.generatedTeams) return;

    const setup = getExerciseSetup(session);

    const fmt = EXERCISE_FORMATS[setup.format] || EXERCISE_FORMATS['8v8'];

    const field = document.getElementById('exercise-field');
    const bench = document.getElementById('exercise-bench');
    const info = document.getElementById('exercise-info');
    const tgl = document.getElementById('exercise-team-toggle');
    const tools = document.getElementById('exercise-edit-tools');
    const hint = document.getElementById('exercise-hint');

    if (!field || !bench || !info || !tgl || !tools || !hint) return;

    document.querySelectorAll('#exercise-formats button').forEach(b => {
        b.classList.toggle('ring-2', b.dataset.format === setup.format);
        b.classList.toggle('ring-amber-300', b.dataset.format === setup.format);
    });

    document.querySelectorAll('#exercise-board-options [data-area]').forEach(b => {
        const active = b.dataset.area === setup.area;
        b.classList.toggle('bg-sky-600', active);
        b.classList.toggle('text-white', active);
        b.classList.toggle('border-sky-600', active);
        b.classList.toggle('bg-white', !active);
        b.classList.toggle('text-slate-600', !active);
        b.classList.toggle('border-slate-200', !active);
    });

    document.querySelectorAll('#exercise-board-options [data-mode]').forEach(b => {
        const active = b.dataset.mode === setup.mode;
        b.classList.toggle('bg-amber-400', active);
        b.classList.toggle('text-amber-900', active);
        b.classList.toggle('border-amber-400', active);
        b.classList.toggle('bg-white', !active);
        b.classList.toggle('text-slate-600', !active);
        b.classList.toggle('border-slate-200', !active);
    });

    const isHalf = setup.area === 'half';
    const isEdit = setup.mode === 'edit';

    const exIdx = getCurrentExerciseIndex(session);
    const exCount = (session.exercises || []).length;
    const exName = setup.name || fmt.label;

    const genA = (session.generatedTeams.teamA || []).length;
    const genB = (session.generatedTeams.teamB || []).length;
    const genGK = (session.generatedTeams.gardiens || []).length;

    const squadSet = new Set(getSessionSquad(session));
    const squadTarget = getSquadTarget(session);

    info.innerHTML = `⚽ ${exIdx + 1}/${exCount} — ${exName} · ${fmt.label} · 🔵 A (${genA}${genGK ? ' + ' + genGK + ' 🧤' : ''}) · 🔴 B (${genB}) · 🎯 ${squadSet.size}/${squadTarget}${isHalf ? ' · ✂️' : ''}`;

    tgl.innerHTML = `
        <button onclick="selectExerciseTeam('A')"
            class="px-3 py-2 rounded-lg text-xs font-bold transition
                ${setup.team === 'A' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}">
            🔵 Équipe A
        </button>
        <button onclick="selectExerciseTeam('B')"
            class="px-3 py-2 rounded-lg text-xs font-bold transition
                ${setup.team === 'B' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700'}">
            🔴 Équipe B
        </button>
        ${isEdit ? '' : `
        <button onclick="resetExercisePositions()"
            class="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-600"
            title="Remettre tous les postes a leur place d'origine">
            ↺ Positions
        </button>`}
        <button onclick="autoAssignExerciseBoth()"
            class="px-3 py-2 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-500 text-amber-900">
            🎲 Auto A+B
        </button>
        <button onclick="resetExerciseTeam()"
            class="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-600">
            ♻️ Reset
        </button>`;

    const landscape = exerciseIsLandscape();

    field.style.width = '100%';
    field.style.height = 'auto';
    field.style.aspectRatio = landscape ? '105 / 68' : '68 / 105';
    field.style.maxWidth = landscape ? '980px' : '520px';
    field.style.margin = '0 auto';
    field.style.backgroundImage = 'repeating-linear-gradient(' + (landscape ? '90deg' : '180deg') + ', rgba(255,255,255,.05) 0 7%, rgba(0,0,0,.05) 7% 14%), linear-gradient(160deg, #35863c 0%, #256b2c 100%)';

    const toScreen = (visual) => landscape
        ? { left: visual.y, top: visual.x }
        : { left: visual.x, top: visual.y };

    let slotsHTML = '';

    if (isHalf) {

        const teamKey = setup.team;
        const map = setup.byTeam[teamKey] || {};

        slotsHTML = getExercisePositions(setup, teamKey).map(slot => {
            const key = teamKey + ':' + slot.idx;
            const visual = effPos(setup, teamKey, slot.idx, { x: slot.x, y: Math.max(4, (50 - slot.y) * 2) });
            const screen = landscape
                ? { left: 100 - visual.y, top: visual.x }
                : { left: visual.x, top: visual.y };
            return renderExerciseSlot(teamKey, key, map[key], { left: screen.left, top: screen.top, name: slot.name }, !isEdit, squadSet.has(map[key]));
        }).join('');

    } else {

        const byA = setup.byTeam.A || {};
        const byB = setup.byTeam.B || {};

        slotsHTML = ['A', 'B'].map(teamKey => {
            const map = teamKey === 'A' ? byA : byB;
            return getExercisePositions(setup, teamKey).map(slot => {
                const key = teamKey + ':' + slot.idx;
                const visual = effPos(setup, teamKey, slot.idx, { x: slot.x, y: teamKey === 'B' ? 100 - slot.y : slot.y });
                const screen = toScreen(visual);
                return renderExerciseSlot(teamKey, key, map[key], { left: screen.left, top: screen.top, name: slot.name }, !isEdit, squadSet.has(map[key]));
            }).join('');
        }).join('');
    }

    field.innerHTML = (isHalf ? buildHalfFieldLinesHTML(landscape) : buildFieldLinesHTML(landscape))
        + renderZonesAndProps(setup)
        + renderZoneMarker()
        + slotsHTML;

    field.onclick = isEdit ? exerciseFieldClick : null;

    renderExerciseTools(setup);

    bench.innerHTML = '';

    if (!isEdit) renderExerciseBench(setup);

    renderExerciseSquad();

    renderExerciseStrip();

    renderExerciseFiche();
}

function renderExerciseBench(setup) {

    const session = state.trainings[currentTrainingId];
    const gen = session.generatedTeams || {};
    const team = setup.team;
    const map = setup.byTeam[team] || {};
    const validKeys = exerciseTeamKeys(setup, team);
    const assigned = Object.keys(map).filter(k => validKeys.has(k)).map(k => map[k]);

    const ids = exerciseTeamPlayerIds(team);

    const squadSet = new Set(getSessionSquad(session));

    const players = ids.map(id => state.players.find(p => p.id === id)).filter(Boolean);

    const onBench = players.filter(p => !assigned.includes(p.id));

    const el = document.getElementById('exercise-bench');

    if (!el) return;

    if (!onBench.length) {

        el.innerHTML = `<div class="text-xs text-slate-400 text-center py-2">
            ✅ Tous les joueurs de l'équipe ${team} sont placés sur le terrain
        </div>`;

        return;
    }

    el.innerHTML = `
        <div class="text-[11px] font-bold text-slate-500 mb-1.5">
            🪑 Banc — Équipe ${team} (${onBench.length})
        </div>
        <div class="flex flex-wrap gap-1.5">
            ${onBench.map(p => `
                <button onclick="assignExercisePlayer('${p.id}')"
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${team === 'A' ? 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100' : 'bg-red-50 text-red-800 border border-red-200 hover:bg-red-100'}">
                    ${squadSet.has(p.id) ? '<span style="color:#059669;font-weight:900;">C</span> ' : ''}${getNiveauIcon(p.niveau)} ${playerShortName(p)}
                </button>`).join('')}
        </div>`;
}

function chooseExercise(formatKey) {

    if (!EXERCISE_FORMATS[formatKey]) return;

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    if (setup.format !== formatKey) {

        const hasPlayers = Object.keys(setup.byTeam.A).length + Object.keys(setup.byTeam.B).length > 0;

        if (hasPlayers && !confirm('Changer de dispositif remettra tous les joueurs au banc. Continuer ?')) return;

        setup.format = formatKey;
        setup.byTeam = { A: {}, B: {} };
        setup.autoFormatApplied = true;
        exerciseUI.selected = null;
        saveStateToFirebase();
    }

    renderExercise();
}

function selectExerciseTeam(team) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    setup.team = team;
    exerciseUI.selected = null;
    saveStateToFirebase();
    renderExercise();
}

function pickExerciseSlot(key) {

    if (exerciseUI.suppressClickUntil && Date.now() < exerciseUI.suppressClickUntil) return;

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    const team = key.split(':')[0];
    const map = setup.byTeam[team] = setup.byTeam[team] || {};

    if (exerciseUI.slotMove) {

        exerciseUI.holdSlot = (exerciseUI.holdSlot === key) ? null : key;
        exerciseUI.selected = null;
        renderExercise();
        return;
    }

    if (team === 'A' || team === 'B') {
        openExercisePlayerPicker(team, key);
    }
}

function toggleSlotMove() {

    exerciseUI.slotMove = !exerciseUI.slotMove;
    exerciseUI.holdSlot = null;
    exerciseUI.drag = null;
    exerciseUI.selected = null;
    renderExercise();
}

function slotDragStart(e, key) {

    try { if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { }

    const field = document.getElementById('exercise-field');
    const rect = field ? field.getBoundingClientRect() : null;

    exerciseUI.drag = {
        key: key,
        el: e.currentTarget,
        rect: rect,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        moved: false
    };

    e.currentTarget.style.zIndex = '5';
}

function slotDragMove(e, key) {

    const d = exerciseUI.drag;
    if (!d) return;

    if (e.cancelable) e.preventDefault();

    d.lastX = e.clientX;
    d.lastY = e.clientY;

    if (!d.moved) {

        if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 6) return;

        d.moved = true;

        // Un vrai deplacement : on bloque le clic (qui ouvrirait le selecteur)
        exerciseUI.suppressClickUntil = Date.now() + 500;

        d.el.style.transform = 'translate(-50%,-50%) scale(1.15)';
        d.el.style.filter = 'drop-shadow(0 8px 12px rgba(0,0,0,.45))';
    }

    if (!d.rect) return;

    const left = Math.max(2, Math.min(98, ((e.clientX - d.rect.left) / d.rect.width) * 100));
    const top = Math.max(2, Math.min(98, ((e.clientY - d.rect.top) / d.rect.height) * 100));

    d.el.style.left = left + '%';
    d.el.style.top = top + '%';
}

function slotDragEnd(e, key) {

    const d = exerciseUI.drag;
    if (!d) return;

    if (e.cancelable) e.preventDefault();

    exerciseUI.drag = null;

    d.el.style.zIndex = '';
    d.el.style.transform = 'translate(-50%,-50%)';
    d.el.style.filter = '';

    if (d.moved) {

        const fieldEl = document.getElementById('exercise-field');
        const rect = d.rect || (fieldEl ? fieldEl.getBoundingClientRect() : null);

        if (!rect) { renderExercise(); return; }

        const x = Math.max(4, Math.min(96, ((d.lastX - rect.left) / rect.width) * 100));
        const y = Math.max(4, Math.min(96, ((d.lastY - rect.top) / rect.height) * 100));

        exerciseUI.holdSlot = null;
        commitSlotPos(key, x, y);
        return;
    }

    // Simple tap : on laisse le clic ouvrir le selecteur de joueur
}

function placeHeldSlot(e) {

    if (!exerciseUI.holdSlot) return;

    if (e.target && e.target.closest && e.target.closest('[data-key]')) return;

    const rect = e.currentTarget.getBoundingClientRect();

    const x = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((e.clientY - rect.top) / rect.height) * 100));

    commitSlotPos(exerciseUI.holdSlot, x, y);
    exerciseUI.holdSlot = null;
}

function commitSlotPos(key, x, y) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    const parts = key.split(':');
    const teamKey = parts[0] === 'B' ? 'B' : 'A';
    const idx = parts[1];
    const stored = exerciseScreenToStored(x, y);

    // En demi-terrain paysage, l'affichage inverse l'axe horizontal (but a gauche)
    if (setup.area === 'half' && exerciseIsLandscape()) {
        stored.y = 100 - stored.y;
    }

    setup.posOverrides[setup.area][setup.format + ':' + teamKey + ':' + idx] = { x: stored.x, y: stored.y };

    saveStateToFirebase();
    showToast('Poste déplacé');
    renderExercise();
}

function resetExercisePositions() {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    // On repart de zero sur les deux zones, tous formats et toutes equipes confondus
    setup.posOverrides = { full: {}, half: {} };

    exerciseUI.holdSlot = null;
    exerciseUI.selected = null;
    exerciseUI.drag = null;

    saveStateToFirebase();
    showToast('Postes remis a leur place');
    renderExercise();
}

function assignExercisePlayer(playerId) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    let team = setup.team;
    let target = exerciseUI.selected || exerciseUI.holdSlot;

    if (target) {

        const heldTeam = target.split(':')[0];

        if (heldTeam === 'A' || heldTeam === 'B') team = heldTeam;
    }

    exerciseUI.selected = null;
    exerciseUI.holdSlot = null;

    const map = setup.byTeam[team] = setup.byTeam[team] || {};

    Object.keys(map).forEach(k => { if (map[k] === playerId) delete map[k]; });

    if (target && map[target] !== undefined) {

        delete map[target];
    }

    if (!target) {

        const slots = getExercisePositions(setup, team);

        for (let i = 0; i < slots.length; i++) {
            const k = team + ':' + slots[i].idx;
            if (map[k] === undefined) { target = k; break; }
        }
    }

    if (target) map[target] = playerId;

    saveStateToFirebase();
    renderExercise();
}

function closeExercisePicker() {

    const el = document.getElementById('exercise-player-picker');

    if (el) el.remove();
}

function openExercisePlayerPicker(teamKey, key) {

    const session = state.trainings[currentTrainingId];

    if (!session) return;

    const setup = getExerciseSetup(session);
    const map = setup.byTeam[teamKey] = setup.byTeam[teamKey] || {};
    const slots = getExercisePositions(setup, teamKey);
    const slot = slots.find(s => teamKey + ':' + s.idx === key);

    if (!slot) return;

    const currentId = map[key];
    const players = exerciseTeamPlayerIds(teamKey)
        .map(id => state.players.find(p => p.id === id))
        .filter(Boolean);

    const placement = {};

    Object.keys(map).forEach(k => {
        const s = slots.find(x => teamKey + ':' + x.idx === k);
        if (s && map[k]) placement[map[k]] = s.name;
    });

    closeExercisePicker();

    const overlay = document.createElement('div');

    overlay.id = 'exercise-player-picker';
    overlay.className = 'fixed inset-0 z-[110] bg-slate-900/60 flex items-end sm:items-center justify-center';
    overlay.onclick = (e) => { if (e.target === overlay) closeExercisePicker(); };

    overlay.innerHTML = `
        <div class="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                    <p class="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">${teamKey === 'A' ? '🔵 Équipe A' : '🔴 Équipe B'} · ${slot.name}</p>
                    <h3 class="font-bold text-slate-800 text-sm">Qui place-t-on à ce poste ?</h3>
                </div>
                <button onclick="closeExercisePicker()" class="text-slate-400 hover:text-slate-700 text-lg" aria-label="Fermer">✕</button>
            </div>
            <div class="overflow-y-auto p-2 space-y-1">
                ${players.length ? players.map(p => {
                    const used = placement[p.id];
                    const isCurrent = p.id === currentId;
                    return `<button onclick="assignExercisePlayerToSlot('${teamKey}', '${key}', '${p.id}')"
                        class="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-left transition ${isCurrent ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200 hover:bg-sky-50 hover:border-sky-300'}">
                        <span class="min-w-0">
                            <span class="block text-xs font-bold text-slate-800 truncate">${getNiveauIcon(p.niveau)} ${formatFirstName(playerFirstName(p))}</span>
                            <span class="block text-[10px] text-slate-400 truncate">${p.name || ''}${p.poste1 ? ' · ' + p.poste1 : ''}</span>
                        </span>
                        <span class="text-[10px] font-extrabold whitespace-nowrap ${isCurrent ? 'text-amber-700' : used ? 'text-amber-600' : 'text-emerald-600'}">${isCurrent ? 'à ce poste' : used ? '→ ' + used : 'libre'}</span>
                    </button>`;
                }).join('') : `<p class="text-xs text-slate-400 italic text-center py-6">Aucun joueur disponible dans cette équipe.</p>`}
            </div>
            ${currentId ? `<div class="p-3 border-t border-slate-100">
                <button onclick="clearExerciseSlot('${teamKey}', '${key}')"
                    class="w-full px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold">
                    Retirer ce joueur du poste
                </button>
            </div>` : ''}
        </div>`;

    document.body.appendChild(overlay);
}

function assignExercisePlayerToSlot(teamKey, key, playerId) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    const map = setup.byTeam[teamKey] = setup.byTeam[teamKey] || {};

    Object.keys(map).forEach(k => { if (map[k] === playerId) delete map[k]; });

    map[key] = playerId;

    saveStateToFirebase();
    closeExercisePicker();
    renderExercise();
}

function clearExerciseSlot(teamKey, key) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    const map = setup.byTeam[teamKey] = setup.byTeam[teamKey] || {};

    delete map[key];

    saveStateToFirebase();
    closeExercisePicker();
    renderExercise();
}

window.closeExercisePicker = closeExercisePicker;
window.assignExercisePlayerToSlot = assignExercisePlayerToSlot;
window.clearExerciseSlot = clearExerciseSlot;

function autoAssignExerciseTeam(teamArg) {

    const session = state.trainings[currentTrainingId];
    if (!session || !session.generatedTeams) return;

    const setup = getExerciseSetup(session);
    const team = teamArg || setup.team;
    const ids = exerciseTeamPlayerIds(team);

    const players = ids.map(id => state.players.find(p => p.id === id)).filter(Boolean);

    const buckets = { GB: [], DEF: [], MIL: [], ATT: [], AUTRE: [] };

    players.forEach(p => {
        const cat = posteCategory(getSessionPoste(p));
        buckets[cat].push(p);
    });

    Object.keys(buckets).forEach(k => buckets[k].sort((a, b) => (b.niveau || 2) - (a.niveau || 2)));

    const map = {};
    const free = [];

    getExercisePositions(setup, team).forEach(slot => {

        const key = team + ':' + slot.idx;
        const pick = buckets[posteCategory(slot.name)].shift();

        if (pick) map[key] = pick.id;
        else free.push(key);
    });

    const rest = buckets.GB.concat(buckets.DEF, buckets.MIL, buckets.ATT, buckets.AUTRE);

    free.forEach(key => {
        const p = rest.shift();
        if (p) map[key] = p.id;
    });

    setup.byTeam[team] = map;
    saveStateToFirebase();

    if (!teamArg) {
        renderExercise();
        showToast('Dispositif auto généré pour l\'équipe ' + team);
    }
}

function autoAssignExerciseBoth() {

    const session = state.trainings[currentTrainingId];
    if (!session || !session.generatedTeams) return;

    autoAssignExerciseTeam('A');
    autoAssignExerciseTeam('B');

    renderExercise();
    showToast('Dispositifs auto générés pour les deux équipes');
}

function resetExerciseTeam() {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    setup.byTeam[setup.team] = {};
    saveStateToFirebase();
    renderExercise();
}

const PROP_STYLES = {
    plot: { size: 20 },
    piquet: { emoji: '🚩', size: 15 },
    mannequin: { emoji: '🗿', size: 24 },
    cible: { emoji: '🎯', size: 18 }
};

const ZONE_COLORS = ['#f59e0b', '#10b981', '#8b5cf6', '#0ea5e9', '#f43f5e', '#84cc16'];

function buildHalfFieldLinesHTML(landscape) {
    return buildExercisePitchSVG('half', landscape);
}

function renderZonesAndProps(setup) {

    const parts = [];

    (setup.props || []).forEach(p => {

        const sp = exercisePropPoint(p.x, p.y);

        if (p.type === 'zone') {

            const zoneA = exercisePropPoint(p.x1, p.y1);
            const zoneB = exercisePropPoint(p.x2, p.y2);
            const x1 = Math.min(zoneA.left, zoneB.left);
            const x2 = Math.max(zoneA.left, zoneB.left);
            const y1 = Math.min(zoneA.top, zoneB.top);
            const y2 = Math.max(zoneA.top, zoneB.top);
            const w = x2 - x1;
            const h = y2 - y1;
            const color = ZONE_COLORS[((p.label || 'A').charCodeAt(0) - 65) % ZONE_COLORS.length] || ZONE_COLORS[0];
            const sel = exerciseUI.selProp === p.id ? 'box-shadow:0 0 0 3px #fbbf24;' : '';

            parts.push(`
                <div data-prop="${p.id}" style="position:absolute;left:${x1}%;top:${y1}%;width:${w}%;height:${h}%;
                    border:2px dashed ${color};background:${color}22;border-radius:8px;
                    display:flex;align-items:center;justify-content:center;cursor:pointer;${sel}">
                    <span style="font-size:10px;font-weight:700;color:${color};">${p.label}</span>
                </div>`);

            return;
        }

        const style = PROP_STYLES[p.type] || { emoji: '🧡', size: 16 };
        const sel = exerciseUI.selProp === p.id ? 'filter:drop-shadow(0 0 4px #fbbf24);' : '';

        if (p.type === 'plot') {

            parts.push(`
                <div data-prop="${p.id}" style="position:absolute;left:${sp.left}%;top:${sp.top}%;
                    width:26px;height:16px;transform:translate(-50%,-50%);cursor:pointer;user-select:none;${sel}">
                    <svg width="26" height="16" viewBox="0 0 26 16" style="display:block;">
                        <polygon points="1,15 25,15 18,5 8,5" fill="#ff8c00" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
                        <polygon points="9,5 17,5 15,8 11,8" fill="#ffffff"/>
                    </svg>
                </div>`);

            return;
        }

        if (p.type && p.type.indexOf('goal_') === 0) {

            const isV = p.type.indexOf('_v') > -1;
            const isLarge = p.type.indexOf('goal_l_') === 0;

            const fieldEl = document.getElementById('exercise-field');
            const fw = (fieldEl && fieldEl.getBoundingClientRect) ? (fieldEl.getBoundingClientRect().width || 400) : 400;

            const gw = isLarge ? fw * 0.15 : fw * 0.06;
            const gh = gw * (isLarge ? (2.44 / 7.32) : 0.4);

            const w = Math.round(isV ? gh : gw);
            const h = Math.round(isV ? gw : gh);
            const post = Math.max(3, Math.round(gw / 16));

            const inner = isV ? `
                <div style="position:absolute;top:0;left:0;right:0;height:${post}px;background:rgba(255,255,255,.95);border-radius:2px;"></div>
                <div style="position:absolute;bottom:0;left:0;right:0;height:${post}px;background:rgba(255,255,255,.95);border-radius:2px;"></div>
                <div style="position:absolute;top:0;bottom:0;left:0;width:${post}px;background:rgba(255,255,255,.95);border-radius:2px;"></div>`
                : `
                <div style="position:absolute;left:0;top:0;bottom:0;width:${post}px;background:rgba(255,255,255,.95);border-radius:2px;"></div>
                <div style="position:absolute;right:0;top:0;bottom:0;width:${post}px;background:rgba(255,255,255,.95);border-radius:2px;"></div>
                <div style="position:absolute;left:0;right:0;top:0;height:${post}px;background:rgba(255,255,255,.95);border-radius:2px;"></div>`;

            parts.push(`
                <div data-prop="${p.id}" style="position:absolute;left:${sp.left}%;top:${sp.top}%;
                    width:${w}px;height:${h}px;transform:translate(-50%,-50%);cursor:pointer;${sel}">
                    ${inner}
                </div>`);

            return;
        }

        parts.push(`
            <div data-prop="${p.id}" style="position:absolute;left:${sp.left}%;top:${sp.top}%;
                font-size:${style.size}px;transform:translate(-50%,-50%);cursor:pointer;user-select:none;${sel}">
                ${style.emoji}
            </div>`);
    });

    return parts.join('');
}

function renderZoneMarker() {

    if (!exerciseUI.zoneP1) return '';

    const p = exercisePropPoint(exerciseUI.zoneP1.x, exerciseUI.zoneP1.y);

    return `<div style="position:absolute;left:${p.left}%;top:${p.top}%;
        width:14px;height:14px;border-radius:50%;background:#fbbf24;border:2px solid white;
        transform:translate(-50%,-50%);box-shadow:0 0 0 3px rgba(251,191,36,.4);"></div>`;
}

function exerciseFieldClick(e) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    if (!setup || setup.mode !== 'edit') return;

    const tool = exerciseUI.tool || 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const stored = exerciseScreenToStored(
        ((e.clientX - rect.left) / rect.width) * 100,
        ((e.clientY - rect.top) / rect.height) * 100
    );
    const x = stored.x;
    const y = stored.y;

    const propEl = e.target && e.target.closest ? e.target.closest('[data-prop]') : null;
    const propId = propEl ? propEl.dataset.prop : null;

    if (tool === 'remove') {

        if (propId) removeProp(propId);
        return;
    }

    if (tool === 'move') {

        if (propId) {

            exerciseUI.selProp = (exerciseUI.selProp === propId) ? null : propId;
            renderExercise();

        } else if (exerciseUI.selProp) {

            moveProp(exerciseUI.selProp, x, y);
            exerciseUI.selProp = null;
            renderExercise();
        }

        return;
    }

    if (tool === 'zone') {

        if (exerciseUI.zoneP1) {

            addZone(exerciseUI.zoneP1, { x, y });
            exerciseUI.zoneP1 = null;
            exerciseUI.tool = 'move';
            renderExercise();

        } else {

            exerciseUI.zoneP1 = { x, y };
            renderExercise();
        }

        return;
    }

    addProp(tool, x, y);
}

function addProp(type, x, y) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    setup.props.push({ id: 'p' + Date.now(), type, x, y });
    saveStateToFirebase();
    renderExercise();
}

function moveProp(id, x, y) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    const p = (setup.props || []).find(pr => pr.id === id);

    if (!p) return;

    p.x = x;
    p.y = y;
    saveStateToFirebase();
    renderExercise();
}

function removeProp(id) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    setup.props = (setup.props || []).filter(p => p.id !== id);
    saveStateToFirebase();
    renderExercise();
}

function addZone(p1, p2) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    const count = (setup.props || []).filter(p => p.type === 'zone').length;
    setup.props.push({
        id: 'z' + Date.now(),
        type: 'zone',
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        label: String.fromCharCode(65 + count)
    });
    saveStateToFirebase();
    renderExercise();
}

function clearExerciseProps() {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    setup.props = [];
    saveStateToFirebase();
    renderExercise();
}

function setExerciseArea(area) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    if (area === setup.area) return;

    setup.area = area;
    exerciseUI.selected = null;
    saveStateToFirebase();
    renderExercise();
    showToast(area === 'half' ? 'Demi-terrain actif' : 'Terrain complet actif');
}

function setExerciseMode(mode) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);
    setup.mode = mode;
    exerciseUI.selected = null;
    exerciseUI.holdSlot = null;
    exerciseUI.slotMove = false;
    exerciseUI.drag = null;

    if (mode === 'edit') {
        exerciseUI.tool = 'move';
        exerciseUI.selProp = null;
        exerciseUI.zoneP1 = null;
    }

    saveStateToFirebase();
    renderExercise();
}

function setExerciseTool(tool) {

    exerciseUI.tool = (exerciseUI.tool === tool) ? 'move' : tool;
    exerciseUI.selProp = null;
    exerciseUI.zoneP1 = null;
    renderExercise();
}

function toolHint(tool) {

    if (tool === 'move') return 'Touchez un accessoire ou une zone pour le choisir, puis touchez le terrain pour le déplacer.';
    if (tool === 'zone') return 'Touchez le 1er coin de la zone, puis le 2ème coin pour la créer. Sinon utilisez les présélections ⊞ ‖ ≡.';
    if (tool === 'remove') return 'Touchez l\'accessoire ou la zone à supprimer.';
    if (tool === 'plot') return 'Touchez le terrain pour placer une coupelle.';
    if (tool === 'piquet') return 'Touchez le terrain pour placer un piquet.';
    if (tool === 'mannequin') return 'Touchez le terrain pour placer un mannequin.';
    if (tool === 'cible') return 'Touchez le terrain pour placer une cible.';
    if (tool === 'goal_s_h') return 'Touchez le terrain pour placer un petit but horizontal.';
    if (tool === 'goal_s_v') return 'Touchez le terrain pour placer un petit but vertical.';
    if (tool === 'goal_l_h') return 'Touchez le terrain pour placer un grand but horizontal.';
    if (tool === 'goal_l_v') return 'Touchez le terrain pour placer un grand but vertical.';
    return 'Touchez le terrain pour placer l\'objet.';
}

function applyZonePreset(kind) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    setup.props = (setup.props || []).filter(p => p.type !== 'zone');

    const zones = [];

    if (kind === 'quadrants') {

        const cols = [{ x1: 0, x2: 50 }, { x1: 50, x2: 100 }];
        const rows = [{ y1: 0, y2: 50 }, { y1: 50, y2: 100 }];
        let n = 0;

        cols.forEach(c => rows.forEach(r => {
            zones.push({ x1: c.x1, y1: r.y1, x2: c.x2, y2: r.y2, label: String.fromCharCode(65 + n) });
            n++;
        }));

    } else if (kind === 'lanes') {

        [['Couloir G', 0, 12], ['Zone centrale', 12, 88], ['Couloir D', 88, 100]].forEach(zone => {
            zones.push({ x1: zone[1], y1: 0, x2: zone[2], y2: 100, label: zone[0] });
        });

    } else if (kind === 'thirds') {

        [['Défense', 0, 33], ['Milieu', 33, 66], ['Attaque', 66, 100]].forEach(zone => {
            zones.push({ x1: 0, y1: zone[1], x2: 100, y2: zone[2], label: zone[0] });
        });
    }

    let seq = 0;

    zones.forEach(z => {
        setup.props.push({
            id: 'z' + Date.now() + '_' + (seq++),
            type: 'zone',
            x1: z.x1,
            y1: z.y1,
            x2: z.x2,
            y2: z.y2,
            label: z.label
        });
    });

    saveStateToFirebase();
    renderExercise();
    showToast('Zones créées');
}

function renderExerciseTools(setup) {

    const el = document.getElementById('exercise-edit-tools');
    const hint = document.getElementById('exercise-hint');

    if (!el || !hint) return;

    const isEdit = setup.mode === 'edit';

    el.classList.toggle('hidden', !isEdit);

    if (!isEdit) {

        hint.innerHTML = "👥 Touchez un maillot pour choisir le joueur de ce poste · glissez un maillot pour ajuster sa position · « ↺ Positions » remet tout en place.";
        return;
    }

    const tools = [
        { t: 'move', label: '🖐️ Déplacer' },
        { t: 'plot', label: '🥏 Coupelle' },
        { t: 'goal_s_h', label: '🥅 Petit ⟷' },
        { t: 'goal_s_v', label: '🥅 Petit ↕' },
        { t: 'goal_l_h', label: '🏟️ Grand ⟷' },
        { t: 'goal_l_v', label: '🏟️ Grand ↕' },
        { t: 'piquet', label: '🚩 Piquet' },
        { t: 'mannequin', label: '🗿 Mannequin' },
        { t: 'cible', label: '🎯 Cible' },
        { t: 'zone', label: '▭ Zone manuelle' },
        { t: 'remove', label: '✕ Supprimer' }
    ];

    el.innerHTML = `
        <div class="flex flex-wrap gap-1.5 mb-1.5">
            ${tools.map(tt => `
                <button onclick="setExerciseTool('${tt.t}')"
                    class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition
                        ${exerciseUI.tool === tt.t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}">
                    ${tt.label}
                </button>`).join('')}
            <button onclick="applyZonePreset('quadrants')"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100">
                ⊞ 4 zones
            </button>
            <button onclick="applyZonePreset('lanes')"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100">
                ‖ 3 couloirs
            </button>
            <button onclick="applyZonePreset('thirds')"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100">
                ≡ 3 tiers
            </button>
            <button onclick="clearExerciseProps()"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                🧹 Tout effacer
            </button>
        </div>
        <div class="text-[11px] text-slate-500 font-medium mb-2">
            ${toolHint(exerciseUI.tool)}
        </div>`;
}

function escapeExerciseValue(str) {

    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function exerciseFmtLabel(key) {

    return (EXERCISE_FORMATS[key] || EXERCISE_FORMATS['8v8']).label;
}

function exerciseFullReset() {

    exerciseUI.selected = null;
    exerciseUI.holdSlot = null;
    exerciseUI.drag = null;
    exerciseUI.slotMove = false;
    exerciseUI.tool = 'move';
    exerciseUI.selProp = null;
    exerciseUI.zoneP1 = null;
}

function setCurrentExercise(i) {

    const session = state.trainings[currentTrainingId];
    session.exercises = session.exercises || [];

    if (i < 0 || i >= session.exercises.length) return;

    session.currentEx = i;

    exerciseFullReset();

    saveStateToFirebase();
    renderExercise();
}

function addExercise() {

    const session = state.trainings[currentTrainingId];
    session.exercises = session.exercises || [];

    const ex = makeExerciseTemplate('Exo ' + (session.exercises.length + 1));

    session.exercises.push(ex);
    session.currentEx = session.exercises.length - 1;

    exerciseFullReset();
    saveStateToFirebase();
    renderExercise();
}

function duplicateExercise() {

    const session = state.trainings[currentTrainingId];
    const i = getCurrentExerciseIndex(session);

    if (!session.exercises || !session.exercises.length) return;

    const copy = JSON.parse(JSON.stringify(session.exercises[i]));

    copy.id = 'e' + Date.now() + Math.random().toString(36).slice(2, 6);
    copy.name = (copy.name || 'Exo') + ' (copie)';
    copy.done = false;

    session.exercises.splice(i + 1, 0, copy);
    session.currentEx = i + 1;

    exerciseFullReset();
    saveStateToFirebase();
    renderExercise();
}

function deleteExercise() {

    const session = state.trainings[currentTrainingId];
    const i = getCurrentExerciseIndex(session);

    if (!session.exercises || !session.exercises.length) return;

    const ex = session.exercises[i];

    const hasPlayers = (ex.byTeam || {}).A && Object.keys(ex.byTeam.A).length > 0 || (ex.byTeam || {}).B && Object.keys(ex.byTeam.B).length > 0;

    if (hasPlayers && !confirm('Supprimer cet exercice ? Les joueurs placés seront perdus.')) return;

    if (exerciseTimer.active && exerciseTimer.exId === ex.id) stopExerciseTimer();

    session.exercises.splice(i, 1);

    if (!session.exercises.length) session.exercises.push(makeExerciseTemplate('Exo 1'));

    session.currentEx = getCurrentExerciseIndex(session);

    exerciseFullReset();
    saveStateToFirebase();
    renderExercise();
}

function moveExercise(i, dir) {

    const session = state.trainings[currentTrainingId];
    const j = i + dir;

    if (!session.exercises || j < 0 || j >= session.exercises.length) return;

    const tmp = session.exercises[i];

    session.exercises[i] = session.exercises[j];
    session.exercises[j] = tmp;
    session.currentEx = j;

    saveStateToFirebase();
    renderExercise();
}

function toggleExerciseDone() {

    const session = state.trainings[currentTrainingId];
    const ex = getExerciseSetup(session);
    ex.done = !ex.done;

    saveStateToFirebase();
    renderExerciseStrip();
    renderExerciseFiche();
}

function updateExerciseMeta(field, value) {

    const session = state.trainings[currentTrainingId];
    const ex = getExerciseSetup(session);

    if (field === 'duration') {

        const v = parseInt(value, 10);
        ex.duration = isNaN(v) ? 0 : v;

    } else if (field === 'note') {

        ex.note = value || '';

    } else {

        ex[field] = value;
    }

    saveStateToFirebase();

    if (field === 'name') renderExerciseStrip();
}

function renderExerciseStrip() {

    const session = state.trainings[currentTrainingId];

    if (!session) return;

    const el = document.getElementById('exercise-strip');

    if (!el) return;

    const idx = getCurrentExerciseIndex(session);

    el.innerHTML = (session.exercises || []).map((ex, i) => `
        <button onclick="setCurrentExercise(${i})"
            class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border whitespace-nowrap transition ${i === idx ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}">
            ${i + 1}. ${ex.done ? '✅ ' : ''}${escapeExerciseValue(ex.name || exerciseFmtLabel(ex.format))}
        </button>`).join('')
        + `<button onclick="addExercise()"
            class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white whitespace-nowrap">
            + Exo
        </button>`;
}

function renderExerciseFiche() {

    const session = state.trainings[currentTrainingId];

    if (!session) return;

    const el = document.getElementById('exercise-fiche');

    if (!el) return;

    const ex = getExerciseSetup(session);
    const idx = getCurrentExerciseIndex(session);
    const n = (session.exercises || []).length;

    el.innerHTML = `
        <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
            <input id="ex-name" value="${escapeExerciseValue(ex.name || '')}"
                oninput="updateExerciseMeta('name', this.value)"
                onchange="renderExerciseStrip()"
                placeholder="Nom de l'exercice"
                class="flex-1 min-w-[140px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700" />
            <input id="ex-duration" type="number" min="0" step="1" value="${parseInt(ex.duration, 10) || ''}"
                oninput="updateExerciseMeta('duration', this.value)"
                placeholder="Durée (min)"
                class="w-[95px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700" />
            <input id="ex-series" value="${escapeExerciseValue(ex.series || '')}"
                oninput="updateExerciseMeta('series', this.value)"
                placeholder="Séries (3×10 min)"
                class="flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700" />
        </div>
        <div class="flex flex-wrap items-center gap-1.5 mb-1.5">
            <button onclick="toggleExerciseDone()"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${ex.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}">
                ${ex.done ? '✅ Fait' : '◻️ À faire'}
            </button>
            <button onclick="startExerciseTimer()"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                ▶️ Lancer le chrono
            </button>
            ${n > 1 ? `
            <button onclick="moveExercise(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}
                class="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 ${idx === 0 ? 'opacity-40' : ''}">▲</button>
            <button onclick="moveExercise(${idx}, 1)" ${idx === n - 1 ? 'disabled' : ''}
                class="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 ${idx === n - 1 ? 'opacity-40' : ''}">▼</button>` : ''}
            <button onclick="duplicateExercise()"
                class="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">⧉ Dupliquer</button>
            <button onclick="deleteExercise()"
                class="px-2 py-1.5 rounded-lg text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">🗑</button>
        </div>
        <textarea id="ex-note" rows="2"
            oninput="updateExerciseMeta('note', this.value)"
            placeholder="Consignes de l'exercice…"
            class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700"></textarea>
    `;

    document.getElementById('ex-note').value = ex.note || '';
    document.getElementById('ex-series').value = ex.series || '';
}

var exerciseTimer = { int: null, endAt: 0, exId: null, paused: false, left: 0, active: false };

var exerciseAudioCtx = null;

function ensureExerciseAudio() {

    if (!exerciseAudioCtx) exerciseAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (exerciseAudioCtx.state === 'suspended') exerciseAudioCtx.resume();
}

function exerciseBeep() {

    try {

        ensureExerciseAudio();

        const o = exerciseAudioCtx.createOscillator();
        const g = exerciseAudioCtx.createGain();

        o.connect(g);
        g.connect(exerciseAudioCtx.destination);

        o.frequency.value = 880;
        g.gain.value = 0.35;

        o.start();
        setTimeout(function () { try { o.stop(); } catch (e) { } }, 800);

    } catch (e) { }
}

function fmtTimer(ms) {

    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);

    return m + ':' + (s < 10 ? '0' : '') + s;
}

function startExerciseTimer() {

    const session = state.trainings[currentTrainingId];
    const ex = getExerciseSetup(session);

    const dur = parseInt(ex.duration, 10) || 0;

    if (dur <= 0) { showToast('Renseigne une durée en minutes'); return; }

    stopExerciseTimer();

    try { ensureExerciseAudio(); } catch (e) { }

    exerciseTimer.exId = ex.id;
    exerciseTimer.endAt = Date.now() + dur * 60000;
    exerciseTimer.paused = false;
    exerciseTimer.active = true;

    const ov = document.getElementById('exercise-timer-overlay');
    const nm = document.getElementById('exercise-timer-name');
    const tm = document.getElementById('exercise-timer-time');
    const pb = document.getElementById('exercise-timer-pause');

    ov.style.display = 'flex';
    ov.classList.remove('done');
    nm.textContent = ex.name || exerciseFmtLabel(ex.format);
    tm.classList.remove('over');
    pb.textContent = '⏸ Pause';

    exerciseTimer.int = setInterval(tickExerciseTimer, 300);

    tickExerciseTimer();
}

function tickExerciseTimer() {

    if (!exerciseTimer.active || exerciseTimer.paused) return;

    const left = exerciseTimer.endAt - Date.now();
    const tm = document.getElementById('exercise-timer-time');

    if (left <= 0) { finishExerciseTimer(); return; }

    tm.textContent = fmtTimer(left);
    tm.classList.toggle('over', left <= 15000);
}

function pauseExerciseTimer() {

    if (!exerciseTimer.active) return;

    const pb = document.getElementById('exercise-timer-pause');

    if (exerciseTimer.paused) {

        exerciseTimer.endAt = Date.now() + exerciseTimer.left;
        exerciseTimer.paused = false;
        pb.textContent = '⏸ Pause';

    } else {

        exerciseTimer.left = Math.max(0, exerciseTimer.endAt - Date.now());
        exerciseTimer.paused = true;
        pb.textContent = '▶ Reprendre';
    }
}

function stopExerciseTimer() {

    exerciseTimer.active = false;

    if (exerciseTimer.int) { clearInterval(exerciseTimer.int); exerciseTimer.int = null; }

    const ov = document.getElementById('exercise-timer-overlay');

    if (ov) { ov.style.display = 'none'; }
}

function finishExerciseTimer() {

    stopExerciseTimer();

    const ov = document.getElementById('exercise-timer-overlay');
    const tm = document.getElementById('exercise-timer-time');

    ov.style.display = 'flex';
    ov.classList.add('done');
    tm.textContent = '0:00';
    tm.classList.add('over');

    exerciseBeep();
    if (navigator.vibrate) navigator.vibrate([500, 250, 500, 250, 500]);

    setTimeout(function () { if (ov) ov.style.display = 'none'; }, 3000);
}

function toggleExerciseTemplates() {

    const panel = document.getElementById('exercise-templates-panel');

    if (!panel) return;

    panel.classList.toggle('hidden');
    renderExerciseTemplates();
}

function renderExerciseTemplates() {

    const panel = document.getElementById('exercise-templates-panel');

    if (!panel) return;

    const tpls = state.exerciseTemplates || [];

    panel.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-xs font-bold text-violet-700">💾 Modèles (${tpls.length})</span>
            <button onclick="saveExerciseTemplate()"
                class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white">
                💾 Sauvegarder
            </button>
        </div>
        ${tpls.length ? tpls.map(t => `
            <div class="flex items-center gap-2 py-1.5 border-b border-violet-100 last:border-0">
                <span class="flex-1 text-xs font-semibold text-slate-700">${escapeExerciseValue(t.name)}</span>
                <button onclick="applyExerciseTemplate('${t.id}')"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-violet-100 hover:bg-violet-200 text-violet-800">📥</button>
                <button onclick="deleteExerciseTemplate('${t.id}')"
                    class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-600">🗑</button>
            </div>`).join('')
            : '<div class="text-[11px] text-violet-400">Aucun modèle pour l\'instant : sauvegarde la disposition actuelle pour la réutiliser.</div>'}
    `;
}

function saveExerciseTemplate() {

    const session = state.trainings[currentTrainingId];
    const ex = getExerciseSetup(session);

    const name = prompt('Nom du modèle :', (ex.name || exerciseFmtLabel(ex.format)) + ' (' + exerciseFmtLabel(ex.format) + ')');

    if (!name) return;

    state.exerciseTemplates = state.exerciseTemplates || [];

    state.exerciseTemplates.push({
        id: 't' + Date.now(),
        name: name,
        format: ex.format,
        area: ex.area,
        props: JSON.parse(JSON.stringify(ex.props || [])),
        posOverrides: JSON.parse(JSON.stringify((ex.posOverrides || {})[ex.area] || {}))
    });

    saveStateToFirebase();
    renderExerciseTemplates();
    showToast('Modèle sauvegardé');
}

function applyExerciseTemplate(id) {

    const session = state.trainings[currentTrainingId];
    const tpl = (state.exerciseTemplates || []).find(t => t.id === id);

    if (!tpl) return;

    const ex = makeExerciseTemplate(tpl.name);

    ex.format = tpl.format;
    ex.area = tpl.area;
    ex.props = JSON.parse(JSON.stringify(tpl.props || []));
    ex.posOverrides[tpl.area] = JSON.parse(JSON.stringify(tpl.posOverrides || {}));

    session.exercises = session.exercises || [];
    session.exercises.push(ex);
    session.currentEx = session.exercises.length - 1;

    exerciseFullReset();
    saveStateToFirebase();
    renderExercise();
    showToast('Modèle « ' + tpl.name + ' » ajouté');
}

function deleteExerciseTemplate(id) {

    if (!confirm('Supprimer ce modèle ?')) return;

    state.exerciseTemplates = (state.exerciseTemplates || []).filter(t => t.id !== id);

    saveStateToFirebase();
    renderExerciseTemplates();
    showToast('Modèle supprimé');
}














