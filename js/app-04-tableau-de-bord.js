/* Rangueil FC - Classements du tableau de bord et effectif
   Partie 4/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
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
                        <p class="mt-1 text-[11px] text-slate-500">Les buts, passes et convocations saisis dans le bilan d'un match apparaîtront ici.</p>
                    </div>`;
                return;
            }

            listEl.innerHTML = ranked.map((r, i) => {
                const detail = dashboardStatsKind === 'scorers'
                    ? `${r.goals} ⚽ · ${r.assists} 🎯`
                    : dashboardStatsKind === 'passers'
                        ? `${r.assists} 🎯 · ${r.goals} ⚽`
                        : dashboardStatsKind === 'convocations'
                            ? `${r.convoked} 📋 · ${r.convocationRate}% de convocations`
                            : dashboardStatsKind === 'winners'
                                ? `${r.wins}V · ${r.draws}N · ${r.losses}D · ${r.winRate}% de victoires`
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

            // Taux de présence aux séances et de matchs joués, calculés une seule
            // fois par joueur : servent au tri et à l'affichage des fiches.
            const ratioCache = new Map();
            const getPlayerRatios = (p) => {
                if (ratioCache.has(p.id)) return ratioCache.get(p.id);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const playerTeam = String(p.team || p.cat || '').toLowerCase();
                let presences = 0;
                let totalSessions = 0;

                Object.values(state.trainings || {}).forEach(session => {
                    if (!session.date) return;

                    const sessionDate = new Date(session.date + 'T12:00:00');
                    sessionDate.setHours(0, 0, 0, 0);

                    if (sessionDate >= today) return;

                    // Ne compter que les séances de l'équipe du joueur
                    if (String(session.team || '').toLowerCase() !== playerTeam) return;

                    const presence = session.presence || {};

                    // Ignorer les séances dont l'appel n'a pas été rempli
                    if (Object.keys(presence).length === 0) return;

                    totalSessions++;

                    if (presence[p.id] === 'present' || presence[p.id] === 'retard') {
                        presences++;
                    }
                });

                const convocHistory = getConvocationHistoryForTeam(p.team || p.cat);
                const matchStats = convocHistory.history[p.id] || emptyConvocationStats();

                // Un joueur est « disponible » sur un match s'il n'était pas indisponible :
                // les matchs où il s'est signalé absent ne relèvent pas du choix du coach.
                const availableMatches = matchStats.total - matchStats.indispo - (matchStats.suspendu || 0);

                const ratios = {
                    presences,
                    totalSessions,
                    presencePct: totalSessions > 0 ? Math.round((presences / totalSessions) * 100) : null,
                    convocHistory,
                    matchStats,
                    matchPct: matchStats.total > 0 ? Math.round((matchStats.played / matchStats.total) * 100) : null,
                    availableMatches,
                    availabilityPct: matchStats.total > 0 ? Math.round((availableMatches / matchStats.total) * 100) : null,
                    indispoPct: matchStats.total > 0 ? Math.round((matchStats.indispo / matchStats.total) * 100) : null,
                    // Taux de sélection : joué parmi les matchs où il était disponible
                    selectionPct: availableMatches > 0 ? Math.round((matchStats.played / availableMatches) * 100) : null
                };

                ratioCache.set(p.id, ratios);
                return ratios;
            };

            // Tri choisi dans le sélecteur de l'onglet Effectif
            if (effectifSortMode !== 'default') {
                const byName = (a, b) => formatPlayerName(a).localeCompare(formatPlayerName(b), 'fr', { sensitivity: 'base' });
                const sortValue = (p) => {
                    const r = getPlayerRatios(p);
                    switch (effectifSortMode) {
                        case 'gap':
                            // Écart séances / sélection réelle : les matchs d'indisponibilité
                            // ne comptent pas, sinon un joueur blessé paraît « peu utilisé ».
                            return (r.presencePct !== null && r.selectionPct !== null && r.availableMatches >= 2)
                                ? r.presencePct - r.selectionPct
                                : null;
                        case 'presence-desc':
                        case 'presence-asc':
                            return r.presencePct;
                        case 'match-desc':
                        case 'match-asc':
                            return r.matchPct;
                        default:
                            return null;
                    }
                };
                const ascending = effectifSortMode === 'presence-asc' || effectifSortMode === 'match-asc';

                playersToDisplay = [...playersToDisplay].sort((a, b) => {
                    const va = sortValue(a);
                    const vb = sortValue(b);
                    const aEmpty = va === null || va === undefined;
                    const bEmpty = vb === null || vb === undefined;
                    if (aEmpty && bEmpty) return byName(a, b);
                    if (aEmpty) return 1;
                    if (bEmpty) return -1;
                    if (va !== vb) return ascending ? va - vb : vb - va;
                    return byName(a, b);
                });
            }

            const container = document.getElementById('effectif-full-container');
            container.innerHTML = playersToDisplay.map((p, index) => {
                const p1 = p.poste1 || '-', p2 = p.poste2 || '-', p3 = p.poste3 || '-';
                const niveau = p.niveau || 2;

const niveauBadge =
    niveau === 3
        ? '<span class="font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">🟢 Niveau 3</span>'
        : niveau === 2
        ? '<span class="font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700">🟡 Niveau 2</span>'
        : '<span class="font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">🔴 Niveau 1</span>';
                const hasLicence = p.licence && p.licence.trim() !== '' && p.licence.trim() !== '-';
                const injuryInfo = getPlayerInjuryInfo(p);
                const cards = getPlayerCardsCount(p.id);
                const pStats = state.stats[p.id] || { goals: 0, assists: 0 };
                const teamKey = p.team || p.cat; 
                const teamName = state.teams?.[teamKey]?.name || "Sans équipe";
                const teamColors = getTeamColorClasses(teamKey);
                const catBadge =`<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold ${teamColors.badge}">
        ${teamName}
    </span>`;


                // Badge blessure (durée calculée depuis les appels)
                const blessureBadge = renderInjuryBadge(injuryInfo);
                const injuryHistoryText = formatPlayerInjuryHistory(injuryInfo);


                // Présences et bilan de convocations (déjà calculés plus haut)
                const { presences, totalSessions, presencePct, convocHistory, matchStats, matchPct, availableMatches, availabilityPct, indispoPct, selectionPct } = getPlayerRatios(p);
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
                const playerRecord = (convocHistory.records || {})[p.id] || null;
                const matchColor = matchPct === null ? 'text-slate-400' : matchPct >= 75 ? 'text-emerald-600' : matchPct >= 50 ? 'text-amber-600' : 'text-red-600';

                // Joueur peu utilisé alors qu'il est assidu aux entraînements
                // (on ignore les matchs où il s'était signalé indisponible)
                const underplayGap = (presencePct !== null && selectionPct !== null && availableMatches >= 2)
                    ? presencePct - selectionPct
                    : null;
                const underplayBadge = underplayGap !== null && underplayGap >= 25 && presencePct >= 60
                    ? `<span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700" title="${presencePct}% de présence aux séances mais ${selectionPct}% de sélection sur les ${availableMatches} match(s) où il était disponible">📉 Peu utilisé (+${underplayGap} pts)</span>`
                    : '';

                // Rang dans le classement courant : les taux sont déjà lisibles sur
                // les jauges de la fiche, on n'ajoute que l'écart quand il existe.
                const rankNumber = index + 1;
                let rankDetail = '';
                let rankLabel = '';

                if (effectifSortMode === 'gap') {
                    rankDetail = underplayGap !== null
                        ? `écart séances − sélection ${underplayGap > 0 ? '+' : ''}${underplayGap} pts (${matchStats.played}/${availableMatches} joués quand disponible)`
                        : 'données incomplètes (moins de 2 matchs disponibles)';
                    rankLabel = underplayGap !== null ? `#${rankNumber} · ${underplayGap > 0 ? '+' : ''}${underplayGap} pts` : `#${rankNumber}`;
                } else if (effectifSortMode.startsWith('presence')) {
                    rankDetail = presencePct !== null ? `${presencePct} % de séances` : 'aucune séance pointée';
                    rankLabel = `#${rankNumber}`;
                } else if (effectifSortMode.startsWith('match')) {
                    rankDetail = matchPct !== null ? `${matchPct} % de matchs` : 'aucun match passé';
                    rankLabel = `#${rankNumber}`;
                }

                const rankBadge = rankLabel
                    ? `<span class="effectif-rank px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200" title="Rang ${rankNumber} dans le classement — ${rankDetail}">${rankLabel}</span>`
                    : '';

                                const initials = (p.name || '?')
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map(w => w.charAt(0).toUpperCase())
                    .join('');

                const matchHint = matchPct !== null
                    ? `${matchStats.played} joué(s) sur ${matchStats.total} match(s) · ${matchStats.choix} non convoqué(s) · ${matchStats.indispo} indispo`
                    : (convocHistory.matches.length ? 'Aucun statut enregistré' : 'Aucun match passé');

                return `
                <article class="player-row" style="--team-color:${getTeamHex(p.team || p.cat)}" data-player-search="${((p.name || '') + ' ' + (p.licence || '')).replace(/"/g, '&quot;')}" data-player-team="${String(p.team || p.cat || '').replace(/"/g, '&quot;')}">
                    <div class="player-avatar ${teamColors.badge}" aria-hidden="true">${initials}</div>

                    <div class="min-w-0 flex-1">
                        <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-1.5">
                                    <h3 class="player-name truncate">${p.name}</h3>
                                    <span class="player-team-chip ${teamColors.badge}">${teamName}</span>
                                    ${blessureBadge}
                                </div>
                                <p class="player-meta">
                                    <span><i class="fa-solid fa-location-dot mr-1 opacity-60" aria-hidden="true"></i>${p1 !== '-' ? p1 : 'Poste non défini'}</span>
                                    <span class="text-slate-300" aria-hidden="true">·</span>
                                    <span class="${hasLicence ? '' : 'text-amber-700 font-bold'}"><i class="fa-solid fa-id-card mr-1 opacity-60" aria-hidden="true"></i>${hasLicence ? 'Lic. ' + p.licence : 'Licence manquante'}</span>
                                </p>
                            </div>

                            <div class="player-actions shrink-0">
                                <button onclick="openModalPlayer('${p.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition" aria-label="Modifier le joueur ${p.name}"><i class="fa-solid fa-pen-to-square text-xs" aria-hidden="true"></i></button>
                                <button onclick="deletePlayer('${p.id}')" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" aria-label="Supprimer le joueur ${p.name}"><i class="fa-solid fa-trash-can text-xs" aria-hidden="true"></i></button>
                            </div>
                        </div>

                        <div class="player-stats">
                            <div class="player-gauge ${matchPct === null ? 'is-empty' : ''}" title="${matchHint}">
                                <span class="player-gauge-ring" style="--pct:${matchPct !== null ? matchPct : 0}">
                                    <span class="player-gauge-value ${matchColor}">${matchPct !== null ? matchPct + '%' : '—'}</span>
                                </span>
                                <span class="player-gauge-label"><i class="fa-solid fa-calendar-check" aria-hidden="true"></i>Matchs</span>
                            </div>
                            <div class="player-gauge ${availabilityPct === null ? 'is-empty' : ''}" title="${availabilityPct !== null ? `${availableMatches} match(s) disponible(s) sur ${matchStats.total} · ${matchStats.indispo} indispo (${indispoPct} %)` : 'Aucun match passé'}">
                                <span class="player-gauge-ring" style="--pct:${availabilityPct !== null ? availabilityPct : 0}">
                                    <span class="player-gauge-value ${availabilityPct === null ? 'text-slate-400' : availabilityPct >= 75 ? 'text-emerald-600' : availabilityPct >= 50 ? 'text-amber-600' : 'text-orange-600'}">${availabilityPct !== null ? availabilityPct + '%' : '—'}</span>
                                </span>
                                <span class="player-gauge-label"><i class="fa-solid fa-kit-medical" aria-hidden="true"></i>Dispo</span>
                            </div>
                            <div class="player-gauge ${presencePct === null ? 'is-empty' : ''}" title="${presencePct !== null ? presences + ' présence(s) sur ' + totalSessions + ' séance(s)' : 'Aucune séance passée'}">
                                <span class="player-gauge-ring" style="--pct:${presencePct !== null ? presencePct : 0}">
                                    <span class="player-gauge-value ${presenceColor}">${presencePct !== null ? presencePct + '%' : '—'}</span>
                                </span>
                                <span class="player-gauge-label"><i class="fa-solid fa-dumbbell" aria-hidden="true"></i>Séances</span>
                            </div>

                            <div class="player-stat-chips">
                                <div class="player-stat-chip" title="${pStats.goals} but(s), ${pStats.assists} passe(s) décisive(s)">
                                    <span class="player-stat-icon"><i class="fa-solid fa-futbol" aria-hidden="true"></i></span>
                                    <span class="player-stat-text">
                                        <span class="player-stat-label">Buts / passes</span>
                                        <span class="player-stat-value">${pStats.goals} ⚽ · ${pStats.assists} 🎯</span>
                                    </span>
                                </div>
                                <div class="player-stat-chip" title="${cards.yellows} jaune(s), ${cards.reds} rouge(s)">
                                    <span class="player-stat-icon"><i class="fa-solid fa-scroll" aria-hidden="true"></i></span>
                                    <span class="player-stat-text">
                                        <span class="player-stat-label">Cartons</span>
                                        <span class="player-stat-value"><span class="text-amber-600">${cards.yellows} 🟨</span> <span class="text-red-600">${cards.reds} 🟥</span></span>
                                    </span>
                                </div>
                                <div class="player-stat-chip" title="${carpoolHint}">
                                    <span class="player-stat-icon"><i class="fa-solid fa-car" aria-hidden="true"></i></span>
                                    <span class="player-stat-text">
                                        <span class="player-stat-label">Trajets</span>
                                        <span class="player-stat-value ${carpoolStats.withPassengers ? 'text-sky-700' : 'text-slate-400'}">${carpoolStats.withPassengers ? carpoolStats.withPassengers + ' 🚗' : '—'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-wrap items-center gap-1 mt-2.5">
                            ${rankBadge}
                            ${niveauBadge}
                            ${attendanceBadge}
                            ${underplayBadge}
                            ${autoBadge}
                            ${playerRecordBadges(playerRecord, { compact: true })}
                        </div>

                        <details class="player-details mt-2.5">
                            <summary><i class="fa-solid fa-chevron-right" aria-hidden="true"></i>Détails et postes</summary>
                            <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Postes</span>
                                    <span class="player-detail-value">${p1}${p2 !== '-' ? ' · ' + p2 : ''}${p3 !== '-' ? ' · ' + p3 : ''}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Convocations</span>
                                    <span class="player-detail-value">${matchStats.total > 0 ? `${matchStats.played} joué(s) · ${matchStats.choix} non convoqué(s) · ${matchStats.indispo} indispo sur ${matchStats.total} match(s)` : '—'}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Disponibilité</span>
                                    <span class="player-detail-value">${availabilityPct !== null ? `${availableMatches}/${matchStats.total} match(s) (${availabilityPct} %) · ${matchStats.indispo} indispo` : '—'}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Sélection</span>
                                    <span class="player-detail-value">${selectionPct !== null ? `${matchStats.played}/${availableMatches} joué(s) quand disponible (${selectionPct} %)` : '—'}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Résultats</span>
                                    <span class="player-detail-value">${playerRecordBadges(playerRecord)}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Blessures</span>
                                    <span class="player-detail-value">${injuryHistoryText}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Entraînements</span>
                                    <span class="player-detail-value">${presencePct !== null ? `${presences}/${totalSessions} séances` : '—'}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Covoiturage</span>
                                    <span class="player-detail-value">${carpoolStats.answered ? `${carpoolStats.withPassengers} avec passagers${carpoolStats.withoutSeats ? ` (dont ${carpoolStats.withoutSeats} sans place)` : ''} · ${carpoolStats.rides} passager · ${carpoolStats.directs} direct` : '—'}</span>
                                </div>
                                <div class="player-detail-item">
                                    <span class="player-detail-label">Équipe</span>
                                    <span class="player-detail-value">${teamName}</span>
                                </div>
                            </div>
                        </details>
                    </div>
                </article>`;
            }).join('');

            renderStaffEffectif();
            renderCarpoolRanking();

            const sortSelect = document.getElementById('effectif-sort');
            if (sortSelect) sortSelect.value = effectifSortMode;

            // Explication du classement courant + réapplication des filtres actifs
            updateEffectifSortHint(playersToDisplay.length);
            filterPlayers();
        }

        window.renderEffectif = renderEffectif;

        // Texte d'aide qui explique le classement affiché (et non juste le tri)
        function effectifSortHintText(mode, count) {
            const joueurs = count > 1 ? `${count} joueurs classés` : `${count} joueur classé`;

            switch (mode) {
                case 'gap':
                    return `Écart entre présence aux séances et sélection réelle : les matchs où le joueur s'était signalé indisponible ne comptent pas. Un joueur à 90 % de séances et 40 % de sélection (+50 pts) passe avant un joueur à 70 % / 50 % (+20 pts). ${joueurs}, joueurs ayant moins de 2 matchs disponibles en fin de liste.`;
                case 'presence-desc':
                    return `Classement par taux de présence aux séances, du plus assidu au moins assidu (séances passées de l'équipe). ${joueurs}.`;
                case 'presence-asc':
                    return `Classement par taux de présence aux séances, du moins assidu au plus assidu. ${joueurs}.`;
                case 'match-desc':
                    return `Classement par taux de matchs joués, du plus utilisé au moins utilisé (matchs passés de l'équipe). ${joueurs}.`;
                case 'match-asc':
                    return `Classement par taux de matchs joués, du moins utilisé au plus utilisé. ${joueurs}.`;
                default:
                    return '';
            }
        }

        function updateEffectifSortHint(count = 0) {
            const hint = document.getElementById('effectif-sort-hint');
            if (!hint) return;

            const texte = effectifSortHintText(effectifSortMode, count);
            hint.classList.toggle('hidden', !texte);

            if (texte) {
                hint.innerHTML = `<i class="fa-solid fa-arrow-down-wide-short mr-1" aria-hidden="true"></i>${texte} <span class="font-bold">Le # devant chaque joueur indique son rang dans ce classement.</span>`;
            }
        }

        // Change le tri des fiches joueurs (séances, matchs, écart entre les deux)
        function setEffectifSort(mode) {
            effectifSortMode = mode || 'default';
            renderEffectif();
        }

        window.setEffectifSort = setEffectifSort;

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

    // Matchs à venir d'abord (chronologiques), déjà joués à la fin
    matches = sortMatchesUpcomingFirst(matches);

    if (matches.length === 0) {
        selector.innerHTML =
            '<option value="">Aucun match</option>';
        return;
    }

    const optionForMatch = (m) => {
        const formattedDate = m.date
            ? new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
            : '--/--/--';

        return `<option value="${m.id}">${m.opponent} (${formattedDate})</option>`;
    };

    const upcoming = matches.filter(m => !matchHasBeenPlayed(m));
    const played = matches.filter(m => matchHasBeenPlayed(m));

    selector.innerHTML =
        '<option value="">-- Sélectionner un match --</option>' +
        (upcoming.length
            ? `<optgroup label="À venir (${upcoming.length})">${upcoming.map(optionForMatch).join('')}</optgroup>`
            : '') +
        (played.length
            ? `<optgroup label="Déjà joués (${played.length})">${played.map(optionForMatch).join('')}</optgroup>`
            : '');

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
    const convHeroIdle = document.getElementById('convoc-match-hero');
    if (convHeroIdle) convHeroIdle.classList.add('hidden');

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
                const convHeroEmpty = document.getElementById('convoc-match-hero');
                if (convHeroEmpty) convHeroEmpty.classList.add('hidden');
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
    const convHeroOther = document.getElementById('convoc-match-hero');
    if (convHeroOther) convHeroOther.classList.add('hidden');
    return;
}

            // Liste des joueurs du match via le sélecteur unique :
            // effectif de l'équipe + surclassés (résolus depuis l'effectif).
            // Un coach ne voit que son équipe et ses invités ; un admin voit
            // tout l'effectif pour pouvoir convoquer n'importe qui.
            const playerItems = getMatchPlayers(m, { includeAll: role !== 'coach' });
            const playersForMatch = playerItems.map(item => item.p);

            const teamName = state.teams?.[m.team]?.name || m.team || 'Équipe';
            const teamHex = getTeamHex(m.team);
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

            // Suspendus pour ce match : statut « Suspendu » coché automatiquement
            applySuspensionStatuses(m, cardsIndex);

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
            let indispoCount = 0;
            let suspenduCount = 0;
            let nonConvokedCount = 0;
            const targetConvoked = parseInt(state.teams?.[m.team]?.targetConvocations) || 14;
            playerItems.forEach(({ p }) => {
                const status = m.convocations[p.id] || 'none';
                if (status === 'convoke') convokedCount++;
                else if (status === 'indisponible') indispoCount++;
                else if (status === 'suspendu') suspenduCount++;
                else if (status === 'nonconvoke') nonConvokedCount++;
            });

            const convHero = document.getElementById('convoc-match-hero');
            if (convHero) {
                convHero.classList.remove('hidden');
                convHero.innerHTML = renderConvocationHero(m, {
                    teamName,
                    teamHex,
                    formattedDate,
                    convokedCount,
                    targetConvoked,
                    indispoCount,
                    suspenduCount,
                    nonConvokedCount
                });
            }

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
                const disciplineChip = renderDisciplineChip(computePlayerDiscipline(p.id, cardsIndex));
                const postes = getPlayerPostesList(p);
                const hasLicence = p.licence && p.licence.trim() !== '' && p.licence.trim() !== '-';

                // Initiales pour l'avatar de la liste (tableau et cartes mobiles)
                const { prenom: pPrenom, nom: pNom } = getPlayerNameParts(p);
                const playerInitials = ((pPrenom || '').charAt(0) + (pNom || '').charAt(0)).toUpperCase()
                    || String(p.name || '?').charAt(0).toUpperCase();

                // --- HTML POUR MOBILE (Cartes) ---
                htmlMobileCards += `
                    <div class="bg-white border ${currentStatus === 'convoke' ? 'border-sky-300 bg-sky-50/20' : 'border-slate-200'} rounded-xl p-3.5 shadow-sm space-y-2.5 mb-2.5">
                        <div class="flex items-start justify-between gap-2">
                            <div class="flex items-start gap-2.5 min-w-0">
                                <span class="conv-avatar" style="--team:${teamHex}" aria-hidden="true">${playerInitials}</span>
                                <div class="min-w-0">
                                <div class="font-bold text-slate-800 text-[13px]">${p.name}${invite ? ' <span class="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">Invité</span>' : ''}${disciplineChip}${carpoolChip(p.id)}</div>
                                <div class="text-[10px] text-slate-400">Poste favori : <span class="font-semibold text-slate-600">${p.poste1 || '-'}</span></div>
                                ${convocationBadgeHtml(convocHistory.history[p.id])}
                                </div>
                            </div>
                            ${invite ? `<button onclick="retirerInviteJoueur('${m.id}', '${p.id}')" class="text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg shrink-0" title="Retirer l'invité"><i class="fa-solid fa-xmark text-xs"></i></button>` : ''}
                        </div>

                        <div class="grid grid-cols-4 gap-1 bg-slate-100 rounded-lg p-0.5">
                            <button onclick="setMatchStatus('${m.id}', '${p.id}', 'convoke')" class="status-btn status-convoke text-center ${currentStatus === 'convoke' ? 'active-convoke' : ''}">Conv.</button>
                            <button onclick="setMatchStatus('${m.id}', '${p.id}', 'nonconvoke')" class="status-btn status-nonconvoke text-center ${currentStatus === 'nonconvoke' ? 'active-nonconvoke' : ''}">Non</button>
                            <button onclick="setMatchStatus('${m.id}', '${p.id}', 'indisponible')" class="status-btn status-indisponible text-center ${currentStatus === 'indisponible' ? 'active-indisponible' : ''}">Indispo</button>
                            <button onclick="setMatchStatus('${m.id}', '${p.id}', 'suspendu')" class="status-btn status-suspendu text-center ${currentStatus === 'suspendu' ? 'active-suspendu' : ''}" title="Suspendu (cartons)">Susp.</button>
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
                        </div>
                    </div>
                `;

                // --- HTML POUR PC (Lignes de tableau classiques) ---
                htmlTableRows += `
                    <tr class="conv-row ${currentStatus === 'convoke' ? 'bg-sky-50/30' : ''} border-b border-slate-100 hover:bg-slate-50/50">
                        <td class="p-3 pl-4">
                            <div class="flex items-start gap-2.5">
                                <span class="conv-avatar conv-avatar-sm" style="--team:${teamHex}" aria-hidden="true">${playerInitials}</span>
                                <div class="min-w-0">
                            <div class="font-bold text-slate-800">${p.name}${invite ? ' <span class="ml-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">Invité</span>' : ''}${disciplineChip}${carpoolChip(p.id)}</div>
                            <div class="text-[10px] text-slate-400">Poste favori : ${p.poste1 || '-'}</div>
                            ${convocationBadgeHtml(convocHistory.history[p.id])}
                                </div>
                            </div>
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
                             <div class="inline-flex rounded-lg border p-0.5 bg-slate-50">
                                 <button onclick="setMatchStatus('${m.id}', '${p.id}', 'convoke')" class="status-btn status-convoke ${currentStatus === 'convoke' ? 'active-convoke' : ''}">Conv.</button>
                                 <button onclick="setMatchStatus('${m.id}', '${p.id}', 'nonconvoke')" class="status-btn status-nonconvoke ${currentStatus === 'nonconvoke' ? 'active-nonconvoke' : ''}">Non</button>
                                 <button onclick="setMatchStatus('${m.id}', '${p.id}', 'indisponible')" class="status-btn status-indisponible ${currentStatus === 'indisponible' ? 'active-indisponible' : ''}">Indispo</button>
                                 <button onclick="setMatchStatus('${m.id}', '${p.id}', 'suspendu')" class="status-btn status-suspendu ${currentStatus === 'suspendu' ? 'active-suspendu' : ''}" title="Suspendu (cartons)">Susp.</button>
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

        