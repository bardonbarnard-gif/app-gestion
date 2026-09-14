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

        const firebaseConfig = {
            apiKey: "AIzaSyBVdcpzLr_VxfLTvN8kpkNv69Hc4xdzct0",
            authDomain: "ai-studio-applet-webapp-1b612.firebaseapp.com",
            databaseURL: "https://ai-studio-applet-webapp-1b612-default-rtdb.europe-west1.firebasedatabase.app",
            projectId: "ai-studio-applet-webapp-1b612",
            storageBucket: "ai-studio-applet-webapp-1b612.firebasestorage.app",
            messagingSenderId: "279839540206",
            appId: "1:279839540206:web:a5d82ea7b4d9a9cf9d84ff"
        };

        try { firebase.initializeApp(firebaseConfig); } catch(e) {}
        window.authReady = firebase.auth().signInAnonymously().catch(function (err) {
            console.error("Auth anonyme indisponible :", err);
        });
        const db = firebase.database();

        // Données initiales par défaut (Effectif de base)
        const defaultPlayers = [
            { id: "J001", name: "BAILLARIN Theo", licence: "9603227294", phonePere: "06 76 16 72 65", team: "u14", poste1: "AD", poste2: "BU", poste3: "MC" },
            { id: "J002", name: "BAZABAS Mael", licence: "9604869553", phonePere: "06 48 62 75 80", team: "u14", poste1: "BU", poste2: "AG", poste3: "-" },
            { id: "J003", name: "BEAULIEU Barthelemy", licence: "9602804942", phonePere: "06 61 53 24 85", team: "u14", poste1: "DC", poste2: "MDC", poste3: "-" },
            { id: "J018", name: "BONNEFIS Antoine", licence: "9603191094", phonePere: "06 22 34 04 20", team: "u13", poste1: "AD", poste2: "DD", poste3: "-" },
            { id: "J004", name: "BOUAJAJ Ibrahim", licence: "9605352704", phonePere: "06 95 84 64 94", team: "u14", poste1: "DC", poste2: "MDC", poste3: "-" },
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
};

// Variables d'interface uniquement
let currentSession = 1;
let selectedMatchId = null;
let currentCatFilter = 'all';

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

                renderAll();
                maybeAutoSyncFFF();
            } catch(err) {
                console.error("Erreur de synchronisation :", err);
            }
        });

function saveStateToFirebase() {

    recalculateGlobalStats();

 const dataToSave = {
    players: state.players,
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
    fffProxyUrl: state.fffProxyUrl
};

    db.ref('rangueil_data').update(dataToSave);
}
``

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

    ['dashboard', 'effectif', 'matchs', 'entrainements', 'calendrier','staff','admin'].forEach(t => {
                const sec = document.getElementById(`sec-${t}`);
                if(sec) sec.classList.add('hidden');
                const btn = document.getElementById(`tab-${t}`);
                if (btn) btn.classList.remove('bg-white/20', 'text-white');
                const mobBtn = document.getElementById(`mob-tab-${t}`);
                if (mobBtn) mobBtn.classList.remove('active');
            });

            const targetSec = document.getElementById(`sec-${tabId}`);
            if(targetSec) targetSec.classList.remove('hidden');
            if (tabId === 'matchs') {
    renderMatchDetail();
}
            const activeBtn = document.getElementById(`tab-${tabId}`);
            if (activeBtn) activeBtn.classList.add('bg-white/20', 'text-white');
            const activeMobBtn = document.getElementById(`mob-tab-${tabId}`);
            if (activeMobBtn) activeMobBtn.classList.add('active');
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
            function getTeamColor(teamKey) {

    const color =
        state.teams?.[teamKey]?.color || 'slate';

    const colors = {
        sky: {
            bg: 'bg-sky-50',
            border: 'border-sky-300',
            text: 'text-sky-800'
        },
        emerald: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-300',
            text: 'text-emerald-800'
        },
        red: {
            bg: 'bg-red-50',
            border: 'border-red-300',
            text: 'text-red-800'
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-300',
            text: 'text-orange-800'
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-300',
            text: 'text-purple-800'
        },
        slate: {
            bg: 'bg-slate-50',
            border: 'border-slate-300',
            text: 'text-slate-800'
        }
    };

    return colors[color] || colors.slate;
}
            const h = parseInt(scoreHome), a = parseInt(scoreAway);
            if (h > a) return '<span class="px-2.5 py-1 rounded text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">VICTOIRE 🟢</span>';
            if (h < a) return '<span class="px-2.5 py-1 rounded text-xs font-black bg-red-100 text-red-800 border border-red-300">DÉFAITE 🔴</span>';
            return '<span class="px-2.5 py-1 rounded text-xs font-black bg-slate-900 text-white border border-slate-700">MATCH NUL ⬛</span>';
        }

        function calculateSeasonStats() {
            let wins = 0, draws = 0, losses = 0;
            Object.values(state.matches).forEach(m => {
                if (m.scoreHome !== undefined && m.scoreAway !== undefined && m.scoreHome !== "" && m.scoreAway !== "") {
                    const h = parseInt(m.scoreHome), a = parseInt(m.scoreAway);
                    if (h > a) wins++; else if (h === a) draws++; else losses++;
                }
            });
            return { wins, draws, losses };
        }

        // Rendu Tableau de bord
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
    `<span class="text-emerald-600">${wins}V</span> -
     <span class="text-slate-700">${draws}N</span> -
     <span class="text-red-600">${losses}D</span>`;

            
            const teamCards =
    role === 'coach'
        ? getTeamCards(dashboardMatches)
        : getTotalTeamCards();
            document.getElementById('stat-total-cards').innerHTML = `<span class="text-amber-500">${teamCards.yellows}🟨</span> <span class="text-red-600">${teamCards.reds}🟥</span>`;

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


        function renderTopScorersAndPassers() {
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
            let playersWithStats = playersSource.map(p => {
                let s = state.stats[p.id] || { goals: 0, assists: 0 };
                return { name: p.name, goals: s.goals || 0, assists: s.assists || 0 };
            });

            document.getElementById('dashboard-top-scorers').innerHTML = [...playersWithStats].sort((a,b) => b.goals - a.goals).slice(0, 3).map((p, i) => `
                <div class="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs"><span class="font-bold text-slate-700">${i+1}. ${p.name}</span><span class="bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded">${p.goals} ⚽</span></div>`).join('');

            document.getElementById('dashboard-top-passers').innerHTML = [...playersWithStats].sort((a,b) => b.assists - a.assists).slice(0, 3).map((p, i) => `
                <div class="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs"><span class="font-bold text-slate-700">${i+1}. ${p.name}</span><span class="bg-sky-100 text-sky-800 font-extrabold px-2 py-0.5 rounded">${p.assists} 🎯</span></div>`).join('');
        }

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
                const cards = getPlayerCardsCount(p.id);
                const pStats = state.stats[p.id] || { goals: 0, assists: 0 };
                const teamKey = p.team || p.cat; 
                const teamName = state.teams?.[teamKey]?.name || "Sans équipe";
                const teamColors = getTeamColorClasses(teamKey);
                const catBadge =`<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${teamColors.badge}">
        ${teamName}
    </span>`;


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

                                return `
                <div class="p-3 ${teamColors.bg} border ${teamColors.border} rounded-xl flex flex-col justify-between space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
    <h3 class="font-bold text-xs ${teamColors.textBold}">${p.name}</h3>
    ${attendanceBadge}
    <p class="text-[11px] ${hasLicence ? teamColors.textLight : 'text-amber-700 font-bold'}">
        Licence: ${hasLicence ? p.licence : '⚠️ Manquante'}
    </p>
</div>
                        <div class="flex items-center space-x-1.5">${catBadge}<button onclick="openModalPlayer('${p.id}')" class="p-1 ${teamColors.textLight} hover:${teamColors.textBold}" aria-label="Modifier le joueur ${p.name}"><i class="fa-solid fa-pen-to-square text-xs"></i></button><button onclick="deletePlayer('${p.id}')" class="p-1 text-slate-400 hover:text-red-600" aria-label="Supprimer le joueur ${p.name}"><i class="fa-solid fa-trash-can text-xs"></i></button></div>
                    </div>
                    <div class="text-xs space-y-2 pt-2 border-t ${teamColors.border}">
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-white px-2.5 py-1.5 rounded border flex justify-between"><span class="text-slate-500">Stats:</span><span class="font-bold text-slate-700">${pStats.goals}⚽ ${pStats.assists}🎯</span></div>
                            <div class="bg-white px-2.5 py-1.5 rounded border flex justify-between"><span class="text-slate-500">Cartons:</span><span class="font-bold"><span class="text-amber-600">${cards.yellows}🟨</span> <span class="text-red-600">${cards.reds}🟥</span></span></div>
                        </div>
                        <div class="bg-white px-2.5 py-1.5 rounded border flex justify-between items-center">
                            <span class="text-slate-500">Entraînements :</span>
                            <span class="font-bold ${presenceColor}">
                                ${presencePct !== null ? `${presencePct}% 📅 (${presences}/${totalSessions})` : '<span class="text-slate-400 font-normal italic">Aucune séance passée</span>'}
                            </span>
                        </div>
                        <div class="bg-white p-2 rounded border">
    <p class="text-[10px] text-slate-500 uppercase font-extrabold mb-1">
        Niveau :
    </p>
    ${niveauBadge}
</div>
                        <div class="bg-white p-2 rounded border space-y-1">
                            <p class="text-[10px] text-slate-500 uppercase font-extrabold">Postes :</p>
                            <div class="flex items-center space-x-1.5 text-[11px]">
                                <span class="font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-900">1. ${p1}</span>
                                ${p2 !== '-' ? `<span class="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">2. ${p2}</span>` : ''}
                                ${p3 !== '-' ? `<span class="font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">3. ${p3}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </div>`;
            }).join('');
        }

        window.renderEffectif = renderEffectif;

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

        function renderMatchDetail() {
            const role = window.currentUserRole || 'public';
const userTeam = window.currentUserTeam || 'all';
            const selector = document.getElementById('match-selector');
            const tbody = document.getElementById('match-convocation-tbody');
            const infoCard = document.getElementById('match-info-card');
            const counterBanner = document.getElementById('convocation-counter-banner');
            const carpoolBanner = document.getElementById('carpooling-counter-banner');
            const validationStatus = document.getElementById('match-validation-status');

           if (!state.selectedMatchId) {

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="p-8 text-center text-slate-400">
                <div class="flex flex-col items-center space-y-2">
                    <i class="fa-solid fa-calendar-days text-3xl"></i>
                    <p class="font-bold">
                        Aucun match sélectionné
                    </p>
                    <p>
                        Sélectionnez ou créez un match pour gérer les convocations.
                    </p>
                </div>
            </td>
        </tr>
    `;

    infoCard.style.display = 'none';
    counterBanner.style.display = 'none';
    if (carpoolBanner) {
    carpoolBanner.style.display = 'none';
}

    return;
}

            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">Aucun match disponible.</td></tr>`;
              if (infoCard) infoCard.style.display = 'none';
if (counterBanner) counterBanner.style.display = 'none';
if (carpoolBanner) carpoolBanner.style.display = 'none';  
                if(validationStatus) validationStatus.innerHTML = '';
                return;
            }

            selector.value = state.selectedMatchId;
            if (infoCard) infoCard.style.display = 'flex';
if (counterBanner) counterBanner.style.display = 'flex';
if (carpoolBanner) carpoolBanner.style.display = 'flex';
            const m = state.matches[state.selectedMatchId];
            if (
    role === 'coach' &&
    m &&
    (m.team || '').toLowerCase() !== userTeam.toLowerCase()
) {
    return;
}

            // Filtrer les joueurs selon le rôle
            const playersForMatch = role === 'coach'
           
            
                ? state.players.filter(p => (p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase())
                : state.players;

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

            let convokedCount = 0, totalSeats = 0;
            const targetConvoked = parseInt(state.teams?.[m.team]?.targetConvocations) || 14;
            playersForMatch.forEach(p => {
                if (m.convocations[p.id] === 'convoke') convokedCount++;
                totalSeats += parseInt(m.carpool[p.id]) || 0;
            });

            counterBanner.className = `p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${convokedCount < targetConvoked ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-sky-50 border-sky-200 text-sky-900'}`;
            counterBanner.innerHTML = `<div class="font-bold text-xs">Convocations : ${convokedCount} / ${targetConvoked}</div><span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${convokedCount < targetConvoked ? 'bg-amber-200' : 'bg-sky-200'}">${convokedCount < targetConvoked ? '⚠️ Incomplet' : '🔵 OK'}</span>`;

    const summary = buildCarpoolSummary(m, playersForMatch);

// (statuts et compteurs calculés par buildCarpoolSummary)

if (carpoolBanner) {

    carpoolBanner.className =
        `p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${summary.closed ? 'bg-sky-50 border-sky-200 text-sky-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`;

    carpoolBanner.innerHTML = `
<div class="w-full text-xs space-y-1">

<div class="flex flex-wrap items-center gap-2">
    <div class="font-bold">🚗 Covoiturage</div>
    ${summary.closed ? '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-200 text-sky-900">🔒 Confirmé par le coach</span>' : '<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-200 text-emerald-900">En cours</span>'}
</div>

<div>
✅ Réponses : ${summary.responses}/${summary.totalConvoked}
</div>

<div>
⏳ En attente : ${summary.pending}
</div>

<div>
🚗 Conducteurs : ${summary.drivers}
</div>

<div>
👤 Passagers : ${summary.passengers}
</div>

<div>
📍 Direct : ${summary.directs}
</div>

<div>
❌ Absents : ${summary.absents}
</div>

<div class="font-bold">
🚘 Places proposées : ${summary.seats}
</div>

<div class="font-bold ${summary.transportClass}">
${summary.transportStatus}
</div>

${summary.driverList.length ? `
<div class="mt-2">
🚗 <strong>Conducteurs</strong><br>
${summary.driverList.join('<br>')}
</div>
` : ''}

${summary.driverNoSeatList.length ? `
<div class="mt-2">
🚙 <strong>Conducteurs sans place</strong><br>
${summary.driverNoSeatList.join('<br>')}
</div>
` : ''}

${summary.driverAssignments.length ? `
<div class="mt-2">
🚗→👤 <strong>Attribution</strong><br>
${summary.driverAssignments.map(a => `${a.name} : ${a.passengerNames.length ? a.passengerNames.join(', ') : '—'}`).join('<br>')}
</div>
` : ''}

${summary.toPlaceList.length ? `
<div class="mt-2">
🚫 <strong>À placer</strong><br>
${summary.toPlaceList.join('<br>')}
</div>
` : ''}

${summary.passengerList.length ? `
<div class="mt-2">
👤 <strong>Passagers</strong><br>
${summary.passengerList.join('<br>')}
</div>
` : ''}

${summary.directList.length ? `
<div class="mt-2">
📍 <strong>Direct</strong><br>
${summary.directList.join('<br>')}
</div>
` : ''}

${summary.absentList.length ? `
<div class="mt-2">
❌ <strong>Absents</strong><br>
${summary.absentList.join('<br>')}
</div>
` : ''}

${summary.pendingList.length ? `
<div class="mt-2">
⏳ <strong>En attente</strong><br>
${summary.pendingList.join('<br>')}
</div>
` : ''}

${m.carpoolId ? `
<div class="mt-3 flex flex-wrap gap-2">
    <button onclick="openCarpoolQR('${m.id}')" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold rounded-lg">🏷️ QR & lien</button>
    ${(role === 'coach' || role === 'admin' || role === 'responsable') ? (summary.closed ? `<button onclick="setCarpoolClosed('${m.id}', false)" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg">🔓 Rouvrir</button>` : `<button onclick="setCarpoolClosed('${m.id}', true)" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg"><i class="fa-solid fa-lock mr-1"></i>Clôturer le covoiturage</button>`) : ''}
    <button onclick="copyCarpoolRecap('${m.id}')" class="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white text-[11px] font-bold rounded-lg">📤 Récap WhatsApp</button>
</div>
` : ''}

</div>
`;
}
renderTransportTab(summary);

renderMatchSummary(m);


            // 1. Rendu des Joueurs : Séparation claire Mobile (Cartes) / PC (Tableau)
            let htmlMobileCards = '';
            let htmlTableRows = '';

            playersForMatch.forEach(p => {
                const currentStatus = m.convocations[p.id] || 'none';
                const selectedPosition = m.positions[p.id] || p.poste1 || '-';
                const jerseyNumber = m.jerseys[p.id] || '';
                const carpoolSeats = m.carpool[p.id] || 0;
                const postes = getPlayerPostesList(p);
                const hasLicence = p.licence && p.licence.trim() !== '' && p.licence.trim() !== '-';

                // --- HTML POUR MOBILE (Cartes) ---
                htmlMobileCards += `
                    <div class="bg-white border ${currentStatus === 'convoke' ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200'} rounded-xl p-3.5 shadow-sm space-y-3 mb-2.5">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-2.5">
                                <div class="inline-flex rounded-lg border p-0.5 bg-slate-100 shrink-0">
                                    <button onclick="setMatchStatus('${m.id}', '${p.id}', 'convoke')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${currentStatus === 'convoke' ? 'active-convoke bg-sky-600 text-white' : 'text-slate-600'}">Conv.</button>
                                    <button onclick="setMatchStatus('${m.id}', '${p.id}', 'nonconvoke')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${currentStatus === 'nonconvoke' ? 'active-nonconvoke bg-slate-600 text-white' : 'text-slate-600'}">Non</button>
                                </div>
                                <div>
                                    <div class="font-bold text-slate-800 text-xs">${p.name}</div>
                                    <div class="text-[10px] text-slate-400">Poste favori : <span class="font-semibold text-slate-600">${p.poste1 || '-'}</span></div>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                <span class="text-[10px] text-slate-500 uppercase font-bold">Licence :</span>
                                <div class="flex items-center space-x-1.5">
                                    <span class="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border text-xs">${hasLicence ? p.licence : '⚠️ Manquante'}</span>
                                    ${hasLicence ? `<button onclick="copyLicence('${p.licence}')" class="p-1 bg-white hover:bg-sky-100 text-slate-500 rounded border"><i class="fa-solid fa-copy text-xs"></i></button>` : ''}
                                </div>
                            </div>
                            <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                <span class="text-[10px] text-slate-500 uppercase font-bold">Poste :</span>
                                <select onchange="setMatchPosition('${m.id}', '${p.id}', this.value)" class="bg-white border border-sky-300 font-bold text-xs text-sky-900 py-1 px-2 rounded-lg">
                                    ${postes.map(pos => `<option value="${pos}" ${pos === selectedPosition ? 'selected' : ''}>${pos}</option>`).join('')}
                                    <option value="Gardien" ${selectedPosition === 'Gardien' ? 'selected' : ''}>Gardien</option>
                                    <option value="Remplaçant" ${selectedPosition === 'Remplaçant' ? 'selected' : ''}>Remplaçant</option>
                                </select>
                            </div>
                            <div class="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                <span class="text-[10px] text-slate-500 uppercase font-bold">Maillot N° :</span>
                                <input type="number" min="1" max="99" value="${jerseyNumber}" placeholder="N°" onchange="setMatchJersey('${m.id}', '${p.id}', this.value)" class="w-16 p-1 border rounded text-center font-bold text-xs bg-white">
                            </div>
                        </div>
                        <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-xs bg-slate-50/50 p-2 rounded-lg">
                            <span class="text-[10px] text-slate-500 uppercase font-bold">Covoiturage :</span>
                            <select onchange="setMatchCarpool('${m.id}', '${p.id}', this.value)" class="bg-white border font-bold text-xs py-1 px-2 rounded-lg">
                                <option value="0" ${carpoolSeats == 0 ? 'selected' : ''}>0 place</option>
                                <option value="2" ${carpoolSeats == 2 ? 'selected' : ''}>🚗 2 places</option>
                                <option value="3" ${carpoolSeats == 3 ? 'selected' : ''}>🚗 3 places</option>
                                <option value="4" ${carpoolSeats == 4 ? 'selected' : ''}>🚗 4 places</option>
                                <option value="5" ${carpoolSeats == 5 ? 'selected' : ''}>🚗 5 places</option>
                            </select>
                        </div>
                    </div>
                `;

                // --- HTML POUR PC (Lignes de tableau classiques) ---
                htmlTableRows += `
                    <tr class="${currentStatus === 'convoke' ? 'bg-sky-50/30' : ''} border-b border-slate-100 hover:bg-slate-50/50">
                        <td class="p-3 pl-4">
                            <div class="font-bold text-slate-800">${p.name}</div>
                            <div class="text-[10px] text-slate-400">Poste favori : ${p.poste1 || '-'}</div>
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
                                <button onclick="setMatchStatus('${m.id}', '${p.id}', 'convoke')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${currentStatus === 'convoke' ? 'active-convoke bg-sky-600 text-white' : 'text-slate-600'}">Conv.</button>
                                <button onclick="setMatchStatus('${m.id}', '${p.id}', 'nonconvoke')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${currentStatus === 'nonconvoke' ? 'active-nonconvoke bg-slate-600 text-white' : 'text-slate-600'}">Non</button>
                            </div>
                        </td>
                    </tr>
                `;
            });

            // 2. Rendu du Staff / Coachs (pour Mobile et PC séparément)
            let staffTableRows = '';
            let staffMobileCards = '';

            // Filtrer le staff par équipe pour les coaches
            const staffForMatch = role === 'coach'
    ? (state.staff || []).filter(s => {

        if (!s.scope) return true;

        const scopes = Array.isArray(s.scope)
            ? s.scope
            : [s.scope];

        return scopes.some(scope =>
            String(scope).toLowerCase() ===
            userTeam.toLowerCase()
        );

    })
    : (state.staff || []);

            if (staffForMatch && staffForMatch.length > 0) {
                staffTableRows += `<tr class="bg-slate-100 text-slate-700 font-bold text-xs"><td colspan="6" class="p-2 pl-4 uppercase tracking-wider">Encadrement / Staff Officiel</td></tr>`;
                staffMobileCards += `<div class="bg-slate-100 text-slate-700 font-bold text-xs p-2.5 rounded-lg my-3 uppercase tracking-wider">Encadrement / Staff Officiel</div>`;

                staffForMatch.forEach(member => {
                    const hasStaffLicence = member.licence && member.licence.trim() !== '';
                    
                    staffTableRows += `
                        <tr class="bg-sky-50/20 border-b border-slate-100">
                            <td class="p-3 pl-4">
                                <div class="font-bold text-slate-800">${member.name}</div>
                                <span class="text-[10px] text-sky-700 font-semibold">${member.role}</span>
                            </td>
                            <td class="p-3" colspan="5">
                                <div class="flex items-center space-x-2">
                                    <span class="text-xs text-slate-600">Licence :</span>
                                    <span class="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border text-xs">${hasStaffLicence ? member.licence : 'Non renseignée'}</span>
                                    ${hasStaffLicence ? `<button onclick="navigator.clipboard.writeText('${member.licence}'); showToast('Licence copiée !')" class="p-1 bg-slate-100 hover:bg-sky-100 text-sky-600 rounded text-xs" title="Copier la licence"><i class="fa-regular fa-copy"></i></button>` : ''}
                                </div>
                            </td>
                        </tr>`;

                    staffMobileCards += `
                        <div class="bg-sky-50/30 border border-slate-200 rounded-xl p-3 mb-2 flex items-center justify-between gap-2">
                            <div>
                                <div class="font-bold text-slate-800 text-xs">${member.name}</div>
                                <span class="text-[10px] text-sky-700 font-semibold">${member.role}</span>
                            </div>
                            <div class="flex items-center space-x-1.5">
                                <span class="font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded border text-xs">${hasStaffLicence ? member.licence : 'Non renseignée'}</span>
                                ${hasStaffLicence ? `<button onclick="navigator.clipboard.writeText('${member.licence}'); showToast('Licence copiée !')" class="p-1 bg-white hover:bg-sky-100 text-sky-600 rounded text-xs border" title="Copier la licence"><i class="fa-regular fa-copy"></i></button>` : ''}
                            </div>
                        </div>`;
                });
            }

            // Injection finale propre dans les deux conteneurs
            const mobileContainer = document.getElementById('mobile-players-container');
            if (mobileContainer) {
                mobileContainer.innerHTML = htmlMobileCards + staffMobileCards;
            }
            
            if (tbody) {
                tbody.innerHTML = htmlTableRows + staffTableRows;
            }
}

        // ============================================================
        // MODULE ENTRAÎNEMENTS — REFONTE COMPLÈTE
        // ============================================================

        let currentTrainingId = null;

        function getTrainingStatusConfig(status) {
            return {
                present: { label: 'Présent', color: 'bg-emerald-500 text-white', icon: '✅' },
                absent:  { label: 'Absent',  color: 'bg-red-500 text-white',     icon: '❌' },
                retard:  { label: 'Retard',  color: 'bg-amber-400 text-white',   icon: '⏰' },
                blesse:  { label: 'Blessé',  color: 'bg-purple-500 text-white',  icon: '🤕' },
                none:    { label: '—',        color: 'bg-slate-100 text-slate-400', icon: '—' }
            }[status] || { label: '—', color: 'bg-slate-100 text-slate-400', icon: '—' };
        }

        function renderEntrainements() {
            renderTrainingStatsBar();
            const daysLabelEl = document.getElementById('training-days-label');
            if (daysLabelEl) daysLabelEl.textContent = trainingDaysLabel() + ' · 18h00 – 20h00';
            const today = new Date(); today.setHours(0,0,0,0);

            const role = window.currentUserRole || 'public';
const userTeam = window.currentUserTeam || 'all';

let all = Object.values(state.trainings || {});

if (role === 'coach') {
    all = all.filter(t =>
        (t.team || '').toLowerCase() === userTeam.toLowerCase()
    );
}
            const future = all.filter(s => s.date && new Date(s.date + 'T12:00:00') >= today)
                              .sort((a, b) => new Date(a.date) - new Date(b.date));
            const past   = all.filter(s => !s.date || new Date(s.date + 'T12:00:00') < today)
                              .sort((a, b) => new Date(b.date) - new Date(a.date));
            const sessions = [...future, ...past];

            const container = document.getElementById('training-sessions-list');
            if (!container) return;

            if (sessions.length === 0) {
                container.innerHTML = `<div class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <i class="fa-solid fa-whistle text-4xl mb-3 opacity-30"></i>
                    <p class="text-sm font-semibold">Aucune séance enregistrée</p>
                    <p class="text-xs mt-1">Créez votre première séance avec le bouton ci-dessus</p>
                </div>`;
                return;
            }

            // Séparateurs
            let html = '';
            let shownNext = false, shownPast = false;

            sessions.forEach((s, i) => {
                const sDate = s.date ? new Date(s.date + 'T12:00:00') : null;
                const isPast = sDate && sDate < today;

                if (!isPast && !shownNext && i === 0) {
                    html += `<p class="text-[10px] font-extrabold uppercase tracking-widest text-sky-500 mb-1 mt-1">⚡ Prochain entraînement</p>`;
                    shownNext = true;
                } else if (!isPast && shownNext && i === 1) {
                    html += `<p class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 mt-3">📅 À venir</p>`;
                } else if (isPast && !shownPast) {
                    html += `<p class="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 mt-4">🕓 Séances passées</p>`;
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
                    : (i === 0 ? '<span class="w-2 h-2 rounded-full bg-sky-400 inline-block animate-pulse"></span>' : '<span class="w-2 h-2 rounded-full bg-slate-300 inline-block"></span>');

                const cardBg = !isPast && i === 0
                    ? 'bg-sky-50 border-sky-200 hover:border-sky-400'
                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 hover:border-sky-200';

                    const teamColors = getTeamColorClasses(s.team);

                html += `<div onclick="openTrainingDetail('${s.id}')"
     class="p-3.5 ${cardBg} border ${teamColors.border} border-l-4 rounded-xl cursor-pointer transition-all group">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl ${isPast ? 'bg-slate-400' : 'bg-gradient-to-br from-sky-500 to-blue-600'} text-white flex items-center justify-center shadow-sm">
                                <i class="fa-solid fa-whistle text-sm"></i>
                            </div>
                            <div>
                                <div class="flex items-center space-x-2">
                                    ${statusDot}
                                    <div>
    <p class="font-bold text-slate-800 text-xs">
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
                        <div class="flex items-center space-x-3">
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
                <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
                    <p class="text-2xl font-extrabold text-sky-600">${nbSessions}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Séances</p>
                </div>
                <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
                    <p class="text-2xl font-extrabold ${avgColor}">${avgPct === null ? '—' : avgPct + '%'}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Présence moy.</p>
                </div>
                <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
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

        function setTrainingStatus(pId, status) {
            if (!currentTrainingId) return;
            if (!state.trainings[currentTrainingId].presence) state.trainings[currentTrainingId].presence = {};
            state.trainings[currentTrainingId].presence[pId] = status;
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

    const convoked =
        state.players.filter(
            p => m.convocations[p.id] === 'convoke'
        );

    let text =
        `🔵⚪ *RANGUEIL FC - CONVOCATION* ⚪🔵\n\n`;

    text +=
        `🏆 *${m.type || 'Championnat'}*\n`;

    text +=
        `🆚 *${m.opponent}*\n\n`;

    text +=
    `📅 *Date :* ${formatDateFr(m.date)}\n`;

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
    `👉 *Répondre au covoiturage :*\n`;

text +=
    `https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${m.carpoolId}\n\n`;


text +=
`Merci d'indiquer votre situation :

🚗 Je conduis
👤 Je suis passager
📍 J'y vais directement
❌ Absent

`;

    }

    text +=
        `🕐 *Rendez-vous :* ${document.getElementById('m-rdv-preview')?.innerText || '--'}\n`;

    text +=
        `⚽ *Coup d'envoi :* ${m.heure || '--'}\n\n`;

    text +=
    `⏳ *Merci de confirmer votre présence avant :*\n\n`;
text +=
    `${getResponseDeadline(m.date)}\n\n`;

    text +=
        `📋 *Joueurs convoqués (${convoked.length})*\n\n`;

    convoked.forEach((p, idx) => {

        text +=
            `${idx + 1}. ${p.name}\n`;

    });

    text +=
        `\n💙 Allez Rangueil ! ⚽`;

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

    const carpoolResponses =
        state.carpoolResponses?.[
            m.carpoolId
        ] || {};

    const pendingPlayers =
        state.players.filter(
            p =>
                m.convocations?.[p.id] === 'convoke' &&
                !carpoolResponses[p.id]
        );

    let text =
`🔵⚪ RANGUEIL FC ⚪🔵

⏳ RELANCE COVOITURAGE

Merci aux joueurs ayant déjà répondu ✅

Les joueurs suivants n'ont pas encore renseigné leur mode de déplacement :

`;

    pendingPlayers.forEach(p => {
        text += `• ${p.name}\n`;
    });

    text += `

🚗 Répondre ici :
https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${m.carpoolId}

💙 Allez Rangueil !
`;

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
            const convokedPlayers = state.players.filter(p => m.convocations[p.id] === 'convoke');
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
        }

        function setMatchJersey(mId, pId, jersey) {
            if (!state.matches[mId].jerseys) state.matches[mId].jerseys = {};
            state.matches[mId].jerseys[pId] = jersey;
            saveStateToFirebase();
        }

        function setMatchCarpool(mId, pId, seats) {
            if (!state.matches[mId].carpool) state.matches[mId].carpool = {};
            state.matches[mId].carpool[pId] = parseInt(seats) || 0;
            saveStateToFirebase();
            renderMatchDetail();
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

    const [hours, minutes] =
        matchTime.split(':').map(Number);

    const arrival =
    parseInt(
        document.getElementById('m-arrival-margin').value
    ) || 60;

let totalMinutes;

if (location === 'Domicile') {

    totalMinutes =
        (hours * 60) +
        minutes -
        arrival;

} else {

    totalMinutes =
        (hours * 60) +
        minutes -
        arrival -
        travel -
        security;

}

    if (totalMinutes < 0) totalMinutes = 0;

    const rdvHours =
        String(Math.floor(totalMinutes / 60))
            .padStart(2, '0');

    const rdvMinutes =
        String(totalMinutes % 60)
            .padStart(2, '0');

    document.getElementById('m-rdv-preview').innerText =
        rdvHours + ':' + rdvMinutes;
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
    const matchData = {
        id: matchId,
        opponent: document.getElementById('m-opponent').value,
        adresse: document.getElementById('m-adresse').value,
        date: document.getElementById('m-date').value,
        heure: document.getElementById('m-heure').value,
        type: document.getElementById('m-type').value,
        location: document.getElementById('m-location').value,
        pelouse: document.getElementById('m-pelouse').value,
        team: teamValue,

carpoolId:
    (state.matches[matchId]?.carpoolId)
    || ('CP_' + Date.now()),

meetingPlace:
    document.getElementById('m-meeting-place').value,


travelTime:
    parseInt(
        document.getElementById('m-travel-time').value
    ) || 25,

 arrivalMargin:
    parseInt(
        document.getElementById('m-arrival-margin').value
    ) || 60,  

securityMargin:
    parseInt(
        document.getElementById('m-security-margin').value
    ) || 10,
        // Initialiser les champs optionnels
        scoreHome: "",
        scoreAway: "",
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

    };

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
                    document.getElementById('p-name').value = player.name || '';
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
            const playerData = {
    id: pId || 'J_' + Date.now(),
    name: document.getElementById('p-name').value,
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

        function setFilterCat(cat) {
            currentCatFilter = cat;
            document.querySelectorAll('.cat-filter-btn').forEach(btn => {
                btn.classList.remove('bg-sky-600', 'text-white', 'bg-blue-600', 'bg-purple-600');
                btn.classList.add('bg-slate-100', 'text-slate-600');
            });
            document
    .querySelectorAll('.team-chip')
    .forEach(btn => btn.classList.remove('active'));

const active =
    document.getElementById(
        'filter-' + cat
    );

if (active) {
    active.classList.add('active');
}
            filterPlayers();
        }

        function toggleModal(modalId, show) {
            document.getElementById(modalId).classList.toggle('hidden', !show);
        }

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

    cards.forEach((card, i) => {

        const player = playersSource[i];

        if (!player) return;

        const matchText =
            player.name.toLowerCase().includes(q) ||
            (player.licence && player.licence.toLowerCase().includes(q));

        const matchCat =
            currentCatFilter === 'all' ||
            player.team === currentCatFilter;

        card.style.display =
            (matchText && matchCat)
                ? 'block'
                : 'none';
    });
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

    const totalPlayers = state.players.length;

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
    <div class="bg-white rounded-xl border p-4 mb-4 card-shadow">
        ...
    </div>
`;

if (role === 'admin') {
    html += `
        ${role === 'admin' ? `
<div class="team-group">
    <button
        onclick="setFilterCat('all')"
        id="filter-all"
        class="team-chip active">

        Toutes

        <span class="count">
            ${totalPlayers}
        </span>
    </button>
</div>
` : ''}


                <span class="count">
                    ${totalPlayers}
                </span>
            </button>
        </div>
    `;
}

    Object.entries(groups).forEach(([groupName, teams]) => {

        if (!teams.length) return;

        html += `
            <div class="team-group">

                <div class="team-group-title">
                    ${groupName}
                </div>
        `;

        teams
            .sort((a, b) => {

    const numA = parseInt(a.name.match(/\d+/)?.[0] || 999);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || 999);

    return numA - numB;
})
            .forEach(team => {

                html += `
                    <button
                        onclick="setFilterCat('${team.key}')"
                        id="filter-${team.key}"
                        class="team-chip cat-filter-btn">

                        ${team.name}

                        <span class="count">
                            ${team.count}
                        </span>

                    </button>
                `;
            });

        html += `</div>`;
    });

    container.innerHTML = html;
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


// Gérer l'affichage du champ équipe selon le rôle sélectionné
window.toggleTeamInput = function(role) {
    const group = document.getElementById("team-input-group");
    if (role === "admin" || role === "dirigeant" || role === "public") {
        group.style.display = "none";
    } else {
        group.style.display = "block";
    }
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

// 1. Enregistrer ou créer une équipe dans Firebase
function handleSaveTeam(event) {
    event.preventDefault();
    
    const teamIdInput = document.getElementById('team-id').value.trim().toLowerCase();
    const teamNameInput = document.getElementById('team-name').value.trim();

    if (!teamIdInput || !teamNameInput) return;

    // Enregistrement dans Firebase sous le nœud "teams/identifiant_equipe"
    firebase.database().ref('teams/' + teamIdInput).set({
        name: teamNameInput
    }, (error) => {
        if (error) {
            showToast("Erreur lors de l'enregistrement de l'équipe.", "error");
        } else {
            // Réinitialiser le formulaire de l'équipe
            document.getElementById('team-form').reset();
        }
    });
}

// 2. Afficher la liste des équipes dans l'admin et mettre à jour l'application
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

function buildCarpoolSummary(m, playersForMatch) {
    const carpoolResponses = state.carpoolResponses?.[m.carpoolId] || {};
    const responses = Object.keys(carpoolResponses).length;

    const totalConvoked = playersForMatch.filter(p => m.convocations[p.id] === 'convoke').length;

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

            const player = state.players.find(p => p.id === playerId);
            const playerName = player?.name || playerId;

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
                            id => state.players.find(p => p.id === id)?.name || id
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
        id => state.players.find(p => p.id === id)?.name || id
    );

    const availablePassengers = toPlaceListIds
        .map(id => state.players.find(p => p.id === id))
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

    } else {

        transportStatus = '🟢 Transport assuré';
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

function renderTransportTab(data) {

    const container =
        document.getElementById(
            'transport-summary-container'
        );

    if (!container) return;

    container.innerHTML = `

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

        <div class="bg-white border rounded-xl p-4 mb-4">

            <div class="font-bold mb-2">
                🚘 Places disponibles
            </div>

            <div>
                ${data.seats}
            </div>

            <div class="mt-2 font-semibold">
                ${data.transportStatus}
            </div>

        </div>

        <div class="grid md:grid-cols-2 gap-4">

            <div class="border rounded-xl p-4">

                <h3 class="font-bold mb-2">
                    🚗 Conducteurs
                </h3>

                ${data.driverList.join('<br>') || 'Aucun'}

            </div>

            <div class="border rounded-xl p-4">

                <h3 class="font-bold mb-2">
                    👤 Passagers
                </h3>

                ${data.passengerList.join('<br>') || 'Aucun'}

            </div>

            <div class="border rounded-xl p-4">

                <h3 class="font-bold mb-2">
                    📍 Direct
                </h3>

                ${data.directList.join('<br>') || 'Aucun'}

            </div>

            <div class="border rounded-xl p-4">

                <h3 class="font-bold mb-2">
                    ❌ Absents
                </h3>

                ${data.absentList.join('<br>') || 'Aucun'}

            </div>

        </div>

        <div class="mt-4 border rounded-xl p-4">

            <h3 class="font-bold mb-2">
                🚗 → 👤 Répartition des passagers
            </h3>

            ${data.driverAssignments.length ? data.driverAssignments.map(a => `
                <div class="border-b border-slate-100 py-2">

                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <div class="font-semibold">
                            ${a.name}
                            <span class="text-[10px] text-slate-400">
                                (${a.seats} places)
                            </span>
                        </div>
                        <div class="flex flex-wrap gap-1">
                            ${a.passengerNames.map((pn, i) => `
                                <span class="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold flex items-center gap-1">
                                    ${pn}
                                    <button onclick="carpoolRemovePassenger('${data.matchId}','${a.id}','${a.passengerIds[i]}')" class="text-sky-500 hover:text-red-600" title="Retirer">✕</button>
                                </span>
                            `).join('')}
                        </div>
                    </div>

                    <select
                        onchange="carpoolAssignPassenger('${data.matchId}','${a.id}', this.value); this.value=''"
                        class="mt-1 w-full p-1.5 text-xs border rounded-lg bg-white">
                        <option value="">
                            ➕ Ajouter un passager (${a.passengerNames.length}/${a.seats})
                        </option>
                        ${data.availablePassengers.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                    </select>

                </div>
            `).join('') : '<p class="text-xs text-slate-400">Aucun conducteur avec places pour le moment.</p>'}

            ${data.toPlaceList.length ? `
                <div class="mt-3">
                    <strong class="text-red-700">
                        🚫 À placer (${data.toPlaceList.length})
                    </strong>
                    <br>
                    ${data.toPlaceList.join('<br>')}
                </div>
            ` : '<div class="mt-3 text-xs text-slate-400">Tous les passagers sont placés ✅</div>'}

        </div>

        <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">

            <h3 class="font-bold mb-2">

                ⏳ En attente (${data.pendingList.length})

            </h3>

            ${data.pendingList.join('<br>') || 'Tout le monde a répondu ✅'}

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

    const matchPlayers = (match.convocations
        ? state.players.filter(p => match.convocations[p.id] === 'convoke')
        : []
    );

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
``

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
    <div class="font-bold 

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

        ${state.teams?.[training.team]?.name || training.team}

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

    document
        .getElementById('modal-event')
        .classList
        .add('hidden');

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
function getEventTeamsLabel(event) {

    if (
        event.teams &&
        event.teams.includes("all")
    ) {
        return "🌍 Toutes les équipes";
    }

    return (event.teams || [])
        .map(teamKey => {

            const team =
                state.teams?.[teamKey];

            return team
                ? team.name
                : teamKey;

        })
        .join(" • ");

}

function getTeamBadge(event) {

    if (
        event.teams &&
        event.teams.includes("all")
    ) {

        return `
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                🌍 Club
            </span>
        `;

    }

    return (event.teams || [])
        .map(teamKey => {

            const teamName =
                state.teams?.[teamKey]?.name ||
                teamKey;

            return `
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                    ${teamName}
                </span>
            `;

        })
        .join(' ');

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

function fffTryRoutes() {
    const url = state.fffApiBaseLastUrl || "";
    const routes = [];
    const proxyUrl = fffProxyRouteFor(url);
    if (proxyUrl) routes.push({ id: "proxy", url: proxyUrl, jsonp: true });
    routes.push({ id: "direct", url: url });
    routes.push({ id: "allorigins", url: "https://api.allorigins.win/raw?url=" + encodeURIComponent(url) });
    routes.push({ id: "codetabs", url: "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(url) });
    return routes;
}

async function fffFetchJson(path) {
    const url = fffApiUrl(path);
    state.fffApiBaseLastUrl = url;

    const routes = fffTryRoutes();
    const bestId = window.__fffBestRoute;
    if (bestId) {
        routes.sort((a, b) => {
            if (a.id === bestId) return -1;
            if (b.id === bestId) return 1;
            return 0;
        });
    }

    let lastErr = null;
    for (const route of routes) {
        try {
            const data = route.jsonp ? await fffJsonp(route.url) : await fffFetchJsonRaw(route.url);
            if (route.id !== "direct") window.__fffBestRoute = route.id;
            return data;
        } catch (err) {
            lastErr = err;
            console.warn("FFF route '" + route.id + "' inaccessible :", err.message);
        }
    }
    throw new Error("API FFF injoignable depuis le navigateur. Vérifiez l'URL du petit proxy (script Google déployé). " + (lastErr ? lastErr.message : ""));
}

async function fetchFFFCalendar() {
    const clubNo = state.fffClubNo || 18707;
    const now = new Date();
    const seasonYear = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    const seasonStart = seasonYear + "-06-01";

    const params = new URLSearchParams();
    params.set("ma_dat[after]", seasonStart);

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

    return {
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
}

function applyFFFToExisting(existing, fffMatch) {
    existing.opponent = fffMatch.opponent;
    existing.adresse = fffMatch.adresse;
    existing.date = fffMatch.date;
    existing.heure = fffMatch.heure;
    existing.type = fffMatch.type;
    existing.location = fffMatch.location;
    existing.pelouse = fffMatch.pelouse;
    existing.team = fffMatch.team;
    if (fffMatch.scoreHome !== "" && fffMatch.scoreAway !== "") {
        existing.scoreHome = fffMatch.scoreHome;
        existing.scoreAway = fffMatch.scoreAway;
    }
    existing.fff = fffMatch.fff;
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
    const fffDate = (evt.date || "").slice(0, 10);
    const fffOpp = fffNormalize(fffOpponentName(isHome ? evt.away : evt.home));
    if (!fffOpp) return null;
    return Object.values(state.matches).find(m =>
        !m.fff
        && m.team === teamKey
        && (m.date || "") === fffDate
        && fffNormalize(m.opponent) === fffOpp
    );
}

async function refreshFFFCompetitions() {
    const btn = document.getElementById("fff-scan-btn");
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyse en cours...';
    }
    try {
        const calendar = await fetchFFFCalendar();
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
            const linkedCpNos = Object.keys(links).map(Number);
            if (linkedCpNos.length === 0) {
                if (isManual) showToast("ℹ️ Liez d'abord vos équipes aux compétitions FFF", "info");
                return;
            }

            const calendar = await fetchFFFCalendar();
            window.__fffCalendar = calendar;

            let created = 0;
            let updated = 0;

            calendar.forEach(evt => {
                const cpNo = evt.competition ? evt.competition.cp_no : null;
                if (!linkedCpNos.some(c => c === Number(cpNo))) return;

                const link = links[cpNo];
                const teamKey = link && link.team;
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
            });

            state.fffLastSync = Date.now();
            saveStateToFirebase();
            renderAll();

            if (isManual) showToast("✅ " + created + " match(s) ajouté(s), " + updated + " mis à jour");
            const statusEl = document.getElementById("fff-sync-status");
            if (statusEl) statusEl.textContent = "Dernière synchro : " + fffFormatDate(new Date()) + " · " + created + " nouveau(x) · " + updated + " mis à jour";
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

            html += `
            <div class="bg-slate-50 border ${linked ? "border-emerald-300 bg-emerald-50/40" : "border-slate-200"} rounded-xl p-3 mb-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="min-w-0">
                        <div class="font-bold text-sm text-slate-800">
                            <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mr-1.5 ${typeBadge}">${fffTypeLabel(c.tipo)}</span>
                            ${c.name}
                        </div>
                        <div class="text-[11px] text-slate-500 mt-0.5">${catLabel} · ${c.matches} match(s)${c.poule ? " · " + c.poule : ""}</div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${linked ? `<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-bold">✓ ${teamName}</span>` : ""}
                        <select onchange="onFFFLinkChange('${c.cp_no}', this.value)" class="border rounded-lg p-2 text-xs ${linked ? "border-emerald-300" : "border-slate-200"}">
                            <option value="">— Ne pas lier —</option>
                            ${Object.entries(state.teams || {}).map(([k, t]) => `<option value="${k}" ${linked === k ? "selected" : ""}>${t.name || k.toUpperCase()}</option>`).join("")}
                        </select>
                    </div>
                </div>
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

    } else {

        if (titleEl) titleEl.textContent = 'Nouvelle équipe';
        if (idHidden) idHidden.value = '';
        if (keyInput) {
            keyInput.value = '';
            keyInput.disabled = false;
        }
        if (targetInput) targetInput.value = 14;

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

    firebase.database().ref('teams/' + key).set({
        name: name,
        targetConvocations: target
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

function renderMatchComposition() {

    const container =
        document.getElementById(
            'match-composition-container'
        );

    if (!container) return;

    if (
        !state.selectedMatchId ||
        !state.matches[state.selectedMatchId]
    ) {

        container.innerHTML = `
            <div class="text-center py-8 text-slate-400">

                ⚽

                <div>
                    Sélectionnez un match
                </div>

            </div>
        `;

        return;
    }

    const match =
        state.matches[state.selectedMatchId];

    if (!match.composition) {
        match.composition = {};
    }

    const players =
        state.players.filter(
            p =>
                match.convocations?.[p.id] ===
                'convoke'
        );

    const terrainPlayers =
        players.filter(
            p =>
                match.composition[p.id]
        );

    const assignedPlayers =
    Object.values(
        match.slotAssignments || {}
    );

const benchPlayers =
    players.filter(
        p =>
            !assignedPlayers.includes(
                p.id
            )
    );

    container.innerHTML = `

        <div class="flex flex-wrap gap-2 mb-4">

            <button
                onclick="applyFormation('433')"
                class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">

                4-3-3

            </button>

            <button
                onclick="applyFormation('442')"
                class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">

                4-4-2

            </button>

            <button
                onclick="applyFormation('352')"
                class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">

                3-5-2

            </button>

            <button onclick="applyFormation('4231')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    4-2-3-1
</button>

<button onclick="applyFormation('4141')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    4-1-4-1
</button>

<button onclick="applyFormation('451')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    4-5-1
</button>

<button onclick="applyFormation('343')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    3-4-3
</button>

<button onclick="applyFormation('532')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    5-3-2
</button>

<button onclick="applyFormation('541')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    5-4-1
</button>

<button onclick="applyFormation('4312')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    4-3-1-2
</button>

<button onclick="applyFormation('4222')"
    class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">
    4-2-2-2
</button>

            <button
    onclick="resetComposition()"
    class="px-3 py-2 bg-red-600 text-white rounded-lg text-xs font-bold">

    🔄 Tout au banc

</button>

        </div>

        <div class="grid lg:grid-cols-4 gap-4">

            <div class="lg:col-span-3">

                <div
                    id="composition-terrain"
                    ondragover="allowDrop(event)"
                    ondrop="dropPlayer(event)"
                    class="
                    relative
                    bg-green-600
                    rounded-2xl
                    min-h-[700px]
                    overflow-hidden">

                    <div class="absolute inset-4 border-2 border-white/60 rounded-xl"></div>

                    <div class="absolute left-0 right-0 top-1/2 border-t border-white/40"></div>

                   <div class="absolute left-1/2 top-1/2 w-24 h-24 border-2 border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

${getFormationSlots(
    match.currentFormation || "433"
).map(pos => {

    const playerId =
        match.slotAssignments?.[pos.slot];

    const player =
        state.players.find(
            p => p.id === playerId
        );

        const jersey =
    player
        ? (match.jerseys?.[player.id] || "")
        : "";

    return `

        <div
            onclick="assignPlayerToSlot('${pos.slot}')"

            class="
            absolute
            border-2
            border-dashed
            border-white/70
            bg-white/10
            rounded-xl
            px-3
            py-2
            text-xs
            font-bold
            text-white
            cursor-pointer
            -translate-x-1/2
            -translate-y-1/2"

            style="
                left:${pos.x}%;
                top:${pos.y}%;
            ">

          ${
    player
        ? `
            <div class="flex flex-col items-center">

                <div
                    class="
                    w-10 h-10
                    rounded-full
                    bg-white
                    flex
                    items-center
                    justify-center
                    shadow">

                    <input
                        type="number"
                        min="1"
                        max="99"
                        value="${jersey || ""}"

                        onchange="
                            setMatchJersey(
                                '${match.id}',
                                '${player.id}',
                                this.value
                            )
                        "

                        class="
                        w-8
                        bg-transparent
                        text-center
                        text-green-700
                        font-black
                        text-sm
                        outline-none">

                </div>

                <div
                    class="
                    text-[10px]
                    leading-tight
                    mt-1
                    text-center">

                    ${player.name}

                </div>

            </div>
          `
        : pos.slot
}
        </div>

    `;

}).join('')}

${terrainPlayers.map(player => {

    const pos =
        match.composition[player.id];

    return `

                            <div
                                draggable="true" ondragstart="startDragPlayer(event,'${player.id}')"

                                class="absolute bg-white rounded-xl shadow-lg cursor-grab px-3 py-2 text-center min-w-[110px] -translate-x-1/2 -translate-y-1/2"

                                style="
                                    left:${pos.x}%;
                                    top:${pos.y}%;
                                ">

                                <div class="font-bold text-xs">
                                    ${player.name}
                                </div>

                                <div class="text-[10px] text-sky-700 font-semibold">
                                    ${getPosteLabel(player.poste1)}
                                </div>

                                <button
                                    onclick="removePlayerFromComposition('${player.id}')"
                                    class="text-red-500 text-[10px] mt-1">

                                    Retirer

                                </button>

                            </div>

                        `;

                    }).join('')}

                </div>

            </div>

            <div>

                <h3 class="font-bold mb-3">
                    🔄 Banc
                </h3>

                <div class="space-y-2">

                    ${benchPlayers.map(player => `

                        <button
                            onclick="selectBenchPlayer('${player.id}')"

                            class="w-full bg-white border rounded-xl p-3 text-left hover:bg-sky-50">

                            <span class="font-bold">${player.name}</span>

                            <span class="ml-2 text-[10px] font-semibold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                                ${getPosteLabel(player.poste1)}
                            </span>

                        </button>

                    `).join('')}

                </div>

            </div>

        </div>

    `;
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

function selectCompositionPlayer(playerId) {

    selectedCompositionPlayer = playerId;

    showToast(
        "Cliquez sur une zone du terrain"
    );

}

function moveSelectedPlayer(event) {

    if (!selectedCompositionPlayer) {
        return;
    }

    const terrain =
        document.getElementById(
            'composition-terrain'
        );

    if (!terrain) return;

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
        selectedCompositionPlayer
    ] = {
        x,
        y
    };

    saveStateToFirebase();

    selectedCompositionPlayer = null;

    renderMatchComposition();

    showToast(
        "Joueur déplacé"
    );
}

function addPlayerToComposition(playerId) {

    const match =
        state.matches[state.selectedMatchId];

    match.composition[playerId] = {

        x: 50,
        y: 50

    };

    saveStateToFirebase();

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

    if (!match.composition) {
        match.composition = {};
    }

    const playerIds =
        Object.keys(match.composition);

    const formation = getFormationSlots(system).map(pos => ({
        x: pos.x,
        y: pos.y
    }));

    if (!formation) {
        return;
    }

    playerIds
        .slice(0, 11)
        .forEach((playerId, index) => {

            match.composition[playerId] = {
                x: formation[index].x,
                y: formation[index].y
            };

        });

    match.currentFormation = system;

    saveStateToFirebase();

    renderMatchComposition();

    showToast(
        `Système ${system} appliqué`
    );
}

function getFormationSlots(system = "433") {
    const formations = {

        "433": [
            { slot:"GB", x:50, y:88 },
            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MC1", x:25, y:50 },
            { slot:"MC2", x:50, y:45 },
            { slot:"MC3", x:75, y:50 },

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

    showToast("Génération lancée");

    const session = state.trainings[currentTrainingId];
    if (!session) return;

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

        const poste = (player.poste1 || '').toUpperCase();

        if (['DC', 'DG', 'DD'].includes(poste))
            categories.DEF.push(player);

        else if (['MC', 'MOC'].includes(poste))
            categories.MIL.push(player);

        else if (['AD', 'AG', 'BU'].includes(poste))
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

    let html = '';

    if (gardiens.length > 0) {

        html += `
            <div class="mb-4 p-4 rounded-xl border bg-emerald-50">
                <h3 class="font-bold text-emerald-700 mb-2">
                    🧤 Gardien
                </h3>

                ${gardiens.map(p => `
                    <div class="py-1">
                        ${getNiveauIcon(p.niveau)} ${p.name}
                    </div>
                `).join('')}
            </div>
        `;
    }

    html += `
        <div class="grid md:grid-cols-2 gap-4">

            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">

                <h3 class="font-bold text-blue-700 mb-3">
                    🔵 Équipe A (${teamA.length})
                </h3>

                ${teamA.map(p => `

                    <div class="flex justify-between items-center py-1 border-b border-blue-100 text-sm">

                        <span>
                            ${getNiveauIcon(p.niveau)} ${p.name}
                        </span>

                        <div class="flex items-center gap-2">

                            <span class="text-slate-500">
                                ${p.poste1 || '-'}
                            </span>

                            <button
                                onclick="movePlayerToOtherTeam('${p.id}')"
                                class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs">
                                ➡️
                            </button>

                        </div>

                    </div>

                `).join('')}

            </div>

            <div class="bg-red-50 border border-red-200 rounded-xl p-4">

                <h3 class="font-bold text-red-700 mb-3">
                    🔴 Équipe B (${teamB.length})
                </h3>

                ${teamB.map(p => `

                    <div class="flex justify-between items-center py-1 border-b border-red-100 text-sm">

                        <span>
                            ${getNiveauIcon(p.niveau)} ${p.name}
                        </span>

                        <div class="flex items-center gap-2">

                            <button
                                onclick="movePlayerToOtherTeam('${p.id}')"
                                class="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-xs">
                                ⬅️
                            </button>

                            <span class="text-slate-500">
                                ${p.poste1 || '-'}
                            </span>

                        </div>

                    </div>

                `).join('')}

            </div>

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
}

var exerciseUI = {
    selected: null,
    tool: 'move',
    selProp: null,
    zoneP1: null,
    slotMove: false,
    holdSlot: null,
    drag: null,
    suppressClickUntil: 0
};

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

    const setup = getExerciseSetup(session);

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

function buildFieldLinesHTML() {

    return `
        <div style="position:absolute;inset:6px;border:3px solid rgba(255,255,255,.85);border-radius:12px;pointer-events:none;"></div>
        <div style="position:absolute;left:0;right:0;top:50%;height:3px;background:rgba(255,255,255,.7);pointer-events:none;"></div>
        <div style="position:absolute;left:50%;top:50%;width:80px;height:80px;border:2px solid rgba(255,255,255,.55);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;"></div>
        <div style="position:absolute;left:50%;top:50%;width:9px;height:9px;background:rgba(255,255,255,.8);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;"></div>
        <div style="position:absolute;left:20%;right:20%;top:0;height:22%;border-left:3px solid rgba(255,255,255,.7);border-right:3px solid rgba(255,255,255,.7);border-bottom:3px solid rgba(255,255,255,.7);border-radius:0 0 10px 10px;pointer-events:none;"></div>
        <div style="position:absolute;left:34%;right:34%;top:0;height:10%;border-left:2px solid rgba(255,255,255,.6);border-right:2px solid rgba(255,255,255,.6);border-bottom:2px solid rgba(255,255,255,.6);border-radius:0 0 8px 8px;pointer-events:none;"></div>
        <div style="position:absolute;left:20%;right:20%;bottom:0;height:22%;border-left:3px solid rgba(255,255,255,.7);border-right:3px solid rgba(255,255,255,.7);border-top:3px solid rgba(255,255,255,.7);border-radius:10px 10px 0 0;pointer-events:none;"></div>
        <div style="position:absolute;left:34%;right:34%;bottom:0;height:10%;border-left:2px solid rgba(255,255,255,.6);border-right:2px solid rgba(255,255,255,.6);border-top:2px solid rgba(255,255,255,.6);border-radius:8px 8px 0 0;pointer-events:none;"></div>
        <div style="position:absolute;left:50%;top:15%;width:7px;height:7px;background:rgba(255,255,255,.75);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;"></div>
        <div style="position:absolute;left:50%;bottom:15%;width:7px;height:7px;background:rgba(255,255,255,.75);border-radius:50%;transform:translate(-50%,50%);pointer-events:none;"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.045) 0 26px,rgba(0,0,0,.045) 26px 52px);pointer-events:none;border-radius:12px;"></div>
    `;
}

function renderExerciseSlot(teamKey, key, playerId, pos, editable) {

    const player = state.players.find(p => p.id === playerId);

    const selected = exerciseUI.selected === key;

    const held = exerciseUI.holdSlot === key;

    const color = teamKey === 'A' ? '#2563eb' : '#dc2626';

    const filled = !!player;

    const inner = filled
        ? `<span style="font-size:10px;font-weight:700;line-height:1.1;text-align:center;padding:4px 2px;display:block;">${(player.name || '?').split(' ').pop()}</span>`
        : `<span style="font-size:9px;opacity:.8;text-align:center;display:block;">${pos.name}</span>`;

    const dragHandlers = editable && exerciseUI.slotMove
        ? ` onpointerdown="slotDragStart(event,'${key}')" onpointermove="slotDragMove(event,'${key}')" onpointerup="slotDragEnd(event,'${key}')"`
        : '';

    return `
        <div ${editable ? `onclick="pickExerciseSlot('${key}')"` : ''}
            ${dragHandlers}
            data-key="${key}"
            style="position:absolute;left:${pos.x}%;top:${pos.y}%;
                width:46px;height:46px;
                ${selected ? 'z-index:3;' : ''}
                ${editable ? '' : 'pointer-events:none;'}
                touch-action:${editable && exerciseUI.slotMove ? 'none' : 'auto'};
                transform:translate(-50%,-50%);
                border-radius:50%;
                background:${filled ? color : 'rgba(255,255,255,.09)'};
                border:${filled ? '2px solid rgba(255,255,255,.9)' : '2px dashed rgba(255,255,255,.6)'};
                box-shadow:${held ? '0 0 0 4px #22d3ee, 0 0 18px rgba(34,211,238,.85), 0 2px 5px rgba(0,0,0,.25)' : (selected ? '0 0 0 4px #fbbf24' : '0 2px 5px rgba(0,0,0,.25)')};
                color:white;
                display:flex;
                align-items:center;
                justify-content:center;
                ${editable ? 'cursor:grab;' : ''}">
            ${inner}
        </div>
    `;
}

function effPos(setup, idx, pos) {

    const ov = (setup.posOverrides || {})[setup.area] || {};

    const o = ov[setup.format + ':' + idx];

    return o ? { x: o.x, y: o.y } : pos;
}

function exerciseTeamSize(teamKey) {

    const s = state.trainings[currentTrainingId];

    if (!s || !s.generatedTeams) return 0;

    return (teamKey === 'A' ? s.generatedTeams.teamA : s.generatedTeams.teamB || []).length;
}

function posteCategory(name) {

    if (name === 'GB') return 'GB';

    if (['DC', 'DG', 'DD'].includes(name)) return 'DEF';

    if (['MC', 'MOC'].includes(name)) return 'MIL';

    if (['AD', 'AG', 'BU'].includes(name)) return 'ATT';

    return 'AUTRE';
}

function renderExercise() {

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

    info.innerHTML = `⚽ ${exIdx + 1}/${exCount} — ${exName} · ${fmt.label} · 🔵 A (${exerciseTeamSize('A')}) · 🔴 B (${exerciseTeamSize('B')})${isHalf ? ' · ✂️' : ''}`;

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
        <button onclick="toggleSlotMove()"
            class="px-3 py-2 rounded-lg text-xs font-bold transition
                ${exerciseUI.slotMove ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700'}">
            📍 Déplacer postes
        </button>
        <button onclick="resetExercisePositions()"
            class="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-600">
            ↺
        </button>`}
        <button onclick="autoAssignExerciseTeam()"
            class="px-3 py-2 rounded-lg text-xs font-bold bg-amber-400 hover:bg-amber-500 text-amber-900">
            🎲 Auto
        </button>
        <button onclick="resetExerciseTeam()"
            class="px-3 py-2 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-600">
            ♻️ Reset
        </button>`;

    let slotsHTML = '';

    if (isHalf) {

        const teamKey = setup.team;
        const map = setup.byTeam[teamKey] || {};

        slotsHTML = fmt.positions.map((pos, idx) => {
            const key = teamKey + ':' + idx;
            return renderExerciseSlot(teamKey, key, map[key], effPos(setup, idx, { ...pos, y: Math.max(4, (50 - pos.y) * 2) }), !isEdit);
        }).join('');

    } else {

        const byA = setup.byTeam.A || {};
        const byB = setup.byTeam.B || {};

        slotsHTML = fmt.positions.map((pos, idx) => renderExerciseSlot('A', 'A:' + idx, byA['A:' + idx], effPos(setup, idx, pos), !isEdit)).join('')
            + fmt.positions.map((pos, idx) => renderExerciseSlot('B', 'B:' + idx, byB['B:' + idx], effPos(setup, idx, { ...pos, y: 100 - pos.y }), !isEdit)).join('');
    }

    field.innerHTML = (isHalf ? buildHalfFieldLinesHTML() : buildFieldLinesHTML())
        + renderZonesAndProps(setup)
        + renderZoneMarker()
        + slotsHTML;

    field.onclick = isEdit ? exerciseFieldClick : (exerciseUI.slotMove ? placeHeldSlot : null);

    renderExerciseTools(setup);

    bench.innerHTML = '';

    if (!isEdit) renderExerciseBench(setup);

    renderExerciseStrip();

    renderExerciseFiche();
}

function renderExerciseBench(setup) {

    const session = state.trainings[currentTrainingId];
    const gen = session.generatedTeams || {};
    const team = setup.team;
    const map = setup.byTeam[team] || {};
    const assigned = Object.values(map);

    const ids = team === 'A' ? (gen.teamA || []) : (gen.teamB || []);

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
                    ${getNiveauIcon(p.niveau)} ${p.name}
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

    if (map[key]) {

        delete map[key];
        saveStateToFirebase();

    } else {

        exerciseUI.selected = (exerciseUI.selected === key) ? null : key;
    }

    renderExercise();
}

function toggleSlotMove() {

    exerciseUI.slotMove = !exerciseUI.slotMove;
    exerciseUI.holdSlot = null;
    exerciseUI.drag = null;
    exerciseUI.selected = null;
    renderExercise();
}

function slotDragStart(e, key) {

    if (!exerciseUI.slotMove) return;

    if (e.cancelable) e.preventDefault();

    exerciseUI.suppressClickUntil = Date.now() + 400;

    try { if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { }

    exerciseUI.drag = { key: key, active: true, moved: false, el: e.currentTarget, lastX: e.clientX, lastY: e.clientY };

    if (exerciseUI.holdSlot === key) {

        exerciseUI.holdSlot = null;
        renderExercise();
        return;
    }

    exerciseUI.holdSlot = key;
    e.currentTarget.style.boxShadow = '0 0 0 4px #22d3ee, 0 0 18px rgba(34,211,238,.85), 0 2px 5px rgba(0,0,0,.25)';
}

function slotDragMove(e, key) {

    const d = exerciseUI.drag;
    if (!d || !d.active) return;

    if (e.cancelable) e.preventDefault();

    d.moved = true;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
}

function slotDragEnd(e, key) {

    const d = exerciseUI.drag;
    if (!d || !d.active) return;

    if (e.cancelable) e.preventDefault();

    const rect = document.getElementById('exercise-field').getBoundingClientRect();

    const x = Math.max(4, Math.min(96, ((d.lastX - rect.left) / rect.width) * 100));
    const y = Math.max(4, Math.min(96, ((d.lastY - rect.top) / rect.height) * 100));

    exerciseUI.drag = null;

    if (d.moved) {

        exerciseUI.holdSlot = null;
        commitSlotPos(key, x, y);
        return;
    }

    exerciseUI.holdSlot = key;
    renderExercise();
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

    const idx = key.split(':')[1];

    setup.posOverrides[setup.area][setup.format + ':' + idx] = { x: x, y: y };

    saveStateToFirebase();
    showToast('Poste déplacé');
    renderExercise();
}

function resetExercisePositions() {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    setup.posOverrides[setup.area] = {};

    exerciseUI.holdSlot = null;
    saveStateToFirebase();
    showToast('Postes réinitialisés');
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

        const num = (EXERCISE_FORMATS[setup.format] || EXERCISE_FORMATS['8v8']).positions.length;

        for (let i = 0; i < num; i++) {
            const k = team + ':' + i;
            if (map[k] === undefined) { target = k; break; }
        }
    }

    if (target) map[target] = playerId;

    saveStateToFirebase();
    renderExercise();
}

function autoAssignExerciseTeam() {

    const session = state.trainings[currentTrainingId];
    if (!session || !session.generatedTeams) return;

    const setup = getExerciseSetup(session);
    const team = setup.team;
    const ids = team === 'A' ? (session.generatedTeams.teamA || []) : (session.generatedTeams.teamB || []);

    const players = ids.map(id => state.players.find(p => p.id === id)).filter(Boolean);

    const buckets = { GB: [], DEF: [], MIL: [], ATT: [], AUTRE: [] };

    players.forEach(p => {
        const cat = posteCategory((p.poste1 || '').toUpperCase());
        buckets[cat].push(p);
    });

    Object.keys(buckets).forEach(k => buckets[k].sort((a, b) => (b.niveau || 2) - (a.niveau || 2)));

    const fmt = EXERCISE_FORMATS[setup.format] || EXERCISE_FORMATS['8v8'];
    const map = {};
    const free = [];

    fmt.positions.forEach((pos, idx) => {

        const key = team + ':' + idx;
        const pick = buckets[posteCategory(pos.name)].shift();

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
    renderExercise();
    showToast('Dispositif auto généré pour l\'équipe ' + team);
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

function buildHalfFieldLinesHTML() {

    return `
        <div style="position:absolute;inset:6px;border:3px solid rgba(255,255,255,.85);border-radius:12px;pointer-events:none;"></div>
        <div style="position:absolute;left:0;right:0;top:2%;height:3px;background:rgba(255,255,255,.7);pointer-events:none;"></div>
        <div style="position:absolute;left:20%;right:20%;bottom:0;height:26%;border-left:3px solid rgba(255,255,255,.7);border-right:3px solid rgba(255,255,255,.7);border-top:3px solid rgba(255,255,255,.7);border-radius:10px 10px 0 0;pointer-events:none;"></div>
        <div style="position:absolute;left:34%;right:34%;bottom:0;height:12%;border-left:2px solid rgba(255,255,255,.6);border-right:2px solid rgba(255,255,255,.6);border-top:2px solid rgba(255,255,255,.6);border-radius:8px 8px 0 0;pointer-events:none;"></div>
        <div style="position:absolute;left:50%;bottom:28%;width:7px;height:7px;background:rgba(255,255,255,.75);border-radius:50%;transform:translate(-50%,50%);pointer-events:none;"></div>
        <div style="position:absolute;left:50%;bottom:0;width:16%;height:6px;border:2px solid rgba(255,255,255,.95);background:rgba(255,255,255,.15);transform:translateX(-50%);border-radius:3px 3px 0 0;pointer-events:none;"></div>
        <div style="position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(255,255,255,.045) 0 26px,rgba(0,0,0,.045) 26px 52px);pointer-events:none;border-radius:12px;"></div>
    `;
}

function renderZonesAndProps(setup) {

    const parts = [];

    (setup.props || []).forEach(p => {

        if (p.type === 'zone') {

            const x1 = Math.min(p.x1, p.x2);
            const x2 = Math.max(p.x1, p.x2);
            const y1 = Math.min(p.y1, p.y2);
            const y2 = Math.max(p.y1, p.y2);
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
                <div data-prop="${p.id}" style="position:absolute;left:${p.x}%;top:${p.y}%;
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
                <div data-prop="${p.id}" style="position:absolute;left:${p.x}%;top:${p.y}%;
                    width:${w}px;height:${h}px;transform:translate(-50%,-50%);cursor:pointer;${sel}">
                    ${inner}
                </div>`);

            return;
        }

        parts.push(`
            <div data-prop="${p.id}" style="position:absolute;left:${p.x}%;top:${p.y}%;
                font-size:${style.size}px;transform:translate(-50%,-50%);cursor:pointer;user-select:none;${sel}">
                ${style.emoji}
            </div>`);
    });

    return parts.join('');
}

function renderZoneMarker() {

    if (!exerciseUI.zoneP1) return '';

    return `<div style="position:absolute;left:${exerciseUI.zoneP1.x}%;top:${exerciseUI.zoneP1.y}%;
        width:14px;height:14px;border-radius:50%;background:#fbbf24;border:2px solid white;
        transform:translate(-50%,-50%);box-shadow:0 0 0 3px rgba(251,191,36,.4);"></div>`;
}

function exerciseFieldClick(e) {

    const session = state.trainings[currentTrainingId];
    const setup = getExerciseSetup(session);

    if (!setup || setup.mode !== 'edit') return;

    const tool = exerciseUI.tool || 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

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

        hint.innerHTML = exerciseUI.slotMove
            ? "📍 Postes : attrapez une pastille et glissez-la, ou touchez-la puis touchez l'endroit voulu. Touchez-la à nouveau pour décrocher. ↺ réinitialise."
            : "👥 Mode joueurs : touchez une pastille vide (jaune) puis un joueur du banc pour l'ajouter. Touchez un joueur placé pour le remettre au banc. Bouton « 📍 Déplacer postes » pour repositionner les pastilles.";
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














