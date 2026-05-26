import { ensure } from '../lib/http.js';
import {
    buildPremiumAccessResponse,
    buildSubscriptionResponse,
    cancelStripeSubscription,
    createStripeCheckoutSession,
    verifyStripeSignature
} from '../lib/billing.js';
import { findSubscription, upsertCheckoutSubscription } from '../lib/subscriptionStore.js';
import {
    parseCheckoutSessionRequest,
    parseStripeWebhookEvent
} from '../lib/validation.js';

async function getSubscription(req, res) {
    const subscription = await findSubscription({ owner: req.user.id });

    res.status(200).json(buildSubscriptionResponse(subscription));
}

async function createCheckoutSession(req, res) {
    const payload = parseCheckoutSessionRequest(req.body);
    const session = await createStripeCheckoutSession(payload.selectedPlan, req.user.id);

    await upsertCheckoutSubscription(req.user.id, {
        selectedPlan: payload.selectedPlan,
        status: 'free',
        lastCheckoutSessionId: session.checkoutSessionId,
        checkoutUrl: session.checkoutUrl
    });

    res.status(201).json(session);
}

async function cancelSubscription(req, res) {
    const subscription = await findSubscription({ owner: req.user.id });
    ensure(subscription, 404, 'Subscription not found');

    await cancelStripeSubscription(subscription.stripeSubscriptionId);

    subscription.status = 'cancelled';
    subscription.renewalDate = null;
    await subscription.save();

    res.status(200).json(buildSubscriptionResponse(subscription));
}

async function receiveStripeWebhook(req, res) {
    verifyStripeSignature(req.rawBody, req.headers['stripe-signature']);
    const event = parseStripeWebhookEvent(req.body);
    const object = event.data.object;

    const subscription = await findSubscriptionForWebhook(object);
    if (subscription) {
        applyWebhookEvent(subscription, event);
        await subscription.save();
    }

    res.status(200).json({ message: 'Webhook processed successfully.' });
}

async function validatePremiumAccess(req, res) {
    const subscription = await findSubscription({ owner: req.user.id });

    res.status(200).json(buildPremiumAccessResponse(subscription));
}

async function findSubscriptionForWebhook(object) {
    if (object.metadata?.userId) {
        return findSubscription({ owner: object.metadata.userId });
    }

    if (object.client_reference_id) {
        return findSubscription({ owner: object.client_reference_id });
    }

    if (object.id) {
        return findSubscription({ lastCheckoutSessionId: object.id });
    }

    if (object.subscription) {
        return findSubscription({ stripeSubscriptionId: object.subscription });
    }

    return null;
}

function applyWebhookEvent(subscription, event) {
    const object = event.data.object;

    if (event.type === 'checkout.session.completed') {
        subscription.status = 'active';
        subscription.plan = subscription.selectedPlan ?? object.metadata?.selectedPlan ?? 'monthly';
        subscription.lastCheckoutSessionId = object.id ?? subscription.lastCheckoutSessionId;
        subscription.stripeCustomerId = object.customer ?? subscription.stripeCustomerId;
        subscription.stripeSubscriptionId = object.subscription ?? subscription.stripeSubscriptionId;
        subscription.renewalDate = resolveRenewalDate(subscription.plan, object.current_period_end);
        return;
    }

    if (event.type === 'invoice.payment_failed') {
        subscription.status = 'past_due';
        return;
    }

    if (event.type === 'customer.subscription.deleted') {
        subscription.status = 'cancelled';
        subscription.renewalDate = null;
        return;
    }

    if (event.type === 'customer.subscription.updated') {
        subscription.status = mapWebhookStatus(object.status);
        subscription.plan = object.metadata?.selectedPlan ?? subscription.plan;
        subscription.stripeSubscriptionId = object.id ?? subscription.stripeSubscriptionId;
        subscription.renewalDate = resolveRenewalDate(subscription.plan, object.current_period_end);
    }
}

function mapWebhookStatus(status) {
    if (status === 'active') {
        return 'active';
    }

    if (status === 'past_due') {
        return 'past_due';
    }

    if (status === 'canceled' || status === 'cancelled') {
        return 'cancelled';
    }

    return 'free';
}

function resolveRenewalDate(plan, currentPeriodEnd) {
    if (currentPeriodEnd) {
        return new Date(Number(currentPeriodEnd) * 1000);
    }

    const now = new Date();
    const renewalDate = new Date(now);
    renewalDate.setUTCDate(now.getUTCDate() + (plan === 'yearly' ? 365 : 30));
    return renewalDate;
}

export {
    cancelSubscription,
    createCheckoutSession,
    getSubscription,
    receiveStripeWebhook,
    validatePremiumAccess
};
