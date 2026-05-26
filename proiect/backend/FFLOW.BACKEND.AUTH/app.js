import express from 'express';
import createCorsMiddleware from '../../shared/cors.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import authRouter from './routes/authRouter.js';

function createApp() {
    const app = express();

    app.use(createCorsMiddleware());
    app.use(express.json());

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use('/auth', authRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp;
