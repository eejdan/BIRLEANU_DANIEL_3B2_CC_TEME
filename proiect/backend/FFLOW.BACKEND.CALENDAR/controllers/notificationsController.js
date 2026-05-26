import Notification from '../models/Notification.js';
import { serializeNotification } from '../lib/serializers.js';
import { ensure } from '../lib/http.js';
import { parseObjectId, parseQueryRange } from '../lib/validation.js';

async function getNotifications(req, res) {
    const { startDate, endDate } = parseQueryRange(req.query);

    const notifications = await Notification.find({
        owner: req.user.id,
        scheduledFor: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ scheduledFor: 1, createdAt: 1 });

    res.status(200).json(notifications.map(serializeNotification));
}

async function dismissNotification(req, res) {
    const notificationId = parseObjectId(req.params.notificationId, 'notificationId');
    const notification = await Notification.findOne({
        _id: notificationId,
        owner: req.user.id
    });

    ensure(notification, 404, 'Notification not found');

    notification.dismissedAt = new Date();
    await notification.save();

    res.status(200).json({ message: 'Notification dismissed successfully' });
}

export { dismissNotification, getNotifications };
