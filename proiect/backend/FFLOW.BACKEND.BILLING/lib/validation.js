import { HttpError } from './http.js';

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseCheckoutSessionRequest(body) {
    if (!isPlainObject(body)) {
        throw new HttpError(400, 'Request body must be an object');
    }

    if (!['monthly', 'yearly'].includes(body.selectedPlan)) {
        throw new HttpError(400, 'selectedPlan must be monthly or yearly');
    }

    return {
        selectedPlan: body.selectedPlan
    };
}

function parseStripeWebhookEvent(body) {
    if (!isPlainObject(body) || !isPlainObject(body.data) || !isPlainObject(body.data.object)) {
        throw new HttpError(400, 'Webhook payload must include data.object');
    }

    if (typeof body.type !== 'string' || body.type.trim().length === 0) {
        throw new HttpError(400, 'Webhook payload must include type');
    }

    return body;
}

export {
    parseCheckoutSessionRequest,
    parseStripeWebhookEvent
};
