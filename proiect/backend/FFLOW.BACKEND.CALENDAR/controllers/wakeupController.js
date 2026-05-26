import UserPreferences from '../models/UserPreferences.js';
import WakeupOverride from '../models/WakeupOverride.js';
import { deleteNotificationForSource, syncWakeupOverrideNotification } from '../lib/notifications.js';
import { serializeWakeupOverride, serializeWakeupSchedule } from '../lib/serializers.js';
import { ensure } from '../lib/http.js';
import { parseObjectId, parseWakeupOverride, parseWakeupTimes } from '../lib/validation.js';

async function getWakeupSchedule(req, res) {
    const [preferences, overrides] = await Promise.all([
        UserPreferences.findOne({ user: req.user.id }),
        WakeupOverride.find({ owner: req.user.id }).sort({ date: 1 })
    ]);

    res.status(200).json(serializeWakeupSchedule(preferences, overrides));
}

async function upsertWakeupSchedule(req, res) {
    const wakeupTimes = parseWakeupTimes(req.body);

    const preferences = await UserPreferences.findOneAndUpdate(
        { user: req.user.id },
        {
            user: req.user.id,
            wakeupTimes
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    const overrides = await WakeupOverride.find({ owner: req.user.id }).sort({ date: 1 });
    res.status(200).json(serializeWakeupSchedule(preferences, overrides));
}

async function createWakeupOverride(req, res) {
    const payload = parseWakeupOverride(req.body);

    const override = await WakeupOverride.create({
        ...payload,
        owner: req.user.id
    });

    await syncWakeupOverrideNotification(override);

    res.status(201).json({ override: serializeWakeupOverride(override) });
}

async function deleteWakeupOverride(req, res) {
    const overrideId = parseObjectId(req.params.overrideId, 'overrideId');
    const override = await WakeupOverride.findOneAndDelete({
        _id: overrideId,
        owner: req.user.id
    });

    ensure(override, 404, 'Wake-up override not found');
    await deleteNotificationForSource(req.user.id, 'wakeupOverride', override._id);

    res.status(200).json({ message: 'Wake-up override deleted successfully' });
}

export {
    createWakeupOverride,
    deleteWakeupOverride,
    getWakeupSchedule,
    upsertWakeupSchedule
};
