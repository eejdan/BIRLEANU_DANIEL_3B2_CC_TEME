function serializeEvent(eventDocument) {
    const event = eventDocument.toObject ? eventDocument.toObject() : eventDocument;
    const alarmEnabled = Boolean(event.alarm?.enabled);
    const alarmTime = event.alarm?.triggerAt ?? null;

    return {
        id: String(event._id),
        title: event.title,
        description: event.description ?? null,
        startTime: event.startDate,
        endTime: event.endDate,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location?.label || event.location?.address || event.location?.latitude !== undefined || event.location?.longitude !== undefined
            ? {
                address: event.location.address ?? event.location.label ?? null,
                latitude: event.location.latitude ?? null,
                longitude: event.location.longitude ?? null,
                label: event.location.label ?? null
            }
            : null,
        recurrence: event.recurrence?.frequency ? {
            frequency: event.recurrence.frequency,
            interval: event.recurrence.interval ?? 1,
            daysOfWeek: event.recurrence.daysOfWeek ?? [],
            endsAt: event.recurrence.endsAt ?? event.recurrence.until ?? null
        } : null,
        alarmEnabled,
        alarmTime,
        alarm: {
            enabled: alarmEnabled,
            minutesBefore: event.alarm?.minutesBefore ?? null,
            triggerAt: alarmTime
        },
        ownerId: String(event.owner),
        completedAt: event.completedAt ?? null,
        failedAt: event.failedAt ?? null,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
    };
}

function serializeDateOnly(value) {
    if (!value) {
        return null;
    }

    return new Date(value).toISOString().slice(0, 10);
}

function serializeTask(taskDocument) {
    const task = taskDocument.toObject ? taskDocument.toObject() : taskDocument;
    const completed = Boolean(task.completed);

    return {
        id: String(task._id),
        title: task.title,
        description: task.description ?? null,
        date: serializeDateOnly(task.date),
        estimatedDurationMinutes: task.estimatedMinutes ?? null,
        estimatedMinutes: task.estimatedMinutes ?? null,
        priority: task.priority ?? 'medium',
        status: completed ? 'completed' : 'pending',
        manualOrder: task.manualOrder ?? 0,
        location: task.location?.label || task.location?.address ? task.location : null,
        completed,
        completedAt: task.completedAt ?? null,
        failedAt: task.failedAt ?? null,
        ownerId: String(task.owner),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt
    };
}

function serializeWakeupSchedule(document, overrides = []) {
    return {
        schedule: document?.wakeupTimes ?? null,
        wakeupTimes: document?.wakeupTimes ?? null,
        overrides: overrides.map(serializeWakeupOverride),
        updatedAt: document?.updatedAt ?? null
    };
}

function serializeWakeupOverride(overrideDocument) {
    const override = overrideDocument.toObject ? overrideDocument.toObject() : overrideDocument;

    return {
        id: String(override._id),
        date: serializeDateOnly(override.date),
        wakeUpTime: override.wakeupTime,
        wakeupTime: override.wakeupTime,
        note: override.note ?? null,
        ownerId: String(override.owner),
        createdAt: override.createdAt,
        updatedAt: override.updatedAt
    };
}

function serializeNotification(notificationDocument) {
    const notification = notificationDocument.toObject ? notificationDocument.toObject() : notificationDocument;
    const dismissed = Boolean(notification.dismissedAt);
    const type = notification.type === 'alarm'
        ? 'event_alarm'
        : (notification.type === 'wakeup' ? 'wake_up_alarm' : notification.type);

    return {
        id: String(notification._id),
        sourceType: notification.sourceType,
        sourceId: String(notification.sourceId),
        type,
        title: notification.title,
        message: notification.message ?? null,
        scheduledAt: notification.scheduledFor,
        scheduledFor: notification.scheduledFor,
        status: dismissed ? 'dismissed' : 'scheduled',
        relatedEventId: notification.sourceType === 'event' ? String(notification.sourceId) : null,
        dismissedAt: notification.dismissedAt ?? null,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt
    };
}

function serializeQuickNote(noteDocument) {
    const note = noteDocument?.toObject ? noteDocument.toObject() : noteDocument;

    return {
        id: String(note._id),
        text: note.text,
        timerDurationSeconds: note.timerDurationSeconds ?? 0,
        timerLabel: note.timerLabel ?? null,
        date: note.date,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
    };
}

function serializeFocusSession(sessionDocument) {
    const session = sessionDocument?.toObject ? sessionDocument.toObject() : sessionDocument;

    return {
        id: String(session._id),
        title: session.title,
        sessionType: session.sessionType,
        startTime: session.startTime,
        endTime: session.endTime,
        durationSeconds: session.durationSeconds,
        source: session.source,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
    };
}

export {
    serializeEvent,
    serializeFocusSession,
    serializeNotification,
    serializeQuickNote,
    serializeTask,
    serializeWakeupOverride,
    serializeWakeupSchedule
};
