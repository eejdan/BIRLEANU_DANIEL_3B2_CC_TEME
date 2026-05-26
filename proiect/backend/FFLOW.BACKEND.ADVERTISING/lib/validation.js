import { HttpError } from './http.js';

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseAdEventRequest(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    if (typeof body.adId !== 'string' || body.adId.trim().length === 0) {
        throw new HttpError(400, 'adId is required');
    }

    const timestamp = new Date(body.timestamp);
    if (Number.isNaN(timestamp.getTime())) {
        throw new HttpError(400, 'timestamp must be a valid ISO date');
    }

    return {
        adId: body.adId.trim(),
        timestamp,
        placement: typeof body.placement === 'string' ? body.placement.trim() : null
    };
}

export { parseAdEventRequest };
