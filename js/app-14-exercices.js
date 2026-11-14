/* Rangueil FC - Terrain d'exercice, chronometre et modeles de seance
   Partie 14/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
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

/* ============================================================
   CALENDRIER — rendu moderne
   Ces déclarations remplacent le rendu historique : mêmes noms
   de fonctions, même scope, la dernière déclaration l'emporte.
   ============================================================ */

/* var (et non let) : le rendu peut être appelé avant cette ligne
   lorsque le script initialise l'interface. */
