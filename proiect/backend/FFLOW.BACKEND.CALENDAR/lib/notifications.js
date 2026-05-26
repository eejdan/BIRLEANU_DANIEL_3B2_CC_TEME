import Notification from '../models/Notification.js';

async function syncEventNotification(event) {
    if (!event.alarm?.enabled || !event.alarm?.triggerAt) {
        await Notification.findOneAndDelete({
            owner: event.owner,
            sourceType: 'event',
            sourceId: event._id
        });
        return;
    }

    await Notification.findOneAndUpdate(
        {
            owner: event.owner,
            sourceType: 'event',
            sourceId: event._id
        },
        {
            owner: event.owner,
            sourceType: 'event',
            sourceId: event._id,
            type: 'event_alarm',
            title: `Alarm: ${event.title}`,
            message: event.description || 'Event alarm',
            scheduledFor: event.alarm.triggerAt,
            dismissedAt: null
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );
}

async function syncWakeupOverrideNotification(override) {
    const notificationDate = new Date(override.date);
    const [hours, minutes] = override.wakeupTime.split(':').map(Number);

    notificationDate.setUTCHours(hours, minutes, 0, 0);

    await Notification.findOneAndUpdate(
        {
            owner: override.owner,
            sourceType: 'wakeupOverride',
            sourceId: override._id
        },
        {
            owner: override.owner,
            sourceType: 'wakeupOverride',
            sourceId: override._id,
            type: 'wake_up_alarm',
            title: 'Wake-up override',
            message: override.note || `Wake up at ${override.wakeupTime}`,
            scheduledFor: notificationDate,
            dismissedAt: null
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );
}

async function deleteNotificationForSource(owner, sourceType, sourceId) {
    await Notification.findOneAndDelete({
        owner,
        sourceType,
        sourceId
    });
}

export {
    deleteNotificationForSource,
    syncEventNotification,
    syncWakeupOverrideNotification
};
