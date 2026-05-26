import { describe, expect, test } from '@jest/globals';

import {
    parseCreateEvent,
    parseCreateTask,
    parseQueryRange,
    parseWakeupOverride,
    parseWakeupTimes
} from '../lib/validation.js';

describe('validation helpers', () => {
    test('parseCreateEvent maps a valid payload', () => {
        const result = parseCreateEvent({
            title: 'Standup',
            description: 'Daily sync',
            startDate: '2026-05-25T08:00:00.000Z',
            endDate: '2026-05-25T08:30:00.000Z',
            location: 'Conference room',
            recurrence: {
                frequency: 'weekly',
                interval: 1,
                daysOfWeek: ['monday', 'wednesday']
            },
            alarm: {
                enabled: true,
                minutesBefore: 10
            }
        });

        expect(result.title).toBe('Standup');
        expect(result.location).toEqual({ label: 'Conference room' });
        expect(result.alarm.enabled).toBe(true);
        expect(result.alarm.triggerAt).toEqual(new Date('2026-05-25T07:50:00.000Z'));
    });

    test('parseCreateEvent rejects inverted dates', () => {
        expect(() => parseCreateEvent({
            title: 'Broken',
            startDate: '2026-05-25T10:00:00.000Z',
            endDate: '2026-05-25T09:00:00.000Z'
        })).toThrow('startTime must be less than or equal to endTime');
    });

    test('parseCreateTask maps a valid payload', () => {
        const result = parseCreateTask({
            title: 'Prepare report',
            date: '2026-05-25',
            estimatedMinutes: 45,
            location: {
                label: 'Library',
                address: 'Campus'
            }
        });

        expect(result.title).toBe('Prepare report');
        expect(result.estimatedMinutes).toBe(45);
        expect(result.location.address).toBe('Campus');
    });

    test('parseWakeupTimes accepts the weekly shape', () => {
        const result = parseWakeupTimes({
            wakeupTimes: {
                monday: '07:00',
                tuesday: '07:05',
                wednesday: '07:10',
                thursday: '07:15',
                friday: '07:20',
                saturday: '08:00',
                sunday: '08:30'
            }
        });

        expect(result.friday).toBe('07:20');
    });

    test('parseWakeupOverride rejects invalid time format', () => {
        expect(() => parseWakeupOverride({
            date: '2026-05-25',
            wakeupTime: '7:00'
        })).toThrow('wakeUpTime must be in HH:mm format');
    });

    test('parseQueryRange rejects invalid order', () => {
        expect(() => parseQueryRange({
            startDate: '2026-05-26T00:00:00.000Z',
            endDate: '2026-05-25T00:00:00.000Z'
        })).toThrow('startDate must be less than or equal to endDate');
    });
});
