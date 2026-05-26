import express from 'express';
import createCorsMiddleware from '../../shared/cors.js';

import authenticateUser from './middleware/authenticateUser.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import advertisingRouter from './routes/advertisingRouter.js';

function createApp() {
    const app = express();

    app.use(createCorsMiddleware());
    app.use(express.json());

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use('/advertising', authenticateUser, advertisingRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp;
