# Rangueil FC — site public

Dossier **autonome** : site vitrine + calendrier + actus + espace famille.
Il ne modifie **aucun** fichier de l'application existante (`index.html`,
`js/app.js`, `covoiturage.html`…). Les deux vivent côte à côte et partagent la
même base Firebase.

```
site-public/
├── index.html               Accueil (prochain match, résultats, actus)
├── calendrier.html          Calendrier + résultats, filtres par équipe
├── match.html               Fiche match (?id=…), itinéraire, partage
├── equipes.html             Équipes et effectifs (Prénom N.)
├── actus.html               Actus du club + revue de presse RSS
├── infos.html               Inscriptions, contacts, horaires, FAQ
├── espace-famille.html      Accès par code PIN (même code que l'app)
├── publier.html             Outil staff : publie les données du site
├── mentions-legales.html    Mentions légales, RGPD, droit à l'image
├── api/rss.js               Proxy RSS (obligatoire, CORS)
├── css/site.css             Design system du site
├── js/config.js             Club, Firebase, flux RSS, contacts
├── js/demo-data.js          Jeu de démonstration (fictif)
├── js/data.js               Lecture de rangueil_data/pub + repli démo
├── js/site.js               Rendu des pages
├── js/publier.js            Projection publique + actus
├── vercel.json              En-têtes de sécurité et de cache
└── assets/logo.svg          Logo provisoire (à remplacer)
```

---

## 1. Démarrage local

Les pages utilisent l'authentification anonyme Firebase : il faut les servir en
HTTP, pas en `file://`.

```bash
npx serve site-public
# ou
python -m http.server 8080 --directory site-public
```

Sans données publiées, le site bascule automatiquement sur le jeu de
démonstration et affiche un bandeau « Site en démonstration ». C'est le
comportement normal au premier lancement.

---

## 2. Déploiement

Sur Vercel : **Root Directory = `site-public`**, framework « Other », aucune
commande de build. `api/rss.js` est détecté comme fonction serverless.

Le site peut aussi être déployé sur un sous-domaine (`club.rangueilfc.fr`) en
laissant l'application interne sur son URL actuelle.

Après déploiement, renseigner dans `js/config.js` :

- `appBaseUrl` : URL de l'application interne (ex. `https://app.rangueilfc.fr/`).
  Aujourd'hui `"../"` fonctionne tant que le site est dans un sous-dossier.
- `club` : adresse, téléphone, e-mail, liens FFF / district / réseaux sociaux.
- `contacts` et `trainingSlots` : page « Le club ».

---

## 3. Brancher les données réelles

Le site ne lit **jamais** `rangueil_data` en entier. Il lit uniquement :

```
rangueil_data/pub
```

Cette projection est écrite par `publier.html` :

1. Ouvrir `/publier.html`, saisir le code PIN du club.
2. L'outil lit `rangueil_data` (équipes, joueurs, matchs) et prépare un aperçu.
3. Cliquer sur **Publier sur le site**.

À chaque publication, les champs privés sont écartés : licence, téléphone,
date de naissance, adresse, blessures, convocations, compositions, notes du
coach. Les joueurs sont convertis en « Prénom N. ».

### Schéma de `rangueil_data/pub`

```jsonc
{
  "publishedAt": 1762500000000,
  "publishedBy": "Thomas",
  "club":    { "name": "Rangueil FC", "city": "Toulouse", "…": "…" },
  "teams":   { "u15": { "name": "U15", "color": "emerald", "category": "Formation", "coach": "Thomas L." } },
  "players": [ { "id": "J001", "name": "Théo B.", "team": "u15", "poste": "DC", "number": "4" } ],
  "matches": [ {
    "id": "M1762…", "team": "u15", "opponent": "Toulouse Métropole FC",
    "date": "2026-11-15", "heure": "15:00", "location": "Domicile",
    "adresse": "", "pelouse": "Synthétique", "type": "Championnat",
    "competition": "U15 D1", "journee": "7",
    "scoreHome": "", "scoreAway": "", "carpoolId": "CP_1762…"
  } ],
  "news": [ { "id": "N1762…", "date": "2026-11-06", "title": "…", "body": "…", "link": "" } ]
}
```

`carpoolId` est conservé pour que l'espace famille puisse ouvrir la page de
covoiturage existante (`covoiturage.html?id=CP_…`).

---

## 4. Règles Firebase

Le nœud public doit être lisible sans être connecté, et écrit uniquement par le
staff. **Deux options**, à choisir dans la console Firebase.

### Option A — compatible avec l'application actuelle (immédiat)

L'application s'authentifie anonymement et écrit dans `rangueil_data`. Tant que
les règles autorisent les utilisateurs authentifiés, `publier.html` fonctionne
sans rien changer :

```json
{
  "rules": {
    "rangueil_data": {
      ".read": "auth != null",
      ".write": "auth != null",
      "pub": { ".read": true }
    }
  }
}
```

⚠️ La seule barrière à la publication est alors le code PIN saisi dans
`publier.html` (contrôle côté navigateur). C'est le même niveau de protection
que l'application actuelle — à considérer comme un outil interne, pas comme une
administration sécurisée.

### Option B — recommandée

Créer un compte Firebase Auth dédié (`site@rangueilfc.fr`, e-mail/mot de passe)
et n'autoriser que lui à écrire `pub` :

```json
{
  "rules": {
    "rangueil_data": {
      ".read": "auth != null",
      ".write": "auth != null",
      "pub": {
        ".read": true,
        ".write": "auth != null && auth.token.email === 'site@rangueilfc.fr'"
      }
    }
  }
}
```

Cette variante suppose que l'application n'écrive plus `rangueil_data` d'un seul
bloc (sinon la règle du parent s'applique). À mettre en place lors d'une
évolution de l'application.

---

## 5. Revue de presse RSS

Les flux ne sont pas lisibles directement depuis un navigateur (CORS) : tout
passe par `api/rss.js`.

| Clé        | Source                | Flux |
|------------|-----------------------|------|
| `rmc`      | RMC Sport             | `rmcsport.bfmtv.com/rss/football/` |
| `lequipe`  | L'Équipe              | `dwh.lequipe.fr/api/edito/rss?path=/Football/` |
| `sofoot`   | SOFOOT                | `sofoot.com/rss` |
| `mercato`  | Foot Mercato          | `footmercato.net/flux-rss` |
| `district` | District Haute-Garonne| Google News `site:haute-garonne.fff.fr` |

- Réponse JSON : `{ source, site, items: [{ title, link, date, summary, image }] }`.
- Cache CDN 15 minutes (`s-maxage=900`).
- Le site affiche **titre + extrait + lien** vers la source, jamais l'article
  complet.
- Ajouter ou retirer un flux : `FEEDS` dans `api/rss.js` **et** `rss` dans
  `js/config.js`.
- Hors Vercel (ouverture en local sans fonction serveur), la page affiche un
  message d'indisponibilité et les liens vers les sites sources.

---

## 6. Espace famille

- Même code PIN à 4 chiffres que l'application (`rangueil_data/access/<PIN>`).
- Affiche les prochains matchs des équipes rattachées au profil et les liens de
  covoiturage des matchs concernés.
- Ne lit aucune donnée nominative : convocations, compositions et réponses de
  covoiturage restent dans l'application interne.
- Session mémorisée dans `sessionStorage`, effacée à la fermeture de l'onglet.

Limite connue et assumée : le PIN est vérifié côté navigateur, comme dans
l'application. Un code à 4 chiffres reste brute-forçable (10 000 essais). Pour
aller plus loin, il faudra une vraie authentification Firebase (e-mail + mot de
passe ou lien magique) — hors périmètre de ce dossier.

---

## 7. Données publiques / privées

| Publié                                   | Jamais publié |
|------------------------------------------|----------------|
| Nom du club, ville, terrain, contacts    | Licences, dates de naissance |
| Équipes, catégories, éducateurs          | Téléphones des parents et des joueurs |
| Calendrier, scores, compétitions         | Adresses personnelles |
| Joueurs au format « Prénom N. »          | Blessures, suspensions, notes du coach |
| Actualités du club                       | Convocations, compositions, réponses de covoiturage |

Le site est en `noindex` sur `publier.html` et `espace-famille.html`.

---

## 8. Personnalisation rapide

- **Couleurs / typo** : variables en tête de `css/site.css`.
- **Logo** : remplacer `assets/logo.svg` par le logo du club (`rangueil HQ.png`
  convient très bien : le copier dans `site-public/assets/` puis mettre à jour
  les balises `href`/`src` et `og:image`).
- **Textes du club** : `js/config.js` (`club`, `contacts`, `trainingSlots`) et
  `infos.html` pour les contenus rédigés.
- **Mentions légales** : compléter `mentions-legales.html` (SIREN, président,
  hébergeur définitif) avant mise en ligne.

---

## 9. Ce qui n'est pas inclus

- Pas de compte utilisateur ni de mot de passe : l'espace famille réutilise le
  PIN existant.
- Pas de paiement ni d'inscription en ligne.
- Pas de galerie photo (à ajouter quand les autorisations d'image seront
  centralisées).
- Pas de service worker / PWA : le site fonctionne sans cache hors ligne.
- Pas de génération automatique d'aperçus Open Graph par match (nécessiterait
  une fonction serveur supplémentaire).
