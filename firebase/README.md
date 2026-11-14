# Sécurisation Firebase — Rangueil FC

## Le problème en une phrase

Les trois applications (`index.html`, `covoiturage.html`, `site-public/`)
s'authentifient **anonymement** (`firebase.auth().signInAnonymously()`), et les
règles actuelles accordent lecture et écriture à tout utilisateur authentifié —
c'est-à-dire à n'importe qui, puisque l'authentification anonyme est ouverte à
tous et que la configuration Firebase est publique.

Conséquence : l'effectif complet (noms de mineurs, licences FFF, téléphones des
parents), les comptes du staff (`rangueil_data/access/<pin>` avec nom, e-mail,
téléphone) et l'intégralité des données du club sont **lisibles et
modifiables** par toute personne qui ouvre le site. Le code PIN à 4 chiffres est
vérifié côté navigateur : il n'apporte aucune protection.

## La cible

`firebase/database.rules.json` :

- liste blanche d'UID dans `/admins`, **illisible** par les clients
  (les règles, elles, peuvent la consulter via `root.child(...)`) ;
- `rangueil_data` et `teams` : réservés aux UID de `/admins` ;
- `rangueil_data/pub` : lecture publique (site vitrine), écriture réservée au staff.

Aucune fonction Cloud, aucun plan payant nécessaire.

## Séquence de déploiement

L'ordre est important : les règles strictes **cassent l'application** tant que
le staff ne dispose pas d'un vrai compte. Ne pas sauter d'étape.

### Étape 0 — 5 minutes, aucun risque (à faire tout de suite)

1. **Restreindre la clé API** : Google Cloud Console → API et services →
   Identifiants → la clé `AIzaSyBV…` → *Restrictions relatives aux applications*
   → *Sites web* → ajouter `rangueilfc.fr/*`, `*.vercel.app/*`, `localhost/*`.
2. **Activer App Check** (console Firebase → App Check → Realtime Database →
   reCAPTCHA v3) en mode **surveillance** (non bloquant). Cela journalise les
   requêtes venant d'un domaine non autorisé sans rien casser.

Ces deux mesures n'exigent aucune modification de code et bloquent déjà
l'exploitation de la base depuis un site tiers.

### Étape 1 — Le staff obtient un vrai compte

Console Firebase → Authentication → *Commencer* → activer **E-mail/Mot de passe**,
puis créer un compte par éducateur (ou un compte partagé `staff@rangueilfc.fr`
pour démarrer).

Puis, dans Realtime Database → Données, créer à la main :

```
admins
  └── <uid du compte>  : true
```

L'UID se lit dans Authentication → onglet Utilisateurs.

### Étape 2 — Le code se connecte réellement

Aujourd'hui : `js/app.js:324`, `covoiturage.html:19`, `site-public/js/data.js:33`
appellent `signInAnonymously()`. Il faut les remplacer par une connexion
`signInWithEmailAndPassword()`, avec la session mémorisée pour ne pas redemander
le mot de passe à chaque ouverture (le PIN reste l'écran d'accueil, mais il ne
fait plus office d'authentification).

Fichiers concernés :

| Fichier | Ligne | À remplacer |
|---|---|---|
| `js/app.js` | 324 | `signInAnonymously()` |
| `js/app.js` | 147 | lecture de `rangueil_data/access/<pin>` pour identifier l'utilisateur |
| `covoiturage.html` | 19 | `signInAnonymously()` |
| `site-public/js/data.js` | 33 | `signInAnonymously()` (lecture de `pub` : peut rester anonyme) |
| `site-public/js/publier.js` | 319 | écriture de `pub` : doit exiger un compte staff |

### Étape 3 — Déployer les règles

Console Firebase → Realtime Database → Règles → coller le contenu de
`firebase/database.rules.json` → **Publier**.

Avec la CLI (équivalent, versionné) :

```bash
npm i -g firebase-tools
firebase login
firebase use ai-studio-applet-webapp-1b612
firebase deploy --only database
```

La CLI attend un `firebase.json` à la racine :

```json
{
  "database": {
    "rules": "firebase/database.rules.json"
  }
}
```

### Étape 4 — Vérifier

- `index.html` ouvert sans être connecté → écran PIN, puis refus d'accès aux données.
- Console du navigateur : aucune erreur `PERMISSION_DENIED` après connexion staff.
- `site-public/` → les pages s'affichent (lecture de `pub` ouverte).
- `publier.html` sans compte staff → écriture refusée.

## Point de vigilance : les écritures globales

`js/app.js:434` (`saveStateToFirebase`) réécrit **tout** `rangueil_data` à chaque
action. Tant que ce comportement existe, aucune règle ne peut être plus fine que
« tout ou rien » sur ce nœud, et deux éducateurs connectés en même temps
s'écrasent mutuellement. Le passage à des écritures ciblées (`update()` sur le
seul chemin modifié) est un préalable à toute règle plus granulaire.

## Reste à faire après cette étape

- [ ] Migrer les PDF (`trainings/*/pdfData`, base64 en base) vers Firebase Storage.
- [ ] Sortir les écritures globales (`saveStateToFirebase`).
- [ ] Supprimer la double source `teams` (racine `teams` vs `rangueil_data/teams`).
- [ ] Passer les mots de passe staff en vraie authentification (le PIN ne doit
      plus jamais servir de secret).
