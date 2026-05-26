import mongoose from 'mongoose';

import { HttpError } from './http.js';

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseRequiredString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new HttpError(400, `${fieldName} is required`);
    }

    return value.trim();
}

function parseDate(value, fieldName) {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw new HttpError(400, `${fieldName} must be a valid ISO date`);
    }

    return parsed;
}

function parseDateOnly(value, fieldName) {
    const normalized = parseRequiredString(value, fieldName);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        throw new HttpError(400, `${fieldName} must be a valid date`);
    }

    return normalized;
}

function parseObjectId(value, fieldName) {
    if (!mongoose.isValidObjectId(value)) {
        throw new HttpError(400, `${fieldName} must be a valid id`);
    }

    return new mongoose.Types.ObjectId(value);
}

function parseLocation(value, fieldName) {
    if (!isPlainObject(value)) {
        throw new HttpError(400, `${fieldName} must be an object`);
    }

    return {
        address: typeof value.address === 'string' ? value.address.trim() : undefined,
        latitude: typeof value.latitude === 'number' ? value.latitude : undefined,
        longitude: typeof value.longitude === 'number' ? value.longitude : undefined
    };
}

function parseCommuteSuggestionRequest(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    return {
        eventId: parseObjectId(body.eventId, 'eventId'),
        origin: parseLocation(body.origin, 'origin'),
        destination: parseLocation(body.destination, 'destination'),
        arrivalTime: parseDate(body.arrivalTime, 'arrivalTime')
    };
}

function parseCommuteRecalculationRequest(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    const updatedScheduleContext = isPlainObject(body.updatedScheduleContext) ? body.updatedScheduleContext : null;
    if (!updatedScheduleContext) {
        throw new HttpError(400, 'updatedScheduleContext is required');
    }

    return {
        eventId: parseObjectId(body.eventId, 'eventId'),
        updatedScheduleContext: {
            ...updatedScheduleContext,
            origin: updatedScheduleContext.origin ? parseLocation(updatedScheduleContext.origin, 'updatedScheduleContext.origin') : undefined
        }
    };
}

function normalizeTask(task, index) {
    if (!isPlainObject(task)) {
        throw new HttpError(400, `tasks[${index}] must be an object`);
    }

    const priority = task.priority ?? 'medium';
    if (!['low', 'medium', 'high'].includes(priority)) {
        throw new HttpError(400, `tasks[${index}].priority must be low, medium, or high`);
    }

    return {
        id: task.id,
        title: parseRequiredString(task.title, `tasks[${index}].title`),
        description: typeof task.description === 'string' ? task.description.trim() : null,
        date: task.date ? parseDate(task.date, `tasks[${index}].date`) : undefined,
        estimatedDurationMinutes: Number(task.estimatedDurationMinutes ?? task.estimatedMinutes ?? 30),
        priority,
        status: task.status ?? (task.completed ? 'completed' : 'pending'),
        manualOrder: Number.isInteger(task.manualOrder) ? task.manualOrder : null
    };
}

function normalizeEvent(event, index) {
    if (!isPlainObject(event)) {
        throw new HttpError(400, `events[${index}] must be an object`);
    }

    return {
        id: event.id,
        title: typeof event.title === 'string' ? event.title.trim() : null,
        startTime: parseDate(event.startTime ?? event.startDate, `events[${index}].startTime`),
        endTime: parseDate(event.endTime ?? event.endDate, `events[${index}].endTime`)
    };
}

function parseAutoArrangeTasksRequest(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    return {
        date: parseDateOnly(body.date, 'date'),
        tasks: Array.isArray(body.tasks) ? body.tasks.map(normalizeTask) : undefined,
        events: Array.isArray(body.events) ? body.events.map(normalizeEvent) : undefined
    };
}

function parseFreeTimeActivity(activity, index) {
    if (!isPlainObject(activity)) {
        throw new HttpError(400, `activities[${index}] must be an object`);
    }

    const minimumDurationMinutes = Number(activity.minimumDurationMinutes);
    if (!Number.isFinite(minimumDurationMinutes) || minimumDurationMinutes <= 0) {
        throw new HttpError(400, `activities[${index}].minimumDurationMinutes must be a positive number`);
    }

    return {
        activityType: parseRequiredString(activity.activityType, `activities[${index}].activityType`),
        displayName: parseRequiredString(activity.displayName, `activities[${index}].displayName`),
        minimumDurationMinutes
    };
}

function parseFreeTimePreferencesRequest(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    if (!Array.isArray(body.activities) || body.activities.length === 0) {
        throw new HttpError(400, 'activities must be a non-empty array');
    }

    return {
        activities: body.activities.map(parseFreeTimeActivity)
    };
}

function parseFreeTimeSuggestionRequest(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    const availableTimeWindow = isPlainObject(body.availableTimeWindow)
        ? {
            startTime: parseDate(body.availableTimeWindow.startTime, 'availableTimeWindow.startTime'),
            endTime: parseDate(body.availableTimeWindow.endTime, 'availableTimeWindow.endTime')
        }
        : null;

    return {
        date: parseDateOnly(body.date, 'date'),
        availableTimeWindow
    };
}

function parseAnalyticsPeriod(value) {
    if (value === undefined || value === null || value === '') {
        return 'week';
    }

    if (value !== 'week' && value !== 'month') {
        throw new HttpError(400, 'period must be week or month');
    }

    return value;
}

export {
    parseAnalyticsPeriod,
    parseAutoArrangeTasksRequest,
    parseCommuteRecalculationRequest,
    parseCommuteSuggestionRequest,
    parseFreeTimePreferencesRequest,
    parseFreeTimeSuggestionRequest
};
