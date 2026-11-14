/**
 * Rangueil FC — Proxy FFF pour Vercel
 * Route: /api/fff?path=/api/clubs/18707/calendrier?itemsPerPage=1000
 * ou     /api/fff?url=https://api-dofa.fff.fr/api/...
 *
 * Objectif: contourner le blocage Akamai (403) en fetchant côté serveur
 * avec les bons headers. Fonctionne aussi en local si l'app est ouverte
 * via file:// en appelant l'URL absolue du déploiement Vercel.
 */

const FFF_ORIGIN = "https://api-dofa.fff.fr";

export default async function handler(req, res) {
  // CORS — autorise file:// et tous les domaines
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed, use GET" });
    return;
  }

  let targetUrl = "";

  // Support ?url=https://api-dofa.fff.fr/api/...
  if (req.query.url) {
    targetUrl = String(req.query.url);
  } else if (req.query.path) {
    // Support ?path=/api/clubs/18707/calendrier?itemsPerPage=1000
    let p = String(req.query.path);
    if (!p.startsWith("/")) p = "/" + p;
    targetUrl = FFF_ORIGIN + p;
  } else {
    res.status(400).json({
      error: "Paramètre manquant. Utilisez ?path=/api/clubs/18707/calendrier ou ?url=https://...",
    });
    return;
  }

  // Sécurité : n'autorise que le domaine FFF
  try {
    const u = new URL(targetUrl);
    if (u.hostname !== "api-dofa.fff.fr") {
      res.status(400).json({ error: "Domaine non autorisé: " + u.hostname });
      return;
    }
  } catch (e) {
    res.status(400).json({ error: "URL invalide: " + e.message });
    return;
  }

  try {
    const fffRes = await fetch(targetUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://www.fff.fr/",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
    });

    const body = await fffRes.text();

    // Transmet le status FFF tel quel (pour que le client voie les 404/500)
    if (!fffRes.ok) {
      res.status(fffRes.status).setHeader("Content-Type", "application/json");
      // Si c'est du HTML (page 403 Akamai), on renvoie un JSON d'erreur lisible
      if (body.trim().startsWith("<") || body.trim().startsWith("<!")) {
        res.json({ error: "FFF a renvoyé HTTP " + fffRes.status, html: body.slice(0, 2000) });
      } else {
        res.send(body);
      }
      return;
    }

    // Succès : renvoie le JSON tel quel
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(body);
  } catch (err) {
    res.status(502).json({ error: "Proxy FFF erreur: " + (err.message || String(err)) });
  }
}
