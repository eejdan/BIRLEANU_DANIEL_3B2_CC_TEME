import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import crypto from 'node:crypto';
import request from 'supertest';

import createApp from '../app.js';
import Subscription from '../models/Subscription.js';
import { applyJwtTestEnv, createAuthHeader } from '../../shared/testAuth.js';

function createSubscriptionDocument(overrides = {}) {
    return {
        _id: overrides._id ?? '507f1f77bcf86cd799439041',
        owner: overrides.owner ?? '111111111111111111111111',
        status: overrides.status ?? 'active',
        plan: overrides.plan ?? 'monthly',
        selectedPlan: overrides.selectedPlan ?? 'monthly',
        renewalDate: overrides.renewalDate ?? new Date('2026-06-25T00:00:00.000Z'),
        lastCheckoutSessionId: overrides.lastCheckoutSessionId ?? 'cs_test_12345',
        stripeSubscriptionId: overrides.stripeSubscriptionId ?? 'sub_123',
        save: jest.fn().mockResolvedValue(null),
        toObject() {
            return {
                _id: this._id,
                owner: this.owner,
                status: this.status,
                plan: this.plan,
                selectedPlan: this.selectedPlan,
                renewalDate: this.renewalDate,
                lastCheckoutSessionId: this.lastCheckoutSessionId,
                stripeSubscriptionId: this.stripeSubscriptionId
            };
        }
    };
}

function createStripeSignature(payload, secret = 'whsec_test') {
    const timestamp = '1779700000';
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

    return `t=${timestamp},v1=${signature}`;
}

describe('billing api', () => {
    let app;

    beforeEach(() => {
        app = createApp();
        applyJwtTestEnv();
        process.env.STRIPE_SECRET_KEY = 'sk_test_123';
        process.env.STRIPE_MONTHLY_PRICE_ID = 'price_monthly_123';
        process.env.STRIPE_YEARLY_PRICE_ID = 'price_yearly_123';
        process.env.STRIPE_CHECKOUT_SUCCESS_URL = 'http://localhost:3000/success';
        process.env.STRIPE_CHECKOUT_CANCEL_URL = 'http://localhost:3000/cancel';
        process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.fetch;
    });

    test('GET /health returns ok', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    test('GET /billing/subscription returns free status when missing', async () => {
        jest.spyOn(Subscription, 'findOne').mockResolvedValue(null);

        const response = await request(app)
            .get('/billing/subscription')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            status: 'free',
            plan: null,
            renewalDate: null
        });
    });

    test('POST /billing/checkout-session creates a real Stripe checkout session', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({
                id: 'cs_test_real',
                url: 'https://checkout.stripe.com/c/pay/cs_test_real'
            })
        });
        jest.spyOn(Subscription, 'findOneAndUpdate').mockResolvedValue(createSubscriptionDocument({ status: 'free' }));

        const response = await request(app)
            .post('/billing/checkout-session')
            .set('Authorization', createAuthHeader())
            .send({ selectedPlan: 'monthly' });

        expect(response.status).toBe(201);
        expect(response.body.checkoutSessionId).toBe('cs_test_real');
        expect(response.body.checkoutUrl).toBe('https://checkout.stripe.com/c/pay/cs_test_real');
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.stripe.com/v1/checkout/sessions',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: 'Bearer sk_test_123'
                })
            })
        );
        expect(Subscription.findOneAndUpdate).toHaveBeenCalled();
    });

    test('POST /billing/cancel-subscription cancels an existing subscription', async () => {
        const subscription = createSubscriptionDocument();
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ id: 'sub_123', cancel_at_period_end: true })
        });
        jest.spyOn(Subscription, 'findOne').mockResolvedValue(subscription);

        const response = await request(app)
            .post('/billing/cancel-subscription')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.status).toBe('cancelled');
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.stripe.com/v1/subscriptions/sub_123',
            expect.objectContaining({ method: 'POST' })
        );
        expect(subscription.save).toHaveBeenCalled();
    });

    test('POST /billing/cancel-subscription returns 404 when missing', async () => {
        jest.spyOn(Subscription, 'findOne').mockResolvedValue(null);

        const response = await request(app)
            .post('/billing/cancel-subscription')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Subscription not found');
    });

    test('POST /billing/stripe-webhook processes checkout completion', async () => {
        const subscription = createSubscriptionDocument({ status: 'free', plan: null });
        jest.spyOn(Subscription, 'findOne').mockResolvedValue(subscription);
        const payload = JSON.stringify({
            type: 'checkout.session.completed',
            data: {
                object: {
                    id: 'cs_test_12345',
                    client_reference_id: '111111111111111111111111',
                    customer: 'cus_123',
                    subscription: 'sub_123',
                    metadata: {
                        selectedPlan: 'monthly'
                    }
                }
            }
        });

        const response = await request(app)
            .post('/billing/stripe-webhook')
            .set('Stripe-Signature', createStripeSignature(payload))
            .set('Content-Type', 'application/json')
            .send(payload);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Webhook processed successfully.');
        expect(subscription.status).toBe('active');
        expect(subscription.save).toHaveBeenCalled();
    });

    test('GET /billing/premium-access returns true for active subscription', async () => {
        jest.spyOn(Subscription, 'findOne').mockResolvedValue(createSubscriptionDocument({ status: 'active' }));

        const response = await request(app)
            .get('/billing/premium-access')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.premiumAccess).toBe(true);
    });
});
