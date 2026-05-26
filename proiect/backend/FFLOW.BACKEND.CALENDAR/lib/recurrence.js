function expandRecurringEvents(events, startDate, endDate) {
    const occurrences = [];

    for (const eventDocument of events) {
        const event = eventDocument?.toObject ? eventDocument.toObject() : eventDocument;
        const recurrence = event.recurrence;

        if (!recurrence?.frequency || recurrence.frequency === 'none') {
            occurrences.push(event);
            continue;
        }

        const baseStart = new Date(event.startDate);
        const baseEnd = new Date(event.endDate);
        const until = recurrence.until ?? recurrence.endsAt ?? endDate;
        const cursor = new Date(startDate);

        while (cursor <= endDate && cursor <= until) {
            const occurrenceStart = new Date(cursor);
            occurrenceStart.setUTCHours(baseStart.getUTCHours(), baseStart.getUTCMinutes(), baseStart.getUTCSeconds(), baseStart.getUTCMilliseconds());
            const occurrenceEnd = new Date(occurrenceStart.getTime() + (baseEnd.getTime() - baseStart.getTime()));
            const matches = matchesRecurrence(recurrence, baseStart, occurrenceStart);

            if (matches && occurrenceStart <= endDate && occurrenceEnd >= startDate) {
                occurrences.push({
                    ...event,
                    startDate: occurrenceStart,
                    endDate: occurrenceEnd
                });
            }

            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }
    }

    return occurrences.sort((left, right) => new Date(left.startDate) - new Date(right.startDate));
}

function matchesRecurrence(recurrence, baseStart, candidate) {
    const daysSinceBase = Math.floor((Date.UTC(candidate.getUTCFullYear(), candidate.getUTCMonth(), candidate.getUTCDate()) - Date.UTC(baseStart.getUTCFullYear(), baseStart.getUTCMonth(), baseStart.getUTCDate())) / 86400000);
    const weekdayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][candidate.getUTCDay()];

    if (daysSinceBase < 0) {
        return false;
    }

    if (recurrence.frequency === 'daily') {
        return daysSinceBase % (recurrence.interval ?? 1) === 0;
    }

    if (recurrence.frequency === 'weekly') {
        const allowedDays = recurrence.daysOfWeek?.length ? recurrence.daysOfWeek : [weekdayName];
        return Math.floor(daysSinceBase / 7) % (recurrence.interval ?? 1) === 0
            && allowedDays.includes(weekdayName);
    }

    if (recurrence.frequency === 'monthly') {
        const monthOffset = (candidate.getUTCFullYear() - baseStart.getUTCFullYear()) * 12 + candidate.getUTCMonth() - baseStart.getUTCMonth();
        return candidate.getUTCDate() === baseStart.getUTCDate()
            && monthOffset >= 0
            && monthOffset % (recurrence.interval ?? 1) === 0;
    }

    if (recurrence.frequency === 'yearly') {
        const yearOffset = candidate.getUTCFullYear() - baseStart.getUTCFullYear();
        return candidate.getUTCDate() === baseStart.getUTCDate()
            && candidate.getUTCMonth() === baseStart.getUTCMonth()
            && yearOffset >= 0
            && yearOffset % (recurrence.interval ?? 1) === 0;
    }

    return false;
}

export { expandRecurringEvents };
