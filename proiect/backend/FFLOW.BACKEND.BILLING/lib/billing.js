import crypto from 'node:crypto';

import { HttpError } from './http.js';

const STRIPE_API_BASE_URL = 'https://api.stripe.com/v1';

function buildSubscriptionResponse(subscriptionDocument) {
    const subscription = subscriptionDocument?.toObject ? subscriptionDocument.toObject() : subscriptionDocument;

    return {
        status: subscription?.status ?? 'free',
        plan: subscription?.plan ?? null,
        renewalDate: subscription?.renewalDate ?? null
    };
}

async function createStripeCheckoutSession(selectedPlan, userId) {
    const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
    const priceId = resolveStripePriceId(selectedPlan);
    const successUrl = requireEnv('STRIPE_CHECKOUT_SUCCESS_URL');
    const cancelUrl = requireEnv('STRIPE_CHECKOUT_CANCEL_URL');
    const requestBody = new URLSearchParams({
        mode: 'subscription',
        client_reference_id: String(userId),
        success_url: successUrl,
        cancel_url: cancelUrl,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'metadata[userId]': String(userId),
        'metadata[selectedPlan]': selectedPlan,
        'subscription_data[metadata][userId]': String(userId),
        'subscription_data[metadata][selectedPlan]': selectedPlan
    });

    const stripeSession = await stripeRequest('/checkout/sessions', {
        method: 'POST',
        body: requestBody,
        stripeSecretKey
    });

    if (!stripeSession.id || !stripeSession.url) {
        throw new HttpError(502, 'Stripe checkout session response is missing required fields');
    }

    return {
        checkoutSessionId: stripeSession.id,
        checkoutUrl: stripeSession.url
    };
}

async function cancelStripeSubscription(stripeSubscriptionId) {
    if (!stripeSubscriptionId) {
        return null;
    }

    const stripeSecretKey = requireEnv('STRIPE_SECRET_KEY');
    return stripeRequest(`/subscriptions/${encodeURIComponent(stripeSubscriptionId)}`, {
        method: 'POST',
        body: new URLSearchParams({
            cancel_at_period_end: 'true'
        }),
        stripeSecretKey
    });
}

function buildPremiumAccessResponse(subscriptionDocument) {
    const subscription = subscriptionDocument?.toObject ? subscriptionDocument.toObject() : subscriptionDocument;
    return {
        premiumAccess: subscription?.status === 'active'
    };
}

function verifyStripeSignature(rawBody, signatureHeader) {
    const webhookSecret = requireEnv('STRIPE_WEBHOOK_SECRET');

    if (!rawBody || !signatureHeader) {
        throw new HttpError(400, 'Missing Stripe signature');
    }

    const signatureParts = parseStripeSignatureHeader(signatureHeader);
    if (!signatureParts.timestamp || signatureParts.signatures.length === 0) {
        throw new HttpError(400, 'Invalid Stripe signature');
    }

    const signedPayload = `${signatureParts.timestamp}.${rawBody.toString('utf8')}`;
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const isValid = signatureParts.signatures.some((signature) => {
        const signatureBuffer = Buffer.from(signature, 'hex');
        return signatureBuffer.length === expectedBuffer.length
            && crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    });

    if (!isValid) {
        throw new HttpError(400, 'Invalid Stripe signature');
    }
}

async function stripeRequest(path, { method, body, stripeSecretKey }) {
    const response = await fetch(`${STRIPE_API_BASE_URL}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new HttpError(response.status >= 500 ? 502 : response.status, responseBody.error?.message || 'Stripe request failed');
    }

    return responseBody;
}

function resolveStripePriceId(selectedPlan) {
    const envName = selectedPlan === 'yearly' ? 'STRIPE_YEARLY_PRICE_ID' : 'STRIPE_MONTHLY_PRICE_ID';
    return requireEnv(envName);
}

function parseStripeSignatureHeader(signatureHeader) {
    return String(signatureHeader)
        .split(',')
        .reduce((result, part) => {
            const [key, value] = part.split('=');
            if (key === 't') {
                result.timestamp = value;
            }

            if (key === 'v1') {
                result.signatures.push(value);
            }

            return result;
        }, { timestamp: null, signatures: [] });
}

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new HttpError(500, `${name} is not configured`);
    }

    return value;
}

export {
    buildPremiumAccessResponse,
    buildSubscriptionResponse,
    cancelStripeSubscription,
    createStripeCheckoutSession,
    verifyStripeSignature
};
