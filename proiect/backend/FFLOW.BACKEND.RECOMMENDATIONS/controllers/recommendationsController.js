import Event from '../models/Event.js';
import FreeTimePreference from '../models/FreeTimePreference.js';
import FocusSession from '../models/FocusSession.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { getPremiumAccess } from '../../shared/billingClient.js';
import { ensure, HttpError } from '../lib/http.js';
import {
    buildAnalyticsSummary,
    buildCommuteSuggestion,
    buildFreeTimeSuggestion,
    buildTaskArrangement,
    derivePeriodRange,
    expandRecurringEvents,
    findAvailableTimeWindow
} from '../lib/recommendationEngine.js';
import { serializeFreeTimePreferences } from '../lib/serializers.js';
import {
    parseAnalyticsPeriod,
    parseAutoArrangeTasksRequest,
    parseCommuteRecalculationRequest,
    parseCommuteSuggestionRequest,
    parseFreeTimePreferencesRequest,
    parseFreeTimeSuggestionRequest
} from '../lib/validation.js';

async function createCommuteSuggestion(req, res) {
    const payload = parseCommuteSuggestionRequest(req.body);

    const event = await Event.findOne({
        _id: payload.eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');
    const isSameDaySuggestion = isSameUtcDate(payload.arrivalTime, new Date());
    if (isSameDaySuggestion) {
        const hasPremiumAccess = await getPremiumAccess(req.headers.authorization);
        ensure(
            hasPremiumAccess,
            403,
            'Free users can request commute suggestions only for planned-ahead schedules'
        );
    }

    const suggestion = await buildCommuteSuggestion({
        arrivalTime: payload.arrivalTime,
        destination: payload.destination,
        event,
        origin: payload.origin
    });

    res.status(200).json(suggestion);
}

async function recalculateCommuteSuggestion(req, res) {
    const hasPremiumAccess = await getPremiumAccess(req.headers.authorization);
    ensure(hasPremiumAccess, 403, 'Premium access is required for commute recalculation');

    const payload = parseCommuteRecalculationRequest(req.body);

    const event = await Event.findOne({
        _id: payload.eventId,
        owner: req.user.id
    });

    ensure(event, 404, 'Event not found');
    ensure(isSameUtcDate(event.startDate, new Date()), 400, 'Commute recalculation is available for present-day schedule changes');

    const suggestion = await buildCommuteSuggestion({
        arrivalTime: event.startDate,
        destination: event.location,
        event,
        origin: payload.updatedScheduleContext.origin,
        scheduleContext: payload.updatedScheduleContext
    });

    res.status(200).json(suggestion);
}

function isSameUtcDate(left, right) {
    const leftDate = new Date(left);
    const rightDate = new Date(right);

    return leftDate.getUTCFullYear() === rightDate.getUTCFullYear()
        && leftDate.getUTCMonth() === rightDate.getUTCMonth()
        && leftDate.getUTCDate() === rightDate.getUTCDate();
}

async function autoArrangeTasks(req, res) {
    const hasPremiumAccess = await getPremiumAccess(req.headers.authorization);
    ensure(hasPremiumAccess, 403, 'Premium access is required for task auto-arrangement');

    const payload = parseAutoArrangeTasksRequest(req.body);
    const dayStart = new Date(`${payload.date}T00:00:00.000Z`);
    const dayEnd = new Date(`${payload.date}T23:59:59.999Z`);

    const tasks = payload.tasks ?? await Task.find({
        owner: req.user.id,
        date: {
            $gte: dayStart,
            $lte: dayEnd
        }
    }).sort({ createdAt: 1 });

    const events = payload.events ?? await Event.find({
        owner: req.user.id,
        startDate: { $lte: dayEnd },
        endDate: { $gte: dayStart }
    }).sort({ startDate: 1 });

    const arrangedTasks = buildTaskArrangement(payload.date, tasks, events);

    res.status(200).json({
        date: payload.date,
        arrangedTasks
    });
}

async function getFreeTimePreferences(req, res) {
    const preferences = await FreeTimePreference.findOne({ owner: req.user.id });

    res.status(200).json(serializeFreeTimePreferences(preferences));
}

async function upsertFreeTimePreferences(req, res) {
    const payload = parseFreeTimePreferencesRequest(req.body);

    const preferences = await FreeTimePreference.findOneAndUpdate(
        { owner: req.user.id },
        {
            owner: req.user.id,
            activities: payload.activities
        },
        {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
        }
    );

    res.status(200).json(serializeFreeTimePreferences(preferences));
}

async function suggestFreeTimeActivity(req, res) {
    const payload = parseFreeTimeSuggestionRequest(req.body);
    const preferences = await FreeTimePreference.findOne({ owner: req.user.id });

    const activities = preferences?.activities ?? [];
    let availableTimeWindow = payload.availableTimeWindow;

    if (!availableTimeWindow) {
        const dayStart = new Date(`${payload.date}T00:00:00.000Z`);
        const dayEnd = new Date(`${payload.date}T23:59:59.999Z`);
        const [tasks, events] = await Promise.all([
            Task.find({
                owner: req.user.id,
                date: {
                    $gte: dayStart,
                    $lte: dayEnd
                }
            }).sort({ date: 1, createdAt: 1 }),
            Event.find({
                owner: req.user.id,
                startDate: { $lte: dayEnd },
                endDate: { $gte: dayStart }
            }).sort({ startDate: 1 })
        ]);

        availableTimeWindow = findAvailableTimeWindow(payload.date, tasks, events);
    }

    ensure(availableTimeWindow, 404, 'No suitable free-time slot found');

    const suggestion = buildFreeTimeSuggestion(payload, activities, availableTimeWindow);

    if (!suggestion) {
        throw new HttpError(404, 'No suitable free-time activity found');
    }

    res.status(200).json(suggestion);
}

async function getAnalyticsSummary(req, res) {
    const period = parseAnalyticsPeriod(req.query.period);
    const { end, start } = derivePeriodRange(period);
    const [tasks, events, focusSessions] = await Promise.all([
        Task.find({
            owner: req.user.id,
            date: {
                $gte: start,
                $lte: end
            }
        }).sort({ date: 1, createdAt: 1 }),
        Event.find({
            owner: req.user.id,
            startDate: { $lte: end },
            endDate: { $gte: start }
        }).sort({ startDate: 1 }),
        FocusSession.find({
            owner: req.user.id,
            startTime: {
                $gte: start,
                $lte: end
            }
        }).sort({ startTime: -1 })
    ]);

    const summary = await buildAnalyticsSummary({
        period,
        tasks,
        events,
        focusSessions
    });

    res.status(200).json(summary);
}

async function getAnalyticsLeaderboard(req, res) {
    const period = parseAnalyticsPeriod(req.query.period);
    const { end, start } = derivePeriodRange(period);
    const users = await User.find({}).sort({ createdAt: 1 }).limit(50);

    const entries = await Promise.all(users.map(async (user) => {
        const [tasks, events, focusSessions] = await Promise.all([
            Task.find({
                owner: user._id,
                date: {
                    $gte: start,
                    $lte: end
                }
            }),
            Event.find({
                owner: user._id,
                startDate: { $lte: end },
                endDate: { $gte: start }
            }),
            FocusSession.find({
                owner: user._id,
                startTime: {
                    $gte: start,
                    $lte: end
                }
            })
        ]);

        const summary = await buildAnalyticsSummary({
            period,
            tasks,
            events,
            focusSessions
        });

        return {
            name: user.name,
            email: user.email,
            averageFocusScore: summary.focusScore.score,
            completed: summary.completed,
            total: summary.total
        };
    }));

    res.status(200).json(
        entries
            .sort((left, right) => right.averageFocusScore - left.averageFocusScore)
            .slice(0, 10)
    );
}

export {
    autoArrangeTasks,
    createCommuteSuggestion,
    getAnalyticsLeaderboard,
    getAnalyticsSummary,
    getFreeTimePreferences,
    recalculateCommuteSuggestion,
    suggestFreeTimeActivity,
    upsertFreeTimePreferences
};
