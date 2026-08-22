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
        pinInput.addEventListener("input", async (e) => {
            const enteredPin = e.target.value;

            if (enteredPin.length === 4) {
                try {
                    // Interrogation de Firebase Realtime Database
                    const pinRef = firebase.database().ref("rangueil_data/access/" + enteredPin);
                    const snapshot = await pinRef.once("value");

                    if (snapshot.exists()) {
                        const userData = snapshot.val(); 
                        console.log("PIN TROUVÉ :", enteredPin);
console.log("USER DATA :", userData);
console.log(
    "NB FONCTIONS :",
    (userData.functions || []).length
);
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

if (
    selectedFunction?.functionName ===
    "Responsable catégorie"
) {
    role = "responsable";
}

if (
    selectedFunction?.functionName ===
        "Éducateur principal" ||
    selectedFunction?.functionName ===
        "Éducateur adjoint"
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

sessionStorage.setItem(
    "currentUserData",
    JSON.stringify(userData)
);

sessionStorage.setItem(
    "currentUserRole",
    userData.role
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
console.log(
    "STAFF CHARGE :",
    state.staff
);

state.carpoolResponses =
    data.carpoolResponses || {};
                    // Migration ancien format numérique → nouveau format objet
                    const rawTrainings = data.trainings || {};
                    if (Object.keys(rawTrainings).length > 0 && !isNaN(Object.keys(rawTrainings)[0])) {
                        state.trainings = {};
                        Object.entries(rawTrainings).forEach(([num, presData]) => {
                            const id = 'T_legacy_' + num;
                            state.trainings[id] = { id, title: 'Séance E' + String(num).padStart(2,'0'), date: '', heure: '18:00', theme: '', presence: presData, pdfData: null, pdfName: null };
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
    carpoolResponses: state.carpoolResponses
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
            
            const colorMap = {
                sky: {
                    bg: 'bg-sky-50',
                    bgDark: 'bg-sky-100',
                    bgButton: 'bg-sky-500',
                    border: 'border-sky-300',
                    borderDark: 'border-sky-400',
                    text: 'text-sky-800',
                    textBold: 'text-sky-900',
                    textLight: 'text-sky-600',
                    badge: 'bg-sky-200 text-sky-900',
                    badgeDark: 'bg-sky-600 text-white'
                },
                emerald: {
                    bg: 'bg-emerald-50',
                    bgDark: 'bg-emerald-100',
                    bgButton: 'bg-emerald-500',
                    border: 'border-emerald-300',
                    borderDark: 'border-emerald-400',
                    text: 'text-emerald-800',
                    textBold: 'text-emerald-900',
                    textLight: 'text-emerald-600',
                    badge: 'bg-emerald-200 text-emerald-900',
                    badgeDark: 'bg-emerald-600 text-white'
                },
                red: {
                    bg: 'bg-red-50',
                    bgDark: 'bg-red-100',
                    bgButton: 'bg-red-500',
                    border: 'border-red-300',
                    borderDark: 'border-red-400',
                    text: 'text-red-800',
                    textBold: 'text-red-900',
                    textLight: 'text-red-600',
                    badge: 'bg-red-200 text-red-900',
                    badgeDark: 'bg-red-600 text-white'
                },
                orange: {
                    bg: 'bg-orange-50',
                    bgDark: 'bg-orange-100',
                    bgButton: 'bg-orange-500',
                    border: 'border-orange-300',
                    borderDark: 'border-orange-400',
                    text: 'text-orange-800',
                    textBold: 'text-orange-900',
                    textLight: 'text-orange-600',
                    badge: 'bg-orange-200 text-orange-900',
                    badgeDark: 'bg-orange-600 text-white'
                },
                purple: {
                    bg: 'bg-purple-50',
                    bgDark: 'bg-purple-100',
                    bgButton: 'bg-purple-500',
                    border: 'border-purple-300',
                    borderDark: 'border-purple-400',
                    text: 'text-purple-800',
                    textBold: 'text-purple-900',
                    textLight: 'text-purple-600',
                    badge: 'bg-purple-200 text-purple-900',
                    badgeDark: 'bg-purple-600 text-white'
                },
                pink: {
                    bg: 'bg-pink-50',
                    bgDark: 'bg-pink-100',
                    bgButton: 'bg-pink-500',
                    border: 'border-pink-300',
                    borderDark: 'border-pink-400',
                    text: 'text-pink-800',
                    textBold: 'text-pink-900',
                    textLight: 'text-pink-600',
                    badge: 'bg-pink-200 text-pink-900',
                    badgeDark: 'bg-pink-600 text-white'
                },
                amber: {
                    bg: 'bg-amber-50',
                    bgDark: 'bg-amber-100',
                    bgButton: 'bg-amber-500',
                    border: 'border-amber-300',
                    borderDark: 'border-amber-400',
                    text: 'text-amber-800',
                    textBold: 'text-amber-900',
                    textLight: 'text-amber-600',
                    badge: 'bg-amber-200 text-amber-900',
                    badgeDark: 'bg-amber-600 text-white'
                },
                slate: {
                    bg: 'bg-slate-50',
                    bgDark: 'bg-slate-100',
                    bgButton: 'bg-slate-500',
                    border: 'border-slate-300',
                    borderDark: 'border-slate-400',
                    text: 'text-slate-800',
                    textBold: 'text-slate-900',
                    textLight: 'text-slate-600',
                    badge: 'bg-slate-200 text-slate-900',
                    badgeDark: 'bg-slate-600 text-white'
                }
            };

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
            });

            const targetSec = document.getElementById(`sec-${tabId}`);
            if(targetSec) targetSec.classList.remove('hidden');
            if (tabId === 'matchs') {
    renderMatchDetail();
}
            const activeBtn = document.getElementById(`tab-${tabId}`);
            if (activeBtn) activeBtn.classList.add('bg-white/20', 'text-white');
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

    if (role === 'coach') {
    playersToDisplay = state.players.filter(
        p =>
            (p.team || p.cat || '').toLowerCase() ===
            userTeam.toLowerCase()
    );
}
    

            const container = document.getElementById('effectif-full-container');
            container.innerHTML = playersToDisplay.map(p => {
                const p1 = p.poste1 || '-', p2 = p.poste2 || '-', p3 = p.poste3 || '-';
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

    totalSessions++;

    const presence = session.presence || {};

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

        // Rendu Matchs & Convocations
        function populateMatchSelector() {
    const selector = document.getElementById('match-selector');

    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';

    let matches = Object.values(state.matches);

    if (role === 'coach') {
        matches = matches.filter(m =>
            (m.team || '').toLowerCase() === userTeam.toLowerCase()
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

            let convokedCount = 0, totalSeats = 0;
            playersForMatch.forEach(p => {
                if (m.convocations[p.id] === 'convoke') convokedCount++;
                totalSeats += parseInt(m.carpool[p.id]) || 0;
            });

            counterBanner.className = `p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${convokedCount < 14 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-sky-50 border-sky-200 text-sky-900'}`;
            counterBanner.innerHTML = `<div class="font-bold text-xs">Convocations : ${convokedCount} / 14</div><span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${convokedCount < 14 ? 'bg-amber-200' : 'bg-sky-200'}">${convokedCount < 14 ? '⚠️ Incomplet' : '🔵 OK'}</span>`;

    const carpoolResponses =
    state.carpoolResponses?.[
        m.carpoolId
    ] || {};

const responses =
    Object.keys(carpoolResponses).length;

const totalConvoked =
    playersForMatch.filter(
        p => m.convocations[p.id] === 'convoke'
    ).length;

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

Object.entries(carpoolResponses)
    .forEach(([playerId, r]) => {

        const player =
            state.players.find(
                p => p.id === playerId
            );

        const playerName =
            player?.name || playerId;

        if (r.status === 'driver') {

            if ((r.seats || 0) > 0) {

                drivers++;
                seats += r.seats || 0;

                driverList.push(
                    `${playerName} (${r.seats || 0} places)`
                );

            } else {

                driverNoSeatList.push(
                    playerName
                );

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

const pending =
    totalConvoked - responses;

const missingSeats =
    passengers - seats;

const transportStatus =
    missingSeats > 0
        ? `🔴 Il manque ${missingSeats} place(s)`
        : `🟢 Transport assuré`;

const transportClass =
    missingSeats > 0
        ? 'text-red-700'
        : 'text-emerald-700';

if (carpoolBanner) {

    carpoolBanner.className =
        "p-3 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-900";

    carpoolBanner.innerHTML = `
<div class="w-full text-xs space-y-1">

<div class="font-bold">
🚗 Covoiturage
</div>

<div>
✅ Réponses : ${responses}/${totalConvoked}
</div>

<div>
⏳ En attente : ${pending}
</div>

<div>
🚗 Conducteurs : ${drivers}
</div>

<div>
👤 Passagers : ${passengers}
</div>

<div>
📍 Direct : ${directs}
</div>

<div>
❌ Absents : ${absents}
</div>

<div class="font-bold">
🚘 Places proposées : ${seats}
</div>

<div class="font-bold ${transportClass}">
${transportStatus}
</div>

${driverList.length ? `
<div class="mt-2">
🚗 <strong>Conducteurs</strong><br>
${driverList.join('<br>')}
</div>
` : ''}

${driverNoSeatList.length ? `
<div class="mt-2">
🚙 <strong>Conducteurs sans place</strong><br>
${driverNoSeatList.join('<br>')}
</div>
` : ''}

${passengerList.length ? `
<div class="mt-2">
👤 <strong>Passagers</strong><br>
${passengerList.join('<br>')}
</div>
` : ''}

${directList.length ? `
<div class="mt-2">
📍 <strong>Direct</strong><br>
${directList.join('<br>')}
</div>
` : ''}

${absentList.length ? `
<div class="mt-2">
❌ <strong>Absents</strong><br>
${absentList.join('<br>')}
</div>
` : ''}

${pendingList.length ? `
<div class="mt-2">
⏳ <strong>En attente</strong><br>
${pendingList.join('<br>')}
</div>
` : ''}

</div>
`;

}
renderTransportTab({
    drivers,
    passengers,
    directs,
    absents,
    responses,
    pending,
    seats,
    driverList,
    passengerList,
    directList,
    absentList,
    pendingList,
    transportStatus
});

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

                html += `<div onclick="openTrainingDetail('${s.id}')" class="p-3.5 ${cardBg} border rounded-xl cursor-pointer transition-all group">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-xl ${isPast ? 'bg-slate-400' : 'bg-gradient-to-br from-sky-500 to-blue-600'} text-white flex items-center justify-center shadow-sm">
                                <i class="fa-solid fa-whistle text-sm"></i>
                            </div>
                            <div>
                                <div class="flex items-center space-x-2">
                                    ${statusDot}
                                    <p class="font-bold text-slate-800 text-xs">${s.title || 'Séance sans titre'}</p>
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
            const nbPlayers = state.players.length;
            let totalPresences = 0, totalPossible = 0;
            sessions.forEach(s => {
                const vals = Object.values(s.presence || {});
                totalPresences += vals.filter(v =>
    v === 'present' || v === 'retard'
).length;
                totalPossible += nbPlayers;
            });
            const avgPct = totalPossible > 0 ? Math.round((totalPresences / totalPossible) * 100) : 0;
            const avgColor = avgPct >= 75 ? 'text-emerald-600' : avgPct >= 50 ? 'text-amber-600' : 'text-red-500';

            const bar = document.getElementById('training-stats-bar');
            if (!bar) return;
            bar.innerHTML = `
                <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
                    <p class="text-2xl font-extrabold text-sky-600">${nbSessions}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Séances</p>
                </div>
                <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
                    <p class="text-2xl font-extrabold ${avgColor}">${avgPct}%</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Présence moy.</p>
                </div>
                <div class="bg-white p-3 rounded-xl border border-slate-100 card-shadow text-center">
                    <p class="text-2xl font-extrabold text-slate-700">${totalPresences}</p>
                    <p class="text-[11px] text-slate-500 mt-0.5">Présences tot.</p>
                </div>`;
        }

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
            
            // Filtrer les joueurs par équipe du coach
            let playersToShow = state.players;
            if (role === 'coach') {
                playersToShow = state.players.filter(p =>
                    (p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase()
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
            
            // Filtrer les séances de l'équipe du coach
            if (role === 'coach') {
                pastSessions = pastSessions.filter(s =>
                    (s.team || '').toLowerCase() === userTeam.toLowerCase()
                );
            }
            
            const container = document.getElementById('training-attendance-bars');
            if (!container) return;
            if (pastSessions.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Aucune séance passée pour calculer les stats.</p>';
                return;
            }
            
            // Filtrer les joueurs par équipe du coach
            let playersToShow = state.players;
            if (role === 'coach') {
                playersToShow = state.players.filter(p =>
                    (p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase()
                );
            }
            
            const rows = playersToShow.map(p => {
                let present = 0, total = pastSessions.length;
                pastSessions.forEach(s => {
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
            } else {
                document.getElementById('t-title').value = '';
                document.getElementById('t-date').value = new Date().toISOString().split('T')[0];
                document.getElementById('t-heure').value = '18:00';
                document.getElementById('t-theme').value = '';
            }
            toggleModal('modal-training', true);
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
    if (role === 'coach') {
        matches = matches.filter(m =>
            (m.team || '').toLowerCase() === userTeam.toLowerCase()
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
console.log(
    "Deadline = ",
    document.getElementById('m-deadline-preview')?.innerText
);
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
                    document.getElementById('p-phone-pere').value = player.phonePere !== '-' ? player.phonePere : '';
                    document.getElementById('p-phone-mere').value = player.phoneMere !== '-' ? player.phoneMere : '';
                    document.getElementById('p-phone-joueur').value = player.phoneJoueur !== '-' ? player.phoneJoueur : '';
                }
            } else {
                document.getElementById('modal-player-title').innerText = "Ajouter un Joueur";
                document.getElementById('p-id').value = '';
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
            const active = document.getElementById('filter-' + cat);
            if (active) {
                active.classList.remove('bg-slate-100', 'text-slate-600');
                active.classList.add(cat === 'U14' ? 'bg-blue-600' : cat === 'U13' ? 'bg-purple-600' : 'bg-sky-600', 'text-white');
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

    const playersSource =
        role === 'coach'
            ? state.players.filter(
                p =>
                    (p.team || p.cat || '').toLowerCase() ===
                    userTeam.toLowerCase()
            )
            : state.players;

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

    container.innerHTML = '';

    // ADMIN
    if (role === 'admin') {

        container.innerHTML =
            `<button onclick="setFilterCat('all')"
                id="filter-all"
                class="cat-filter-btn px-2.5 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white">
                Tous
            </button>`;

        Object.entries(state.teams).forEach(([key, team]) => {

            container.innerHTML += `
                <button
                    onclick="setFilterCat('${key}')"
                    id="filter-${key}"
                    class="cat-filter-btn px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600">
                    ${team.name}
                </button>
            `;
        });

        return;
    }

    // COACH
    if (role === 'coach') {

        const team = state.teams[userTeam];

     if (team) {

    currentCatFilter = userTeam;

    container.innerHTML = `
        <button
            onclick="setFilterCat('${userTeam}')"
            id="filter-${userTeam}"
            class="cat-filter-btn px-2.5 py-1.5 text-xs font-bold rounded-lg bg-sky-600 text-white">
            ${team.name}
        </button>
    `;
}   

        return;
    }

    // RESPONSABLE
    if (role === 'responsable') {

    const teams = userTeam
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

    currentCatFilter = teams[0];

    teams.forEach((teamKey, index) => {

        const team = state.teams[teamKey];

        if (!team) return;

        container.innerHTML += `
            <button
                onclick="setFilterCat('${teamKey}')"
                id="filter-${teamKey}"
                class="cat-filter-btn px-2.5 py-1.5 text-xs font-bold rounded-lg
                ${index === 0
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-600'}">
                ${team.name}
            </button>
        `;
    });
}
}
// --- 4. GESTION DES RÔLES ET PERMISSIONS MISE À JOUR ---
function applyPermissions() {

   console.log(
    "ROLE CONNECTE :",
    window.currentUserRole
);

console.log(
    "TEAM CONNECTEE :",
    window.currentUserTeam
); 


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
    alert("Le code PIN doit comporter exactement 4 chiffres.");
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


                alert(
    `Compte "${fullname}" enregistré avec succès !`
);

coachForm.reset();



renderAdminAccounts();
            } catch (error) {
                console.error("Erreur lors de l'enregistrement :", error);
                alert("Erreur lors de l'enregistrement en base.");
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

        alert(
            "Impossible de charger ce compte"
        );

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
            alert("Erreur lors de l'enregistrement de l'équipe.");
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

        <div class="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">

            <h3 class="font-bold mb-2">

                ⏳ En attente (${data.pendingList.length})

            </h3>

            ${data.pendingList.join('<br>') || 'Tout le monde a répondu ✅'}

        </div>

    `;
}

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

    console.log("DATE CLIQUEE :", date);

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
            <div class="bg-emerald-50 border border-emerald-200 p-3 rounded-lg mb-2">

                <div class="font-bold text-emerald-800">
                    🏃 ${training.title || 'Entraînement'}
                </div>

                <div class="text-xs text-slate-600">
                    ${training.heure || '--'}
                </div>

                <div class="text-xs text-slate-500">
                    ${training.theme || ''}
                </div>

             <div class="mt-2">

    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold
        ${getTeamColorClasses(training.team).badge}">

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

    const end = new Date(start);

    end.setDate(
        start.getDate() + 6
    );

const teamLabel =
    selectedTeam === "all"
        ? "TOUTES ÉQUIPES"
        : (
            state.teams?.[selectedTeam]?.name ||
            selectedTeam.toUpperCase()
        );

let text =
`🔵⚪ RANGUEIL FC ${teamLabel} ⚪🔵

📅 PLANNING DE LA SEMAINE

`;

    const items = [];

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

                items.push({
                    date: match.date,
                    message:
`⚽ ${match.opponent}
${match.heure || ""}
`
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

                items.push({
                    date: training.date,
                    message:
`🏃 ${training.title || "Entraînement"}
${training.heure || ""}
`
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

                items.push({
                    date: event.date,
                    message:
`👥 ${event.title}
${event.heure || ""}
`
                });

            }

        });

    items.sort((a,b) =>
        a.date.localeCompare(b.date)
    );

let currentDate = "";

items.forEach(item => {

    const dateFr =
        new Date(item.date + "T12:00:00")
        .toLocaleDateString(
            "fr-FR",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

    if (currentDate !== dateFr) {

        text += `📍 ${dateFr}\n\n`;

        currentDate = dateFr;

    }

    const formattedMessage =
        item.message.replace(
            /(\d{2}:\d{2})/,
            '🕒 $1'
        );

    text += `${formattedMessage}\n`;

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

function populateCalendarTeamFilter() {

    const select =
        document.getElementById(
            'calendar-team-filter'
        );

    if (!select) return;

    const current =
        select.value || "all";

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

    let html = `

        <div class="flex justify-between items-center mb-4">

            <h2 class="text-lg font-bold text-slate-800">
                🪪 Comptes d'accès
            </h2>

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

    `;

    Object.entries(accounts).forEach(
        ([pin, user]) => {

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


function openModalTeam(teamId = null) {

    const id = prompt(
        "Identifiant équipe (ex: u18)"
    );

    if (!id) return;

    const name = prompt(
        "Nom complet de l'équipe"
    );

    if (!name) return;

    firebase.database()
        .ref("teams/" + id.toLowerCase())
        .set({
            name: name
        });

    showToast(
        "✅ Équipe créée"
    );
}
function editTeam(teamId) {

    const team =
        state.teams?.[teamId];

    if (!team) return;

    const newName = prompt(
        "Nom de l'équipe",
        team.name || ""
    );

    if (!newName) return;

    firebase.database()
        .ref("teams/" + teamId)
        .update({
            name: newName
        });

    showToast(
        "✅ Équipe modifiée"
    );
}

function showFunctionSelector(userData) {

    console.log(
        "AFFICHAGE SELECTEUR",
        userData.name
    );

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

    (userData.functions || [])
    .forEach((func, index) => {

            const scopes =
                (func.scopes || [])
                .map(scope =>
                    state.teams?.[scope]?.name ||
                    scope
                )
                .join(", ");

            list.innerHTML += `

                <button
                    type="button"
                    class="w-full text-left border rounded-xl p-4 hover:bg-sky-50 transition"
                    onclick="selectFunction('${userData.pin}', ${index})"

                    <div class="font-bold text-slate-800">
                        👔 ${func.functionName}
                    </div>

                    ${
                        scopes
                            ? `<div class="text-xs text-slate-500 mt-1">
                                   📍 ${scopes}
                               </div>`
                            : `<div class="text-xs text-slate-500 mt-1">
                                   🌍 Accès global
                               </div>`
                    }

                </button>

            `;

        });

        console.log(
    "OUVERTURE ECRAN"
);

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

            if (
    selectedFunction.functionName ===
    "Responsable catégorie"
)
 {
                role = "responsable";
            }

            if (
    selectedFunction.functionName ===
        "Éducateur principal" ||
    selectedFunction.functionName ===
        "Éducateur adjoint"
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
console.log(
    "ROLE CONNECTE :",
    window.currentUserRole
);

console.log(
    "TEAM CONNECTEE :",
    window.currentUserTeam
);
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

function getPoleFromTeam(teamKey) {

    const teamName =
        state.teams?.[teamKey]?.name || "";

    const match =
        teamName.match(/U(\d+)/i);

    if (match) {

        const age =
            parseInt(match[1]);

        if (age >= 6 && age <= 11) {
            return "Académie";
        }

        if (age >= 12 && age <= 15) {
            return "Pré-Formation";
        }

        if (age >= 16 && age <= 20) {
            return "Formation";
        }

    }

    return "Seniors";

}
async function renderStaffV2() {

    const container =
        document.getElementById(
            "staff-full-container"
        );

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

const categoryManagers = [];

const teamGroups = {};

const poleGroups = {
    "Académie": {},
    "Pré-Formation": {},
    "Formation": {},
    "Seniors": {}
};

    container.innerHTML = "";

    staff.forEach(member => {

    if (
        [
            "Président",
            "Vice-président",
            "Trésorier",
            "Secrétaire"
        ].includes(member.functionName)
    ) {

        direction.push(member);

        return;

    }

    if (
        member.functionName ===
        "Responsable catégorie"
    ) {

        categoryManagers.push(member);

        return;

    }

    member.scopes.forEach(scope => {

       const pole =
    getPoleFromTeam(scope);

if (!poleGroups[pole][scope]) {
    poleGroups[pole][scope] = [];
}

poleGroups[pole][scope].push(member);

    });

});

container.innerHTML += `

<div class="col-span-full">

    <h2 class="text-xl font-bold mb-4">

        👔 Direction

    </h2>

</div>

`;

direction.forEach(member => {

    container.innerHTML += `

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

container.innerHTML += `

<div class="col-span-full mt-6">

    <h2 class="text-xl font-bold mb-4">

        📋 Responsables catégories

    </h2>

</div>

`;

categoryManagers.forEach(member => {

    const scopes =
        member.scopes
            .map(scope =>
                state.teams?.[scope]?.name
                || scope
            )
            .join(", ");

    container.innerHTML += `

    <div class="bg-white p-4 rounded-xl border">

        <div class="font-bold text-slate-800">

            ${member.name}

        </div>

        <div class="text-sm text-sky-700 mt-1">

            👔 Responsable catégorie

        </div>

        <div class="text-xs text-slate-500 mt-1">

            📍 ${scopes}

        </div>

    </div>

    `;

});



Object.entries(poleGroups)
.forEach(([poleName, teams]) => {

    container.innerHTML += `

    <div class="col-span-full mt-6">

        <details class="bg-slate-100 rounded-xl overflow-hidden">

            <summary
                class="cursor-pointer p-4 font-bold text-slate-900">

                ⚽ ${poleName}

            </summary>

            <div class="p-4 space-y-4">

    `;

    Object.entries(teams)
    .forEach(([teamKey, members]) => {

        const teamName =
            state.teams?.[teamKey]?.name
            || teamKey;

        container.innerHTML += `

        <details class="bg-white border rounded-xl overflow-hidden">

            <summary
                class="cursor-pointer p-3 font-semibold text-slate-800">

                ⚽ ${teamName}
                (${members.length})

            </summary>

            <div class="p-4 border-t grid gap-3">

        `;

        members.forEach(member => {

            container.innerHTML += `

            <div class="bg-slate-50 p-3 rounded-lg">

                <div class="font-bold text-slate-800">

                    ${member.name}

                </div>

                <div class="text-sm text-sky-700">

                    👔 ${member.functionName}

                </div>

            </div>

            `;

        });

        container.innerHTML += `

            </div>

        </details>

        `;

    });

 
    container.innerHTML += `

            </div>

        </details>

    </div>

    `;

});

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

            <button
                onclick="applyFormation('4231')"
                class="px-3 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold">

                4-2-3-1

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

                            ${player.name}

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

    

    const formations = {

        "433": [

            {x:50,y:90}, // GB

            {x:15,y:72},
            {x:38,y:72},
            {x:62,y:72},
            {x:85,y:72},

            {x:25,y:50},
            {x:50,y:45},
            {x:75,y:50},

            {x:20,y:18},
            {x:50,y:10},
            {x:80,y:18}

        ],

        "442": [

            {x:50,y:90},

            {x:15,y:72},
            {x:38,y:72},
            {x:62,y:72},
            {x:85,y:72},

            {x:12,y:45},
            {x:37,y:48},
            {x:63,y:48},
            {x:88,y:45},

            {x:35,y:15},
            {x:65,y:15}

        ],

        "352": [

            {x:50,y:90},

            {x:25,y:72},
            {x:50,y:70},
            {x:75,y:72},

            {x:10,y:50},
            {x:30,y:48},
            {x:50,y:45},
            {x:70,y:48},
            {x:90,y:50},

            {x:35,y:15},
            {x:65,y:15}

        ],

        "4231": [

            {x:50,y:90},

            {x:15,y:72},
            {x:38,y:72},
            {x:62,y:72},
            {x:85,y:72},

            {x:35,y:55},
            {x:65,y:55},

            {x:15,y:30},
            {x:50,y:25},
            {x:85,y:30},

            {x:50,y:10}

        ]
    };

    const formation =
        formations[system];

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
``