import mongoose from 'mongoose';

import { HttpError } from './http.js';

const WEEKDAY_NAMES = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseObjectId(value, fieldName) {
    if (!mongoose.isValidObjectId(value)) {
        throw new HttpError(400, `${fieldName} must be a valid id`);
    }

    return new mongoose.Types.ObjectId(value);
}

function parseDate(value, fieldName) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new HttpError(400, `${fieldName} must be a valid ISO date`);
    }

    return date;
}

function parseOptionalDate(value, fieldName) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    return parseDate(value, fieldName);
}

function parseBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
        throw new HttpError(400, `${fieldName} must be a boolean`);
    }

    return value;
}

function parseOptionalString(value, fieldName) {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value !== 'string') {
        throw new HttpError(400, `${fieldName} must be a string`);
    }

    return value.trim();
}

function parseRequiredString(value, fieldName) {
    if (!isNonEmptyString(value)) {
        throw new HttpError(400, `${fieldName} is required`);
    }

    return value.trim();
}

function parseOptionalNumber(value, fieldName) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new HttpError(400, `${fieldName} must be a number`);
    }

    return value;
}

function parseOptionalInteger(value, fieldName) {
    const parsed = parseOptionalNumber(value, fieldName);
    if (parsed === undefined) {
        return undefined;
    }

    if (!Number.isInteger(parsed)) {
        throw new HttpError(400, `${fieldName} must be an integer`);
    }

    return parsed;
}

function parsePositiveInteger(value, fieldName, fallback) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new HttpError(400, `${fieldName} must be a positive integer`);
    }

    return parsed;
}

function parseTimeString(value, fieldName) {
    const normalized = parseRequiredString(value, fieldName);
    if (!/^\d{2}:\d{2}$/.test(normalized)) {
        throw new HttpError(400, `${fieldName} must be in HH:mm format`);
    }

    return normalized;
}

function parseQueryRange(query) {
    const startDate = parseDate(query.startDate, 'startDate');
    const endDate = parseDate(query.endDate, 'endDate');

    if (startDate > endDate) {
        throw new HttpError(400, 'startDate must be less than or equal to endDate');
    }

    return { startDate, endDate };
}

function parseLocation(value, fieldName = 'location') {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? { label: trimmed } : undefined;
    }

    if (!isPlainObject(value)) {
        throw new HttpError(400, `${fieldName} must be a string or object`);
    }

    const label = parseOptionalString(value.label ?? value.name, `${fieldName}.label`);
    const address = parseOptionalString(value.address, `${fieldName}.address`);
    const latitude = parseOptionalNumber(value.latitude, `${fieldName}.latitude`);
    const longitude = parseOptionalNumber(value.longitude, `${fieldName}.longitude`);

    if (!label && !address && latitude === undefined && longitude === undefined) {
        throw new HttpError(400, `${fieldName} must include at least label, address, latitude, or longitude`);
    }

    return {
        label,
        address,
        latitude,
        longitude
    };
}

function parseRecurrence(value) {
    if (value === undefined || value === null) {
        return undefined;
    }

    if (!isPlainObject(value)) {
        throw new HttpError(400, 'recurrence must be an object');
    }

    const frequency = parseRequiredString(value.frequency, 'recurrence.frequency').toLowerCase();
    const allowedFrequencies = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

    if (!allowedFrequencies.includes(frequency)) {
        throw new HttpError(400, 'recurrence.frequency must be one of none, daily, weekly, monthly, yearly');
    }

    const interval = value.interval === undefined ? 1 : parseOptionalNumber(value.interval, 'recurrence.interval');
    if (!Number.isInteger(interval) || interval <= 0) {
        throw new HttpError(400, 'recurrence.interval must be a positive integer');
    }

    let daysOfWeek;
    if (value.daysOfWeek !== undefined) {
        if (!Array.isArray(value.daysOfWeek) || value.daysOfWeek.length === 0) {
            throw new HttpError(400, 'recurrence.daysOfWeek must be a non-empty array');
        }

        daysOfWeek = value.daysOfWeek.map((day) => {
            const normalized = parseRequiredString(day, 'recurrence.daysOfWeek').toLowerCase();
            if (!WEEKDAY_NAMES.includes(normalized)) {
                throw new HttpError(400, 'recurrence.daysOfWeek contains an invalid weekday');
            }

            return normalized;
        });
    }

    const endsAt = parseOptionalDate(value.endsAt, 'recurrence.endsAt');
    const until = parseOptionalDate(value.until, 'recurrence.until') ?? endsAt;
    const count = parseOptionalNumber(value.count, 'recurrence.count');
    if (count !== undefined && (!Number.isInteger(count) || count <= 0)) {
        throw new HttpError(400, 'recurrence.count must be a positive integer');
    }

    return {
        frequency,
        interval,
        daysOfWeek,
        endsAt,
        until,
        count
    };
}

function parseEventAlarm(value, startDate, partial = false) {
    if (value === undefined || value === null) {
        return partial ? undefined : { enabled: false };
    }

    if (!isPlainObject(value)) {
        throw new HttpError(400, 'alarm must be an object');
    }

    const enabled = value.enabled === undefined
        ? (partial ? undefined : false)
        : parseBoolean(value.enabled, 'alarm.enabled');
    const minutesBefore = parseOptionalNumber(value.minutesBefore, 'alarm.minutesBefore');
    const triggerAt = parseOptionalDate(value.triggerAt, 'alarm.triggerAt');

    if (minutesBefore !== undefined && minutesBefore < 0) {
        throw new HttpError(400, 'alarm.minutesBefore must be greater than or equal to 0');
    }

    if (enabled === true && !triggerAt && (minutesBefore === undefined || !startDate)) {
        throw new HttpError(400, 'Enabled alarm requires triggerAt or minutesBefore with a valid event start');
    }

    const resolvedTriggerAt = triggerAt
        ?? (enabled === true && minutesBefore !== undefined && startDate
            ? new Date(startDate.getTime() - minutesBefore * 60000)
            : undefined);

    return {
        enabled,
        minutesBefore,
        triggerAt: resolvedTriggerAt
    };
}

function parseCreateEvent(body) {
    const startDate = parseDate(body.startTime ?? body.startDate ?? body.datetimeStart, 'startTime');
    const endDate = parseDate(body.endTime ?? body.endDate ?? body.datetimeEnd, 'endTime');
    if (startDate > endDate) {
        throw new HttpError(400, 'startTime must be less than or equal to endTime');
    }

    const alarmInput = body.alarm ?? (
        'alarmEnabled' in body || 'alarmTime' in body
            ? {
                enabled: body.alarmEnabled,
                triggerAt: body.alarmTime
            }
            : undefined
    );

    return {
        title: parseRequiredString(body.title, 'title'),
        description: parseOptionalString(body.description, 'description'),
        startDate,
        endDate,
        location: parseLocation(body.location),
        recurrence: parseRecurrence(body.recurrence),
        alarm: parseEventAlarm(alarmInput, startDate)
    };
}

function parseUpdateEvent(body, currentEvent) {
    const payload = {};

    if ('title' in body) {
        payload.title = parseRequiredString(body.title, 'title');
    }

    if ('description' in body) {
        payload.description = parseOptionalString(body.description, 'description');
    }

    if ('location' in body) {
        payload.location = parseLocation(body.location);
    }

    if ('recurrence' in body) {
        payload.recurrence = parseRecurrence(body.recurrence);
    }

    const nextStartDate = 'startTime' in body || 'startDate' in body || 'datetimeStart' in body
        ? parseDate(body.startTime ?? body.startDate ?? body.datetimeStart, 'startTime')
        : currentEvent.startDate;
    const nextEndDate = 'endTime' in body || 'endDate' in body || 'datetimeEnd' in body
        ? parseDate(body.endTime ?? body.endDate ?? body.datetimeEnd, 'endTime')
        : currentEvent.endDate;

    if (nextStartDate > nextEndDate) {
        throw new HttpError(400, 'startTime must be less than or equal to endTime');
    }

    if ('startTime' in body || 'startDate' in body || 'datetimeStart' in body) {
        payload.startDate = nextStartDate;
    }

    if ('endTime' in body || 'endDate' in body || 'datetimeEnd' in body) {
        payload.endDate = nextEndDate;
    }

    if ('alarm' in body || 'alarmEnabled' in body || 'alarmTime' in body) {
        payload.alarm = parseEventAlarm(body.alarm ?? {
            enabled: body.alarmEnabled,
            triggerAt: body.alarmTime
        }, nextStartDate, true);
    }

    return payload;
}

function parseCreateTask(body) {
    const estimatedMinutes = parseOptionalNumber(
        body.estimatedDurationMinutes ?? body.estimatedMinutes ?? body.estimatedTime,
        'estimatedDurationMinutes'
    );

    if (estimatedMinutes === undefined || estimatedMinutes < 1) {
        throw new HttpError(400, 'estimatedDurationMinutes must be a positive number');
    }

    return {
        title: parseRequiredString(body.title, 'title'),
        description: parseOptionalString(body.description, 'description'),
        date: parseDate(body.date, 'date'),
        estimatedMinutes,
        priority: parsePriority(body.priority),
        manualOrder: parseOptionalInteger(body.manualOrder, 'manualOrder') ?? 0,
        location: parseLocation(body.location),
        completed: false,
        completedAt: undefined
    };
}

function parseUpdateTask(body) {
    const payload = {};

    if ('title' in body) {
        payload.title = parseRequiredString(body.title, 'title');
    }

    if ('description' in body) {
        payload.description = parseOptionalString(body.description, 'description');
    }

    if ('date' in body) {
        payload.date = parseDate(body.date, 'date');
    }

    if ('estimatedDurationMinutes' in body || 'estimatedMinutes' in body || 'estimatedTime' in body) {
        payload.estimatedMinutes = parseOptionalNumber(
            body.estimatedDurationMinutes ?? body.estimatedMinutes ?? body.estimatedTime,
            'estimatedDurationMinutes'
        );
        if (payload.estimatedMinutes !== undefined && payload.estimatedMinutes < 1) {
            throw new HttpError(400, 'estimatedDurationMinutes must be a positive number');
        }
    }

    if ('priority' in body) {
        payload.priority = parsePriority(body.priority);
    }

    if ('manualOrder' in body) {
        payload.manualOrder = parseOptionalInteger(body.manualOrder, 'manualOrder');
    }

    if ('location' in body) {
        payload.location = parseLocation(body.location);
    }

    if ('completed' in body) {
        payload.completed = parseBoolean(body.completed, 'completed');
        payload.completedAt = payload.completed ? new Date() : undefined;
    }

    return payload;
}

function parsePriority(value) {
    if (value === undefined || value === null || value === '') {
        return 'medium';
    }

    const priority = parseRequiredString(value, 'priority').toLowerCase();
    if (!['low', 'medium', 'high'].includes(priority)) {
        throw new HttpError(400, 'priority must be low, medium, or high');
    }

    return priority;
}

function parseWakeupTimes(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    const wakeupTimes = isPlainObject(body.schedule)
        ? body.schedule
        : (isPlainObject(body.wakeupTimes) ? body.wakeupTimes : body);
    const result = {};

    for (const weekday of WEEKDAY_NAMES) {
        const value = wakeupTimes[weekday];
        if (!isNonEmptyString(value) || !/^\d{2}:\d{2}$/.test(value.trim())) {
            throw new HttpError(400, `wakeupTimes.${weekday} must be in HH:mm format`);
        }

        result[weekday] = value.trim();
    }

    return result;
}

function parseWakeupOverride(body) {
    return {
        date: parseDate(body.date, 'date'),
        wakeupTime: parseTimeString(body.wakeUpTime ?? body.wakeupTime, 'wakeUpTime'),
        note: parseOptionalString(body.note, 'note')
    };
}

function parseQuickNote(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    const timerDurationSeconds = body.timerDurationSeconds === undefined
        ? 0
        : parseOptionalInteger(body.timerDurationSeconds, 'timerDurationSeconds');

    if (timerDurationSeconds !== undefined && timerDurationSeconds < 0) {
        throw new HttpError(400, 'timerDurationSeconds must be greater than or equal to 0');
    }

    return {
        text: parseRequiredString(body.text, 'text'),
        timerDurationSeconds: timerDurationSeconds ?? 0,
        timerLabel: parseOptionalString(body.timerLabel, 'timerLabel'),
        date: parseDate(body.date, 'date')
    };
}

function parseFocusSession(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    const startTime = parseDate(body.startTime, 'startTime');
    const endTime = parseDate(body.endTime, 'endTime');
    if (startTime >= endTime) {
        throw new HttpError(400, 'endTime must be greater than startTime');
    }

    const durationSeconds = body.durationSeconds === undefined
        ? Math.round((endTime - startTime) / 1000)
        : parsePositiveInteger(body.durationSeconds, 'durationSeconds');

    return {
        title: parseOptionalString(body.title, 'title') || 'Focus session',
        sessionType: ['focus', 'deep_work', 'pomodoro', 'study'].includes(body.sessionType)
            ? body.sessionType
            : 'focus',
        startTime,
        endTime,
        durationSeconds,
        source: body.source === 'manual' ? 'manual' : 'timer'
    };
}

export {
    parseBoolean,
    parseCreateEvent,
    parseCreateTask,
    parseDate,
    parseEventAlarm,
    parseFocusSession,
    parseObjectId,
    parseOptionalDate,
    parseOptionalNumber,
    parseOptionalString,
    parsePositiveInteger,
    parseQueryRange,
    parseQuickNote,
    parseTimeString,
    parseUpdateEvent,
    parseUpdateTask,
    parseWakeupOverride,
    parseWakeupTimes
};
