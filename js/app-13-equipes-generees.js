/* Rangueil FC - Equipes equilibrees et gestion des invites
   Partie 13/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
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

