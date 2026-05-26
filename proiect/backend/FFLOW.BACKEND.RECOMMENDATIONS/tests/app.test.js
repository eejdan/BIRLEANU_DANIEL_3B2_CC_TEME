import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import createApp from '../app.js';
import Event from '../models/Event.js';
import FreeTimePreference from '../models/FreeTimePreference.js';
import FocusSession from '../models/FocusSession.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { applyJwtTestEnv, createAuthHeader } from '../../shared/testAuth.js';

function createEventDocument(overrides = {}) {
    return {
        _id: overrides._id ?? '507f1f77bcf86cd799439031',
        title: overrides.title ?? 'Lecture',
        startDate: overrides.startDate ?? new Date('2026-05-26T08:00:00.000Z'),
        endDate: overrides.endDate ?? new Date('2026-05-26T10:00:00.000Z'),
        location: overrides.location ?? {
            address: '10 Main Street, Bucharest',
            latitude: 44.4268,
            longitude: 26.1025
        },
        owner: overrides.owner ?? '111111111111111111111111',
        toObject() {
            return { ...this };
        }
    };
}

function createTaskDocument(overrides = {}) {
    return {
        _id: overrides._id ?? '507f1f77bcf86cd799439032',
        title: overrides.title ?? 'Study',
        date: overrides.date ?? new Date('2026-05-26T00:00:00.000Z'),
        estimatedMinutes: overrides.estimatedMinutes ?? 45,
        priority: overrides.priority ?? 'high',
        completed: false,
        toObject() {
            return { ...this };
        }
    };
}

function createPreferenceDocument(overrides = {}) {
    return {
        activities: overrides.activities ?? [
            {
                activityType: 'read_book',
                displayName: 'Read a book',
                minimumDurationMinutes: 20
            }
        ],
        toObject() {
            return {
                activities: this.activities
            };
        }
    };
}

describe('recommendations api', () => {
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

    test('POST /recommendations/commute returns a planned-ahead suggestion for free users', async () => {
        jest.spyOn(Event, 'findOne').mockResolvedValue(createEventDocument());

        const response = await request(app)
            .post('/recommendations/commute')
            .set('Authorization', createAuthHeader())
            .send({
                eventId: '507f1f77bcf86cd799439031',
                origin: {
                    address: 'Campus',
                    latitude: 44.4378,
                    longitude: 26.0946
                },
                destination: {
                    address: '10 Main Street, Bucharest',
                    latitude: 44.4268,
                    longitude: 26.1025
                },
                arrivalTime: '2026-05-26T08:00:00.000Z'
            });

        expect(response.status).toBe(200);
        expect(response.body.eventId).toBe('507f1f77bcf86cd799439031');
        expect(response.body.routeOptions).toHaveLength(3);
        expect(global.fetch).toBeUndefined();
    });

    test('POST /recommendations/commute rejects same-day suggestions for free users', async () => {
        const today = new Date();
        const arrivalTime = new Date(Date.UTC(
            today.getUTCFullYear(),
            today.getUTCMonth(),
            today.getUTCDate(),
            12,
            0,
            0
        ));

        jest.spyOn(Event, 'findOne').mockResolvedValue(createEventDocument({ startDate: arrivalTime }));

        mockBillingPremiumAccess(false);

        const response = await request(app)
            .post('/recommendations/commute')
            .set('Authorization', createAuthHeader())
            .send({
                eventId: '507f1f77bcf86cd799439031',
                origin: { address: 'Home' },
                destination: { address: 'Office' },
                arrivalTime: arrivalTime.toISOString()
            });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Free users can request commute suggestions only for planned-ahead schedules');
        expect(global.fetch).toHaveBeenCalled();
    });

    test('POST /recommendations/tasks/auto-arrange arranges tasks for premium users', async () => {
        mockBillingPremiumAccess(true);

        const response = await request(app)
            .post('/recommendations/tasks/auto-arrange')
            .set('Authorization', createAuthHeader())
            .send({
                date: '2026-05-26',
                tasks: [createTaskDocument().toObject()],
                events: [
                    {
                        id: 'evt_1',
                        title: 'Lecture',
                        startTime: '2026-05-26T09:00:00.000Z',
                        endTime: '2026-05-26T10:00:00.000Z'
                    }
                ]
            });

        expect(response.status).toBe(200);
        expect(response.body.arrangedTasks).toHaveLength(1);
        expect(response.body.arrangedTasks[0].suggestedStartTime).toEqual(expect.any(String));
    });

    test('POST /recommendations/tasks/auto-arrange rejects free users', async () => {
        mockBillingPremiumAccess(false);

        const response = await request(app)
            .post('/recommendations/tasks/auto-arrange')
            .set('Authorization', createAuthHeader())
            .send({ date: '2026-05-26' });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Premium access is required for task auto-arrangement');
    });

    test('GET /recommendations/free-time/preferences returns stored activities', async () => {
        jest.spyOn(FreeTimePreference, 'findOne').mockResolvedValue(createPreferenceDocument());

        const response = await request(app)
            .get('/recommendations/free-time/preferences')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.activities[0].activityType).toBe('read_book');
    });

    test('PUT /recommendations/free-time/preferences upserts activities', async () => {
        jest.spyOn(FreeTimePreference, 'findOneAndUpdate').mockResolvedValue(createPreferenceDocument());

        const response = await request(app)
            .put('/recommendations/free-time/preferences')
            .set('Authorization', createAuthHeader())
            .send({
                activities: [
                    {
                        activityType: 'read_book',
                        displayName: 'Read a book',
                        minimumDurationMinutes: 20
                    }
                ]
            });

        expect(response.status).toBe(200);
        expect(response.body.activities).toHaveLength(1);
    });

    test('POST /recommendations/free-time/suggest returns a fitting activity', async () => {
        jest.spyOn(FreeTimePreference, 'findOne').mockResolvedValue(createPreferenceDocument());

        const response = await request(app)
            .post('/recommendations/free-time/suggest')
            .set('Authorization', createAuthHeader())
            .send({
                date: '2026-05-26',
                availableTimeWindow: {
                    startTime: '2026-05-26T12:00:00.000Z',
                    endTime: '2026-05-26T12:45:00.000Z'
                }
            });

        expect(response.status).toBe(200);
        expect(response.body.suggestedActivity.activityType).toBe('read_book');
    });

    test('POST /recommendations/free-time/suggest can detect a free slot from backend data', async () => {
        jest.spyOn(FreeTimePreference, 'findOne').mockResolvedValue(createPreferenceDocument());
        jest.spyOn(Task, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
        jest.spyOn(Event, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .post('/recommendations/free-time/suggest')
            .set('Authorization', createAuthHeader())
            .send({
                date: '2026-05-26'
            });

        expect(response.status).toBe(200);
        expect(response.body.availableTimeWindow.startTime).toBeTruthy();
    });

    test('GET /recommendations/analytics/summary returns backend analytics', async () => {
        jest.spyOn(Task, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
        jest.spyOn(Event, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });
        jest.spyOn(FocusSession, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .get('/recommendations/analytics/summary')
            .set('Authorization', createAuthHeader())
            .query({ period: 'week' });

        expect(response.status).toBe(200);
        expect(response.body.focusScore).toBeTruthy();
        expect(response.body.preview).toBeTruthy();
    });

    test('GET /recommendations/analytics/leaderboard returns ranked entries', async () => {
        jest.spyOn(User, 'find').mockReturnValue({
            sort: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([
                    { _id: '111111111111111111111111', name: 'Alice', email: 'alice@example.com' }
                ])
            })
        });
        jest.spyOn(Task, 'find').mockResolvedValue([]);
        jest.spyOn(Event, 'find').mockResolvedValue([]);
        jest.spyOn(FocusSession, 'find').mockResolvedValue([]);

        const response = await request(app)
            .get('/recommendations/analytics/leaderboard')
            .set('Authorization', createAuthHeader())
            .query({ period: 'week' });

        expect(response.status).toBe(200);
        expect(response.body[0].name).toBe('Alice');
    });
});
