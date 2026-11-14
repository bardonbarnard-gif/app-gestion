/**
 * Proxy FFF local + serveur statique — à lancer pour tester en local sans déployer
 * Usage: node proxy-local.js  (puis ouvre http://localhost:3001)
 * Sert index.html + proxy /api/fff?path=...
 */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const PORT = 3001;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Proxy FFF : /api/fff?path=/api/...  ou  /?path=...  ou  /api/fff?url=...
  if (url.pathname === '/api/fff' || url.searchParams.has('path') || url.searchParams.has('url')) {
    let target = url.searchParams.get('path') || url.searchParams.get('url') || '';
    // Support aussi /api/fff?path=/api/clubs/...  et  /?path=...
    if (!target && url.pathname.startsWith('/api/fff/')) {
      target = url.pathname.replace('/api/fff', '');
    }
    if (!target) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Paramètre path ou url manquant. Utilisez /api/fff?path=/api/clubs/18707/calendrier' }));
      return;
    }
    if (!target.startsWith('http')) {
      if (!target.startsWith('/')) target = '/' + target;
      target = 'https://api-dofa.fff.fr' + target;
    }
    let u;
    try { u = new URL(target); } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'URL invalide' }));
      return;
    }
    if (!u.hostname.endsWith('fff.fr')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Domaine non autorisé: ' + u.hostname }));
      return;
    }
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.fff.fr/',
        'Accept-Language': 'fr-FR,fr;q=0.9'
      }
    };
    const proxyReq = https.request(opts, proxyRes => {
      let data = '';
      proxyRes.on('data', c => data += c);
      proxyRes.on('end', () => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        });
        res.end(data);
      });
    });
    proxyReq.on('error', e => {
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: e.message }));
    });
    proxyReq.end();
    return;
  }

  // Fichiers statiques
  let urlPath = url.pathname;
  try { urlPath = decodeURIComponent(urlPath); } catch (e) { /* chemin mal encodé : on garde tel quel */ }
  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  // Sécurité : reste dans ROOT
  if (!filePath.startsWith(ROOT)) filePath = path.join(ROOT, 'index.html');
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Fallback index.html pour SPA
      filePath = path.join(ROOT, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  });
}).listen(PORT, () => {
  console.log(`✓ Serveur local sur http://localhost:${PORT}`);
  console.log(`  Ouvre http://localhost:${PORT} dans Chrome`);
  console.log(`  Proxy FFF sur http://localhost:${PORT}/api/fff?path=/api/clubs/18707/calendrier`);
});
