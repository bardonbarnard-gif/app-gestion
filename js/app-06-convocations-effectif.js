/* Rangueil FC - Convocations et fiches joueur/staff
   Partie 6/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
function getTodayStr() {
            return new Date().toISOString().split('T')[0];
        }

        function emptyConvocationStats() {
            return { played: 0, choix: 0, indispo: 0, suspendu: 0, total: 0 };
        }

        function buildConvocationHistory(teamKey) {
            const todayStr = getTodayStr();
            const team = String(teamKey || '').toLowerCase();

            const pastMatches = Object.values(state.matches || {}).filter(m =>
                m && m.date && m.date <= todayStr &&
                String(m.team || '').toLowerCase() === team
            );

            const history = {};
            const records = {};

            pastMatches.forEach(m => {
                const home = parseInt(m.scoreHome, 10);
                const away = parseInt(m.scoreAway, 10);
                const hasScore =
                    m.scoreHome !== undefined && m.scoreHome !== null && String(m.scoreHome).trim() !== '' &&
                    m.scoreAway !== undefined && m.scoreAway !== null && String(m.scoreAway).trim() !== '' &&
                    !isNaN(home) && !isNaN(away);
                const resultKey = !hasScore ? null : home > away ? 'wins' : home === away ? 'draws' : 'losses';

                Object.entries(m.convocations || {}).forEach(([pId, status]) => {
                    // Bilan victoires / nuls / défaites des matchs où le joueur était convoqué
                    if (resultKey && status === 'convoke') {
                        if (!records[pId]) records[pId] = { wins: 0, draws: 0, losses: 0, matches: 0 };
                        records[pId][resultKey]++;
                        records[pId].matches++;
                    }

                    let bucket = null;
                    if (status === 'convoke') bucket = 'played';
                    else if (status === 'nonconvoke') bucket = 'choix';
                    else if (status === 'indisponible') bucket = 'indispo';
                    else if (status === 'suspendu') bucket = 'suspendu';
                    if (!bucket) return;
                    if (!history[pId]) history[pId] = emptyConvocationStats();
                    history[pId][bucket]++;
                    history[pId].total++;
                });
            });

            return { matches: pastMatches, history, records };
        }

        function convocationBadgeHtml(stats) {
            const s = stats || emptyConvocationStats();
            if (!s.total) {
                return `<div class="mt-1 text-[10px] text-slate-400 italic" title="Aucun match passé avec cette équipe">— aucun match</div>`;
            }
            const pct = Math.round((s.played / s.total) * 100);
            const suspendu = s.suspendu || 0;
            const available = s.total - s.indispo - suspendu;
            const dispoPct = Math.round((available / s.total) * 100);
            const selectionPct = available > 0 ? Math.round((s.played / available) * 100) : null;
            return `<div class="flex flex-wrap items-center gap-1 mt-1" title="${s.played} joué(s) · ${s.choix} non convoqué(s) (choix) · ${s.indispo} indisponible(s) · ${suspendu} suspendu(s) sur ${s.total} match(s) passé(s) — disponible sur ${available} match(s)">
                        <span class="px-1.5 py-0.5 rounded border border-sky-100 bg-sky-50 text-sky-700 font-bold">✅ ${s.played}</span>
                        <span class="px-1.5 py-0.5 rounded border border-orange-100 bg-orange-50 text-orange-700 font-bold">🟠 ${s.indispo}</span>
                        <span class="px-1.5 py-0.5 rounded border border-red-100 bg-red-50 text-red-700 font-bold">🚫 ${suspendu}</span>
                        <span class="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 font-bold">⚪ ${s.choix}</span>
                        <span class="text-[10px] font-extrabold text-slate-400" title="Part des matchs joués sur le total">${pct}% joués</span>
                        <span class="text-[10px] font-bold text-orange-600" title="Part des matchs où il était disponible (hors indisponibilité)">${dispoPct}% dispo</span>
                        ${selectionPct !== null ? `<span class="text-[10px] font-bold text-sky-600" title="Part des matchs joués parmi ceux où il était disponible">${selectionPct}% si dispo</span>` : ''}
                    </div>`;
        }

        // Pastilles Victoires / Nuls / Défaites pour un joueur
        function playerRecordBadges(record, options) {
            const r = record || { wins: 0, draws: 0, losses: 0, matches: 0 };
            const compact = !!(options && options.compact);
            if (!r.matches) {
                return compact ? '' : `<span class="text-[10px] text-slate-400 italic">Aucun résultat</span>`;
            }
            const title = `${r.matches} match(s) joué(s) : ${r.wins} victoire(s), ${r.draws} nul(s), ${r.losses} défaite(s)`;
            return `<span class="inline-flex flex-wrap items-center gap-1" title="${title}">
                        <span class="px-1.5 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-emerald-700 text-[10px] font-bold">${r.wins}V</span>
                        <span class="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 text-[10px] font-bold">${r.draws}N</span>
                        <span class="px-1.5 py-0.5 rounded border border-red-100 bg-red-50 text-red-600 text-[10px] font-bold">${r.losses}D</span>
                    </span>`;
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
                .map(({ p, invite }) => ({
                    p,
                    invite,
                    s: data.history[p.id] || emptyConvocationStats(),
                    r: (data.records || {})[p.id] || null
                }))
                .sort((a, b) =>
                    (b.s.played - a.s.played) ||
                    (a.s.choix - b.s.choix) ||
                    a.p.name.localeCompare(b.p.name)
                );

            if (!data.matches.length) {
                container.innerHTML = `
                <div class="card card-pad">
                    <h3 class="card-title"><i class="fa-solid fa-chart-simple"></i>Bilan des convocations et résultats</h3>
                    <p class="card-sub">Aucun match passé pour ${teamName} : le bilan apparaîtra dès le premier match joué.</p>
                </div>`;
                return;
            }

            const rowsHtml = rows.map(({ p, invite, s, r }) => {
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
                            <span class="px-1.5 py-0.5 rounded border border-red-100 bg-red-50 text-red-700 text-[10px] font-bold" title="Suspendu">🚫 ${s.suspendu || 0}</span>
                            <span class="px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 text-[10px] font-bold" title="Non retenu (choix)">⚪ ${s.choix}</span>
                            ${playerRecordBadges(r, { compact: true })}
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
                            <h3 class="card-title"><i class="fa-solid fa-chart-simple"></i>Bilan des convocations et résultats</h3>                                    <p class="card-sub">${teamName} · ${data.matches.length} match(s) passé(s) · ✅ convoqué · 🟠 indispo · 🚫 suspendu · ⚪ choix · V/N/D résultats</p>
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
            const lock = getCompositionLock(state.matches[mId]);
            if (lock) {
                showToast(compositionLockMessage(lock), 'error');
                return;
            }
            const m = state.matches[mId];
            if (!m) return;

            const phase = getActiveCompositionPhase(m);
            const ids = getPhaseBenchPlayers(m, phase).map(p => p.id);
            const from = ids.indexOf(pId);
            if (from === -1) return;

            const to = dir === 'up' ? from - 1 : from + 1;
            if (to < 0 || to >= ids.length) return;

            ids.splice(to, 0, ids.splice(from, 1)[0]);
            setCompositionPhaseBenchOrder(m, phase, ids);

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
                suspendu: ['Susp.', 'bg-red-100 text-red-700 border-red-200'],
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

        // Un joueur suspendu pour ce match ne peut pas être convoqué : son statut
        // est positionné automatiquement (une seule écriture si quelque chose change).
        function applySuspensionStatuses(m, cardsIndex) {
            if (!m) return;
            if (!m.convocations) m.convocations = {};

            const index = cardsIndex || getCardsByPlayerIndex();
            let changed = false;

            getMatchPlayers(m).forEach(({ p }) => {
                if (!isPlayerSuspendedForMatch(p.id, m, index)) return;
                if (m.convocations[p.id] === 'suspendu') return;
                m.convocations[p.id] = 'suspendu';
                changed = true;
            });

            if (changed) saveStateToFirebase();
        }

        function setMatchStatus(mId, pId, status) {
            const match = state.matches[mId];
            if (!match) return;

            // Statut verrouillé sur « Suspendu » quand la suspension vise ce match
            if (status !== 'suspendu' && isPlayerSuspendedForMatch(pId, match)) {
                showToast('Joueur suspendu pour ce match : statut verrouillé sur « Susp. »', 'error');
                return;
            }

            if (!match.convocations) match.convocations = {};
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


            // Vide : retour à la numérotation automatique
            if (!value) {
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

            const currentJerseys = computeMatchJerseys(match);
            const clash = Object.entries(currentJerseys)
                .find(([id, j]) => id !== pId && j.number === number);

            if (clash) {
                const [otherId] = clash;
                const myNumber = currentJerseys[pId]?.number;
                const otherIsStarter = Object.values(match.slotAssignments || {}).includes(otherId);
                const canSwap = myNumber != null && (otherIsStarter
                    ? myNumber >= 1 && myNumber <= 11
                    : myNumber >= 12 && myNumber <= 14);

                // Échange : l'autre joueur récupère le numéro libéré s'il est
                // compatible avec son rôle, sinon il repasse en automatique.
                if (canSwap) {
                    const otherAuto = computeAutoJerseyMap(match)[otherId];
                    if (otherAuto != null && otherAuto === myNumber) {
                        delete match.jerseys[otherId];
                    } else {
                        match.jerseys[otherId] = String(myNumber);
                    }
                    showToast('Numéros ' + myNumber + ' et ' + number + ' échangés');
                } else {
                    delete match.jerseys[otherId];
                    showToast('Numéro ' + number + ' attribué, l\'autre joueur repasse en automatique');
                }

                match.jerseys[pId] = String(number);
                saveStateToFirebase();
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

            // Les compositions prévues référencent aussi des joueurs : on les nettoie.
            COMPOSITION_PLAN_FIELDS.forEach(field => {
                const plan = m[field];
                if (!plan) return;
                Object.keys(plan.slots || {}).forEach(slot => {
                    if (plan.slots[slot] === playerId) delete plan.slots[slot];
                });
                if (Array.isArray(plan.benchOrder)) {
                    plan.benchOrder = plan.benchOrder.filter(id => id !== playerId);
                }
            });

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
                'COMPLEXE SPORTIF STRUXIANO';
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

            table += '<tr class="bg-slate-100 text-slate-700 font-bold text-xs"><td colspan="4" class="p-2 pl-4 uppercase tracking-wider">🎽 Encadrement & Dirigeants</td></tr>';
            mobile += '<div class="bg-slate-100 text-slate-700 font-bold text-xs p-2.5 rounded-lg my-3 uppercase tracking-wider">🎽 Encadrement & Dirigeants</div>';

            if (staff.length === 0) {
                const hint = 'Ajoutez d\'abord coaches et dirigeants dans Effectif → Staff & Dirigeants.';
                table += '<tr><td colspan="4" class="p-2 pl-4 text-[10px] text-slate-400 italic">' + hint + '</td></tr>';
                mobile += '<div class="text-[10px] text-slate-400 italic mb-2">' + hint + '</div>';
            } else {
                const coachRow = (label, field, current) => `
                    <tr class="border-b border-slate-100 bg-slate-50/40">
                        <td class="p-2 pl-4 font-bold text-slate-700 text-xs">${label}</td>
                        <td colspan="3" class="p-2">
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

            table += '<tr class="bg-slate-100 text-slate-700 font-bold text-xs"><td colspan="4" class="p-2 pl-4 uppercase tracking-wider">👥 Dirigeants convoqués</td></tr>';

            table += `
                <tr class="border-b border-slate-100">
                    <td class="p-2 pl-4 font-bold text-slate-700 text-xs">Ajouter</td>
                    <td colspan="3" class="p-2">
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
                            <div class="inline-flex items-center gap-1">
                                <div class="inline-flex rounded-lg border p-0.5 bg-slate-50">
                                    <button onclick="setMatchDirigeantStatus('${m.id}','${id}','convoque')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${d.convoked ? 'active-convoke bg-sky-600 text-white' : 'text-slate-600'}">Oui</button>
                                    <button onclick="setMatchDirigeantStatus('${m.id}','${id}','non')" class="status-btn px-2.5 py-1 text-[11px] font-bold rounded-md ${d.convoked ? 'text-slate-600' : 'active-nonconvoke bg-slate-600 text-white'}">Non</button>
                                </div>
                                <button onclick="retirerMatchDirigeant('${m.id}','${id}')" class="text-red-500 hover:bg-red-50 border border-red-200 p-1.5 rounded-lg" title="Retirer"><i class="fa-solid fa-xmark text-xs"></i></button>
                            </div>
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
    const searchInput = document.getElementById('search-player');
    const q = String(query || (searchInput ? searchInput.value : '') || '')
        .toLowerCase()
        .trim();

    const container = document.getElementById('effectif-full-container');
    if (!container) return;

    const catFilter = String(currentCatFilter || 'all').toLowerCase();
    let visibleCount = 0;

    // On filtre directement les fiches affichées : l'ordre peut changer
    // selon le tri choisi, les index de state.players ne correspondent plus.
    Array.from(container.children).forEach(card => {
        const haystack = String(card.dataset.playerSearch || '').toLowerCase();
        const cardTeam = String(card.dataset.playerTeam || '').toLowerCase();

        const matchText = !q || haystack.includes(q);
        const matchCat = catFilter === 'all' || cardTeam === catFilter;
        const visible = matchText && matchCat;

        // Le rang affiché reste celui du classement complet, même si un
        // filtre masque certains joueurs (pas de renumérotation trompeuse).
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
