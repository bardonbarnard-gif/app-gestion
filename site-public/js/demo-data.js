/**
 * Rangueil FC — jeu de données de démonstration.
 * Utilisé tant que rangueil_data/pub n'est pas publié, ou hors connexion.
 * Toutes les personnes et tous les résultats sont fictifs.
 */
(function () {
    'use strict';

    function day(offset) {
        const d = new Date();
        d.setHours(12, 0, 0, 0);
        d.setDate(d.getDate() + offset);
        return d.toISOString().slice(0, 10);
    }

    const teams = {
        u7: { name: "U7", color: "cyan", category: "École de foot", coach: "Karim B." },
        u9: { name: "U9", color: "green", category: "École de foot", coach: "Sofiane M." },
        u11: { name: "U11", color: "orange", category: "École de foot", coach: "Julien P." },
        u13: { name: "U13", color: "yellow", category: "Pré-formation", coach: "Mehdi R." },
        u15: { name: "U15", color: "emerald", category: "Formation", coach: "Thomas L." },
        u18: { name: "U18", color: "zinc", category: "Formation", coach: "David C." },
        seniors: { name: "Seniors", color: "sky", category: "Seniors", coach: "Franck D." },
        feminines: { name: "Féminines", color: "pink", category: "Seniors", coach: "Amandine V." }
    };

    const roster = {
        u7: ["Noah", "Adam", "Ilyes", "Maël", "Gabriel", "Sacha", "Rayan"],
        u9: ["Léo", "Yanis", "Nathan", "Ismaël", "Tom", "Eliott", "Malik", "Aaron"],
        u11: ["Lucas", "Enzo", "Hugo", "Amine", "Noé", "Tiago", "Jules", "Wassim"],
        u13: ["Maxime", "Bilal", "Mathis", "Sami", "Antoine", "Ruben", "Youssef", "Clément"],
        u15: ["Théo", "Anas", "Baptiste", "Naël", "Evan", "Ayoub", "Romain", "Ibrahim"],
        u18: ["Quentin", "Adrien", "Amaury", "Ismaël", "Valentin", "Nassim", "Paul", "Killian"],
        seniors: ["Damien", "Yohann", "Alexis", "Reda", "Bastien", "Ludovic", "Sofiane", "Marc"],
        feminines: ["Camille", "Léa", "Sarah", "Inès", "Manon", "Alicia", "Jade", "Fatou"]
    };

    const initials = ["M", "B", "D", "L", "R", "T", "G", "V", "C", "P"];

    const players = [];
    Object.keys(roster).forEach(teamKey => {
        roster[teamKey].forEach((first, i) => {
            players.push({
                id: teamKey + "_" + (i + 1),
                name: first + " " + initials[i % initials.length] + ".",
                team: teamKey,
                poste: "",
                number: ""
            });
        });
    });

    const matches = [
        { id: "D01", team: "u15", opponent: "Toulouse Métropole FC", date: day(2), heure: "15:00", location: "Domicile", adresse: "", pelouse: "Synthétique", type: "Championnat", competition: "U15 D1", journee: "7", scoreHome: "", scoreAway: "", carpoolId: "CP_DEMO_01" },
        { id: "D02", team: "seniors", opponent: "AS Cugnaux", date: day(3), heure: "18:00", location: "Extérieur", adresse: "Stade de Cugnaux", pelouse: "Pelouse", type: "Championnat", competition: "Régional 2", journee: "8", scoreHome: "", scoreAway: "", carpoolId: "CP_DEMO_02" },
        { id: "D03", team: "u11", opponent: "FC Blagnac", date: day(4), heure: "10:30", location: "Domicile", adresse: "", pelouse: "Synthétique", type: "Championnat", competition: "U11 Brassage", journee: "4", scoreHome: "", scoreAway: "", carpoolId: "" },
        { id: "D04", team: "feminines", opponent: "US Colomiers", date: day(9), heure: "16:00", location: "Extérieur", adresse: "Stade René Piquemal", pelouse: "Pelouse", type: "Championnat", competition: "Féminines Régional", journee: "6", scoreHome: "", scoreAway: "", carpoolId: "CP_DEMO_04" },
        { id: "D05", team: "u13", opponent: "Entente Lauragais", date: day(10), heure: "14:00", location: "Domicile", adresse: "", pelouse: "Synthétique", type: "Championnat", competition: "U13 D2", journee: "6", scoreHome: "", scoreAway: "", carpoolId: "" },
        { id: "D06", team: "u18", opponent: "JS Toulouse", date: day(16), heure: "15:30", location: "Domicile", adresse: "", pelouse: "Terrain honneur", type: "Coupe", competition: "Coupe du District", journee: "3e tour", scoreHome: "", scoreAway: "", carpoolId: "CP_DEMO_06" },
        { id: "D07", team: "u9", opponent: "Plateau de Rangueil", date: day(11), heure: "10:00", location: "Domicile", adresse: "", pelouse: "Synthétique", type: "Plateau", competition: "Plateau U9", journee: "", scoreHome: "", scoreAway: "", carpoolId: "" },
        { id: "D08", team: "u15", opponent: "US Castanet", date: day(-6), heure: "15:00", location: "Extérieur", adresse: "Stade de Castanet", pelouse: "Pelouse", type: "Championnat", competition: "U15 D1", journee: "6", scoreHome: "3", scoreAway: "1", carpoolId: "" },
        { id: "D09", team: "seniors", opponent: "FC Portet", date: day(-7), heure: "18:00", location: "Domicile", adresse: "", pelouse: "Terrain honneur", type: "Championnat", competition: "Régional 2", journee: "7", scoreHome: "1", scoreAway: "1", carpoolId: "" },
        { id: "D10", team: "u13", opponent: "AS Muret", date: day(-13), heure: "14:00", location: "Extérieur", adresse: "Stade Clément Ader", pelouse: "Pelouse", type: "Championnat", competition: "U13 D2", journee: "5", scoreHome: "0", scoreAway: "4", carpoolId: "" },
        { id: "D11", team: "feminines", opponent: "TFC Féminines B", date: day(-14), heure: "16:00", location: "Domicile", adresse: "", pelouse: "Synthétique", type: "Championnat", competition: "Féminines Régional", journee: "5", scoreHome: "2", scoreAway: "0", carpoolId: "" },
        { id: "D12", team: "u18", opponent: "AS Tournefeuille", date: day(-20), heure: "15:30", location: "Domicile", adresse: "", pelouse: "Terrain honneur", type: "Championnat", competition: "U18 D1", journee: "4", scoreHome: "4", scoreAway: "2", carpoolId: "" }
    ];

    const news = [
        {
            id: "N1",
            date: day(-1),
            title: "Retour sur un week-end de victoires",
            body: "Les U15 et les féminines s'imposent à domicile, les seniors ramènent le point du match nul. Bravo à tous les joueurs et merci aux bénévoles de la buvette !",
            link: ""
        },
        {
            id: "N2",
            date: day(-4),
            title: "Inscriptions : il reste des places en U9 et U11",
            body: "Vous souhaitez inscrire votre enfant ? Passez au club house le mercredi après-midi avec une photo, un justificatif de domicile et le certificat médical. Une séance d'essai est possible à tout moment.",
            link: ""
        },
        {
            id: "N3",
            date: day(-9),
            title: "Tournoi de Noël : appel aux bénévoles",
            body: "Le traditionnel tournoi de fin d'année aura lieu au complexe du Rangueil. Nous cherchons des bénévoles pour la buvette, la table de marque et le montage des terrains.",
            link: ""
        }
    ];

    window.DEMO_PUB = {
        demo: true,
        publishedAt: null,
        club: null,
        teams: teams,
        players: players,
        matches: matches,
        news: news
    };
})();
