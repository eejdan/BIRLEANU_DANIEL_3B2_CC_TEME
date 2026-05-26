import express from 'express';
import createCorsMiddleware from '../../shared/cors.js';

import { errorHandler, notFoundHandler } from './middleware/errorHandlers.js';
import billingRouter from './routes/billingRouter.js';

function createApp() {
    const app = express();

    app.use(createCorsMiddleware());
    app.use(express.json({
        verify(req, res, buffer) {
            req.rawBody = buffer;
        }
    }));

    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use('/billing', billingRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
}

export default createApp;
