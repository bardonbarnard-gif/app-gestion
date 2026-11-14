/**
 * Test navigateur de l'application interne.
 *
 * Sert le dossier du projet sur un port local, ouvre index.html dans le Chrome
 * installé (headless), vérifie que le CSS compilé s'applique réellement, puis
 * parcourt les onglets en collectant les erreurs JavaScript.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const ROOT = process.cwd();
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((request, response) => {
    const requested = decodeURIComponent(request.url.split('?')[0]);
    const file = path.join(ROOT, requested === '/' ? 'index.html' : requested);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        response.writeHead(404);
        response.end('not found');
        return;
    }
    response.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(response);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const base = 'http://127.0.0.1:' + port;

const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
});
page.on('pageerror', (error) => pageErrors.push(error.message));
page.on('requestfailed', (request) => failedRequests.push(request.url() + ' (' + (request.failure() || {}).errorText + ')'));

const httpErrors = [];
page.on('response', (response) => {
    if (response.status() >= 400) httpErrors.push(response.status() + ' ' + response.url());
});

const shots = [];
const shot = async (name) => {
    const file = 'tmp-browser-' + name + '.png';
    await page.screenshot({ path: file });
    shots.push(file);
};

await page.goto(base + '/index.html', { waitUntil: 'networkidle2', timeout: 45000 })
    .catch((error) => console.log('navigation : ' + error.message));
await new Promise((resolve) => setTimeout(resolve, 2500));

await shot('01-pin');

// Les utilitaires viennent-ils bien du CSS compilé ?
const cssCheck = await page.evaluate(() => {
    const probe = document.createElement('div');
    probe.className = 'items-center gap-3 p-4 text-slate-700 bg-sky-50 border border-red-300';
    document.body.appendChild(probe);
    const style = getComputedStyle(probe);
    const result = {
        paddingLeft: style.paddingLeft,
        gap: style.columnGap,
        backgroundColor: style.backgroundColor,
        borderColor: style.borderTopColor,
        color: style.color
    };
    probe.remove();
    return result;
});

// Session simulée : on déplace l'écran PIN pour atteindre l'application.
await page.evaluate(() => {
    sessionStorage.setItem('currentUserData', JSON.stringify({ name: 'Test', role: 'admin', team: 'all' }));
    sessionStorage.setItem('currentUserRole', 'admin');
    sessionStorage.setItem('isUnlocked', 'true');
});
await page.reload({ waitUntil: 'networkidle2', timeout: 45000 })
    .catch((error) => console.log('rechargement : ' + error.message));
await new Promise((resolve) => setTimeout(resolve, 3000));

// Le selecteur de fonction recouvre l'application : on le ferme pour tester les ecrans.
const selectorInfo = await page.evaluate(() => {
    const screen = document.getElementById('function-selector-screen');
    const wasVisible = !!screen && getComputedStyle(screen).display !== 'none';
    try { if (typeof hideFunctionSelector === 'function') hideFunctionSelector(); } catch (error) { /* sans effet */ }
    if (screen) { screen.classList.add('hidden'); screen.style.display = 'none'; }
    try { if (typeof window.switchTab === 'function') window.switchTab('dashboard'); } catch (error) { /* sans effet */ }
    return {
        selecteurEtaitVisible: wasVisible,
        roleCourant: window.currentUserRole || null,
        nomCourant: window.currentUserName || null
    };
});
console.log('--- selecteur de fonction ---');
console.log(JSON.stringify(selectorInfo, null, 2));

await new Promise((resolve) => setTimeout(resolve, 600));
await shot('02-tableau-de-bord');

const tabs = ['effectif', 'matchs', 'entrainements', 'calendrier', 'district', 'staff', 'admin'];
const tabReport = [];
for (const tab of tabs) {
    const outcome = await page.evaluate((id) => {
        try {
            if (typeof window.switchTab !== 'function') return 'switchTab absent';
            window.switchTab(id);
            const section = document.getElementById('sec-' + id);
            if (!section) return 'section absente';
            return section.classList.contains('hidden') ? 'section masquee' : 'section affichee';
        } catch (error) {
            return 'exception : ' + error.message;
        }
    }, tab);
    tabReport.push(tab + ' -> ' + outcome);
    await new Promise((resolve) => setTimeout(resolve, 400));
    await shot('03-' + tab);
}

const stateInfo = await page.evaluate(() => ({
    ecranPinPresent: !!document.getElementById('pin-screen'),
    feuilleTailwindChargee: Array.from(document.styleSheets).some((sheet) => String(sheet.href || '').includes('tailwind.css')),
    cartesEffectif: document.querySelectorAll('#effectif-full-container > *').length,
    lignesConvocations: document.querySelectorAll('#match-convocation-tbody tr').length,
    joueursCharges: (typeof state !== 'undefined' && state.players) ? state.players.length : null,
    matchsCharges: (typeof state !== 'undefined' && state.matches) ? Object.keys(state.matches).length : null,
    sessionFirebase: (() => {
        try { return firebase.auth().currentUser ? 'authentifie' : 'aucune session'; }
        catch (error) { return 'erreur : ' + error.message; }
    })()
}));

console.log('--- CSS calcule sur un element de test ---');
console.log(JSON.stringify(cssCheck, null, 2));
console.log('--- onglets ---');
tabReport.forEach((line) => console.log(line));
console.log('--- etat de page ---');
console.log(JSON.stringify(stateInfo, null, 2));
console.log('--- erreurs JavaScript : ' + pageErrors.length + ' ---');
pageErrors.forEach((error) => console.log('  ' + error));
console.log('--- erreurs console : ' + consoleErrors.length + ' ---');
consoleErrors.slice(0, 15).forEach((error) => console.log('  ' + error.slice(0, 220)));
console.log('--- requetes echouees : ' + failedRequests.length + ' ---');
failedRequests.slice(0, 10).forEach((line) => console.log('  ' + line.slice(0, 160)));
console.log('--- reponses HTTP >= 400 : ' + httpErrors.length + ' ---');
httpErrors.slice(0, 10).forEach((line) => console.log('  ' + line.slice(0, 160)));
console.log('--- captures ---');
shots.forEach((file) => console.log('  ' + file));

await browser.close();
server.close();
