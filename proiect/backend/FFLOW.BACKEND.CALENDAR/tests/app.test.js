import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import request from 'supertest';

import createApp from '../app.js';
import Event from '../models/Event.js';
import FocusSession from '../models/FocusSession.js';
import Notification from '../models/Notification.js';
import QuickNote from '../models/QuickNote.js';
import Task from '../models/Task.js';
import UserPreferences from '../models/UserPreferences.js';
import WakeupOverride from '../models/WakeupOverride.js';
import {
    createEventDocument,
    createNotificationDocument,
    createPreferencesDocument,
    createTaskDocument,
    createWakeupOverrideDocument
} from './helpers/factories.js';
import { applyJwtTestEnv, createAuthHeader } from '../../shared/testAuth.js';

describe('calendar api', () => {
    let app;

    beforeEach(() => {
        app = createApp();
        applyJwtTestEnv();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('GET /health returns ok', async () => {
        const response = await request(app).get('/health');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'ok' });
    });

    test('POST /calendar/events creates an event', async () => {
        const eventDocument = createEventDocument({
            alarm: {
                enabled: true,
                minutesBefore: 15,
                triggerAt: new Date('2026-05-25T07:45:00.000Z')
            }
        });

        jest.spyOn(Event, 'create').mockResolvedValue(eventDocument);
        jest.spyOn(Notification, 'findOneAndUpdate').mockResolvedValue(createNotificationDocument());

        const response = await request(app)
            .post('/calendar/events')
            .set('Authorization', createAuthHeader())
            .send({
                title: 'Algorithms lecture',
                startDate: '2026-05-25T08:00:00.000Z',
                endDate: '2026-05-25T10:00:00.000Z',
                alarm: {
                    enabled: true,
                    minutesBefore: 15
                }
            });

        expect(response.status).toBe(201);
        expect(response.body.event.title).toBe('Event title');
        expect(Event.create).toHaveBeenCalled();
        expect(Notification.findOneAndUpdate).toHaveBeenCalled();
    });

    test('GET /calendar/events returns events in range', async () => {
        jest.spyOn(Event, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([
                createEventDocument(),
                createEventDocument({ _id: '507f1f77bcf86cd799439099', title: 'Second event' })
            ])
        });

        const response = await request(app)
            .get('/calendar/events')
            .set('Authorization', createAuthHeader())
            .query({
                startDate: '2026-05-25T00:00:00.000Z',
                endDate: '2026-05-26T00:00:00.000Z'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[1].title).toBe('Second event');
    });

    test('GET /calendar/events/:eventId returns 404 when missing', async () => {
        jest.spyOn(Event, 'findOne').mockResolvedValue(null);

        const response = await request(app)
            .get('/calendar/events/507f1f77bcf86cd799439011')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Event not found');
    });

    test('PUT /calendar/events/:eventId updates an event', async () => {
        const eventDocument = createEventDocument();
        jest.spyOn(Event, 'findOne').mockResolvedValue(eventDocument);
        jest.spyOn(Notification, 'findOneAndDelete').mockResolvedValue(createNotificationDocument());

        const response = await request(app)
            .put('/calendar/events/507f1f77bcf86cd799439011')
            .set('Authorization', createAuthHeader())
            .send({
                title: 'Updated event',
                location: { label: 'Lab' }
            });

        expect(response.status).toBe(200);
        expect(response.body.event.title).toBe('Updated event');
        expect(eventDocument.title).toBe('Updated event');
    });

    test('DELETE /calendar/events/:eventId deletes an event', async () => {
        const eventDocument = createEventDocument();
        jest.spyOn(Event, 'findOneAndDelete').mockResolvedValue(eventDocument);
        jest.spyOn(Notification, 'findOneAndDelete').mockResolvedValue(createNotificationDocument());

        const response = await request(app)
            .delete('/calendar/events/507f1f77bcf86cd799439011')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Event deleted successfully');
    });

    test('PUT /calendar/events/:eventId/alarm updates alarm state', async () => {
        const eventDocument = createEventDocument();
        jest.spyOn(Event, 'findOne').mockResolvedValue(eventDocument);
        jest.spyOn(Notification, 'findOneAndUpdate').mockResolvedValue(createNotificationDocument());

        const response = await request(app)
            .put('/calendar/events/507f1f77bcf86cd799439011/alarm')
            .set('Authorization', createAuthHeader())
            .send({
                enabled: true,
                minutesBefore: 20
            });

        expect(response.status).toBe(200);
        expect(response.body.event.alarmEnabled).toBe(true);
        expect(eventDocument.alarm.minutesBefore).toBe(20);
    });

    test('POST /calendar/tasks creates a task', async () => {
        jest.spyOn(Task, 'create').mockResolvedValue(createTaskDocument());

        const response = await request(app)
            .post('/calendar/tasks')
            .set('Authorization', createAuthHeader())
            .send({
                title: 'Study',
                date: '2026-05-25',
                estimatedMinutes: 90
            });

        expect(response.status).toBe(201);
        expect(response.body.task.title).toBe('Task title');
    });

    test('GET /calendar/tasks returns daily tasks', async () => {
        jest.spyOn(Task, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([createTaskDocument()])
        });

        const response = await request(app)
            .get('/calendar/tasks')
            .set('Authorization', createAuthHeader())
            .query({ date: '2026-05-25' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test('PUT /calendar/tasks/:taskId updates a task', async () => {
        const taskDocument = createTaskDocument();
        jest.spyOn(Task, 'findOne').mockResolvedValue(taskDocument);

        const response = await request(app)
            .put('/calendar/tasks/507f1f77bcf86cd799439012')
            .set('Authorization', createAuthHeader())
            .send({
                title: 'Updated task',
                completed: true
            });

        expect(response.status).toBe(200);
        expect(response.body.task.title).toBe('Updated task');
        expect(response.body.task.status).toBe('completed');
    });

    test('DELETE /calendar/tasks/:taskId deletes a task', async () => {
        jest.spyOn(Task, 'findOneAndDelete').mockResolvedValue(createTaskDocument());

        const response = await request(app)
            .delete('/calendar/tasks/507f1f77bcf86cd799439012')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task deleted successfully');
    });

    test('PATCH /calendar/tasks/:taskId/complete marks a task complete', async () => {
        const taskDocument = createTaskDocument();
        jest.spyOn(Task, 'findOne').mockResolvedValue(taskDocument);

        const response = await request(app)
            .patch('/calendar/tasks/507f1f77bcf86cd799439012/complete')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.task.status).toBe('completed');
    });

    test('PATCH /calendar/tasks/:taskId/fail marks a task failed', async () => {
        const taskDocument = createTaskDocument();
        jest.spyOn(Task, 'findOne').mockResolvedValue(taskDocument);

        const response = await request(app)
            .patch('/calendar/tasks/507f1f77bcf86cd799439012/fail')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.task.failedAt).toEqual(expect.any(String));
    });

    test('GET /calendar/wakeup-schedule returns schedule and overrides', async () => {
        jest.spyOn(UserPreferences, 'findOne').mockResolvedValue(createPreferencesDocument());
        jest.spyOn(WakeupOverride, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([createWakeupOverrideDocument()])
        });

        const response = await request(app)
            .get('/calendar/wakeup-schedule')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.wakeupTimes.monday).toBe('07:00');
        expect(response.body.overrides).toHaveLength(1);
    });

    test('PUT /calendar/wakeup-schedule upserts schedule', async () => {
        jest.spyOn(UserPreferences, 'findOneAndUpdate').mockResolvedValue(createPreferencesDocument({
            wakeupTimes: {
                monday: '06:30',
                tuesday: '06:30',
                wednesday: '06:30',
                thursday: '06:30',
                friday: '06:30',
                saturday: '08:00',
                sunday: '08:30'
            }
        }));
        jest.spyOn(WakeupOverride, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([])
        });

        const response = await request(app)
            .put('/calendar/wakeup-schedule')
            .set('Authorization', createAuthHeader())
            .send({
                wakeupTimes: {
                    monday: '06:30',
                    tuesday: '06:30',
                    wednesday: '06:30',
                    thursday: '06:30',
                    friday: '06:30',
                    saturday: '08:00',
                    sunday: '08:30'
                }
            });

        expect(response.status).toBe(200);
        expect(response.body.wakeupTimes.monday).toBe('06:30');
    });

    test('POST /calendar/wakeup-overrides creates an override', async () => {
        const overrideDocument = createWakeupOverrideDocument();
        jest.spyOn(WakeupOverride, 'create').mockResolvedValue(overrideDocument);
        jest.spyOn(Notification, 'findOneAndUpdate').mockResolvedValue(createNotificationDocument());

        const response = await request(app)
            .post('/calendar/wakeup-overrides')
            .set('Authorization', createAuthHeader())
            .send({
                date: '2026-05-27',
                wakeupTime: '07:15',
                note: 'Exam day'
            });

        expect(response.status).toBe(201);
        expect(response.body.override.wakeUpTime).toBe('07:15');
    });

    test('DELETE /calendar/wakeup-overrides/:overrideId deletes an override', async () => {
        const overrideDocument = createWakeupOverrideDocument();
        jest.spyOn(WakeupOverride, 'findOneAndDelete').mockResolvedValue(overrideDocument);
        jest.spyOn(Notification, 'findOneAndDelete').mockResolvedValue(createNotificationDocument());

        const response = await request(app)
            .delete('/calendar/wakeup-overrides/507f1f77bcf86cd799439013')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Wake-up override deleted successfully');
    });

    test('GET /calendar/notifications returns notifications', async () => {
        jest.spyOn(Notification, 'find').mockReturnValue({
            sort: jest.fn().mockResolvedValue([createNotificationDocument()])
        });

        const response = await request(app)
            .get('/calendar/notifications')
            .set('Authorization', createAuthHeader())
            .query({
                startDate: '2026-05-25T00:00:00.000Z',
                endDate: '2026-05-26T00:00:00.000Z'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].type).toBe('event_alarm');
    });

    test('PATCH /calendar/notifications/:notificationId/dismiss dismisses a notification', async () => {
        const notificationDocument = createNotificationDocument();
        jest.spyOn(Notification, 'findOne').mockResolvedValue(notificationDocument);

        const response = await request(app)
            .patch('/calendar/notifications/507f1f77bcf86cd799439014/dismiss')
            .set('Authorization', createAuthHeader());

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Notification dismissed successfully');
        expect(notificationDocument.dismissedAt).toBeInstanceOf(Date);
    });

    test('POST /calendar/quick-notes stores a quick note', async () => {
        jest.spyOn(QuickNote, 'create').mockResolvedValue({
            _id: '507f1f77bcf86cd799439051',
            text: 'Remember lab notes',
            timerDurationSeconds: 300,
            timerLabel: '05:00',
            date: new Date('2026-05-25T00:00:00.000Z'),
            createdAt: new Date('2026-05-25T09:00:00.000Z'),
            updatedAt: new Date('2026-05-25T09:00:00.000Z'),
            toObject() {
                return { ...this };
            }
        });

        const response = await request(app)
            .post('/calendar/quick-notes')
            .set('Authorization', createAuthHeader())
            .send({
                text: 'Remember lab notes',
                timerDurationSeconds: 300,
                timerLabel: '05:00',
                date: '2026-05-25T00:00:00.000Z'
            });

        expect(response.status).toBe(201);
        expect(response.body.note.text).toBe('Remember lab notes');
    });

    test('POST /calendar/focus-sessions stores a focus session', async () => {
        jest.spyOn(FocusSession, 'create').mockResolvedValue({
            _id: '507f1f77bcf86cd799439052',
            title: 'Focus timer',
            sessionType: 'focus',
            startTime: new Date('2026-05-25T08:00:00.000Z'),
            endTime: new Date('2026-05-25T08:30:00.000Z'),
            durationSeconds: 1800,
            source: 'timer',
            createdAt: new Date('2026-05-25T08:30:00.000Z'),
            updatedAt: new Date('2026-05-25T08:30:00.000Z'),
            toObject() {
                return { ...this };
            }
        });

        const response = await request(app)
            .post('/calendar/focus-sessions')
            .set('Authorization', createAuthHeader())
            .send({
                title: 'Focus timer',
                sessionType: 'focus',
                startTime: '2026-05-25T08:00:00.000Z',
                endTime: '2026-05-25T08:30:00.000Z',
                durationSeconds: 1800,
                source: 'timer'
            });

        expect(response.status).toBe(201);
        expect(response.body.session.durationSeconds).toBe(1800);
    });

    test('unknown routes return 404 json', async () => {
        const response = await request(app).get('/missing');

        expect(response.status).toBe(404);
        expect(response.body.message).toMatch(/Route GET \/missing not found/);
    });
});
