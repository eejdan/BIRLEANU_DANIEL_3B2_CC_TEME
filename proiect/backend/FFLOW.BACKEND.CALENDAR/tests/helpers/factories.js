function createEventDocument(overrides = {}) {
    const state = {
        _id: '507f1f77bcf86cd799439011',
        title: 'Event title',
        description: 'Event description',
        startDate: new Date('2026-05-25T08:00:00.000Z'),
        endDate: new Date('2026-05-25T09:00:00.000Z'),
        location: { label: 'Office', address: 'Main street' },
        recurrence: null,
        alarm: { enabled: false, minutesBefore: null, triggerAt: null },
        owner: '111111111111111111111111',
        createdAt: new Date('2026-05-24T10:00:00.000Z'),
        updatedAt: new Date('2026-05-24T10:00:00.000Z'),
        ...overrides
    };

    return {
        ...state,
        toObject() {
            return { ...state };
        },
        async save() {
            Object.assign(state, this);
            state.updatedAt = new Date();
            Object.assign(this, state);
            return this;
        }
    };
}

function createTaskDocument(overrides = {}) {
    const state = {
        _id: '507f1f77bcf86cd799439012',
        title: 'Task title',
        description: 'Task description',
        date: new Date('2026-05-25T00:00:00.000Z'),
        estimatedMinutes: 30,
        location: { label: 'Home' },
        completed: false,
        completedAt: null,
        owner: '111111111111111111111111',
        createdAt: new Date('2026-05-24T10:00:00.000Z'),
        updatedAt: new Date('2026-05-24T10:00:00.000Z'),
        ...overrides
    };

    return {
        ...state,
        toObject() {
            return { ...state };
        },
        async save() {
            Object.assign(state, this);
            state.updatedAt = new Date();
            Object.assign(this, state);
            return this;
        }
    };
}

function createWakeupOverrideDocument(overrides = {}) {
    const state = {
        _id: '507f1f77bcf86cd799439013',
        owner: '111111111111111111111111',
        date: new Date('2026-05-27T00:00:00.000Z'),
        wakeupTime: '07:15',
        note: 'Exam day',
        createdAt: new Date('2026-05-24T10:00:00.000Z'),
        updatedAt: new Date('2026-05-24T10:00:00.000Z'),
        ...overrides
    };

    return {
        ...state,
        toObject() {
            return { ...state };
        }
    };
}

function createNotificationDocument(overrides = {}) {
    const state = {
        _id: '507f1f77bcf86cd799439014',
        owner: '111111111111111111111111',
        sourceType: 'event',
        sourceId: '507f1f77bcf86cd799439011',
        type: 'alarm',
        title: 'Alarm: Event title',
        message: 'Event alarm',
        scheduledFor: new Date('2026-05-25T07:45:00.000Z'),
        dismissedAt: null,
        createdAt: new Date('2026-05-24T10:00:00.000Z'),
        updatedAt: new Date('2026-05-24T10:00:00.000Z'),
        ...overrides
    };

    return {
        ...state,
        toObject() {
            return { ...state };
        },
        async save() {
            Object.assign(state, this);
            state.updatedAt = new Date();
            Object.assign(this, state);
            return this;
        }
    };
}

function createPreferencesDocument(overrides = {}) {
    return {
        user: '111111111111111111111111',
        wakeupTimes: {
            monday: '07:00',
            tuesday: '07:00',
            wednesday: '07:00',
            thursday: '07:00',
            friday: '07:00',
            saturday: '08:00',
            sunday: '08:30'
        },
        updatedAt: new Date('2026-05-24T10:00:00.000Z'),
        ...overrides
    };
}

export {
    createEventDocument,
    createNotificationDocument,
    createPreferencesDocument,
    createTaskDocument,
    createWakeupOverrideDocument
};
