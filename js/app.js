document.addEventListener("DOMContentLoaded", () => {
    const pinScreen = document.getElementById("pin-screen");
    const pinInput = document.getElementById("pin-input");
    const pinError = document.getElementById("pin-error");
    const teamSelect = document.getElementById("admin-team-select");
    const teamInput = document.getElementById("admin-team");

    if (teamSelect && teamInput) {
        teamSelect.addEventListener("change", () => {
            teamInput.value = teamSelect.value;
        });
    }


    // Vérifier si l'utilisateur s'est déjà authentifié durant cette session
    const savedUserStr = sessionStorage.getItem("currentUserData");
    if (savedUserStr) {
        try {
            const userData = JSON.parse(savedUserStr);
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
                        // userData contient par exemple : { name: "Thomas", role: "admin", team: "U14" }

                        // On mémorise les infos utilisateur
                        window.currentUserRole = userData.role; 
                        window.currentUserName = userData.name;
                        window.currentUserTeam = userData.team || 'all';
                        
                        sessionStorage.setItem("currentUserData", JSON.stringify(userData));
                        sessionStorage.setItem("currentUserRole", userData.role);
                        sessionStorage.setItem("isUnlocked", "true");

                        // Animation de disparition de l'écran PIN (identique à votre code)
                        if (pinScreen) {
                            pinScreen.style.opacity = "0";
                            pinScreen.style.transition = "opacity 0.3s ease";
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
            { id: "J001", name: "BAILLARIN Theo", licence: "9603227294", phonePere: "06 76 16 72 65", cat: "U14", poste1: "AD", poste2: "BU", poste3: "MC" },
            { id: "J002", name: "BAZABAS Mael", licence: "9604869553", phonePere: "06 48 62 75 80", cat: "U14", poste1: "BU", poste2: "AG", poste3: "-" },
            { id: "J003", name: "BEAULIEU Barthelemy", licence: "9602804942", phonePere: "06 61 53 24 85", cat: "U14", poste1: "DC", poste2: "MDC", poste3: "-" },
            { id: "J018", name: "BONNEFIS Antoine", licence: "9603191094", phonePere: "06 22 34 04 20", cat: "U13", poste1: "AD", poste2: "DD", poste3: "-" },
            { id: "J004", name: "BOUAJAJ Ibrahim", licence: "9605352704", phonePere: "06 95 84 64 94", cat: "U14", poste1: "DC", poste2: "MDC", poste3: "-" },
            { id: "J019", name: "FRESQUET Jules", licence: "9603971174", phonePere: "-", cat: "U13", poste1: "MC", poste2: "MO", poste3: "-" }
        ];

        // --- 2. ÉTAT GLOBAL DE L'APPLICATION ---
        let state = {
    players: [],
    matches: {},
    trainings: {},
    cards: {},
    stats: {},
    staff: [],
    teams: {}
};

// Variables d'interface uniquement
let currentSession = 1;
let selectedMatchId = null;

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
                    state.players = data.players || [];
                    state.matches = data.matches || {};
                    state.cards = data.cards || {};
                    state.stats = data.stats || {};
                    state.staff = data.staff || [];
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
                if (matchKeys.length > 0 && (!state.selectedMatchId || !state.matches[state.selectedMatchId])) {
                    state.selectedMatchId = matchKeys[matchKeys.length - 1];
                }

                renderAll();
            } catch(err) {
                console.error("Erreur de synchronisation :", err);
            }
        });

function saveStateToFirebase() {
    const dataToSave = {
        players: state.players,
        matches: state.matches,
        trainings: state.trainings,
        cards: state.cards,
        stats: state.stats,
        staff: state.staff,
        teams: state.teams
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
            renderEffectif();
            populateMatchSelector();
            renderMatchDetail();
            renderMatchesResultsList();
            renderEntrainements();
            renderStaff();
        }

       function switchTab(tabId) {
            ['dashboard', 'effectif', 'matchs', 'entrainements', 'staff'].forEach(t => {
                const sec = document.getElementById(`sec-${t}`);
                if(sec) sec.classList.add('hidden');
                const btn = document.getElementById(`tab-${t}`);
                if (btn) btn.classList.remove('bg-white/20', 'text-white');
            });

            const targetSec = document.getElementById(`sec-${tabId}`);
            if(targetSec) targetSec.classList.remove('hidden');
            const activeBtn = document.getElementById(`tab-${tabId}`);
            if (activeBtn) activeBtn.classList.add('bg-white/20', 'text-white');
        }

    function switchMatchSubTab(subTabId) {
            // Si aucun sous-onglet n'est spécifié, on force 'results' (le calendrier) par défaut
            if (!subTabId) subTabId = 'results';

            const isConvoc = subTabId === 'convocations';
            document.getElementById('subtab-convocations').classList.toggle('hidden', !isConvoc);
            document.getElementById('subtab-results').classList.toggle('hidden', isConvoc);

            const btnC = document.getElementById('subtab-convocations-btn');
            const btnR = document.getElementById('subtab-results-btn');

            if (isConvoc) {
                btnC.className = "pb-2 text-xs font-bold border-b-2 border-sky-600 text-sky-600 flex items-center space-x-1.5 transition";
                btnR.className = "pb-2 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-1.5 transition";
            } else {
                btnR.className = "pb-2 text-xs font-bold border-b-2 border-sky-600 text-sky-600 flex items-center space-x-1.5 transition";
                btnC.className = "pb-2 text-xs font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center space-x-1.5 transition";
                renderMatchesResultsList();
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
            if (type === 'Championnat') return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200"><i class="fa-solid fa-trophy mr-1"></i>Championnat</span>';
            if (type === 'Coupe') return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200"><i class="fa-solid fa-shield-halved mr-1"></i>Coupe</span>';
            return '<span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200"><i class="fa-solid fa-handshake mr-1"></i>Amical</span>';
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

const playersSource = role === 'coach'
    ? state.players.filter(p =>
        (p.team || p.cat || '').toLowerCase() === userTeam.toLowerCase()
      )
    : state.players;
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

    state.players.slice(0, 3).forEach(p => {
    console.log(
        p.name,
        "team =", p.team,
        "cat =", p.cat
    );
});
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
                const catBadge =`<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800">
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
                <div class="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col justify-between space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
    <h3 class="font-bold text-xs text-slate-800">${p.name}</h3>
    ${attendanceBadge}
    <p class="text-[11px] ${hasLicence ? 'text-slate-600' : 'text-amber-700 font-bold'}">
        Licence: ${hasLicence ? p.licence : '⚠️ Manquante'}
    </p>
</div>
                        <div class="flex items-center space-x-1.5">${catBadge}<button onclick="openModalPlayer('${p.id}')" class="p-1 text-slate-400 hover:text-sky-600" aria-label="Modifier le joueur ${p.name}"><i class="fa-solid fa-pen-to-square text-xs"></i></button><button onclick="deletePlayer('${p.id}')" class="p-1 text-slate-400 hover:text-red-600" aria-label="Supprimer le joueur ${p.name}"><i class="fa-solid fa-trash-can text-xs"></i></button></div>
                    </div>
                    <div class="text-xs space-y-2 pt-2 border-t border-slate-200/60">
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

            // Trier les matchs par date (prochain d'abord)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            matches.sort((a, b) => {
                const dateA = a.date ? new Date(a.date + 'T12:00:00') : new Date('9999-12-31');
                const dateB = b.date ? new Date(b.date + 'T12:00:00') : new Date('9999-12-31');
                return dateA - dateB;
            });

            const keys = matches.map(m => m.id);
            if (keys.length === 0) { selector.innerHTML = `<option value="">Aucun match</option>`; return; }
            
            selector.innerHTML = matches.map(m => {
                const teamName = state.teams?.[m.team]?.name || m.team || 'Équipe';
                const formattedDate = m.date ? new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : '--/--/--';
                return `<option value="${m.id}" ${m.id === state.selectedMatchId ? 'selected' : ''}>${m.opponent} (${formattedDate})</option>`;
            }).join('');
            if (state.selectedMatchId) selector.value = state.selectedMatchId;
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

            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) {
                const keys = Object.keys(state.matches);
                if (keys.length > 0) state.selectedMatchId = keys[keys.length - 1];
            }

            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-slate-400">Aucun match disponible.</td></tr>`;
                infoCard.style.display = 'none'; counterBanner.style.display = 'none'; carpoolBanner.style.display = 'none';
                if(validationStatus) validationStatus.innerHTML = '';
                return;
            }

            selector.value = state.selectedMatchId;
            infoCard.style.display = 'flex'; counterBanner.style.display = 'flex'; carpoolBanner.style.display = 'flex';
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
                    <div class="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-base shrink-0 mt-0.5"><i class="fa-solid fa-futbol"></i></div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <div class="flex items-center space-x-2">
    <p class="font-bold text-slate-800 text-sm">
        ${teamName} vs ${m.opponent}
    </p>
    ${getMatchTypeBadge(m.type || 'Championnat')}
</div>

<div class="flex flex-wrap gap-2 justify-end">

    <button
        onclick="openModalMatch('${m.id}')"
        class="text-sky-600 font-bold text-xs bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
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
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1.5 text-[11px] text-slate-600">
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
            state.players.forEach(p => {
                if (m.convocations[p.id] === 'convoke') convokedCount++;
                totalSeats += parseInt(m.carpool[p.id]) || 0;
            });

            counterBanner.className = `p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${convokedCount < 14 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-sky-50 border-sky-200 text-sky-900'}`;
            counterBanner.innerHTML = `<div class="font-bold text-xs">Convocations : ${convokedCount} / 14</div><span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${convokedCount < 14 ? 'bg-amber-200' : 'bg-sky-200'}">${convokedCount < 14 ? '⚠️ Incomplet' : '🔵 OK'}</span>`;

            carpoolBanner.className = `p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${totalSeats < 14 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'}`;
            carpoolBanner.innerHTML = `<div class="font-bold text-xs">Covoiturage : ${totalSeats} / 14 places</div><span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${totalSeats < 14 ? 'bg-amber-200' : 'bg-emerald-200'}">${totalSeats < 14 ? '⚠️ Transport' : '🟢 OK'}</span>`;

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
                            <select onchange="setMatchCarpool('${m.id}', '${p.id}', this.value)" class="bg-white border font-bold text-xs py-1 px-2 rounded-lg">
                                <option value="0" ${carpoolSeats == 0 ? 'selected' : ''}>0 place</option>
                                <option value="2" ${carpoolSeats == 2 ? 'selected' : ''}>🚗 2 places</option>
                                <option value="3" ${carpoolSeats == 3 ? 'selected' : ''}>🚗 3 places</option>
                                <option value="4" ${carpoolSeats == 4 ? 'selected' : ''}>🚗 4 places</option>
                                <option value="5" ${carpoolSeats == 5 ? 'selected' : ''}>🚗 5 places</option>
                            </select>
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

            if (state.staff && state.staff.length > 0) {
                staffTableRows += `<tr class="bg-slate-100 text-slate-700 font-bold text-xs"><td colspan="6" class="p-2 pl-4 uppercase tracking-wider">Encadrement / Staff Officiel</td></tr>`;
                staffMobileCards += `<div class="bg-slate-100 text-slate-700 font-bold text-xs p-2.5 rounded-lg my-3 uppercase tracking-wider">Encadrement / Staff Officiel</div>`;

                state.staff.forEach(member => {
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
                const nbPresent = presences.filter(v => v === 'present').length;
                const nbTotal = state.players.length;
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
            container.innerHTML = state.players.map(p => {
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
                        <p class="text-[10px] text-slate-400">${p.cat || ''}</p>
                    </div>
                    <div class="flex flex-wrap gap-1.5">${buttons}</div>
                </div>`;
            }).join('');
        }

        function renderAttendanceBars() {
            const today = new Date(); today.setHours(0,0,0,0);
            const pastSessions = Object.values(state.trainings || {}).filter(s => {
                if (!s.date) return false;
                const d = new Date(s.date + 'T12:00:00'); d.setHours(0,0,0,0);
                return d < today;
            });
            const container = document.getElementById('training-attendance-bars');
            if (!container) return;
            if (pastSessions.length === 0) {
                container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Aucune séance passée pour calculer les stats.</p>';
                return;
            }
            const rows = state.players.map(p => {
                let present = 0, total = pastSessions.length;
                pastSessions.forEach(s => { if ((s.presence || {})[p.id] === 'present') present++; });
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

    state.players.forEach(player => {
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

    state.players.forEach(player => {
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
                const scoreH = m.scoreHome !== undefined && m.scoreHome !== "" ? m.scoreHome : "-";
                const scoreA = m.scoreAway !== undefined && m.scoreAway !== "" ? m.scoreAway : "-";
                const formattedDate = m.date ? new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                }) : '--/--/--';

                return `
                    <div class="p-3.5 bg-slate-50 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm"><i class="fa-solid fa-trophy"></i></div>
                            <div>
                                <div class="flex items-center space-x-2"><span class="font-bold text-slate-800 text-sm">${teamName} vs ${m.opponent}</span>${getMatchTypeBadge(m.type || 'Championnat')}</div>
                                <div class="text-[11px] text-slate-500 mt-0.5">📍 ${m.location || 'Domicile'} • 📅 ${formattedDate} à ${m.heure || '14:30'}</div>
                            </div>
                        </div>
                        <div class="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3">
                            <div class="flex items-center space-x-2">
                                ${getMatchResultBadge(m.scoreHome, m.scoreAway)}
                                <div class="bg-white px-3 py-1.5 rounded-lg border font-bold text-slate-700 text-sm"><span class="text-sky-600">${scoreH}</span> - <span class="text-red-600">${scoreA}</span></div>
                            </div>
                            <button onclick="openMatchBilanModal('${m.id}')" class="bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg font-bold flex items-center space-x-1.5 transition whitespace-nowrap"><i class="fa-solid fa-pen-to-square"></i><span>Bilan</span></button>
                        </div>
                    </div>`;
            }).join('');
        }

        function deleteMatch(matchId) {
            const match = state.matches[matchId];
            if (!match) return;
            let warning = `Supprimer le match contre ${match.opponent} ?`;
            if (match.scoreHome !== undefined && match.scoreHome !== "") {
                warning = `⚠️ Ce match contient déjà des données :\n\n• score\n• statistiques\n• cartons\n• convocations\n\nConfirmer la suppression définitive ?`;
            }
            if (!confirm(warning)) return;
            delete state.matches[matchId];
            if (state.cards[matchId]) delete state.cards[matchId];
            const remaining = Object.keys(state.matches);
            state.selectedMatchId = remaining.length > 0 ? remaining[remaining.length - 1] : null;
            saveStateToFirebase();
            renderAll();
            showToast("Match supprimé");
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
            if (!confirm("Réinitialiser le match ? Toutes les convocations, statistiques, cartons et résultats seront supprimés.")) return;
            match.scoreHome = "";
            match.scoreAway = "";
            match.convocations = {};
            match.positions = {};
            match.jerseys = {};
            match.carpool = {};
            match.matchStats = {};
            match.debrief = "";
            match.isValidated = false;
            if (state.cards[matchId]) delete state.cards[matchId];
            recalculateGlobalStats();
            saveStateToFirebase();
            renderAll();
            showToast("Match réinitialisé");
        }

        function copyLicence(licence) {
            navigator.clipboard.writeText(licence).then(() => showToast(`Licence ${licence} copiée !`));
        }

        function generateWhatsAppMessage() {
            if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) return;
            const m = state.matches[state.selectedMatchId];
            const convoked = state.players.filter(p => m.convocations[p.id] === 'convoke');
            let text = `🔵 *RANGUEIL FC - CONVOCATION MATCH* 🔵\n\n`;
            text += `📅 *Adversaire :* ${m.opponent} (${m.type || 'Championnat'})\n`;
            text += `📍 *Lieu :* ${m.location || 'Domicile'} - ${m.adresse || 'Stade'}\n`;
            text += `⏰ *Rendez-vous :* ${m.heure ? 'à ' + m.heure : 'à définir'}\n\n`;
            text += `📋 *Joueurs Convoqués (${convoked.length}) :*\n`;
            convoked.forEach((p, idx) => {
                const pos = m.positions[p.id] || p.poste1 || '';
                const jersey = m.jerseys && m.jerseys[p.id] ? ` (N°${m.jerseys[p.id]})` : '';
                text += `${idx+1}. ${p.name}${jersey} - ${pos}\n`;
            });
            text += `\n🚗 *COVOITURAGE :* Merci d'indiquer en réponse les places disponibles dans votre véhicule.\n\n`;
            text += `Allez Rangueil ! ⚽`;
            navigator.clipboard.writeText(text).then(() => showToast("Message WhatsApp copié !"));
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
                }
            } else {
                document.getElementById('modal-match-title').innerText = "Nouveau Match";
                document.getElementById('m-id').value = '';
                document.getElementById('m-team').value = '';
            }
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
        // Initialiser les champs optionnels
        scoreHome: "",
        scoreAway: "",
        convocations: {},
        positions: {},
        jerseys: {},
        carpool: {},
        matchStats: {},
        debrief: ""
    };

    // Mise à jour de l'état local
    state.matches[matchId] = matchData;
    
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

        function renderStaff() {
            const container = document.getElementById('staff-full-container');
            if (!container) return;
            if (!state.staff || state.staff.length === 0) {
                container.innerHTML = '<div class="col-span-full p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs">Aucun membre du staff enregistré pour le moment. Clique sur "Ajouter un membre" pour commencer.</div>';
                return;
            }
            container.innerHTML = state.staff.map(member => `
                <div class="bg-white p-4 rounded-xl card-shadow border border-slate-100 flex flex-col justify-between space-y-3">
                    <div class="flex items-start justify-between">
                        <div>
                        <h3 class="font-extrabold text-slate-800 text-sm">${member.name}</h3>

<span class="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-sky-50 text-sky-700 border border-sky-100">
    ${member.role}
</span>

  ${member.scope
    ? `<p class="text-xs text-slate-500 mt-1 font-medium">
            📍 ${state.teams?.[member.scope]?.name || member.scope}
       </p>`
    : ''} 
                        </div>
                        <div class="flex space-x-1">
                            <button onclick="editStaff('${member.id}')" class="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs" title="Modifier"><i class="fa-solid fa-pen"></i></button>
                            <button onclick="deleteStaff('${member.id}')" class="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div class="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                        <div class="flex items-center justify-between text-slate-600">
                            <div class="flex items-center space-x-2">
                                <i class="fa-solid fa-id-card text-sky-600 w-4"></i>
                                <span>Licence : <strong>${member.licence || 'Non renseigné'}</strong></span>
                            </div>
                            ${member.licence ? `<button onclick="navigator.clipboard.writeText('${member.licence}'); showToast('Licence copiée !')" class="text-xs text-sky-600 hover:text-sky-800 p-1" title="Copier la licence"><i class="fa-regular fa-copy"></i></button>` : ''}
                        </div>
                        <div class="flex items-center text-slate-600 space-x-2">
                            <i class="fa-solid fa-phone text-sky-600 w-4"></i>
                            <span>${member.phone || 'Non renseigné'}</span>
                        </div>
                        <div class="flex items-center text-slate-600 space-x-2">
                            <i class="fa-solid fa-envelope text-sky-600 w-4"></i>
                            <span class="truncate">${member.email || 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>`).join('');
        }

        function openModalStaff(staffId = null) {
            document.getElementById('form-staff').reset();
            document.getElementById('staff-id').value = '';
            document.getElementById('modal-staff-title').innerText = "Ajouter un Membre du Staff";
            if (staffId) {
                const member = state.staff.find(s => s.id === staffId);
                if (member) {
                    document.getElementById('staff-id').value = member.id;
                    document.getElementById('staff-name').value = member.name;
                    document.getElementById('staff-role').value = member.role;
                    document.getElementById('staff-scope').value =
    member.scope || '';
                    document.getElementById('staff-licence').value = member.licence || '';
                    document.getElementById('staff-phone').value = member.phone || '';
                    document.getElementById('staff-email').value = member.email || '';
                    document.getElementById('modal-staff-title').innerText = "Modifier le Membre du Staff";
                }
            }
            toggleModal('modal-staff', true);
        }

        function handleSaveStaff(event) {
            event.preventDefault();
            const idInput = document.getElementById('staff-id').value;
            const staffData = {
                id: idInput || 'STF_' + Date.now(),
                name: document.getElementById('staff-name').value.trim(),
                role: document.getElementById('staff-role').value,
               scope: document.getElementById('staff-scope').value.trim(), 
                licence: document.getElementById('staff-licence').value.trim(),
                phone: document.getElementById('staff-phone').value.trim(),
                email: document.getElementById('staff-email').value.trim()
            };
            if (idInput) {
                const index = state.staff.findIndex(s => s.id === idInput);
                if (index !== -1) state.staff[index] = staffData;
            } else {
                state.staff.push(staffData);
            }
            saveStateToFirebase();
            toggleModal('modal-staff', false);
            renderStaff();
        }

        function deleteStaff(staffId) {
            if (confirm("Supprimer ce membre du staff ?")) {
                state.staff = state.staff.filter(s => s.id !== staffId);
                saveStateToFirebase();
                renderStaff();
            }
        }

        function editStaff(staffId) {
            openModalStaff(staffId);
        }

// --- INITIALISATION DES ÉVÉNEMENTS ---
window.addEventListener('DOMContentLoaded', () => {
    // Filtrage performant des joueurs
    const searchInput = document.getElementById('search-player');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterPlayers(e.target.value);
        });
    }

    // Thème "Autre" dans la modale entraînement
    const sel = document.getElementById('t-theme');
    if (sel) {
        sel.addEventListener('change', function() {
            document.getElementById('t-theme-autre-zone').classList.toggle('hidden', this.value !== 'Autre');
        });
    }
});

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

    container.innerHTML =
        `<button onclick="setFilterCat('all')" id="filter-all"
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
}
// --- 4. GESTION DES RÔLES ET PERMISSIONS MISE À JOUR ---
function applyPermissions() {

    console.log(sessionStorage.getItem("currentUserData"));


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
    if (role === 'public' || role === 'responsable' || role === 'dirigeant') {
        document.querySelectorAll('.admin-only, .adjoint-only, .coach-only').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('select, input, button.status-btn').forEach(el => {
            if (!el.classList.contains('allow-public')) {
                el.disabled = true;
            }
        });
    } else if (role === 'coach') {
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = 'none';
        });
    }

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
    const modal = document.getElementById("admin-access-modal");
    if (modal) {
        if (show) {
            modal.classList.remove("hidden");
            loadCoachesFromFirebase();
        } else {
            modal.classList.add("hidden");
        }
    }
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
            const name = document.getElementById("admin-name").value.trim();
            const role = document.getElementById("admin-role").value;
            const team = document.getElementById("admin-team").value.trim();

            if (pin.length !== 4) {
                alert("Le code PIN doit comporter exactement 4 chiffres.");
                return;
            }

            try {
                await firebase.database().ref("rangueil_data/access/" + pin).set({
                    name: name,
                    role: role,
                    team: (role === "admin" || role === "dirigeant" || role === "public") ? "all" : (team || "all")
                });

                alert(`Accès pour "${name}" enregistré avec succès !`);
                coachForm.reset();
                toggleTeamInput(document.getElementById("admin-role").value);
                loadCoachesFromFirebase();
            } catch (error) {
                console.error("Erreur lors de l'enregistrement :", error);
                alert("Erreur lors de l'enregistrement en base.");
            }
        });
    }
});

// Charger la liste des comptes depuis Firebase pour les afficher dans la modale
async function loadCoachesFromFirebase() {
    const container = document.getElementById("coaches-list-container");
    if (!container) return;

    container.innerHTML = "<p class='text-xs text-slate-400'>Chargement des comptes...</p>";

    try {
        const snapshot = await firebase.database().ref("rangueil_data/access").once("value");
        if (snapshot.exists()) {
            container.innerHTML = "";
            snapshot.forEach((childSnapshot) => {
                const pin = childSnapshot.key;
                const data = childSnapshot.val();

                const item = document.createElement("div");
                item.className = "flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-md text-xs";
                item.innerHTML = `
                    <div>
                        <span class="font-bold text-slate-800">${data.name}</span> 
                        <span class="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded ml-1 text-[10px] font-semibold">${data.role}</span>
                        <span class="text-slate-500 ml-1">(${data.team})</span>
                        <div class="text-slate-400 font-mono text-[10px] mt-0.5">PIN : ${pin}</div>
                    </div>
                    <button onclick="deleteCoachAccount('${pin}')" class="text-red-500 hover:text-red-700 p-1.5 cursor-pointer"><i class="fa-solid fa-trash"></i></button>
                `;
                container.appendChild(item);
            });
        } else {
            container.innerHTML = "<p class='text-xs text-slate-400'>Aucun compte trouvé.</p>";
        }
    } catch (error) {
        console.error("Erreur de chargement :", error);
        container.innerHTML = "<p class='text-xs text-red-500'>Erreur de chargement.</p>";
    }
}

// Supprimer un compte de Firebase
window.deleteCoachAccount = async function(pin) {
    if (confirm(`Voulez-vous vraiment supprimer l'accès associé au PIN ${pin} ?`)) {
        try {
            await firebase.database().ref("rangueil_data/access/" + pin).remove();
            loadCoachesFromFirebase();
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            alert("Impossible de supprimer ce compte.");
        }
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
    const container = document.getElementById('admin-teams-list');
    if (!container) return;

    state.teams = teamsData || {};
    renderTeamFilters();
    renderAll();
    const keys = Object.keys(state.teams);

    if (keys.length === 0) {
        container.innerHTML = `<div class="p-3 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">Aucune équipe enregistrée.</div>`;
        return;
    }

    container.innerHTML = keys.map(tKey => {
        const team = state.teams[tKey];
        return `
            <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <div>
                    <span class="font-bold uppercase text-slate-800">${tKey}</span> : <span class="text-slate-600">${team.name}</span>
                </div>
                <button type="button" onclick="deleteTeam('${tKey}')" class="text-red-500 hover:text-red-700 p-1"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    }).join('');

    // Mettre à jour automatiquement tous les menus déroulants d'équipes du site
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
    console.log("Dropdowns trouvés :", selects.length);

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