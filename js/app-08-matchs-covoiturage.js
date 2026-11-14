/* Rangueil FC - Infos match, covoiturage, transport et evenements
   Partie 8/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
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
    const suspendus = [];
    const nonConvoked = [];

    playerItems.forEach(({ p }) => {
        const status = m.convocations[p.id] || 'none';
        if (status === 'convoke') convoked.push(p);
        else if (status === 'indisponible') indisponibles.push(p);
        else if (status === 'suspendu') suspendus.push(p);
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
            ${infoNameGroup('Suspendus', '🚫', infoSortByFirstName(suspendus), 'red')}
            ${infoNameGroup('Non convoqués', '⚪', infoSortByFirstName(nonConvoked), 'slate')}
        </div>`;
}

function renderConvocationHero(m, info) {
    const target = info.targetConvoked || 0;
    const pct = target ? Math.min(100, Math.round((info.convokedCount / target) * 100)) : 0;
    const missing = Math.max(0, target - info.convokedCount);
    const statusPill = m.isValidated ? '🔒 Verrouillée' : '✏️ Brouillon';
    const heure = m.heure || '14:30';
    const lieu = m.location || 'Domicile';

    return `
        <div class="conv-hero" style="--team:${info.teamHex}">
            <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <p class="conv-hero-tag">${info.teamName} · Convocations</p>
                    <p class="conv-hero-title">${m.opponent || 'Adversaire à définir'}</p>
                    <p class="conv-hero-sub">${info.formattedDate} · ${heure} · ${lieu}</p>
                </div>
                <span class="conv-hero-pill">${statusPill}</span>
            </div>

            <div class="conv-hero-stats"${info.suspenduCount ? ' style="grid-template-columns:repeat(5,minmax(0,1fr))"' : ''}>
                <div class="conv-hero-stat">
                    <span class="conv-hero-stat-value">${info.convokedCount}<span class="conv-hero-stat-target">/${target}</span></span>
                    <span class="conv-hero-stat-label">Convoqués</span>
                </div>
                <div class="conv-hero-stat">
                    <span class="conv-hero-stat-value">${missing}</span>
                    <span class="conv-hero-stat-label">À compléter</span>
                </div>
                <div class="conv-hero-stat">
                    <span class="conv-hero-stat-value">${info.indispoCount}</span>
                    <span class="conv-hero-stat-label">Indispo</span>
                </div>
                ${info.suspenduCount ? `<div class="conv-hero-stat">
                    <span class="conv-hero-stat-value">${info.suspenduCount}</span>
                    <span class="conv-hero-stat-label">Suspendus</span>
                </div>` : ''}
                <div class="conv-hero-stat">
                    <span class="conv-hero-stat-value">${info.nonConvokedCount}</span>
                    <span class="conv-hero-stat-label">Non convoqués</span>
                </div>
            </div>

            <div class="conv-hero-bar"><span style="width:${pct}%"></span></div>
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

        const testLinkOff = document.getElementById('transport-covoiturage-test-link');
        if (testLinkOff) {
            testLinkOff.style.display = 'none';
            testLinkOff.removeAttribute('href');
        }
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

    // Lien de test staff (?test=1) : même match, réponses dans une base d'essai
    const testLink = document.getElementById('transport-covoiturage-test-link');
    if (testLink) {
        testLink.href = `covoiturage.html?id=${encodeURIComponent(m.carpoolId)}&test=1`;
        testLink.style.display = 'inline-flex';
    }
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

    // Rappel du match concerné : sans ça, l'onglet Transport n'indiquait
    // ni la rencontre ni la destination.
    const md = (data && data.matchId) ? state.matches[data.matchId] : null;
    const mdDate = (md && md.date)
        ? new Date(md.date + 'T12:00:00').toLocaleDateString('fr-FR', {
            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
        })
        : '';
    const mdDestination = (md && (md.adresse || md.location)) || '';
    const mdRdv = (md && md.meetingPlace) || '';

    container.innerHTML = `

        ${md ? `
        <div class="mb-4 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-600 to-sky-500 text-white p-3 shadow-sm">

            <div class="flex items-start justify-between gap-2">

                <div class="min-w-0">
                    <p class="text-[10px] font-extrabold uppercase tracking-wider text-sky-100">
                        ${md.type || 'Match'}
                    </p>
                    <p class="font-extrabold text-base leading-tight truncate">
                        🆚 ${md.opponent || 'Adversaire'}
                    </p>
                    ${mdDate ? `<p class="text-[11px] font-semibold text-sky-50">
                        📅 ${mdDate}${md.heure ? ' · ⚽ ' + md.heure : ''}
                    </p>` : ''}
                </div>

                ${md.team ? `<span class="shrink-0 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold">
                    ${state.teams && state.teams[md.team] && state.teams[md.team].name ? state.teams[md.team].name : md.team}
                </span>` : ''}

            </div>

            <div class="mt-2 space-y-1 text-[11px] font-semibold">

                <p class="flex items-start gap-1.5">
                    <span class="shrink-0">📍</span>
                    <span class="min-w-0">
                        ${mdDestination
                            ? mdDestination
                            : '<span class="opacity-75">Destination non renseignée</span>'}
                    </span>
                </p>

                ${mdRdv ? `<p class="flex items-start gap-1.5">
                    <span class="shrink-0">🚩</span>
                    <span class="min-w-0">Départ : ${mdRdv}</span>
                </p>` : ''}

            </div>

        </div>` : ''}

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
//  MODULE : ACCÈS API FFF (api-dofa.fff.fr)
//  Couche réseau partagée avec l'onglet District : construction d'URL,
//  proxy, JSONP et repli CORS. La synchronisation automatique du
//  calendrier (et son panneau d'administration) a été retirée.
// ============================================================

