import express from 'express';

import authenticateUser from './middleware/authenticateUser.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import recommendationsRouter from './routes/recommendationsRouter.js';

function createApp() {
    const app = express();

    app.use(express.json());

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use('/recommendations', authenticateUser, recommendationsRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp;
