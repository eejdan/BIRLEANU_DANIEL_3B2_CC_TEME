import Event from '../models/Event.js';
import { syncEventNotification } from '../lib/notifications.js';
import { expandRecurringEvents } from '../lib/recurrence.js';
import { serializeEvent } from '../lib/serializers.js';
import { ensure, HttpError } from '../lib/http.js';
import { parseCreateEvent, parseEventAlarm, parseObjectId, parseQueryRange, parseUpdateEvent } from '../lib/validation.js';

async function createEvent(req, res) {
    const payload = parseCreateEvent(req.body);

    const event = await Event.create({
        ...payload,
        owner: req.user.id
    });

    await syncEventNotification(event);

    res.status(201).json({ event: serializeEvent(event) });
}

async function getEvents(req, res) {
    const { startDate, endDate } = parseQueryRange(req.query);

    const events = await Event.find({
        owner: req.user.id,
        $or: [
            {
                startDate: { $lte: endDate },
                endDate: { $gte: startDate }
            },
            {
                'recurrence.frequency': { $in: ['daily', 'weekly', 'monthly', 'yearly'] }
            }
        ]
    }).sort({ startDate: 1, createdAt: 1 });

    res.status(200).json(expandRecurringEvents(events, startDate, endDate).map(serializeEvent));
}

async function getEventById(req, res) {
    const eventId = parseObjectId(req.params.eventId, 'eventId');
    const event = await Event.findOne({
        _id: eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');
    res.status(200).json({ event: serializeEvent(event) });
}

async function updateEvent(req, res) {
    const eventId = parseObjectId(req.params.eventId, 'eventId');
    const event = await Event.findOne({
        _id: eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');

    const payload = parseUpdateEvent(req.body, event);

    if (payload.alarm) {
        event.alarm = {
            ...event.alarm?.toObject?.(),
            ...payload.alarm
        };
        delete payload.alarm;
    }

    Object.assign(event, payload);
    if ('startDate' in payload || 'endDate' in payload) {
        event.failedAt = null;
    }
    await event.save();
    await syncEventNotification(event);

    res.status(200).json({ event: serializeEvent(event) });
}

async function deleteEvent(req, res) {
    const eventId = parseObjectId(req.params.eventId, 'eventId');

    const event = await Event.findOneAndDelete({
        _id: eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');
    await syncEventNotification({
        _id: event._id,
        owner: event.owner,
        alarm: { enabled: false }
    });

    res.status(200).json({ message: 'Event deleted successfully' });
}

async function updateEventAlarm(req, res) {
    const eventId = parseObjectId(req.params.eventId, 'eventId');
    const event = await Event.findOne({
        _id: eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');

    if (!req.body || typeof req.body !== 'object') {
        throw new HttpError(400, 'Request body must be an object');
    }

    const requestedEnabled = req.body.alarmEnabled ?? req.body.enabled;

    if (typeof requestedEnabled !== 'boolean') {
        throw new HttpError(400, 'alarmEnabled must be a boolean');
    }

    const parsedAlarm = parseEventAlarm({
        enabled: requestedEnabled,
        minutesBefore: req.body.minutesBefore,
        triggerAt: req.body.alarmTime ?? req.body.triggerAt
    }, event.startDate, true);
    const alarm = {
        enabled: requestedEnabled,
        minutesBefore: parsedAlarm?.minutesBefore,
        triggerAt: requestedEnabled ? parsedAlarm?.triggerAt : undefined
    };

    event.alarm = alarm;
    await event.save();
    await syncEventNotification(event);

    res.status(200).json({ event: serializeEvent(event) });
}

async function completeEvent(req, res) {
    const eventId = parseObjectId(req.params.eventId, 'eventId');
    const event = await Event.findOne({
        _id: eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');

    event.completedAt = new Date();
    event.failedAt = null;
    await event.save();

    res.status(200).json({ event: serializeEvent(event) });
}

async function failEvent(req, res) {
    const eventId = parseObjectId(req.params.eventId, 'eventId');
    const event = await Event.findOne({
        _id: eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');

    event.failedAt = new Date();
    event.completedAt = null;
    await event.save();

    res.status(200).json({ event: serializeEvent(event) });
}

export {
    completeEvent,
    createEvent,
    deleteEvent,
    failEvent,
    getEventById,
    getEvents,
    updateEvent,
    updateEventAlarm
};
