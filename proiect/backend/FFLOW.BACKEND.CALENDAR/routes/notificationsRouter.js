import express from 'express';

import {
    dismissNotification,
    getNotifications
} from '../controllers/notificationsController.js';

const notificationsRouter = express.Router();

notificationsRouter.get('/', getNotifications);
notificationsRouter.patch('/:notificationId/dismiss', dismissNotification);

export default notificationsRouter;
