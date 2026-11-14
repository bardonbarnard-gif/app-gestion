/* Rangueil FC - Equipes, selecteur de fonction et familles de joueurs
   Partie 11/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
function openModalTeam(teamId = null) {

    const titleEl = document.getElementById('modal-team-title');
    const idHidden = document.getElementById('team-id');
    const keyInput = document.getElementById('team-key');
    const nameInput = document.getElementById('team-name');
    const targetInput = document.getElementById('team-target');
    const form = document.getElementById('form-team');

    if (form) form.reset();

    if (teamId && state.teams?.[teamId]) {

        const team = state.teams[teamId];

        if (titleEl) titleEl.textContent = "Modifier l'équipe";
        if (idHidden) idHidden.value = teamId;
        if (keyInput) {
            keyInput.value = teamId;
            keyInput.disabled = true;
        }
        if (nameInput) nameInput.value = team.name || '';
        if (targetInput) targetInput.value = team.targetConvocations || 14;
        const orderInputTeam = document.getElementById('team-name-order');
        if (orderInputTeam) orderInputTeam.checked = team.nameOrder === 'first';

    } else {

        if (titleEl) titleEl.textContent = 'Nouvelle équipe';
        if (idHidden) idHidden.value = '';
        if (keyInput) {
            keyInput.value = '';
            keyInput.disabled = false;
        }
        if (targetInput) targetInput.value = 14;
        const orderInputNew = document.getElementById('team-name-order');
        if (orderInputNew) orderInputNew.checked = false;

    }

    toggleModal('modal-team', true);
}
function editTeam(teamId) {
    openModalTeam(teamId);
}

function handleSaveTeamModal(event) {
    event.preventDefault();

    const existingId = document.getElementById('team-id').value;
    const keyInput = document.getElementById('team-key');
    const nameInput = document.getElementById('team-name');
    const targetInput = document.getElementById('team-target');

    const key = existingId || (keyInput.value.trim().toLowerCase());
    const name = nameInput.value.trim();
    const target = parseInt(targetInput.value) || 14;

    if (!key || !name) return;

    const orderInputSave = document.getElementById('team-name-order');
    const nameOrder = orderInputSave && orderInputSave.checked ? 'first' : 'last';

    firebase.database().ref('teams/' + key).set({
        ...(state.teams?.[key] || {}),
        name: name,
        targetConvocations: target,
        nameOrder: nameOrder
    }, (error) => {
        if (error) {
            showToast("Erreur lors de l'enregistrement de l'équipe.", "error");
            return;
        }
        toggleModal('modal-team', false);
        showToast("✅ Équipe enregistrée");
    });
}

window.openModalTeam = openModalTeam;
window.editTeam = editTeam;
window.deleteTeam = deleteTeam;
window.handleSaveTeamModal = handleSaveTeamModal;

function showFunctionSelector(userData) {

    const screen =
        document.getElementById(
            "function-selector-screen"
        );

    const list =
        document.getElementById(
            "function-selector-list"
        );

    const pinScreen =
        document.getElementById(
            "pin-screen"
        );

    if (pinScreen) {
        pinScreen.style.display = "none";
    }

    if (!screen || !list) return;

    list.innerHTML = "";

    const nameEl =
        document.getElementById(
            "fs-user-name"
        );

    if (nameEl && userData.name) {
        nameEl.textContent = userData.name;
    }

    const iconFor = (name = "") => {
        if (name.includes("Administrateur")) {
            return '<i class="fa-solid fa-shield-halved"></i>';
        }
        if (name.startsWith("Responsable")) {
            return '<i class="fa-solid fa-user-gear"></i>';
        }
        if (name.includes("Éducateur")) {
            return '<i class="fa-solid fa-graduation-cap"></i>';
        }
        if (name.toLowerCase().includes("coach")) {
            return '<i class="fa-solid fa-chalkboard-user"></i>';
        }
        if (name.includes("Dirigeant")) {
            return '<i class="fa-solid fa-handshake"></i>';
        }
        return '<i class="fa-solid fa-circle-user"></i>';
    };

    (userData.functions || [])
    .forEach((func, index) => {

            const scopes =
                (func.scopes || [])
                .map(scope =>
                    state.teams?.[scope]?.name ||
                    scope
                )
                .join(", ");

            const scopeLine = scopes
                ? `<i class="fa-solid fa-location-dot"></i> ${scopes}`
                : `<i class="fa-solid fa-earth-europe"></i> Accès global`;

            list.innerHTML += `

                <button
                    type="button"
                    class="fs-option"
                    onclick="selectFunction('${userData.pin}', ${index})">

                    <span class="fs-option-icon">
                        ${iconFor(func.functionName)}
                    </span>

                    <span class="fs-option-text">
                        <span class="fs-option-title">
                            ${func.functionName}
                        </span>
                        <span class="fs-option-scope">
                            ${scopeLine}
                        </span>
                    </span>

                    <i class="fa-solid fa-chevron-right fs-option-arrow"></i>

                </button>

            `;

        });

        screen.classList.remove("hidden");

}

function hideFunctionSelector() {

    document
        .getElementById(
            "function-selector-screen"
        )
        ?.classList.add("hidden");

}

window.selectFunction = function (
    pin,
    functionIndex
) {

    firebase.database()
        .ref("rangueil_data/access/" + pin)
        .once("value")
        .then(snapshot => {

            if (!snapshot.exists()) {
                return;
            }

            const userData =
                snapshot.val();
if (userData.role === "admin") {

    window.currentUserRole = "admin";

    window.currentUserName =
        userData.name;

    window.currentUserTeam = "all";

    sessionStorage.setItem(
        "currentUserData",
        JSON.stringify(userData)
    );

    sessionStorage.setItem(
        "currentUserRole",
        "admin"
    );

    sessionStorage.setItem(
        "isUnlocked",
        "true"
    );

    if (pinScreen) {

        pinScreen.style.opacity = "0";

        pinScreen.style.transition =
            "opacity 0.3s ease";

        setTimeout(() => {

            pinScreen.remove();

            applyPermissions();

        }, 300);

    }

    return;

}
            const selectedFunction =
    (userData.functions || [])
    [functionIndex];

            if (!selectedFunction) {
                return;
            }

            let role = "public";

            if (
    selectedFunction.functionName ===
    "Administrateur système"
) {
    role = "admin";
}

            const functionName =
    selectedFunction.functionName || "";

if (functionName.startsWith("Responsable")) {
    role = "responsable";
}


            if (
    selectedFunction?.functionName === "Éducateur principal" ||
    selectedFunction?.functionName === "Éducateur adjoint" ||
    selectedFunction?.functionName === "Coach Principal" ||
    selectedFunction?.functionName === "Coach Adjoint"
) {
    role = "coach";
}

            window.currentUserPin =
                pin;

            window.currentUserRole =
                role;

            window.currentUserName =
                userData.name;

            window.currentUserTeam =
                (selectedFunction.scopes || [])
                    .join(",");

            sessionStorage.setItem(
                "currentUserData",
                JSON.stringify({
                    ...userData,
                    role: role,
                    team: window.currentUserTeam
                })
            );

            sessionStorage.setItem(
                "currentUserRole",
                role
            );

            sessionStorage.setItem(
                "isUnlocked",
                "true"
            );

            hideFunctionSelector();

            const pinScreen =
                document.getElementById(
                    "pin-screen"
                );

            if (pinScreen) {

                pinScreen.style.opacity =
                    "0";

                setTimeout(() => {

                    pinScreen.remove();

                    applyPermissions();
                }, 300);

            }

        });

};

function buildStaffFromAccounts(accounts) {

    const technicalFunctions = [
        "Administrateur système",
        "Administrateur adjoint"
    ];

    const staff = [];

    Object.values(accounts || {})
        .forEach(user => {

            (user.functions || [])
                .forEach(func => {

                    if (
                        technicalFunctions.includes(
                            func.functionName
                        )
                    ) {
                        return;
                    }

                    staff.push({
                        name: user.name,
                        licence: user.licence || "",
                        functionName:
                            func.functionName,
                        scopes:
                            func.scopes || []
                    });

                });

        });

    return staff;

}

function getTeamFamily(teamKey) {
    const teamName =
        (state.teams?.[teamKey]?.name || "")
        .toLowerCase();

    if (
        ["u6","u7","u8","u9","u10","u11"]
        .some(age => teamName.includes(age))
    ) {
        return "École de Foot";
    }

    if (
        ["u12","u13","u14","u15","u16","u17","u18"]
        .some(age => teamName.includes(age))
    ) {
        return "Jeunes";
    }

    return "Seniors";
}
async function renderStaffV2() {

    const container =
        document.getElementById(
            "staff-full-container"
        );

     const directionContainer =
    document.getElementById("staff-direction");

const functionsContainer =
    document.getElementById("staff-functions");

    

const teamsContainer =
    document.getElementById("staff-teams");   

    if (!container) return;

    const snapshot =
        await firebase.database()
            .ref("rangueil_data/access")
            .once("value");

    const accounts =
        snapshot.val() || {};

    const staff =
        buildStaffFromAccounts(
            accounts
        );

       const direction = [];
const clubFunctions = [];
const sportManagement = [];
const directionRoles = [
    "Président",
    "Vice-président",
    "Secrétaire",
    "Secrétaire Général",
    "Trésorier",
    "Trésorier adjoint",
    "Directeur Sportif",
    "Responsable Technique"

];

const sportRoles = [
    "Directeur Sportif",
    "Responsable École de Foot",
    "Responsable Seniors",
    "Responsable Catégorie"
];

const clubRoles = [
    "Correspondant Footclubs",
    "Community Manager",
    "Intendant",
    "Responsable Communication",
    "Responsable Partenaires",
    "Responsable Arbitrage",
    "Responsable Équipements",
    "Responsable Terrains",
    "Responsable Tournois",
    "Responsable Transport",
    "Responsable Buvette",
    "Responsable Manifetations",
    "Référent PEF",
    "Référent Féminines",
    "Référent Handicap",
    "Référent Protection des Mineurs"
];
const teamGroups = {
    "École de Foot": {},
    "Jeunes": {},
    "Seniors": {}
};


    directionContainer.innerHTML = "";
functionsContainer.innerHTML = "";
teamsContainer.innerHTML = "";

   staff.forEach(member => {

    if (
        directionRoles.includes(
            member.functionName
        )
    ) {
        direction.push(member);
        return;
    }

    if (
    sportRoles.includes(
        member.functionName
    )
) {
    sportManagement.push(member);
    return;
}

    if (
        clubRoles.includes(
            member.functionName
        )
    ) {
        clubFunctions.push(member);
        return;
    }

    member.scopes.forEach(scope => {

        const family =
            getTeamFamily(scope);

        if (!teamGroups[family][scope]) {
            teamGroups[family][scope] = [];
        }
        const exists =
    teamGroups[family][scope]
        .some(m =>
            m.name === member.name &&
            m.functionName === member.functionName
        );

if (!exists) {
    teamGroups[family][scope].push(member);
}

    });

});
 
directionContainer.innerHTML += `

<div class="col-span-full">

    <h2 class="text-xl font-bold mb-4">

        👔 Direction

    </h2>

</div>

`;
const directionOrder = {
    "Président": 1,
    "Vice-président": 2,
    "Secrétaire Général": 3,
    "Trésorier": 4,
    "Secrétaire": 5,
    "Trésorier adjoint": 6
};

direction.sort((a, b) =>
    (directionOrder[a.functionName] || 99)
    - (directionOrder[b.functionName] || 99)
);
direction.forEach(member => {

    directionContainer.innerHTML += `

    <div class="bg-white p-4 rounded-xl border">

        <div class="font-bold">

            ${member.name}

        </div>

        <div class="text-sky-700 mt-1">

            👔 ${member.functionName}

        </div>

    </div>

    `;

});

functionsContainer.innerHTML += `
<div class="col-span-full mt-6">
    <h2 class="text-xl font-bold mb-4">
        ⚽ Organisation Sportive
    </h2>
</div>
`;

const sportOrder = {
    "Directeur Sportif": 1,
    "Responsable École de Foot": 2,
    "Responsable Seniors": 3,
    "Responsable Catégorie": 4
};

sportManagement.sort((a, b) =>
    (sportOrder[a.functionName] || 99) -
    (sportOrder[b.functionName] || 99)
);

sportManagement.forEach(member => {

    functionsContainer.innerHTML += `
        <div class="bg-white p-4 rounded-xl border">

            <div class="font-bold text-slate-800">
                ${member.name}
            </div>

            <div class="text-sm text-sky-700 mt-1">
                ⚽ ${member.functionName}
            </div>

        </div>
    `;

});


functionsContainer.innerHTML += `
<div class="col-span-full mt-6">
    <h2 class="text-xl font-bold mb-4">
        ⚙️ Fonctions Club
    </h2>
</div>
`;

clubFunctions.forEach(member => {


    const scopes =
        member.scopes
            .map(scope =>
                state.teams?.[scope]?.name
                || scope
            )
            .join(", ");

    functionsContainer.innerHTML += `

    <div class="bg-white p-4 rounded-xl border">

        <div class="font-bold text-slate-800">

            ${member.name}

        </div>

        <div class="text-sm text-sky-700 mt-1">

           👔 ${member.functionName}

        </div>

        <div class="text-xs text-slate-500 mt-1">

            📍 ${scopes}

        </div>

    </div>

    `;

});

Object.entries(teamGroups).forEach(([poleName, teams]) => {

    let teamsHtml = "";

    Object.entries(teams)
.sort(([a], [b]) => {

    const nameA =
        state.teams?.[a]?.name || a;

    const nameB =
        state.teams?.[b]?.name || b;

    const numA =
        parseInt(
            (nameA.match(/U(\d+)/i) || [])[1]
        ) || 999;

    const numB =
        parseInt(
            (nameB.match(/U(\d+)/i) || [])[1]
        ) || 999;

    return numA - numB;

})
.forEach(([teamKey, members]) => {

        const teamName =
            state.teams?.[teamKey]?.name || teamKey;

        

        let membersHtml = "";

members
    .filter(member =>
        member.functionName !== "Responsable Catégorie" &&
        member.functionName !== "Responsable catégorie"
    )
    .forEach(member => {

        membersHtml += `
            <div class="bg-slate-50 p-3 rounded-lg">

                <div class="font-bold text-slate-800">
                    ${member.name}
                </div>

                <div class="text-sm text-sky-700">
                    ${member.functionName}
                </div>

            </div>
        `;

    });

teamsHtml += `
    <div class="ml-4 border-l-4 border-sky-200 pl-4">

        <details class="bg-white border rounded-xl overflow-hidden">

            <summary class="cursor-pointer p-3 font-semibold text-slate-800">
                ⚽ ${teamName}
            </summary>

            <div class="p-4 border-t flex flex-col gap-2">
                ${membersHtml}
            </div>

        </details>

    </div>
`;
    

    });

   teamsContainer.innerHTML += `
    <div class="mt-6">

        <details open class="bg-slate-100 rounded-xl overflow-hidden">

            <summary class="cursor-pointer p-4 font-bold text-slate-900">
                ⚽ ${poleName}
            </summary>

            <div class="p-4 flex flex-col gap-4">
                ${teamsHtml}
            </div>

        </details>

    </div>
`;

});

}
const POSTE_LIBELLES = {
    AD: 'Ailier droit',
    AG: 'Ailier gauche',
    BU: 'Buteur',
    DC: 'Défenseur central',
    DD: 'Défenseur droit',
    DG: 'Défenseur gauche',
    MC: 'Milieu central',
    MDC: 'Milieu défensif',
    MD: 'Milieu défensif',
    MO: 'Milieu offensif',
    MOC: 'Milieu offensif central',
    GB: 'Gardien',
    Gardien: 'Gardien',
    Remplaçant: 'Remplaçant'
};

