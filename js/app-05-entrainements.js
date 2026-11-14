/* Rangueil FC - Entrainements, presence et seances type
   Partie 5/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
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
        clearPlayerInjuryFlag(player, state.trainings[currentTrainingId].date);
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
        clearPlayerInjuryFlag(player, state.trainings[currentTrainingId].date);
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

    // Matchs à venir d'abord (chronologiques), déjà joués à la fin
    matches = sortMatchesUpcomingFirst(matches);

    if (matches.length === 0) {
        container.innerHTML = `
            <div class="p-4 text-center text-slate-400 text-xs">
                Aucun match enregistré.
            </div>`;
        return;
    }

    const upcomingMatches = matches.filter(m => !matchHasBeenPlayed(m));
    const playedMatches = matches.filter(m => matchHasBeenPlayed(m));

    const sectionTitle = (label, icon, count) => `
        <div class="flex items-center gap-2 pt-1">
            <span class="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500"><i class="fa-solid ${icon} mr-1"></i>${label}</span>
            <span class="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-extrabold">${count}</span>
            <span class="flex-1 h-px bg-slate-200"></span>
        </div>`;

    const renderMatchCard = (m) => {
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

                // Match passé ou score déjà saisi
                const isMatchPassed = matchHasBeenPlayed(m);

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
            };

    container.innerHTML =
        (upcomingMatches.length ? sectionTitle('À venir', 'fa-clock', upcomingMatches.length) + upcomingMatches.map(renderMatchCard).join('') : '') +
        (playedMatches.length ? sectionTitle('Déjà joués', 'fa-flag-checkered', playedMatches.length) + playedMatches.map(renderMatchCard).join('') : '');
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
/* ---------- Blessures : durée calculée depuis les appels ---------- */

function toDateKey(value) {
    if (!value || typeof value !== 'string') return null;
    const key = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
}

function dateKeyToDate(key) {
    if (!key) return null;
    const parts = key.split('-').map(Number);
    if (parts.length !== 3 || parts.some(n => !Number.isFinite(n))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

function todayDateKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function injuryDays(startKey, endKey) {
    const start = dateKeyToDate(startKey);
    const end = dateKeyToDate(endKey);
    if (!start || !end) return null;
    return Math.max(0, Math.round((end - start) / 86400000));
}

function formatInjuryDuration(days, short) {
    if (days === null || days === undefined || Number.isNaN(days)) return '';
    if (days <= 0) return short ? '< 1 j' : 'moins d’un jour';
    if (days < 14) return `${days}${short ? ' j' : (days > 1 ? ' jours' : ' jour')}`;
    if (days < 60) {
        const weeks = Math.round(days / 7);
        return `${weeks}${short ? ' sem.' : ' semaines'}`;
    }
    return `${Math.round(days / 30.4375)} mois`;
}

function formatInjuryDay(key) {
    const date = dateKeyToDate(key);
    return date ? date.toLocaleDateString('fr-FR') : '';
}

// Un joueur redevient disponible : on efface le drapeau « blessé » de sa fiche.
function clearPlayerInjuryFlag(player, returnDate) {
    if (!player || player.blessure !== true) return;
    const sessionDate = toDateKey(returnDate);
    if (sessionDate && sessionDate > todayDateKey()) return;
    player.blessure = false;
    player.blessureDateDebut = null;
    player.blessureRetour = toDateKey(returnDate) || todayDateKey();
}

// Reconstitue les épisodes de blessure à partir des appels d'entraînement :
// un épisode s'ouvre sur un statut « blessé » et se referme au premier autre statut.
function getPlayerInjuryInfo(player) {
    const result = { isInjured: false, current: null, past: [], hasAny: false, lastPast: null };
    if (!player) return result;

    const today = todayDateKey();
    const teamKey = (player.team || player.cat || '').toLowerCase();
    const entries = [];

    Object.values(state.trainings || {}).forEach(session => {
        if (!session || !session.date) return;
        if ((session.team || '').toLowerCase() !== teamKey) return;
        const status = session.presence && session.presence[player.id];
        const date = toDateKey(session.date);
        if (!status || !date) return;
        // Une séance future pré-remplie ne doit pas clore une blessure en cours.
        if (date > today) return;
        entries.push({ date, status });
    });

    entries.sort((a, b) => a.date.localeCompare(b.date));

    let spells = [];
    let openSpell = null;

    entries.forEach(entry => {
        if (entry.status === 'blesse') {
            if (!openSpell) openSpell = { start: entry.date, end: null };
            return;
        }
        if (openSpell) {
            openSpell.end = entry.date;
            spells.push(openSpell);
            openSpell = null;
        }
    });

    if (openSpell) spells.push(openSpell);

    // Drapeau « blessé » de la fiche : on ne le retient que s'il apporte une info plus récente
    // que le dernier appel (sinon c'est un ancien statut resté bloqué, ex. appel groupé).
    const startFlag = toDateKey(player.blessureDateDebut);
    if (player.blessure === true && startFlag) {
        const lastEntryDate = entries.length ? entries[entries.length - 1].date : null;
        const alreadyOpen = spells.some(spell => !spell.end);
        if (!alreadyOpen && (!lastEntryDate || startFlag > lastEntryDate)) {
            spells.push({ start: startFlag, end: null });
        }
    }

    // Une date de retour enregistrée referme une blessure encore ouverte (une date
    // future annonce juste le retour, elle ne doit pas déclarer le joueur guéri).
    const returnDate = toDateKey(player.blessureRetour);
    if (returnDate && returnDate <= today) {
        spells = spells.map(spell =>
            (!spell.end && (!spell.start || spell.start <= returnDate))
                ? { ...spell, end: returnDate }
                : spell
        );
    }

    const decorated = spells
        .filter(spell => spell.start)
        .sort((a, b) => a.start.localeCompare(b.start))
        .map(spell => ({
            start: spell.start,
            end: spell.end || null,
            ongoing: !spell.end,
            days: injuryDays(spell.start, spell.end || today)
        }));

    const current = decorated.find(spell => spell.ongoing) || null;
    const past = decorated.filter(spell => !spell.ongoing);
    const flagOnly = player.blessure === true && decorated.length === 0;

    return {
        isInjured: !!current || flagOnly,
        current: current || (flagOnly ? { start: null, end: null, ongoing: true, days: null } : null),
        past,
        hasAny: decorated.length > 0 || flagOnly,
        lastPast: past.length ? past[past.length - 1] : null
    };
}

function renderInjuryBadge(info) {
    if (!info) return '';

    if (info.current) {
        const duration = formatInjuryDuration(info.current.days, true);
        const since = info.current.start ? ` depuis le ${formatInjuryDay(info.current.start)}` : '';
        const title = `Blessé${since}${duration ? ` · ${formatInjuryDuration(info.current.days, false)}` : ''}`;
        return `<span class="injury-badge is-active" title="${title}">🤕 ${duration ? 'Blessé · ' + duration : 'Blessé'}</span>`;
    }

    const last = info.lastPast;
    if (last) {
        const duration = formatInjuryDuration(last.days, true);
        if (!duration) return '';
        const title = `Blessé du ${formatInjuryDay(last.start)} au ${formatInjuryDay(last.end)} · ${formatInjuryDuration(last.days, false)}`;
        return `<span class="injury-badge is-past" title="${title}">🤕 Guéri · ${duration}</span>`;
    }

    return '';
}

function formatPlayerInjuryHistory(info) {
    if (!info || !info.hasAny) return '—';

    const all = [];
    if (info.current) all.push(info.current);
    all.push(...(info.past || []));
    all.sort((a, b) => (b.start || '').localeCompare(a.start || ''));

    const parts = all.slice(0, 3).map(spell => {
        const duration = formatInjuryDuration(spell.days, false);
        if (!spell.start) return `en cours${duration ? ' · ' + duration : ''}`;
        if (spell.ongoing) return `depuis le ${formatInjuryDay(spell.start)} · ${duration}`;
        return `${formatInjuryDay(spell.start)} → ${formatInjuryDay(spell.end)} · ${duration}`;
    });

    if (all.length > 3) parts.push(`+${all.length - 3} autre(s)`);

    return parts.join('<br>');
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

    const suspendus =
        squad.filter(
            p => m.convocations[p.id] === 'suspendu'
        );

    let text =
        `🔵⚪ *RANGUEIL FC - CONVOCATION* ⚪🔵\n\n`;

    text +=
        `🏆 *${m.type || 'Championnat'}*\n`;

    text +=
        `🆚 *${m.opponent}*\n\n`;

    text +=
    `📅 *Date :* ${formatDateFr(m.date)}\n`;

    // Covoiturage : le lien n'a de sens que pour un déplacement (pas à domicile)
    if (m.location !== 'Domicile') {

        text +=
            `🚗 *Covoiturage — répondez en 30 secondes chrono :*\n`;

        text +=
            `https://app-gestion-git-main-rangueil.vercel.app/covoiturage.html?id=${m.carpoolId}\n\n`;

    }

    if (
        m.location === 'Domicile'
    ) {

        text +=
            `🏠 *MATCH À DOMICILE*\n\n`;

        text +=
            `📍 *Lieu de rendez-vous :*\n`;

        // Match à domicile : rendez-vous au complexe Struxiano (l'ancien libellé
        // Rangueil est encore présent sur les matchs déjà enregistrés)
        const homeMeetingPlace =
            m.meetingPlace && m.meetingPlace !== 'COMPLEXE SPORTIF RANGUEIL'
                ? m.meetingPlace
                : 'COMPLEXE SPORTIF STRUXIANO';

        text +=
            `${homeMeetingPlace}\n\n`;

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

text +=
    `☝️ *Seuls les joueurs convoqués ci-dessous répondent au covoiturage.*\n\n`;

    }

    text +=
        `🕐 *Rendez-vous :* ${getRdvHeure(m) || '--'}\n`;

    text +=
        `⚽ *Coup d'envoi :* ${m.heure || '--'}\n\n`;

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

    if (suspendus.length > 0) {
        text += `\n🚫 *Suspendus (${suspendus.length})*\n\n`;
        suspendus.forEach((p, idx) => {
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
        //   suspendu = suspendu pour ce match (cartons)
        // ============================================================
        