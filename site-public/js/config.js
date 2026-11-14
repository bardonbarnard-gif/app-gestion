/**
 * Rangueil FC — configuration du site public
 * Tout ce qui est propre au club est centralisé ici.
 */
window.SITE_CONFIG = {

    /* ---------------------------------------------------------------
       Identité du club (sert de valeur par défaut si le nœud
       rangueil_data/pub/club n'est pas encore publié)
       --------------------------------------------------------------- */
    club: {
        name: "Rangueil FC",
        shortName: "Rangueil",
        city: "Toulouse",
        founded: 1974,
        stadium: "Complexe sportif du Rangueil",
        address: "Complexe sportif du Rangueil, 31400 Toulouse",
        email: "contact@rangueilfc.fr",
        phone: "",
        fffNumber: "18707",
        colors: "Bleu et blanc",
        fffUrl: "https://www.fff.fr/",
        districtUrl: "https://haute-garonne.fff.fr/",
        facebook: "",
        instagram: ""
    },

    /* ---------------------------------------------------------------
       Firebase — clé publique, identique à js/firebase-config.js
       --------------------------------------------------------------- */
    firebase: {
        apiKey: "AIzaSyBVdcpzLr_VxfLTvN8kpkNv69Hc4xdzct0",
        authDomain: "ai-studio-applet-webapp-1b612.firebaseapp.com",
        databaseURL: "https://ai-studio-applet-webapp-1b612-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "ai-studio-applet-webapp-1b612",
        storageBucket: "ai-studio-applet-webapp-1b612.firebasestorage.app",
        messagingSenderId: "279839540206",
        appId: "1:279839540206:web:a5d82ea7b4d9a9cf9d84ff"
    },

    /* ---------------------------------------------------------------
       Données
       dataMode :
         "auto"  → lecture de rangueil_data/pub, bascule en démonstration
                   si le nœud est vide ou inaccessible (défaut)
         "demo"  → données de démonstration uniquement
       --------------------------------------------------------------- */
    dataMode: "auto",
    dataPath: "rangueil_data/pub",
    accessPath: "rangueil_data/access",

    /* ---------------------------------------------------------------
       Application interne (convocations, covoiturage…)
       Laisser "../" tant que le site public est dans un sous-dossier.
       En production : mettre l'URL complète de l'app, par ex.
       "https://app.rangueilfc.fr/"
       --------------------------------------------------------------- */
    appBaseUrl: "../",

    /* ---------------------------------------------------------------
       Flux presse — servis par api/rss.js (obligatoire : CORS)
       --------------------------------------------------------------- */
    rssEndpoint: "api/rss",
    rss: [
        { id: "rmc", label: "RMC Sport", hint: "Football", site: "https://rmcsport.bfmtv.com/football/" },
        { id: "lequipe", label: "L'Équipe", hint: "Football", site: "https://www.lequipe.fr/Football/" },
        { id: "sofoot", label: "SOFOOT", hint: "Magazine", site: "https://www.sofoot.com/" },
        { id: "mercato", label: "Foot Mercato", hint: "Transferts", site: "https://www.footmercato.net/" },
        { id: "district", label: "District 31", hint: "Haute-Garonne", site: "https://haute-garonne.fff.fr/" }
    ],

    /* ---------------------------------------------------------------
       Contacts affichés sur la page « Le club »
       --------------------------------------------------------------- */
    contacts: [
        { role: "Président", name: "À compléter", email: "", phone: "" },
        { role: "Secrétariat / licences", name: "À compléter", email: "contact@rangueilfc.fr", phone: "" },
        { role: "École de foot", name: "À compléter", email: "", phone: "" }
    ],

    /* ---------------------------------------------------------------
       Créneaux d'entraînement affichés (modifiable librement)
       --------------------------------------------------------------- */
    trainingSlots: [
        { day: "Mardi", time: "17h30 – 19h00", who: "U7 – U11", place: "Synthétique" },
        { day: "Jeudi", time: "17h30 – 19h00", who: "U13 – U15", place: "Synthétique" },
        { day: "Vendredi", time: "19h00 – 21h00", who: "U18 – Seniors", place: "Terrain honneur" }
    ]
};
