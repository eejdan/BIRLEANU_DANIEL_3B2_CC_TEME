function validateEmail(email) {
    return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isIsoDateTime(value) {
    if (typeof value !== 'string') {
        return false;
    }
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp);
}

function parseDateOnly(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    return Number.isFinite(date.getTime()) ? date : null;
}

function validateEventPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return { ok: false, message: 'Invalid event payload.' };
    }
    const { title, startDateTime, endDateTime, location, recurrence } = payload;
    if (typeof title !== 'string' || title.trim().length < 2) {
        return { ok: false, message: 'title is required.' };
    }
    if (!isIsoDateTime(startDateTime) || !isIsoDateTime(endDateTime)) {
        return { ok: false, message: 'startDateTime and endDateTime must be valid ISO date-time.' };
    }
    if (new Date(endDateTime).getTime() <= new Date(startDateTime).getTime()) {
        return { ok: false, message: 'endDateTime must be after startDateTime.' };
    }
    if (typeof location !== 'string' || location.trim().length < 2) {
        return { ok: false, message: 'location is required.' };
    }
    if (!['weekly', 'once'].includes(recurrence)) {
        return { ok: false, message: 'recurrence must be weekly or once.' };
    }
    return { ok: true };
}

function getDayName(dateStr) {
    const date = parseDateOnly(dateStr);
    const day = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' }).toLowerCase();
    return day;
}

function getEventsForDate(events, dateStr) {
    const day = getDayName(dateStr);
    return events.filter((event) => {
        if (event.recurrence === 'weekly') {
            const eventDay = new Date(event.startDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                timeZone: 'UTC'
            }).toLowerCase();
            return eventDay === day;
        }
        return String(event.startDateTime).slice(0, 10) === dateStr;
    });
}

function findFirstAndNextEvents(sortedEvents, currentEventId) {
    const index = sortedEvents.findIndex((event) => event.id === currentEventId);
    if (index < 0) {
        return null;
    }
    return {
        current: sortedEvents[index],
        next: sortedEvents[index + 1] || null
    };
}

function parseDurationSeconds(duration) {
    if (typeof duration === 'number') {
        return duration;
    }
    if (typeof duration === 'string') {
        const match = duration.match(/^(\d+)(?:\.\d+)?s$/);
        if (match) {
            return Number(match[1]);
        }
    }
    return 0;
}

function buildReadingRecommendation(booksPayload, events, date) {
    const books = Array.isArray(booksPayload?.data) ? booksPayload.data : [];
    const selectedBooks = books.slice(0, 3);
    const dateEvents = getEventsForDate(events, date)
        .slice()
        .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    let suggestedStart = `${date}T20:00:00.000Z`;
    let suggestedEnd = `${date}T20:45:00.000Z`;

    if (dateEvents.length > 0) {
        const lastEvent = dateEvents[dateEvents.length - 1];
        const start = new Date(lastEvent.endDateTime);
        start.setMinutes(start.getMinutes() + 15);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 45);
        suggestedStart = start.toISOString();
        suggestedEnd = end.toISOString();
    }

    return {
        date,
        books: selectedBooks,
        suggestedActivity: {
            title: 'Reading Activity',
            startDateTime: suggestedStart,
            endDateTime: suggestedEnd,
            location: 'Home',
            description: selectedBooks.length
                ? `Read: ${selectedBooks.map((book) => book.title).join(', ')}`
                : 'Read a preferred book',
            recurrence: 'once'
        }
    };
}

function buildDailyTravelLegs(home, events) {
    if (!home || typeof home.lat !== 'number' || typeof home.lng !== 'number') {
        return [];
    }

    const datedEvents = events
        .filter((event) => typeof event.lat === 'number' && typeof event.lng === 'number')
        .slice()
        .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));

    if (datedEvents.length === 0) {
        return [];
    }

    const legs = [];
    const firstEvent = datedEvents[0];
    const firstDeparture = new Date(new Date(firstEvent.startDateTime).getTime() - 45 * 60 * 1000).toISOString();

    legs.push({
        id: `home-to-${firstEvent.id}`,
        fromType: 'home',
        toType: 'event',
        fromEventId: null,
        toEventId: firstEvent.id,
        fromLabel: 'Home',
        toLabel: firstEvent.title,
        departureTime: firstDeparture,
        from: { lat: home.lat, lng: home.lng },
        to: { lat: firstEvent.lat, lng: firstEvent.lng }
    });

    for (let index = 0; index < datedEvents.length - 1; index += 1) {
        const current = datedEvents[index];
        const next = datedEvents[index + 1];
        legs.push({
            id: `${current.id}-to-${next.id}`,
            fromType: 'event',
            toType: 'event',
            fromEventId: current.id,
            toEventId: next.id,
            fromLabel: current.title,
            toLabel: next.title,
            departureTime: current.endDateTime,
            from: { lat: current.lat, lng: current.lng },
            to: { lat: next.lat, lng: next.lng }
        });
    }

    const lastEvent = datedEvents[datedEvents.length - 1];
    legs.push({
        id: `${lastEvent.id}-to-home`,
        fromType: 'event',
        toType: 'home',
        fromEventId: lastEvent.id,
        toEventId: null,
        fromLabel: lastEvent.title,
        toLabel: 'Home',
        departureTime: lastEvent.endDateTime,
        from: { lat: lastEvent.lat, lng: lastEvent.lng },
        to: { lat: home.lat, lng: home.lng }
    });

    const nowTimestamp = Date.now();
    return legs.filter((leg) => {
        const departureTimestamp = new Date(leg.departureTime).getTime();
        return Number.isFinite(departureTimestamp) && departureTimestamp > nowTimestamp;
    });
}

module.exports = {
    validateEmail,
    isIsoDateTime,
    parseDateOnly,
    validateEventPayload,
    getDayName,
    getEventsForDate,
    findFirstAndNextEvents,
    parseDurationSeconds,
    buildReadingRecommendation,
    buildDailyTravelLegs
};