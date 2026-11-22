/* Rangueil FC - Calendrier : mois, agenda et evenements
   Partie 15/15 de l'application interne. Decoupage mecanique de l'ancien js/app.js
   (aucun code modifie : l'ordre de chargement dans index.html fait foi). */
var calendarSelectedDate = null;

function calendarDateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function calendarTodayKey() {
    const now = new Date();
    return calendarDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

function calendarItemsForDate(dateKey, selectedTeam) {

    const matches = Object.values(state.matches || {}).filter(match => {

        if (match.date !== dateKey) return false;
        if (selectedTeam !== 'all' && match.team !== selectedTeam) return false;
        return true;

    });

    const trainings = Object.values(state.trainings || {}).filter(training => {

        if (training.date !== dateKey) return false;
        if (selectedTeam !== 'all' && training.team !== selectedTeam) return false;
        return true;

    });

    const events = Object.values(state.events || {}).filter(event => {

        if (event.date !== dateKey) return false;

        if (selectedTeam !== 'all') {
            if (!event.teams) return false;
            if (!event.teams.includes('all') && !event.teams.includes(selectedTeam)) return false;
        }

        return true;

    });

    return { matches, trainings, events };
}

function calendarEventKind(event) {

    if (event.type === 'tournament') {
        return { kind: 'tournament', icon: 'fa-trophy', label: 'Tournoi' };
    }

    if (event.type === 'club') {
        return { kind: 'club', icon: 'fa-champagne-glasses', label: 'Vie du club' };
    }

    return { kind: 'event', icon: 'fa-users', label: 'Événement' };
}

function calendarTeamChip(teamKey) {

    const teamName = state.teams?.[teamKey]?.name || teamKey || '';
    if (!teamName) return '';

    let badge = '';

    try {
        if (typeof getTeamColorClasses === 'function') {
            badge = (getTeamColorClasses(teamKey) || {}).badge || '';
        }
    } catch (error) {
        badge = '';
    }

    return `<span class="cal-team-chip ${badge}">${teamName}</span>`;
}

function renderCalendar() {

    populateCalendarTeamFilter();

    const selectedTeam =
        document.getElementById('calendar-team-filter')?.value || 'all';

    const title =
        document.getElementById('calendar-month-title');

    if (!title) return;

    title.innerText =
        calendarDate.toLocaleDateString(
            'fr-FR',
            { month: 'long', year: 'numeric' }
        );

    const grid =
        document.getElementById('calendar-grid');

    if (!grid) return;

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const todayKey = calendarTodayKey();

    let activeDate = null;

    if (calendarSelectedDate && calendarSelectedDate.startsWith(monthPrefix)) {
        activeDate = calendarSelectedDate;
    } else if (todayKey.startsWith(monthPrefix)) {
        activeDate = todayKey;
    }

    calendarSelectedDate = activeDate;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;

    let cells = '';

    for (let i = 0; i < startOffset; i++) {
        cells += '<div class="cal-cell is-empty" aria-hidden="true"></div>';
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {

        const dateKey = calendarDateKey(year, month, day);
        const { matches, trainings, events } = calendarItemsForDate(dateKey, selectedTeam);

        const items = [
            ...matches.map(match => ({
                kind: 'match',
                icon: 'fa-futbol',
                label: match.opponent || 'Match'
            })),
            ...trainings.map(training => ({
                kind: 'training',
                icon: 'fa-stopwatch',
                label: training.heure || 'Séance'
            })),
            ...events.map(event => {
                const kind = calendarEventKind(event);
                return {
                    kind: kind.kind,
                    icon: kind.icon,
                    label: event.title || kind.label
                };
            })
        ];

        const weekday = new Date(year, month, day).getDay();
        const cellClasses = ['cal-cell'];

        if (weekday === 0 || weekday === 6) cellClasses.push('is-weekend');
        if (items.length > 0) cellClasses.push('has-items');
        if (dateKey === todayKey) cellClasses.push('is-today');
        if (dateKey === activeDate) cellClasses.push('is-selected');

        const readableDate = new Date(year, month, day).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        const summary = items.length
            ? `, ${items.length} événement${items.length > 1 ? 's' : ''}`
            : '';

        cells += `
            <button type="button"
                    class="${cellClasses.join(' ')}"
                    onclick="showEventsForDate('${dateKey}', this)"
                    aria-label="${readableDate}${summary}">

                <span class="cal-daynum">${day}</span>

                <span class="cal-pills">

                    ${items.slice(0, 2).map(item => `
                        <span class="cal-pill cal-pill-${item.kind}">
                            <i class="fa-solid ${item.icon}" aria-hidden="true"></i>
                            <span class="cal-pill-label">${item.label}</span>
                        </span>
                    `).join('')}

                    ${items.length > 2
                        ? `<span class="cal-more">+${items.length - 2}</span>`
                        : ''}

                </span>

            </button>
        `;
    }

    const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

    grid.innerHTML = `
        <div class="cal-weekdays">
            ${weekdays.map(day => `<span>${day}</span>`).join('')}
        </div>
        <div class="cal-cells">${cells}</div>
    `;

    renderCalendarAgenda(activeDate);
}

function renderCalendarAgenda(dateKey) {

    const host =
        document.getElementById('calendar-events-list');

    if (!host) return;

    const label =
        document.getElementById('calendar-selected-label');

    if (!dateKey) {

        if (label) label.textContent = 'Aucune date';

        host.innerHTML = `
            <div class="cal-empty">
                <span class="cal-empty-icon"><i class="fa-regular fa-calendar" aria-hidden="true"></i></span>
                <p class="cal-empty-title">Choisissez une date</p>
                <p class="cal-empty-sub">Le détail des matchs, séances et événements s'affichera ici.</p>
            </div>
        `;

        return;
    }

    const selectedTeam =
        document.getElementById('calendar-team-filter')?.value || 'all';

    const { matches, trainings, events } = calendarItemsForDate(dateKey, selectedTeam);

    const dayLabel = new Date(dateKey + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    if (label) {
        label.textContent = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
    }

    if (matches.length === 0 && trainings.length === 0 && events.length === 0) {

        host.innerHTML = `
            <div class="cal-empty">
                <span class="cal-empty-icon"><i class="fa-solid fa-calendar-day" aria-hidden="true"></i></span>
                <p class="cal-empty-title">Journée libre</p>
                <p class="cal-empty-sub">Aucun match, entraînement ni événement pour cette date.</p>
            </div>
        `;

        return;
    }

    let html = '';

    matches.forEach(match => {

        html += `
            <div class="cal-event cal-event-match">

                <span class="cal-event-icon"><i class="fa-solid fa-futbol" aria-hidden="true"></i></span>

                <div class="cal-event-body">

                    <p class="cal-event-title">${match.opponent || 'Match'}</p>

                    <p class="cal-event-meta">
                        <i class="fa-regular fa-clock" aria-hidden="true"></i>
                        <span>${match.heure || '--'}</span>
                        ${calendarTeamChip(match.team)}
                    </p>

                </div>

            </div>
        `;
    });

    trainings.forEach(training => {

        html += `
            <div class="cal-event cal-event-training">

                <span class="cal-event-icon"><i class="fa-solid fa-stopwatch" aria-hidden="true"></i></span>

                <div class="cal-event-body">

                    <p class="cal-event-title">${training.title || 'Entraînement'}</p>

                    <p class="cal-event-meta">
                        <i class="fa-regular fa-clock" aria-hidden="true"></i>
                        <span>${training.heure || '--'}</span>
                        ${calendarTeamChip(training.team)}
                    </p>

                    ${training.theme
                        ? `<p class="cal-event-note">${training.theme}</p>`
                        : ''}

                </div>

            </div>
        `;
    });

    events.forEach(event => {

        const kind = calendarEventKind(event);

        html += `
            <div class="cal-event cal-event-${kind.kind}">

                <span class="cal-event-icon"><i class="fa-solid ${kind.icon}" aria-hidden="true"></i></span>

                <div class="cal-event-body">

                    <p class="cal-event-title">${event.title || kind.label}</p>

                    <p class="cal-event-meta">
                        <span class="cal-kind">${kind.label}</span>
                    </p>

                </div>

                <div class="cal-event-actions">

                    <button type="button"
                            onclick="openEventModal('${event.id}')"
                            class="cal-icon-btn"
                            aria-label="Modifier l'événement">
                        <i class="fa-solid fa-pen" aria-hidden="true"></i>
                    </button>

                    <button type="button"
                            onclick="deleteEvent('${event.id}')"
                            class="cal-icon-btn is-danger"
                            aria-label="Supprimer l'événement">
                        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                    </button>

                </div>

            </div>
        `;
    });

    host.innerHTML = html;
}

function showEventsForDate(dateKey, cell) {

    calendarSelectedDate = dateKey || null;

    document
        .querySelectorAll('#calendar-grid .cal-cell.is-selected')
        .forEach(element => element.classList.remove('is-selected'));

    if (cell && cell.classList) cell.classList.add('is-selected');

    renderCalendarAgenda(calendarSelectedDate);
}














