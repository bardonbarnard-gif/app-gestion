/**
 * Rangueil FC — proxy RSS pour le site public.
 *
 * Route : /api/rss?feed=rmc
 * Pourquoi un proxy : les flux RSS ne sont pas lisibles en JavaScript
 * depuis un autre domaine (CORS). On récupère côté serveur, on nettoie,
 * et on renvoie un JSON léger.
 *
 * Aucune dépendance : le XML est lu avec des expressions régulières.
 */

const FEEDS = {
  rmc: { name: "RMC Sport", url: "https://rmcsport.bfmtv.com/rss/football/" },
  lequipe: { name: "L'Équipe", url: "https://dwh.lequipe.fr/api/edito/rss?path=/Football/" },
  sofoot: { name: "SOFOOT", url: "https://www.sofoot.com/rss" },
  mercato: { name: "Foot Mercato", url: "https://www.footmercato.net/flux-rss" },
  district: {
    name: "District Haute-Garonne",
    url: "https://news.google.com/rss/search?q=site:haute-garonne.fff.fr&hl=fr&gl=FR&ceid=FR:fr",
  },
};

const MAX_ITEMS = 12;
const MAX_SUMMARY = 220;

function decodeEntities(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value) {
  return decodeEntities(String(value || "").replace(/<[^>]*>/g, " "));
}

function truncate(value, max) {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}

function tagValue(block, tag) {
  const match = block.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
  return match ? decodeEntities(match[1]) : "";
}

function extractLink(block) {
  const href = block.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (href) return decodeEntities(href[1]);
  return tagValue(block, "link");
}

function extractImage(block) {
  const patterns = [
    /<enclosure[^>]*url=["']([^"']+)["']/i,
    /<media:content[^>]*url=["']([^"']+)["']/i,
    /<media:thumbnail[^>]*url=["']([^"']+)["']/i,
    /<img[^>]*src=["']([^"']+)["']/i,
  ];
  for (const pattern of patterns) {
    const match = block.match(pattern);
    if (match) return decodeEntities(match[1]);
  }
  return "";
}

function parseFeed(xml) {
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/gi) || [];

  return blocks.slice(0, MAX_ITEMS).map((block) => {
    const title = tagValue(block, "title");
    const description =
      tagValue(block, "description") ||
      tagValue(block, "summary") ||
      tagValue(block, "content:encoded") ||
      tagValue(block, "content");

    return {
      title: title || "Sans titre",
      link: extractLink(block),
      date:
        tagValue(block, "pubDate") ||
        tagValue(block, "dc:date") ||
        tagValue(block, "published") ||
        tagValue(block, "updated"),
      summary: truncate(stripHtml(description), MAX_SUMMARY),
      image: extractImage(block),
    };
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed, use GET" });
    return;
  }

  const feedKey = String(req.query.feed || "rmc").toLowerCase();
  const feed = FEEDS[feedKey];

  if (!feed) {
    res.status(400).json({
      error: "Flux inconnu",
      available: Object.keys(FEEDS),
    });
    return;
  }

  try {
    const upstream = await fetch(feed.url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (compatible; RangueilFC/1.0)",
        "Accept-Language": "fr-FR,fr;q=0.9",
      },
    });

    if (!upstream.ok) {
      res.status(502).json({ error: "Flux indisponible (HTTP " + upstream.status + ")", source: feed.name });
      return;
    }

    const xml = await upstream.text();
    const items = parseFeed(xml);

    if (!items.length) {
      res.status(502).json({ error: "Aucun article dans le flux", source: feed.name });
      return;
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=1800");
    res.status(200).json({ source: feed.name, site: feed.url, items });

  } catch (error) {
    res.status(502).json({ error: "Proxy RSS : " + (error.message || String(error)) });
  }
}
