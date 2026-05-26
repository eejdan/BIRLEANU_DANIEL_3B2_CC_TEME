import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import createApp from '../app.js';
import Ad from '../models/Ad.js';
import AdInteraction from '../models/AdInteraction.js';
import { applyJwtTestEnv, createAuthHeader } from '../../shared/testAuth.js';

function createAdDocument(overrides = {}) {
    return {
        _id: overrides._id ?? '507f1f77bcf86cd799439051',
        title: overrides.title ?? 'Productivity tool discount',
        imageUrl: overrides.imageUrl ?? 'https://cdn.smarttime.example.com/ad.png',
        targetUrl: overrides.targetUrl ?? 'https://smarttime.example.com/offer',
        placement: overrides.placement ?? 'dashboard_banner',
        active: overrides.active ?? true,
        toObject() {
            return {
                _id: this._id,
                title: this.title,
                imageUrl: this.imageUrl,
                targetUrl: this.targetUrl,
                placement: this.placement,
                active: this.active
            };
        }
    };
}

describe('advertising api', () => {
    let app;

    beforeEach(() => {
        app = createApp();
        applyJwtTestEnv();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete global.fetch;
    });

    function mockBillingPremiumAccess(premiumAccess) {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ premiumAccess })
        });
    }

    test('GET /health returns ok', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    test('GET /advertising/eligibility returns ads enabled for free users', async () => {
        mockBillingPremiumAccess(false);

        const response = await request(app)
            .get('/advertising/eligibility')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.shouldShowAds).toBe(true);
    });

    test('GET /advertising/eligibility hides ads for premium users', async () => {
        mockBillingPremiumAccess(true);

        const response = await request(app)
            .get('/advertising/eligibility')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.shouldShowAds).toBe(false);
    });

    test('GET /advertising/ad returns active ad content for free users', async () => {
        mockBillingPremiumAccess(false);
        jest.spyOn(Ad, 'findOne').mockReturnValue({
            sort: jest.fn().mockResolvedValue(createAdDocument())
        });

        const response = await request(app)
            .get('/advertising/ad')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.adId).toBe('507f1f77bcf86cd799439051');
        expect(response.body.placement).toBe('dashboard_banner');
    });

    test('GET /advertising/ad rejects active premium users', async () => {
        mockBillingPremiumAccess(true);

        const response = await request(app)
            .get('/advertising/ad')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Premium users do not receive advertisements');
    });

    test('POST /advertising/impression records an impression', async () => {
        jest.spyOn(AdInteraction, 'create').mockResolvedValue({});

        const response = await request(app)
            .post('/advertising/impression')
            .set('Authorization', createAuthHeader())
            .send({
                adId: 'ad_12345',
                timestamp: '2026-05-25T12:00:00.000Z',
                placement: 'dashboard_banner'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Advertisement impression recorded successfully.');
        expect(AdInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
            eventType: 'impression',
            adId: 'ad_12345'
        }));
    });

    test('POST /advertising/click records a click', async () => {
        jest.spyOn(AdInteraction, 'create').mockResolvedValue({});

        const response = await request(app)
            .post('/advertising/click')
            .set('Authorization', createAuthHeader())
            .send({
                adId: 'ad_12345',
                timestamp: '2026-05-25T12:00:00.000Z',
                placement: 'dashboard_banner'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Advertisement click recorded successfully.');
        expect(AdInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
            eventType: 'click',
            adId: 'ad_12345'
        }));
    });
});
