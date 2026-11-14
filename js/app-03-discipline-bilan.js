/* Rangueil FC - Discipline (cartons) et ecran Bilan
   Partie 3/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
const CARD_SUSPENSION_THRESHOLD = 3;
        const CARD_WINDOW_MONTHS = 3;

        // Toujours à minuit local : une date de carton et une date de match doivent
        // être comparées au jour près, sinon le match du jour du carton passe pour le suivant.
        function parseCardMatchDate(value) {
            if (!value) return null;
            const parts = String(value).split('-');
            if (parts.length < 3) return null;
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (!y || !m || !d) return null;
            const date = new Date(y, m - 1, d);
            return isNaN(date.getTime()) ? null : date;
        }

        function atStartOfDay(date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate());
        }

        function addDaysToDate(date, days) {
            const d = atStartOfDay(date);
            d.setDate(d.getDate() + days);
            return d;
        }

        // Ajoute des mois en bloquant le jour sur la fin du mois cible (31/11 + 3 mois → 28/02)
        function addMonthsClamped(date, months) {
            const d = atStartOfDay(date);
            const day = d.getDate();
            d.setDate(1);
            d.setMonth(d.getMonth() + months);
            const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            d.setDate(Math.min(day, lastDay));
            return d;
        }

        function formatCardDate(date) {
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        }

        function shortCardDate(date) {
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
        }

        // Seuls le championnat et la coupe comptent pour la suspension (pas les amicaux)
        function isSuspensionMatch(match) {
            const type = ((match && match.type) || '').toLowerCase();
            return type === 'championnat' || type === 'coupe';
        }

        function getCardsByPlayerIndex() {
            const index = new Map();

            Object.entries(state.cards || {}).forEach(([matchId, matchCards]) => {
                if (!matchCards) return;
                const match = state.matches ? state.matches[matchId] : null;
                const date = match ? parseCardMatchDate(match.date) : null;

                Object.entries(matchCards).forEach(([playerId, cardType]) => {
                    if (cardType !== 'yellow' && cardType !== 'red') return;
                    if (!index.has(playerId)) index.set(playerId, []);
                    index.get(playerId).push({
                        type: cardType,
                        matchId,
                        date,
                        team: match ? (match.team || '') : '',
                        opponent: match ? (match.opponent || '') : '',
                        official: isSuspensionMatch(match)
                    });
                });
            });

            return index;
        }

        // Prochain match officiel de l'équipe, strictement après la date du 3e jaune
        function getNextOfficialMatchForTeam(team, afterDate) {
            if (!team) return null;
            const teamKey = team.toLowerCase();
            let best = null;

            Object.values(state.matches || {}).forEach(match => {
                if (!match || !isSuspensionMatch(match)) return;
                if ((match.team || '').toLowerCase() !== teamKey) return;
                const date = parseCardMatchDate(match.date);
                if (!date || date <= afterDate) return;
                if (!best || date < best.date) {
                    best = { date, opponent: match.opponent || '', type: match.type || '', id: match.id };
                }
            });

            return best;
        }

        // À chaque carton, on regarde les 3 mois qui précèdent :
        // au 3e jaune la suspension tombe sur le match officiel suivant et le compteur repart à zéro.
        function computePlayerDiscipline(playerId, cardsIndex, referenceDate) {
            const today = atStartOfDay(referenceDate || new Date());
            const index = cardsIndex || getCardsByPlayerIndex();
            const entries = (index.get(playerId) || []).filter(e => e.official && e.date);

            const yellowEvents = entries
                .filter(e => e.type === 'yellow')
                .sort((a, b) => a.date - b.date);

            const redCards = entries
                .filter(e => e.type === 'red' && today <= addMonthsClamped(e.date, CARD_WINDOW_MONTHS))
                .sort((a, b) => b.date - a.date);

            let counted = [];
            let lastSuspension = null;

            yellowEvents.forEach(event => {
                const windowStart = addMonthsClamped(event.date, -CARD_WINDOW_MONTHS);
                counted = counted.filter(card => card.date >= windowStart);
                counted.push(event);

                if (counted.length >= CARD_SUSPENSION_THRESHOLD) {
                    lastSuspension = {
                        trigger: event,
                        target: getNextOfficialMatchForTeam(event.team, event.date)
                    };
                    // Les 3 cartons sont consommés par la suspension
                    counted = [];
                }
            });

            // Cartons encore actifs aujourd'hui (le carton sort le lendemain de son anniversaire 3 mois)
            const activeCards = counted
                .filter(card => today <= addMonthsClamped(card.date, CARD_WINDOW_MONTHS))
                .sort((a, b) => a.date - b.date);

            let suspension = null;
            if (lastSuspension) {
                const target = lastSuspension.target;
                if (!target) {
                    suspension = { pendingCalendar: true, trigger: lastSuspension.trigger, target: null };
                } else if (target.date >= today) {
                    suspension = { pendingCalendar: false, trigger: lastSuspension.trigger, target };
                }
            }

            const oldestActive = activeCards[0] || null;

            return {
                activeCards,
                count: activeCards.length,
                suspension,
                redCards,
                atRisk: !suspension && activeCards.length >= CARD_SUSPENSION_THRESHOLD - 1,
                expiresOn: oldestActive ? addMonthsClamped(oldestActive.date, CARD_WINDOW_MONTHS) : null
            };
        }

        function disciplineGaugeHTML(count, tone) {
            const capped = Math.min(count, CARD_SUSPENSION_THRESHOLD);
            const onClass = tone === 'danger' ? 'bg-red-600' : tone === 'warning' ? 'bg-orange-500' : 'bg-slate-400';
            return [0, 1, 2].map(i =>
                `<span class="inline-block w-2 h-2 rounded-full ${i < capped ? onClass : 'bg-slate-200'}"></span>`
            ).join('');
        }

        // Suspension effective pour ce match précis (le 3e jaune cible le match suivant)
        function isPlayerSuspendedForMatch(playerId, match, cardsIndex) {
            if (!match) return false;
            const disc = computePlayerDiscipline(playerId, cardsIndex || getCardsByPlayerIndex());
            if (!disc.suspension || !disc.suspension.target) return false;
            return disc.suspension.target.id === match.id;
        }

        // Repère compact affiché dans les listes (convocations, banc)
        function renderDisciplineChip(disc, short) {
            if (!disc) return '';

            if (disc.suspension) {
                const target = disc.suspension.target;
                const title = disc.suspension.pendingCalendar || !target
                    ? 'Suspendu : aucun match à venir programmé'
                    : `Suspendu pour le match du ${formatCardDate(target.date)}${target.opponent ? ' vs ' + target.opponent : ''}`;
                return short
                    ? `<span class="ml-1 align-middle text-[10px]" title="${title}">🚫</span>`
                    : `<span class="ml-1 inline-flex items-center align-middle px-1.5 py-0.5 rounded border border-red-200 bg-red-100 text-red-800 text-[9px] font-extrabold uppercase" title="${title}">🚫 Suspendu</span>`;
            }

            if (disc.redCards.length > 0) {
                const last = disc.redCards[0];
                const title = `Carton rouge le ${formatCardDate(last.date)}${last.opponent ? ' (' + last.opponent + ')' : ''} — durée de suspension fixée par la commission`;
                return short
                    ? `<span class="ml-1 align-middle text-[10px]" title="${title}">🟥</span>`
                    : `<span class="ml-1 inline-flex items-center align-middle px-1.5 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 text-[9px] font-extrabold uppercase" title="${title}">🟥 À vérifier</span>`;
            }

            if (disc.atRisk) {
                const dates = disc.activeCards.map(c => `${shortCardDate(c.date)} ${c.opponent}`).join(', ');
                const title = `${disc.count} jaune(s) sur 3 mois${dates ? ' — ' + dates : ''} — un 3e jaune = suspension du match suivant`;
                return short
                    ? `<span class="ml-1 align-middle text-[10px]" title="${title}">⚠️ ${disc.count}/3</span>`
                    : `<span class="ml-1 inline-flex items-center align-middle px-1.5 py-0.5 rounded border border-orange-200 bg-orange-100 text-orange-800 text-[9px] font-extrabold uppercase" title="${title}">⚠️ ${disc.count}/3</span>`;
            }

            return '';
        }

        // --- Vue détaillée des cartons (depuis la carte du tableau de bord) ---
        // Périmètre identique au compteur du tableau de bord :
        //  - coach : uniquement les cartons de ses matchs
        //  - autres rôles : tous les matchs (comme getTotalTeamCards)
        function getDashboardCardsLeaderboard() {
            const role = window.currentUserRole || 'public';
            const userTeam = (window.currentUserTeam || 'all').toLowerCase();
            const coachMode = role === 'coach';

            const playersById = new Map(state.players.map(p => [p.id, p]));
            const totals = new Map();

            Object.entries(state.cards || {}).forEach(([matchId, matchCards]) => {
                if (!matchCards) return;

                if (coachMode) {
                    const match = state.matches[matchId];
                    if (!match) return;
                    if ((match.team || '').toLowerCase() !== userTeam) return;
                }

                Object.entries(matchCards).forEach(([playerId, cardType]) => {
                    if (cardType !== 'yellow' && cardType !== 'red') return;

                    if (!totals.has(playerId)) {
                        totals.set(playerId, { yellows: 0, reds: 0 });
                    }

                    const counts = totals.get(playerId);
                    if (cardType === 'yellow') counts.yellows++;
                    else counts.reds++;
                });
            });

            const rows = [...totals.entries()].map(([playerId, counts]) => {
                const player = playersById.get(playerId);
                return {
                    id: playerId,
                    name: player ? player.name : 'Joueur supprimé',
                    deleted: !player,
                    team: player ? (player.team || player.cat || '') : '',
                    yellows: counts.yellows,
                    reds: counts.reds,
                    total: counts.yellows + counts.reds
                };
            });

            // Du plus sanctionné au moins sanctionné, puis les rouges d'abord à égalité
            rows.sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                if (b.reds !== a.reds) return b.reds - a.reds;
                return a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
            });

            // Les totaux sont la somme exacte de la liste : cohérence garantie avec la carte
            const yellows = rows.reduce((sum, r) => sum + r.yellows, 0);
            const reds = rows.reduce((sum, r) => sum + r.reds, 0);

            return { rows, yellows, reds };
        }

        function renderDisciplineAlertHTML(row, kind) {
            const d = row.discipline;
            const today = atStartOfDay(new Date());
            const gauge = kind === 'suspended'
                ? disciplineGaugeHTML(CARD_SUSPENSION_THRESHOLD, 'danger')
                : kind === 'risk'
                    ? disciplineGaugeHTML(d.count, 'warning')
                    : disciplineGaugeHTML(CARD_SUSPENSION_THRESHOLD, 'danger');

            const countLabel = kind === 'suspended'
                ? '<span class="text-[10px] font-extrabold text-red-700">3/3</span>'
                : kind === 'risk'
                    ? `<span class="text-[10px] font-extrabold text-orange-700">${d.count}/3</span>`
                    : '<span class="text-[10px] font-extrabold text-red-700">🟥</span>';

            let body = '';

            if (kind === 'suspended') {
                const target = d.suspension.target;
                const when = d.suspension.pendingCalendar || !target
                    ? 'Aucun match à venir programmé : suspension en attente de calendrier'
                    : `Absent du match du ${formatCardDate(target.date)}${target.opponent ? ' vs ' + target.opponent : ''}`;
                body = `<p class="text-[11px] font-bold text-red-700">${when}</p>
                        <p class="text-[10px] text-slate-500">3e jaune le ${formatCardDate(d.suspension.trigger.date)} · compteur remis à zéro après ce match</p>`;
            } else if (kind === 'risk') {
                // Un 3e jaune tomberait sur le prochain match : la suspension viserait celui d'après
                const team = row.team || '';
                const upcoming = getNextOfficialMatchForTeam(team, addDaysToDate(today, -1));
                const afterNext = upcoming ? getNextOfficialMatchForTeam(team, upcoming.date) : null;

                let consequence;
                if (upcoming && afterNext) {
                    consequence = `Un 3e jaune le ${formatCardDate(upcoming.date)} (${upcoming.opponent}) = absent le ${formatCardDate(afterNext.date)} (${afterNext.opponent})`;
                } else if (upcoming) {
                    consequence = `Un 3e jaune le ${formatCardDate(upcoming.date)} = absent du match suivant`;
                } else {
                    consequence = 'Un 3e jaune = absent du match suivant (aucun match programmé)';
                }

                body = `<p class="text-[11px] text-slate-600">${d.activeCards.map(c => `${shortCardDate(c.date)} ${c.opponent}`).join(' · ')}</p>
                        <p class="text-[11px] font-bold text-orange-700">${consequence}</p>
                        ${d.expiresOn ? `<p class="text-[10px] text-slate-500">Le 1er carton sort des comptes le ${formatCardDate(addDaysToDate(d.expiresOn, 1))}</p>` : ''}`;
            } else {
                const last = d.redCards[0];
                body = `<p class="text-[11px] text-slate-600">Rouge le ${formatCardDate(last.date)}${last.opponent ? ' (' + last.opponent + ')' : ''}</p>
                        <p class="text-[11px] font-bold text-red-700">Durée de suspension fixée par la commission</p>`;
            }

            const borderClass = kind === 'suspended' ? 'border-red-200' : kind === 'risk' ? 'border-orange-200' : 'border-slate-200';

            return `<div class="bg-white rounded-lg border ${borderClass} p-2.5 space-y-1">
                <div class="flex items-center justify-between gap-2">
                    <p class="font-bold text-xs text-slate-800 truncate">${row.name}</p>
                    <span class="shrink-0 inline-flex items-center gap-1">${gauge}${countLabel}</span>
                </div>
                ${body}
            </div>`;
        }

        function renderDashboardCards() {
            const listEl = document.getElementById('dashboard-cards-list');
            if (!listEl) return;

            const { rows, yellows, reds } = getDashboardCardsLeaderboard();
            const total = yellows + reds;

            const cardsIndex = getCardsByPlayerIndex();
            rows.forEach(row => {
                row.discipline = computePlayerDiscipline(row.id, cardsIndex);
            });

            const suspendedRows = rows.filter(r => r.discipline.suspension);
            const atRiskRows = rows.filter(r => r.discipline.atRisk && !r.discipline.suspension);
            const redRows = rows.filter(r => r.discipline.redCards.length > 0 && !r.discipline.suspension);

            const totalEl = document.getElementById('dashboard-cards-total');
            if (totalEl) totalEl.innerText = total;

            const detailEl = document.getElementById('dashboard-cards-detail');
            if (detailEl) detailEl.innerHTML = `${yellows} 🟨 · ${reds} 🟥`;

            const subtitleEl = document.getElementById('dashboard-cards-subtitle');
            if (subtitleEl) {
                if (rows.length === 0) {
                    subtitleEl.innerText = 'Aucun joueur sanctionné';
                } else {
                    const parts = [`${rows.length} joueur${rows.length > 1 ? 's' : ''} sanctionné${rows.length > 1 ? 's' : ''}`];
                    if (suspendedRows.length) parts.push(`${suspendedRows.length} suspendu${suspendedRows.length > 1 ? 's' : ''}`);
                    if (atRiskRows.length) parts.push(`${atRiskRows.length} sous la menace`);
                    subtitleEl.innerText = parts.join(' · ');
                }
            }

            // Bandeau d'alerte : suspendus, joueurs à 2/3, rouges à vérifier
            const alertsEl = document.getElementById('dashboard-cards-alerts');
            if (alertsEl) {
                const blocks = [];

                if (suspendedRows.length) {
                    blocks.push(`
                        <div class="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
                            <p class="text-[10px] font-extrabold uppercase tracking-wider text-red-700"><i class="fa-solid fa-ban mr-1" aria-hidden="true"></i>Suspendu${suspendedRows.length > 1 ? 's' : ''} pour le prochain match</p>
                            ${suspendedRows.map(r => renderDisciplineAlertHTML(r, 'suspended')).join('')}
                        </div>`);
                }

                if (atRiskRows.length) {
                    blocks.push(`
                        <div class="rounded-xl border border-orange-200 bg-orange-50 p-3 space-y-2">
                            <p class="text-[10px] font-extrabold uppercase tracking-wider text-orange-700"><i class="fa-solid fa-triangle-exclamation mr-1" aria-hidden="true"></i>Sous la menace · 2 jaunes sur 3</p>
                            ${atRiskRows.map(r => renderDisciplineAlertHTML(r, 'risk')).join('')}
                        </div>`);
                }

                if (redRows.length) {
                    blocks.push(`
                        <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                            <p class="text-[10px] font-extrabold uppercase tracking-wider text-slate-600"><i class="fa-solid fa-square text-red-600 mr-1" aria-hidden="true"></i>Cartons rouges à vérifier</p>
                            ${redRows.map(r => renderDisciplineAlertHTML(r, 'red')).join('')}
                        </div>`);
                }

                alertsEl.innerHTML = blocks.join('');
            }

            if (rows.length === 0) {
                listEl.innerHTML = `
                    <div class="p-6 text-center">
                        <i class="fa-solid fa-square-check text-emerald-500 text-2xl" aria-hidden="true"></i>
                        <p class="mt-2 text-xs font-bold text-slate-700">Aucun carton enregistré</p>
                        <p class="mt-1 text-[11px] text-slate-500">Les cartons saisis dans le bilan d'un match apparaîtront ici.</p>
                    </div>`;
                return;
            }

            listEl.innerHTML = rows.map((r, i) => {
                const d = r.discipline;
                const distinctCards = [
                    r.yellows > 0 ? `<span class="text-amber-600">${r.yellows}🟨</span>` : '',
                    r.reds > 0 ? `<span class="text-red-600">${r.reds}🟥</span>` : ''
                ].filter(Boolean).join(' ');

                const tone = d.suspension ? 'danger' : d.atRisk ? 'warning' : 'neutral';
                const rankClass = d.suspension ? 'bg-red-600' : d.atRisk ? 'bg-orange-500' : 'bg-slate-700';
                const countClass = d.suspension ? 'text-red-700' : d.atRisk ? 'text-orange-700' : 'text-slate-500';
                const gaugeCount = d.suspension ? CARD_SUSPENSION_THRESHOLD : d.count;
                const teamLabel = r.team ? `<span class="uppercase">${r.team}</span>` : '';
                const datesLine = d.activeCards.length
                    ? d.activeCards.map(c => `${shortCardDate(c.date)} ${c.opponent}`).join(' · ')
                    : '';

                return `
                    <div class="flex items-center justify-between gap-2 px-3 py-2.5 ${d.suspension ? 'bg-red-50' : ''}">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 shrink-0 rounded-full ${rankClass} text-white text-[11px] font-extrabold flex items-center justify-center" title="Rang ${i + 1}">${i + 1}</span>
                            <div class="min-w-0">
                                <p class="font-bold text-xs truncate ${r.deleted ? 'text-slate-400 italic' : 'text-slate-800'}">${r.name}</p>
                                <p class="text-[10px] text-slate-400">${distinctCards}${teamLabel ? ' · ' + teamLabel : ''}</p>
                                ${datesLine ? `<p class="text-[10px] text-slate-500">${datesLine}</p>` : ''}
                            </div>
                        </div>
                        <div class="shrink-0 text-right space-y-0.5">
                            <div class="flex items-center justify-end gap-1">
                                ${disciplineGaugeHTML(gaugeCount, tone)}
                                <span class="text-[10px] font-extrabold ${countClass}">${gaugeCount}/3</span>
                            </div>
                            <p class="text-[10px] font-bold text-slate-400">${r.total} au total</p>
                        </div>
                    </div>`;
            }).join('');
        }

        function openDashboardCards() {
            renderDashboardCards();

            const dashboardSec = document.getElementById('sec-dashboard');
            const cardsSec = document.getElementById('sec-dashboard-cards');

            if (dashboardSec) dashboardSec.classList.add('hidden');
            if (!cardsSec) return;

            cardsSec.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function closeDashboardCards() {
            const dashboardSec = document.getElementById('sec-dashboard');
            const cardsSec = document.getElementById('sec-dashboard-cards');

            if (cardsSec) cardsSec.classList.add('hidden');
            if (dashboardSec) dashboardSec.classList.remove('hidden');

            renderDashboard();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.openDashboardCards = openDashboardCards;
        window.closeDashboardCards = closeDashboardCards;

        // --- Écran Bilan (depuis la tuile V-N-D du tableau de bord) ---
        const BILAN_COMPETITIONS = ['Championnat', 'Coupe', 'Amical'];
        // null = pas encore choisi : l'écran s'ouvrira sur l'équipe par défaut
        let bilanTeamFilter = null;
        let bilanFilterOwner = null;

        const BILAN_RESULT_STYLE = {
            V: { soft: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600', bar: 'bg-emerald-500' },
            N: { soft: 'bg-slate-200 text-slate-700', text: 'text-slate-600', bar: 'bg-slate-400' },
            D: { soft: 'bg-red-100 text-red-700', text: 'text-red-600', bar: 'bg-red-500' }
        };

        function normalizeBilanType(type) {
            const t = (type || '').toLowerCase();
            if (t === 'championnat') return 'Championnat';
            if (t === 'coupe') return 'Coupe';
            if (t === 'amical') return 'Amical';
            return 'Autre';
        }

        function isMatchPlayed(match) {
            if (!match) return false;
            const h = match.scoreHome;
            const a = match.scoreAway;
            if (h === undefined || h === null || h === '' || a === undefined || a === null || a === '') return false;
            return !isNaN(parseInt(h)) && !isNaN(parseInt(a));
        }

        // scoreHome = buts de notre équipe, scoreAway = buts de l'adversaire
        function computeBilanStats(matches) {
            const played = (matches || [])
                .filter(isMatchPlayed)
                .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

            let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;

            const results = played.map(match => {
                const scored = parseInt(match.scoreHome);
                const conceded = parseInt(match.scoreAway);
                goalsFor += scored;
                goalsAgainst += conceded;

                const result = scored > conceded ? 'V' : scored === conceded ? 'N' : 'D';
                if (result === 'V') wins++;
                else if (result === 'N') draws++;
                else losses++;

                return { match, result, scored, conceded };
            });

            const count = played.length;

            return {
                played: count,
                results,
                wins, draws, losses,
                goalsFor, goalsAgainst,
                diff: goalsFor - goalsAgainst,
                winPct: count ? Math.round((wins / count) * 100) : null,
                avgFor: count ? goalsFor / count : null,
                avgAgainst: count ? goalsAgainst / count : null,
                streak: results.slice(-5).map(r => r.result)
            };
        }

        function formatOneDecimal(value) {
            if (value === null || value === undefined) return '—';
            return value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        }

        function formatDiff(value) {
            return value > 0 ? '+' + value : String(value);
        }

        // Uniquement les équipes qui ont réellement des matchs en base
        function getBilanTeamOptions() {
            const keys = new Set();
            Object.values(state.matches || {}).forEach(m => { if (m && m.team) keys.add(m.team); });
            return [...keys].sort((a, b) => getBilanTeamLabel(a).localeCompare(getBilanTeamLabel(b), 'fr'));
        }

        function getBilanTeamLabel(teamKey) {
            return state.teams?.[teamKey]?.name || String(teamKey || '').toUpperCase();
        }

        // Équipe affichée à l'ouverture : celle du compte, sinon la plus active
        function getDefaultBilanTeam() {
            const options = getBilanTeamOptions();
            const userTeam = window.currentUserTeam;

            if (userTeam && userTeam !== 'all' && options.includes(userTeam)) return userTeam;

            let best = 'all';
            let bestPlayed = 0;
            options.forEach(team => {
                const played = Object.values(state.matches || {})
                    .filter(m => (m.team || '') === team && isMatchPlayed(m)).length;
                if (played > bestPlayed) {
                    bestPlayed = played;
                    best = team;
                }
            });

            return best;
        }

        function bilanBarHTML(stats) {
            if (!stats.played) return '<div class="h-2 rounded-full bg-slate-100"></div>';
            const width = (n) => Math.round((n / stats.played) * 100);
            return `<div class="h-2 rounded-full overflow-hidden flex bg-slate-100">
                ${stats.wins ? `<span class="${BILAN_RESULT_STYLE.V.bar}" style="width:${width(stats.wins)}%"></span>` : ''}
                ${stats.draws ? `<span class="${BILAN_RESULT_STYLE.N.bar}" style="width:${width(stats.draws)}%"></span>` : ''}
                ${stats.losses ? `<span class="${BILAN_RESULT_STYLE.D.bar}" style="width:${width(stats.losses)}%"></span>` : ''}
            </div>`;
        }

        function bilanStreakHTML(stats, dark) {
            if (!stats.streak.length) return '';
            const pills = stats.streak.map(r =>
                `<span class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold ${dark ? 'bg-white/25 text-white' : BILAN_RESULT_STYLE[r].soft}">${r}</span>`
            ).join('');
            const label = stats.streak.length > 1 ? `${stats.streak.length} derniers` : 'dernier';
            return `<div class="flex items-center gap-1">
                <span class="text-[9px] font-extrabold uppercase mr-1 ${dark ? 'opacity-90' : 'text-slate-400'}">${label}</span>
                ${pills}
            </div>`;
        }

        function renderBilanGlobal(stats, title) {
            const cell = (value, label) => `<div class="bg-white/20 rounded-lg py-1.5 text-center">
                <p class="text-base font-extrabold drop-shadow-sm">${value}</p>
                <p class="text-[9px] font-bold uppercase opacity-90">${label}</p>
            </div>`;

            return `
            <div class="grad-card grad-card-emerald">
                <div class="grad-card-content space-y-2.5">
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-[10px] font-extrabold uppercase tracking-wider opacity-90">${title || 'Global'}</p>
                            <p class="text-2xl font-extrabold drop-shadow-sm">${stats.played} <span class="text-xs font-bold opacity-90">match${stats.played > 1 ? 's' : ''} joué${stats.played > 1 ? 's' : ''}</span></p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-xl font-extrabold drop-shadow-sm">${stats.winPct === null ? '—' : stats.winPct + '%'}</p>
                            <p class="text-[9px] font-bold uppercase opacity-90">victoires</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-1.5">
                        ${cell(stats.wins, 'Victoires')}
                        ${cell(stats.draws, 'Nuls')}
                        ${cell(stats.losses, 'Défaites')}
                    </div>

                    <div class="grid grid-cols-3 gap-1.5">
                        ${cell(stats.goalsFor + ' ⚽', 'Marqués')}
                        ${cell(stats.goalsAgainst + ' 🥅', 'Encaissés')}
                        ${cell(formatDiff(stats.diff), 'Différence')}
                    </div>

                    <p class="text-[10px] font-bold opacity-90">Moyenne : ${formatOneDecimal(stats.avgFor)} marqués · ${formatOneDecimal(stats.avgAgainst)} encaissés par match</p>
                    ${bilanStreakHTML(stats, true)}
                </div>
            </div>`;
        }

        function renderBilanCompetitionCard(type, stats, totalMatches) {
            const tile = (value, label, classes) => `<div class="${classes} rounded-lg py-1 text-center">
                <p class="text-sm font-extrabold">${value}</p>
                <p class="text-[9px] font-bold uppercase opacity-80">${label}</p>
            </div>`;

            const diffClass = stats.diff > 0 ? 'text-emerald-600' : stats.diff < 0 ? 'text-red-600' : 'text-slate-600';
            const remaining = totalMatches - stats.played;

            return `
            <div class="bg-white rounded-xl card-shadow border border-slate-100 p-3 space-y-2">
                <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                        <p class="text-sm font-bold text-slate-800 truncate">${type}</p>
                        <p class="text-[10px] text-slate-400">${stats.played} joué${stats.played > 1 ? 's' : ''}${remaining > 0 ? ` sur ${totalMatches} programmé${totalMatches > 1 ? 's' : ''}` : ''}</p>
                    </div>
                    <span class="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${stats.winPct === null ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}">${stats.winPct === null ? '—' : stats.winPct + '% V'}</span>
                </div>

                ${stats.played ? `
                <div class="grid grid-cols-3 gap-1.5">
                    ${tile(stats.wins, 'V', 'bg-emerald-50 border border-emerald-100 text-emerald-700')}
                    ${tile(stats.draws, 'N', 'bg-slate-50 border border-slate-200 text-slate-700')}
                    ${tile(stats.losses, 'D', 'bg-red-50 border border-red-100 text-red-700')}
                </div>
                ${bilanBarHTML(stats)}
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-600">
                    <span>${stats.goalsFor} ⚽</span>
                    <span>${stats.goalsAgainst} 🥅</span>
                    <span class="${diffClass}">${formatDiff(stats.diff)}</span>
                    <span class="text-slate-400 font-semibold">moy. ${formatOneDecimal(stats.avgFor)} / ${formatOneDecimal(stats.avgAgainst)}</span>
                </div>
                ${bilanStreakHTML(stats, false)}
                ` : `<p class="text-[11px] text-slate-400 italic py-1">Aucun match joué dans cette compétition.</p>`}
            </div>`;
        }

        function renderBilanMatches(matches, showTeam) {
            const container = document.getElementById('bilan-matches');
            if (!container) return;

            const played = (matches || [])
                .filter(isMatchPlayed)
                .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

            if (!played.length) {
                container.innerHTML = `<p class="p-6 text-center text-xs text-slate-400 italic">Aucun match joué pour ce filtre.</p>`;
                return;
            }

            const groups = {};
            played.forEach(match => {
                const key = normalizeBilanType(match.type);
                (groups[key] = groups[key] || []).push(match);
            });

            const order = BILAN_COMPETITIONS.concat('Autre').filter(t => groups[t] && groups[t].length);

            container.innerHTML = order.map(type => {
                const rows = groups[type].map(match => {
                    const scored = parseInt(match.scoreHome);
                    const conceded = parseInt(match.scoreAway);
                    const result = scored > conceded ? 'V' : scored === conceded ? 'N' : 'D';
                    const style = BILAN_RESULT_STYLE[result];
                    const dateValue = parseCardMatchDate(match.date);
                    const dateLabel = dateValue ? formatCardDate(dateValue) : '--/--/----';
                    const where = (match.location || '').toLowerCase().startsWith('ext') ? 'extérieur' : 'domicile';

                    return `<div class="flex items-center justify-between gap-2 px-3 py-2">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="w-6 h-6 shrink-0 rounded-lg ${style.soft} text-[10px] font-extrabold flex items-center justify-center">${result}</span>
                            <div class="min-w-0">
                                <p class="font-bold text-xs text-slate-800 truncate">${match.opponent || 'Adversaire'}</p>
                                <p class="text-[10px] text-slate-400">${dateLabel} · ${where}${showTeam ? ' · ' + getBilanTeamLabel(match.team) : ''}</p>
                            </div>
                        </div>
                        <p class="shrink-0 text-xs font-extrabold ${style.text}">${scored} - ${conceded}</p>
                    </div>`;
                }).join('');

                return `<div class="flex items-center gap-2 px-3 pt-3 pb-1">
                    <span class="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">${type} (${groups[type].length})</span>
                    <span class="flex-1 h-px bg-slate-200"></span>
                </div>${rows}`;
            }).join('');
        }

        function renderDashboardBilan() {
            const role = window.currentUserRole || 'public';

            // Changement de compte (rôle ou équipe) : on repart de l'équipe du compte
            const owner = `${role}|${window.currentUserTeam || 'all'}`;
            if (bilanFilterOwner !== owner) {
                bilanFilterOwner = owner;
                bilanTeamFilter = null;
            }

            // Premier affichage : on part sur l'équipe du compte plutôt que sur un total club
            if (bilanTeamFilter === null) bilanTeamFilter = getDefaultBilanTeam();

            // Un coach ne voit que son équipe : filtre forcé sans écraser le choix des autres rôles
            const activeFilter = role === 'coach' ? (window.currentUserTeam || 'all') : bilanTeamFilter;

            const allMatches = Object.values(state.matches || {});

            // Filtre par équipe (masqué pour un coach, qui ne voit que la sienne)
            const filterEl = document.getElementById('bilan-team-filter');
            if (filterEl) {
                if (role === 'coach') {
                    filterEl.innerHTML = '';
                } else {
                    const options = [{ key: 'all', label: 'Toutes' }]
                        .concat(getBilanTeamOptions().map(t => ({ key: t, label: getBilanTeamLabel(t) })));
                    filterEl.innerHTML = options.map(option => {
                        const active = activeFilter === option.key;
                        return `<button onclick="setBilanTeamFilter('${option.key}')" class="px-3 py-1.5 rounded-lg border text-xs font-bold transition ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 active:bg-slate-100'}">${option.label}</button>`;
                    }).join('');
                }
            }

            const scoped = activeFilter === 'all'
                ? allMatches
                : allMatches.filter(m => (m.team || '') === activeFilter);

            const globalEl = document.getElementById('bilan-global');
            if (globalEl) {
                const title = activeFilter === 'all' ? 'Global' : getBilanTeamLabel(activeFilter);
                globalEl.innerHTML = renderBilanGlobal(computeBilanStats(scoped), title);
            }

            const competitionsEl = document.getElementById('bilan-competitions');
            if (competitionsEl) {
                const byType = {};
                scoped.forEach(match => {
                    const key = normalizeBilanType(match.type);
                    (byType[key] = byType[key] || []).push(match);
                });

                const types = BILAN_COMPETITIONS.concat('Autre').filter(t => byType[t] && byType[t].length);
                competitionsEl.innerHTML = types.length
                    ? types.map(t => renderBilanCompetitionCard(t, computeBilanStats(byType[t]), byType[t].length)).join('')
                    : `<div class="bg-white rounded-xl card-shadow border border-slate-100 p-4 text-center text-xs text-slate-400 italic">Aucun match pour cette équipe.</div>`;
            }

            renderBilanMatches(scoped, activeFilter === 'all');
        }

        function setBilanTeamFilter(teamKey) {
            bilanTeamFilter = teamKey;
            renderDashboardBilan();
        }

        function openDashboardBilan() {
            renderDashboardBilan();

            const dashboardSec = document.getElementById('sec-dashboard');
            const bilanSec = document.getElementById('sec-dashboard-bilan');

            if (dashboardSec) dashboardSec.classList.add('hidden');
            if (!bilanSec) return;

            bilanSec.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function closeDashboardBilan() {
            const dashboardSec = document.getElementById('sec-dashboard');
            const bilanSec = document.getElementById('sec-dashboard-bilan');

            if (bilanSec) bilanSec.classList.add('hidden');
            if (dashboardSec) dashboardSec.classList.remove('hidden');

            renderDashboard();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.openDashboardBilan = openDashboardBilan;
        window.closeDashboardBilan = closeDashboardBilan;
        window.setBilanTeamFilter = setBilanTeamFilter;

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
            const h = parseInt(scoreHome), a = parseInt(scoreAway);
            if (h > a) return '<span class="px-2.5 py-1 rounded text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">VICTOIRE 🟢</span>';
            if (h < a) return '<span class="px-2.5 py-1 rounded text-xs font-black bg-red-100 text-red-800 border border-red-300">DÉFAITE 🔴</span>';
            return '<span class="px-2.5 py-1 rounded text-xs font-black bg-slate-900 text-white border border-slate-700">MATCH NUL ⬛</span>';
        }


// Prochain match du tableau de bord : sert au bouton « Gérer les convocations »
// pour ouvrir la page Matchs déjà positionnée sur ce match.
function pickNextMatch(matchesArr) {
    const todayStr = new Date().toISOString().split('T')[0];
    const future = (matchesArr || []).filter(m => m.date >= todayStr && (m.scoreHome === undefined || m.scoreHome === ''));
    return future.length > 0 ? future[0] : (matchesArr.length > 1 ? matchesArr[1] : null);
}

function openNextMatchConvocations() {
    const role = window.currentUserRole || 'public';
    const userTeam = window.currentUserTeam || 'all';

    const matchesArr = (role === 'coach'
        ? Object.values(state.matches || {}).filter(m =>
            (m.team || '').toLowerCase() === userTeam.toLowerCase()
          )
        : Object.values(state.matches || {})
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    const nextMatch = pickNextMatch(matchesArr);

    // switchTab('matchs') remet la sélection à zéro : on choisit le match après.
    switchTab('matchs');

    if (!nextMatch) {
        showToast('Aucun match programmé : choisis un match dans la liste', 'error');
        switchMatchSubTab('convocations');
        return;
    }

    state.selectedMatchId = nextMatch.id;
    const selector = document.getElementById('match-selector');
    if (selector) selector.value = nextMatch.id;

    switchMatchSubTab('convocations');
}

window.openNextMatchConvocations = openNextMatchConvocations;

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
    `<span class="text-emerald-100">${wins}V</span><span class="opacity-50 px-1">·</span><span class="text-white">${draws}N</span><span class="opacity-50 px-1">·</span><span class="text-rose-100">${losses}D</span>`;

            
            const teamCards =
    role === 'coach'
        ? getTeamCards(dashboardMatches)
        : getTotalTeamCards();
document.getElementById('stat-total-cards').innerHTML = `<span>${teamCards.yellows}🟨</span> <span>${teamCards.reds}🟥</span>`;

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
            const lastMatch = past.length > 0 ? past[past.length - 1] : matchesArr[0];
            const nextMatch = pickNextMatch(matchesArr);

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

            // Si la vue détaillée des cartons est ouverte, la garder à jour
            const cardsView = document.getElementById('sec-dashboard-cards');
            if (cardsView && !cardsView.classList.contains('hidden')) {
                renderDashboardCards();
            }

            // Idem pour la vue Bilan
            const bilanView = document.getElementById('sec-dashboard-bilan');
            if (bilanView && !bilanView.classList.contains('hidden')) {
                renderDashboardBilan();
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


        // Périmètre des statistiques du tableau de bord :
        //  - coach : uniquement son équipe
        //  - responsable : ses équipes
        //  - autres rôles : tout le club
        function getDashboardStatsRows() {
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

            // Convocations et victoires : agrégées sur tous les matchs passés du club.
            const todayStr = getTodayStr();
            const matchTotals = {};

            Object.values(state.matches || {}).forEach(m => {
                if (!m || !m.date || m.date > todayStr) return;

                const home = parseInt(m.scoreHome, 10);
                const away = parseInt(m.scoreAway, 10);
                const hasScore =
                    m.scoreHome !== undefined && m.scoreHome !== null && String(m.scoreHome).trim() !== '' &&
                    m.scoreAway !== undefined && m.scoreAway !== null && String(m.scoreAway).trim() !== '' &&
                    !isNaN(home) && !isNaN(away);

                Object.entries(m.convocations || {}).forEach(([pId, status]) => {
                    if (status !== 'convoke' && status !== 'nonconvoke' && status !== 'indisponible' && status !== 'suspendu') return;
                    // Un match où il était suspendu n'est pas une occasion de sélection
                    if (status === 'suspendu') return;
                    if (!matchTotals[pId]) {
                        matchTotals[pId] = { convoked: 0, opportunities: 0, wins: 0, draws: 0, losses: 0, matches: 0 };
                    }
                    const t = matchTotals[pId];
                    t.opportunities++;
                    if (status !== 'convoke') return;
                    t.convoked++;
                    if (!hasScore) return;
                    t.matches++;
                    if (home > away) t.wins++;
                    else if (home === away) t.draws++;
                    else t.losses++;
                });
            });

            return playersSource.map(p => {
                const s = state.stats[p.id] || { goals: 0, assists: 0 };
                const goals = s.goals || 0;
                const assists = s.assists || 0;
                const totals = matchTotals[p.id] || { convoked: 0, opportunities: 0, wins: 0, draws: 0, losses: 0, matches: 0 };

                return {
                    id: p.id,
                    name: p.name,
                    team: p.team || p.cat || '',
                    goals,
                    assists,
                    total: goals + assists,
                    convoked: totals.convoked,
                    convocationRate: totals.opportunities ? Math.round((totals.convoked / totals.opportunities) * 100) : 0,
                    wins: totals.wins,
                    draws: totals.draws,
                    losses: totals.losses,
                    matches: totals.matches,
                    winRate: totals.matches ? Math.round((totals.wins / totals.matches) * 100) : 0
                };
            });
        }

        // Classements complets : buts, passes décisives, efficacité (buts + passes),
        // convocations et victoires (ces deux derniers calculés depuis les matchs passés).
        const DASHBOARD_STATS_KINDS = {
            scorers: {
                label: 'Buteurs',
                icon: 'fa-futbol',
                key: 'goals',
                unit: '⚽',
                totalLabel: 'buts marqués',
                badge: 'bg-amber-100 text-amber-800',
                hero: 'grad-card-blue'
            },
            passers: {
                label: 'Passeurs',
                icon: 'fa-handshake',
                key: 'assists',
                unit: '🎯',
                totalLabel: 'passes décisives',
                badge: 'bg-sky-100 text-sky-800',
                hero: 'grad-card-sky'
            },
            efficiency: {
                label: 'Efficacité',
                icon: 'fa-bolt',
                key: 'total',
                unit: '⚡',
                totalLabel: 'buts + passes',
                badge: 'bg-emerald-100 text-emerald-800',
                hero: 'grad-card-emerald'
            },
            convocations: {
                label: 'Convoqués',
                icon: 'fa-clipboard-check',
                key: 'convoked',
                unit: '📋',
                totalLabel: 'convocations',
                badge: 'bg-sky-100 text-sky-800',
                hero: 'grad-card-sky'
            },
            winners: {
                label: 'Vainqueurs',
                icon: 'fa-trophy',
                key: 'wins',
                unit: '🏆',
                totalLabel: 'victoires',
                badge: 'bg-emerald-100 text-emerald-800',
                hero: 'grad-card-emerald'
            }
        };

        let dashboardStatsKind = 'scorers';

        function dashboardStatsSortedRows(kind) {
            const key = (DASHBOARD_STATS_KINDS[kind] || DASHBOARD_STATS_KINDS.scorers).key;

            return getDashboardStatsRows().sort((a, b) => {
                if (b[key] !== a[key]) return b[key] - a[key];
                // À égalité : le meilleur taux départage (convocations / victoires).
                if (kind === 'convocations' && b.convocationRate !== a.convocationRate) {
                    return b.convocationRate - a.convocationRate;
                }
                if (kind === 'winners' && b.winRate !== a.winRate) {
                    return b.winRate - a.winRate;
                }
                return b.goals - a.goals
                    || b.assists - a.assists
                    || String(a.name || '').localeCompare(String(b.name || ''), 'fr', { sensitivity: 'base' });
            });
        }

        function dashboardTopRowHTML(p, i, key, badgeClass, unit) {
            return `
                <div class="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs"><span class="font-bold text-slate-700 truncate">${i+1}. ${p.name}</span><span class="shrink-0 ml-2 ${badgeClass} font-extrabold px-2 py-0.5 rounded">${p[key]} ${unit}</span></div>`;
        }

        function renderTopScorersAndPassers() {
            const scorersEl = document.getElementById('dashboard-top-scorers');
            if (scorersEl) {
                scorersEl.innerHTML = dashboardStatsSortedRows('scorers')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'goals', 'bg-amber-100 text-amber-800', '⚽'))
                    .join('');
            }

            const passersEl = document.getElementById('dashboard-top-passers');
            if (passersEl) {
                passersEl.innerHTML = dashboardStatsSortedRows('passers')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'assists', 'bg-sky-100 text-sky-800', '🎯'))
                    .join('');
            }

            const efficiencyEl = document.getElementById('dashboard-top-efficiency');
            if (efficiencyEl) {
                efficiencyEl.innerHTML = dashboardStatsSortedRows('efficiency')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'total', 'bg-emerald-100 text-emerald-800', '⚡'))
                    .join('');
            }

            const convocationsEl = document.getElementById('dashboard-top-convocations');
            if (convocationsEl) {
                convocationsEl.innerHTML = dashboardStatsSortedRows('convocations')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'convoked', 'bg-sky-100 text-sky-800', '📋'))
                    .join('');
            }

            const winnersEl = document.getElementById('dashboard-top-wins');
            if (winnersEl) {
                winnersEl.innerHTML = dashboardStatsSortedRows('winners')
                    .slice(0, 3)
                    .map((p, i) => dashboardTopRowHTML(p, i, 'wins', 'bg-emerald-100 text-emerald-800', '🏆'))
                    .join('');
            }
        }

        // --- Vue détaillée des classements (depuis les cartes du tableau de bord) ---
        