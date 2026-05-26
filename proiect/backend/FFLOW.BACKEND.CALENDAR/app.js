import express from 'express';
import createCorsMiddleware from '../../shared/cors.js';

import authenticateUser from './middleware/authenticateUser.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import eventsRouter from './routes/eventsRouter.js';
import tasksRouter from './routes/tasksRouter.js';
import { focusSessionsRouter, quickNotesRouter } from './routes/productivityRouter.js';
import { wakeupOverrideRouter, wakeupScheduleRouter } from './routes/wakeupRouter.js';
import notificationsRouter from './routes/notificationsRouter.js';

function createApp() {
    const app = express();

    app.use(createCorsMiddleware());
    app.use(express.json());

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use('/calendar/events', authenticateUser, eventsRouter);
    app.use('/calendar/tasks', authenticateUser, tasksRouter);
    app.use('/calendar/wakeup-schedule', authenticateUser, wakeupScheduleRouter);
    app.use('/calendar/wakeup-overrides', authenticateUser, wakeupOverrideRouter);
    app.use('/calendar/notifications', authenticateUser, notificationsRouter);
    app.use('/calendar/focus-sessions', authenticateUser, focusSessionsRouter);
    app.use('/calendar/quick-notes', authenticateUser, quickNotesRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp;
