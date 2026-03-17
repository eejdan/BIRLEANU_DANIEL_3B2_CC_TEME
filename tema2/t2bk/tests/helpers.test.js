const {
    validateEmail,
    isIsoDateTime,
    parseDateOnly,
    validateEventPayload,
    getDayName,
    getEventsForDate,
    findFirstAndNextEvents,
    parseDurationSeconds,
    buildReadingRecommendation
} = require('../src/helpers');

describe('helpers module', () => {
    test('validateEmail handles valid and invalid values', () => {
        expect(validateEmail('user@example.com')).toBe(true);
        expect(validateEmail('invalid')).toBe(false);
        expect(validateEmail(null)).toBe(false);
    });

    test('date and datetime parsers behave as expected', () => {
        expect(isIsoDateTime('2026-03-20T10:00:00.000Z')).toBe(true);
        expect(isIsoDateTime('not-date')).toBe(false);
        expect(parseDateOnly('2026-03-20')).not.toBeNull();
        expect(parseDateOnly('20-03-2026')).toBeNull();
    });

    test('validateEventPayload validates constraints', () => {
        const valid = validateEventPayload({
            title: 'Meeting',
            startDateTime: '2026-03-20T10:00:00.000Z',
            endDateTime: '2026-03-20T11:00:00.000Z',
            location: 'Office',
            recurrence: 'once'
        });

        const invalid = validateEventPayload({
            title: 'M',
            startDateTime: '2026-03-20T11:00:00.000Z',
            endDateTime: '2026-03-20T10:00:00.000Z',
            location: 'Office',
            recurrence: 'daily'
        });

        expect(valid.ok).toBe(true);
        expect(invalid.ok).toBe(false);
    });

    test('day and event selectors work for once and weekly', () => {
        expect(getDayName('2026-03-20')).toBe('friday');

        const events = [
            {
                id: '1',
                recurrence: 'once',
                startDateTime: '2026-03-20T09:00:00.000Z'
            },
            {
                id: '2',
                recurrence: 'weekly',
                startDateTime: '2026-03-13T09:00:00.000Z'
            },
            {
                id: '3',
                recurrence: 'weekly',
                startDateTime: '2026-03-14T09:00:00.000Z'
            }
        ];

        const selected = getEventsForDate(events, '2026-03-20');
        expect(selected.map((event) => event.id)).toEqual(['1', '2']);
    });

    test('findFirstAndNextEvents and parseDurationSeconds work', () => {
        const events = [{ id: 'a' }, { id: 'b' }];
        expect(findFirstAndNextEvents(events, 'a')).toEqual({ current: { id: 'a' }, next: { id: 'b' } });
        expect(findFirstAndNextEvents(events, 'x')).toBeNull();

        expect(parseDurationSeconds(120)).toBe(120);
        expect(parseDurationSeconds('900s')).toBe(900);
        expect(parseDurationSeconds('x')).toBe(0);
    });

    test('buildReadingRecommendation returns default and post-event suggestion', () => {
        const books = { data: [{ title: 'Book1' }, { title: 'Book2' }, { title: 'Book3' }, { title: 'Book4' }] };
        const noEvent = buildReadingRecommendation(books, [], '2026-03-20');
        expect(noEvent.books).toHaveLength(3);
        expect(noEvent.suggestedActivity.startDateTime).toBe('2026-03-20T20:00:00.000Z');

        const withEvent = buildReadingRecommendation(
            books,
            [
                {
                    recurrence: 'once',
                    startDateTime: '2026-03-20T10:00:00.000Z',
                    endDateTime: '2026-03-20T11:00:00.000Z'
                }
            ],
            '2026-03-20'
        );

        expect(withEvent.suggestedActivity.startDateTime).toBe('2026-03-20T11:15:00.000Z');
    });
});
