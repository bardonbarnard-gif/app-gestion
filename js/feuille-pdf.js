/* Feuille de match : remplissage du PDF officiel via pdf-lib.
 * Largeurs/positions détectées sur le PDF officiel (format paysage 842 x 595 pts).
 */

const H_PDF = 595;

async function telechargerFeuillePDF() {
    const m = state.matches[state.selectedMatchId];
    if (!m) {
        showToast("Sélectionnez un match pour générer le PDF", "error");
        return;
    }
    if (!Array.isArray(state.players)) {
        showToast("Joueurs non chargés — réessayez dans quelques secondes", "error");
        return;
    }
    if (typeof PDFLib === 'undefined') {
        showToast("pdf-lib non chargé — rechargez la page", "error");
        return;
    }

    const { PDFDocument, StandardFonts, rgb } = PDFLib;

    // ---- Données du match (mêmes règles que l'aperçu HTML) ----
    const compet = m.competitionName || '';
    const poule = m.poule || '';
    const journee = m.journee || m.tour || '';
    const dateStr = m.date
        ? new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';
    const heure = m.heure || '';
    const terrain = m.pelouse || m.adresse || m.location || '';
    const opponent = m.opponent || '';

    const convoques = state.players
        .filter(p => m.convocations && m.convocations[p.id] === 'convoke')
        .slice()
        .sort((a, b) => {
            const ja = parseInt(m.jerseys?.[a.id], 10) || 0;
            const jb = parseInt(m.jerseys?.[b.id], 10) || 0;
            if (ja && jb) return ja - jb;
            if (ja) return -1;
            if (jb) return 1;
            return (a.name || '').localeCompare(b.name || '');
        });

    const targetConvoked = parseInt(state.teams?.[m.team]?.targetConvocations) || 14;
    const rows = convoques.slice(0, Math.min(targetConvoked, 16)).map(p => {
        const parts = (p.name || ' ').split(' ');
        return {
            licence: p.licence || '',
            nom: (parts[0] || '').toUpperCase(),
            prenom: parts.slice(1).join(' ')
        };
    });

    try {
        showToast("Génération du PDF officiel…", "info");

        let bytes;
        if (typeof FEUILLE_PDF_BASE64 === 'string' && FEUILLE_PDF_BASE64) {
            const bin = atob(FEUILLE_PDF_BASE64);
            bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        } else {
            bytes = new Uint8Array(await (await fetch('assets/Feuille_de_match.pdf')).arrayBuffer());
        }
        const pdfDoc = await PDFDocument.load(bytes);
        const helv = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const noire = rgb(0, 0, 0);

        const page1 = pdfDoc.getPage(0);
        const page2 = pdfDoc.getPage(1);

        // ----- En-tête du match (page 1) -----
        zone(page1, helv, noire, [
            { t: compet, x: 71,  zoneW: 90,  base: 42.5, taille: 8 },
            { t: poule,  x: 185, zoneW: 74,  base: 42.5, taille: 8 },
            { t: journee, x: 84, zoneW: 77,  base: 53.5, taille: 8 },
            { t: terrain, x: 55, zoneW: 106, base: 64.5, taille: 8 },
            { t: dateStr, x: 49, zoneW: 65,  base: 75.5, taille: 8 },
            { t: heure ? heure + ' H' : '', x: 120, zoneW: 41, base: 75.5, taille: 8 }
        ]);

        // ----- Grille joueurs RANGUEIL (gauche = recevant, droite = visiteur) -----
        const domicile = /domicile|home/i.test(m.location || '');
        const GRILLE = domicile
            ? { num: 22, numW: 16, lic: 56, licW: 76, nom: 136, nomW: 108 }
            : { num: 422, numW: 16, lic: 456, licW: 76, nom: 536, nomW: 108 };
        const ligneTop = 192;   // première ligne de joueurs (origine haut)
        const pasLigne = 13;
        const nLignes = Math.min(rows.length, 16);

        for (let i = 0; i < nLignes; i++) {
            const r = rows[i];
            const top = ligneTop + i * pasLigne;
            const nomComplet = r.prenom ? r.nom + ' ' + r.prenom : r.nom;
            cellule(page1, helv, noire, nomComplet, GRILLE.nom, GRILLE.nomW, top, pasLigne, 7, false);
            cellule(page1, helv, noire, r.licence, GRILLE.lic + 2, GRILLE.licW - 4, top, pasLigne, 7, true);
            const num = String(i + 1);
            page1.drawText(num, { x: GRILLE.num + (GRILLE.numW - helv.widthOfTextAtSize(num, 7)) / 2, y: H_PDF - (top + 8.4), size: 7, font: helv, color: noire });
        }

        // ----- Banc REC./VIS. de notre équipe : 1 ligne par coach (licence / nom prénom / case bleue) -----
        const gridBottom2 = ligneTop + 16 * pasLigne;
        let bancTop = Math.min(gridBottom2 + 10, 430);
        bancTop += 8;
        pdfBanc(m).forEach(lb => {
            if (bancTop > 470) return;
            cellule(page1, helv, noire, lb.licence, GRILLE.lic + 2, GRILLE.licW - 4, bancTop, 9, 7, true);
            cellule(page1, helv, noire, lb.nom, GRILLE.nom, GRILLE.nomW, bancTop, 9, 7, false);
            page1.drawText(lb.code, { x: GRILLE.nom + GRILLE.nomW + 6, y: H_PDF - (bancTop + 5.5), size: 7, font: helv, color: noire });
            bancTop += 10;
        });

        // ----- Dirigeants en haut à droite : Juge de touche = "Arbitre Asst 1", Délégué(s) = "Délégué(s)" -----
        // Licence affichée DANS la colonne "n° licence ou CI" sur la même ligne que le libellé
        // NOM Prénom dans la colonne nom-prénom
        const drg = pdfDirigeants(m);
        const DROITE = { licX: 610, nomX: 720, nomW: 95, asst1Base: 53.5, asst2Base: 64.5, delBase: 106 };
        if (drg.asst1.length) {
            const lics = drg.asst1.map(s => String(s.licence || '').trim()).filter(Boolean).join('/');
            cadreLicence(page1, helv, noire, 48.5, lics);
            zone(page1, helv, noire, [{ t: drg.asst1.map(nomPrenomStaff).join(', '), x: DROITE.nomX, zoneW: DROITE.nomW, base: DROITE.asst1Base, taille: 8 }]);
        }
        if (drg.asst2.length) {
            const lics = drg.asst2.map(s => String(s.licence || '').trim()).filter(Boolean).join('/');
            if (lics) page1.drawText(lics, { x: DROITE.licX, y: H_PDF - DROITE.asst2Base, size: 7, font: helv, color: noire });
            zone(page1, helv, noire, [{ t: drg.asst2.map(nomPrenomStaff).join(', '), x: DROITE.nomX, zoneW: DROITE.nomW, base: DROITE.asst2Base, taille: 8 }]);
        }
        if (drg.delegue.length) {
            const lics = drg.delegue.map(s => String(s.licence || '').trim()).filter(Boolean).join('/');
            cadreLicence(page1, helv, noire, 101.1, lics, 2);
            zone(page1, helv, noire, [{ t: drg.delegue.map(nomPrenomStaff).join(', '), x: DROITE.nomX, zoneW: DROITE.nomW, base: DROITE.delBase, taille: 8 }]);
        }

        // ----- En-tête du match (page 2, annexe) -----
        zone(page2, helv, noire, [
            { t: compet,  x: 76,  zoneW: 197, base: 39.5, taille: 8 },
            { t: poule,   x: 297, zoneW: 122, base: 39.5, taille: 8 },
            { t: journee, x: 89,  zoneW: 105, base: 50.5, taille: 8 },
            { t: dateStr, x: 52,  zoneW: 142, base: 61.5, taille: 8 },
            { t: heure ? heure + ' H' : '', x: 200, zoneW: 219, base: 61.5, taille: 8 }
        ]);

        const out = await pdfDoc.save();
        const blob = new Blob([out], { type: 'application/pdf' });
        const nom = 'Feuille_de_match_' + (opponent.replace(/[^a-zA-Z0-9]+/g, '_') || 'organisee') + '_' + dateStr.replace(/\//g, '') + '.pdf';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = nom;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 3000);
        showToast("PDF officiel téléchargé", "success");
    } catch (e) {
        console.error(e);
        showToast("Erreur PDF : " + (e && e.message ? e.message : e), "error");
    }
}

/* Découpe un mot en jetons (espaces + tirets = points de coupure). */
function jetons(texto) {
    return String(texto).split(/\s+/).filter(Boolean).flatMap(p => {
        if (p.indexOf('-') >= 0) {
            const pts = p.split('-');
            const out = [];
            for (let i = 0; i < pts.length; i++) out.push(i < pts.length - 1 ? pts[i] + '-' : pts[i]);
            return out;
        }
        return [p];
    });
}

/* Regroupe les jetons en lignes qui tiennent dans la zone de largeur donnée. */
function clusterLignes(font, tokens, zoneW, size) {
    const lignes = [];
    let cur = '';
    const w = s => font.widthOfTextAtSize(s, size);
    for (const tok of tokens) {
        if (!cur) cur = tok;
        else if (w(cur + ' ' + tok) <= zoneW) cur = cur + ' ' + tok;
        else { lignes.push(cur); cur = tok; }
    }
    if (cur) lignes.push(cur);
    return lignes.length ? lignes : [' '];
}

/* Dessine un texte dans une cellule, centré verticalement, sans jamais dépasser. */
function cellule(page, font, color, text, x, zoneW, topY, hauteur, tailleBase, alignCentre) {
    text = String(text == null ? '' : text);
    if (!text) return;
    const w1 = font.widthOfTextAtSize(text, 1);
    if (w1 <= 0) return;

    let size = Math.min(tailleBase, Math.max(4.8, zoneW / w1));
    let lignes = [text];
    if (font.widthOfTextAtSize(text, size) > zoneW) {
        const toks = jetons(text);
        size = 5.5;
        lignes = clusterLignes(font, toks, zoneW, size);
        while (lignes.length > 2 && size > 4.2) {
            size -= 0.3;
            lignes = clusterLignes(font, toks, zoneW, size);
        }
        lignes = lignes.slice(0, 2);
    }

    if (lignes.length === 1) {
        const topOf = topY + (hauteur - size * 0.95) / 2;
        const y = H_PDF - (topOf + 0.75 * size);
        const dx = alignCentre ? Math.max(0, (zoneW - font.widthOfTextAtSize(text, size)) / 2) : 0;
        page.drawText(text, { x: x + dx, y, size, font, color });
    } else {
        const h2 = lignes.length * size * 1.05;
        let topOf = topY + (hauteur - h2) / 2;
        for (const l of lignes) {
            page.drawText(l, { x, y: H_PDF - (topOf + 0.78 * size), size, font, color });
            topOf += size * 1.05;
        }
    }
}

/* Cadre "n° licence ou CI" : 2 cases accolées (mesures de la feuille officielle),
 * juste après le libellé ; le numéro est écrit dedans, centré. topY = origine haut. */
function cadreLicence(page, font, color, topY, lics, decal) {
    const boxA = { x: 642.4, w: 16.4 };
    const boxB = { x: 658.9, w: 15.3 };
    const boxH = 10.9;
    const y0 = H_PDF - (topY + boxH);
    for (const b of [boxA, boxB]) {
        page.drawRectangle({ x: b.x, y: y0, width: b.w, height: boxH, borderColor: color, borderWidth: 0.75 });
    }
    if (lics) cellule(page, font, color, String(lics), boxA.x, boxA.w + boxB.w, topY - (decal || 0), boxH, 7, true);
}

/* Dessine un champ d'en-tête sur la ligne de base du libellé imprimé, sans dépasser. */
function zone(page, font, color, champs) {
    for (const c of champs) {
        if (!c.t || String(c.t).trim() === '') continue;
        let t = String(c.t);
        const s1 = font.widthOfTextAtSize(t, 1);
        let size = s1 > 0 ? Math.min(c.taille || 8, Math.max(4.5, c.zoneW / s1)) : (c.taille || 8);
        if (font.widthOfTextAtSize(t, size) > c.zoneW) {
            // dernier recours pour l'en-tête : troncature avec "…"
            while (font.widthOfTextAtSize(t + '…', size) > c.zoneW && t.length > 1) t = t.slice(0, -1);
            t = t + '…';
        }
        page.drawText(t, { x: c.x, y: H_PDF - c.base, size, font, color });
    }
}

/* ---- Encadrement & Dirigeants : helpers autonomes (idem schéma d'ID de app.js) ---- */

function pdfStaffRole(s) {
    return (s && (s.role || s.functionName)) || "Dirigeant d'équipe";
}

function pdfStaffKey(s) {
    if (!s) return '';
    if (s.id) return String(s.id);
    const base = ((s.name || '') + '|' + (s.licence || '') + '|' + pdfStaffRole(s)).toLowerCase();
    let h = 0;
    for (let i = 0; i < base.length; i++) h = ((h << 5) - h + base.charCodeAt(i)) | 0;
    return 'ST_' + Math.abs(h).toString(36);
}

function pdfEntourage(m) {
    const staff = Array.isArray(state.staff) ? state.staff : [];
    const find = id => staff.find(x => pdfStaffKey(x) === id) || null;
    const ent = m ? m.entourage : null;
    if (!ent) return [];

    const items = [];

    const principal = ent.principalId ? find(ent.principalId) : null;
    if (principal) items.push({ label: 'Entraîneur principal', name: principal.name || '', licence: principal.licence || '' });

    const adjoint = ent.adjointId ? find(ent.adjointId) : null;
    if (adjoint) items.push({ label: 'Entraîneur adjoint', name: adjoint.name || '', licence: adjoint.licence || '' });

    if (ent.dirigeants) {
        Object.keys(ent.dirigeants).forEach(id => {
            const s = find(id);
            const d = ent.dirigeants[id];
            if (!s || !d || !d.convoked) return;
            items.push({ label: 'Dirigeant (' + (d.role || 'Juge de touche') + ')', name: s.name || '', licence: s.licence || '' });
        });
    }

    return items;
}

/* NOM Prénom lisible (même règle que la grille joueurs). */
function nomPrenomStaff(s) {
    if (!s) return '';
    const parts = String(s.name || '').trim().split(/\s+/);
    const nom = parts[0] || '';
    const prenom = parts.slice(1).join(' ');
    return (nom + (prenom ? ' ' + prenom : '')).trim() || '—';
}

/* Coaches (entraîneur principal / adjoint) affectés au match. */
function pdfCoaches(m) {
    const staff = Array.isArray(state.staff) ? state.staff : [];
    const find = id => staff.find(x => pdfStaffKey(x) === id) || null;
    const ent = m ? m.entourage : null;
    return {
        principal: ent && ent.principalId ? find(ent.principalId) : null,
        adjoint: ent && ent.adjointId ? find(ent.adjointId) : null
    };
}

/* Lignes du banc propre à notre équipe : 1 ligne par coach, licence / nom prénom / code case bleue. */
function pdfBanc(m) {
    const c = pdfCoaches(m);
    const lignes = [];
    if (c.principal) lignes.push({ licence: c.principal.licence || '', nom: nomPrenomStaff(c.principal), code: 'E/DR' });
    if (c.adjoint) lignes.push({ licence: c.adjoint.licence || '', nom: nomPrenomStaff(c.adjoint), code: 'A' });
    return lignes;
}

/* Dirigeants convoqués, classés par emplacement en haut à droite. */
function pdfDirigeants(m) {
    const staff = Array.isArray(state.staff) ? state.staff : [];
    const find = id => staff.find(x => pdfStaffKey(x) === id) || null;
    const ent = m ? m.entourage : null;
    const asst1 = [], asst2 = [], delegue = [];
    if (ent && ent.dirigeants) {
        Object.keys(ent.dirigeants).forEach(id => {
            const s = find(id);
            const d = ent.dirigeants[id];
            if (!s || !d || !d.convoked) return;
            const role = d.role || 'Délégué';
            if (role === 'Juge de touche') {
                if (asst1.length === 0) asst1.push(s);
                else asst2.push(s);
            } else {
                delegue.push(s);
            }
        });
    }
    return { asst1, asst2, delegue };
}