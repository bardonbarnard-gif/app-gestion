/* Rangueil FC - Terrain de composition : postes, maillots et partage
   Partie 12/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
function getPosteLabel(code) {
    if (!code) return '';
    const key = String(code).trim();
    return POSTE_LIBELLES[key] || key;
}


    /* ============================================================
       TERRAIN DE COMPOSITION — tracé, joueurs, numérotation
       ============================================================ */

    const PITCH_W = 68;   // largeur, touche à touche (m)
    const PITCH_L = 105;  // longueur, but à but (m)

    const SLOT_LABELS = {
        GB: 'Gardien',
        DG: 'Latéral gauche',
        DD: 'Latéral droit',
        DC1: 'Défenseur central gauche',
        DC2: 'Défenseur central',
        DC3: 'Défenseur central droit',
        MG: 'Milieu gauche',
        MD: 'Milieu droit',
        MC1: 'Milieu central',
        MC2: 'Milieu central',
        MC3: 'Milieu central',
        MDF: 'Milieu défensif',
        MDF1: 'Milieu défensif gauche',
        MDF2: 'Milieu défensif droit',
        MOG: 'Ailier gauche',
        MOD: 'Ailier droit',
        MOC: 'Meneur offensif',
        AT1: 'Attaquant gauche',
        AT2: 'Attaquant droit',
        BU: 'Buteur',
        AG: 'Ailier gauche',
        AD: 'Ailier droit'
    };

    // Défense à 2 centraux : défenseur central gauche (DCG) / droit (DCD).
    // Défense à 3 centraux : DCG / DC (au milieu) / DCD.
    function centralDefenderLabels(formation) {
        const count = getFormationSlots(formation || '433')
            .filter(s => s.slot === 'DC1' || s.slot === 'DC2' || s.slot === 'DC3')
            .length;

        if (count >= 3) {
            return {
                DC1: 'Défenseur central gauche',
                DC2: 'Défenseur central',
                DC3: 'Défenseur central droit'
            };
        }

        return {
            DC1: 'Défenseur central gauche',
            DC2: 'Défenseur central droit'
        };
    }

    function getSlotLabel(slot, formation) {
        if (slot === 'DC1' || slot === 'DC2' || slot === 'DC3') {
            const labels = centralDefenderLabels(formation);
            if (labels[slot]) return labels[slot];
        }
        return SLOT_LABELS[slot] || slot;
    }

    const TEAM_HEX = {
        sky: '#0ea5e9', blue: '#3b82f6', indigo: '#6366f1', violet: '#8b5cf6',
        purple: '#a855f7', fuchsia: '#d946ef', pink: '#ec4899', rose: '#f43f5e',
        red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
        lime: '#84cc16', green: '#22c55e', emerald: '#10b981', teal: '#14b8a6',
        cyan: '#06b6d4', slate: '#64748b', gray: '#6b7280', zinc: '#71717a',
        neutral: '#737373', stone: '#78716c',
        skyDark: '#0369a1', blueDark: '#1d4ed8'
    };

    function getTeamHex(teamKey) {
        const color = state.teams?.[teamKey]?.color || 'slate';
        return TEAM_HEX[color] || TEAM_HEX[String(color).replace(/Dark$/, '')] || '#475569';
    }

    // Tracé du terrain : dessiné dans un repère « longueur verticale »
    // (x = largeur 68 m, y = longueur 105 m), puis pivoté pour l'affichage PC.
    function buildPitchSVG(orientation) {
        const W = PITCH_W;
        const L = PITCH_L;
        const isPortrait = orientation === 'portrait';
        const uid = isPortrait ? 'p' : 'l';
        const line = 'rgba(255,255,255,.82)';
        const sw = 0.3;

        let stripes = '';
        const bands = 12;
        for (let i = 0; i < bands; i++) {
            const h = L / bands;
            stripes += '<rect x="0" y="' + (i * h).toFixed(2) + '" width="' + W + '" height="' + (h + 0.06).toFixed(2) + '" fill="' + (i % 2 ? '#37b24d' : '#2f9e44') + '"/>';
        }

        const boxW = 40.32;
        const boxD = 16.5;
        const goalW = 18.32;
        const goalD = 5.5;
        const spot = 11;
        const bx = (W - boxW) / 2;
        const gx = (W - goalW) / 2;
        const mouth = (W - 7.32) / 2;

        const body =
            stripes +
            '<g fill="none" stroke="' + line + '" stroke-width="' + sw + '">' +
                '<rect x="' + (sw / 2) + '" y="' + (sw / 2) + '" width="' + (W - sw) + '" height="' + (L - sw) + '"/>' +
                '<line x1="0" y1="' + (L / 2) + '" x2="' + W + '" y2="' + (L / 2) + '"/>' +
                '<circle cx="' + (W / 2) + '" cy="' + (L / 2) + '" r="9.15"/>' +
                '<rect x="' + bx + '" y="0" width="' + boxW + '" height="' + boxD + '"/>' +
                '<rect x="' + bx + '" y="' + (L - boxD) + '" width="' + boxW + '" height="' + boxD + '"/>' +
                '<rect x="' + gx + '" y="0" width="' + goalW + '" height="' + goalD + '"/>' +
                '<rect x="' + gx + '" y="' + (L - goalD) + '" width="' + goalW + '" height="' + goalD + '"/>' +
                '<path d="M0 1 A1 1 0 0 1 1 0"/>' +
                '<path d="M' + (W - 1) + ' 0 A1 1 0 0 1 ' + W + ' 1"/>' +
                '<path d="M' + W + ' ' + (L - 1) + ' A1 1 0 0 1 ' + (W - 1) + ' ' + L + '"/>' +
                '<path d="M1 ' + L + ' A1 1 0 0 1 0 ' + (L - 1) + '"/>' +
            '</g>' +
            '<circle cx="' + (W / 2) + '" cy="' + (L / 2) + '" r="0.42" fill="' + line + '"/>' +
            '<circle cx="' + (W / 2) + '" cy="' + spot + '" r="0.42" fill="' + line + '"/>' +
            '<circle cx="' + (W / 2) + '" cy="' + (L - spot) + '" r="0.42" fill="' + line + '"/>' +
            '<defs>' +
                '<clipPath id="pc-' + uid + '-a"><rect x="0" y="' + boxD + '" width="' + W + '" height="' + (L - boxD) + '"/></clipPath>' +
                '<clipPath id="pc-' + uid + '-b"><rect x="0" y="0" width="' + W + '" height="' + (L - boxD) + '"/></clipPath>' +
            '</defs>' +
            '<g fill="none" stroke="' + line + '" stroke-width="' + sw + '">' +
                '<circle cx="' + (W / 2) + '" cy="' + spot + '" r="9.15" clip-path="url(#pc-' + uid + '-a)"/>' +
                '<circle cx="' + (W / 2) + '" cy="' + (L - spot) + '" r="9.15" clip-path="url(#pc-' + uid + '-b)"/>' +
            '</g>' +
            '<g fill="rgba(255,255,255,.12)" stroke="' + line + '" stroke-width="' + sw + '">' +
                '<rect x="' + mouth + '" y="0" width="7.32" height="1.7"/>' +
                '<rect x="' + mouth + '" y="' + (L - 1.7) + '" width="7.32" height="1.7"/>' +
            '</g>' +
            // Filets des buts
            '<g stroke="rgba(255,255,255,.45)" stroke-width="0.16">' +
            Array.from({ length: 7 }, (_, i) => {
                const x = mouth + (i * 7.32) / 6;
                return '<line x1="' + x + '" y1="0" x2="' + x + '" y2="1.7"/>' +
                       '<line x1="' + x + '" y1="' + (L - 1.7) + '" x2="' + x + '" y2="' + L + '"/>';
            }).join('') +
            Array.from({ length: 2 }, (_, i) => {
                const y = (i + 1) * 0.56;
                return '<line x1="' + mouth + '" y1="' + y + '" x2="' + (mouth + 7.32) + '" y2="' + y + '"/>' +
                       '<line x1="' + mouth + '" y1="' + (L - y) + '" x2="' + (mouth + 7.32) + '" y2="' + (L - y) + '"/>';
            }).join('') +
            '</g>';

        if (isPortrait) {
            return '<svg class="pitch-svg md:hidden" viewBox="0 0 ' + W + ' ' + L + '" preserveAspectRatio="none" aria-hidden="true">' + body + '</svg>';
        }

        return '<svg class="pitch-svg hidden md:block" viewBox="0 0 ' + L + ' ' + W + '" preserveAspectRatio="none" aria-hidden="true">' +
            '<g transform="translate(' + L + ',0) rotate(90)">' + body + '</g>' +
            '</svg>';
    }

    // Numérotation classique : un numéro par poste, selon le système de jeu.
    const FORMATION_JERSEYS = {
        // 4-3-3 : meneur offensif (le plus haut) 10, relayeur 8, milieu défensif 6
        '433':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MC1: 6, MC2: 10, MC3: 8, AG: 11, BU: 9, AD: 7 },
        '442':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MG: 11, MC1: 6, MC2: 8, MD: 7, AT1: 9, AT2: 10 },
        '352':  { GB: 1, DC1: 4, DC2: 5, DC3: 6, MG: 2, MC1: 8, MC2: 10, MC3: 11, MD: 3, AT1: 9, AT2: 7 },
        '4231': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MDF1: 6, MDF2: 8, MOG: 11, MOC: 10, MOD: 7, BU: 9 },
        '4141': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MDF: 6, MG: 11, MC1: 8, MC2: 10, MD: 7, BU: 9 },
        '451':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MG: 11, MC1: 6, MC2: 10, MC3: 8, MD: 7, BU: 9 },
        '343':  { GB: 1, DC1: 4, DC2: 5, DC3: 6, MG: 2, MC1: 8, MC2: 10, MD: 3, AG: 11, BU: 9, AD: 7 },
        '532':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DC3: 6, DD: 2, MC1: 8, MC2: 10, MC3: 7, AT1: 9, AT2: 11 },
        '541':  { GB: 1, DG: 3, DC1: 4, DC2: 5, DC3: 6, DD: 2, MG: 11, MC1: 8, MC2: 10, MD: 7, BU: 9 },
        '4312': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MC1: 6, MC2: 8, MC3: 11, MOC: 10, AT1: 9, AT2: 7 },
        '4222': { GB: 1, DG: 3, DC1: 4, DC2: 5, DD: 2, MDF1: 6, MDF2: 8, MOG: 11, MOD: 7, AT1: 9, AT2: 10 }
    };

    // Utilisé seulement si un poste inconnu apparaît dans une formation
    const SLOT_JERSEY = {
        GB: 1, DD: 2, DG: 3, DC1: 4, DC2: 5, DC3: 6,
        MDF: 6, MDF1: 6, MDF2: 8, MC1: 6, MC2: 10, MC3: 8,
        MOC: 10, MD: 7, MG: 11, MOD: 7, MOG: 11, AD: 7, AG: 11,
        BU: 9, AT1: 9, AT2: 10
    };

    // Numéros automatiques : titulaires selon leur poste, banc 12-14
    function computeAutoJerseyMap(match, options) {
        const skip = options?.skip || new Set();
        const map = {};
        if (!match) return map;

        const formationKey = match.currentFormation || '433';
        const slots = getFormationSlots(formationKey);
        const table = FORMATION_JERSEYS[formationKey] || FORMATION_JERSEYS['433'];
        const assigned = match.slotAssignments || {};
        const used = new Set(options?.reserved || []);

        const firstFree = () => {
            for (let n = 1; n <= 11; n++) if (!used.has(n)) return n;
            return null;
        };

        slots.forEach(s => {
            const pid = assigned[s.slot];
            if (!pid || skip.has(pid) || map[pid] != null) return;

            let number = table[s.slot];
            if (!number || used.has(number)) number = SLOT_JERSEY[s.slot];
            if (!number || used.has(number)) number = firstFree();
            if (number == null) return;

            used.add(number);
            map[pid] = number;
        });

        // Trois remplaçants au maximum sur la feuille : 12, 13 puis 14,
        // dans l'ordre du banc. Au-delà, pas de numéro.
        const targetConvoked = parseInt(state.teams?.[match.team]?.targetConvocations) || 14;
        const maxSubs = Math.min(3, Math.max(0, targetConvoked - 11));

        let nextBench = 12;
        const autoBench = getCompositionBenchPlayers(match).filter(p => !skip.has(p.id));
        autoBench.forEach((p, i) => {
            if (i >= maxSubs) {
                map[p.id] = null;
                return;
            }
            while (nextBench <= 14 && used.has(nextBench)) nextBench++;
            if (nextBench > 14) {
                map[p.id] = null;
                return;
            }
            map[p.id] = nextBench;
            used.add(nextBench);
            nextBench++;
        });

        return map;
    }

    // Numéros affichés : titulaires 1-11, remplaçants 12-14, surcharge manuelle encadrée
    function computeMatchJerseys(match) {
        const assignedIds = Object.values(match?.slotAssignments || {});
        const manualNumbers = {};
        const reserved = new Set();

        // Les surcharges manuelles valides sont réservées en premier : les
        // numéros automatiques ne peuvent donc plus les prendre, ce qui permet
        // d'échanger deux numéros sans jamais créer de doublon.
        Object.entries(match?.jerseys || {}).forEach(([pid, value]) => {
            const n = parseInt(value, 10);
            if (!n) return;
            const starter = assignedIds.includes(pid);
            const min = starter ? 1 : 12;
            const max = starter ? 11 : 14;
            if (n < min || n > max || reserved.has(n)) return;
            reserved.add(n);
            manualNumbers[pid] = n;
        });

        const autoMap = computeAutoJerseyMap(match, {
            reserved: reserved,
            skip: new Set(Object.keys(manualNumbers))
        });
        const out = {};

        Object.entries(autoMap).forEach(([pid, number]) => {
            out[pid] = { number: number, auto: true, duplicate: false, ignored: false };
        });

        const assigned = Object.values(match?.slotAssignments || {});
        const used = new Set(
            Object.values(out).map(j => j.number).filter(n => n != null)
        );

        Object.entries(match?.jerseys || {}).forEach(([pid, value]) => {
            const n = parseInt(value, 10);
            if (!n) return;

            const starter = assigned.includes(pid);
            const min = starter ? 1 : 12;
            const max = starter ? 11 : 14;

            if (!out[pid]) out[pid] = { number: null, auto: false, duplicate: false, ignored: false };

            // Le numéro déjà attribué automatiquement : on garde l'automatique
            if (out[pid].number === n) return;

            // Hors de la plage du rôle, ou déjà pris ailleurs : on ignore la surcharge
            if (n < min || n > max || used.has(n)) {
                out[pid].ignored = true;
                return;
            }

            if (out[pid].number != null) used.delete(out[pid].number);

            out[pid].number = n;
            out[pid].auto = false;
            used.add(n);
        });

        const counts = {};
        Object.values(out).forEach(j => {
            if (j.number != null) counts[j.number] = (counts[j.number] || 0) + 1;
        });
        Object.values(out).forEach(j => {
            j.duplicate = j.number != null && counts[j.number] > 1;
        });

        return out;
    }

    function getJerseyNumber(match, playerId) {
        const jersey = computeMatchJerseys(match)[playerId];
        return jersey && jersey.number != null ? jersey.number : '';
    }

    const FORMATIONS = [
        { key: '433', label: '4-3-3' },
        { key: '442', label: '4-4-2' },
        { key: '352', label: '3-5-2' },
        { key: '4231', label: '4-2-3-1' },
        { key: '4141', label: '4-1-4-1' },
        { key: '451', label: '4-5-1' },
        { key: '343', label: '3-4-3' },
        { key: '532', label: '5-3-2' },
        { key: '541', label: '5-4-1' },
        { key: '4312', label: '4-3-1-2' },
        { key: '4222', label: '4-2-2-2' }
    ];

    // Mini-terrain du sélecteur de formation : attaque vers la droite
    function formationMiniPitch(system) {
        const dots = getFormationSlots(system).map(pos =>
            `<circle cx="${(100 - pos.y).toFixed(1)}" cy="${pos.x.toFixed(1)}" r="4.6"/>`
        ).join('');

        return `<svg class="comp-form-pitch" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g fill="#fff">${dots}</g></svg>`;
    }

    // Abréviation d'un poste : DCG / DC / DCD pour les centraux, MDF2 -> MDF
    function slotAbbreviation(slot, formation) {
        if (slot === 'DC1') return 'DCG';
        if (slot === 'DC2') return centralDefenderLabels(formation).DC3 ? 'DC' : 'DCD';
        if (slot === 'DC3') return 'DCD';
        return String(slot || '').replace(/\d+$/, '');
    }

    const JERSEY_PATH = 'M25 6 Q32 12 39 6 L52 13 L58 29 L46 35 L46 58 Q46 62 42 62 L22 62 Q18 62 18 58 L18 35 L6 29 L12 13 Z';

    // Un numéro doit rester lisible : on choisit blanc ou encre selon la clarté du maillot
    function isLightColor(hex) {
        const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
        if (!m) return false;
        const n = parseInt(m[1], 16);
        const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
    }

    function jerseyMarkup(teamHex, number, duplicate) {
        const ink = isLightColor(teamHex) ? '#0f172a' : '#ffffff';
        return `
            <span class="jersey-box" style="color:${teamHex}" data-ink="${ink}">
                <svg viewBox="0 0 64 64" class="jersey-svg" aria-hidden="true">
                    <defs>
                        <linearGradient id="jersey-light" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stop-color="#ffffff" stop-opacity=".32"/>
                            <stop offset=".55" stop-color="#ffffff" stop-opacity="0"/>
                            <stop offset="1" stop-color="#000000" stop-opacity=".22"/>
                        </linearGradient>
                        <clipPath id="jersey-clip"><path d="${JERSEY_PATH}"/></clipPath>
                    </defs>
                    <path d="${JERSEY_PATH}" fill="currentColor" stroke="rgba(15,23,42,.35)" stroke-width="2"/>
                    <path d="${JERSEY_PATH}" fill="url(#jersey-light)"/>
                    <g clip-path="url(#jersey-clip)" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width="1.6">
                        <path d="M25 7 Q32 14 39 7"/>
                        <path d="M18 34 L18 60"/>
                        <path d="M46 34 L46 60"/>
                    </g>
                    <path d="${JERSEY_PATH}" fill="none" stroke="rgba(255,255,255,.28)" stroke-width=".8"/>
                </svg>
                <span class="jersey-num" style="color:${ink};text-shadow:0 1px 2px ${ink === '#ffffff' ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.45)'}">${number != null && number !== '' ? number : ''}</span>
                ${duplicate ? '<span class="jersey-dup" title="Numéro en double">!</span>' : ''}
            </span>`;
    }

    // Une place qui n'existe plus dans la formation courante doit renvoyer le joueur au banc
    function pruneSlotAssignments(match) {
        if (!match) return;

        const valid = new Set(
            getFormationSlots(match.currentFormation || '433').map(s => s.slot)
        );

        Object.keys(match.slotAssignments || {}).forEach(slot => {
            if (!valid.has(slot)) delete match.slotAssignments[slot];
        });
    }

    // Liste « poste + numéro » de la composition, prête à envoyer (WhatsApp, SMS…)
    function buildCompositionShareText(match) {
        if (!match) return '';

        const squadById = new Map(getMatchPlayers(match).map(item => [item.p.id, item.p]));
        const jerseys = computeMatchJerseys(match);
        const slots = getFormationSlots(match.currentFormation || '433');
        const teamLabel = state.teams?.[match.team]?.name || match.team || 'Équipe';
        const formationLabel = FORMATIONS.find(f => f.key === (match.currentFormation || '433'))?.label || '';
        const dateLabel = match.date
            ? new Date(match.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            : '';

        const jerseyNumber = p => jerseys[p.id]?.number;
        const sortByNumber = (a, b) => (a.n == null ? 99 : a.n) - (b.n == null ? 99 : b.n);

        const starterRows = slots
            .map(s => {
                const pid = (match.slotAssignments || {})[s.slot];
                const p = pid ? squadById.get(pid) : null;
                return p ? { p, position: getSlotLabel(s.slot, match.currentFormation), n: jerseyNumber(p) } : null;
            })
            .filter(Boolean)
            .sort(sortByNumber)
            .map(row => `${row.n != null ? row.n + '.' : '•'} ${formatPlayerName(row.p)} — ${row.position}`);

        const assignedIds = new Set(Object.values(match.slotAssignments || {}));
        const benchRows = getMatchPlayers(match)
            .map(item => item.p)
            .filter(p => (match.convocations || {})[p.id] === 'convoke' && !assignedIds.has(p.id))
            .map(p => ({ p, n: jerseyNumber(p) }))
            .sort(sortByNumber)
            .map(row => `${row.n != null ? row.n + '.' : '•'} ${formatPlayerName(row.p)}${row.p.poste1 ? ' — ' + getPosteLabel(row.p.poste1) : ''}`);

        const lines = [];
        lines.push(`🏉 ${teamLabel}${match.opponent ? ' vs ' + match.opponent : ''}`);
        const meta = [dateLabel, formationLabel].filter(Boolean).join(' · ');
        if (meta) lines.push(meta);
        const hasPlannedPhase = COMPOSITION_PLAN_KEYS.some(key => !!getCompositionPhaseData(match, key));
        lines.push('', hasPlannedPhase ? 'Onze de départ' : 'Titulaires');
        lines.push(...(starterRows.length ? starterRows : ['—']));
        if (benchRows.length) {
            lines.push('', 'Remplaçants');
            lines.push(...benchRows);
        }

        const startIds = new Set(Object.values((getCompositionPhaseData(match, 'start') || {}).slots || {}));

        COMPOSITION_PLAN_KEYS.forEach(key => {
            const planData = getCompositionPhaseData(match, key);
            if (!planData) return;

            const planIds = new Set(Object.values(planData.slots || {}));
            const planFormationLabel = FORMATIONS.find(f => f.key === planData.formation)?.label || '';

            const nameRows = ids => ids
                .map(id => squadById.get(id))
                .filter(Boolean)
                .map(p => ({ p, n: jerseyNumber(p) }))
                .sort(sortByNumber)
                .map(row => `${row.n != null ? row.n + '.' : '•'} ${formatPlayerName(row.p)}`);

            const entrants = nameRows([...planIds].filter(id => !startIds.has(id)));
            const sortants = nameRows([...startIds].filter(id => !planIds.has(id)));

            const planStarters = getFormationSlots(planData.formation)
                .map(s => {
                    const pid = (planData.slots || {})[s.slot];
                    const p = pid ? squadById.get(pid) : null;
                    return p ? { p, position: getSlotLabel(s.slot, planData.formation), n: jerseyNumber(p) } : null;
                })
                .filter(Boolean)
                .sort(sortByNumber)
                .map(row => `${row.n != null ? row.n + '.' : '•'} ${formatPlayerName(row.p)} — ${row.position}`);

            lines.push('', `${COMPOSITION_PHASES[key].longLabel}${planFormationLabel ? ' · ' + planFormationLabel : ''}`);
            if (entrants.length) lines.push(`Entrés : ${entrants.join(', ')}`);
            if (sortants.length) lines.push(`Sortis : ${sortants.join(', ')}`);
            if (!entrants.length && !sortants.length) lines.push('(même onze que le départ)');
            lines.push(...(planStarters.length ? planStarters : ['—']));
        });

        return lines.join('\n');
    }

    async function shareMatchComposition() {
        const match = state.matches[state.selectedMatchId];
        if (!match) return;

        const text = buildCompositionShareText(match);
        if (!text) return;

        // Partage natif : WhatsApp, SMS, mail… selon les applis du téléphone.
        if (navigator.share) {
            try {
                await navigator.share({
                    title: ((state.teams?.[match.team]?.name || match.team || '') + ' — composition').trim(),
                    text: text
                });
                return;
            } catch (err) {
                if (err && err.name === 'AbortError') return;
            }
        }

        const copied = () => showToast('Composition copiée 📋 à coller dans WhatsApp');

        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                copied();
                return;
            } catch (e) {
                // on tente la copie historique ci-dessous
            }
        }

        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            copied();
        } catch (e) {
            showToast('Impossible de copier la composition', 'error');
        }
        document.body.removeChild(ta);
    }

    window.shareMatchComposition = shareMatchComposition;

    function renderMatchComposition() {

        const container = document.getElementById('match-composition-container');
        if (!container) return;

        if (!state.selectedMatchId || !state.matches[state.selectedMatchId]) {
            container.innerHTML = `
                <div class="card card-pad text-center py-10">
                    <div class="w-12 h-12 mx-auto rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                        <i class="fa-solid fa-chess-board text-lg" aria-hidden="true"></i>
                    </div>
                    <p class="font-bold text-slate-800 text-sm">Aucun match sélectionné</p>
                    <p class="screen-sub max-w-sm mx-auto">Choisis un match pour composer l'équipe.</p>
                </div>`;
            return;
        }

        const match = state.matches[state.selectedMatchId];

        // Changement de match : on revient toujours au onze de départ.
        if (compositionViewPhaseMatchId !== match.id) {
            compositionViewPhaseMatchId = match.id;
            compositionViewPhase = 'start';
        }
        if (!getCompositionPhaseData(match, compositionViewPhase)) compositionViewPhase = 'start';

        if (!match.slotAssignments) match.slotAssignments = {};
        pruneSlotAssignments(match);

        const phase = getActiveCompositionPhase(match);
        const isPlanPhase = phase.key !== 'start';
        prunePhaseSlots(match, phase.key);

        const startPhaseSlots = (getCompositionPhaseData(match, 'start') || {}).slots || {};
        const startPlayerIds = new Set(Object.values(startPhaseSlots));

        const formation = phase.formation;
        const slots = getFormationSlots(formation);
        const phaseSlots = phase.slots;
        const jerseys = computeMatchJerseys(match);
        const teamHex = getTeamHex(match.team);

        const squad = getMatchPlayers(match).map(item => item.p);
        const squadById = new Map(squad.map(p => [p.id, p]));
        const convoked = squad.filter(p => (match.convocations || {})[p.id] === 'convoke');
        const bench = getPhaseBenchPlayers(match, phase);
        const targetConvoked = parseInt(state.teams?.[match.team]?.targetConvocations) || 14;
        const maxSubs = Math.min(3, Math.max(0, targetConvoked - 11));
        const compositionLock = getCompositionLock(match);
        const compositionLocked = !!compositionLock;
        const placedCount = slots.filter(s => phaseSlots[s.slot]).length;

        const popSlot = window.__compPopSlot || null;
        window.__compPopSlot = null;
        const animateFormation = !!window.__compAnimateFormation;
        window.__compAnimateFormation = false;
        document.body.classList.remove('comp-fullscreen-open');

        const teamLabel = state.teams?.[match.team]?.name || match.team || 'Équipe';
        const opponentLabel = match.opponent ? `vs ${match.opponent}` : '';
        const matchDateLabel = match.date
            ? new Date(match.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            : '';
        const metaLine = [opponentLabel, matchDateLabel].filter(Boolean).join(' · ');
        const formationLabel = FORMATIONS.find(f => f.key === formation)?.label || formation;
        const placedPct = Math.round((placedCount / 11) * 100);
        const subsOnSheet = Math.min(bench.length, maxSubs);

        const returnTraining = window.compositionReturnTrainingId
            ? state.trainings?.[window.compositionReturnTrainingId]
            : null;

        const compositionLockBanner = compositionLock ? `
            <div class="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-[11.5px] text-slate-700 flex items-start gap-2">
                <i class="fa-solid fa-lock mt-0.5" aria-hidden="true"></i>
                <span><strong>Composition verrouillée.</strong> ${compositionLockMessage(compositionLock)}</span>
            </div>` : '';

        const returnBanner = returnTraining ? `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-sky-200 bg-sky-50">
                <div class="flex items-center gap-2 min-w-0">
                    <i class="fa-solid fa-person-running text-sky-600" aria-hidden="true"></i>
                    <p class="text-[11.5px] text-slate-700 truncate">
                        Composition ouverte depuis la séance
                        <strong>${returnTraining.title || 'sans titre'}</strong>
                    </p>
                </div>
                <button type="button" onclick="backToTrainingFromComposition()"
                        class="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 text-[11px] font-bold hover:bg-sky-100 flex items-center gap-1.5">
                    <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
                    Retour à la séance
                </button>
            </div>` : '';

        const duplicates = Object.entries(jerseys)
            .filter(([, j]) => j.duplicate)
            .map(([id]) => squadById.get(id))
            .filter(Boolean)
            .map(p => formatPlayerName(p));

        const slotHTML = (pos) => {
            const playerId = phaseSlots[pos.slot];
            const player = playerId ? squadById.get(playerId) : null;
            const jersey = player ? jerseys[player.id] : null;
            const label = getSlotLabel(pos.slot, formation);
            const abbr = slotAbbreviation(pos.slot, formation);
            const style = `--px:${pos.x}%;--py:${pos.y}%;--lx:${(100 - pos.y).toFixed(2)}%;--ly:${pos.x}%;`;

            if (!player) {
                return `
                <button type="button" class="pitch-slot" style="${style}" ${compositionLocked ? 'disabled' : ''}
                        onclick="openPlayerPicker('${pos.slot}')"
                        title="${label}"
                        aria-label="Placer un joueur : ${label}">
                    <span class="slot-empty">${abbr}</span>
                </button>`;
            }

            return `
                <button type="button" class="pitch-slot${popSlot === pos.slot ? ' is-pop' : ''}" style="${style}" ${compositionLocked ? 'disabled' : ''}
                        onclick="openPlayerPicker('${pos.slot}')"
                        title="${formatPlayerName(player)} · ${label}"
                        aria-label="Changer ${formatPlayerName(player)} : ${label}">
                    ${jerseyMarkup(teamHex, jersey ? jersey.number : null, jersey && jersey.duplicate)}
                    ${isPlanPhase && !startPlayerIds.has(player.id) ? '<span class="plan-badge plan-badge-in" title="Entre en jeu par rapport au onze de départ">↑</span>' : ''}
                    <span class="pitch-name">${getPitchDisplayName(player)}</span>
                </button>`;
        };

        const benchRowHTML = (p, i) => {
            const off = i >= maxSubs;
            const jersey = jerseys[p.id] || {};
            const number = jersey.number;
            const parts = getPlayerNameParts(p);
            const initials = (`${(parts.prenom || '').charAt(0)}${(parts.nom || '').charAt(0)}`.toUpperCase())
                || String(getPitchDisplayName(p) || '?').charAt(0).toUpperCase();

            return `
                <div class="bench-row ${off ? 'is-off opacity-70' : ''}">
                    <span class="bench-avatar" style="background:${teamHex}">${initials}</span>
                    <div class="min-w-0 flex-1">
                        <p class="flex items-center gap-1 font-bold text-[12px] text-slate-800">
                            <span class="truncate">${formatPlayerName(p)}</span>
                            ${jersey.duplicate ? '<span class="text-red-600" title="Numéro en double">!</span>' : ''}
                            ${isPlanPhase && startPlayerIds.has(p.id) ? '<span class="plan-tag plan-tag-out" title="Sort par rapport au onze de départ">↓ sort</span>' : ''}
                        </p>
                        <p class="text-[10px] text-slate-500 truncate">${getPosteLabel(p.poste1)}${number ? ' · n°' + number : ''}</p>
                    </div>
                    <div class="flex flex-col gap-0.5">
                        <button type="button" onclick="moveCompositionBenchPlayer('${match.id}', '${p.id}', 'up')" ${i === 0 || compositionLocked ? 'disabled' : ''}
                                class="bench-move" aria-label="Monter ${formatPlayerName(p)}">▲</button>
                        <button type="button" onclick="moveCompositionBenchPlayer('${match.id}', '${p.id}', 'down')" ${i === bench.length - 1 || compositionLocked ? 'disabled' : ''}
                                class="bench-move" aria-label="Descendre ${formatPlayerName(p)}">▼</button>
                    </div>
                </div>`;
        };

        const onSheet = bench.slice(0, maxSubs);
        const offSheet = bench.slice(maxSubs);

        const benchHTML = bench.length
            ? `
                ${onSheet.length ? `
                    <div class="bench-section"><span>Sur la feuille</span><span class="flex-1 h-px bg-slate-200"></span><span>${onSheet.length}</span></div>
                    <div class="bench-list">${onSheet.map(p => benchRowHTML(p, bench.indexOf(p))).join('')}</div>` : ''}
                ${offSheet.length ? `
                    <div class="bench-section"><span>Hors feuille</span><span class="flex-1 h-px bg-slate-200"></span><span>${offSheet.length}</span></div>
                    <div class="bench-list">${offSheet.map(p => benchRowHTML(p, bench.indexOf(p))).join('')}</div>` : ''}
            `
            : '<p class="text-xs text-slate-400 italic">Aucun remplaçant : tous les convoqués sont sur le terrain.</p>';

        const phaseDiff = key => {
            const data = getCompositionPhaseData(match, key);
            if (!data) return null;
            const ids = new Set(Object.values(data.slots || {}));
            return {
                entrants: [...ids].filter(id => !startPlayerIds.has(id)).length,
                sortants: [...startPlayerIds].filter(id => !ids.has(id)).length
            };
        };

        const phaseButtons = Object.keys(COMPOSITION_PHASES).map(key => {
            const meta = COMPOSITION_PHASES[key];
            const diff = phaseDiff(key);
            const isActive = phase.key === key;

            if (!diff) {
                return `
                <button type="button" onclick="createCompositionPhase('${key}')" ${compositionLocked ? 'disabled' : ''}
                        class="comp-phase comp-phase-plan" title="Préparer : ${meta.longLabel}">
                    <i class="fa-solid fa-plus" aria-hidden="true"></i>${meta.label}
                </button>`;
            }

            return `
                <button type="button" onclick="setCompositionPhase('${key}')"
                        class="comp-phase ${key === 'start' ? '' : 'comp-phase-plan'} ${isActive ? 'is-active' : ''}"
                        aria-pressed="${isActive}"
                        title="${meta.longLabel} : ${diff.entrants} entrée(s) · ${diff.sortants} sortie(s) par rapport au départ">
                    <i class="fa-solid ${meta.icon}" aria-hidden="true"></i>${meta.label}
                </button>`;
        }).join('');

        const phaseBar = `<div class="comp-phase-bar">${phaseButtons}</div>`;

        const activePhaseMeta = COMPOSITION_PHASES[phase.key] || COMPOSITION_PHASES.start;
        const activeDiff = isPlanPhase ? phaseDiff(phase.key) : null;

        const planBanner = isPlanPhase ? `
            <div class="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-[11.5px] text-teal-900 flex items-start gap-2">
                <i class="fa-solid ${activePhaseMeta.icon} mt-0.5" aria-hidden="true"></i>
                <span class="flex-1">
                    <strong>${activePhaseMeta.longLabel} — ${phase.key === 'test' ? 'composition de travail' : 'composition prévue'}.</strong> Le onze de départ n'est pas modifié.
                    ${activeDiff ? `<br><span class="font-semibold">${activeDiff.entrants} entrée(s) · ${activeDiff.sortants} sortie(s) par rapport au départ</span>` : ''}
                </span>
                <button type="button" onclick="deleteCompositionPhase('${phase.key}')" ${compositionLocked ? 'disabled' : ''}
                        class="shrink-0 text-[10.5px] font-bold underline">Supprimer</button>
            </div>` : '';

        container.innerHTML = `
        <div class="space-y-3">

            ${compositionLockBanner}${returnBanner}${phaseBar}${planBanner}

            <div class="comp-hero" style="--team:${teamHex}">
                <div class="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="min-w-0">
                        <p class="comp-hero-tag">${isPlanPhase ? activePhaseMeta.longLabel : 'Composition'}</p>
                        <h2 class="text-xl font-extrabold leading-tight truncate">${teamLabel}</h2>
                        <p class="text-[11.5px] font-semibold opacity-90 truncate">
                            ${metaLine || 'Date et adversaire non renseignés'}
                        </p>
                        <div class="flex flex-wrap items-center gap-1.5 mt-2">
                            <span class="comp-hero-pill"><i class="fa-solid fa-table-cells-large" aria-hidden="true"></i>${formationLabel}</span>
                            <span class="comp-hero-pill"><i class="fa-solid fa-users" aria-hidden="true"></i>${convoked.length} convoqué(s)</span>
                        </div>
                    </div>
                    <div class="shrink-0 sm:text-right sm:min-w-[7.5rem]">
                        <p class="text-2xl font-extrabold tabular-nums leading-none">${placedCount}<span class="text-sm opacity-70">/11</span></p>
                        <p class="text-[9.5px] font-extrabold uppercase tracking-[.12em] opacity-85 mt-1">titulaires</p>
                        <div class="h-1.5 rounded-full bg-white/25 mt-1.5 overflow-hidden sm:ml-auto sm:w-28">
                            <div class="h-full rounded-full bg-white transition-all" style="width:${placedPct}%"></div>
                        </div>
                        <p class="text-[10px] font-bold opacity-85 mt-1">${subsOnSheet}/${maxSubs} remplaçant(s)</p>
                        <div class="mt-2.5 flex flex-wrap sm:justify-end gap-1.5">
                            <button type="button" onclick="shareMatchComposition()"
                                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/40 text-[11px] font-bold transition"
                                    title="Envoyer la liste des joueurs (poste et numéro) via WhatsApp ou une autre application">
                                <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>Partager la liste
                            </button>
                            <a href="https://fmi-core-compo.fff.fr/v2" target="_blank" rel="noopener noreferrer"
                               class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 border border-white/40 text-[11px] font-bold transition"
                               title="Ouvrir la feuille de match officielle FFF (nouvel onglet)">
                                <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>Feuille de match FFF
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="comp-form-bar">
                ${FORMATIONS.map(f => `
                    <button type="button" onclick="applyFormation('${f.key}')" ${compositionLocked ? 'disabled' : ''}
                            class="comp-form ${formation === f.key ? 'is-active' : ''}"
                            aria-pressed="${formation === f.key}"
                            title="Système ${f.label}">
                        ${formationMiniPitch(f.key)}
                        <span>${f.label}</span>
                    </button>
                `).join('')}
                <button type="button" onclick="resetComposition()" ${compositionLocked ? 'disabled' : ''} class="comp-reset">
                    <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>Tout au banc
                </button>
            </div>

            ${duplicates.length ? `
                <div class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11.5px] text-red-800 flex items-start gap-2">
                    <i class="fa-solid fa-triangle-exclamation mt-0.5" aria-hidden="true"></i>
                    <span>Numéro en double : <strong>${duplicates.join(', ')}</strong>. Ouvre le joueur pour changer son numéro.</span>
                </div>` : ''}

            <div class="grid lg:grid-cols-4 gap-3">

                <div class="lg:col-span-3">
                    <div class="pitch-wrap${animateFormation ? ' is-switching' : ''}" id="composition-terrain">
                        ${buildPitchSVG('portrait')}
                        ${buildPitchSVG('landscape')}
                        ${slots.map(slotHTML).join('')}
                        <button type="button" class="pitch-fs-btn is-open" onclick="togglePitchFullscreen(true)"
                                aria-label="Agrandir le terrain" title="Plein écran">
                            <i class="fa-solid fa-expand" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="pitch-fs-btn is-close" onclick="togglePitchFullscreen(false)"
                                aria-label="Quitter le plein écran" title="Réduire">
                            <i class="fa-solid fa-compress" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="flex flex-wrap items-center gap-1.5 mt-2.5">
                        <span class="comp-chip ${placedCount === 11 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}">
                            <i class="fa-solid fa-users" aria-hidden="true"></i>${placedCount}/11 titulaires
                        </span>
                        <span class="comp-chip bg-slate-50 text-slate-600 border-slate-200">
                            <i class="fa-solid fa-arrows-up-down" aria-hidden="true"></i>${bench.length} remplaçant(s)
                        </span>
                        <span class="comp-chip ${duplicates.length ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}">
                            <i class="fa-solid ${duplicates.length ? 'fa-triangle-exclamation' : 'fa-circle-check'}" aria-hidden="true"></i>${duplicates.length ? 'Numéros en double' : 'Numéros OK'}
                        </span>
                        <span class="ml-auto text-[10.5px] text-slate-400 flex items-center gap-1">
                            <i class="fa-solid fa-hand-pointer" aria-hidden="true"></i>Touche une position
                        </span>
                    </div>
                </div>

                <aside class="card card-pad space-y-3 lg:sticky lg:top-20 lg:self-start">
                    <div>
                        <h3 class="card-title"><i class="fa-solid fa-arrows-up-down"></i>Banc</h3>
                        <p class="card-sub" ${convoked.length > targetConvoked ? 'style="color:#dc2626;font-weight:700"' : ''}>
                            ${convoked.length} convoqué(s) / ${targetConvoked} · ${maxSubs} remplaçant(s)
                        </p>
                    </div>
                    <div class="space-y-1.5 lg:max-h-[calc(100dvh-11rem)] lg:overflow-y-auto lg:pr-1">${benchHTML}</div>
                </aside>

            </div>
        </div>`;
    }

    function togglePitchFullscreen(force) {
        const pitch = document.getElementById('composition-terrain');
        if (!pitch) return;

        const on = typeof force === 'boolean' ? force : !pitch.classList.contains('is-fullscreen');

        pitch.classList.toggle('is-fullscreen', on);
        document.body.classList.toggle('comp-fullscreen-open', on);
    }

    window.togglePitchFullscreen = togglePitchFullscreen;

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const pitch = document.getElementById('composition-terrain');
        if (pitch && pitch.classList.contains('is-fullscreen')) togglePitchFullscreen(false);
    });

    /* ---- Choix du joueur pour une position ---- */

    let pickingSlot = null;

    function openPlayerPicker(slot) {
        const match = state.matches[state.selectedMatchId];
        if (!match) return;
        const lock = getCompositionLock(match);
        if (lock) {
            showToast(compositionLockMessage(lock), 'error');
            return;
        }
        pickingSlot = slot;

        const sub = document.getElementById('pick-player-slot');
        if (sub) sub.textContent = getSlotLabel(slot, getActiveCompositionPhase(match).formation);

        renderPlayerPicker();
        toggleModal('modal-pick-player', true);
    }

    function renderPlayerPicker() {
        const match = state.matches[state.selectedMatchId];
        if (!match || !pickingSlot) return;

        const list = document.getElementById('pick-player-list');
        const current = document.getElementById('pick-player-current');
        const jerseys = computeMatchJerseys(match);
        const teamHex = getTeamHex(match.team);

        const phase = getActiveCompositionPhase(match);
        const assigned = phase.slots || {};
        const currentId = assigned[pickingSlot];
        const takenIds = Object.values(assigned).filter(id => id !== currentId);

        const squad = getMatchPlayers(match).map(item => item.p);
        const squadById = new Map(squad.map(p => [p.id, p]));

        const currentPlayer = currentId ? squadById.get(currentId) : null;

        const candidates = squad
            .filter(p => (match.convocations || {})[p.id] === 'convoke' && !takenIds.includes(p.id))
            .sort((a, b) => {
                const na = jerseys[a.id]?.number;
                const nb = jerseys[b.id]?.number;
                return (na == null ? 99 : na) - (nb == null ? 99 : nb);
            });

        if (current) {
            current.innerHTML = currentPlayer ? `
                <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                    <div class="flex items-center gap-2">
                        <span class="bench-num" style="background:${teamHex}">${jerseys[currentPlayer.id]?.number || '—'}</span>
                        <div class="min-w-0 flex-1">
                            <p class="font-bold text-[13px] text-slate-800 truncate">${formatPlayerName(currentPlayer)}</p>
                            <p class="text-[11px] text-slate-500">${getPosteLabel(currentPlayer.poste1)}</p>
                        </div>
                    </div>
                    <div class="flex items-end gap-2">
                        <label class="flex-1">
                            <span class="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Numéro de maillot</span>
                            <input type="number" min="1" max="99" value="${jerseys[currentPlayer.id]?.number || ''}"
                                   title="Un numéro déjà pris est échangé avec l'autre joueur"
                                   onchange="setSlotJersey('${currentPlayer.id}', this.value)"
                                   class="w-full p-1.5 border border-slate-200 rounded-lg text-center font-bold text-sm bg-white">
                        </label>
                        <button onclick="setSlotJersey('${currentPlayer.id}', '')"
                                class="px-2.5 py-2 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-white"
                                title="Revenir au numéro automatique">Auto</button>
                        <button onclick="clearPlayerFromSlot()"
                                class="px-2.5 py-2 rounded-lg border border-red-200 text-[11px] font-bold text-red-600 hover:bg-red-50">Retirer</button>
                    </div>
                </div>` : '';
        }

        if (list) {
            list.innerHTML = candidates.length
                ? candidates.map(p => {
                    const jersey = jerseys[p.id] || {};
                    return `
                    <button type="button" class="pick-row" onclick="choosePlayerForSlot('${p.id}')">
                        <span class="bench-num ${jersey.number ? '' : 'is-off'}" ${jersey.number ? 'style="background:' + teamHex + '"' : ''}>${jersey.number || '—'}</span>
                        <span class="min-w-0 flex-1">
                            <span class="block font-bold text-[12.5px] text-slate-800 truncate">${formatPlayerName(p)}</span>
                            <span class="block text-[10.5px] text-slate-500 truncate">${getPosteLabel(p.poste1)}</span>
                        </span>
                        ${p.id === currentId
                            ? '<i class="fa-solid fa-check text-sky-600 text-xs" aria-hidden="true"></i>'
                            : '<i class="fa-solid fa-plus text-slate-300 text-xs" aria-hidden="true"></i>'}
                    </button>`;
                }).join('')
                : '<p class="text-xs text-slate-400 italic">Aucun joueur convoqué disponible.</p>';
        }
    }

    function choosePlayerForSlot(playerId) {
        const lock = getCompositionLock(state.matches[state.selectedMatchId]);
        if (lock) {
            showToast(compositionLockMessage(lock), 'error');
            return;
        }
        const match = state.matches[state.selectedMatchId];
        if (!match || !pickingSlot) return;

        const phase = getActiveCompositionPhase(match);
        phase.slots[pickingSlot] = playerId;

        window.__compPopSlot = pickingSlot;

        saveStateToFirebase();
        toggleModal('modal-pick-player', false);
        renderMatchComposition();
    }

    function clearPlayerFromSlot() {
        const lock = getCompositionLock(state.matches[state.selectedMatchId]);
        if (lock) {
            showToast(compositionLockMessage(lock), 'error');
            return;
        }
        const match = state.matches[state.selectedMatchId];
        if (!match || !pickingSlot) return;

        delete getActiveCompositionPhase(match).slots[pickingSlot];

        saveStateToFirebase();
        toggleModal('modal-pick-player', false);
        renderMatchComposition();
    }

    function setSlotJersey(playerId, value) {
        const lock = getCompositionLock(state.matches[state.selectedMatchId]);
        if (lock) {
            showToast(compositionLockMessage(lock), 'error');
            return;
        }
        setMatchJersey(state.selectedMatchId, playerId, value);
        renderMatchComposition();
        renderPlayerPicker();
    }





function applyFormation(system) {

    const lock = getCompositionLock(state.matches[state.selectedMatchId]);
    if (lock) {
        showToast(compositionLockMessage(lock), 'error');
        return;
    }

    if (
        !state.selectedMatchId ||
        !state.matches[state.selectedMatchId]
    ) {
        return;
    }

    const match =
        state.matches[state.selectedMatchId];

    const phase = getActiveCompositionPhase(match);

    if (phase.key !== 'start') {
        // Chaque phase prévue a son propre système : celui du départ n'est pas touché.
        const field = compositionPhaseField(phase.key);
        if (field && match[field]) match[field].formation = system;
        prunePhaseSlots(match, phase.key);
    } else {
        // Une ancienne couche « composition libre » a existé : on la retire pour
        // qu'il ne reste qu'un seul système de placement.
        if (match.composition) {
            delete match.composition;
        }

        match.currentFormation = system;

        // Les joueurs dont la place n'existe plus dans le nouveau système
        // repartent automatiquement sur le banc.
        pruneSlotAssignments(match);
    }

    window.__compAnimateFormation = true;

    saveStateToFirebase();

    renderMatchComposition();

    showToast(`Système ${FORMATIONS.find(f => f.key === system)?.label || system} appliqué${phase.key === 'start' ? '' : ' (' + COMPOSITION_PHASES[phase.key].longLabel + ')'}`);
}

function getFormationSlots(system = "433") {
    const formations = {

        "433": [
            { slot:"GB", x:50, y:88 },
            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            // Milieu à 3 : 6 en sentinelle, 8 en relayeur, 10 en meneur (le plus haut)
            { slot:"MC1", x:30, y:53 },
            { slot:"MC3", x:70, y:47 },
            { slot:"MC2", x:50, y:32 },

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
        ],

        "352": [
            { slot:"GB", x:50, y:88 },

            { slot:"DC1", x:25, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:75, y:72 },

            { slot:"MG", x:10, y:45 },
            { slot:"MC1", x:35, y:48 },
            { slot:"MC2", x:50, y:42 },
            { slot:"MC3", x:65, y:48 },
            { slot:"MD", x:90, y:45 },

            { slot:"AT1", x:38, y:15 },
            { slot:"AT2", x:62, y:15 }
        ],

        "4231": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MDF1", x:40, y:55 },
            { slot:"MDF2", x:60, y:55 },

            { slot:"MOG", x:20, y:30 },
            { slot:"MOC", x:50, y:25 },
            { slot:"MOD", x:80, y:30 },

            { slot:"BU", x:50, y:10 }
        ],

        "4141": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MDF", x:50, y:58 },

            { slot:"MG", x:12, y:40 },
            { slot:"MC1", x:37, y:42 },
            { slot:"MC2", x:63, y:42 },
            { slot:"MD", x:88, y:40 },

            { slot:"BU", x:50, y:12 }
        ],

        "451": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MG", x:10, y:42 },
            { slot:"MC1", x:30, y:45 },
            { slot:"MC2", x:50, y:40 },
            { slot:"MC3", x:70, y:45 },
            { slot:"MD", x:90, y:42 },

            { slot:"BU", x:50, y:12 }
        ],

        "343": [
            { slot:"GB", x:50, y:88 },

            { slot:"DC1", x:25, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:75, y:72 },

            { slot:"MG", x:12, y:45 },
            { slot:"MC1", x:37, y:48 },
            { slot:"MC2", x:63, y:48 },
            { slot:"MD", x:88, y:45 },

            { slot:"AG", x:20, y:18 },
            { slot:"BU", x:50, y:10 },
            { slot:"AD", x:80, y:18 }
        ],

        "532": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:10, y:68 },
            { slot:"DC1", x:30, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:70, y:72 },
            { slot:"DD", x:90, y:68 },

            { slot:"MC1", x:30, y:45 },
            { slot:"MC2", x:50, y:40 },
            { slot:"MC3", x:70, y:45 },

            { slot:"AT1", x:38, y:15 },
            { slot:"AT2", x:62, y:15 }
        ],

        "541": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:10, y:68 },
            { slot:"DC1", x:30, y:72 },
            { slot:"DC2", x:50, y:68 },
            { slot:"DC3", x:70, y:72 },
            { slot:"DD", x:90, y:68 },

            { slot:"MG", x:12, y:45 },
            { slot:"MC1", x:37, y:48 },
            { slot:"MC2", x:63, y:48 },
            { slot:"MD", x:88, y:45 },

            { slot:"BU", x:50, y:12 }
        ],

        "4312": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MC1", x:25, y:48 },
            { slot:"MC2", x:50, y:44 },
            { slot:"MC3", x:75, y:48 },

            { slot:"MOC", x:50, y:28 },

            { slot:"AT1", x:38, y:12 },
            { slot:"AT2", x:62, y:12 }
        ],

        "4222": [
            { slot:"GB", x:50, y:88 },

            { slot:"DG", x:15, y:72 },
            { slot:"DC1", x:38, y:72 },
            { slot:"DC2", x:62, y:72 },
            { slot:"DD", x:85, y:72 },

            { slot:"MDF1", x:40, y:55 },
            { slot:"MDF2", x:60, y:55 },

            { slot:"MOG", x:35, y:30 },
            { slot:"MOD", x:65, y:30 },

            { slot:"AT1", x:38, y:12 },
            { slot:"AT2", x:62, y:12 }
        ]
    };

    return formations[system] || formations["433"];
}

let selectedBenchPlayer = null;



function resetComposition() {

    const lock = getCompositionLock(state.matches[state.selectedMatchId]);
    if (lock) {
        showToast(compositionLockMessage(lock), 'error');
        return;
    }

    if (
        !confirm(
            getActiveCompositionPhase(state.matches[state.selectedMatchId]).key === 'start'
                ? "Remettre tous les joueurs sur le banc ?"
                : `Vider « ${COMPOSITION_PHASES[getActiveCompositionPhase(state.matches[state.selectedMatchId]).key].longLabel} » ?`
        )
    ) {
        return;
    }

    const match =
        state.matches[
            state.selectedMatchId
        ];

    const phase = getActiveCompositionPhase(match);
    Object.keys(phase.slots || {}).forEach(slot => { delete phase.slots[slot]; });
    setCompositionPhaseBenchOrder(match, phase, []);

    if (phase.key === 'start') match.composition = {};

    saveStateToFirebase();

    renderMatchComposition();

    showToast(
        phase.key === 'start'
            ? "Tous les joueurs ont été remis au banc"
            : `« ${COMPOSITION_PHASES[phase.key].longLabel} » vidée : tout le monde sur le banc`
    );
}

