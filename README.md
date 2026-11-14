# Rangueil FC

Deux applications cohabitent dans ce dépôt et partagent la même base Firebase
(`rangueil_data`) :

| Dossier        | Rôle                                                                 |
|----------------|----------------------------------------------------------------------|
| `index.html`, `covoiturage.html`, `js/app-01-*.js` … `js/app-15-*.js`, `css/`, `api/` | Application interne du club : effectifs, calendrier FFF, convocations, covoiturage, feuille de match PDF. |
| `site-public/` | Site vitrine autonome : calendrier, résultats, équipes, actus, espace famille et outil de publication. |

## Application interne

Ouvrir `index.html` (ou passer par `proxy-local.js` pour disposer du proxy FFF) :

```bash
node proxy-local.js   # http://localhost:3001
```

Le proxy `api/fff.js` contourne le blocage Akamai de l'API FFF et est déployé
sur Vercel (`vercel.json`).

Le JavaScript applicatif est réparti en quinze fichiers `js/app-*.js` chargés
dans l'ordre par `index.html` (aucun code modifié par le découpage).

## Styles (Tailwind)

Les utilitaires Tailwind sont compilés en amont dans `css/tailwind.css`, chargé
par `index.html` et `covoiturage.html`. Il n'y a plus de CDN : le compilateur
n'est donc plus téléchargé ni exécuté dans le navigateur.

```bash
npm install          # une seule fois
npm run build:css    # après toute modification de classes dans le HTML/JS
npm run watch:css    # pendant le développement
```

Les couleurs d'équipe sont construites dynamiquement dans
`getTeamColorClasses()` : toute nouvelle couleur doit être ajoutée à la
safelist de `tailwind.config.js`, sinon ses classes ne seront pas générées.

## Site public

Voir [`site-public/README.md`](site-public/README.md) : structure des fichiers,
schéma de `rangueil_data/pub`, règles Firebase, déploiement et personnalisation.

## Outils

- `Lancer-agent.bat` / `Creer-raccourci-bureau.bat` : lancement de l'agent de
  développement depuis Windows.
- `npm run test:browser` : test navigateur (Chrome headless piloté par
  `puppeteer-core`). Sert le projet sur un port local, charge `index.html`,
  contrôle que le CSS compilé s'applique, parcourt les onglets et capture les
  erreurs JavaScript dans `tmp-browser-*.png`.
- `Bibliothèque séance/` : séances d'entraînement PDF classées par catégorie.
- `COULEURS EQUIPES.txt` : correspondance entre les valeurs de couleur
  Firebase et les équipes.
