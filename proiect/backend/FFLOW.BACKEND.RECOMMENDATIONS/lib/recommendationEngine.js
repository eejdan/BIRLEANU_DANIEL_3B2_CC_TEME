const WEATHER_CODES = {
    0: 'clear',
    1: 'mostly_clear',
    2: 'partly_cloudy',
    3: 'cloudy',
    45: 'fog',
    48: 'fog',
    51: 'drizzle',
    53: 'drizzle',
    55: 'drizzle',
    61: 'rain',
    63: 'rain',
    65: 'heavy_rain',
    71: 'snow',
    73: 'snow',
    75: 'snow',
    80: 'rain_showers',
    81: 'rain_showers',
    82: 'heavy_rain',
    95: 'thunderstorm'
};

function normalizeLocation(location) {
    if (!location) {
        return {
            address: 'Unknown location',
            latitude: null,
            longitude: null
        };
    }

    return {
        address: location.address ?? location.label ?? 'Unknown location',
        latitude: typeof location.latitude === 'number' ? location.latitude : null,
        longitude: typeof location.longitude === 'number' ? location.longitude : null
    };
}

function calculateAirDistanceKm(origin, destination) {
    if (
        typeof origin.latitude === 'number'
        && typeof origin.longitude === 'number'
        && typeof destination.latitude === 'number'
        && typeof destination.longitude === 'number'
    ) {
        const toRadians = (degrees) => degrees * (Math.PI / 180);
        const earthRadiusKm = 6371;
        const deltaLat = toRadians(destination.latitude - origin.latitude);
        const deltaLon = toRadians(destination.longitude - origin.longitude);
        const lat1 = toRadians(origin.latitude);
        const lat2 = toRadians(destination.latitude);

        const a = Math.sin(deltaLat / 2) ** 2
            + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.max(0.5, earthRadiusKm * c);
    }

    const combinedLength = `${origin.address ?? ''}${destination.address ?? ''}`.length;
    return Math.max(2, Math.min(25, Math.round(combinedLength / 8)));
}

async function fetchWeatherInfo(destination, arrivalTime) {
    if (typeof fetch !== 'function') {
        const month = new Date(arrivalTime).getUTCMonth();
        const rainySeason = month < 2 || month > 9;

        return {
            condition: rainySeason ? 'rain' : 'clear',
            temperatureCelsius: rainySeason ? 8 : 22,
            walkingDiscouraged: rainySeason
        };
    }

    if (typeof destination.latitude !== 'number' || typeof destination.longitude !== 'number') {
        return {
            condition: 'unknown',
            temperatureCelsius: null,
            walkingDiscouraged: false
        };
    }

    const arrival = new Date(arrivalTime);
    const dateKey = arrival.toISOString().slice(0, 10);
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${destination.latitude}&longitude=${destination.longitude}&hourly=temperature_2m,precipitation_probability,weather_code&timezone=UTC&start_date=${dateKey}&end_date=${dateKey}`
    );

    if (!response.ok) {
        throw new Error('Unable to load weather forecast');
    }

    const payload = await response.json();
    const times = payload?.hourly?.time ?? [];
    const temperatures = payload?.hourly?.temperature_2m ?? [];
    const precipitation = payload?.hourly?.precipitation_probability ?? [];
    const weatherCodes = payload?.hourly?.weather_code ?? [];
    const targetHour = arrival.toISOString().slice(0, 13) + ':00';
    let targetIndex = times.findIndex((time) => time.startsWith(targetHour));

    if (targetIndex === -1 && times.length > 0) {
        targetIndex = 0;
        let bestDistance = Infinity;
        times.forEach((time, index) => {
            const distance = Math.abs(new Date(time).getTime() - arrival.getTime());
            if (distance < bestDistance) {
                bestDistance = distance;
                targetIndex = index;
            }
        });
    }

    const weatherCode = weatherCodes[targetIndex] ?? null;
    const precipitationProbability = precipitation[targetIndex] ?? 0;
    const condition = WEATHER_CODES[weatherCode] ?? 'unknown';

    return {
        condition,
        temperatureCelsius: temperatures[targetIndex] ?? null,
        walkingDiscouraged: precipitationProbability >= 55 || ['rain', 'heavy_rain', 'rain_showers', 'thunderstorm', 'snow'].includes(condition)
    };
}

async function fetchRoadDurations(origin, destination) {
    const airDistanceKm = calculateAirDistanceKm(origin, destination);

    if (typeof fetch !== 'function') {
        return {
            distanceKm: Number(airDistanceKm.toFixed(1)),
            walkingMinutes: Math.max(10, Math.round((airDistanceKm / 5) * 60)),
            drivingMinutes: Math.max(6, Math.round((airDistanceKm / 30) * 60)),
            publicTransportMinutes: Math.max(12, Math.round((airDistanceKm / 18) * 60))
        };
    }

    if (
        typeof origin.latitude !== 'number'
        || typeof origin.longitude !== 'number'
        || typeof destination.latitude !== 'number'
        || typeof destination.longitude !== 'number'
    ) {
        return {
            distanceKm: Number(airDistanceKm.toFixed(1)),
            walkingMinutes: Math.max(10, Math.round((airDistanceKm / 5) * 60)),
            drivingMinutes: Math.max(6, Math.round((airDistanceKm / 30) * 60)),
            publicTransportMinutes: Math.max(12, Math.round((airDistanceKm / 18) * 60))
        };
    }

    const baseUrl = `https://router.project-osrm.org/route/v1`;
    const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

    const [drivingResponse, walkingResponse] = await Promise.all([
        fetch(`${baseUrl}/driving/${coordinates}?overview=false`),
        fetch(`${baseUrl}/foot/${coordinates}?overview=false`)
    ]);

    if (!drivingResponse.ok || !walkingResponse.ok) {
        throw new Error('Unable to load route durations');
    }

    const [drivingPayload, walkingPayload] = await Promise.all([
        drivingResponse.json(),
        walkingResponse.json()
    ]);

    const drivingRoute = drivingPayload?.routes?.[0];
    const walkingRoute = walkingPayload?.routes?.[0];
    const distanceKm = Number((((drivingRoute?.distance ?? walkingRoute?.distance ?? airDistanceKm * 1000) / 1000)).toFixed(1));
    const drivingMinutes = Math.max(5, Math.round((drivingRoute?.duration ?? (airDistanceKm / 30) * 3600) / 60));
    const walkingMinutes = Math.max(10, Math.round((walkingRoute?.duration ?? (airDistanceKm / 5) * 3600) / 60));

    return {
        distanceKm,
        walkingMinutes,
        drivingMinutes,
        publicTransportMinutes: Math.max(drivingMinutes + 12, Math.round(drivingMinutes * 1.45))
    };
}

function buildRouteOptions(durations, arrivalTime, scheduleContext = {}) {
    const departureBufferMinutes = Math.max(0, Number(scheduleContext.departureBufferMinutes) || 0);
    const options = [
        ['walking', durations.walkingMinutes],
        ['driving', durations.drivingMinutes],
        ['public_transport', durations.publicTransportMinutes]
    ];

    return options.map(([transportMode, estimatedDurationMinutes]) => {
        const departureTime = new Date(new Date(arrivalTime).getTime() - (estimatedDurationMinutes + departureBufferMinutes) * 60000);
        return {
            transportMode,
            estimatedDurationMinutes,
            departureTime,
            feasible: estimatedDurationMinutes <= 180
        };
    });
}

function selectRecommendedRoute(routeOptions, weatherInfo, scheduleContext = {}) {
    if (scheduleContext.forceTransportMode) {
        const forced = routeOptions.find((option) => option.transportMode === scheduleContext.forceTransportMode);
        if (forced) {
            return forced;
        }
    }

    if (weatherInfo.walkingDiscouraged) {
        return routeOptions.find((option) => option.transportMode === 'driving')
            ?? routeOptions.find((option) => option.transportMode === 'public_transport')
            ?? routeOptions[0];
    }

    return [...routeOptions].sort((left, right) => left.estimatedDurationMinutes - right.estimatedDurationMinutes)[0];
}

async function buildCommuteSuggestion({ arrivalTime, destination, event, origin, scheduleContext }) {
    const normalizedOrigin = normalizeLocation(origin);
    const normalizedDestination = normalizeLocation(destination ?? event.location);
    const [weather, durations] = await Promise.all([
        fetchWeatherInfo(normalizedDestination, arrivalTime),
        fetchRoadDurations(normalizedOrigin, normalizedDestination)
    ]);
    const routeOptions = buildRouteOptions(durations, arrivalTime, scheduleContext);
    const recommendedRoute = selectRecommendedRoute(routeOptions, weather, scheduleContext);

    return {
        eventId: String(event._id),
        recommendedTransportMode: recommendedRoute.transportMode,
        recommendedDepartureTime: recommendedRoute.departureTime,
        routeOptions,
        weather,
        explanation: weather.walkingDiscouraged
            ? `Walking is discouraged because ${weather.condition} is expected. The recommendation balances weather comfort with a ${durations.distanceKm} km trip.`
            : `The selected route is the fastest reliable option for a ${durations.distanceKm} km trip while preserving the arrival window.`
    };
}

function getPriorityWeight(priority) {
    if (priority === 'high') {
        return 0;
    }

    if (priority === 'medium') {
        return 1;
    }

    return 2;
}

function createDayMoments(date) {
    return {
        dayStart: new Date(`${date}T08:00:00.000Z`),
        dayEnd: new Date(`${date}T22:00:00.000Z`)
    };
}

function normalizeTask(task) {
    const taskObject = task?.toObject ? task.toObject() : task;
    return {
        id: String(taskObject._id ?? taskObject.id),
        title: taskObject.title,
        description: taskObject.description ?? null,
        date: taskObject.date,
        estimatedDurationMinutes: taskObject.estimatedDurationMinutes ?? taskObject.estimatedMinutes ?? 30,
        priority: taskObject.priority ?? 'medium',
        status: taskObject.status ?? (taskObject.completed ? 'completed' : 'pending'),
        manualOrder: taskObject.manualOrder ?? null
    };
}

function normalizeEvent(event) {
    const eventObject = event?.toObject ? event.toObject() : event;
    return {
        startTime: eventObject.startTime ?? eventObject.startDate,
        endTime: eventObject.endTime ?? eventObject.endDate
    };
}

function buildTaskArrangement(date, tasks, events) {
    const { dayEnd, dayStart } = createDayMoments(date);
    const normalizedTasks = tasks.map(normalizeTask).sort((left, right) => {
        const priorityDifference = getPriorityWeight(left.priority) - getPriorityWeight(right.priority);
        if (priorityDifference !== 0) {
            return priorityDifference;
        }

        return (left.manualOrder ?? Number.MAX_SAFE_INTEGER) - (right.manualOrder ?? Number.MAX_SAFE_INTEGER);
    });
    const normalizedEvents = events.map(normalizeEvent).sort((left, right) => new Date(left.startTime) - new Date(right.startTime));

    const arrangedTasks = [];
    let currentCursor = dayStart;

    for (const task of normalizedTasks) {
        const taskDurationMs = task.estimatedDurationMinutes * 60000;

        for (const event of normalizedEvents) {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);

            if (currentCursor >= eventEnd) {
                continue;
            }

            if (currentCursor < eventStart && currentCursor.getTime() + taskDurationMs <= eventStart.getTime()) {
                break;
            }

            if (currentCursor < eventEnd) {
                currentCursor = new Date(eventEnd);
            }
        }

        const suggestedStartTime = new Date(currentCursor);
        const suggestedEndTime = new Date(currentCursor.getTime() + taskDurationMs);

        arrangedTasks.push({
            ...task,
            suggestedStartTime,
            suggestedEndTime
        });

        currentCursor = suggestedEndTime < dayEnd ? suggestedEndTime : new Date(dayEnd);
    }

    return arrangedTasks;
}

function toDateKey(value) {
    return new Date(value).toISOString().slice(0, 10);
}

function overlapsDay(event, dayStart, dayEnd) {
    return new Date(event.startDate ?? event.startTime) <= dayEnd
        && new Date(event.endDate ?? event.endTime) >= dayStart;
}

function mapWeekdayIndex(day) {
    return ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(day);
}

function expandRecurringEvents(events, dayStart, dayEnd) {
    const occurrences = [];

    for (const event of events) {
        const eventObject = event?.toObject ? event.toObject() : event;
        const recurrence = eventObject.recurrence;
        if (!recurrence?.frequency || recurrence.frequency === 'none') {
            if (overlapsDay(eventObject, dayStart, dayEnd)) {
                occurrences.push(eventObject);
            }
            continue;
        }

        const baseStart = new Date(eventObject.startDate);
        const baseEnd = new Date(eventObject.endDate);
        const until = recurrence.until ?? recurrence.endsAt ?? dayEnd;
        const rangeCursor = new Date(dayStart);

        while (rangeCursor <= dayEnd && rangeCursor <= until) {
            const sameTimeStart = new Date(rangeCursor);
            sameTimeStart.setUTCHours(baseStart.getUTCHours(), baseStart.getUTCMinutes(), 0, 0);
            const sameTimeEnd = new Date(sameTimeStart.getTime() + (baseEnd.getTime() - baseStart.getTime()));
            const daysSinceBase = Math.floor((sameTimeStart.getTime() - new Date(baseStart.toISOString().slice(0, 10)).getTime()) / 86400000);
            const weekdayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][sameTimeStart.getUTCDay()];

            let matches = false;
            if (recurrence.frequency === 'daily') {
                matches = daysSinceBase >= 0 && daysSinceBase % (recurrence.interval ?? 1) === 0;
            } else if (recurrence.frequency === 'weekly') {
                const every = (recurrence.interval ?? 1) * 7;
                const allowedDays = recurrence.daysOfWeek?.length ? recurrence.daysOfWeek : [weekdayName];
                matches = daysSinceBase >= 0 && daysSinceBase % every < 7 && allowedDays.includes(weekdayName);
            } else if (recurrence.frequency === 'monthly') {
                matches = sameTimeStart.getUTCDate() === baseStart.getUTCDate()
                    && ((sameTimeStart.getUTCFullYear() - baseStart.getUTCFullYear()) * 12 + sameTimeStart.getUTCMonth() - baseStart.getUTCMonth()) % (recurrence.interval ?? 1) === 0;
            }

            if (matches && sameTimeStart <= dayEnd && sameTimeEnd >= dayStart) {
                occurrences.push({
                    ...eventObject,
                    startDate: sameTimeStart,
                    endDate: sameTimeEnd
                });
            }

            rangeCursor.setUTCDate(rangeCursor.getUTCDate() + 1);
        }
    }

    return occurrences;
}

function findAvailableTimeWindow(dateKey, tasks, events, minimumMinutes = 15) {
    const { dayStart, dayEnd } = createDayMoments(dateKey);
    const blocks = [
        ...tasks
            .filter((task) => toDateKey(task.date) === dateKey && task.startTime && task.endTime)
            .map((task) => ({
                start: new Date(task.startTime),
                end: new Date(task.endTime)
            })),
        ...expandRecurringEvents(events, dayStart, dayEnd).map((event) => ({
            start: new Date(event.startDate),
            end: new Date(event.endDate)
        }))
    ].sort((left, right) => left.start - right.start);

    let cursor = new Date(dayStart);
    for (const block of blocks) {
        if (block.start > cursor) {
            const gapMinutes = Math.round((block.start - cursor) / 60000);
            if (gapMinutes >= minimumMinutes) {
                return {
                    startTime: cursor,
                    endTime: block.start
                };
            }
        }

        if (block.end > cursor) {
            cursor = new Date(block.end);
        }
    }

    if (dayEnd > cursor && Math.round((dayEnd - cursor) / 60000) >= minimumMinutes) {
        return {
            startTime: cursor,
            endTime: dayEnd
        };
    }

    return null;
}

function buildFreeTimeSuggestion(payload, activities, availableTimeWindow) {
    const startTime = new Date(availableTimeWindow.startTime);
    const endTime = new Date(availableTimeWindow.endTime);
    const availableMinutes = Math.max(0, Math.round((endTime - startTime) / 60000));

    const sortedActivities = [...activities].sort(
        (left, right) => (right.minimumDurationMinutes ?? 0) - (left.minimumDurationMinutes ?? 0)
    );

    const suggestedActivity = sortedActivities.find((activity) => (activity.minimumDurationMinutes ?? 0) <= availableMinutes)
        ?? {
            activityType: 'light_walk',
            displayName: 'Light walk',
            minimumDurationMinutes: 15
        };

    if ((suggestedActivity.minimumDurationMinutes ?? 0) > availableMinutes) {
        return null;
    }

    return {
        suggestedActivity,
        availableTimeWindow: {
            startTime,
            endTime
        },
        reason: `This activity fits the available ${availableMinutes}-minute free slot.`
    };
}

function minutesBetween(startTime, endTime) {
    if (!startTime || !endTime) {
        return 0;
    }

    return Math.max(0, Math.round((new Date(endTime) - new Date(startTime)) / 60000));
}

function safePercent(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.min(100, Math.round(value)));
}

async function estimateTransitionMinutes(previous, next) {
    const previousLocation = normalizeLocation(previous.location);
    const nextLocation = normalizeLocation(next.location);

    if ((!previousLocation.address && previousLocation.latitude === null) || (!nextLocation.address && nextLocation.latitude === null)) {
        return 0;
    }

    const durations = await fetchRoadDurations(previousLocation, nextLocation);
    return Math.min(durations.drivingMinutes, durations.publicTransportMinutes);
}

async function computeCommuteMinutes(scheduleItems) {
    let total = 0;
    const sorted = [...scheduleItems].sort((left, right) => new Date(left.startTime) - new Date(right.startTime));
    for (let index = 1; index < sorted.length; index += 1) {
        total += await estimateTransitionMinutes(sorted[index - 1], sorted[index]);
    }

    return total;
}

function derivePeriodRange(period, now = new Date()) {
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (period === 'month') {
        const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
        const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0, 23, 59, 59, 999));
        return { start, end };
    }

    const weekday = today.getUTCDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const start = new Date(today);
    start.setUTCDate(today.getUTCDate() + mondayOffset);
    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);
    end.setUTCHours(23, 59, 59, 999);
    return { start, end };
}

function buildDistribution(scheduleItems, period, start) {
    const labels = period === 'month'
        ? ['S1', 'S2', 'S3', 'S4', 'S5']
        : ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sam', 'Dum'];
    const totals = new Array(labels.length).fill(0);

    scheduleItems.forEach((item) => {
        const itemDate = new Date(item.startTime);
        let index;
        if (period === 'month') {
            index = Math.min(labels.length - 1, Math.floor((itemDate.getUTCDate() - 1) / 7));
        } else {
            index = Math.floor((itemDate - start) / 86400000);
        }

        if (index >= 0 && index < totals.length) {
            totals[index] += minutesBetween(item.startTime, item.endTime);
        }
    });

    const max = Math.max(60, ...totals);
    return labels.map((label, index) => ({
        label,
        taskMinutes: totals[index],
        routeMinutes: 0,
        taskPercent: safePercent((totals[index] / max) * 100),
        routePercent: 0,
        value: safePercent((totals[index] / max) * 100)
    }));
}

async function buildAnalyticsSummary({ period, tasks, events, focusSessions, now = new Date() }) {
    const { start, end } = derivePeriodRange(period, now);
    const expandedEvents = expandRecurringEvents(events, start, end).map((event) => ({
        id: String(event._id ?? event.id),
        title: event.title,
        startTime: event.startDate,
        endTime: event.endDate,
        completedAt: event.completedAt ?? null,
        failedAt: event.failedAt ?? null,
        location: event.location ?? null,
        label: 'Calendar'
    }));
    const timedTasks = tasks
        .filter((task) => task.date >= start && task.date <= end)
        .map((task) => ({
            id: String(task._id ?? task.id),
            title: task.title,
            startTime: task.startTime ?? null,
            endTime: task.endTime ?? null,
            completedAt: task.completedAt ?? null,
            failedAt: task.failedAt ?? null,
            location: task.location ?? null,
            label: 'Tasks'
        }))
        .filter((task) => task.startTime && task.endTime);

    const scheduleItems = [...expandedEvents, ...timedTasks];
    const completed = scheduleItems.filter((item) => item.completedAt).length;
    const failed = scheduleItems.filter((item) => item.failedAt).length;
    const total = scheduleItems.length;
    const plannedMinutes = scheduleItems.reduce((sum, item) => sum + minutesBetween(item.startTime, item.endTime), 0);
    const doneMinutes = scheduleItems.filter((item) => item.completedAt).reduce((sum, item) => sum + minutesBetween(item.startTime, item.endTime), 0);
    const focusMinutes = focusSessions
        .filter((session) => session.startTime >= start && session.startTime <= end)
        .reduce((sum, session) => sum + Math.round((session.durationSeconds ?? 0) / 60), 0);
    const commuteMinutes = await computeCommuteMinutes(scheduleItems);
    const completionRate = plannedMinutes ? safePercent((doneMinutes / plannedMinutes) * 100) : 0;
    const taskCompletionRate = total ? safePercent((completed / total) * 100) : 0;
    const streak = period === 'month' ? Math.max(0, Math.round(taskCompletionRate / 9)) : Math.max(0, Math.round(taskCompletionRate / 28));
    const focusScoreValue = safePercent(
        completionRate * 0.55
        + taskCompletionRate * 0.2
        + Math.min(100, focusMinutes / Math.max(1, plannedMinutes || 60) * 100) * 0.15
        + Math.min(100, commuteMinutes ? 100 - Math.min(100, (commuteMinutes / Math.max(1, plannedMinutes + commuteMinutes)) * 100) : 100) * 0.1
        - (failed * 8)
    );
    const bestFocusSession = focusSessions
        .filter((session) => session.startTime >= start && session.startTime <= end)
        .sort((left, right) => (right.durationSeconds ?? 0) - (left.durationSeconds ?? 0))[0];
    const labelMix = buildLabelMix(scheduleItems, focusMinutes, commuteMinutes);

    return {
        period,
        completionRate,
        completed,
        total,
        failed,
        plannedHours: plannedMinutes / 60,
        doneHours: doneMinutes / 60,
        commuteMinutes,
        focusMinutes,
        streak,
        focusScore: {
            label: 'Focus Score',
            score: focusScoreValue,
            change: focusScoreValue >= 80 ? '+ focus bun' : focusScoreValue >= 55 ? '+ stabil' : '- risc',
            progress: focusScoreValue,
            description: focusScoreValue >= 80
                ? 'Ai o combinatie buna intre executie, sesiuni de focus si un program controlat.'
                : focusScoreValue >= 55
                    ? 'Ai progres constant, dar exista loc de mai multa executie sau focus sustinut.'
                    : 'Rezultatul arata multe obiective neinchise sau prea putine sesiuni de focus.'
        },
        preview: {
            title: 'Analitice',
            completionRate,
            taskCompletionRate,
            labelMix,
            streak,
            streakTarget: 85,
            periodLabel: period === 'month' ? 'luna asta' : 'saptamana asta',
            rows: [
                {
                    id: 'hours',
                    label: 'Completion rate ore',
                    value: `${completionRate}%`,
                    percent: completionRate,
                    tone: 'primary',
                    detail: `${Math.round(doneMinutes / 60)}h / ${Math.round(plannedMinutes / 60)}h`
                },
                {
                    id: 'tasks',
                    label: 'Taskuri completate',
                    value: `${completed}/${total}`,
                    percent: taskCompletionRate,
                    tone: 'tertiary',
                    detail: `${taskCompletionRate}% din obiective`
                }
            ]
        },
        summaryCards: [
            {
                id: 'hours',
                type: 'progress',
                title: 'Completion rate pe ore',
                value: `${completionRate}%`,
                percent: completionRate,
                detail: `${Math.round(doneMinutes / 60)}h realizate din ${Math.round(plannedMinutes / 60)}h planificate.`,
                tone: 'primary'
            },
            {
                id: 'tasks',
                type: 'progress',
                title: 'Obiective inchise',
                value: `${completed}/${total}`,
                percent: taskCompletionRate,
                detail: failed ? `${failed} elemente au fost ratate in intervalul ales.` : 'Nu ai elemente ratate in intervalul ales.',
                tone: 'tertiary'
            },
            {
                id: 'focus',
                type: 'progress',
                title: 'Minute de focus',
                value: `${focusMinutes}m`,
                percent: safePercent((focusMinutes / Math.max(30, plannedMinutes || 30)) * 100),
                detail: bestFocusSession ? `Cea mai lunga sesiune: ${bestFocusSession.title} (${Math.round(bestFocusSession.durationSeconds / 60)}m).` : 'Nu exista sesiuni de focus inca.',
                tone: 'primary'
            }
        ],
        distribution: {
            title: period === 'month' ? 'Distributia lunii' : 'Distributia saptamanii',
            period: period === 'month' ? 'Lunar' : 'Saptamanal',
            days: buildDistribution(scheduleItems, period, start)
        },
        commute: {
            icon: '>',
            label: 'Timp pe drum',
            value: `${commuteMinutes}m`,
            trend: commuteMinutes ? 'calculat din tranzitii reale de locatie' : 'fara tranzitii detectate',
            description: 'Estimarea foloseste localizari din program si timpi de tranzitie intre activitati.'
        },
        completion: {
            label: 'Task-uri Finalizate',
            value: `${completed} / ${total} obiective`,
            percent: taskCompletionRate,
            status: taskCompletionRate >= 80 ? 'Streak activ' : 'Mai este loc de recuperare'
        },
        insight: {
            title: period === 'month' ? 'Insight of the Month' : 'Insight of the Week',
            text: bestFocusSession
                ? `Cea mai buna sesiune a fost "${bestFocusSession.title}" si a durat ${Math.round(bestFocusSession.durationSeconds / 60)} minute. Replica acel context pentru taskurile grele.`
                : 'Porneste un timer de focus din aplicatie pentru a construi recomandari mai precise.',
            cta: 'Vezi detalii'
        }
    };
}

function buildLabelMix(scheduleItems, focusMinutes, commuteMinutes) {
    const buckets = [
        { label: 'Calendar', minutes: scheduleItems.filter((item) => item.label === 'Calendar').reduce((sum, item) => sum + minutesBetween(item.startTime, item.endTime), 0), color: '#c0c1ff' },
        { label: 'Tasks', minutes: scheduleItems.filter((item) => item.label === 'Tasks').reduce((sum, item) => sum + minutesBetween(item.startTime, item.endTime), 0), color: '#ffb783' },
        { label: 'Focus', minutes: focusMinutes, color: '#9ee7d8' },
        { label: 'Drum', minutes: commuteMinutes, color: '#ff8f3d' }
    ].filter((item) => item.minutes > 0);
    const totalMinutes = buckets.reduce((sum, item) => sum + item.minutes, 0) || 1;

    return buckets.map((item) => ({
        ...item,
        percent: safePercent((item.minutes / totalMinutes) * 100),
        value: `${item.minutes}m`
    }));
}

export {
    buildAnalyticsSummary,
    buildCommuteSuggestion,
    buildFreeTimeSuggestion,
    buildTaskArrangement,
    computeCommuteMinutes,
    derivePeriodRange,
    expandRecurringEvents,
    findAvailableTimeWindow
};
