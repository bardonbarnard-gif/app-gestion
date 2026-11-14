/* Rangueil FC - Navigation, couleurs d'equipe et affichage des noms
   Partie 2/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
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
                    renderDistrictPage();
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
        document.body.classList.remove('comp-fullscreen-open');

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
        